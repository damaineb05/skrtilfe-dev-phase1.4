/**
 * EntitlementSerializer
 * ─────────────────────────────────────────────────────────────
 * Normalizes purchased commerce records into DripSync entitlement payloads.
 * Pure data transformation — no I/O or persistence.
 *
 * Assumed Order entity fields:
 *   id, user_email, payment_status, total_amount, created_date, …
 *
 * Assumed OrderItem entity fields:
 *   id, order_id, product_id, title, variant_sku, quantity, price, …
 *
 * Assumed Product entity fields:
 *   id, title, slug, sku, product_type, …
 */

/**
 * Normalize an Order record into a standardized shape.
 * @param {object} raw
 * @returns {object|null}
 */
export function normalizeOrder(raw) {
  if (!raw) return null;
  return {
    id:             raw.id,
    userId:         raw.user_email || raw.user_id || null,
    paymentStatus:  raw.payment_status || 'pending',
    totalAmount:    raw.total_amount || 0,
    createdAt:      raw.created_date || null,
    updatedAt:      raw.updated_date || null,
    raw,
  };
}

/**
 * Normalize an OrderItem record into an entitlement candidate.
 *
 * @param {object} raw
 * @param {string} orderId — the parent order ID
 * @returns {object|null}
 */
export function normalizeOrderItem(raw, orderId = null) {
  if (!raw) return null;
  return {
    id:           raw.id,
    orderId:      orderId || raw.order_id || null,
    productId:    raw.product_id || null,
    title:        raw.title || 'Unknown Item',
    variantSku:   raw.variant_sku || raw.sku || null,
    quantity:     parseInt(raw.quantity) || 1,
    price:        raw.price || 0,
    raw,
  };
}

/**
 * Convert an order item to a DripSync entitlement payload.
 * Ready to be used as input to EntitlementManager.
 *
 * @param {object} orderItem — normalized order item
 * @param {object} order — normalized order
 * @returns {object} entitlement payload
 */
export function orderItemToEntitlement(orderItem, order = {}) {
  return {
    userId:      order.userId || null,
    orderId:     orderItem.orderId || null,
    productId:   orderItem.productId || null,
    wearableId:  null,  // resolved later by PurchaseReconciler
    variantSku:  orderItem.variantSku || null,
    quantity:    orderItem.quantity || 1,
    source:      'purchase',
    grantedAt:   new Date().toISOString(),
  };
}

/**
 * Normalize all line items from an order into entitlement candidates.
 *
 * @param {object} orderRecord — raw Order entity
 * @param {object[]} orderItemRecords — raw OrderItem entities
 * @returns {object[]} entitlement candidates
 */
export function normalizeOrderToEntitlements(orderRecord, orderItemRecords = []) {
  const order = normalizeOrder(orderRecord);
  if (!order) return [];

  if (!Array.isArray(orderItemRecords)) return [];

  return orderItemRecords
    .map(raw => {
      try {
        const item = normalizeOrderItem(raw, order.id);
        return item ? orderItemToEntitlement(item, order) : null;
      } catch (_) {
        return null;
      }
    })
    .filter(e => e !== null);
}

/**
 * Normalize a single line item (convenience wrapper).
 * @param {object} lineItem
 * @returns {object} entitlement payload
 */
export function normalizeLineItemToEntitlement(lineItem) {
  const item = normalizeOrderItem(lineItem);
  return item ? orderItemToEntitlement(item, {}) : null;
}

export default {
  normalizeOrder,
  normalizeOrderItem,
  orderItemToEntitlement,
  normalizeOrderToEntitlements,
  normalizeLineItemToEntitlement,
};