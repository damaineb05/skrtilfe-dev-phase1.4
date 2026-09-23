/**
 * Canonical membership / entitlement helper — the ONE place that answers every
 * "what tier is this user / can they use X" question. Components must not check
 * random strings like user.plan === 'premium'.
 *
 * Reuses the existing Genesis signal (user.genesis_holder; admins inherit via
 * useCanonicalGenesisAccess) and adds DripSync+ (user.dripsync_plus_holder).
 * Both flags are set SERVER-SIDE by the existing Stripe webhook on verified
 * payment — never by the client.
 *
 * Membership state lives on the User (profile/account). It is NEVER stored on
 * avatar_config (appearance and access are separate concerns).
 */
import { hasGenesisAccess } from '@/lib/useCanonicalGenesisAccess';

export const MEMBERSHIP_TIERS = {
  FREE: 'free',
  DRIPSYNC_PLUS: 'dripsync_plus',
  GENESIS: 'genesis',
};

export function getMembershipTier(user) {
  if (!user) return MEMBERSHIP_TIERS.FREE;
  if (hasGenesisAccess(user)) return MEMBERSHIP_TIERS.GENESIS; // genesis_holder || admin
  if (user.dripsync_plus_holder === true) return MEMBERSHIP_TIERS.DRIPSYNC_PLUS;
  return MEMBERSHIP_TIERS.FREE;
}

export function hasMembership(user, tier) {
  const current = getMembershipTier(user);
  if (tier === MEMBERSHIP_TIERS.GENESIS) return current === MEMBERSHIP_TIERS.GENESIS;
  if (tier === MEMBERSHIP_TIERS.DRIPSYNC_PLUS) {
    return current === MEMBERSHIP_TIERS.GENESIS || current === MEMBERSHIP_TIERS.DRIPSYNC_PLUS;
  }
  return true; // free is always held
}

// Centralized feature gating. Add feature keys here as premium features ship.
// Today no feature is gated (we do not retroactively lock working free
// features), so every known feature resolves to true. This is the single hook
// for future gating — components call canUseFeature(user, 'expanded_looks').
const FEATURE_MIN_TIER = {
  // Reserved for when the underlying premium features actually exist:
  // expanded_saved_looks: MEMBERSHIP_TIERS.DRIPSYNC_PLUS,
  // premium_customization: MEMBERSHIP_TIERS.DRIPSYNC_PLUS,
};

export function canUseFeature(user, feature) {
  const min = FEATURE_MIN_TIER[feature];
  if (!min) return true; // unknown / ungated feature → allowed
  return hasMembership(user, min);
}