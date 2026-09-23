/**
 * useCloset
 * ─────────────────────────────────────────────────────────────
 * Read-focused hook for DripSync closet state.
 * Returns the hydrated inventory items plus loading/empty signals.
 *
 * Derived helpers:
 *   itemsBySlot — items grouped by wearable slot for slot-picker UIs
 */

import { useMemo } from 'react';
import { useDripSyncContext } from './DripSyncProvider.jsx';

/**
 * @returns {{
 *   items:       object[],   — hydrated closet items
 *   loading:     boolean,
 *   empty:       boolean,
 *   totalOwned:  number,
 *   skipped:     number,
 *   itemsBySlot: Record<string, object[]>,
 * }}
 */
export default function useCloset() {
  const { closet } = useDripSyncContext();

  const items      = closet.items      || [];
  const loading    = closet.loading    ?? false;
  const empty      = closet.empty      ?? items.length === 0;
  const totalOwned = closet.totalOwned ?? 0;
  const skipped    = closet.skipped    ?? 0;

  // Group items by their wearable slot for slot-based picker UIs
  const itemsBySlot = useMemo(() => {
    const map = {};
    for (const item of items) {
      const slot = item.slot || item.wearableSlot || 'unslotted';
      if (!map[slot]) map[slot] = [];
      map[slot].push(item);
    }
    return map;
  }, [items]);

  return {
    items,
    loading,
    empty,
    totalOwned,
    skipped,
    itemsBySlot,
  };
}