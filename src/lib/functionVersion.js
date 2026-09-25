// Version provenance is a build decision, never a persistent browser preference.
export function resolveFunctionVersion(env, search = '') {
  const pinned = env.VITE_BASE44_FUNCTIONS_VERSION || null;
  if (env.DEV !== true || env.VITE_ENABLE_FUNCTION_VERSION_OVERRIDE !== 'true') return pinned;
  const requested = new URLSearchParams(search).get('functions_version');
  return requested && /^[a-zA-Z0-9_-]{1,128}$/.test(requested) ? requested : pinned;
}