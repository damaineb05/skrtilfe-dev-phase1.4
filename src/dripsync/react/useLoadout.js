/**
 * useLoadout
 * ─────────────────────────────────────────────────────────────
 * Returns the current equipped loadout state plus the two
 * mutation actions needed by slot-based UI components.
 *
 * Derived helpers:
 *   equippedSlots    — set of currently occupied slot names
 *   isSlotEquipped   — (slot) => boolean convenience
 *   getSlotItem      — (slot) => equipped record | null
 */

import { useMemo, useCallback } from 'react';
import { useDripSyncContext } from './DripSyncProvider.jsx';

/**
 * @returns {{
 *   equippedBySlot:  Record<string, object>,
 *   equippedSlots:   Set<string>,
 *   isSlotEquipped:  (slot: string) => boolean,
 *   getSlotItem:     (slot: string) => object | null,
 *   equipWearable:   (args: { wearableId: string }) => Promise<{ ok: boolean }>,
 *   unequipSlot:     (slot: string) => Promise<{ ok: boolean }>,
 * }}
 */
export default function useLoadout() {
  const { loadout, equipWearable, unequipSlot } = useDripSyncContext();

  const equippedBySlot = loadout.equippedBySlot || {};

  const equippedSlots = useMemo(
    () => new Set(Object.keys(equippedBySlot)),
    [equippedBySlot]
  );

  const isSlotEquipped = useCallback(
    (slot) => equippedSlots.has(slot),
    [equippedSlots]
  );

  const getSlotItem = useCallback(
    (slot) => equippedBySlot[slot] || null,
    [equippedBySlot]
  );

  return {
    equippedBySlot,
    equippedSlots,
    isSlotEquipped,
    getSlotItem,
    equipWearable,
    unequipSlot,
  };
}