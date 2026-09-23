/**
 * LoadoutService
 * ─────────────────────────────────────────────────────────────
 * Orchestrates loadout hydration, equip, and unequip flows.
 * Only talks to Base44 through DripSyncRepository.
 * Delegates validation to OutfitValidator and serialization to LoadoutSerializer.
 */

import { validateEquipRequest, validateUnequipRequest } from './OutfitValidator.js';
import { serializeLoadout, applyEquip, applyUnequip, normalizeEquippedRecord } from './LoadoutSerializer.js';
import { getWearablesToUnequip } from '../wearables/WearableConflictResolver.js';

/**
 * Hydrate the current loadout for an avatar.
 *
 * @param {{ repository: object, avatarId: string }}
 * @returns {Promise<object>} equippedBySlot map
 */
export async function hydrateAvatarLoadout({ repository, avatarId }) {
  if (!avatarId) return {};

  const rawRecords = await repository.getAvatarWearables(avatarId);
  return serializeLoadout(rawRecords.map(r => r.raw ?? r));
}

/**
 * Equip a wearable to an avatar slot.
 * Handles validation, conflict resolution, and persistence.
 *
 * @param {{
 *   repository:     object,
 *   userId:         string,
 *   avatarId:       string,
 *   wearableId:     string,
 *   ownerships:     object[],   — processed ownership records from closet
 *   currentLoadout: object,     — equippedBySlot from store
 * }}
 * @returns {Promise<{ ok: boolean, equippedBySlot: object, reason?: string, message?: string }>}
 */
export async function equipWearableToAvatar({
  repository,
  userId,
  avatarId,
  wearableId,
  ownerships,
  currentLoadout,
}) {
  // 1. Fetch the target wearable
  const wearable = await repository.getWearableById(wearableId);

  // 2. Find ownership record for this user + wearable
  const ownership = ownerships.find(o => o.wearableId === wearableId) ||
    await repository.getOwnershipByUserAndWearable(userId, wearableId);

  // 3. Validate
  const validation = validateEquipRequest({ wearable, ownership });
  if (!validation.ok) {
    return { ok: false, equippedBySlot: currentLoadout, ...validation };
  }

  const slot = wearable.slot;

  // 4. Resolve slot conflicts — collect all records that need removal
  const toUnequip = getWearablesToUnequip(currentLoadout, slot);

  // 5. Unequip conflicting slots in persistence
  for (const { record } of toUnequip) {
    if (record?.equippedRecordId) {
      await repository.unequipAvatarWearable(record.equippedRecordId);
    }
  }

  // 6. Persist the new equipped record
  const equippedRecord = await repository.equipAvatarWearable({
    avatar_id:    avatarId,
    asset_id:     wearableId,
    slot,
    model_url:    wearable.modelUrl,
    thumbnail_url: wearable.thumbnailUrl,
    name:         wearable.name,
  });

  // 7. Build the updated loadout in memory
  let updatedLoadout = { ...currentLoadout };

  // Remove conflicting slots
  for (const { slot: conflictSlot } of toUnequip) {
    updatedLoadout = applyUnequip(updatedLoadout, conflictSlot);
  }

  // Apply the new equipped item
  const snapshot = normalizeEquippedRecord(equippedRecord);
  if (snapshot) {
    updatedLoadout = applyEquip(updatedLoadout, slot, snapshot);
  }

  return { ok: true, equippedBySlot: updatedLoadout, reason: null, message: null };
}

/**
 * Unequip a slot from an avatar.
 *
 * @param {{
 *   repository:     object,
 *   userId:         string,
 *   avatarId:       string,
 *   slot:           string,
 *   currentLoadout: object,
 * }}
 * @returns {Promise<{ ok: boolean, equippedBySlot: object, reason?: string, message?: string }>}
 */
export async function unequipSlotFromAvatar({
  repository,
  userId,
  avatarId,
  slot,
  currentLoadout,
}) {
  // Validate
  const validation = validateUnequipRequest({ slot, equippedBySlot: currentLoadout });
  if (!validation.ok) {
    return { ok: false, equippedBySlot: currentLoadout, ...validation };
  }

  const record = currentLoadout[slot];

  // Remove from persistence
  if (record?.equippedRecordId) {
    await repository.unequipAvatarWearable(record.equippedRecordId);
  }

  const updatedLoadout = applyUnequip(currentLoadout, slot);
  return { ok: true, equippedBySlot: updatedLoadout, reason: null, message: null };
}