/**
 * OwnershipService
 * ─────────────────────────────────────────────────────────────
 * Handles ownership-record-level logic only.
 * Receives raw ownership records (already fetched by the repository),
 * cleans, deduplicates, and normalizes them.
 * Does NOT touch Base44 directly.
 */

/**
 * Normalize a single raw AssetOwnership record into a stable shape.
 * @param {object} raw
 * @returns {object}
 */
export function normalizeOwnership(raw) {
  return {
    ownershipId: raw.id,
    wearableId:  raw.asset_id || raw.wearable_id || null,
    userId:      raw.user_id  || raw.created_by  || null,
    quantity:    typeof raw.quantity === 'number' ? raw.quantity : 1,
    isActive:    raw.is_active !== false, // default true unless explicitly false
    source:      raw.source   || 'owned', // 'owned' | 'minted' | 'gifted' | 'purchased'
    acquiredAt:  raw.created_date || null,
    raw,
  };
}

/**
 * Filter out ownership records that are invalid or revoked.
 * Criteria for exclusion:
 *  - no wearableId
 *  - explicitly inactive (is_active === false)
 *  - zero or negative quantity
 *
 * @param {object[]} ownerships  — already-normalized records
 * @returns {object[]}
 */
export function filterValidOwnerships(ownerships) {
  return ownerships.filter(o =>
    o.wearableId &&
    o.isActive &&
    o.quantity > 0
  );
}

/**
 * Deduplicate ownership records so each wearableId appears once.
 * When duplicates exist, the record with the highest quantity wins.
 * If quantities are equal, the most recently acquired record wins.
 *
 * @param {object[]} ownerships  — normalized + already-filtered records
 * @returns {object[]}
 */
export function deduplicateOwnerships(ownerships) {
  const map = new Map();

  for (const o of ownerships) {
    const existing = map.get(o.wearableId);
    if (!existing) {
      map.set(o.wearableId, o);
      continue;
    }
    // Prefer higher quantity; break ties by most recent acquiredAt
    const existingTs = existing.acquiredAt ? new Date(existing.acquiredAt).getTime() : 0;
    const currentTs  = o.acquiredAt        ? new Date(o.acquiredAt).getTime()        : 0;

    if (o.quantity > existing.quantity || (o.quantity === existing.quantity && currentTs > existingTs)) {
      map.set(o.wearableId, o);
    }
  }

  return Array.from(map.values());
}

/**
 * Full pipeline: normalize → filter → deduplicate.
 *
 * @param {object[]} rawOwnerships  — raw records from repository
 * @returns {object[]}  clean, deduplicated, normalized ownership records
 */
export function processOwnerships(rawOwnerships) {
  if (!rawOwnerships || rawOwnerships.length === 0) return [];

  const normalized  = rawOwnerships.map(normalizeOwnership);
  const filtered    = filterValidOwnerships(normalized);
  const deduplicated = deduplicateOwnerships(filtered);

  return deduplicated;
}

/**
 * Extract the unique set of wearable IDs from processed ownership records.
 * Used to build the targeted fetch query in ClosetService.
 *
 * @param {object[]} processedOwnerships
 * @returns {string[]}
 */
export function extractWearableIds(processedOwnerships) {
  return processedOwnerships
    .map(o => o.wearableId)
    .filter(Boolean);
}