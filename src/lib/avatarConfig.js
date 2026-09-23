/**
 * Canonical Avatar Config — v2
 * ─────────────────────────────────────────────────────────────────────────
 * ONE frontend module that normalizes any avatar_config (legacy v1 or v2)
 * into the canonical v2 shape. Consumed by DripSync AND World so neither
 * system keeps its own copy of the avatar profile.
 *
 *   User.avatar_config  →  normalizeAvatarConfig()  →  DripSync renderer
 *                                                →  World AvatarManager
 *
 * The backend function `saveAvatarProfile` mirrors this logic server-side
 * (base44 cannot share a file between the Vite frontend bundle and the Deno
 * backend runtime), and is AUTHORITATIVE on save — it validates equipped
 * wearable_ids against AssetOwnership before persisting.
 *
 * Responsibilities:
 *   User.avatar_config  = how I look
 *   AssetOwnership       = what I own
 *   Wearable             = what the digital item is
 *   Product / SKU        = what I buy
 *   PlayerProfile        = my game progress
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

// Convert a legacy v1 wearables[] entry into a v2 equipped reference.
// Legacy entries could be catalog Wearable ids OR user-uploaded GLB URLs with
// synthetic ids — we preserve BOTH the wearable_id and model_url so nothing
// is lost. Server-side validation decides enforcement per source.
function legacyWearableToEquipped(w) {
  if (!w || typeof w !== 'object') return null;
  const wid = w.wearable_id || w.id || w.wearableId || null;
  const url = w.url || w.model_url || w.modelUrl || null;
  // Must have at least one identifier
  if (!wid && !url) return null;

  const out = {
    // Any legacy entry that carried a URL is treated as an upload on migration
    // (preserving the wearable_id for future resolution). Avoids data loss for
    // existing users whose wearables[] held uploaded GLBs with synthetic ids.
    source: url ? 'upload' : 'catalog',
  };
  if (wid) out.wearable_id = String(wid);
  if (url) out.model_url = url;
  if (w.name) out.name = w.name;
  if (Array.isArray(w.position)) out.position = w.position;
  if (Array.isArray(w.rotation)) out.rotation = w.rotation;
  if (typeof w.scale === 'number') out.scale = w.scale;
  // Presentation metadata (passthrough) — the renderer needs these to
  // reconstruct the same visual on reload. They are NOT identity; ownership
  // is still enforced on wearable_id for catalog items.
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
  // catalog requires a wearable_id; upload requires a model_url
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
  return arr
    .filter(a => a && (a.url || a.url === '') && a.name)
    .map(a => ({ name: String(a.name), url: String(a.url) }));
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

  const customization = {
    ...DEFAULT_CUSTOMIZATION,
    ...(c.customization || (c.metadata && c.metadata.customization) || {}),
  };
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
 * Resolve v2 equipped references into the rich wearable objects the DripSync
 * and World renderers consume (url, slot, transforms). Catalog items resolve
 * from a Wearable map; uploads keep their stored model_url.
 *
 * @param {object[]} equipped — normalized v2 equipped array
 * @param {Map<string, object>} wearablesById — Wearable entity records keyed by id
 * @returns {object[]} runtime wearable objects {id,name,url,slot,position,rotation,scale,rarity,is_nft,source}
 */
export function equippedToRuntimeWearables(equipped, wearablesById) {
  if (!Array.isArray(equipped)) return [];
  const map = wearablesById instanceof Map ? wearablesById : new Map(Object.entries(wearablesById || {}));
  return equipped.map((e) => {
    if (!e) return null;
    // Catalog item — resolve from Wearable record
    if (e.source === 'catalog' && e.wearable_id) {
      const w = map.get(String(e.wearable_id));
      if (!w) return null; // unowned/missing catalog item — skip rendering
      return {
        id: w.id,
        name: e.name || w.name,
        url: w.model_url,
        slot: e.slot || w.category,
        bone: e.bone || null,
        color: e.color || null,
        position: e.position || [0, 0, 0],
        rotation: e.rotation || [0, 0, 0],
        scale: typeof e.scale === 'number' ? e.scale : 1,
        rarity: w.rarity,
        is_nft: w.is_nft,
        source: 'catalog',
      };
    }
    // Upload — use stored URL directly
    if (e.source === 'upload' && e.model_url) {
      return {
        id: e.wearable_id || e.model_url,
        name: e.name || 'Upload',
        url: e.model_url,
        slot: e.slot || null,
        bone: e.bone || null,
        color: e.color || null,
        position: e.position || [0, 0, 0],
        rotation: e.rotation || [0, 0, 0],
        scale: typeof e.scale === 'number' ? e.scale : 1,
        rarity: null,
        is_nft: false,
        source: 'upload',
      };
    }
    return null;
  }).filter(Boolean);
}

/**
 * Build the v2 equipped entry the frontend should dispatch when a user equips
 * a catalog Wearable. Centralizes the source contract so DripSync never
 * forgets to set source: 'catalog'.
 */
export function catalogEquipEntry(wearable, transforms = {}) {
  return {
    source: 'catalog',
    wearable_id: String(wearable.id),
    ...(Array.isArray(transforms.position) ? { position: transforms.position } : {}),
    ...(Array.isArray(transforms.rotation) ? { rotation: transforms.rotation } : {}),
    ...(typeof transforms.scale === 'number' ? { scale: transforms.scale } : {}),
  };
}

/**
 * Build the v2 equipped entry for a user-uploaded GLB.
 */
export function uploadEquipEntry(name, modelUrl, transforms = {}) {
  return {
    source: 'upload',
    model_url: modelUrl,
    name: name || 'Upload',
    ...(Array.isArray(transforms.position) ? { position: transforms.position } : {}),
    ...(Array.isArray(transforms.rotation) ? { rotation: transforms.rotation } : {}),
    ...(typeof transforms.scale === 'number' ? { scale: transforms.scale } : {}),
  };
}