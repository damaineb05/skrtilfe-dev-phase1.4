/**
 * AvatarColorization
 * ─────────────────────────────────────────────────────────────
 * Material zone targeting for avatar customization.
 * Ensures skin color doesn't affect shoes, hair, etc.
 */

import * as THREE from 'three';

// Material zone identifiers
export const MaterialZones = Object.freeze({
  SKIN: 'skin',
  HAIR: 'hair',
  EYES: 'eyes',
  SHOES: 'shoes',
  CLOTHING_TOP: 'clothing_top',
  CLOTHING_BOTTOM: 'clothing_bottom',
  ACCESSORIES: 'accessories',
  WEARABLE: 'wearable',
});

// Hints for identifying materials by name patterns
const ZONE_HINTS = {
  [MaterialZones.SKIN]: ['skin', 'body', 'face', 'head', 'torso', 'arm', 'leg'],
  [MaterialZones.HAIR]: ['hair', 'scalp'],
  [MaterialZones.EYES]: ['eye', 'iris', 'pupil', 'sclera'],
  [MaterialZones.SHOES]: ['shoe', 'feet', 'foot', 'sole', 'boot'],
  [MaterialZones.CLOTHING_TOP]: ['shirt', 'top', 'chest', 'torso', 'jacket', 'coat'],
  [MaterialZones.CLOTHING_BOTTOM]: ['pants', 'bottom', 'legs', 'skirt', 'shorts'],
  [MaterialZones.ACCESSORIES]: ['accessory', 'hat', 'glasses', 'jewelry', 'belt', 'band'],
  [MaterialZones.WEARABLE]: ['wearable', 'attachment'],
};

/**
 * Build a material zone map for an avatar by traversing its Three.js hierarchy.
 * Identifies materials by name patterns and groups them by zone.
 *
 * @param {THREE.Object3D} avatarRoot
 * @returns {Object<string, THREE.Material[]>} zone → materials map
 */
export function buildMaterialZoneMap(avatarRoot) {
  const zones = {};
  
  // Initialize empty arrays for each zone
  Object.values(MaterialZones).forEach(zone => {
    zones[zone] = [];
  });

  if (!avatarRoot) return zones;

  // Traverse avatar and collect materials by zone
  avatarRoot.traverse((node) => {
    if (!node.isMesh) return;
    
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    const nodeName = (node.name || '').toLowerCase();
    
    for (const material of materials) {
      if (!material) continue;
      
      const materialName = (material.name || '').toLowerCase();
      const searchName = `${nodeName} ${materialName}`;
      
      // Find matching zone by name pattern
      let matched = false;
      for (const [zone, hints] of Object.entries(ZONE_HINTS)) {
        if (hints.some(hint => searchName.includes(hint))) {
          zones[zone].push(material);
          matched = true;
          break;
        }
      }
      
      // Default to accessories if no match
      if (!matched) {
        zones[MaterialZones.ACCESSORIES].push(material);
      }
    }
  });

  return zones;
}

/**
 * Apply a color to a specific avatar material zone.
 * @param {THREE.Object3D} avatarRoot
 * @param {string} zone — from MaterialZones
 * @param {string} color — hex #RRGGBB or CSS color name
 * @returns {boolean} — true if zone was found and colored
 */
export function applyColorToZone(avatarRoot, zone, color) {
  if (!avatarRoot || !zone || !color) return false;

  const zones = buildMaterialZoneMap(avatarRoot);
  const targetZone = zones[zone];

  if (!targetZone || targetZone.length === 0) {
    console.warn(`AvatarColorization: zone "${zone}" not found`);
    return false;
  }

  try {
    const threeColor = new THREE.Color(color);
    for (const material of targetZone) {
      if (material.color) {
        material.color.set(threeColor);
        material.needsUpdate = true;
      }
    }
    return true;
  } catch (err) {
    console.warn(`AvatarColorization: failed to apply color to zone "${zone}":`, err?.message);
    return false;
  }
}

/**
 * Get current color for a zone.
 * @param {THREE.Object3D} avatarRoot
 * @param {string} zone
 * @returns {string | null} hex color or null if zone not found
 */
export function getZoneColor(avatarRoot, zone) {
  if (!avatarRoot || !zone) return null;

  const zones = buildMaterialZoneMap(avatarRoot);
  const targetZone = zones[zone];

  if (!targetZone || targetZone.length === 0) {
    return null;
  }

  // Return first material's color
  return targetZone[0].color?.getHexString?.() || null;
}

/**
 * Apply multiple zone colors at once (e.g., from saved customization).
 * @param {THREE.Object3D} avatarRoot
 * @param {Object} colorsByZone — { zone: colorHex, ... }
 * @returns {boolean} — true if all colors applied successfully
 */
export function applyColorsByZone(avatarRoot, colorsByZone) {
  if (!avatarRoot || !colorsByZone) return false;

  let success = true;
  for (const [zone, color] of Object.entries(colorsByZone)) {
    if (color && !applyColorToZone(avatarRoot, zone, color)) {
      success = false;
    }
  }

  return success;
}