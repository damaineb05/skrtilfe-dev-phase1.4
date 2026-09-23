/**
 * WearableModule — tracks active wearable objects.
 *
 * Responsibilities:
 *  - Record which wearables are logically attached (by slot)
 *  - Emit wearable:attached / wearable:removed
 *
 * Does NOT: manipulate Three.js objects directly.
 * Physical binding is done by the Viewport's WearableAutoBinding layer.
 * This module is the authoritative source of *which* wearables are active.
 */

import { ENGINE_EVENTS } from '../events/EngineEvents';

export class WearableModule {
  /**
   * @param {{ store: import('../store/DripSyncStore').DripSyncStore, events: import('../events/EngineEvents').EngineEvents }} options
   */
  constructor({ store, events }) {
    this._store  = store;
    this._events = events;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Register a wearable as attached.
   * @param {{ id: string|number, slot: string, name?: string, url?: string, bone?: string, position?: number[], rotation?: number[], scale?: number }} wearable
   */
  attach(wearable) {
    const { slot } = wearable;
    if (!slot) { console.warn('WearableModule.attach: wearable missing slot'); return; }

    const current = this._store.getState().wearables || {};
    if (current[slot]?.id === wearable.id) return; // guard: already attached

    this._store.setState({ wearables: { ...current, [slot]: wearable } });
    this._events.emit(ENGINE_EVENTS.WEARABLE_ATTACHED, { slot, wearable });
  }

  /**
   * Remove a wearable by slot.
   * @param {string} slot
   */
  detach(slot) {
    const current = { ...this._store.getState().wearables };
    if (!current[slot]) return; // guard: nothing to remove

    const removed = current[slot];
    delete current[slot];
    this._store.setState({ wearables: current });
    this._events.emit(ENGINE_EVENTS.WEARABLE_REMOVED, { slot, wearable: removed });
  }

  /**
   * Sync the full wearable list — attach missing, remove stale.
   * @param {Array<{id: string|number, slot: string, [key: string]: any}>} wearables
   */
  sync(wearables) {
    const current = this._store.getState().wearables || {};
    const incoming = new Map(wearables.map(w => [w.slot, w]));

    // Detach stale
    for (const slot of Object.keys(current)) {
      if (!incoming.has(slot)) this.detach(slot);
    }
    // Attach new / updated
    for (const [, w] of incoming) {
      this.attach(w);
    }
  }

  /**
   * Return all currently tracked wearables.
   * @returns {object} { [slot]: wearable }
   */
  getAll() {
    return this._store.getState().wearables || {};
  }

  /**
   * Return wearable for a specific slot, or null.
   * @param {string} slot
   * @returns {object|null}
   */
  getSlot(slot) {
    return this._store.getState().wearables?.[slot] || null;
  }

  /** Clear all wearables. */
  clear() {
    this._store.setState({ wearables: {} });
  }
}

export default WearableModule;