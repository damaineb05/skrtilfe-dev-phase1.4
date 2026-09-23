/**
 * ThirdPersonEngine
 * ─────────────────────────────────────────────────────────────
 * Orchestrates third-person fashion avatar controller.
 * Integrates movement, animation, and input systems.
 * Extensible for future shooter-style movement without implementing combat logic.
 * 
 * Architecture:
 * - ThirdPersonController: movement logic (states, physics, joystick)
 * - AnimationController: animation playback (blend graph, emotes)
 * - AnimationLibrary: clip registry (gender-aware resolution)
 * - InputController: keyboard/joystick input capture
 * - CameraController: camera movement and direction vectors
 */

import ThirdPersonController, { ThirdPersonMode } from '../movement/ThirdPersonController.js';
import AnimationController from '../animation/AnimationController.js';
import AnimationLibrary from '../animation/AnimationLibrary.js';

class ThirdPersonEngine {
  /**
   * @param {{
   *   avatarRuntime:     object,  // AvatarRuntime instance
   *   inputController:   object,  // InputController instance
   *   cameraController:  object,  // CameraController instance
   *   avatarGender?:     string,  // 'masculine' or 'feminine'
   * }}
   */
  constructor({ avatarRuntime, inputController, cameraController, avatarGender = 'masculine' }) {
    if (!avatarRuntime) throw new Error('ThirdPersonEngine: avatarRuntime required');
    if (!inputController) throw new Error('ThirdPersonEngine: inputController required');
    if (!cameraController) throw new Error('ThirdPersonEngine: cameraController required');

    this.avatarRuntime = avatarRuntime;
    this.inputController = inputController;
    this.cameraController = cameraController;
    this.avatarGender = avatarGender || 'masculine';

    // Initialize subsystems
    this.animationLibrary = new AnimationLibrary({ avatarGender: this.avatarGender });
    this.animationController = new AnimationController({
      avatarRuntime: this.avatarRuntime,
      animationLibrary: this.animationLibrary,
    });
    this.movementController = new ThirdPersonController({
      avatarRuntime: this.avatarRuntime,
      inputController: this.inputController,
      animationController: this.animationController,
      cameraController: this.cameraController,
      avatarGender: this.avatarGender,
    });

    this._running = false;
    this._destroyed = false;
  }

  /**
   * Register locomotion animation clips
   * @param {Map<string, THREE.AnimationClip>} clips - { 'idle': clip, 'walk': clip, ... }
   */
  registerLocomotionClips(clips) {
    if (clips instanceof Map) {
      clips.forEach((clip, state) => this.animationLibrary.registerLocomotion(state, clip));
    }
  }

  /**
   * Register emote animation clips
   * @param {Map<string, THREE.AnimationClip>} clips - { 'wave': clip, ... }
   */
  registerEmoteClips(clips) {
    if (clips instanceof Map) {
      clips.forEach((clip, emoteId) => this.animationLibrary.registerEmote(emoteId, clip));
    }
  }

  /**
   * Update loop — called once per frame
   * @param {number} delta - elapsed time in seconds
   */
  update(delta) {
    if (this._destroyed || !this._running) return;
    if (!delta || delta <= 0) return;

    // Update movement first (determines next state)
    this.movementController.update(delta);

    // Update animation mixer
    this.animationController.update(delta);
  }

  /**
   * Start the engine
   */
  start() {
    if (this._destroyed) return;
    this._running = true;
  }

  /**
   * Stop the engine
   */
  stop() {
    if (this._destroyed) return;
    this._running = false;
    this.movementController.reset();
  }

  /**
   * Play an emote animation
   * @param {string} emoteId - 'wave', 'dance', etc.
   * @returns {{ ok: boolean, reason?: string }}
   */
  playEmote(emoteId) {
    if (this._destroyed) return { ok: false, reason: 'ENGINE_DESTROYED' };
    return this.animationController.playEmote(emoteId);
  }

  /**
   * Change avatar gender and reload animations
   * @param {string} newGender - 'masculine' or 'feminine'
   */
  setAvatarGender(newGender) {
    if (this._destroyed) return;
    this.avatarGender = newGender || 'masculine';
    this.animationLibrary.setAvatarGender(this.avatarGender);
    this.movementController.setAvatarGender(this.avatarGender);
    // Parent (viewport) will reload animation clips via hardReloadToken
  }

  /**
   * Get engine state snapshot
   * @returns {object}
   */
  getState() {
    return {
      running: this._running,
      movement: this.movementController.getState(),
      animation: this.animationController.getState(),
      library: this.animationLibrary.getState(),
    };
  }

  /**
   * Reset engine to initial state
   */
  reset() {
    if (this._destroyed) return;
    this.movementController.reset();
    this.animationController.reset();
  }

  /**
   * Destroy engine and clean up references
   */
  destroy() {
    if (this._destroyed) return;
    this.stop();
    this.movementController.destroy();
    this.animationController.destroy();
    this.animationLibrary.clear();
    this.avatarRuntime = null;
    this.inputController = null;
    this.cameraController = null;
    this._destroyed = true;
  }
}

export default ThirdPersonEngine;