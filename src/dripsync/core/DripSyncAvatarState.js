/**
 * DripSyncAvatarState
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for avatar appearance, gender, 
 * wearables, and animation state.
 *
 * All style modifications flow through this module.
 * Consumers read from here — no duplicate state in components.
 */

// ── Gender token normalization ────────────────────────────────
const VALID_AVATAR_TYPES = ['masculine', 'feminine'];

export function normalizeAvatarType(val) {
  if (val === 'male' || val === 'M' || val === 'masculine') return 'masculine';
  if (val === 'female' || val === 'F' || val === 'feminine') return 'feminine';
  return 'masculine'; // safe default
}

// ── Gender → RPM slug prefix map ─────────────────────────────
export const GENDER_PREFIX = {
  masculine: 'M_',
  feminine:  'F_',
};

// ── Animation cross-map for look loading ─────────────────────
// When a look saved with the opposite gender is loaded,
// remap incompatible animation slugs automatically.
const ANIM_CROSSMAP = {
  // M → F
  'M_Idle_001':            'F_Standing_Idle_001',
  'M_Walk_001':            'F_Walk_001',
  'M_Jog_001':             'F_Jog_001',
  'M_Run_001':             'F_Run_001',
  'M_Dances_001':          'F_Dances_001',
  // F → M
  'F_Standing_Idle_001':   'M_Idle_001',
  'F_Walk_001':            'M_Walk_001',
  'F_Jog_001':             'M_Jog_001',
  'F_Run_001':             'M_Run_001',
  'F_Dances_001':          'M_Dances_001',
};

/**
 * Remap an animation slug to be compatible with the given avatarType.
 * Returns the original slug if it's already compatible.
 */
export function remapAnimationForGender(slug, avatarType) {
  if (!slug) return null;
  const prefix = GENDER_PREFIX[normalizeAvatarType(avatarType)];
  if (slug.startsWith(prefix)) return slug; // already correct gender
  return ANIM_CROSSMAP[slug] || null; // mapped or null (clear it)
}

// ── Default state factory ─────────────────────────────────────
export function createDefaultAvatarState(overrides = {}) {
  return {
    avatarId:     overrides.avatarId     ?? '',
    avatarType:   normalizeAvatarType(overrides.avatarType ?? 'masculine'),
    avatarUrl:    overrides.avatarUrl    ?? '',
    skinTone:     overrides.skinTone     ?? '#FFDBAC',
    hairColor:    overrides.hairColor    ?? '#8B4513',
    eyeColor:     overrides.eyeColor     ?? '#4A90E2',
    hairStyleId:  overrides.hairStyleId  ?? 'short_1',
    faceShape:    overrides.faceShape    ?? 'oval',
    bodyType:     normalizeAvatarType(overrides.bodyType ?? overrides.avatarType ?? 'masculine'),
    skinFinish:   overrides.skinFinish   ?? 'matte',

    equippedItems: {
      top:       overrides.equippedItems?.top       ?? null,
      bottom:    overrides.equippedItems?.bottom    ?? null,
      shoes:     overrides.equippedItems?.shoes     ?? null,
      hat:       overrides.equippedItems?.hat       ?? null,
      accessory: overrides.equippedItems?.accessory ?? null,
      jacket:    overrides.equippedItems?.jacket    ?? null,
      jewellery: overrides.equippedItems?.jewellery ?? null,
    },

    currentAnimationSlug: overrides.currentAnimationSlug ?? null,
    savedLooks:           overrides.savedLooks            ?? [],
  };
}

// ── Wearable slot classifier ──────────────────────────────────
export const WEARABLE_SLOT_LABELS = {
  top:       { label: 'Tops',        emoji: '👕', skinIsolated: false },
  bottom:    { label: 'Bottoms',     emoji: '👖', skinIsolated: false },
  shoes:     { label: 'Shoes',       emoji: '👟', skinIsolated: true  }, // <-- never inherits skin
  hat:       { label: 'Hats',        emoji: '🧢', skinIsolated: true  },
  jacket:    { label: 'Jackets',     emoji: '🧥', skinIsolated: false },
  accessory: { label: 'Accessories', emoji: '💎', skinIsolated: true  },
  jewellery: { label: 'Jewellery',   emoji: '📿', skinIsolated: true  },
};

/**
 * Whether this slot's wearable material should be
 * protected from skin color propagation.
 */
export function isSlotSkinIsolated(slot) {
  return WEARABLE_SLOT_LABELS[slot]?.skinIsolated ?? false;
}

/**
 * Classify a wearable by its category/slot string
 * to one of the canonical slot keys above.
 */
export function classifyWearableSlot(categoryOrSlot = '') {
  const raw = (categoryOrSlot || '').toLowerCase();
  if (raw.includes('shoe') || raw.includes('foot') || raw.includes('boot') || raw.includes('sneaker')) return 'shoes';
  if (raw.includes('hat') || raw.includes('cap') || raw.includes('head')) return 'hat';
  if (raw.includes('jacket') || raw.includes('coat') || raw.includes('hoodie') || raw.includes('outer')) return 'jacket';
  if (raw.includes('top') || raw.includes('shirt') || raw.includes('tee') || raw.includes('torso')) return 'top';
  if (raw.includes('bottom') || raw.includes('pant') || raw.includes('jean') || raw.includes('skirt') || raw.includes('short')) return 'bottom';
  if (raw.includes('jewel') || raw.includes('neck') || raw.includes('ring') || raw.includes('earring')) return 'jewellery';
  return 'accessory';
}

// ── Skin-safe material filter ─────────────────────────────────
/**
 * Given a list of wearables, return a lookup of wearable IDs
 * that should have their materials protected from skin recoloring.
 * Pass this into the viewport / wearable binder.
 */
export function buildSkinIsolationMap(wearables = []) {
  const map = {};
  for (const w of wearables) {
    const slot = w.slot || classifyWearableSlot(w.category || w.slot || '');
    map[w.id] = isSlotSkinIsolated(slot);
  }
  return map;
}