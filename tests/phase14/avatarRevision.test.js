import test from 'node:test';
import assert from 'node:assert/strict';
import { assertExpectedRevision, avatarRevision, writeRevisionedAvatar } from '../../base44/shared/avatarRevision.js';
import { validateAvatarConfig } from '../../base44/shared/avatarValidation.js';
import { normalizeAvatarConfig as serverNormalize, buildCanonicalFromAvatarUrl } from '../../base44/shared/avatarConfigServer.js';
import { normalizeAvatarConfig as clientNormalize } from '../../src/lib/avatarConfig.js';
import { loadHandler, jsonRequest } from './handlerHarness.js';
import { assertAssetUrl } from '../../base44/shared/apiContract.js';
const config = { schema_version: 2, avatar: { model_url: 'https://example.test/avatar.glb', source: 'upload', gender: 'neutral' }, equipped: [], customization: {} };
function store(initial) {
  const writes = [];
  let value = initial;
  const client = { auth: { me: async () => ({ id: 'A', avatar_config: value }) }, asServiceRole: { entities: { User: {
    get: async id => { assert.equal(id, 'A'); return { id, avatar_config: value }; },
    update: async (id, data) => { assert.equal(id, 'A'); writes.push(data); value = data.avatar_config; return { id, ...data }; },
  } } } };
  return { client, writes, value: () => value };
}
test('legacy absence is revision zero; malformed and overflow requests rejected', () => {
  assert.equal(avatarRevision(undefined), 0); assert.equal(avatarRevision(config), 0);
  assert.equal(assertExpectedRevision(0, config), 1);
  for (const value of [undefined, null, -1, '0', 0.5, NaN]) assert.throws(() => assertExpectedRevision(value, config), { status: 400 });
  assert.throws(() => assertExpectedRevision(Number.MAX_SAFE_INTEGER, { revision: Number.MAX_SAFE_INTEGER }), { status: 400 });
});
test('sequential stale request does not write; matching next revision advances', async () => {
  const s = store(config);
  const first = await writeRevisionedAvatar(s.client, 'A', 0, config);
  assert.equal(first.revision, 1);
  await assert.rejects(writeRevisionedAvatar(s.client, 'A', 0, config), { status: 409 });
  assert.equal(s.writes.length, 1);
  assert.equal((await writeRevisionedAvatar(s.client, 'A', 1, config)).revision, 2);
});
test('server rereads current state at write boundary', async () => {
  const s = store({ ...config, revision: 3 });
  await assert.rejects(writeRevisionedAvatar(s.client, 'A', 2, config), { status: 409 });
  assert.equal(s.writes.length, 0);
});
test('client/server normalizers and default-body adapter preserve revision', () => {
  const v2 = { ...config, revision: 7 };
  assert.equal(validateAvatarConfig(v2).revision, 7);
  assert.equal(clientNormalize(v2).revision, 7);
  assert.equal(serverNormalize(v2).revision, 7);
  assert.equal(clientNormalize({ avatarUrl: config.avatar.model_url }).revision, 0);
  assert.equal(buildCanonicalFromAvatarUrl(config.avatar.model_url).revision, 0);
  assert.equal(buildCanonicalFromAvatarUrl(config.avatar.model_url, { existingConfig: v2 }).revision, 7);
});
test('saveAvatarProfile authenticates, ignores client target and advances revision server-side', async () => {
  const s = store(config);
  const handler = loadHandler('saveAvatarProfile', { createClientFromRequest: () => s.client, validateAvatarConfig, assertExpectedRevision, writeRevisionedAvatar });
  const response = await handler(jsonRequest({ userId: 'B', expectedRevision: 0, avatar_config: { ...config, revision: 99 } }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).avatar_config.revision, 1);
  const stale = await handler(jsonRequest({ expectedRevision: 0, avatar_config: config }));
  assert.equal(stale.status, 409); assert.equal(s.writes.length, 1);
  s.client.auth.me = async () => null;
  assert.equal((await handler(jsonRequest({ expectedRevision: 1, avatar_config: config }))).status, 401);
  assert.equal(s.writes.length, 1);
});
test('missing expectedRevision rejected before writes, including legacy account', async () => {
  const s = store(undefined);
  const handler = loadHandler('saveAvatarProfile', { createClientFromRequest: () => s.client, validateAvatarConfig, assertExpectedRevision, writeRevisionedAvatar });
  assert.equal((await handler(jsonRequest({ avatar_config: config }))).status, 400);
  assert.equal(s.writes.length, 0);
});

test('saveDefaultAvatar delegates to canonical writer and preserves observed revision', async () => {
  const s = store({ ...config, revision: 4 });
  const invocations = [];
  s.client.functions = { invoke: async (name, payload) => {
    invocations.push({ name, payload });
    return { data: { success: true, avatar_config: { ...payload.avatar_config, revision: 5 } } };
  } };
  const handler = loadHandler('saveDefaultAvatar', { createClientFromRequest: () => s.client, assertAssetUrl, assertExpectedRevision, buildCanonicalFromAvatarUrl });
  const response = await handler(jsonRequest({ avatarUrl: config.avatar.model_url, expectedRevision: 4 }));
  assert.equal(response.status, 200); assert.equal(s.writes.length, 0);
  assert.equal(invocations[0].name, 'saveAvatarProfile');
  assert.equal(invocations[0].payload.expectedRevision, 4);
  assert.equal(invocations[0].payload.avatar_config.revision, 4);
  assert.equal((await response.json()).avatar_config.revision, 5);
});