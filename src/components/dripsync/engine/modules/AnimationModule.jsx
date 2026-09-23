/**
 * AnimationModule — manages the AnimationStateMachine reference.
 *
 * Responsibilities:
 *  - Hold a reference to the live AnimationStateMachine
 *  - Provide clean transition API with guards (skip if already active)
 *  - Emit animation:changed / animation:registered
 *
 * Does NOT: create or load animation clips (that belongs to the Viewport).
 * The Viewport registers clips and hands the state machine to setStateMachine().
 */

import { ENGINE_EVENTS } from '../events/EngineEvents';

export class AnimationModule {
  /**
   * @param {{ store: import('../store/DripSyncStore').DripSyncStore, events: import('../events/EngineEvents').EngineEvents }} options
   */
  constructor({ store, events }) {
    this._store        = store;
    this._events       = events;
    /** @type {import('../../AnimationStateMachine').AnimationStateMachine | null} */
    this._stateMachine = null;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Register the live AnimationStateMachine instance.
   * Called by the Viewport once the machine is built.
   * @param {object} stateMachine — AnimationStateMachine instance
   */
  setStateMachine(stateMachine) {
    this._stateMachine = stateMachine;
  }

  /**
   * Return the live AnimationStateMachine, or null.
   * @returns {object|null}
   */
  getStateMachine() {
    return this._stateMachine;
  }

  /**
   * Transition to an animation state.
   * Guard: no-op if the requested state is already active.
   * @param {string} stateName
   * @param {{ force?: boolean }} options
   */
  transitionTo(stateName, options = {}) {
    if (!this._stateMachine) return;
    const current = this._store.getState().animationState.current;
    if (!options.force && current === stateName) return; // guard

    this._stateMachine.transitionTo(stateName, options);
    this._store.setState({ animationState: { current: stateName, isEmote: false } });
    this._events.emit(ENGINE_EVENTS.ANIMATION_CHANGED, { state: stateName, isEmote: false });
  }

  /**
   * Play a one-off emote animation.
   * @param {string} emoteName
   */
  preview(emoteName) {
    if (!this._stateMachine) return;
    this._stateMachine.preview(emoteName);
    this._store.setState({ animationState: { current: emoteName, isEmote: true } });
    this._events.emit(ENGINE_EVENTS.ANIMATION_CHANGED, { state: emoteName, isEmote: true });
  }

  /**
   * Notify the module that a clip has been registered in the state machine.
   * @param {string} clipName
   */
  registerClip(clipName) {
    const current = this._store.getState().animationState.registered || [];
    if (current.includes(clipName)) return; // guard
    this._store.setState({ animationState: { registered: [...current, clipName] } });
    this._events.emit(ENGINE_EVENTS.ANIMATION_REGISTERED, { clipName });
  }

  /**
   * Return the currently active state name.
   * @returns {string}
   */
  getCurrentState() {
    return this._store.getState().animationState.current || 'idle';
  }

  /** Clear the state machine reference. */
  clear() {
    this._stateMachine = null;
    this._store.setState({ animationState: { current: 'idle', isEmote: false, registered: [] } });
  }
}

export default AnimationModule;