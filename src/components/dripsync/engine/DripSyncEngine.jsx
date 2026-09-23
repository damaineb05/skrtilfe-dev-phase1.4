/**
 * DripSyncEngine — Modular coordinator for a DripSync session.
 *
 * Architecture:
 *  - EngineEvents: pub/sub bus (on/off/emit)
 *  - DripSyncStore: single serializable state source
 *  - AvatarModule: avatar reference + config
 *  - WearableModule: wearable tracking
 *  - AnimationModule: state machine + transitions
 *  - EnvironmentModule: environment tracking
 *
 * The Engine coordinates modules; modules never cross-call each other.
 * Live Three.js objects live only in the Viewport/modules — never serialized.
 *
 * UI calls engine methods → Engine updates store → Viewport observes store.
 */

import { EngineEvents }     from './events/EngineEvents';
import { DripSyncStore }    from './store/DripSyncStore';
import { AvatarModule }     from './modules/AvatarModule';
import { WearableModule }   from './modules/WearableModule';
import { AnimationModule }  from './modules/AnimationModule';
import { EnvironmentModule } from './modules/EnvironmentModule';

export class DripSyncEngine {
  constructor() {
    // Core infrastructure
    this._events  = new EngineEvents();
    this._store   = new DripSyncStore();

    // Modules — each receives store + events (never each other)
    this.avatar      = new AvatarModule({ store: this._store, events: this._events });
    this.wearables   = new WearableModule({ store: this._store, events: this._events });
    this.animation   = new AnimationModule({ store: this._store, events: this._events });
    this.environment = new EnvironmentModule({ store: this._store, events: this._events });

    this._destroyed  = false;
  }

  // ── Event bus delegation ───────────────────────────────────────────────────

  /**
   * Subscribe to an engine event.
   * @param {string} event — use ENGINE_EVENTS constants
   * @param {(payload: any) => void} callback
   * @returns {() => void} unsubscribe
   */
  on(event, callback) {
    return this._events.on(event, callback);
  }

  /**
   * Remove a specific event listener.
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    this._events.off(event, callback);
  }

  // ── Clean accessors (no direct ref access) ────────────────────────────────

  /**
   * Return the live Three.js avatar object, or null.
   * @returns {THREE.Group | null}
   */
  getAvatar() {
    return this.avatar.getAvatar();
  }

  /**
   * Return the live AnimationStateMachine, or null.
   * @returns {object|null}
   */
  getStateMachine() {
    return this.animation.getStateMachine();
  }

  /**
   * Return the current serializable store state.
   * @returns {object}
   */
  getState() {
    return this._store.getState();
  }

  /**
   * Subscribe to store state changes.
   * @param {(state: object) => void} listener
   * @returns {() => void} unsubscribe
   */
  subscribe(listener) {
    return this._store.subscribe(listener);
  }

  // ── High-level API ─────────────────────────────────────────────────────────

  /**
   * Load an avatar — registers it in the AvatarModule.
   * The Viewport calls this once the GLB is loaded and attached to the scene.
   * @param {THREE.Group} avatarObject
   * @param {{ id?: string, url?: string }} meta
   */
  loadAvatar(avatarObject, meta = {}) {
    this._assertAlive();
    this.avatar.setAvatar(avatarObject, meta);
  }

  /**
   * Add or update a wearable.
   * @param {{ id: string|number, slot: string, [key: string]: any }} wearable
   */
  addWearable(wearable) {
    this._assertAlive();
    this.wearables.attach(wearable);
  }

  /**
   * Remove a wearable by slot.
   * @param {string} slot
   */
  removeWearable(slot) {
    this._assertAlive();
    this.wearables.detach(slot);
  }

  /**
   * Transition to an animation state.
   * @param {string} stateName
   * @param {{ force?: boolean }} options
   */
  playAnimation(stateName, options = {}) {
    this._assertAlive();
    this.animation.transitionTo(stateName, options);
  }

  /**
   * Set the active environment.
   * @param {{ id?: string, url: string, name?: string } | null} env
   */
  setEnvironment(env) {
    this._assertAlive();
    if (!env || !env.url) {
      this.environment.clearEnvironment();
    } else {
      this.environment.setEnvironment(env);
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /**
   * Destroy the engine and release all references.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    this.avatar.clear();
    this.wearables.clear();
    this.animation.clear();
    this.environment.clearEnvironment();
    this._events.clear();
    this._store.reset();
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _assertAlive() {
    if (this._destroyed) {
      throw new Error('DripSyncEngine: cannot use a destroyed engine instance.');
    }
  }
}

export default DripSyncEngine;