import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { contractHandler } from '../../base44/shared/apiContract.js';

// Source-level handler tests only: dependencies are mocks, never deployed services.
export function loadHandler(name, dependencies, environment = {}) {
  const source = readFileSync(new URL(`../../base44/functions/${name}/entry.ts`, import.meta.url), 'utf8');
  let handler;
  vm.runInNewContext(source.replace(/^import .*;\r?$/gm, ''), {
    Request, Response, URL, TextEncoder, Date, Set, Map,
    console: { log() {}, warn() {}, error() {} },
    Deno: { serve: fn => { handler = fn; }, env: { get: key => environment[key] } },
    contractHandler, ...dependencies,
  }, { filename: name });
  return handler;
}
export function jsonRequest(body) {
  return new Request('https://example.test/functions/test', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
}