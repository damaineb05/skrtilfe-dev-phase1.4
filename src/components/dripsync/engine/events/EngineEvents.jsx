/**
 * EngineEvents — Lightweight pub/sub event bus for the DripSync Engine.
 *
 * Usage:
 *   const bus = new EngineEvents();
 *   const off = bus.on('avatar:loaded', (payload) => { ... });
 *   bus.emit('avatar:loaded', { avatarId: '...' });
 *   off(); // unsubscribe
 */

// ── Canonical event name constants ──────────────────────────────────────────

export const ENGINE_EVENTS = Object.freeze({
  // Avatar
  AVATAR_LOADED:       'avatar:loaded',
  AVATAR_UPDATED:      'avatar:updated',
  AVATAR_FAILED:       'avatar:failed',

  // Wearable
  WEARABLE_ATTACHED:   'wearable:attached',
  WEARABLE_REMOVED:    'wearable:removed',

  // Animation
  ANIMATION_CHANGED:   'animation:changed',
  ANIMATION_REGISTERED:'animation:registered',

  // Environment
  ENVIRONMENT_CHANGED: 'environment:changed',
  ENVIRONMENT_CLEARED: 'environment:cleared',

  // Generic
  ERROR:               'engine:error',
});

// ── Bus class ────────────────────────────────────────────────────────────────

export class EngineEvents {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {(payload: any) => void} callback
   * @returns {() => void} unsubscribe function
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe a specific callback from an event.
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    this._listeners.get(event)?.delete(callback);
  }

  /**
   * Emit an event to all registered listeners.
   * Errors in individual listeners are caught and logged — never crash the bus.
   * @param {string} event
   * @param {any} [payload]
   */
  emit(event, payload) {
    const set = this._listeners.get(event);
    if (!set || set.size === 0) return;
    for (const cb of set) {
      try { cb(payload); } catch (err) {
        console.warn(`EngineEvents: listener error on "${event}" —`, err?.message);
      }
    }
  }

  /**
   * Remove all listeners (e.g. on engine destroy).
   */
  clear() {
    this._listeners.clear();
  }
}

export default EngineEvents;