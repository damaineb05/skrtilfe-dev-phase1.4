import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { grantDigitalEntitlementsForOrder } from '../../shared/entitlementService.js';

/**
 * grantEntitlementsForOrder — internal reconciliation service.
 *
 * Called by stripeWebhook AFTER a verified payment has produced a trusted
 * Order. Resolves Product/SKU → wearable_id server-side and grants
 * AssetOwnership (source: 'purchase') with ownership-level idempotency.
 *
 * Authorization: INTERNAL_FUNCTION_SECRET only. This is a backend-to-backend
 * call; end users must never invoke it directly. The webhook is the sole
 * caller. A grant must NEVER originate from the browser.
 *
 * Failure isolation: a per-line-item grant failure is recorded in the result
 * summary + AuditLog and does NOT roll back the paid Order or other grants.
 *
 * Genesis separation: this grants Wearable AssetOwnership only. Genesis Pass
 * entitlement remains a distinct flow (grantGenesisPass).
 */
Deno.serve(async (req) => {
  try {
    // ── Internal-secret gate ─────────────────────────────────────────────
    const body = await req.json().catch(() => null);
    if (!body) return Response.json({ error: 'Invalid request body' }, { status: 400 });

    const internalSecret = Deno.env.get('INTERNAL_FUNCTION_SECRET');
    if (!internalSecret || body.internalSecret !== internalSecret) {
      console.error('[grantEntitlementsForOrder] Unauthorized — missing/invalid internal secret');
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { orderId, stripeEventId, stripeSessionId } = body;
    if (!orderId) return Response.json({ error: 'orderId is required' }, { status: 400 });

    const base44 = createClientFromRequest(req);

    // ── Load the trusted Order (service-role; Order RLS is admin-only) ──
    const order = await base44.asServiceRole.entities.Order.get(orderId);
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });
    if (!order.user_id) {
      console.error(`[grantEntitlementsForOrder] Order ${orderId} missing user_id — cannot grant ownership`);
      return Response.json({ error: 'Order missing user_id (cannot resolve purchaser)' }, { status: 400 });
    }

    // ── Grant ─────────────────────────────────────────────────────────────
    const summary = await grantDigitalEntitlementsForOrder({
      order,
      base44: base44.asServiceRole,
      audit: { stripeEventId, stripeSessionId },
    });

    // ── Audit log (one record per grant outcome, no secrets/PPI beyond email) ──
    const auditBase = {
      actor_email: 'system@skrtlife',
      actor_role: 'system',
      action: 'entitlement_grant',
      entity_type: 'Order',
      entity_id: orderId,
      metadata: {
        stripe_event_id: stripeEventId || null,
        stripe_session_id: stripeSessionId || null,
        user_id: order.user_id,
        granted: summary.granted,
        already_owned: summary.already_owned,
        no_digital_entitlement_count: summary.no_digital_entitlement.length,
        failed_count: summary.failed.length,
        failed: summary.failed,
      },
    };
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        ...auditBase,
        status: summary.failed.length > 0 ? 'failed' : 'success',
      });
    } catch (logErr) {
      // Audit failure must never break the entitlement flow.
      console.error('[grantEntitlementsForOrder] AuditLog write failed:', logErr);
    }

    return Response.json({ success: true, orderId, summary });
  } catch (error) {
    console.error('[grantEntitlementsForOrder] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});