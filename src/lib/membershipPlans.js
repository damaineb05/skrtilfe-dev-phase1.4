/**
 * Central membership plan configuration.
 *
 * UI reads pricing / names / benefits ONLY from here — never hardcodes them in
 * components, so pricing can change without rewriting UI. The authoritative
 * server-side price lives in the checkout functions (membershipCheckout /
 * genesisCheckout) and MUST match the `price` fields here when changed.
 *
 * Three tiers: FREE (Citizen) → DRIPSYNC+ → GENESIS.
 *
 * Benefits are split into AVAILABLE NOW (backed by existing functionality the
 * app actually supports) and COMING SOON (honest, not fabricated). We never
 * advertise a benefit the app cannot support, and we never retroactively lock
 * working free features.
 */

export const MEMBERSHIP_PLANS = {
  free: {
    id: 'free',
    name: 'Citizen',
    tagline: 'Enter the Society',
    price: '$0',
    priceSuffix: '',
    cta: 'Continue Free',
    accent: 'rgba(255,255,255,0.6)',
    available: [
      'A permanent SKRTLIFE profile',
      'Create & save your core avatar',
      'Enter the World',
      'Browse Shop & preview in DripSync',
    ],
    comingSoon: [],
  },
  dripsync_plus: {
    id: 'dripsync_plus',
    name: 'DripSync+',
    tagline: 'Expand Your Identity',
    price: '$2.99',
    priceSuffix: '/mo',
    cta: 'Expand',
    accent: '#00D4FF',
    available: [
      'DripSync+ member badge on your profile',
      'Founding supporter recognition',
    ],
    comingSoon: [
      'Expanded saved looks',
      'Premium customization',
      'Exclusive digital drops',
      'Early-access experiences',
    ],
  },
  genesis: {
    id: 'genesis',
    name: 'Genesis',
    tagline: 'Become Genesis',
    price: '$299',
    priceSuffix: 'lifetime',
    cta: 'Become Genesis',
    accent: '#FFD700',
    available: [
      'Founding member badge',
      'Exclusive DripSync wearables',
      'Priority drops access',
      'Genesis-only events',
    ],
    comingSoon: [],
  },
};

export const PLAN_ORDER = ['free', 'dripsync_plus', 'genesis'];