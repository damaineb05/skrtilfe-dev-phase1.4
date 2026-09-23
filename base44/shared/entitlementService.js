/**
 * Digital Entitlement Service — Commerce → Ownership
 * ─────────────────────────────────────────────────────────────────────────
 * The single place where a verified purchase becomes digital ownership.
 *
 *   verified Stripe payment  →  Order  →  grantDigitalEntitlementsForOrder()
 *        →  AssetOwnership (source: 'purchase', source_order_id, source_sku)
 *
 * Trust model:
 *   - The caller (stripeWebhook) has already verified the Stripe signature
 *     and established a trusted Order. This service NEVER trusts client input.
 *   - user_id comes from the trusted Order record (set by the webhook from
 *     session.metadata.user_id, which createCheckout derived from auth.me()).
 *   - wearable_id is resolved from the authoritative Product/variant record
 *     fetched server-side — never from Stripe metadata or the browser.
 *
 * Idempotency:
 *   - Stripe event-level idempotency is handled by the webhook (StripeWebhookEvent
 *     + Order checkout_session_id guards).
 *   - Ownership-level idempotency: before creating AssetOwnership we check for
 *     an existing grant by (user_id, wearable_id, source_order_id). A duplicate
 *     event re-derives the same source_order_id → finds the existing grant →
 *     no duplicate.
 *
 * Quantity semantics:
 *   - Digital wardrobe ownership is BOOLEAN per wearable. 2 × the same SKU
 *     grants ONE AssetOwnership entitlement (not quantity N). We do not model
 *     collectible quantity here.
 *
 * Failure isolation:
 *   - A grant failure for one line item NEVER rolls back the paid Order or
 *     other grants. Failures are collected and returned; the caller audits them.
 *
 * Genesis separation:
 *   - This service deals ONLY with Wearable AssetOwnership. Genesis Pass
 *     entitlement is a distinct entitlement class handled separately by the
 *     webhook (user.genesis_holder + grantGenesisPass). The ledgers do not mix.
 */

/**
 * Resolve the digital wearable_id a purchased line item grants.
 * Variant-level wearable_id wins; otherwise the product-level wearable_id.
 * Returns null when the product/SKU grants no digital entitlement.
 *
 * @param {object} lineItem - trusted Order line item { product_id, variant_sku, quantity }
 * @param {object} product - authoritative Product record (fetched server-side)
 * @returns {{ wearableId: string|null, sku: string|null }}
 */
export function resolveWearableForLineItem(lineItem, product) {
  if (!lineItem || !product) return { wearableId: null, sku: null };
  const sku = lineItem.variant_sku || null;
  // Variant-specific wearable (different SKUs → different digital models/colorways)
  if (sku && Array.isArray(product.variants)) {
    const variant = product.variants.find(v => v.sku === sku);
    if (variant && variant.wearable_id) {
      return { wearableId: String(variant.wearable_id), sku };
    }
  }
  // Product-level wearable (all variants grant the same digital item)
  if (product.wearable_id) {
    return { wearableId: String(product.wearable_id), sku };
  }
  return { wearableId: null, sku };
}

/**
 * Grant digital entitlements for a trusted, paid Order.
 *
 * @param {object} ctx
 * @param {object} ctx.order - the trusted Order record (must have id, user_id, user_email, line_items)
 * @param {object} ctx.base44 - a service-role base44 client (bypasses RLS)
 * @param {object} [ctx.audit] - optional { stripeEventId, stripeSessionId } for audit logging
 * @returns {Promise<{granted: string[], already_owned: string[], no_digital_entitlement: object[], failed: object[]}>}
 */
export async function grantDigitalEntitlementsForOrder({ order, base44, audit = {} }) {
  const summary = {
    granted: [],            // wearable_ids newly granted
    already_owned: [],      // wearable_ids that already had a grant for this order
    no_digital_entitlement: [], // line items with no wearable_id
    failed: [],             // { product_id, sku, wearable_id, reason }
  };

  if (!order || !order.id || !order.user_id) {
    summary.failed.push({ reason: 'Order missing id or user_id' });
    return summary;
  }

  const lineItems = Array.isArray(order.line_items) ? order.line_items : [];
  // De-dupe line items by (product_id, variant_sku) so two units of the same
  // SKU (or the same SKU appearing twice) produce one entitlement resolution.
  const seenKeys = new Set();
  const uniqueLineItems = [];
  for (const li of lineItems) {
    const key = `${li.product_id}|${li.variant_sku || ''}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    uniqueLineItems.push(li);
  }

  for (const li of uniqueLineItems) {
    if (!li.product_id) {
      summary.no_digital_entitlement.push({ product_id: null, reason: 'line item missing product_id' });
      continue;
    }

    // Fetch the authoritative Product record (server-side, trusted).
    let product = null;
    try {
      product = await base44.entities.Product.get(li.product_id);
    } catch (e) {
      summary.failed.push({ product_id: li.product_id, sku: li.variant_sku || null, reason: `Product fetch failed: ${e.message || e}` });
      continue;
    }
    if (!product) {
      summary.no_digital_entitlement.push({ product_id: li.product_id, reason: 'product not found' });
      continue;
    }

    const { wearableId, sku } = resolveWearableForLineItem(li, product);
    if (!wearableId) {
      summary.no_digital_entitlement.push({ product_id: li.product_id, sku, reason: 'no wearable_id on product/variant' });
      continue;
    }

    // Validate the Wearable exists before granting (avoid dangling ledger refs).
    let wearable = null;
    try {
      wearable = await base44.entities.Wearable.get(wearableId);
    } catch (e) {
      summary.failed.push({ product_id: li.product_id, sku, wearable_id: wearableId, reason: `Wearable fetch failed: ${e.message || e}` });
      continue;
    }
    if (!wearable) {
      summary.failed.push({ product_id: li.product_id, sku, wearable_id: wearableId, reason: 'Wearable not found (deleted/invalid)' });
      continue;
    }

    // ── Ownership idempotency: (user_id, wearable_id, source_order_id) ──
    let existing = [];
    try {
      existing = await base44.entities.AssetOwnership.filter({
        user_id: order.user_id,
        wearable_id: wearableId,
        source_order_id: order.id,
      });
    } catch (e) {
      summary.failed.push({ product_id: li.product_id, sku, wearable_id: wearableId, reason: `Ownership check failed: ${e.message || e}` });
      continue;
    }
    if (existing && existing.length > 0) {
      summary.already_owned.push(wearableId);
      continue;
    }

    // Grant the entitlement.
    try {
      await base44.entities.AssetOwnership.create({
        user_id: order.user_id,
        wearable_id: wearableId,
        source: 'purchase',
        source_order_id: order.id,
        source_sku: sku || null,
        acquired_at: new Date().toISOString(),
      });
      summary.granted.push(wearableId);
    } catch (e) {
      summary.failed.push({ product_id: li.product_id, sku, wearable_id: wearableId, reason: `Ownership create failed: ${e.message || e}` });
    }
  }

  return summary;
}