/**
 * useDripSyncEngine
 * ─────────────────────────────────────────────────────────────
 * Canonical hook for full DripSync context access.
 * Returns engine, state, and all stable action wrappers.
 *
 * Throws a clear error if used outside <DripSyncProvider>.
 */

import { useDripSyncContext } from './DripSyncProvider.jsx';

/**
 * @returns {{
 *   engine:           import('../core/DripSyncEngine').default,
 *   state:            object,
 *   avatar:           object,
 *   closet:           object,
 *   loadout:          object,
 *   session:          object,
 *   bootStatus:       'idle' | 'booting' | 'ready' | 'error',
 *   bootError:        string | null,
 *   isBooting:        boolean,
 *   isReady:          boolean,
 *   equipWearable:    (args: { wearableId: string }) => Promise<{ ok: boolean, reason?: string }>,
 *   unequipSlot:      (slot: string) => Promise<{ ok: boolean }>,
 *   saveOutfitPreset: (name: string) => Promise<{ ok: boolean, preset?: object }>,
 *   applyOutfitPreset:          (presetId: string) => Promise<{ success: boolean }>,
 *   grantPurchaseEntitlements:  (orderId: string) => Promise<object>,
 *   refreshCloset:              () => Promise<void>,
 *   loadRealm:                  (realmId: string) => Promise<object|null>,
 * }}
 */
export default function useDripSyncEngine() {
  return useDripSyncContext();
}