import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveFunctionVersion } from '../../src/lib/functionVersion.js';
import { activeGenesisQuery } from '../../base44/shared/genesisContract.js';
import { resolveDeployment } from '../../base44/shared/deploymentPolicy.js';

test('production builds ignore URL overrides even with debug flag', () => {
  assert.equal(resolveFunctionVersion({ DEV: false, VITE_ENABLE_FUNCTION_VERSION_OVERRIDE: 'true', VITE_BASE44_FUNCTIONS_VERSION: 'pinned' }, '?functions_version=stale'), 'pinned');
});
test('development override requires build opt-in and valid nonpersistent URL value', () => {
  assert.equal(resolveFunctionVersion({ DEV: true }, '?functions_version=stale'), null);
  assert.equal(resolveFunctionVersion({ DEV: true, VITE_ENABLE_FUNCTION_VERSION_OVERRIDE: 'true' }, '?functions_version=debug_1'), 'debug_1');
  assert.equal(resolveFunctionVersion({ DEV: true, VITE_ENABLE_FUNCTION_VERSION_OVERRIDE: 'true' }, '?functions_version=../other'), null);
});
test('function version selection never consults local storage', () => {
  const source = readFileSync(new URL('../../src/lib/app-params.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /getAppParamValue\(["']functions_version/);
  assert.match(source, /functionsVersion: resolveFunctionVersion/);
});
test('lookup and grant share the canonical Genesis query', () => {
  assert.deepEqual(activeGenesisQuery('A'), { user_id: 'A', is_active: true });
  assert.throws(() => activeGenesisQuery({}));
  for (const fn of ['grantGenesisPass', 'createEventCheckout']) {
    const source = readFileSync(new URL(`../../base44/functions/${fn}/entry.ts`, import.meta.url), 'utf8');
    assert.match(source, /GenesisPass\.filter\(activeGenesisQuery\(/);
  }
});
test('Genesis email uses configured development origin, not a browser or production URL', () => {
  const source = readFileSync(new URL('../../base44/functions/stripeWebhook/entry.ts', import.meta.url), 'utf8');
  assert.match(source, /href="\$\{deployment.applicationOrigin\}\/DripSync"/);
  assert.doesNotMatch(source, /https:\/\/skrtlife\.com\/DripSync/);
  assert.equal(resolveDeployment('6ab3d55363a10359643b4447').applicationOrigin, 'https://skrtlifedevphase14-643b4447.base44.app');
});