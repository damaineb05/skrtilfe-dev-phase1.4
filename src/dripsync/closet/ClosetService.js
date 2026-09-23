/**
 * ClosetService
 * ─────────────────────────────────────────────────────────────
 * Orchestrates full closet hydration for a user.
 * Only talks to Base44 through DripSyncRepository.
 * Delegates record-level logic to OwnershipService and InventoryHydrator.
 *
 * Returned shape:
 * {
 *   items:      ClosetItem[],  — hydrated, normalized closet items
 *   totalOwned: number,        — total unique wearables owned
 *   skipped:    number,        — ownership records with no matching wearable
 *   empty:      boolean,       — true when user owns nothing (valid state)
 * }
 */

import { processOwnerships, extractWearableIds } from './OwnershipService.js';
import { hydrateClosetItems }                    from './InventoryHydrator.js';

/**
 * Hydrate a user's closet into normalized closet items.
 *
 * @param {{
 *   repository:    import('../backend/DripSyncRepository').default,
 *   userId:        string,
 *   equippedBySlot?: object  — optional current loadout for isEquipped flags
 * }} options
 * @returns {Promise<{
 *   items:      object[],
 *   totalOwned: number,
 *   skipped:    number,
 *   empty:      boolean
 * }>}
 */
export async function hydrateUserCloset({ repository, userId, equippedBySlot = {} }) {
  // ── 1. Fetch raw ownership records ───────────────────────
  const rawOwnerships = await repository.getOwnershipsByUser(userId);

  // ── 2. Normalize, filter, deduplicate ────────────────────
  const processedOwnerships = processOwnerships(rawOwnerships);

  // Empty closet is a valid success state
  if (processedOwnerships.length === 0) {
    return { items: [], totalOwned: 0, skipped: 0, empty: true };
  }

  // ── 3. Extract only the wearable IDs we actually need ────
  const wearableIds = extractWearableIds(processedOwnerships);

  // ── 4. Fetch only the matching wearables (targeted query) ─
  const rawWearables = await repository.getWearablesByIds(wearableIds);

  // ── 5. Hydrate closet items ───────────────────────────────
  const items = hydrateClosetItems(processedOwnerships, rawWearables, equippedBySlot);

  // Track how many ownership records had no matching wearable
  const skipped = processedOwnerships.length - items.length;

  return {
    items,
    totalOwned: items.length,
    skipped,
    empty: items.length === 0,
  };
}