import { base44 } from '@/api/base44Client';
import { normalizeAvatarConfig, equippedToRuntimeWearables } from '@/lib/avatarConfig';

/**
 * WorldAvatarAdapter — the ONLY bridge between the canonical avatar identity
 * (User.avatar_config) and the Three.js World runtime.
 *
 *   auth.me() → user.avatar_config → normalizeAvatarConfig() → WorldAvatarSpec
 *                                                              │
 *                                              AvatarManager.loadFromConfig()
 *
 * World never imports DripSync editor/UI modules. It consumes the SAME shared
 * canonical module (avatarConfig) as DripSync, so identity is byte-identical on
 * both sides. PlayerProfile stays responsible ONLY for level/xp/position; the
 * avatar's face/body/clothing come from User.avatar_config.
 *
 *   User.avatar_config  = how I look        ← THIS adapter reads this
 *   PlayerProfile       = where I am / what I've earned  (GameStateAdapter)
 */

/**
 * Build a World-consumable avatar spec from the authenticated user.
 * Fetches the Wearable catalog records needed to resolve `source:'catalog'`
 * equipped references into runtime wearables (the catalog — not a persisted
 * URL — is authoritative for catalog asset metadata).
 *
 * Returns null when no avatar_config is configured; AvatarManager then loads
 * the SKRTLIFE placeholder so the World NEVER fails to boot over identity.
 *
 * @param {object} user — authenticated SKRTLIFE user (from useAuth)
 * @returns {Promise<object|null>} WorldAvatarSpec
 *   { baseModelUrl, source, gender, customization, wearables[] }
 */
export async function buildWorldAvatarSpec(user) {
  const cfg = normalizeAvatarConfig(user?.avatar_config);
  if (!cfg) return null;

  const baseUrl = cfg.avatar?.model_url || null;

  // Resolve catalog equipped refs → runtime wearables. Uploads resolve without
  // a catalog fetch (they carry their own model_url).
  const catalogIds = (cfg.equipped || [])
    .filter((e) => e.source === 'catalog' && e.wearable_id)
    .map((e) => String(e.wearable_id));
  const wearablesById = await fetchWearablesById(catalogIds);
  const wearables = equippedToRuntimeWearables(cfg.equipped, wearablesById);

  return {
    baseModelUrl: baseUrl,
    source: cfg.avatar?.source || null,
    gender: cfg.avatar?.gender || 'masculine',
    customization: cfg.customization || null,
    wearables,
  };
}

/**
 * Fetch Wearable records by id, returning a Map keyed by string id.
 * A missing/unreadable Wearable resolves to nothing (the runtime resolver
 * skips it) — one deleted catalog item never crashes the World.
 */
export async function fetchWearablesById(ids) {
  const map = new Map();
  if (!ids || ids.length === 0) return map;
  const uniq = Array.from(new Set(ids));
  const results = await Promise.all(
    uniq.map((id) =>
      base44.entities.Wearable.get(id)
        .then((w) => ({ id, w }))
        .catch(() => ({ id, w: null }))
    )
  );
  for (const { id, w } of results) if (w) map.set(String(id), w);
  return map;
}

/**
 * Stable fingerprint of the avatar identity for hot-refresh dedup. Excludes
 * the volatile `updated_at` timestamp so two configs that only differ by save
 * time are treated as the same identity (no redundant reload).
 */
export function avatarConfigFingerprint(user) {
  const cfg = user?.avatar_config;
  if (!cfg) return '';
  const c = { ...cfg };
  delete c.updated_at;
  try {
    return JSON.stringify(c);
  } catch {
    return '';
  }
}