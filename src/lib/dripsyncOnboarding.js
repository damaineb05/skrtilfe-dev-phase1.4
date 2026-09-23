/**
 * DripSyncOnboarding persistence — first-time tutorial completion state.
 *
 * Kept SEPARATE from avatar identity data (never stored in avatar_config).
 * localStorage keyed by user id (or 'guest' for unauthenticated visitors).
 * After authentication, completion is re-marked under the real user id during
 * the guest→auth avatar migration, so the tutorial never reappears.
 */
const key = (userId) => `skrt_dripsync_onboarded:${userId || 'guest'}`;

export function isDripSyncOnboardingComplete(userId) {
  try { return localStorage.getItem(key(userId)) === '1'; } catch { return false; }
}

export function markDripSyncOnboardingComplete(userId) {
  try { localStorage.setItem(key(userId), '1'); } catch (e) {}
}