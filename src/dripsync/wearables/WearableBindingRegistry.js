/**
 * WearableBindingRegistry
 * ─────────────────────────────────────────────────────────────
 * Lightweight in-memory registry for live bound wearable instances.
 * Keyed by slot string (e.g. 'top', 'headwear', 'shoes').
 *
 * This lives exclusively in runtime memory — nothing here is
 * serialized into the DripSyncStore.
 *
 * Each entry is a RuntimeWearable record:
 * {
 *   slot:       string,
 *   wearableId: string,
 *   root:       THREE.Group,        — scene node added during attach
 *   meshes:     THREE.Mesh[],
 *   materials:  THREE.Material[],
 *   skeleton:   THREE.Skeleton | null,
 *   transform:  WearableTransform,  — resolved transform used at bind time
 *   boundAt:    number,             — Date.now() timestamp
 * }
 */

class WearableBindingRegistry {
  constructor() {
    /** @type {Map<string, object>} */
    this._registry = new Map();
  }

  /**
   * Register a bound runtime wearable for a slot.
   * Overwrites any existing entry for that slot without cleanup —
   * caller is responsible for detaching the old root first.
   *
   * @param {string} slot
   * @param {object} runtimeWearable
   */
  register(slot, runtimeWearable) {
    if (!slot || typeof slot !== 'string') {
      throw new Error(`WearableBindingRegistry.register: invalid slot "${slot}"`);
    }
    if (!runtimeWearable || typeof runtimeWearable !== 'object') {
      throw new Error(`WearableBindingRegistry.register: runtimeWearable must be an object`);
    }
    this._registry.set(slot, { ...runtimeWearable, slot, boundAt: Date.now() });
  }

  /**
   * Retrieve the runtime wearable for a slot, or null if none.
   * @param {string} slot
   * @returns {object | null}
   */
  get(slot) {
    return this._registry.get(slot) || null;
  }

  /**
   * Return all currently-bound runtime wearables as an array.
   * @returns {object[]}
   */
  getAll() {
    return Array.from(this._registry.values());
  }

  /**
   * Return all currently-bound slots as a Set<string>.
   * @returns {Set<string>}
   */
  getBoundSlots() {
    return new Set(this._registry.keys());
  }

  /**
   * Check whether a slot has a bound wearable.
   * @param {string} slot
   * @returns {boolean}
   */
  has(slot) {
    return this._registry.has(slot);
  }

  /**
   * Remove the registry entry for a slot.
   * Does NOT clean up Three.js resources — caller must do that first.
   * @param {string} slot
   * @returns {boolean} true if an entry existed
   */
  remove(slot) {
    return this._registry.delete(slot);
  }

  /**
   * Clear all entries.
   * Does NOT clean up Three.js resources — caller must do that first.
   */
  clear() {
    this._registry.clear();
  }

  /**
   * Return slot→wearableId pairs for serializable status reporting
   * (safe to put into the store or an event payload).
   * @returns {Record<string, string>}
   */
  getSerializableSnapshot() {
    const snapshot = {};
    for (const [slot, entry] of this._registry.entries()) {
      snapshot[slot] = entry.wearableId || null;
    }
    return snapshot;
  }
}

export default WearableBindingRegistry;