/**
 * PurchaseReconciler
 * ─────────────────────────────────────────────────────────────
 * Reconcile commerce entitlements to actual wearable assets.
 * Answers: is this entitlement valid? What wearable does it map to?
 * Has it already been granted?
 */

/**
 * Reconcile a batch of entitlement candidates against known wearable assets
 * and existing ownerships.
 *
 * Returns structured results:
 * {
 *   grantableEntitlements: [...],  // ready to grant
 *   skippedEntitlements:   [...],  // already owned, duplicate, etc.
 *   warnings:              [...],  // non-fatal issues
 *   errors:                [...]   // fatal issues
 * }
 *
 * @param {{
 *   entitlements:       object[],  // normalized entitlements from EntitlementSerializer
 *   wearablesByProductId: Map,     // productId → Wearable record
 *   wearablesByVariantSku: Map,    // variantSku → Wearable record
 *   existingOwnerships: object[]   // existing AssetOwnership records for user
 * }} options
 * @returns {object} reconciliation result
 */
export async function reconcileEntitlements({
  entitlements = [],
  wearablesByProductId = new Map(),
  wearablesByVariantSku = new Map(),
  existingOwnerships = [],
}) {
  const result = {
    grantableEntitlements: [],
    skippedEntitlements:   [],
    warnings:              [],
    errors:                [],
  };

  if (!Array.isArray(entitlements)) {
    result.errors.push('Entitlements input is not an array.');
    return result;
  }

  // Build existing ownership lookup: wearableId → quantity
  const ownedWearables = new Map();
  for (const ownership of existingOwnerships) {
    const wearableId = ownership.wearable_id || ownership.asset_id;
    const qty        = ownership.quantity || 1;
    if (wearableId) {
      ownedWearables.set(wearableId, (ownedWearables.get(wearableId) || 0) + qty);
    }
  }

  // Reconcile each entitlement
  for (const ent of entitlements) {
    if (!ent) continue;

    const entId = `${ent.orderId}:${ent.productId}`;

    // ── 1. Resolve wearable ──────────────────────────────────
    let wearable = null;

    if (ent.productId) {
      wearable = wearablesByProductId.get(ent.productId);
    }
    if (!wearable && ent.variantSku) {
      wearable = wearablesByVariantSku.get(ent.variantSku);
    }

    if (!wearable) {
      result.warnings.push({
        entitlementId: entId,
        message:       `No wearable found for productId="${ent.productId}" or variantSku="${ent.variantSku}"`,
        entitlement:   ent,
      });
      result.skippedEntitlements.push(ent);
      continue;
    }

    // ── 2. Check for duplicates ──────────────────────────────
    const alreadyOwned = ownedWearables.has(wearable.id) && ownedWearables.get(wearable.id) > 0;
    if (alreadyOwned) {
      result.warnings.push({
        entitlementId: entId,
        message:       `User already owns wearable "${wearable.id}". Incrementing quantity instead.`,
        wearableId:    wearable.id,
      });
      // Still grant — we'll increment the existing ownership
    }

    // ── 3. Mark as grantable ─────────────────────────────────
    result.grantableEntitlements.push({
      ...ent,
      wearableId: wearable.id,
      wearable,
    });

    ownedWearables.set(wearable.id, (ownedWearables.get(wearable.id) || 0) + (ent.quantity || 1));
  }

  return result;
}

/**
 * Check if a specific order + user pair has already been granted.
 * @param {string} orderId
 * @param {string} userId
 * @param {object[]} existingOwnerships — ownership records for the user
 * @returns {boolean}
 */
export function isOrderAlreadyGranted(orderId, userId, existingOwnerships = []) {
  if (!orderId || !userId) return false;

  // Simple heuristic: check if any ownership references this order
  return existingOwnerships.some(own => {
    const ref = own.source_order_id || own.order_id;
    return ref === orderId;
  });
}

export default {
  reconcileEntitlements,
  isOrderAlreadyGranted,
};