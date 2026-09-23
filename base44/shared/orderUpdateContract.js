import { assertId, invalid, isRecord } from './apiContract.js';
export function validateOrderUpdate(orderId, updates) {
  assertId(orderId);
  if (!isRecord(updates)) throw invalid('Order updates must be an object');
  const allowed = ['fulfillment_status', 'tracking_number', 'updateNote', 'existingEvents'];
  if (Object.keys(updates).some(k => !allowed.includes(k))) throw invalid('Order field is server-controlled');
  if ('fulfillment_status' in updates && !['unfulfilled','fulfilled','partially_fulfilled'].includes(updates.fulfillment_status)) throw invalid('Invalid fulfillment status');
  for (const field of ['tracking_number','updateNote']) if (field in updates && (typeof updates[field] !== 'string' || updates[field].length > 500)) throw invalid('Invalid order text');
  const patch = {};
  for (const field of ['fulfillment_status','tracking_number']) if (field in updates) patch[field] = updates[field];
  if (!Object.keys(patch).length) throw invalid('No supported order update');
  return patch;
}
