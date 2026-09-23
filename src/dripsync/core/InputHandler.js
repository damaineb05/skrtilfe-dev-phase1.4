import { updateAnimationState, AnimationState } from './DripSyncAnimationManager';

/**
 * InputHandler
 * Unified input system for desktop and mobile
 * Routes input to animation state
 */
export class InputHandler {
  constructor() {
    this.keys = {};
    this.isInitialized = false;
    this.moveVector = { x: 0, z: 0 };
  }

  /**
   * Initialize desktop keyboard input
   */
  initDesktopInput() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.updateAnimationState();
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.updateAnimationState();
    });
  }

  /**
   * Update animation state based on keyboard input
   * WASD: movement
   * Shift: run
   * Space: jump
   */
  updateAnimationState() {
    const w = this.keys['w'];
    const a = this.keys['a'];
    const s = this.keys['s'];
    const d = this.keys['d'];
    const shift = this.keys['shift'];
    const space = this.keys[' '];

    const isMoving = w || a || s || d;

    updateAnimationState({
      isMoving,
      isRunning: isMoving && shift,
      isJumping: space,
      isEmoting: false,
      activeEmote: null,
    });

    // Store movement vector for physics
    this.moveVector.x = (d ? 1 : 0) + (a ? -1 : 0);
    this.moveVector.z = (w ? 1 : 0) + (s ? -1 : 0);
  }

  /**
   * Mobile animation input
   * Called when user selects animation from mobile library
   */
  playMobileAnimation(animationName) {
    updateAnimationState({
      isMoving: false,
      isRunning: false,
      isJumping: false,
      isEmoting: true,
      activeEmote: animationName,
    });
  }

  /**
   * Stop emote and return to idle/movement
   */
  stopEmote() {
    updateAnimationState({
      isEmoting: false,
      activeEmote: null,
    });
  }

  /**
   * Get current movement vector
   */
  getMovementVector() {
    return this.moveVector;
  }

  /**
   * Dispose and cleanup
   */
  dispose() {
    this.keys = {};
    this.isInitialized = false;
  }
}