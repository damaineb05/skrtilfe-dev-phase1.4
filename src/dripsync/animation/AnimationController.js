/**
 * AnimationController
 * ─────────────────────────────────────────────────────────────
 * Class-based animation controller.
 * Owns the THREE.AnimationMixer, enforces transitions via AnimationBlendGraph,
 * resolves clips via AnimationLibrary, and manages temporary emote playback.
 *
 * Assumptions about avatar runtime:
 *   - AvatarRuntime.getMixer() returns THREE.AnimationMixer | null
 *   - AvatarRuntime.getAnimations() returns THREE.AnimationClip[]
 *
 * Emote playback: plays the emote clip once, then returns to previous locomotion state.
 */

import { resolveTransition } from './AnimationBlendGraph.js';

const BLEND_DURATION = 0.25;   // cross-fade seconds between clips

class AnimationController {
  /**
   * @param {{
   *   avatarRuntime:   import('../avatar/AvatarRuntime').default,
   *   animationLibrary: import('./AnimationLibrary').default,
   *   blendGraph?:     object,
   * }}
   */
  constructor({ avatarRuntime, animationLibrary, blendGraph }) {
    if (!avatarRuntime)    throw new Error('AnimationController: avatarRuntime is required.');
    if (!animationLibrary) throw new Error('AnimationController: animationLibrary is required.');

    this._avatarRuntime    = avatarRuntime;
    this._library          = animationLibrary;
    this._blendGraph       = blendGraph || null;   // optional override (uses resolveTransition otherwise)

    this._currentState    = 'idle';
    this._emoteActive     = false;
    this._preEmoteState   = 'idle';
    this._activeAction    = null;   // THREE.AnimationAction
    this._destroyed       = false;
  }

  // ── Public API ────────────────────────────────────────────────

  /**
   * Request a locomotion state change (from MovementController).
   * Enforced through blend graph; ignored during active emote unless restoring.
   * @param {string} state
   */
  setLocomotionState(state) {
    if (this._destroyed) return;
    if (this._emoteActive) {
      // Track the target locomotion state so we can return after emote
      this._preEmoteState = state;
      return;
    }
    this._transitionTo(state);
  }

  /**
   * Play an emote clip once, then return to locomotion.
   * @param {string} emoteId
   * @returns {{ ok: boolean, reason?: string }}
   */
  playEmote(emoteId) {
    if (this._destroyed) return { ok: false, reason: 'DESTROYED' };

    const clip = this._library.resolveEmote(emoteId);
    if (!clip) {
      return { ok: false, reason: 'CLIP_NOT_FOUND', emoteId };
    }

    const mixer = this._getMixer();
    if (!mixer) {
      return { ok: false, reason: 'NO_MIXER' };
    }

    // Snapshot current locomotion state for return
    this._preEmoteState = this._currentState;
    this._emoteActive   = true;

    const emoteAction = mixer.clipAction(clip);
    emoteAction.setLoop(2200 /* THREE.LoopOnce */, 1);
    emoteAction.clampWhenFinished = true;
    emoteAction.reset();

    // Cross-fade from current to emote
    if (this._activeAction && this._activeAction !== emoteAction) {
      this._activeAction.crossFadeTo(emoteAction, BLEND_DURATION, false);
    } else {
      emoteAction.play();
    }
    this._activeAction = emoteAction;
    this._currentState = 'emote';

    // Return to locomotion after clip finishes
    const onFinished = (e) => {
      if (e.action === emoteAction) {
        mixer.removeEventListener('finished', onFinished);
        this._emoteActive = false;
        this._transitionTo(this._preEmoteState);
      }
    };
    mixer.addEventListener('finished', onFinished);

    return { ok: true };
  }

  /**
   * Advance the mixer clock. Called from engine.updateRuntime(delta).
   * @param {number} delta — seconds
   */
  update(delta) {
    if (this._destroyed) return;
    if (!delta || delta <= 0) return;
    const mixer = this._getMixer();
    if (mixer) {
      try { mixer.update(delta); } catch (_) {}
    }
  }

  /**
   * Return serializable state snapshot.
   * @returns {{ current: string, emote: boolean, availableStates: string[] }}
   */
  getState() {
    return {
      current:         this._currentState,
      emote:           this._emoteActive,
      availableStates: this._library.getAvailableStates(),
    };
  }

  /**
   * Reset to idle; stop any active action.
   */
  reset() {
    if (this._destroyed) return;
    this._emoteActive   = false;
    this._preEmoteState = 'idle';
    const mixer = this._getMixer();
    if (mixer) {
      try { mixer.stopAllAction(); } catch (_) {}
    }
    this._activeAction = null;
    this._currentState = 'idle';
    this._transitionTo('idle');
  }

  /**
   * Tear down controller references.
   */
  destroy() {
    this.reset();
    this._destroyed    = true;
    this._avatarRuntime = null;
    this._library      = null;
    this._activeAction = null;
  }

  // ── Private ───────────────────────────────────────────────────

  /**
   * Execute a blend-graph-validated animation state transition.
   * @param {string} targetState
   */
  _transitionTo(targetState) {
    const resolvedState = resolveTransition(this._currentState, targetState);
    if (resolvedState === this._currentState) return;

    const clip = this._library.resolveClip(resolvedState);
    const mixer = this._getMixer();

    if (mixer && clip) {
      const nextAction = mixer.clipAction(clip);
      nextAction.reset();

      if (this._activeAction && this._activeAction !== nextAction) {
        this._activeAction.crossFadeTo(nextAction, BLEND_DURATION, false);
      }
      nextAction.play();
      this._activeAction = nextAction;
    }
    // If no clip/mixer, state still updates (graceful degradation)
    this._currentState = resolvedState;
  }

  /**
   * Safely retrieve the Three.js AnimationMixer from the avatar runtime.
   * @returns {THREE.AnimationMixer | null}
   */
  _getMixer() {
    try {
      return typeof this._avatarRuntime?.getMixer === 'function'
        ? this._avatarRuntime.getMixer()
        : null;
    } catch (_) {
      return null;
    }
  }
}

export default AnimationController;