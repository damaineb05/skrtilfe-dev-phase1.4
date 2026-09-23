export const FULFILLMENT_COMPLETE = 'checkout_fulfillment_completed_v2';

export function requireSuccessfulGrant(result) {
  const payload = result?.data ?? result;
  if (!payload?.success || !payload.summary || !Array.isArray(payload.summary.failed)) {
    throw new Error('Entitlement service returned an invalid result');
  }
  if (payload.summary.failed.length) {
    throw new Error('Digital entitlement delivery is incomplete; retry required');
  }
  return payload.summary;
}

/**
 * Recover sequential webhook retries from the paid order. An event record alone
 * is not completion evidence: the legacy handler wrote it before fulfillment.
 * Base44 entity CRUD does not provide a transaction/unique constraint here.
 * Concurrent delivery still needs a durable lock before production deployment.
 */
export async function recoverCheckout({ entities, event, session, createOrder, fulfillOrder }) {
  const orders = await entities.Order.filter({ checkout_session_id: session.id });
  let order = orders[0];
  if (order?.events?.some(e => e.message === FULFILLMENT_COMPLETE)) {
    return { order, duplicate: true };
  }
  const isNew = !order;
  if (isNew) order = await createOrder();

  // A thrown error deliberately leaves this order eligible for retry. Durable
  // paid records survive failures in membership/ownership services.
  await fulfillOrder(order, { isNew });
  const latestOrder = await entities.Order.get(order.id);
  await entities.Order.update(order.id, {
    events: [...(latestOrder.events || []), {
      timestamp: new Date().toISOString(), message: FULFILLMENT_COMPLETE,
    }],
  });
  const records = await entities.StripeWebhookEvent.filter({ event_id: event.id });
  const record = {
    event_id: event.id, event_type: event.type, session_id: session.id,
    payment_intent_id: session.payment_intent || null,
    status: 'processed', processed_at: new Date().toISOString(),
  };
  if (records[0]) await entities.StripeWebhookEvent.update(records[0].id, record);
  else await entities.StripeWebhookEvent.create(record);
  return { order, duplicate: false };
}
