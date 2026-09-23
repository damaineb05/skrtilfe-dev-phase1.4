/**
 * AnimationUpdateLoop
 * Single unified animation update loop
 * Call once per render frame to ensure animations play in correct priority order
 */

export class AnimationUpdateLoop {
  constructor(animationManager) {
    this.manager = animationManager;
    this.currentAnimation = 'idle';
    this.updateInterval = null;
    this.isRunning = false;
  }

  /**
   * Start the animation update loop
   * Call this once when avatar is initialized
   */
  start(deltaTime = 1 / 60) {
    if (this.isRunning) return;
    this.isRunning = true;

    // Integration with render loop - managed externally
    // This is called via updateAnimationFromState()
  }

  /**
   * Stop the animation update loop
   */
  stop() {
    this.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Core update logic - call this from render loop or state change
   * Evaluates current state and plays appropriate animation
   */
  updateAnimationFromState(AnimationState) {
    const nextAnimation = this.getNextAnimation(AnimationState);

    // Only update if animation changed
    if (this.currentAnimation !== nextAnimation) {
      this.currentAnimation = nextAnimation;
      
      // Play with proper options
      const options = {
        loop: this.shouldLoop(nextAnimation) ? 3 : 0, // LoopRepeat : NoLoop
        clampWhenFinished: !this.shouldLoop(nextAnimation),
        crossFadeDuration: 0.3,
        speed: AnimationState.speed || 1.0,
      };

      this.manager.playAnimation(nextAnimation, options);
    }

    // Always update mixer
    if (this.manager.mixer) {
      this.manager.update(1 / 60);
    }
  }

  /**
   * Determine next animation based on priority
   * Priority: jump > run > walk > emote > idle
   */
  getNextAnimation(AnimationState) {
    if (AnimationState.isJumping && this.manager.hasAnimation('jump')) {
      return 'jump';
    }
    if (AnimationState.isRunning && this.manager.hasAnimation('run')) {
      return 'run';
    }
    if (AnimationState.isMoving && this.manager.hasAnimation('walk')) {
      return 'walk';
    }
    if (AnimationState.isEmoting && AnimationState.activeEmote && this.manager.hasAnimation(AnimationState.activeEmote)) {
      return AnimationState.activeEmote;
    }
    return 'idle';
  }

  /**
   * Determine if animation should loop
   */
  shouldLoop(animationName) {
    const loopAnimations = ['idle', 'walk', 'run', 'jump'];
    return loopAnimations.includes(animationName) || animationName.includes('loop');
  }

  /**
   * Dispose and cleanup
   */
  dispose() {
    this.stop();
  }
}