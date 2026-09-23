import { base44 } from '@/api/base44Client';
import { normalizeAvatarConfig } from '@/lib/avatarConfig';

/**
 * In-World DripSync — shared equip helpers (CANONICAL v2).
 *
 * The ONLY write these helpers perform is saveAvatarProfile — the authoritative
 * server endpoint that validates equipped catalog wearable_ids against
 * AssetOwnership BEFORE persisting. There is NO base44.auth.updateMe({
 * avatar_config }) bypass: World-side equipment changes go through the exact
 * same ownership gate as the full DripSync editor.
 *
 * Contract:
 *   - Catalog item  → { source:'catalog', wearable_id, slot, bone }   (NO model_url persisted)
 *   - Upload        → { source:'upload',   model_url, slot, bone }   (user's own GLB)
 *   - userId / ownership claims are NEVER sent — the server derives identity
 *     from auth.me() and ownership from AssetOwnership.
 *
 * A catalog TRY-ON preview is never relabeled as `source:'upload'`: the catalog
 * UI only ever emits `source:'catalog'` entries; a preview that the user doesn't
 * own is blocked client-side and would be rejected (403) server-side regardless.
 */

const BONE_BY_SLOT = {
  headwear: 'Head', hat: 'Head', eyewear: 'Head', glasses: 'Head',
  top: 'Spine1', shirt: 'Spine1', jacket: 'Spine1',
  bottom: 'Spine', pants: 'Spine',
  shoes: 'LeftFoot', footwear: 'LeftFoot',
  full_body: 'Spine1', accessory: 'Spine1', bag: 'Spine',
};

const EXCLUSIVE_SLOTS = [
  'headwear', 'hat', 'glasses', 'eyewear', 'top', 'shirt', 'jacket',
  'bottom', 'pants', 'shoes', 'footwear', 'full_body',
];

/**
 * Persist a v2 avatar_config through saveAvatarProfile and reflect the
 * server-returned canonical config in AuthContext.
 * @throws on 403 (unowned catalog items), 401, or network failure — caller
 *   surfaces the error. `err.status` and `err.unauthorized_wearable_ids` are
 *   set when available.
 */
export async function applyAvatarConfig(newConfig, updateUser) {
  try {
    const res = await base44.functions.invoke('saveAvatarProfile', { avatar_config: newConfig });
    const data = res?.data;
    if (data?.success && data.avatar_config) {
      if (updateUser) {
        updateUser((prev) => ({ ...(prev || {}), avatar_config: data.avatar_config }));
      }
      return data.avatar_config;
    }
    const err = new Error(data?.error || 'Save rejected');
    err.unauthorized_wearable_ids = data?.unauthorized_wearable_ids;
    err.status = 400;
    throw err;
  } catch (err) {
    const body = err?.response?.data;
    const e = new Error(body?.error || err?.message || 'Save failed');
    e.status = err?.response?.status || 0;
    e.unauthorized_wearable_ids = body?.unauthorized_wearable_ids;
    throw e;
  }
}

/**
 * Build a canonical v2 avatar_config from a Look or DripSyncAsset(look/avatar)
 * record. The record may hold legacy v1 fields (avatarUrl, wearables[],
 * customAnimations) — we assemble a v1-shaped object and run it through the
 * central normalizeAvatarConfig migration layer so every panel shares ONE
 * conversion path (no per-panel v2 logic).
 */
export function buildConfigFromLook(look, baseConfig = {}) {
  const m = look.metadata || {};
  const avatarUrl =
    look.avatarUrl || look.avatar_url || m.avatarUrl ||
    baseConfig.avatarUrl || baseConfig.avatar?.model_url;
  const wearables = look.wearables || m.wearables || [];
  const customAnimations =
    look.animations || look.emotes || look.customAnimations || m.animations || [];
  const environment = look.environment || m.environment || null;
  const currentRealm = look.current_realm || look.currentRealm || m.currentRealm || null;
  const gender =
    look.gender || m.gender || m.avatarType ||
    baseConfig.avatarGender || baseConfig.avatar?.gender || 'masculine';
  const customization = {
    ...(baseConfig.customization || {}),
    ...(look.customization || m.customization || {}),
    isVisible: true,
  };

  const v1 = {
    avatarUrl,
    wearables,
    customAnimations,
    environment,
    currentRealm,
    customization,
    avatarGender: gender,
    source:
      avatarUrl && avatarUrl.includes('readyplayer.me')
        ? 'rpm'
        : look.source || baseConfig.source || 'look',
    lastModified: new Date().toISOString(),
  };
  return normalizeAvatarConfig(v1);
}

/**
 * Build a canonical v2 equipped entry for a CATALOG Wearable.
 * Persists only the wearable_id (the catalog is authoritative for model/slot);
 * NEVER persists the model_url as an upload.
 */
export function buildWearableEntry(wearable) {
  const slot = wearable.category || 'accessory';
  return {
    source: 'catalog',
    wearable_id: String(wearable.id),
    slot,
    bone: BONE_BY_SLOT[slot] || 'Spine1',
  };
}

/**
 * Remove a v2 equipped entry by its identity key — wearable_id for catalog
 * items, model_url for uploads. Returns a new config with the entry removed.
 * Used by the in-world AVATAR panel's unequip action so the full equip/unequip
 * cycle stays inside the World (no route navigation to the DripSync editor).
 */
export function removeWearableFromConfig(config, key) {
  const equipped = Array.isArray(config?.equipped) ? [...config.equipped] : [];
  const filtered = equipped.filter((e) => {
    const id = e.source === 'catalog'
      ? (e.wearable_id ? String(e.wearable_id) : null)
      : (e.model_url || null);
    return id !== key;
  });
  return {
    ...(config || {}),
    schema_version: 2,
    equipped: filtered,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Add a v2 equipped entry to a v2 config, replacing exclusive-slot conflicts.
 * Operates on `equipped[]` (never legacy `wearables[]`).
 */
export function addWearableToConfig(config, entry) {
  const equipped = Array.isArray(config?.equipped) ? [...config.equipped] : [];
  const isExclusive = EXCLUSIVE_SLOTS.includes(entry.slot);
  const filtered = isExclusive
    ? equipped.filter((e) => !(e.slot && e.slot === entry.slot))
    : equipped;
  return {
    ...(config || {}),
    schema_version: 2,
    equipped: [...filtered, entry],
    updated_at: new Date().toISOString(),
  };
}