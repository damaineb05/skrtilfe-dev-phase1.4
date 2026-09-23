/**
 * AnimationStateMachine
 * ─────────────────────────────────────────────────────────────────
 * Single animation controller — manages crossfades, emotes, locomotion.
 * No duplicate loops. No setTimeout race conditions on isTransitioning.
 * ─────────────────────────────────────────────────────────────────
 */

export class AnimationStateMachine {
  constructor(mixer, THREE) {
    this.mixer        = mixer;
    this.THREE        = THREE;
    this.currentState = 'idle';
    this.previousState = 'idle';
    this.actions      = {};
    this.transitionTime = 0.2;
    this.playbackSpeed  = 1.0;
    this.previewState   = null;
    this.previewAction  = null;
    this.rootMotionEnabled = true;

    // State categories
    this.locomotionStates = ['idle','walk','run','jump','backward','strafeleft','straferight'];
    this.emoteStates      = [];

    // Emote return timer
    this._emoteTimer = null;
  }

  registerAction(name, action, options = {}) {
    if (!action) return;
    const key = name.toLowerCase();
    this.actions[key] = action;

    const LoopRepeat = this.THREE?.LoopRepeat ?? 2200;
    action.setLoop(options.loop ?? LoopRepeat);
    action.clampWhenFinished = options.clampWhenFinished || false;
    action.timeScale = this.playbackSpeed;

    if (options.isEmote && !this.emoteStates.includes(key)) {
      this.emoteStates.push(key);
    }
  }

  setPlaybackSpeed(speed) {
    this.playbackSpeed = Math.max(0.1, Math.min(3.0, speed));
    Object.values(this.actions).forEach(a => { a.timeScale = this.playbackSpeed; });
  }

  setRootMotion(enabled) {
    this.rootMotionEnabled = enabled;
  }

  /**
   * Transition to a new state with crossfade.
   * Does NOT block on isTransitioning — crossfades are cumulative in Three.js.
   */
  transitionTo(stateName, options = {}) {
    const targetName   = stateName.toLowerCase();
    const targetAction = this.actions[targetName];
    if (!targetAction) return false;

    // Skip no-op (already playing this state, not a forced override)
    if (this.currentState === targetName && !options.force) return false;

    const currentAction = this.actions[this.currentState];
    const fadeTime      = options.fadeTime ?? this.transitionTime;
    const isEmote       = this.emoteStates.includes(targetName);

    const LoopOnce   = this.THREE?.LoopOnce   ?? 2201;
    const LoopRepeat = this.THREE?.LoopRepeat  ?? 2200;

    // Fade out current action
    if (currentAction && currentAction !== targetAction) {
      currentAction.fadeOut(fadeTime);
    }

    // Configure and start target action
    targetAction.reset();
    targetAction.setEffectiveWeight(1);
    targetAction.timeScale = this.playbackSpeed;

    if (isEmote) {
      targetAction.setLoop(LoopOnce);
      targetAction.clampWhenFinished = true;
    } else {
      targetAction.setLoop(LoopRepeat);
      targetAction.clampWhenFinished = false;
    }

    targetAction.fadeIn(fadeTime).play();

    this.previousState = this.currentState;
    this.currentState  = targetName;

    // Auto-return from emote
    if (isEmote) {
      if (this._emoteTimer) clearTimeout(this._emoteTimer);
      const duration = (targetAction.getClip().duration - 0.1) * 1000;
      this._emoteTimer = setTimeout(() => {
        this._emoteTimer = null;
        this.returnFromEmote();
      }, Math.max(100, duration));
    }

    return true;
  }

  returnFromEmote() {
    const returnState = this.locomotionStates.includes(this.previousState)
      ? this.previousState : 'idle';
    this.transitionTo(returnState, { force: true });
  }

  /**
   * Preview an animation (one-shot, returns to previous state after)
   */
  preview(stateName) {
    const targetName   = stateName.toLowerCase();
    const targetAction = this.actions[targetName];
    if (!targetAction) return false;

    this.previewState  = this.currentState;
    this.previewAction = this.actions[this.currentState];

    const currentAction = this.actions[this.currentState];
    if (currentAction) currentAction.fadeOut(0.15);

    const LoopRepeat = this.THREE?.LoopRepeat ?? 2200;
    targetAction.reset();
    targetAction.setEffectiveWeight(1);
    targetAction.timeScale = this.playbackSpeed;
    targetAction.setLoop(LoopRepeat);
    targetAction.fadeIn(0.15).play();

    this.currentState = targetName;
    return true;
  }

  applyPreview() {
    if (!this.previewState) return false;
    this.previewState  = null;
    this.previewAction = null;
    return true;
  }

  cancelPreview() {
    if (!this.previewState || !this.previewAction) return false;

    const current = this.actions[this.currentState];
    if (current) current.fadeOut(0.15);

    this.previewAction.reset();
    this.previewAction.setEffectiveWeight(1);
    this.previewAction.fadeIn(0.15).play();

    this.currentState  = this.previewState;
    this.previewState  = null;
    this.previewAction = null;
    return true;
  }

  isPreviewing() {
    return this.previewState !== null;
  }

  getState() {
    return {
      current:        this.currentState,
      previous:       this.previousState,
      isPreviewing:   this.isPreviewing(),
      previewState:   this.previewState,
      playbackSpeed:  this.playbackSpeed,
      rootMotion:     this.rootMotionEnabled,
    };
  }

  stopAll() {
    if (this._emoteTimer) { clearTimeout(this._emoteTimer); this._emoteTimer = null; }
    Object.values(this.actions).forEach(a => a.stop());
    this.currentState  = 'idle';
    this.previewState  = null;
    this.previewAction = null;
  }

  dispose() {
    this.stopAll();
    this.actions = {};
  }
}

export default AnimationStateMachine;