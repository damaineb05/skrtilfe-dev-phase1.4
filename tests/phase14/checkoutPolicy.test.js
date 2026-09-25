import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDeployment, validateCheckoutRedirect } from '../../base44/shared/deploymentPolicy.js';
import { createSafeCheckoutSession } from '../../base44/shared/checkoutSafety.js';
import { configurationErrorResponse } from '../../base44/shared/serverConfiguration.js';
import { activeGenesisQuery } from '../../base44/shared/genesisContract.js';
import { loadHandler, jsonRequest } from './handlerHarness.js';
const APP = '6ab3d55363a10359643b4447';
const ORIGIN = 'https://skrtlifedevphase14-643b4447.base44.app';
const configuration = resolveDeployment(APP);
const params = { success_url: `${ORIGIN}/MembershipSuccess`, cancel_url: `${ORIGIN}/Membership` };
const env = { BASE44_APP_ID: APP, STRIPE_SECRET_KEY: 'sk_test_mock_not_a_real_key' };
function fixture(session = { id: 'cs_mock', livemode: false, status: 'open', url: 'https://checkout.stripe.com/mock' }) {
  const calls = { constructed: 0, created: [], expired: [] };
  class Stripe {
    constructor() { calls.constructed++; this.checkout = { sessions: {
      create: async p => { calls.created.push(p); return session; },
      expire: async id => { calls.expired.push(id); },
    } }; }
  }
  return { Stripe, calls };
}
test('trusted development origin allowed; external, production, localhost and URL tricks denied', () => {
  assert.equal(validateCheckoutRedirect(params.success_url, configuration), params.success_url);
  for (const value of ['https://evil.example/x', 'https://skrtlife.com/DripSync', 'http://localhost:5173/x', `https://user@${new URL(ORIGIN).host}/x`, `${ORIGIN}.evil.example/x`, '//evil.example/x', 'javascript:alert(1)', `${ORIGIN}\\@evil.example/x`, null]) {
    assert.throws(() => validateCheckoutRedirect(value, configuration), { status: 400 });
  }
});
test('trusted deployment mode: unknown ID fails closed, separate production configuration supported', () => {
  assert.equal(configuration.environment, 'development');
  assert.equal(configuration.stripeMode, 'test');
  assert.throws(() => resolveDeployment('unknown'), { status: 503 });
  const production = resolveDeployment('future', { future: { environment: 'production', stripeMode: 'live', applicationOrigin: 'https://skrtlife.com' } });
  assert.equal(validateCheckoutRedirect('https://skrtlife.com/DripSync', production), 'https://skrtlife.com/DripSync');
  assert.throws(() => resolveDeployment('bad', { bad: { environment: 'development', stripeMode: 'live', applicationOrigin: ORIGIN } }), { status: 503 });
});
test('live credentials denied before Stripe construction or session creation', async () => {
  const { Stripe, calls } = fixture();
  for (const key of ['sk_live_mock', 'rk_live_mock', 'unknown']) await assert.rejects(
    createSafeCheckoutSession(Stripe, k => ({ ...env, STRIPE_SECRET_KEY: key })[k], params), { code: 'PAYMENT_MODE_MISMATCH' });
  assert.equal(calls.constructed, 0);
});
test('invalid redirect denied before Stripe construction', async () => {
  const { Stripe, calls } = fixture();
  await assert.rejects(createSafeCheckoutSession(Stripe, k => env[k], { ...params, cancel_url: 'https://skrtlife.com/' }), { status: 400 });
  assert.equal(calls.constructed, 0);
});
test('test sessions retain fulfillment metadata plus trusted deployment metadata', async () => {
  const { Stripe, calls } = fixture();
  const session = await createSafeCheckoutSession(Stripe, k => env[k], { ...params, metadata: { user_id: 'A', product_type: 'genesis_pass' } });
  assert.equal(session.livemode, false);
  assert.deepEqual(calls.created[0].metadata, { user_id: 'A', product_type: 'genesis_pass', deployment_environment: 'development', payment_mode: 'test' });
});
test('unexpected live session expires and never returns a URL', async () => {
  const { Stripe, calls } = fixture({ id: 'cs_unexpected', livemode: true, status: 'open', url: 'blocked' });
  await assert.rejects(createSafeCheckoutSession(Stripe, k => env[k], params), { code: 'PAYMENT_MODE_MISMATCH' });
  assert.deepEqual(calls.expired, ['cs_unexpected']);
});
test('absent livemode is not accepted as test mode', async () => {
  const { Stripe } = fixture({ id: 'cs_unknown', status: 'open', url: 'blocked' });
  await assert.rejects(createSafeCheckoutSession(Stripe, k => env[k], params), { code: 'PAYMENT_MODE_MISMATCH' });
});
for (const name of ['membershipCheckout', 'genesisCheckout']) {
  test(`${name}: handler fixes price/identity and denies arbitrary origins`, async () => {
    const { Stripe, calls } = fixture();
    const handler = loadHandler(name, { Stripe, createSafeCheckoutSession, configurationErrorResponse,
      createClientFromRequest: () => ({ auth: { me: async () => ({ id: 'A', email: 'a@example.test' }) } }),
    }, env);
    const denied = await handler(jsonRequest({ successUrl: 'https://evil.example/', cancelUrl: params.cancel_url }));
    assert.equal(denied.status, 400); assert.equal(calls.created.length, 0);
    const accepted = await handler(jsonRequest({ successUrl: params.success_url, cancelUrl: params.cancel_url, userId: 'B', email: 'b@example.test', price: 1 }));
    assert.equal(accepted.status, 200);
    assert.equal(calls.created[0].metadata.user_id, 'A');
    assert.equal(calls.created[0].customer_email, 'a@example.test');
    assert.equal(calls.created[0].line_items[0].price_data.unit_amount, name === 'membershipCheckout' ? 299 : 29900);
  });
}
test('Genesis event gate uses canonical user_id/is_active, not an unbacked holder flag', async () => {
  const queries = []; const { Stripe, calls } = fixture();
  const client = { auth: { me: async () => ({ id: 'A', email: 'a@example.test', role: 'user', genesis_holder: true }) }, asServiceRole: { entities: {
    Event: { get: async () => ({ id: 'event', requires_genesis: true }) },
    Ticket: { filter: async () => [] }, GenesisPass: { filter: async q => { queries.push(q); return []; } },
  } } };
  const handler = loadHandler('createEventCheckout', { Stripe, createSafeCheckoutSession, resolveDeployment, activeGenesisQuery, configurationErrorResponse, createClientFromRequest: () => client }, env);
  const response = await handler(jsonRequest({ event_id: 'event' }));
  assert.equal(response.status, 403); assert.deepEqual(queries, [{ user_id: 'A', is_active: true }]); assert.equal(calls.created.length, 0);
});

test('Genesis active canonical record grants event access and trusted return URLs', async () => {
  const { Stripe, calls } = fixture();
  const client = { auth: { me: async () => ({ id: 'A', email: 'a@example.test', role: 'user' }) }, asServiceRole: { entities: {
    Event: { get: async () => ({ title: 'Test Event', requires_genesis: true, price: 10 }) },
    Ticket: { filter: async () => [] }, GenesisPass: { filter: async () => [{ user_id: 'A', is_active: true }] },
  } } };
  const handler = loadHandler('createEventCheckout', { Stripe, createSafeCheckoutSession, resolveDeployment, activeGenesisQuery, configurationErrorResponse, createClientFromRequest: () => client }, env);
  assert.equal((await handler(jsonRequest({ event_id: 'event' }))).status, 200);
  assert.equal(calls.created[0].success_url, `${ORIGIN}/Events?success=true`);
});

test('Genesis grant uses canonical lookup for sequential retries and rejects malformed targets', async () => {
  let created = 0;
  const queries = [];
  const client = { auth: { me: async () => ({ id: 'admin', role: 'admin' }) }, asServiceRole: { entities: {
    GenesisPass: { filter: async query => { queries.push(query); return [{ user_id: 'A', is_active: true }]; }, create: async () => { created++; } },
  } } };
  const handler = loadHandler('grantGenesisPass', { activeGenesisQuery, createClientFromRequest: () => client });
  const duplicate = await handler(jsonRequest({ userId: 'A' }));
  assert.equal(duplicate.status, 200); assert.equal((await duplicate.json()).alreadyHeld, true);
  assert.deepEqual(queries, [{ user_id: 'A', is_active: true }]); assert.equal(created, 0);
  assert.equal((await handler(jsonRequest({ userId: {} }))).status, 400);
  client.auth.me = async () => ({ id: 'A', role: 'user' });
  assert.equal((await handler(jsonRequest({ userId: 'A' }))).status, 403);
  assert.equal(created, 0);
});