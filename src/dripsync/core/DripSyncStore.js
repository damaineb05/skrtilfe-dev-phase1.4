/**
 * DripSyncStore
 * Framework-agnostic centralized state container for an active DripSync session.
 * React (or any other consumer) subscribes via store.subscribe(listener).
 */

/** @returns {import('./DripSyncStore').DripSyncState} */
function createInitialState() {
  return {
    // ── Session ────────────────────────────────────────────
    session: {
      userId:  null,
      /** 'idle' | 'booting' | 'ready' | 'error' */
      status:  'idle',
      error:   null,
    },

    // ── Avatar ─────────────────────────────────────────────
    avatar: {
      activeAvatarId: null,
      profile:        null,   // full Avatar entity record
      modelUrl:       null,   // resolved .glb / RPM URL
      appearance:     null,   // traits, customization blob
      // Runtime status (serializable — live AvatarRuntime instance lives on engine)
      runtimeReady:   false,
      runtimeStatus:  'idle',  // 'idle' | 'loading' | 'loaded' | 'ready' | 'error'
      runtimeError:   null,
    },

    // ── Closet ─────────────────────────────────────────────
    closet: {
      items:      [],    // hydrated ClosetItem records
      totalOwned: 0,
      skipped:    0,     // orphaned ownership records (wearable deleted)
      empty:      true,
      loading:    false,
    },

    // ── Loadout ────────────────────────────────────────────
    loadout: {
      equippedBySlot: {},   // { [slot]: AvatarWearables record }
      dirty:          false,

      // Serializable wearable runtime binding status — no live objects
      runtimeBoundSlots:          [],   // string[] of currently-bound slots
      runtimeBindingStatusBySlot: {},   // { [slot]: 'binding' | 'bound' | 'error' | 'detaching' }
      runtimeBindingErrorsBySlot: {},   // { [slot]: string } — error message if any
    },

    // ── Scene ──────────────────────────────────────────────
    scene: {
      activeRealmId:  null,
      environmentId:  null,
      environmentUrl: null,
      objects:        [],    // normalized SceneObject array (no live 3D nodes)
      collisions:     [],    // serializable collision descriptors
      spawnPoints:    [],
      lighting:       'default',
      ready:          false,
      error:          null,
    },

    // ── Movement ──────────────────────────────────────
    movement: {
      mode:     'idle',    // 'idle' | 'walk' | 'run' | 'jump' | 'fall'
      velocity: [0, 0, 0], // serializable [x, y, z]
      grounded: true,
      enabled:  false,     // true once movement controls are attached
    },

    // ── Animation ─────────────────────────────────────
    animation: {
      current:         'idle',  // current locomotion state name
      emote:           false,   // true during emote playback
      availableStates: [],      // populated once library registers clips
    },
  };
}

class DripSyncStore {
  constructor() {
    this._state     = createInitialState();
    this._listeners = new Set();
  }

  /** Return a shallow copy of the full state tree. */
  getState() {
    return { ...this._state };
  }

  /**
   * Merge a partial update into the top-level state keys.
   * Performs one level of shallow merge per top-level key.
   * @param {Partial<import('./DripSyncStore').DripSyncState>} partial
   */
  setState(partial) {
    const next = { ...this._state };

    for (const key of Object.keys(partial)) {
      if (
        partial[key] !== null &&
        typeof partial[key] === 'object' &&
        !Array.isArray(partial[key]) &&
        typeof this._state[key] === 'object' &&
        this._state[key] !== null &&
        !Array.isArray(this._state[key])
      ) {
        // Shallow-merge objects (session, avatar, closet, loadout, …)
        next[key] = { ...this._state[key], ...partial[key] };
      } else {
        // Direct assignment for scalars / arrays
        next[key] = partial[key];
      }
    }

    this._state = next;
    this._notify();
  }

  /**
   * Subscribe to any state change.
   * @param {(state: import('./DripSyncStore').DripSyncState) => void} listener
   * @returns {() => void} unsubscribe function
   */
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /** Reset to pristine initial state (e.g. on logout or engine destroy). */
  reset() {
    this._state = createInitialState();
    this._notify();
  }

  // ── Private ──────────────────────────────────────────────

  _notify() {
    const snapshot = this.getState();
    for (const listener of this._listeners) {
      listener(snapshot);
    }
  }
}

export default DripSyncStore;