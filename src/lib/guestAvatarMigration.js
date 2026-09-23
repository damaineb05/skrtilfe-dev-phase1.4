/**
 * GuestAvatarMigration — temporary handoff state for the guest → auth → canonical
 * avatar flow. A guest who customizes in DripSync (demo mode) cannot persist
 * through saveAvatarProfile (no authenticated user). On Save we stage their
 * canonical config here, redirect through the platform auth flow, and on return
 * migrate the staged config into the now-authenticated user's avatar_config.
 *
 * This is NOT a second avatar database — it is ephemeral handoff state with a TTL.
 * Only the canonical config (which already contains equipped wearables) is stored.
 */

const PENDING_KEY = 'skrtlife_pending_avatar';
const TTL_MS = 30 * 60 * 1000; // 30 minutes — abandoned guest configs don't live forever

/**
 * Stage a canonical avatar config for post-auth migration.
 * @param {object} config  canonical v2 avatar config from buildCanonicalConfig
 * @param {object} opts    { returnTo } intended return destination
 */
export function stagePendingAvatar(config, { returnTo } = {}) {
  const payload = {
    schema_version: 1,
    staged_at: new Date().toISOString(),
    expires_at: Date.now() + TTL_MS,
    return_to: returnTo || null,
    config,
  };
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('[guestAvatarMigration] failed to stage pending avatar', e);
  }
  return payload;
}

/**
 * Read + validate the pending avatar. Auto-clears if missing, malformed, or expired.
 * @returns {{config: object, staged_at: string, return_to: string}|null}
 */
export function getPendingAvatar() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (!payload || !payload.config) {
      localStorage.removeItem(PENDING_KEY);
      return null;
    }
    if (typeof payload.expires_at === 'number' && Date.now() > payload.expires_at) {
      localStorage.removeItem(PENDING_KEY);
      return null;
    }
    return payload;
  } catch (e) {
    try { localStorage.removeItem(PENDING_KEY); } catch (_) {}
    return null;
  }
}

/**
 * Remove the pending payload. Only call after successful migration (or explicit discard).
 */
export function clearPendingAvatar() {
  try { localStorage.removeItem(PENDING_KEY); } catch (e) {}
}