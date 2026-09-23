/**
 * WearableConflictResolver
 * ─────────────────────────────────────────────────────────────
 * Defines which wearable slots conflict with each other and
 * provides helpers to resolve those conflicts before equipping.
 * Pure logic — no Base44 access, no store access.
 */

/**
 * Slot conflict map.
 * Key: the slot being equipped.
 * Value: array of slots that must be unequipped first.
 *
 * Extend this map as new slot types are introduced.
 */
const SLOT_CONFLICTS = {
  full_body:  ['top', 'bottom', 'torso', 'legs'],
  top:        ['full_body', 'torso'],
  torso:      ['full_body', 'top'],
  bottom:     ['full_body', 'legs'],
  legs:       ['full_body', 'bottom'],
  shoes:      [],
  headwear:   [],
  accessory:  [],
  gloves:     [],
  eyewear:    [],
  jewelry:    [],
  bag:        [],
};

/**
 * Return the list of slots that must be unequipped
 * when equipping into `slot`.
 *
 * @param {string} slot
 * @returns {string[]}
 */
export function getConflictingSlots(slot) {
  return SLOT_CONFLICTS[slot] ?? [];
}

/**
 * Given the current loadout and a target slot, return the set of
 * currently-equipped wearable records that must be removed.
 *
 * @param {object} equippedBySlot  — current loadout map { [slot]: EquippedSnapshot }
 * @param {string} targetSlot      — slot being equipped
 * @returns {{ slot: string, record: object }[]}
 */
export function getWearablesToUnequip(equippedBySlot, targetSlot) {
  const conflicting = getConflictingSlots(targetSlot);
  const toUnequip = [];

  // Always unequip whatever is currently in the target slot itself
  if (equippedBySlot[targetSlot]) {
    toUnequip.push({ slot: targetSlot, record: equippedBySlot[targetSlot] });
  }

  // Then unequip any conflicting slots
  for (const slot of conflicting) {
    if (equippedBySlot[slot] && slot !== targetSlot) {
      toUnequip.push({ slot, record: equippedBySlot[slot] });
    }
  }

  return toUnequip;
}