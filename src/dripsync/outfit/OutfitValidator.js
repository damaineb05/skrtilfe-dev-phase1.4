/**
 * OutfitValidator
 * ─────────────────────────────────────────────────────────────
 * Validates equip requests before any persistence occurs.
 * Pure logic — receives already-fetched data, returns a result object.
 * Does NOT touch Base44 directly.
 *
 * Result shape:
 * { ok: boolean, reason: string | null, message: string | null }
 */

/** @returns {{ ok: true, reason: null, message: null }} */
function pass() {
  return { ok: true, reason: null, message: null };
}

/** @returns {{ ok: false, reason: string, message: string }} */
function fail(reason, message) {
  return { ok: false, reason, message };
}

/**
 * Validate a full equip request.
 *
 * @param {{
 *   wearable:  object | null,   — fetched wearable record (normalized)
 *   ownership: object | null,   — fetched ownership record for this user+wearable
 * }} params
 * @returns {{ ok: boolean, reason: string | null, message: string | null }}
 */
export function validateEquipRequest({ wearable, ownership }) {
  // 1. Wearable must exist
  if (!wearable) {
    return fail('WEARABLE_NOT_FOUND', 'The wearable does not exist or has been removed.');
  }

  // 2. Wearable must have a slot
  if (!wearable.slot) {
    return fail('NO_SLOT', 'This wearable does not have a valid slot and cannot be equipped.');
  }

  // 3. Wearable must have a usable asset reference
  if (!wearable.modelUrl && !wearable.thumbnailUrl) {
    return fail('NO_ASSET', 'This wearable has no model or image reference and cannot be displayed.');
  }

  // 4. User must own the wearable
  if (!ownership) {
    return fail('NOT_OWNED', 'You do not own this wearable.');
  }

  if (!ownership.isActive) {
    return fail('OWNERSHIP_REVOKED', 'Your access to this wearable has been revoked.');
  }

  if (ownership.quantity <= 0) {
    return fail('OUT_OF_STOCK', 'You no longer have any copies of this wearable.');
  }

  return pass();
}

/**
 * Lightweight check used before unequip (no ownership needed).
 *
 * @param {{
 *   slot:           string | null,
 *   equippedBySlot: object,
 * }} params
 * @returns {{ ok: boolean, reason: string | null, message: string | null }}
 */
export function validateUnequipRequest({ slot, equippedBySlot }) {
  if (!slot) {
    return fail('NO_SLOT', 'A slot must be specified for unequip.');
  }

  if (!equippedBySlot[slot]) {
    return fail('SLOT_EMPTY', `Slot "${slot}" is already empty.`);
  }

  return pass();
}