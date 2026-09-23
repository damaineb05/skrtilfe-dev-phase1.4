import { requireServerConfiguration, configurationErrorResponse } from '../../shared/serverConfiguration.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';
import { recoverCheckout, requireSuccessfulGrant } from '../../shared/checkoutRecovery.js';

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let signatureVerified = false;
  try {
    const stripeClient = new Stripe(requireServerConfiguration(name => Deno.env.get(name), 'STRIPE_SECRET_KEY'));
    const webhookSecret = requireServerConfiguration(name => Deno.env.get(name), 'STRIPE_WEBHOOK_SECRET');
    // Verify webhook signature
    const event = await stripeClient.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    signatureVerified = true;
    const base44 = createClientFromRequest(req);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Event tickets have their own handler; never create shop orders for them.
      if (session.metadata?.event_id) return Response.json({ received: true });
      if (!['paid', 'no_payment_required'].includes(session.payment_status)) {
        return Response.json({ error: 'Payment has not settled' }, { status: 503 });
      }

      // Fetch line items
      const lineItems = { data: [] };
      let startingAfter;
      do {
        const page = await stripeClient.checkout.sessions.listLineItems(session.id, {
          limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}),
        });
        lineItems.data.push(...page.data);
        if (!page.has_more) break;
        if (!page.data.length) throw new Error('Stripe returned incomplete line items');
        startingAfter = page.data[page.data.length - 1].id;
      } while (true);

      // ── Resolve the purchaser's user_id (ownership key) ─────────────────
      // Source of truth: session.metadata.user_id, set by createCheckout from
      // auth.me(). Fallback: resolve by email for legacy sessions. The browser
      // is never trusted for ownership — this value is established server-side.
      let purchaserUserId = session.metadata?.user_id || null;
      const purchaserEmail = session.customer_email || session.customer_details?.email || null;
      if (!purchaserUserId && purchaserEmail) {
        try {
          const users = await base44.asServiceRole.entities.User.filter({ email: purchaserEmail });
          if (users && users.length > 0) purchaserUserId = users[0].id;
        } catch (e) { console.warn('User lookup by email failed:', e); }
      }

      if (!purchaserUserId) throw new Error('Cannot resolve paid purchaser; retry or reconcile identity');
      await recoverCheckout({
        entities: base44.asServiceRole.entities, event, session,
        createOrder: async () => {
      // Build order payload
      const orderData = {
        user_email: purchaserEmail || 'guest@example.com',
        user_id: purchaserUserId || null,
        line_items: lineItems.data.map(item => {
          const meta = item.price?.metadata || {};
          const productId = meta.product_id || null;
          const variantSku = meta.variant_sku || null;
          if (!productId) {
            console.warn('ORDER_LINE_ITEM_MISSING_META', { description: item.description, price_id: item.price?.id });
          }
          return {
            product_id: productId || item.price?.id,
            title: item.description,
            variant_sku: variantSku,
            size: meta.size || null,
            color: meta.color || null,
            product_type: meta.product_type || 'physical',
            quantity: item.quantity,
            price: item.price.unit_amount / 100,
            line_total: (item.price.unit_amount / 100) * item.quantity,
            fulfillment_status: productId ? 'ready' : 'needs_review',
          };
        }),
        total_amount: session.amount_total / 100,
        shipping_address: session.shipping_details?.address ? {
          first_name: session.shipping_details.name?.split(' ')[0] || '',
          last_name: session.shipping_details.name?.split(' ').slice(1).join(' ') || '',
          street_address: session.shipping_details.address.line1 || '',
          apartment: session.shipping_details.address.line2 || '',
          city: session.shipping_details.address.city || '',
          state: session.shipping_details.address.state || '',
          zip_code: session.shipping_details.address.postal_code || '',
          country: session.shipping_details.address.country || 'US'
        } : null,
        payment_method: 'stripe',
        payment_status: 'paid',
        transaction_id: session.payment_intent,
        checkout_session_id: session.id,
        payment_intent_id: session.payment_intent,
        events: [{
          timestamp: new Date().toISOString(),
          message: 'Order received and payment confirmed'
        }]
      };

      return await base44.asServiceRole.entities.Order.create(orderData);
        },
        fulfillOrder: async (createdOrder, { isNew }) => {
      const inventoryErrors = [];
      // Never replay non-transactional stock decrements on an existing order.
      // Ambiguous interrupted inventory writes are surfaced for reconciliation.
      if (isNew) {

      // Decrement inventory for each line item
      // SOURCE OF TRUTH: item.price.metadata (set via price_data.metadata in createCheckout)
      for (const item of lineItems.data) {
        const meta = item.price?.metadata || {};
        const productId = meta.product_id;
        const variantSku = meta.variant_sku;
        const qty = item.quantity;

        if (!productId) {
          console.warn('FULFILLMENT_META_MISSING', {
            line_item_id: item.id,
            description: item.description,
            price_id: item.price?.id,
            available_meta_keys: Object.keys(meta),
          });
          continue;
        }

        try {
          const product = await base44.asServiceRole.entities.Product.get(productId);
          if (!product) {
            console.warn(`Product not found for id: ${productId}`);
            inventoryErrors.push(`Missing product ${productId}`);
            continue;
          }
          const newQty = Math.max(0, (product.inventory_qty || 0) - qty);
          const updatedVariants = (product.variants || []).map(v =>
            v.sku === variantSku
              ? { ...v, inventory_qty: Math.max(0, (v.inventory_qty || 0) - qty) }
              : v
          );
          await base44.asServiceRole.entities.Product.update(productId, {
            inventory_qty: newQty,
            variants: updatedVariants
          });
          console.log(`Inventory updated for product ${productId}: ${newQty} remaining`);
        } catch (invErr) {
          inventoryErrors.push(`Stock update failed for ${productId}`);
          console.error(`Failed to update inventory for product ${productId}:`, invErr);
        }
      }

      }
      if (!isNew && !createdOrder.events?.some(e => e.message === 'checkout_inventory_recorded_v2')) {
        inventoryErrors.push('Interrupted delivery: verify stock before fulfillment; automatic decrement was not repeated');
      }
      if (isNew || inventoryErrors.length) {
        await base44.asServiceRole.entities.Order.update(createdOrder.id, {
          events: [...(createdOrder.events || []), {
            timestamp: new Date().toISOString(),
            message: inventoryErrors.length
              ? `Inventory review required: ${inventoryErrors.join('; ')}`
              : 'checkout_inventory_recorded_v2',
          }],
          ...(inventoryErrors.length ? {
            line_items: (createdOrder.line_items || []).map(item => ({ ...item, fulfillment_status: 'needs_review' })),
          } : {}),
        });
      }

      // If this is a Genesis Pass purchase, mark user as genesis_holder
      if (session.metadata?.product_type === 'genesis_pass') {
        const customerEmail = createdOrder.user_email;
        try {
          {
            await base44.asServiceRole.entities.User.update(createdOrder.user_id, { genesis_holder: true });
            console.log('Genesis holder updated for:', customerEmail);
          }
        } catch (genesisErr) {
          console.error('Failed to set genesis_holder:', genesisErr);
          throw genesisErr;
        }

        // Create the GenesisPass entity record (privileged — internal secret)
        try {
          await base44.asServiceRole.functions.invoke('grantGenesisPass', {
            userId: createdOrder.user_id,
            userEmail: customerEmail,
            internalSecret: Deno.env.get('INTERNAL_FUNCTION_SECRET'),
          });
          console.log('GenesisPass record created for:', customerEmail);
        } catch (grantErr) {
          console.error('Failed to create GenesisPass record:', grantErr);
          throw grantErr;
        }

        // Send Genesis-specific confirmation email
        try {
          if (isNew) await base44.asServiceRole.integrations.Core.SendEmail({
            to: customerEmail,
            subject: 'Welcome to the Genesis — SKRTLIFE',
            body: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0A0A0F; color: #fff;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="font-size: 36px; font-weight: 900; margin: 0; color: #00D4FF;">SKRTLIFE</h1>
                  <p style="color: rgba(255,255,255,0.5); margin-top: 8px;">Genesis Pass Confirmed</p>
                </div>
                <h2 style="font-size: 28px; font-weight: 900; margin-bottom: 12px;">You're a Founding Member.</h2>
                <p style="color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.6;">
                  Your Genesis Pass is active. You now have lifetime access to the full SKRTLIFE Digital Society — DripSync Studio, exclusive drops, virtual realms, and every Physical × Digital bundle we drop.
                </p>
                <div style="margin: 30px 0; padding: 20px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.3); border-radius: 12px;">
                  <h3 style="color: #00D4FF; margin-top: 0;">What's unlocked:</h3>
                  <ul style="color: rgba(255,255,255,0.7); line-height: 2;">
                    <li>Full DripSync Studio — unlimited avatar & wearables</li>
                    <li>24hr early access to every drop</li>
                    <li>All virtual realms</li>
                    <li>Physical × Digital bundles on every purchase</li>
                    <li>Genesis community access</li>
                  </ul>
                </div>
                <p style="color: rgba(255,255,255,0.7);">Head to DripSync to start building your look: <a href="https://skrtlife.com/DripSync" style="color: #00D4FF;">skrtlife.com/DripSync</a></p>
                <p style="color: rgba(255,255,255,0.4); font-size: 12px; text-align: center; margin-top: 30px;">© ${new Date().getFullYear()} SKRTLIFE. All rights reserved.</p>
              </div>
            `
          });
          console.log('Genesis welcome email sent to:', customerEmail);
        } catch (emailErr) {
          console.error('Failed to send genesis email:', emailErr);
        }
      } else if (session.metadata?.product_type === 'dripsync_plus') {
        // DripSync+ membership — set the canonical entitlement flag server-side.
        // Same trust model as Genesis: the signed webhook is the sole authority;
        // no client path can set this.
        const customerEmail = createdOrder.user_email;
        try {
          {
            await base44.asServiceRole.entities.User.update(createdOrder.user_id, { dripsync_plus_holder: true });
            console.log('DripSync+ holder updated for:', customerEmail);
          }
        } catch (plusErr) {
          console.error('Failed to set dripsync_plus_holder:', plusErr);
          throw plusErr;
        }
        // Reuse the standard order confirmation email (receipt).
        try {
          if (isNew) await base44.asServiceRole.functions.invoke('sendOrderConfirmation', {
            orderId: createdOrder.id,
            internalSecret: Deno.env.get('INTERNAL_FUNCTION_SECRET'),
          });
          console.log('DripSync+ confirmation email sent to:', customerEmail);
        } catch (emailError) {
          console.error('Failed to send DripSync+ confirmation email:', emailError);
        }
      } else {
        // Regular order confirmation
        try {
          if (isNew) await base44.asServiceRole.functions.invoke('sendOrderConfirmation', {
            orderId: createdOrder.id,
            internalSecret: Deno.env.get('INTERNAL_FUNCTION_SECRET'),
          });
          console.log('Order confirmation email sent to:', createdOrder.user_email);
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }
      }

      // ── Grant digital entitlements (Commerce → Ownership) ──────────────
      // The signed webhook is the SOLE authority for ownership. This runs
      // AFTER the Order is recorded and inventory finalized. Failure isolation:
      // entitlement failures are audited inside grantEntitlementsForOrder and
      // NEVER roll back the paid Order. Genesis Pass entitlement stays separate
      // (handled above). No browser path can grant ownership.
      if (purchaserUserId) {
        try {
          const entitlementResult = await base44.asServiceRole.functions.invoke('grantEntitlementsForOrder', {
            orderId: createdOrder.id,
            stripeEventId: event.id,
            stripeSessionId: session.id,
            internalSecret: Deno.env.get('INTERNAL_FUNCTION_SECRET'),
          });
          {
            const s = requireSuccessfulGrant(entitlementResult);
            console.log(`[ENTITLEMENT] order=${createdOrder.id} granted=${s.granted.length} already_owned=${s.already_owned.length} no_entitlement=${s.no_digital_entitlement.length} failed=${s.failed.length}`);
          }
        } catch (entitlementErr) {
          // A grant failure must never break order processing. It is audited
          // inside the grant function; the Order remains valid and paid.
          console.error('[ENTITLEMENT] grant failed (order survives):', entitlementErr);
          throw entitlementErr;
        }
      } else {
        throw new Error('Order purchaser identity is missing');
      }
        },
      });
    } else if (event.type === 'charge.refunded' || event.type === 'charge.dispute.created' || event.type === 'charge.dispute.closed' || event.type === 'charge.dispute.funds_withdrawn' || event.type === 'charge.dispute.funds_reinstated') {
      // ── Refunds / Disputes — audit only, NO automatic ownership revocation ──
      // Phase E policy (deferred): whether a refund revokes a purchase-granted
      // digital wearable is a business decision (Options A/B/C in the report).
      // We do NOT auto-revoke here. This records the event so a future revocation
      // policy can hook in. The paid Order and AssetOwnership remain intact.
      try {
        // Lightweight idempotency: skip if this event was already recorded.
        const dup = await base44.asServiceRole.entities.StripeWebhookEvent.filter({ event_id: event.id });
        if (dup && dup.length > 0) {
          console.log(`[WEBHOOK_DUPLICATE] ${event.type} event.id=${event.id} already recorded — skipping.`);
          return Response.json({ received: true });
        }
        await base44.asServiceRole.entities.StripeWebhookEvent.create({
          event_id: event.id,
          event_type: event.type,
          session_id: null,
          payment_intent_id: event.data?.object?.payment_intent || null,
          status: 'processed',
          processed_at: new Date().toISOString(),
        });
        await base44.asServiceRole.entities.AuditLog.create({
          actor_email: 'system@skrtlife',
          actor_role: 'system',
          action: event.type === 'charge.refunded' ? 'refund' : 'dispute',
          entity_type: 'StripeEvent',
          entity_id: event.id,
          status: 'success',
          metadata: {
            event_type: event.type,
            payment_intent: event.data?.object?.payment_intent || null,
            charge_id: event.data?.object?.id || null,
            amount: event.data?.object?.amount_refunded ?? event.data?.object?.amount ?? null,
            reason: event.data?.object?.reason || null,
            note: 'No automatic ownership revocation (Phase E policy deferred). Hook point for future revocation.',
          },
        });
        console.log(`[WEBHOOK] ${event.type} audited (no ownership revocation) event=${event.id}`);
      } catch (auditErr) {
        console.error('[WEBHOOK] refund/dispute audit failed:', auditErr);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    const configurationFailure = configurationErrorResponse(error);
    if (configurationFailure) return configurationFailure;
    console.error('Webhook error:', error);
    return Response.json({ error: signatureVerified ? 'Fulfillment incomplete; delivery will be retried' : 'Invalid webhook signature' }, { status: signatureVerified ? 500 : 400 });
  }
});