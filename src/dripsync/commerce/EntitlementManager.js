/**
 * EntitlementManager
 * ─────────────────────────────────────────────────────────────
 * Orchestrates the full entitlement grant flow:
 * fetch order → normalize → reconcile → grant ownership → refresh closet.
 *
 * Failures are surfaced clearly; idempotency is built in.
 */

import { normalizeOrderToEntitlements }                       from './EntitlementSerializer.js';
import { reconcileEntitlements, isOrderAlreadyGranted }       from './PurchaseReconciler.js';

/**
 * Grant entitlements from a completed order.
 * Idempotent — reprocessing the same order is safe.
 *
 * @param {{
 *   repository:  DripSyncRepository,
 *   userId:      string,
 *   orderId:     string
 * }} options
 * @returns {Promise<{
 *   success:      boolean,
 *   granted:      object[],
 *   skipped:      object[],
 *   warnings:     object[],
 *   errors:       object[],
 *   message?:     string
 * }>}
 */
export async function grantPurchaseEntitlements({ repository, userId, orderId }) {
  const result = {
    success:  false,
    granted:  [],
    skipped:  [],
    warnings: [],
    errors:   [],
  };

  if (!userId || !orderId) {
    result.errors.push('userId and orderId are required.');
    return result;
  }

  try {
    // ── 1. Fetch order + items ──────────────────────────────
    const orderRecord = await repository.getOrderById(orderId);
    if (!orderRecord) {
      result.errors.push(`Order "${orderId}" not found.`);
      return result;
    }

    const orderItems = await repository.getOrderItemsByOrder(orderId);
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      result.message = 'Order has no items.';
      result.success = true;  // Not an error — just nothing to grant
      return result;
    }

    // ── 2. Check if already granted (idempotency) ───────────
    const existingOwnerships = await repository.getOwnershipsByUser(userId);
    if (isOrderAlreadyGranted(orderId, userId, existingOwnerships)) {
      result.message = 'This order has already been processed.';
      result.skipped = orderItems.map(item => ({
        id:       item.id,
        reason:   'duplicate_order',
        message:  'This order was already granted.',
      }));
      result.success = true;
      return result;
    }

    // ── 3. Normalize to entitlements ────────────────────────
    const entitlements = normalizeOrderToEntitlements(orderRecord, orderItems);
    if (entitlements.length === 0) {
      result.message = 'Order contains no entitlements.';
      result.success = true;
      return result;
    }

    // ── 4. Reconcile: product → wearable ────────────────────
    const wearablesByProductId = new Map();
    const wearablesByVariantSku = new Map();

    // Pre-fetch wearables for all products mentioned in this order
    const productIds = [...new Set(entitlements.map(e => e.productId).filter(Boolean))];
    const variantSkus = [...new Set(entitlements.map(e => e.variantSku).filter(Boolean))];

    for (const productId of productIds) {
      const wearable = await repository.getWearableByProductId(productId);
      if (wearable) {
        wearablesByProductId.set(productId, wearable);
      }
    }

    for (const sku of variantSkus) {
      const wearable = await repository.getWearableByVariantSku(sku);
      if (wearable) {
        wearablesByVariantSku.set(sku, wearable);
      }
    }

    const reconciliation = await reconcileEntitlements({
      entitlements,
      wearablesByProductId,
      wearablesByVariantSku,
      existingOwnerships,
    });

    result.warnings.push(...reconciliation.warnings);
    result.skipped.push(...reconciliation.skipped);

    if (reconciliation.errors.length > 0) {
      result.errors.push(...reconciliation.errors);
    }

    // ── 5. Grant ownership for each valid entitlement ───────
    for (const grantable of reconciliation.grantableEntitlements) {
      try {
        const existingOwnership = existingOwnerships.find(
          own => (own.wearable_id || own.asset_id) === grantable.wearableId && own.user_id === userId
        );

        if (existingOwnership) {
          // Increment quantity
          await repository.updateOwnership(existingOwnership.id, {
            quantity: (existingOwnership.quantity || 1) + grantable.quantity,
          });
        } else {
          // Create new ownership
          await repository.createOwnership({
            user_id:       userId,
            asset_id:      grantable.wearableId,
            wearable_id:   grantable.wearableId,
            quantity:      grantable.quantity,
            source:        'purchase',
            source_order_id: orderId,
            is_active:     true,
          });
        }

        result.granted.push({
          wearableId: grantable.wearableId,
          quantity:   grantable.quantity,
          source:     'purchase',
        });
      } catch (err) {
        result.errors.push({
          wearableId: grantable.wearableId,
          message:    `Failed to grant ownership: ${err?.message || String(err)}`,
        });
      }
    }

    result.success = result.errors.length === 0;
    return result;
  } catch (err) {
    result.errors.push({
      message: `EntitlementManager error: ${err?.message || String(err)}`,
    });
    return result;
  }
}

/**
 * Refresh a user's closet to reflect newly granted items.
 * @param {{
 *   engine:  DripSyncEngine,
 *   userId:  string
 * }} options
 * @returns {Promise<void>}
 */
export async function refreshClosetAfterGrant({ engine, userId }) {
  if (!engine || !userId) return;
  try {
    await engine.hydrateCloset(userId);
  } catch (err) {
    console.warn(`EntitlementManager.refreshClosetAfterGrant failed: ${err?.message}`);
  }
}

export default {
  grantPurchaseEntitlements,
  refreshClosetAfterGrant,
};