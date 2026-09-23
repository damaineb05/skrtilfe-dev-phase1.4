/**
 * Contextual hint system — lightweight, one-time, post-onboarding guidance.
 *
 * This is NOT a second tutorial. The main DripSyncGuide teaches
 *   SELF → DRIP → IDENTITY → ENTER.
 * Contextual hints teach HOW THE ECOSYSTEM WORKS AFTER THAT.
 *
 * Persistence: skrt_hint_seen:<userId|'guest'>:<hintId> in localStorage.
 * Kept SEPARATE from avatar_config. The helper is keyed by user id (or
 * 'guest'), so the same architecture supports transferring/recognizing guest
 * hint state after authentication where appropriate.
 *
 * Collision / priority (only ONE guidance surface at a time):
 *   critical system modal
 *     → GuestIdentityFlow / DripSyncGuide  (primary guidance)
 *     → contextual hint
 *     → ordinary toast
 * A primary-guidance bus lets DripSync mark the tutorial/migration active so
 * contextual hints suppress; a single claim slot prevents two coachmarks from
 * stacking. A confirm-style hint may bypass the slot (transient toast-like).
 */

const seenKey = (userId, hintId) => `skrt_hint_seen:${userId || 'guest'}:${hintId}`;

export function isHintSeen(userId, hintId) {
  try { return localStorage.getItem(seenKey(userId, hintId)) === '1'; } catch { return false; }
}
export function markHintSeen(userId, hintId) {
  try { localStorage.setItem(seenKey(userId, hintId), '1'); } catch (e) {}
}
export function clearHint(userId, hintId) {
  try { localStorage.removeItem(seenKey(userId, hintId)); } catch (e) {}
}

// Reserved hint IDs. Only activate a hint where the feature actually exists.
// genesis_membership is reserved for the next-phase membership offer handoff
// (membership must NOT become part of avatar persistence itself).
export const HINT_IDS = {
  FIRST_WARDROBE: 'first_wardrobe',
  FIRST_TRYON: 'first_tryon',
  WORLD_ENTRY: 'world_entry',
  WORLD_DRIPSYNC: 'world_dripsync',
  WORLD_CONTROLS_DESKTOP: 'world_controls_desktop',
  WORLD_CONTROLS_MOBILE: 'world_controls_mobile',
  DRIP_SYNCED: 'drip_synced',
  // Reserved (not yet activated):
  PROFILE_IDENTITY: 'profile_identity',
  WALLET_ACCESS: 'wallet_access',
  COMMUNITY_ACCESS: 'community_access',
  WORLD_SHOP: 'world_shop',
  EVENTS: 'events',
  GENESIS: 'genesis',
  GENESIS_MEMBERSHIP: 'genesis_membership',
};

// ── Primary-guidance bus ──────────────────────────────────────
let primaryGuidanceActive = false;
const guidanceSubs = new Set();
export function setPrimaryGuidanceActive(v) {
  const next = !!v;
  if (next === primaryGuidanceActive) return;
  primaryGuidanceActive = next;
  guidanceSubs.forEach((f) => f(primaryGuidanceActive));
}
export function isPrimaryGuidanceActive() { return primaryGuidanceActive; }
export function subscribeGuidance(fn) { guidanceSubs.add(fn); return () => guidanceSubs.delete(fn); }

// ── Single-hint claim slot (prevents stacking coachmarks) ─────
let claimedHintId = null;
const claimSubs = new Set();
export function claimHint(hintId) {
  if (claimedHintId === null) { claimedHintId = hintId; claimSubs.forEach((f) => f()); return true; }
  return claimedHintId === hintId;
}
export function releaseHint(hintId) {
  if (claimedHintId === hintId) { claimedHintId = null; claimSubs.forEach((f) => f()); }
}
export function subscribeClaims(fn) { claimSubs.add(fn); return () => claimSubs.delete(fn); }