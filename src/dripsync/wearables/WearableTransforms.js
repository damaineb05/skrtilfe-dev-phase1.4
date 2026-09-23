/**
 * WearableTransforms
 * ─────────────────────────────────────────────────────────────
 * Pure helpers for wearable transform resolution.
 * No Three.js dependency — works with plain arrays/numbers only.
 *
 * Wearable metadata fields (from Product entity):
 *   wearable_position  [x, y, z]   default [0,0,0]
 *   wearable_rotation  [x, y, z]   in radians, default [0,0,0]
 *   wearable_scale     number       default 1
 *   wearable_bone      string       e.g. "Hips", "Head", "Spine"
 */

// ── Sentinel / defaults ───────────────────────────────────────

const DEFAULT_POSITION = [0, 0, 0];
const DEFAULT_ROTATION = [0, 0, 0];
const DEFAULT_SCALE    = 1;

/**
 * Fully-resolved wearable transform.
 * @typedef {{
 *   position: [number, number, number],
 *   rotation: [number, number, number],
 *   scale:    number,
 *   bone:     string | null,
 * }} WearableTransform
 */

// ── Normalization helpers ─────────────────────────────────────

/**
 * Normalize a raw [x, y, z] value into a clean 3-tuple.
 * @param {any} raw
 * @param {[number, number, number]} fallback
 * @returns {[number, number, number]}
 */
function normalizeVec3(raw, fallback) {
  if (Array.isArray(raw) && raw.length >= 3) {
    return [
      typeof raw[0] === 'number' && isFinite(raw[0]) ? raw[0] : fallback[0],
      typeof raw[1] === 'number' && isFinite(raw[1]) ? raw[1] : fallback[1],
      typeof raw[2] === 'number' && isFinite(raw[2]) ? raw[2] : fallback[2],
    ];
  }
  return [...fallback];
}

/**
 * Normalize a raw scale value.
 * @param {any} raw
 * @returns {number}
 */
function normalizeScale(raw) {
  if (typeof raw === 'number' && isFinite(raw) && raw > 0) return raw;
  return DEFAULT_SCALE;
}

// ── Public API ────────────────────────────────────────────────

/**
 * Extract and normalize the default transform from wearable metadata
 * (as stored on the Product / Wearable entity record).
 *
 * Reads: wearable_position, wearable_rotation, wearable_scale, wearable_bone
 *
 * @param {object} wearableMeta — raw wearable/product record
 * @returns {WearableTransform}
 */
export function normalizeDefaultTransform(wearableMeta) {
  if (!wearableMeta || typeof wearableMeta !== 'object') {
    return {
      position: [...DEFAULT_POSITION],
      rotation: [...DEFAULT_ROTATION],
      scale:    DEFAULT_SCALE,
      bone:     null,
    };
  }

  return {
    position: normalizeVec3(wearableMeta.wearable_position ?? wearableMeta.position, DEFAULT_POSITION),
    rotation: normalizeVec3(wearableMeta.wearable_rotation ?? wearableMeta.rotation, DEFAULT_ROTATION),
    scale:    normalizeScale(wearableMeta.wearable_scale    ?? wearableMeta.scale),
    bone:     typeof wearableMeta.wearable_bone === 'string' && wearableMeta.wearable_bone.trim()
                ? wearableMeta.wearable_bone.trim()
                : null,
  };
}

/**
 * Normalize a runtime transform override provided by the caller
 * (e.g. from a slot-level user customization or binding profile).
 * All fields are optional — missing values are left as undefined
 * so the merge step can fall back to defaults cleanly.
 *
 * @param {object | null | undefined} override
 * @returns {Partial<WearableTransform>}
 */
export function normalizeTransformOverride(override) {
  if (!override || typeof override !== 'object') return {};

  const out = {};

  if (Array.isArray(override.position) && override.position.length >= 3) {
    out.position = normalizeVec3(override.position, DEFAULT_POSITION);
  }
  if (Array.isArray(override.rotation) && override.rotation.length >= 3) {
    out.rotation = normalizeVec3(override.rotation, DEFAULT_ROTATION);
  }
  if (typeof override.scale === 'number' && isFinite(override.scale) && override.scale > 0) {
    out.scale = override.scale;
  }
  if (typeof override.bone === 'string' && override.bone.trim()) {
    out.bone = override.bone.trim();
  }

  return out;
}

/**
 * Merge a default transform with a (possibly partial) runtime override.
 * Override values always win; missing override keys fall back to defaults.
 *
 * @param {WearableTransform}           defaultTransform
 * @param {Partial<WearableTransform>}  override
 * @returns {WearableTransform}
 */
export function mergeTransforms(defaultTransform, override) {
  const base = defaultTransform || {
    position: [...DEFAULT_POSITION],
    rotation: [...DEFAULT_ROTATION],
    scale:    DEFAULT_SCALE,
    bone:     null,
  };
  const over = override || {};

  return {
    position: over.position ?? base.position,
    rotation: over.rotation ?? base.rotation,
    scale:    over.scale    ?? base.scale,
    bone:     over.bone     ?? base.bone,
  };
}

/**
 * Convenience: go from raw wearable metadata + optional runtime override
 * straight to a fully-resolved transform, in one call.
 *
 * @param {object}                       wearableMeta
 * @param {Partial<WearableTransform>=}  override
 * @returns {WearableTransform}
 */
export function resolveTransform(wearableMeta, override) {
  const defaultTransform = normalizeDefaultTransform(wearableMeta);
  const normalizedOverride = normalizeTransformOverride(override);
  return mergeTransforms(defaultTransform, normalizedOverride);
}

export default {
  normalizeDefaultTransform,
  normalizeTransformOverride,
  mergeTransforms,
  resolveTransform,
};