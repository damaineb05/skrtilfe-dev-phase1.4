/**
 * Constants — Environment Presets
 * Default environment/background configurations.
 * Note: Sketchfab URLs require OAuth and will 403 in production — use null for clean studio.
 */

/** Clean lighting studio — no environment model loaded. */
export const STUDIO_ENVIRONMENT = null;

export const ENVIRONMENT_LOAD_TIMEOUT_MS = 30000;

export default { STUDIO_ENVIRONMENT, ENVIRONMENT_LOAD_TIMEOUT_MS };