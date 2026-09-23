/**
 * LoadoutSerializer
 * ─────────────────────────────────────────────────────────────
 * Normalizes raw AvatarWearables repository records into the
 * stable `equippedBySlot` map used by the engine and store.
 * Pure logic — no Base44 access, no store access.
 *
 * Final equippedBySlot shape:
 * {
 *   [slot: string]: {
 *     wearableId:      string,
 *     slot:            string,
 *     name:            string,
 *     modelUrl:        string | null,
 *     thumbnailUrl:    string | null,
 *     equippedRecordId: string,      — AvatarWearables entity record id
 *     equippedAt:      string | null,
 *   }
 * }
 */

/**
 * Normalize a single raw AvatarWearables record into an equipped snapshot.
 * Returns null for corrupted or incomplete records so callers can skip them.
 *
 * @param {object} raw — raw AvatarWearables entity record
 * @returns {object | null}
 */
export function normalizeEquippedRecord(raw) {
  if (!raw) return null;

  const slot      = raw.slot || raw.wearable_slot || null;
  const wearableId = raw.asset_id || raw.wearable_id || null;

  // A record without both slot and wearableId is unusable
  if (!slot || !wearableId) return null;

  return {
    wearableId,
    slot,
    name:             raw.name        || raw.asset_name || 'Equipped Item',
    modelUrl:         raw.model_url   || raw.asset_url  || null,
    thumbnailUrl:     raw.thumbnail_url || raw.image_url || null,
    equippedRecordId: raw.id,
    equippedAt:       raw.created_date || raw.updated_date || null,
  };
}

/**
 * Serialize an array of raw AvatarWearables records into the equippedBySlot map.
 * Skips corrupted/incomplete records silently.
 * When duplicates exist for the same slot, most recently equipped wins.
 *
 * @param {object[]} rawRecords — raw AvatarWearables records from repository
 * @returns {object}  equippedBySlot map
 */
export function serializeLoadout(rawRecords) {
  if (!rawRecords || rawRecords.length === 0) return {};

  const equippedBySlot = {};

  for (const raw of rawRecords) {
    const snapshot = normalizeEquippedRecord(raw);
    if (!snapshot) continue;

    const existing = equippedBySlot[snapshot.slot];
    if (!existing) {
      equippedBySlot[snapshot.slot] = snapshot;
      continue;
    }

    // Prefer most recently equipped on duplicate slots
    const existingTs = existing.equippedAt ? new Date(existing.equippedAt).getTime() : 0;
    const currentTs  = snapshot.equippedAt ? new Date(snapshot.equippedAt).getTime() : 0;
    if (currentTs > existingTs) {
      equippedBySlot[snapshot.slot] = snapshot;
    }
  }

  return equippedBySlot;
}

/**
 * Apply a single equip update to an existing equippedBySlot map.
 * Returns a new map (immutable update).
 *
 * @param {object} equippedBySlot
 * @param {string} slot
 * @param {object} snapshot  — normalized equipped snapshot
 * @returns {object}
 */
export function applyEquip(equippedBySlot, slot, snapshot) {
  return { ...equippedBySlot, [slot]: snapshot };
}

/**
 * Apply a single unequip update to an existing equippedBySlot map.
 * Returns a new map without that slot (immutable update).
 *
 * @param {object} equippedBySlot
 * @param {string} slot
 * @returns {object}
 */
export function applyUnequip(equippedBySlot, slot) {
  const next = { ...equippedBySlot };
  delete next[slot];
  return next;
}