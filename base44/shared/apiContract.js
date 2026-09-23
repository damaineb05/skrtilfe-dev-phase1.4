/** Shared JSON error contract; no provider details are returned to clients. */
export const ERROR_CODES = { 400: 'INVALID_INPUT', 401: 'UNAUTHENTICATED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'CONFLICT', 413: 'INVALID_INPUT', 429: 'RATE_LIMITED', 500: 'SERVER_ERROR', 503: 'SERVER_ERROR' };
export function invalid(message = 'Invalid input') {
  return Object.assign(new Error(message), { status: 400, code: 'INVALID_INPUT' });
}
export function isRecord(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
export function assertId(value) { if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(value)) throw invalid('Invalid record ID'); return value; }
export function assertAssetUrl(value, { local = false } = {}) {
  if (typeof value !== 'string' || value.length > 4096) throw invalid('Invalid asset URL');
  if (/^\/(?!\/)[^\s\\]+$/.test(value)) return value;
  if (local && /^idb-avatar:\/\/[a-zA-Z0-9_-]+$/.test(value)) return value;
  let url; try { url = new URL(value); } catch { throw invalid('Invalid asset URL'); }
  if (url.protocol !== 'https:' || url.username || url.password) throw invalid('Asset URLs must use HTTPS');
  return value;
}
export function assertSafeTree(value, depth = 0) {
  if (depth > 12) throw invalid('Data is too deeply nested');
  if (typeof value === 'number' && !Number.isFinite(value)) throw invalid('Numbers must be finite');
  if (typeof value === 'string' && value.length > 16384) throw invalid('String exceeds limit');
  if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) {
    if (/^(?:__proto__|prototype|constructor|user_?id|role|is_admin|membership.*|genesis_holder|dripsync_plus_holder|entitlements?|ownership|payment_status|price|access_token|refresh_token)$/i.test(key)) throw invalid('Identity and entitlement fields are not appearance data');
    assertSafeTree(child, depth + 1);
  }
}
export function contractHandler(handler) {
  return async req => {
    try {
      if (req.headers.get('content-type')?.includes('application/json')) {
        const text = await req.clone().text();
        if (new TextEncoder().encode(text).length > 1024 * 1024) return Response.json({ code: 'INVALID_INPUT', error: 'Request exceeds 1 MiB' }, { status: 413 });
        try { JSON.parse(text); } catch { return Response.json({ code: 'INVALID_INPUT', error: 'Invalid JSON' }, { status: 400 }); }
      }
      const response = await handler(req);
      if (response.status < 400) return response;
      const data = await response.json().catch(() => ({}));
      const status = response.status;
      return Response.json({ ...((status < 500) ? data : {}), code: ['SERVER_CONFIGURATION_MISSING','PAYMENT_PROVIDER_AUTH_FAILED'].includes(data.code) ? data.code : (ERROR_CODES[status] || 'SERVER_ERROR'), error: status >= 500 ? 'Request could not be completed' : (data.error || 'Request rejected') }, { status });
    } catch (error) {
      const status = [400,401,403,404,409,413].includes(error.status) ? error.status : 500;
      return Response.json({ code: ERROR_CODES[status], error: status === 500 ? 'Request could not be completed' : error.message }, { status });
    }
  };
}
