/**
 * OutfitRollback
 * ─────────────────────────────────────────────────────────────
 * Helpers to capture a loadout snapshot before a risky operation
 * and restore it if something goes wrong.
 *
 * Restore logic always goes through the repository equip/unequip
 * paths — never writes directly to the DB.
 */

/**
 * Capture a deep snapshot of the current equippedBySlot map.
 * Call this before any multi-step equip operation.
 *
 * @param {{ equippedBySlot: object }} loadout
 * @returns {{ equippedBySlot: object, capturedAt: string }}
 */
export function captureCurrentLoadoutSnapshot(loadout) {
  const equippedBySlot = loadout?.equippedBySlot || {};

  // Deep clone — slot records are plain objects, JSON round-trip is safe
  const snapshot = JSON.parse(JSON.stringify(equippedBySlot));

  return {
    equippedBySlot: snapshot,
    capturedAt: new Date().toISOString(),
  };
}

/**
 * Restore a previously captured loadout snapshot.
 *
 * Strategy:
 *   1. Unequip every slot that is currently equipped but was NOT in the snapshot.
 *   2. Re-equip every slot that was in the snapshot but is not currently equipped
 *      (or whose wearableId differs from the current state).
 *
 * Both steps use the repository's persistence methods so the DB stays consistent.
 *
 * Errors in individual steps are caught and logged but do not halt the whole
 * restore — we want to recover as much as possible.
 *
 * @param {{
 *   repository:      object,   — DripSyncRepository instance
 *   userId:          string,
 *   avatarId:        string,
 *   previousLoadout: object,   — snapshot.equippedBySlot from captureCurrentLoadoutSnapshot
 *   currentLoadout:  object,   — current equippedBySlot from the (possibly broken) state
 * }}
 * @returns {Promise<{
 *   restoredLoadout: object,
 *   errors:          string[],
 * }>}
 */
export async function restorePreviousLoadout({
  repository,
  userId,
  avatarId,
  previousLoadout,
  currentLoadout,
}) {
  const errors = [];

  // ── Step 1: Remove slots that shouldn't be equipped ──────────
  const slotsToRemove = Object.keys(currentLoadout).filter(
    slot => !previousLoadout[slot]
  );

  for (const slot of slotsToRemove) {
    const record = currentLoadout[slot];
    if (record?.equippedRecordId) {
      try {
        await repository.unequipAvatarWearable(record.equippedRecordId);
      } catch (err) {
        errors.push(`[rollback] failed to unequip slot "${slot}": ${err?.message}`);
      }
    }
  }

  // ── Step 2: Re-equip slots that should be present ────────────
  const restoredSlots = {};

  for (const [slot, prevRecord] of Object.entries(previousLoadout)) {
    const currentRecord = currentLoadout[slot];
    const alreadyCorrect =
      currentRecord?.wearableId === prevRecord.wearableId &&
      currentRecord?.equippedRecordId;

    if (alreadyCorrect) {
      // Nothing to do — slot is already in the correct state
      restoredSlots[slot] = currentRecord;
      continue;
    }

    // Remove the wrong item first if present
    if (currentRecord?.equippedRecordId) {
      try {
        await repository.unequipAvatarWearable(currentRecord.equippedRecordId);
      } catch (err) {
        errors.push(`[rollback] failed to clear slot "${slot}" before restore: ${err?.message}`);
      }
    }

    // Re-equip the correct item
    try {
      const created = await repository.equipAvatarWearable({
        avatar_id:     avatarId,
        asset_id:      prevRecord.wearableId,
        slot,
        model_url:     prevRecord.modelUrl    || null,
        thumbnail_url: prevRecord.thumbnailUrl || null,
        name:          prevRecord.name         || null,
      });

      restoredSlots[slot] = {
        wearableId:       prevRecord.wearableId,
        slot,
        name:             prevRecord.name             || null,
        modelUrl:         prevRecord.modelUrl          || null,
        thumbnailUrl:     prevRecord.thumbnailUrl      || null,
        equippedRecordId: created?.id                  || null,
        equippedAt:       created?.created_date        || new Date().toISOString(),
      };
    } catch (err) {
      errors.push(`[rollback] failed to restore slot "${slot}": ${err?.message}`);
      // Do not populate restoredSlots[slot] — better to leave it empty than wrong
    }
  }

  return { restoredLoadout: restoredSlots, errors };
}