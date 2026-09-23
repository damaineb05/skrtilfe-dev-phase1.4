/**
 * InventoryHydrator
 * ─────────────────────────────────────────────────────────────
 * Takes processed ownership records + fetched wearable records,
 * joins them, and returns a stable list of hydrated closet items.
 * Gracefully skips orphaned ownership records (deleted wearables).
 * Does NOT touch Base44 directly.
 */

/**
 * Final normalized closet item shape:
 * {
 *   wearableId:   string,
 *   name:         string,
 *   slot:         string | null,     // 'top' | 'bottom' | 'shoes' | etc.
 *   modelUrl:     string | null,
 *   thumbnailUrl: string | null,
 *   rarity:       string | null,     // 'common' | 'rare' | 'legendary' | etc.
 *   ownership:    object,            // normalized ownership record
 *   isEquipped:   boolean,           // populated by caller with loadout context
 *   quantity:     number,
 * }
 */

/**
 * Normalize a raw Wearable entity record into a stable internal shape.
 * @param {object} raw
 * @returns {object}
 */
function normalizeWearable(raw) {
  return {
    id:           raw.id,
    name:         raw.name         || raw.title     || 'Unnamed Wearable',
    slot:         raw.slot         || raw.wearable_slot || null,
    modelUrl:     raw.model_url    || raw.asset_url  || raw.glb_url || null,
    thumbnailUrl: raw.thumbnail_url || raw.image_url || raw.preview_url || null,
    rarity:       raw.rarity       || raw.rarity_tier || null,
    tags:         raw.tags         || [],
    raw,
  };
}

/**
 * Hydrate a list of closet items by joining ownership records to wearable records.
 *
 * @param {object[]} processedOwnerships  — output of OwnershipService.processOwnerships()
 * @param {object[]} rawWearables         — raw Wearable entity records from repository
 * @param {object}   equippedBySlot       — optional { [slot]: { assetId } } from current loadout
 * @returns {object[]}  hydrated closet items
 */
export function hydrateClosetItems(processedOwnerships, rawWearables, equippedBySlot = {}) {
  if (!processedOwnerships || processedOwnerships.length === 0) return [];

  // Build a fast lookup map: wearableId → normalized wearable
  const wearableMap = new Map();
  for (const raw of (rawWearables || [])) {
    if (raw?.id) {
      wearableMap.set(raw.id, normalizeWearable(raw));
    }
  }

  // Build set of equipped asset IDs for O(1) lookup
  const equippedIds = new Set(
    Object.values(equippedBySlot)
      .map(w => w?.assetId)
      .filter(Boolean)
  );

  const items = [];

  for (const ownership of processedOwnerships) {
    const wearable = wearableMap.get(ownership.wearableId);

    // Skip orphaned ownerships (wearable was deleted from catalog)
    if (!wearable) continue;

    items.push({
      wearableId:   wearable.id,
      name:         wearable.name,
      slot:         wearable.slot,
      modelUrl:     wearable.modelUrl,
      thumbnailUrl: wearable.thumbnailUrl,
      rarity:       wearable.rarity,
      tags:         wearable.tags,
      ownership,
      isEquipped:   equippedIds.has(wearable.id),
      quantity:     ownership.quantity,
    });
  }

  return items;
}