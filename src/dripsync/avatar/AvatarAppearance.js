/**
 * AvatarAppearance
 * ─────────────────────────────────────────────────────────────
 * Pure helpers for normalizing and applying avatar appearance config.
 *
 * Design goals:
 *   - Never crash on partial / missing data
 *   - Keep application logic separate from loading logic
 *   - Act as extension point for future skin/hair/eye material tweaks
 *
 * Supported appearance fields:
 *   - skinTone      (string hex or preset name)
 *   - hairColor     (string hex)
 *   - eyeColor      (string hex)
 *   - shoeColor     (string hex)
 *   - topColor      (string hex)
 *   - bottomColor   (string hex)
 *   - accessoryColor (string hex)
 *   - bodyScale     (number, multiplier)
 *   - heightScale   (number, multiplier)
 */

import { MaterialZones, applyColorToZone } from './AvatarColorization.js';

/**
 * Canonical appearance schema — all fields optional.
 * @typedef {{
 *   skinTone?:      string | null,
 *   hairColor?:     string | null,
 *   eyeColor?:      string | null,
 *   shoeColor?:     string | null,
 *   topColor?:      string | null,
 *   bottomColor?:   string | null,
 *   accessoryColor?: string | null,
 *   bodyScale?:     number | null,
 *   heightScale?:   number | null,
 * }} AppearanceConfig
 */

/** Known material name fragments that map to skin mesh regions */
const SKIN_MATERIAL_HINTS  = ['skin', 'body', 'face', 'head'];
/** Known material name fragments for hair */
const HAIR_MATERIAL_HINTS  = ['hair'];
/** Known material name fragments for eyes */
const EYE_MATERIAL_HINTS   = ['eye', 'iris'];

/**
 * Normalize raw appearance data from any source (avatar record,
 * preset config, UI form output) into a canonical AppearanceConfig.
 *
 * @param {object | null | undefined} raw
 * @returns {AppearanceConfig}
 */
export function normalizeAppearanceConfig(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      skinTone: null, hairColor: null, eyeColor: null,
      shoeColor: null, topColor: null, bottomColor: null, accessoryColor: null,
      bodyScale: null, heightScale: null
    };
  }

  return {
    skinTone:       _safeString(raw.skinTone      ?? raw.skin_tone      ?? raw.skin),
    hairColor:      _safeString(raw.hairColor     ?? raw.hair_color     ?? raw.hair),
    eyeColor:       _safeString(raw.eyeColor      ?? raw.eye_color      ?? raw.eyes),
    shoeColor:      _safeString(raw.shoeColor     ?? raw.shoe_color     ?? raw.shoes),
    topColor:       _safeString(raw.topColor      ?? raw.top_color      ?? raw.top),
    bottomColor:    _safeString(raw.bottomColor   ?? raw.bottom_color   ?? raw.bottom),
    accessoryColor: _safeString(raw.accessoryColor ?? raw.accessory_color ?? raw.accessory),
    bodyScale:      _safeNumber(raw.bodyScale     ?? raw.body_scale),
    heightScale:    _safeNumber(raw.heightScale   ?? raw.height_scale   ?? raw.height),
  };
}

/**
 * Apply a normalized AppearanceConfig to a loaded Three.js root object.
 * Safe to call with null root or empty config — will silently no-op.
 *
 * Each application is a best-effort:
 *   - Only applies fields present in the config
 *   - Logs unsupported fields; never throws
 *
 * @param {THREE.Object3D | null} root
 * @param {AppearanceConfig}      config
 */
export function applyAppearanceToRuntime(root, config) {
  if (!root) return;
  if (!config || typeof config !== 'object') return;

  const { skinTone, hairColor, eyeColor, shoeColor, topColor, bottomColor, accessoryColor, bodyScale, heightScale } = config;

  try {
    // Use zone-based color application for precision
    if (skinTone)       applyColorToZone(root, MaterialZones.SKIN, skinTone);
    if (hairColor)      applyColorToZone(root, MaterialZones.HAIR, hairColor);
    if (eyeColor)       applyColorToZone(root, MaterialZones.EYES, eyeColor);
    if (shoeColor)      applyColorToZone(root, MaterialZones.SHOES, shoeColor);
    if (topColor)       applyColorToZone(root, MaterialZones.CLOTHING_TOP, topColor);
    if (bottomColor)    applyColorToZone(root, MaterialZones.CLOTHING_BOTTOM, bottomColor);
    if (accessoryColor) applyColorToZone(root, MaterialZones.ACCESSORIES, accessoryColor);
  } catch (err) {
    console.warn('AvatarAppearance: material application failed (non-fatal):', err?.message);
  }

  try {
    if (bodyScale != null || heightScale != null) {
      _applyScale(root, bodyScale, heightScale);
    }
  } catch (err) {
    console.warn('AvatarAppearance: scale application failed (non-fatal):', err?.message);
  }
}

// ── Private helpers ──────────────────────────────────────────

/**
 * Traverse root and colorize materials whose name matches any hint.
 * @param {THREE.Object3D} root
 * @param {string}         hexColor
 * @param {string[]}       hints
 */
function _applyColorToMeshes(root, hexColor, hints) {
  const color = _parseHex(hexColor);
  if (!color) return;

  root.traverse((node) => {
    if (!node.isMesh) return;
    const mats = Array.isArray(node.material) ? node.material : [node.material];
    for (const mat of mats) {
      if (!mat) continue;
      const name = (mat.name || '').toLowerCase();
      const matchesHint = hints.some(h => name.includes(h));
      if (matchesHint && mat.color) {
        mat.color.set(color);
      }
    }
  });
}

/**
 * Apply body/height scale to the root object.
 * bodyScale   → uniform XZ scale (width/depth)
 * heightScale → Y scale
 * If only one is provided, the other is unchanged.
 */
function _applyScale(root, bodyScale, heightScale) {
  if (bodyScale != null && bodyScale > 0) {
    root.scale.x = bodyScale;
    root.scale.z = bodyScale;
  }
  if (heightScale != null && heightScale > 0) {
    root.scale.y = heightScale;
  }
}

function _safeString(val) {
  if (typeof val === 'string' && val.trim()) return val.trim();
  return null;
}

function _safeNumber(val) {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

/**
 * Accept #rrggbb, #rgb, or a CSS color name.
 * Returns a value Three.js Color.set() can consume, or null if empty.
 */
function _parseHex(value) {
  if (!value || typeof value !== 'string') return null;
  return value.trim() || null;
}

export default { normalizeAppearanceConfig, applyAppearanceToRuntime };