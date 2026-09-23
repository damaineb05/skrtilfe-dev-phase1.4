/**
 * DripSyncStore — Single source of truth for the DripSync Engine.
 *
 * Rules:
 *  - State is mutated only via setState().
 *  - No live Three.js objects are stored here — only serializable data.
 *  - Consumers subscribe via subscribe(listener); receive a frozen snapshot.
 */

// ── Initial state factory ────────────────────────────────────────────────────

function createInitialState() {
  return {
    /** Currently loaded avatar */
    avatar: {
      id:        null,   // string | null
      url:       null,   // .glb URL
      config:    {},     // height, skinTone, etc.
      loaded:    false,
    },

    /** Active wearables — keyed by slot */
    wearables: {},       // { [slot]: { id, name, url, bone, position, rotation, scale } }

    /** Animation state */
    animationState: {
      current:    'idle',
      isEmote:    false,
      registered: [],    // clip names available in the state machine
    },

    /** Environment */
    environment: {
      id:       null,
      url:      null,
      name:     null,
      loaded:   false,
    },
  };
}

// ── Store class ──────────────────────────────────────────────────────────────

export class DripSyncStore {
  constructor() {
    this._state     = createInitialState();
    this._listeners = new Set();
  }

  /**
   * Return a shallow-frozen snapshot of the current state.
   * @returns {object}
   */
  getState() {
    return { ...this._state };
  }

  /**
   * Merge a partial update. Performs one-level shallow merge per top-level key.
   * @param {Partial<ReturnType<createInitialState>>} partial
   */
  setState(partial) {
    const next = { ...this._state };
    for (const key of Object.keys(partial)) {
      const cur = this._state[key];
      const val = partial[key];
      if (val !== null && typeof val === 'object' && !Array.isArray(val) &&
          cur !== null && typeof cur === 'object' && !Array.isArray(cur)) {
        next[key] = { ...cur, ...val };
      } else {
        next[key] = val;
      }
    }
    this._state = next;
    this._notify();
  }

  /**
   * Subscribe to any state change.
   * @param {(state: object) => void} listener
   * @returns {() => void} unsubscribe
   */
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /** Reset to initial state. */
  reset() {
    this._state = createInitialState();
    this._notify();
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _notify() {
    const snap = this.getState();
    for (const l of this._listeners) {
      try { l(snap); } catch (_) { /* never crash */ }
    }
  }
}

export default DripSyncStore;