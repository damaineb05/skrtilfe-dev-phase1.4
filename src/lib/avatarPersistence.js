/**
 * Avatar Persistence Adapter — the SINGLE secure frontend path between the
 * DripSync runtime state and User.avatar_config.
 *
 *   LOAD:  auth.me() → user.avatar_config → normalizeAvatarConfig() → runtime
 *   SAVE:  runtime → buildCanonicalConfig() → saveAvatarProfile() → user.avatar_config
 *
 * DripSync no longer writes avatar_config through base44.auth.updateMe.
 * The backend function is authoritative: it validates equipped catalog
 * wearable_ids against AssetOwnership before persisting.
 *
 * Responsibilities:
 *   - classify each runtime wearable as 'catalog' (real wearable_id) or
 *     'upload' (user GLB URL) — never inferring catalog ownership from a URL.
 *   - preserve presentation metadata (slot/bone/color) for renderer round-trip.
 *   - lifecycle protection so hydration does not trigger an unnecessary save,
 *     identical state does not re-save, only one save is in flight, stale save
 *     responses do not overwrite newer local state, and a rejected fingerprint
 *     does not retry every debounce.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { normalizeAvatarConfig, equippedToRuntimeWearables } from './avatarConfig';

const AVATAR_SCHEMA_VERSION = 2;
const DEFAULT_DEBOUNCE_MS = 3000;

// ── Runtime wearables (rich) → v2 equipped entries ─────────────────────────────
// A real Wearable entity id (explicit w.wearable_id) → 'catalog'. Anything else
// with a URL → 'upload'. Try-on previews and user GLBs carry no wearable_id, so
// they are uploads — ownership is not inferred from a URL.
export function runtimeWearablesToEquipped(wearables) {
  if (!Array.isArray(wearables)) return [];
  return wearables.map((w) => {
    if (!w || typeof w !== 'object') return null;
    // Preview-only wearables (Shop try-on / demo) must NEVER become canonical
    // equipped state through autosave. They carry no wearable_id and no
    // ownership; persisting them would leak a try-on into avatar_config.
    // Preview state is runtime-only — see the DripSync tryOn effect (fromShop).
    if (w.fromShop === true || w.isPreview === true || w.isDemo === true) return null;
    const wid = w.wearable_id || null; // explicit catalog reference only
    const url = w.url || w.model_url || w.modelUrl || null;
    if (!wid && !url) return null;
    const entry = { source: wid ? 'catalog' : 'upload' };
    if (wid) entry.wearable_id = String(wid);
    if (url) entry.model_url = url;
    if (w.name) entry.name = String(w.name);
    if (Array.isArray(w.position)) entry.position = w.position;
    if (Array.isArray(w.rotation)) entry.rotation = w.rotation;
    if (typeof w.scale === 'number') entry.scale = w.scale;
    if (w.slot || w.category) entry.slot = String(w.slot || w.category);
    if (w.bone) entry.bone = String(w.bone);
    if (w.color) entry.color = String(w.color);
    return entry;
  }).filter(Boolean);
}

// ── Full runtime state → canonical v2 config ──────────────────────────────────
export function buildCanonicalConfig(runtime) {
  const avatarSource = runtime.avatarSource || runtime.avatarUrl || null;
  const source =
    runtime.source ||
    (avatarSource && String(avatarSource).indexOf('readyplayer.me') !== -1 ? 'rpm' : 'upload');
  const customization = runtime.customization || {};
  return {
    schema_version: AVATAR_SCHEMA_VERSION,
    avatar: {
      id: runtime.avatarId || null,
      model_url: avatarSource,
      source,
      gender: runtime.gender || runtime.avatarGender || 'masculine',
    },
    customization: {
      skinTone: '#C68642',
      eyeColor: '#4A90D9',
      hairColor: '#3B1F0A',
      isVisible: true,
      ...customization,
      isVisible: customization.isVisible !== false,
    },
    equipped: runtimeWearablesToEquipped(runtime.wearables || []),
    custom_animations: (runtime.customAnimations || [])
      .filter((a) => a && a.url && a.name)
      .map((a) => ({ name: String(a.name), url: String(a.url) })),
    environment: runtime.environment ?? null,
    current_realm: runtime.currentRealm ?? null,
    updated_at: new Date().toISOString(),
  };
}

// ── Hydrate runtime state from user.avatar_config ─────────────────────────────
// wearablesById: Map<string, Wearable> for resolving catalog equipped refs into
// rich runtime wearables. Uploads resolve without it. Pass an empty Map when no
// Wearable catalog is loaded yet (current Phase C state).
export function hydrateRuntimeFromUserConfig(user, wearablesById) {
  const cfg = normalizeAvatarConfig(user?.avatar_config);
  if (!cfg) return null;
  const runtimeWearables = equippedToRuntimeWearables(cfg.equipped, wearablesById);
  return {
    avatarSource: cfg.avatar.model_url,
    avatarId: cfg.avatar.id,
    source: cfg.avatar.source,
    gender: cfg.avatar.gender,
    customization: cfg.customization,
    wearables: runtimeWearables,
    customAnimations: cfg.custom_animations,
    environment: cfg.environment,
    currentRealm: cfg.current_realm,
  };
}

// ── Stable fingerprint for dedup (excludes volatile updated_at) ──────────────
export function fingerprintConfig(config) {
  if (!config) return '';
  try {
    const c = { ...config };
    delete c.updated_at;
    return JSON.stringify(c);
  } catch {
    return '';
  }
}

// ── Persist through saveAvatarProfile (the ONE secure path) ──────────────────
// Returns { success, status, avatar_config?, error?, unauthorized_wearable_ids? }
export async function persistAvatarProfile(config, { onUserUpdate, onUnauthorized, onNetworkError } = {}) {
  try {
    const res = await base44.functions.invoke('saveAvatarProfile', { avatar_config: config });
    const data = res.data;
    if (data && data.success && data.avatar_config) {
      if (onUserUpdate) onUserUpdate(data.avatar_config);
      return { success: true, status: 200, avatar_config: data.avatar_config };
    }
    return { success: false, status: 200, error: (data && data.error) || 'Unknown response' };
  } catch (err) {
    const status = err?.response?.status;
    const body = err?.response?.data;
    if (status === 403 && body && Array.isArray(body.unauthorized_wearable_ids)) {
      if (onUnauthorized) onUnauthorized(body.unauthorized_wearable_ids);
      return { success: false, status: 403, unauthorized_wearable_ids: body.unauthorized_wearable_ids, error: body.error };
    }
    if (status === 401) {
      return { success: false, status: 401, error: (body && body.error) || 'Authentication required' };
    }
    if (onNetworkError) onNetworkError(err);
    return { success: false, status, error: (body && body.error) || (err && err.message) || 'Network error' };
  }
}

// ── Persistence lifecycle hook ────────────────────────────────────────────────
// Guards: hydration suppresses the post-load save; fingerprint dedup skips
// identical state; a rejected fingerprint is not retried until state changes;
// a single in-flight save; stale save responses do not overwrite newer state.
//
//   UNINITIALIZED → HYDRATING → READY → DIRTY → SAVING → READY
//
export function useAvatarProfilePersistence({
  enabled = true,
  getRuntimeState,
  stateFingerprint = '',
  autoSave = true,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  onUnauthorized,
  onUserUpdate,
}) {
  const hydratingRef = useRef(false);
  const lastPersistedFpRef = useRef('');
  const rejectedFpRef = useRef('');
  const inFlightRef = useRef(null);
  const timerRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  // Keep the latest getter + callbacks in refs so saveNow has a STABLE identity
  // (the debounce effect must not reset on unrelated re-renders like panel toggles).
  const getStateRef = useRef(getRuntimeState);
  getStateRef.current = getRuntimeState;
  const onUnauthorizedRef = useRef(onUnauthorized);
  onUnauthorizedRef.current = onUnauthorized;
  const onUserUpdateRef = useRef(onUserUpdate);
  onUserUpdateRef.current = onUserUpdate;

  // Mark the start of a hydration — suppresses autosave until endHydration flips it.
  const beginHydration = useCallback(() => {
    hydratingRef.current = true;
  }, []);

  // End hydration and seed the persisted fingerprint so the just-loaded state
  // is not immediately re-saved.
  const endHydration = useCallback((seedFingerprint) => {
    lastPersistedFpRef.current = seedFingerprint || '';
    rejectedFpRef.current = '';
    // flip after the current render batch so post-hydration effect runs skip
    queueMicrotask(() => { hydratingRef.current = false; });
  }, []);

  const saveNow = useCallback(async (opts = {}) => {
    const runtime = opts.runtime || (getStateRef.current && getStateRef.current());
    if (!runtime || !runtime.avatarSource) return { success: false, skipped: 'no-avatar' };
    const config = buildCanonicalConfig(runtime);
    const fp = fingerprintConfig(config);

    if (!opts.force) {
      if (fp === lastPersistedFpRef.current) return { success: true, skipped: 'identical' };
      // Do not retry a rejected fingerprint unchanged (prevents the 3s loop).
      if (!opts.retry && fp === rejectedFpRef.current) {
        return { success: false, skipped: 'rejected-unchanged', unauthorized: true };
      }
    }

    // If a save is already in flight for this fingerprint, await it.
    if (inFlightRef.current && inFlightRef.current.fp === fp) {
      return inFlightRef.current.promise;
    }

    setIsSaving(true);
    const sentFp = fp;
    const promise = (async () => {
      const res = await persistAvatarProfile(config, {
        onUserUpdate: (persistedCfg) => {
          // Stale guard: only apply if no newer local state superseded this save.
          const currentFp = fingerprintConfig(buildCanonicalConfig(getStateRef.current && getStateRef.current()));
          if (sentFp === currentFp && onUserUpdateRef.current) onUserUpdateRef.current(persistedCfg);
        },
        onUnauthorized: (ids) => {
          rejectedFpRef.current = sentFp;
          if (onUnauthorizedRef.current) onUnauthorizedRef.current(ids);
        },
      });
      inFlightRef.current = null;
      setIsSaving(false);
      if (res.success) {
        lastPersistedFpRef.current = sentFp;
        rejectedFpRef.current = '';
      } else if (res.status === 403) {
        rejectedFpRef.current = sentFp;
      }
      return res;
    })();
    inFlightRef.current = { fp, promise };
    return promise;
  }, []); // stable — reads everything via refs

  // Manual retry that forces through a previously-rejected state.
  const retrySave = useCallback(() => saveNow({ retry: true, force: true }), [saveNow]);

  // Debounced autosave — resets only when the avatar state fingerprint changes,
  // not on every render.
  useEffect(() => {
    if (!enabled || !autoSave) return;
    if (hydratingRef.current) return;
    if (!stateFingerprint) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { saveNow(); }, debounceMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [enabled, autoSave, debounceMs, saveNow, stateFingerprint]);

  // On unmount, cancel any pending timer (never update state after unmount).
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return { beginHydration, endHydration, saveNow, retrySave, isSaving };
}