/**
 * EnvironmentModule — tracks the active environment.
 *
 * Responsibilities:
 *  - Record which environment is currently active
 *  - Emit environment:changed / environment:cleared
 *
 * Does NOT: load or attach Three.js environment objects (Viewport handles that).
 * This module is the authoritative record of *which* environment is active.
 */

import { ENGINE_EVENTS } from '../events/EngineEvents';

export class EnvironmentModule {
  /**
   * @param {{ store: import('../store/DripSyncStore').DripSyncStore, events: import('../events/EngineEvents').EngineEvents }} options
   */
  constructor({ store, events }) {
    this._store  = store;
    this._events = events;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Set the active environment.
   * Guard: no-op if the same URL is already active.
   * @param {{ id?: string, url: string, name?: string }} env
   */
  setEnvironment(env) {
    const current = this._store.getState().environment;
    if (current.url === env.url && current.loaded) return; // guard

    this._store.setState({
      environment: {
        id:     env.id   || null,
        url:    env.url  || null,
        name:   env.name || null,
        loaded: true,
      },
    });
    this._events.emit(ENGINE_EVENTS.ENVIRONMENT_CHANGED, { environment: env });
  }

  /**
   * Clear the active environment.
   */
  clearEnvironment() {
    const current = this._store.getState().environment;
    if (!current.url) return; // guard: nothing to clear

    this._store.setState({
      environment: { id: null, url: null, name: null, loaded: false },
    });
    this._events.emit(ENGINE_EVENTS.ENVIRONMENT_CLEARED, {});
  }

  /**
   * Return the current environment record.
   * @returns {{ id: string|null, url: string|null, name: string|null, loaded: boolean }}
   */
  getEnvironment() {
    return this._store.getState().environment;
  }
}

export default EnvironmentModule;