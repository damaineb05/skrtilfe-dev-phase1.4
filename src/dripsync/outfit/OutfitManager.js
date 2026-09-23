/**
 * OutfitManager
 * ─────────────────────────────────────────────────────────────
 * Orchestration layer for outfit preset save, validation, and
 * safe atomic application with rollback support.
 *
 * All DB access goes through DripSyncRepository.
 * No UI, no mesh binding, no 3D scene logic here.
 */

import {
  serializeLoadoutToPreset,
  deserializePresetSlots,
  getPresetSlotEntries,
  assertPresetShape,
} from './OutfitSerializer.js';

import {
  captureCurrentLoadoutSnapshot,
  restorePreviousLoadout,
} from './OutfitRollback.js';

import { equipWearableToAvatar, unequipSlotFromAvatar } from './LoadoutService.js';

// ── KNOWN VALID SLOTS ─────────────────────────────────────────
const VALID_SLOTS = new Set([
  'top', 'bottom', 'shoes', 'headwear', 'accessory',
  'full_body', 'gloves', 'eyewear', 'jewelry', 'bag',
]);

// ── SAVE ──────────────────────────────────────────────────────

/**
 * Serialize and persist the current loadout as a named preset.
 *
 * @param {{
 *   repository:     object,
 *   avatarId:       string,
 *   userId:         string,
 *   name:           string,
 *   currentLoadout: object,  — equippedBySlot
 * }}
 * @returns {Promise<{ ok: boolean, preset?: object, message?: string }>}
 */
export async function saveOutfitPreset({
  repository,
  avatarId,
  userId,
  name,
  currentLoadout,
}) {
  if (!avatarId) return { ok: false, message: 'No active avatar.' };
  if (!name?.trim()) return { ok: false, message: 'Preset name is required.' };

  const equippedBySlot = currentLoadout?.equippedBySlot || currentLoadout || {};

  if (Object.keys(equippedBySlot).length === 0) {
    return { ok: false, message: 'Cannot save an empty outfit — equip at least one item first.' };
  }

  const payload = serializeLoadoutToPreset(equippedBySlot, { avatarId, name });
  const preset  = await repository.saveOutfitPreset({ ...payload, user_id: userId });

  return { ok: true, preset };
}

// ── VALIDATE ─────────────────────────────────────────────────

/**
 * Validate that a preset can safely be applied.
 *
 * Checks:
 *  - preset structure is valid
 *  - each referenced wearable still exists in the catalog
 *  - user still owns each required wearable
 *  - slot names are recognised
 *
 * @param {{
 *   repository:   object,
 *   userId:       string,
 *   avatarId:     string,
 *   presetRecord: object,
 *   ownerships:   object[],  — processed ownership records from closet
 * }}
 * @returns {Promise<{
 *   ok:                boolean,
 *   message:           string,
 *   missingWearables:  string[],
 *   unownedWearables:  string[],
 *   invalidSlots:      string[],
 * }>}
 */
export async function validateOutfitPreset({
  repository,
  userId,
  avatarId,
  presetRecord,
  ownerships = [],
}) {
  const shapeCheck = assertPresetShape(presetRecord);
  if (!shapeCheck.ok) {
    return {
      ok: false,
      message: shapeCheck.reason,
      missingWearables:  [],
      unownedWearables:  [],
      invalidSlots:      [],
    };
  }

  const slots           = deserializePresetSlots(presetRecord);
  const entries         = getPresetSlotEntries(slots);
  const ownedIds        = new Set(ownerships.map(o => o.wearableId).filter(Boolean));

  const missingWearables = [];
  const unownedWearables = [];
  const invalidSlots     = [];

  for (const { slot, wearableId } of entries) {
    // Slot validity
    if (!VALID_SLOTS.has(slot)) {
      invalidSlots.push(slot);
    }

    // Existence check
    const wearable = await repository.getWearableById(wearableId);
    if (!wearable) {
      missingWearables.push(wearableId);
      continue;
    }

    // Ownership check — check in-memory ownerships first, then fall back to DB
    const owned = ownedIds.has(wearableId) ||
      !!(await repository.getOwnershipByUserAndWearable(userId, wearableId));
    if (!owned) {
      unownedWearables.push(wearableId);
    }
  }

  const ok = missingWearables.length === 0 &&
             unownedWearables.length  === 0 &&
             invalidSlots.length      === 0;

  const parts = [];
  if (missingWearables.length)  parts.push(`${missingWearables.length} wearable(s) no longer exist`);
  if (unownedWearables.length)  parts.push(`${unownedWearables.length} wearable(s) no longer owned`);
  if (invalidSlots.length)      parts.push(`${invalidSlots.length} invalid slot(s): ${invalidSlots.join(', ')}`);

  return {
    ok,
    message: ok ? 'Preset is valid.' : `Cannot apply preset: ${parts.join('; ')}.`,
    missingWearables,
    unownedWearables,
    invalidSlots,
  };
}

// ── APPLY ─────────────────────────────────────────────────────

/**
 * Apply an outfit preset to an avatar atomically.
 *
 * Flow:
 *  1. Capture rollback snapshot.
 *  2. Validate preset.
 *  3. Unequip slots that are occupied but NOT in the target preset.
 *  4. Equip each required slot from the preset.
 *  5. On any failure → attempt rollback → return structured failure.
 *
 * @param {{
 *   repository:     object,
 *   avatarId:       string,
 *   userId:         string,
 *   presetRecord:   object,
 *   currentLoadout: object,  — equippedBySlot
 *   ownerships:     object[],
 * }}
 * @returns {Promise<{
 *   success:                boolean,
 *   applied:                string[],   — slot names successfully equipped
 *   failed:                 string[],   — slot names that errored
 *   restored_previous_state: boolean,
 *   equippedBySlot:         object,
 *   message:                string,
 * }>}
 */
export async function applyOutfitPreset({
  repository,
  avatarId,
  userId,
  presetRecord,
  currentLoadout,
  ownerships = [],
}) {
  const equippedBySlot = currentLoadout?.equippedBySlot || currentLoadout || {};

  // 1. Capture rollback snapshot
  const snapshot = captureCurrentLoadoutSnapshot({ equippedBySlot });

  // 2. Validate before touching anything
  const validation = await validateOutfitPreset({
    repository, userId, avatarId, presetRecord, ownerships,
  });

  if (!validation.ok) {
    return {
      success:                 false,
      applied:                 [],
      failed:                  [],
      restored_previous_state: false,
      equippedBySlot,
      message: validation.message,
    };
  }

  const targetSlots    = deserializePresetSlots(presetRecord);
  const targetSlotKeys = new Set(Object.keys(targetSlots));

  let workingLoadout = { ...equippedBySlot };
  const applied = [];
  const failed  = [];

  // 3. Unequip slots not needed in the target preset
  const slotsToRemove = Object.keys(workingLoadout).filter(s => !targetSlotKeys.has(s));
  for (const slot of slotsToRemove) {
    try {
      const result = await unequipSlotFromAvatar({
        repository,
        userId,
        avatarId,
        slot,
        currentLoadout: workingLoadout,
      });
      if (result.ok) {
        workingLoadout = result.equippedBySlot;
      }
    } catch (_) {
      // Non-critical: slot may already be empty
    }
  }

  // 4. Equip each preset slot
  for (const [slot, entry] of Object.entries(targetSlots)) {
    try {
      const result = await equipWearableToAvatar({
        repository,
        userId,
        avatarId,
        wearableId:     entry.wearableId,
        ownerships,
        currentLoadout: workingLoadout,
      });

      if (result.ok) {
        workingLoadout = result.equippedBySlot;
        applied.push(slot);
      } else {
        failed.push(slot);
      }
    } catch (err) {
      failed.push(slot);
    }
  }

  // 5. Rollback if anything failed
  if (failed.length > 0) {
    let restored = false;
    try {
      const rollback = await restorePreviousLoadout({
        repository,
        userId,
        avatarId,
        previousLoadout: snapshot.equippedBySlot,
        currentLoadout:  workingLoadout,
      });
      workingLoadout = rollback.restoredLoadout;
      restored = rollback.errors.length === 0;
    } catch (_) {
      // Rollback itself failed — return what we have
    }

    return {
      success:                 false,
      applied,
      failed,
      restored_previous_state: restored,
      equippedBySlot:          workingLoadout,
      message: `Preset apply failed for ${failed.length} slot(s): ${failed.join(', ')}. ${
        restored ? 'Previous outfit restored.' : 'Rollback also encountered errors.'
      }`,
    };
  }

  return {
    success:                 true,
    applied,
    failed:                  [],
    restored_previous_state: false,
    equippedBySlot:          workingLoadout,
    message:                 `Outfit "${presetRecord.name || 'Preset'}" applied successfully.`,
  };
}