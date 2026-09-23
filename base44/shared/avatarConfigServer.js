/**
 * Canonical Avatar Config — v2 (BACKEND / Deno)
 * ─────────────────────────────────────────────────────────────────────────
 * The server-side mirror of src/lib/avatarConfig.js. Base44 cannot share a
 * file between the Vite frontend bundle and the Deno backend runtime, so this
 * module is the single backend source of canonical avatar sanitization.
 *
 * Consumed by:
 *   - saveAvatarProfile  (validates + persists the desired config)
 *   - saveDefaultAvatar  (writes a canonical v2 default body, never legacy v1)
 *
 * Frontend renderer helpers (equippedToRuntimeWearables, catalogEquipEntry)
 * live in src/lib/avatarConfig.js and are NOT duplicated here — the backend
 * never resolves wearables into runtime objects.
 */

export const AVATAR_SCHEMA_VERSION = 2;

const DEFAULT_CUSTOMIZATION = {
  skinTone: '#C68642',
  eyeColor: '#4A90D9',
  hairColor: '#3B1F0A',
  isVisible: true,
};

const ALLOWED_SOURCES = ['rpm', 'upload', 'default', 'look', 'system', 'readyplayerme'];

function coerceGender(g) {
  return g === 'masculine' || g === 'feminine' || g === 'neutral' ? g : 'masculine';
}
function coerceSource(s) {
  return ALLOWED_SOURCES.includes(s) ? s : (s || null);
}

function legacyWearableToEquipped(w) {
  if (!w || typeof w !== 'object') return null;
  const wid = w.wearable_id || w.id || w.wearableId || null;
  const url = w.url || w.model_url || w.modelUrl || null;
  if (!wid && !url) return null;
  // A legacy entry that carried a URL is treated as an upload on migration,
  // preserving the wearable_id for future resolution (avoids data loss).
  const out = { source: url ? 'upload' : 'catalog' };
  if (wid) out.wearable_id = String(wid);
  if (url) out.model_url = url;
  if (w.name) out.name = String(w.name);
  if (Array.isArray(w.position)) out.position = w.position;
  if (Array.isArray(w.rotation)) out.rotation = w.rotation;
  if (typeof w.scale === 'number') out.scale = w.scale;
  if (w.slot || w.category) out.slot = String(w.slot || w.category);
  if (w.bone) out.bone = String(w.bone);
  if (w.color) out.color = String(w.color);
  return out;
}

function sanitizeEquipped(e) {
  if (!e || typeof e !== 'object') return null;
  const source = e.source === 'upload' ? 'upload' : 'catalog';
  const wid = e.wearable_id ? String(e.wearable_id) : null;
  const url = e.model_url || null;
  if (source === 'catalog' && !wid) return null;
  if (source === 'upload' && !url) return null;
  const out = { source };
  if (wid) out.wearable_id = wid;
  if (url) out.model_url = url;
  if (e.name) out.name = String(e.name);
  if (Array.isArray(e.position)) out.position = e.position;
  if (Array.isArray(e.rotation)) out.rotation = e.rotation;
  if (typeof e.scale === 'number') out.scale = e.scale;
  if (e.slot) out.slot = String(e.slot);
  if (e.bone) out.bone = String(e.bone);
  if (e.color) out.color = String(e.color);
  return out;
}

function sanitizeCustomAnimations(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter(a => a && a.url && a.name).map(a => ({ name: String(a.name), url: String(a.url) }));
}

function sanitizeV2(c) {
  const avatar = c.avatar || {};
  return {
    schema_version: AVATAR_SCHEMA_VERSION,
    avatar: {
      id: avatar.id || null,
      model_url: avatar.model_url || avatar.url || null,
      source: coerceSource(avatar.source),
      gender: coerceGender(avatar.gender),
    },
    customization: {
      ...DEFAULT_CUSTOMIZATION,
      ...(c.customization || {}),
      isVisible: c.customization ? c.customization.isVisible !== false : true,
    },
    equipped: Array.isArray(c.equipped) ? c.equipped.map(sanitizeEquipped).filter(Boolean) : [],
    custom_animations: sanitizeCustomAnimations(c.custom_animations),
    environment: c.environment ?? null,
    current_realm: c.current_realm ?? null,
    updated_at: c.updated_at || null,
  };
}

function migrateLegacy(c) {
  const wearables = c.wearables || (c.metadata && c.metadata.wearables) || [];
  const equipped = wearables.map(legacyWearableToEquipped).filter(Boolean);
  const customization = { ...DEFAULT_CUSTOMIZATION, ...(c.customization || (c.metadata && c.metadata.customization) || {}) };
  if (c.traits) {
    if (c.traits.skinTone) customization.skinTone = c.traits.skinTone;
    if (c.traits.hairColor) customization.hairColor = c.traits.hairColor;
    if (c.traits.eyeColor) customization.eyeColor = c.traits.eyeColor;
  }
  customization.isVisible = customization.isVisible !== false;
  return {
    schema_version: AVATAR_SCHEMA_VERSION,
    avatar: {
      id: c.avatarId || c.avatar_id || null,
      model_url: c.avatarUrl || c.avatar_url || null,
      source: coerceSource(c.source || (c.avatarUrl && String(c.avatarUrl).indexOf('readyplayer.me') !== -1 ? 'rpm' : null)),
      gender: coerceGender(c.avatarGender || c.gender || (c.metadata && (c.metadata.gender || c.metadata.avatarType))),
    },
    customization,
    equipped,
    custom_animations: sanitizeCustomAnimations(c.customAnimations || c.custom_animations || (c.metadata && c.metadata.animations)),
    environment: c.environment || (c.metadata && c.metadata.environment) || null,
    current_realm: c.currentRealm || c.current_realm || (c.metadata && c.metadata.currentRealm) || null,
    updated_at: c.lastSaved || c.lastModified || null,
  };
}

/**
 * Normalize any avatar_config (legacy v1 or v2) into canonical v2.
 * Returns null for invalid input.
 */
export function normalizeAvatarConfig(config) {
  if (!config || typeof config !== 'object') return null;
  if (config.schema_version === 2) return sanitizeV2(config);
  return migrateLegacy(config);
}

/**
 * Build a canonical v2 config from a bare avatar URL, preserving any
 * existing equipped/customization/scene state. Used by saveDefaultAvatar so
 * it NEVER writes a legacy v1 shape.
 *
 * @param {string} avatarUrl - the avatar body GLB/RPM URL
 * @param {object} [opts]
 * @param {object} [opts.existingConfig] - current User.avatar_config (v1 or v2)
 * @param {string} [opts.gender] - optional gender override
 */
export function buildCanonicalFromAvatarUrl(avatarUrl, opts = {}) {
  if (!avatarUrl || typeof avatarUrl !== 'string') return null;
  const existing = normalizeAvatarConfig(opts.existingConfig || null) || {
    schema_version: AVATAR_SCHEMA_VERSION,
    avatar: {},
    customization: { ...DEFAULT_CUSTOMIZATION },
    equipped: [],
    custom_animations: [],
    environment: null,
    current_realm: null,
  };
  const isRpm = String(avatarUrl).indexOf('readyplayer.me') !== -1;
  return {
    ...existing,
    schema_version: AVATAR_SCHEMA_VERSION,
    avatar: {
      id: String(avatarUrl).split('/').pop()?.split('.')[0] || existing.avatar?.id || null,
      model_url: avatarUrl,
      source: isRpm ? 'rpm' : (existing.avatar?.source || 'upload'),
      gender: coerceGender(opts.gender || existing.avatar?.gender),
    },
    updated_at: new Date().toISOString(),
  };
}