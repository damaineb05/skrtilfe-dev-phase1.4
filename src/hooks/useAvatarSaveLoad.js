/**
 * DRIPSYNC AVATAR SAVE/LOAD V2
 * Production-ready save and load with full validation, normalization,
 * thumbnail capture, and backward compatibility for V1 assets.
 */
import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useAvatarStore } from './useAvatarStore';

const SCHEMA_VERSION = 2;

// ─── Asset Normalization (V1 → V2 compatibility) ─────────────────────────────
export function normalizeAsset(raw) {
  if (!raw) return null;

  // Resolve avatarUrl — check root, then metadata (V1 backward compat)
  const avatarUrl = raw.avatarUrl || raw.metadata?.avatarUrl || null;

  // Resolve gender — check root, then various legacy metadata paths
  const gender =
    raw.gender ||
    raw.metadata?.gender ||
    raw.metadata?.avatarType ||
    (raw.avatarType) ||
    'masculine';

  // Resolve source
  const source =
    raw.source ||
    raw.metadata?.source ||
    (avatarUrl?.includes('readyplayer.me') ? 'rpm' : 'upload');

  // Resolve customization — deep merge with defaults
  const customization = {
    skinTone: '#C68642',
    eyeColor: '#4A90D9',
    hairColor: '#3B1F0A',
    isVisible: true,
    ...(raw.metadata?.customization || {}),
    ...(raw.customization || {}),
  };

  // Resolve wearables — normalize each wearable item
  const wearables = (raw.metadata?.wearables || raw.wearables || []).map(normalizeWearable);

  // Resolve animations
  const animations = raw.metadata?.animations || raw.animations || raw.customAnimations || [];

  // Resolve environment
  const environment = raw.metadata?.environment || raw.environment || null;

  // Resolve realm
  const currentRealm = raw.metadata?.currentRealm || raw.currentRealm || raw.realm || null;

  return {
    id: raw.id,
    type: raw.type || 'avatar',
    name: raw.name,
    source,
    gender,
    avatarUrl,
    avatarId: raw.avatarId || raw.metadata?.avatarId || null,
    thumbnailUrl: raw.thumbnailUrl || raw.metadata?.thumbnailUrl || null,
    isStarter: raw.isStarter || false,
    isDefault: raw.isDefault || false,
    customization,
    wearables,
    animations,
    environment,
    currentRealm,
    schema_version: raw.schema_version || raw.metadata?.asset_version || 1,
  };
}

// Normalize a single wearable object for save/load
export function normalizeWearable(w) {
  if (!w) return null;
  return {
    id: w.id || String(Date.now() + Math.random()),
    name: w.name || 'Wearable',
    url: w.url || '',
    slot: w.slot || 'accessory',
    bone: w.bone || 'Spine',
    position: Array.isArray(w.position) && w.position.length === 3 ? w.position : [0, 0, 0],
    rotation: Array.isArray(w.rotation) && w.rotation.length === 3 ? w.rotation : [0, 0, 0],
    scale: typeof w.scale === 'number' ? w.scale : 1,
    color: w.color || null,
    metadata: w.metadata || {},
    fromShop: w.fromShop || false,
  };
}

// ─── Save Payload Builder ─────────────────────────────────────────────────────
export function buildSavePayload(avatarState) {
  return {
    // Root-level fields (queryable without metadata parsing)
    avatarUrl: avatarState.avatarUrl,
    avatarId: avatarState.avatarId || null,
    gender: avatarState.gender || 'masculine',
    source: avatarState.source || 'upload',
    schema_version: SCHEMA_VERSION,

    // Full metadata object
    metadata: {
      // Redundant root fields for V1 backward compat
      avatarUrl: avatarState.avatarUrl,
      avatarType: avatarState.gender,
      gender: avatarState.gender,
      source: avatarState.source,
      asset_version: SCHEMA_VERSION,

      customization: {
        ...(avatarState.customization || {}),
        isVisible: true,
      },
      wearables: (avatarState.wearables || []).map(normalizeWearable),
      animations: avatarState.customAnimations || [],
      environment: avatarState.environment || null,
      currentRealm: avatarState.currentRealm || null,
    },
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────
export function validateSavePayload(type, payload) {
  const errors = [];

  if (!payload.avatarUrl) {
    errors.push('No avatar loaded. Please load an avatar before saving.');
  }

  // Warn but don't block on blob URLs — they'll fail on next load
  if (payload.avatarUrl?.startsWith('blob:')) {
    console.warn('[SaveSystem V2] Saving with blob URL — this will break on reload. Upload the file first.');
  }

  // Check for malformed wearable URLs
  const badWearables = (payload.metadata?.wearables || []).filter(w => w.url && w.url.startsWith('blob:'));
  if (badWearables.length > 0) {
    console.warn(`[SaveSystem V2] ${badWearables.length} wearable(s) have blob URLs — they may not reload correctly.`);
  }

  return errors;
}

// ─── Capture thumbnail from viewport canvas ────────────────────────────────
export async function captureThumbnail() {
  try {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    return canvas.toDataURL('image/jpeg', 0.82);
  } catch (err) {
    console.warn('[SaveSystem V2] Thumbnail capture failed:', err);
    return null;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAvatarSaveLoad({ user, getUserAssets }) {
  const { avatarState, loadFullState, markSaved } = useAvatarStore();

  // ── Save avatar or look ────────────────────────────────────────────────────
  const saveAvatar = useCallback(async (name, options = {}) => {
    if (!user?.id) {
      toast.error('Must be logged in to save');
      return null;
    }

    const type = options.type || 'avatar';
    const allowedTypes = ['avatar', 'look', 'outfit', 'scene'];
    if (!allowedTypes.includes(type)) {
      toast.error('Invalid asset type');
      return null;
    }

    // Dedup guard
    const dedupKey = `save_dedup_${type}_${name}`;
    if (sessionStorage.getItem(dedupKey)) return null;
    sessionStorage.setItem(dedupKey, '1');
    setTimeout(() => sessionStorage.removeItem(dedupKey), 2000);

    // Build payload
    const payload = buildSavePayload(avatarState);

    // Validate
    const errors = validateSavePayload(type, payload);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return null;
    }

    // Capture thumbnail
    let thumbnail = options.thumbnail || (await captureThumbnail());

    // If no thumbnail, use existing or null
    if (!thumbnail) {
      thumbnail = avatarState.thumbnailUrl || null;
    }

    try {
      const asset = await base44.entities.DripSyncAsset.create({
        user_id: user.id,
        type,
        name: name || `Untitled ${type}`,
        avatarUrl: payload.avatarUrl,
        avatarId: payload.avatarId,
        gender: payload.gender,
        source: payload.source,
        thumbnailUrl: thumbnail,
        isDefault: false,
        isStarter: options.setAsStarter || false,
        schema_version: SCHEMA_VERSION,
        metadata: payload.metadata,
      });

      markSaved(asset.id, thumbnail);

      if (getUserAssets) getUserAssets(true); // force refresh library

      toast.success(`${type === 'avatar' ? '👤' : '✨'} "${name}" saved!`);
      return asset;
    } catch (err) {
      console.error('[SaveSystem V2] Save failed:', err);
      toast.error(`Failed to save ${type}`);
      return null;
    }
  }, [user?.id, avatarState, markSaved, getUserAssets]);

  // ── Load from DripSyncAsset ────────────────────────────────────────────────
  const loadFromAsset = useCallback((rawAsset) => {
    if (!rawAsset) {
      toast.error('No asset to load');
      return;
    }

    const normalized = normalizeAsset(rawAsset);

    if (!normalized.avatarUrl) {
      toast.error('This avatar is missing its model URL and cannot be loaded.');
      console.error('[SaveSystem V2] Asset missing avatarUrl:', rawAsset.id, rawAsset.name);
      return;
    }

    // Add cache-busting timestamp
    const urlWithTs = `${normalized.avatarUrl.split('?')[0]}?t=${Date.now()}`;

    loadFullState({
      ...normalized,
      avatarUrl: urlWithTs,
    });

    toast.success(`Loaded "${normalized.name}"`);
  }, [loadFullState]);

  // ── Restore from user.avatar_config (on login/refresh) ────────────────────
  const restoreFromConfig = useCallback((cfg) => {
    if (!cfg || !cfg.avatarUrl) return false;

    loadFullState({
      avatarUrl: cfg.avatarUrl,
      avatarId: cfg.avatarId,
      source: cfg.source || (cfg.avatarUrl.includes('readyplayer.me') ? 'rpm' : 'upload'),
      gender: cfg.avatarGender || cfg.gender || 'masculine',
      customization: {
        skinTone: '#C68642',
        eyeColor: '#4A90D9',
        hairColor: '#3B1F0A',
        isVisible: true,
        ...(cfg.customization || {}),
        ...(cfg.traits ? {
          skinTone: cfg.traits.skinTone,
          hairColor: cfg.traits.hairColor,
          eyeColor: cfg.traits.eyeColor,
        } : {}),
      },
      wearables: cfg.wearables || [],
      animations: cfg.customAnimations || [],
      environment: cfg.environment || null,
      currentRealm: cfg.currentRealm || null,
    });

    return true;
  }, [loadFullState]);

  return { saveAvatar, loadFromAsset, restoreFromConfig };
}