/**
 * AvatarModule — manages the live avatar object reference.
 *
 * Responsibilities:
 *  - Hold the live Three.js avatar (THREE.Group)
 *  - Apply avatar config (height, skinTone, etc.) to the mesh
 *  - Emit avatar:loaded / avatar:updated / avatar:failed
 *
 * Does NOT: load GLBs (that belongs to the Viewport/AvatarBridge).
 * The Viewport loads the GLB and calls setAvatar() to register it here.
 */

import { ENGINE_EVENTS } from '../events/EngineEvents';

export class AvatarModule {
  /**
   * @param {{ store: import('../store/DripSyncStore').DripSyncStore, events: import('../events/EngineEvents').EngineEvents }} options
   */
  constructor({ store, events }) {
    this._store  = store;
    this._events = events;
    /** @type {THREE.Group | null} */
    this._avatar = null;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Register a loaded avatar instance.
   * Call this once the Viewport has loaded the GLB and added it to the scene.
   * @param {THREE.Group} avatarObject
   * @param {{ id?: string, url?: string }} meta
   */
  setAvatar(avatarObject, meta = {}) {
    if (this._avatar === avatarObject) return; // guard: same instance

    this._avatar = avatarObject;
    this._store.setState({
      avatar: { id: meta.id || null, url: meta.url || null, loaded: true },
    });
    this._events.emit(ENGINE_EVENTS.AVATAR_LOADED, { avatarId: meta.id, url: meta.url });
  }

  /**
   * Apply a config patch (height, skinTone, isVisible, etc.) to the store.
   * The Viewport observes store.avatar.config and applies it to the mesh.
   * @param {object} configPatch
   */
  updateConfig(configPatch) {
    const current = this._store.getState().avatar.config || {};
    this._store.setState({ avatar: { config: { ...current, ...configPatch } } });
    this._events.emit(ENGINE_EVENTS.AVATAR_UPDATED, { config: configPatch });
  }

  /**
   * Return the live Three.js avatar instance, or null.
   * @returns {THREE.Group | null}
   */
  getAvatar() {
    return this._avatar;
  }

  /**
   * Clear the avatar reference (e.g. before loading a new one).
   */
  clear() {
    this._avatar = null;
    this._store.setState({ avatar: { id: null, url: null, loaded: false, config: {} } });
  }
}

export default AvatarModule;