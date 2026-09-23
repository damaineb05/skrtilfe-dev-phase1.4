import { updateAnimationState, AnimationState } from './DripSyncAnimationManager';

/**
 * DripSyncControlManager
 * Central control system for desktop + mobile
 * Handles input, movement intent, camera, and active avatar
 * Updates AnimationState only — never directly plays animations
 */
export class DripSyncControlManager {
  constructor(options = {}) {
    this.activeAvatarId = null;
    this.avatarManagers = new Map(); // id -> animationManager
    
    // Movement state
    this.moveVector = { x: 0, z: 0 };
    this.isRunning = false;
    this.isJumping = false;
    
    // Keyboard state (desktop)
    this.keys = {};
    this.keyboardEnabled = true;
    
    // Camera state
    this.cameraTarget = null;
    this.cameraDistance = 4;
    this.cameraOrbit = { x: 0, y: 0 }; // orbit angles
    this.orbitEnabled = true;
    
    // Settings
    this.walkSpeed = 2.0;
    this.runSpeed = 4.5;
    this.jumpForce = 6.0;
    
    // Debug
    this.debug = options.debug || false;
    
    // Event listeners cleanup refs
    this._keydownListener = null;
    this._keyupListener = null;
    this._mouseListener = null;
  }

  /**
   * Register an avatar and its animation manager
   */
  registerAvatar(id, animationManager, cameraTarget) {
    this.avatarManagers.set(id, animationManager);
    if (!this.activeAvatarId) {
      this.setActiveAvatar(id, cameraTarget);
    }
  }

  /**
   * Unregister avatar
   */
  unregisterAvatar(id) {
    this.avatarManagers.delete(id);
    if (this.activeAvatarId === id) {
      const nextId = this.avatarManagers.keys().next().value;
      if (nextId) {
        this.setActiveAvatar(nextId);
      } else {
        this.activeAvatarId = null;
        this.cameraTarget = null;
      }
    }
  }

  /**
   * Set which avatar is active (receives input)
   */
  setActiveAvatar(id, cameraTarget = null) {
    if (this.avatarManagers.has(id)) {
      this.activeAvatarId = id;
      this.cameraTarget = cameraTarget;
      
      if (this.debug) {
        console.log(`[ControlManager] Active avatar set to: ${id}`);
      }
      
      // Reset movement on switch
      this.resetMovement();
    }
  }

  /**
   * Get active avatar manager
   */
  getActiveManager() {
    return this.avatarManagers.get(this.activeAvatarId) || null;
  }

  /**
   * Initialize desktop keyboard listeners
   */
  initDesktopInput() {
    if (!this.keyboardEnabled) return;

    this._keydownListener = (e) => {
      const key = e.key.toLowerCase();
      this.keys[key] = true;
      this.updateMovementFromKeys();
    };

    this._keyupListener = (e) => {
      const key = e.key.toLowerCase();
      this.keys[key] = false;
      this.updateMovementFromKeys();
    };

    document.addEventListener('keydown', this._keydownListener);
    document.addEventListener('keyup', this._keyupListener);

    if (this.debug) {
      console.log('[ControlManager] Desktop keyboard input initialized');
    }
  }

  /**
   * Update movement from keyboard state
   * W/A/S/D + Shift (run) + Space (jump)
   */
  updateMovementFromKeys() {
    const w = this.keys['w'];
    const a = this.keys['a'];
    const s = this.keys['s'];
    const d = this.keys['d'];
    const shift = this.keys['shift'];
    const space = this.keys[' '];

    const isMoving = w || a || s || d;

    // Normalize movement vector
    this.moveVector.x = (d ? 1 : 0) + (a ? -1 : 0);
    this.moveVector.z = (w ? 1 : 0) + (s ? -1 : 0);
    
    // Normalize diagonal movement
    const len = Math.sqrt(this.moveVector.x ** 2 + this.moveVector.z ** 2);
    if (len > 1) {
      this.moveVector.x /= len;
      this.moveVector.z /= len;
    }

    this.isRunning = isMoving && shift;
    this.isJumping = space;

    this.updateAnimationState();
  }

  /**
   * Mobile: movement start
   * direction: 'forward' | 'backward' | 'left' | 'right' | null
   */
  onMobileMoveStart(direction) {
    if (!direction) {
      this.moveVector = { x: 0, z: 0 };
    } else {
      switch (direction) {
        case 'forward':
          this.moveVector = { x: 0, z: 1 };
          break;
        case 'backward':
          this.moveVector = { x: 0, z: -1 };
          break;
        case 'left':
          this.moveVector = { x: -1, z: 0 };
          break;
        case 'right':
          this.moveVector = { x: 1, z: 0 };
          break;
        default:
          this.moveVector = { x: 0, z: 0 };
      }
    }
    this.updateAnimationState();
  }

  /**
   * Mobile: movement end
   */
  onMobileMoveEnd() {
    this.moveVector = { x: 0, z: 0 };
    this.updateAnimationState();
  }

  /**
   * Mobile: run toggle
   */
  onMobileRunToggle(enabled) {
    this.isRunning = enabled;
    this.updateAnimationState();
  }

  /**
   * Mobile: jump
   */
  onMobileJump() {
    this.isJumping = true;
    this.updateAnimationState();
    
    // Auto-reset jump after short delay
    setTimeout(() => {
      this.isJumping = false;
      this.updateAnimationState();
    }, 200);
  }

  /**
   * Mobile: camera drag
   */
  onMobileCameraDrag(deltaX, deltaY) {
    if (!this.orbitEnabled) return;
    
    this.cameraOrbit.x += deltaX * 0.01;
    this.cameraOrbit.y += deltaY * 0.01;
    
    // Clamp vertical orbit
    this.cameraOrbit.y = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.cameraOrbit.y));
    
    if (this.debug) {
      console.log(`[ControlManager] Camera orbit: x=${this.cameraOrbit.x.toFixed(2)}, y=${this.cameraOrbit.y.toFixed(2)}`);
    }
  }

  /**
   * Mobile: zoom
   */
  onMobileZoom(delta) {
    if (!this.orbitEnabled) return;
    
    this.cameraDistance = Math.max(1.5, Math.min(8, this.cameraDistance - delta * 0.1));
    
    if (this.debug) {
      console.log(`[ControlManager] Camera distance: ${this.cameraDistance.toFixed(2)}`);
    }
  }

  /**
   * Update AnimationState based on current control state
   */
  updateAnimationState() {
    updateAnimationState({
      isMoving: this.moveVector.x !== 0 || this.moveVector.z !== 0,
      isRunning: this.isRunning,
      isJumping: this.isJumping,
    });

    if (this.debug) {
      console.log(`[ControlManager] State: moving=${AnimationState.isMoving}, running=${AnimationState.isRunning}, jumping=${AnimationState.isJumping}`);
    }
  }

  /**
   * Reset all movement state
   */
  resetMovement() {
    this.moveVector = { x: 0, z: 0 };
    this.isRunning = false;
    this.isJumping = false;
    this.keys = {};
    this.updateAnimationState();
  }

  /**
   * Get current movement vector
   */
  getMovementVector() {
    return { ...this.moveVector };
  }

  /**
   * Get current movement speed
   */
  getMovementSpeed() {
    if (AnimationState.isRunning) return this.runSpeed;
    if (AnimationState.isMoving) return this.walkSpeed;
    return 0;
  }

  /**
   * Get camera state
   */
  getCameraState() {
    return {
      target: this.cameraTarget,
      distance: this.cameraDistance,
      orbit: { ...this.cameraOrbit },
    };
  }

  /**
   * Set camera distance
   */
  setCameraDistance(distance) {
    this.cameraDistance = Math.max(1.5, Math.min(8, distance));
  }

  /**
   * Enable/disable orbit
   */
  setOrbitEnabled(enabled) {
    this.orbitEnabled = enabled;
  }

  /**
   * Enable/disable keyboard
   */
  setKeyboardEnabled(enabled) {
    this.keyboardEnabled = enabled;
  }

  /**
   * Dispose and cleanup
   */
  dispose() {
    if (this._keydownListener) {
      document.removeEventListener('keydown', this._keydownListener);
    }
    if (this._keyupListener) {
      document.removeEventListener('keyup', this._keyupListener);
    }
    
    this.keys = {};
    this.avatarManagers.clear();
    this.activeAvatarId = null;
    this.cameraTarget = null;
    
    if (this.debug) {
      console.log('[ControlManager] Disposed');
    }
  }
}

/**
 * Camera follow with smooth interpolation
 */
export function updateCameraFollow(camera, controlManager, deltaTime = 1/60) {
  const cameraState = controlManager.getCameraState();
  if (!cameraState.target) return;

  const target = cameraState.target;
  const distance = cameraState.distance;
  const orbit = cameraState.orbit;

  // Calculate desired position
  const x = target.x + Math.sin(orbit.x) * Math.cos(orbit.y) * distance;
  const y = target.y + Math.sin(orbit.y) * distance + 1.6; // Eye height
  const z = target.z + Math.cos(orbit.x) * Math.cos(orbit.y) * distance;

  // Smooth interpolation
  const smoothness = 8;
  camera.position.x += (x - camera.position.x) * smoothness * deltaTime;
  camera.position.y += (y - camera.position.y) * smoothness * deltaTime;
  camera.position.z += (z - camera.position.z) * smoothness * deltaTime;

  camera.lookAt(target.x, target.y + 1.6, target.z);
}