/**
 * OutfitSerializer
 * ─────────────────────────────────────────────────────────────
 * Pure helpers for converting between in-memory loadout state
 * and a compact, DB-ready preset payload.
 *
 * No side effects. No API calls.
 */

/**
 * Preset slot entry shape (stored inside OutfitPreset.slots):
 * {
 *   wearableId:   string,
 *   slot:         string,
 *   name?:        string,   // display-only, not authoritative
 *   thumbnailUrl?: string,  // display-only
 * }
 */

/**
 * Serialize an equippedBySlot loadout map into a preset payload
 * ready to be persisted via the repository.
 *
 * @param {object} equippedBySlot  — { [slot]: { wearableId, slot, name, … } }
 * @param {{ avatarId: string, name: string }} options
 * @returns {{ avatarId: string, name: string, slots: object, item_count: number }}
 */
export function serializeLoadoutToPreset(equippedBySlot, { avatarId, name }) {
  if (!equippedBySlot || typeof equippedBySlot !== 'object') {
    throw new Error('serializeLoadoutToPreset: equippedBySlot must be an object');
  }
  if (!avatarId) throw new Error('serializeLoadoutToPreset: avatarId is required');
  if (!name || !name.trim()) throw new Error('serializeLoadoutToPreset: name is required');

  const slots = {};

  for (const [slot, record] of Object.entries(equippedBySlot)) {
    if (!record?.wearableId) continue; // skip empty or corrupt slots

    slots[slot] = {
      wearableId:    record.wearableId,
      slot,
      // Preserve display metadata for UI — not authoritative for apply logic
      name:          record.name         || null,
      thumbnailUrl:  record.thumbnailUrl || null,
    };
  }

  return {
    avatar_id:  avatarId,
    name:       name.trim(),
    slots,
    item_count: Object.keys(slots).length,
  };
}

/**
 * Deserialize a raw OutfitPreset entity record back into a
 * normalized slots map: { [slot]: { wearableId, slot, … } }
 *
 * Tolerant of both old and new persistence shapes.
 *
 * @param {object} presetRecord — raw DB record
 * @returns {{ [slot]: { wearableId: string, slot: string, name?: string, thumbnailUrl?: string } }}
 */
export function deserializePresetSlots(presetRecord) {
  if (!presetRecord) return {};

  const raw = presetRecord.slots || presetRecord.outfit_slots || presetRecord.items || {};

  // If stored as an array (legacy), index by slot
  if (Array.isArray(raw)) {
    const result = {};
    for (const entry of raw) {
      const slot = entry.slot || entry.wearable_slot;
      const wearableId = entry.wearableId || entry.wearable_id || entry.asset_id;
      if (slot && wearableId) {
        result[slot] = {
          wearableId,
          slot,
          name:         entry.name         || null,
          thumbnailUrl: entry.thumbnailUrl  || entry.thumbnail_url || null,
        };
      }
    }
    return result;
  }

  // Object form (canonical)
  const result = {};
  for (const [slot, entry] of Object.entries(raw)) {
    const wearableId = entry?.wearableId || entry?.wearable_id || entry?.asset_id;
    if (!wearableId) continue;
    result[slot] = {
      wearableId,
      slot,
      name:         entry.name         || null,
      thumbnailUrl: entry.thumbnailUrl  || entry.thumbnail_url || null,
    };
  }
  return result;
}

/**
 * Extract an ordered list of { slot, wearableId } pairs from a preset
 * for iteration-safe equip ordering.
 *
 * @param {object} slotsMap — output of deserializePresetSlots
 * @returns {Array<{ slot: string, wearableId: string }>}
 */
export function getPresetSlotEntries(slotsMap) {
  return Object.values(slotsMap)
    .filter(e => e?.slot && e?.wearableId)
    .map(({ slot, wearableId }) => ({ slot, wearableId }));
}

/**
 * Validate that a preset payload has the minimum required fields.
 * Returns { ok, reason }.
 *
 * @param {any} presetRecord
 * @returns {{ ok: boolean, reason?: string }}
 */
export function assertPresetShape(presetRecord) {
  if (!presetRecord || typeof presetRecord !== 'object') {
    return { ok: false, reason: 'Preset record is null or not an object.' };
  }
  if (!presetRecord.id) {
    return { ok: false, reason: 'Preset record is missing an id.' };
  }
  const slots = deserializePresetSlots(presetRecord);
  if (Object.keys(slots).length === 0) {
    return { ok: false, reason: 'Preset contains no valid slot entries.' };
  }
  return { ok: true };
}