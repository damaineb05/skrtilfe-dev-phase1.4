/**
 * ThirdPersonController
 * ─────────────────────────────────────────────────────────────
 * Enhanced fashion avatar controller with idle/walk/run/jump/land states.
 * Supports joystick input, gender-aware animation binding, and strafe-ready foundation.
 * Designed for third-person fashion/avatar showcase with future shooter-style movement support.
 * 
 * Features:
 * - State machine: idle → walk ↔ run → jump → fall → landing
 * - Joystick support: analog stick input with deadzone
 * - Gender-aware animation: masculine/feminine locomotion clip selection
 * - Strafe-ready: direction tracking for 8-way movement (forward, backward, left, right, diagonals)
 * - Landing state: smooth transition after jump/fall
 * - Camera-relative movement: avatar faces camera-forward by default
 * - Fallback animation blending: graceful degradation if clip missing
 */

export const ThirdPersonMode = Object.freeze({
  IDLE:    'idle',
  WALK:    'walk',
  RUN:     'run',
  JUMP:    'jump',
  FALL:    'fall',
  LANDING: 'landing',
});

export const StrafeDirection = Object.freeze({
  NONE:          'none',
  FORWARD:       'forward',
  FORWARD_RIGHT: 'forward_right',
  RIGHT:         'right',
  BACKWARD_RIGHT:'backward_right',
  BACKWARD:      'backward',
  BACKWARD_LEFT: 'backward_left',
  LEFT:          'left',
  FORWARD_LEFT:  'forward_left',
});

const WALK_SPEED    = 2.5;
const RUN_SPEED     = 6.0;
const JUMP_FORCE    = 6.0;
const GRAVITY       = -18.0;
const GROUND_Y      = 0;
const LANDING_DURATION = 0.4; // seconds before return to idle/walk/run
const JOYSTICK_DEADZONE = 0.15; // ignore joystick values below this threshold

class ThirdPersonController {
  /**
   * @param {{
   *   avatarRuntime:      object,   // { getRoot(), getMixer() }
   *   inputController:    object,   // { getInput(), getJoystick() }
   *   animationController: object,  // { setLocomotionState() }
   *   cameraController:   object,   // { getForwardVector(), getRightVector() }
   *   avatarGender:       string,   // 'masculine' or 'feminine'
   * }}
   */
  constructor({ avatarRuntime, inputController, animationController, cameraController, avatarGender = 'masculine' }) {
    this.avatar = avatarRuntime;
    this.input  = inputController;
    this.anim   = animationController;
    this.camera = cameraController;

    this.avatarGender = avatarGender || 'masculine'; // Used for animation selection

    this.velocity = [0, 0, 0];
    this.grounded = true;
    this.mode = ThirdPersonMode.IDLE;
    this.strafeDirection = StrafeDirection.NONE;

    this.forceIdle = false;
    this.landingTimer = 0; // tracks landing state duration
    this._initialized = false;
  }

  /**
   * Update loop — called once per frame
   * @param {number} delta — elapsed time in seconds
   */
  update(delta) {
    if (!delta || delta <= 0) return;

    const root = this.avatar?.getRoot?.();
    if (!root) return;

    // ── INITIALIZATION ──────────────────────────────────────
    if (!this._initialized) {
      this._initialized = true;
      root.position.y = GROUND_Y;
      this.grounded = true;
      this.velocity = [0, 0, 0];
      this.mode = ThirdPersonMode.IDLE;
      if (this.anim) this.anim.setLocomotionState(ThirdPersonMode.IDLE);
      return;
    }

    // ── FORCE IDLE (E KEY) ──────────────────────────────────
    const input = this.input.getInput();
    if (input.idle) {
      this._forceIdleState(root);
      return;
    }

    // ── LANDING STATE DECAY ─────────────────────────────────
    if (this.mode === ThirdPersonMode.LANDING) {
      this.landingTimer -= delta;
      if (this.landingTimer <= 0) {
        // Landing finished, return to idle/walk/run based on input
        const dir = this._getDirection(input);
        const isMoving = dir[0] !== 0 || dir[2] !== 0;
        const nextMode = !isMoving ? ThirdPersonMode.IDLE
                         : input.run ? ThirdPersonMode.RUN
                         : ThirdPersonMode.WALK;
        this.mode = nextMode;
        this.anim?.setLocomotionState(nextMode);
      }
      return; // landing is passive — don't process input movement
    }

    // ── JOYSTICK INPUT (ANALOG) ─────────────────────────────
    const joystick = this.input.getJoystick?.();
    let dir = this._getDirection(input, joystick);
    let isMoving = dir[0] !== 0 || dir[2] !== 0;

    const speed = input.run ? RUN_SPEED : WALK_SPEED;
    let vx = isMoving ? dir[0] * speed : 0;
    let vz = isMoving ? dir[2] * speed : 0;

    // ── VERTICAL PHYSICS ────────────────────────────────────
    let vy = this.velocity[1];

    if (this.grounded && input.jump) {
      vy = JUMP_FORCE;
      this.grounded = false;
    } else {
      vy += GRAVITY * delta;
    }

    this.velocity = [vx, vy, vz];

    // ── APPLY MOVEMENT ──────────────────────────────────────
    root.position.x += vx * delta;
    root.position.y += vy * delta;
    root.position.z += vz * delta;

    // ── GROUND CHECK & LANDING ──────────────────────────────
    if (root.position.y <= GROUND_Y) {
      root.position.y = GROUND_Y;
      this.grounded = true;
      this.velocity[1] = 0;

      // Entering landing state if coming from air
      const wasAirborne = this.mode === ThirdPersonMode.JUMP || this.mode === ThirdPersonMode.FALL;
      if (wasAirborne) {
        this.mode = ThirdPersonMode.LANDING;
        this.landingTimer = LANDING_DURATION;
        this.anim?.setLocomotionState(ThirdPersonMode.LANDING);
        return; // Process landing decay next frame
      }

      if (!isMoving) {
        this.velocity[0] = 0;
        this.velocity[2] = 0;
      }
    }

    // ── AVATAR ROTATION (LOOK AT MOVEMENT DIRECTION) ────────
    if (isMoving) {
      const angle = Math.atan2(vx, vz);
      root.rotation.y = angle;
    }

    // ── MODE STATE MACHINE ──────────────────────────────────
    let nextMode;

    if (!this.grounded && vy > 0) {
      nextMode = ThirdPersonMode.JUMP;
    } else if (!this.grounded) {
      nextMode = ThirdPersonMode.FALL;
    } else if (!isMoving) {
      nextMode = ThirdPersonMode.IDLE;
    } else if (input.run && isMoving) {
      nextMode = ThirdPersonMode.RUN;
    } else {
      nextMode = ThirdPersonMode.WALK;
    }

    if (nextMode !== this.mode) {
      this.mode = nextMode;
      this.anim?.setLocomotionState(nextMode);
    }

    // ── STRAFE DIRECTION TRACKING (for future shooter logic) ─
    this.strafeDirection = this._getStrafeDirection(dir);
  }

  /**
   * Force idle state immediately
   * @private
   */
  _forceIdleState(root) {
    this.velocity = [0, 0, 0];
    root.position.y = GROUND_Y;
    this.grounded = true;
    if (this.mode !== ThirdPersonMode.IDLE) {
      this.mode = ThirdPersonMode.IDLE;
      this.anim?.setLocomotionState(ThirdPersonMode.IDLE);
    }
  }

  /**
   * Get movement direction from keyboard/joystick input
   * @private
   * @param {object} input - keyboard input (forward, backward, left, right, run)
   * @param {object} joystick - analog stick input (x, y) or null
   * @returns {[number, number, number]} - normalized [x, 0, z] direction
   */
  _getDirection(input, joystick = null) {
    const forward = this.camera?.getForwardVector() || [0, 0, -1];
    const right   = this.camera?.getRightVector()   || [1, 0, 0];

    let x = 0, z = 0;

    // ── Keyboard input (binary) ─────────────────────────────
    if (input.forward)  { x += forward[0]; z += forward[2]; }
    if (input.backward) { x -= forward[0]; z -= forward[2]; }
    if (input.right)    { x += right[0];   z += right[2]; }
    if (input.left)     { x -= right[0];   z -= right[2]; }

    // ── Joystick input (analog) with deadzone ──────────────
    if (joystick && (Math.abs(joystick.x) > JOYSTICK_DEADZONE || Math.abs(joystick.y) > JOYSTICK_DEADZONE)) {
      const magnitude = Math.sqrt(joystick.x * joystick.x + joystick.y * joystick.y);
      if (magnitude > JOYSTICK_DEADZONE) {
        const normalized = { x: joystick.x / magnitude, y: joystick.y / magnitude };
        // Joystick Y is typically inverted (up = negative)
        x += normalized.x * right[0] + (-normalized.y) * forward[0];
        z += normalized.x * right[2] + (-normalized.y) * forward[2];
      }
    }

    // ── Normalize final direction ───────────────────────────
    const len = Math.sqrt(x * x + z * z);
    if (len === 0) return [0, 0, 0];

    return [x / len, 0, z / len];
  }

  /**
   * Determine strafe direction from movement vector
   * Supports 8-way directions for future shooter-style movement
   * @private
   * @param {[number, number, number]} dir - normalized movement direction
   * @returns {string} - StrafeDirection value
   */
  _getStrafeDirection(dir) {
    const [x, _, z] = dir;
    
    if (x === 0 && z === 0) return StrafeDirection.NONE;

    const angle = Math.atan2(x, z) * (180 / Math.PI);
    const normalized = angle < 0 ? angle + 360 : angle;

    // 8-way direction detection (45° zones)
    if (normalized >= 337.5 || normalized < 22.5)  return StrafeDirection.FORWARD;
    if (normalized >= 22.5  && normalized < 67.5)  return StrafeDirection.FORWARD_RIGHT;
    if (normalized >= 67.5  && normalized < 112.5) return StrafeDirection.RIGHT;
    if (normalized >= 112.5 && normalized < 157.5) return StrafeDirection.BACKWARD_RIGHT;
    if (normalized >= 157.5 && normalized < 202.5) return StrafeDirection.BACKWARD;
    if (normalized >= 202.5 && normalized < 247.5) return StrafeDirection.BACKWARD_LEFT;
    if (normalized >= 247.5 && normalized < 292.5) return StrafeDirection.LEFT;
    if (normalized >= 292.5 && normalized < 337.5) return StrafeDirection.FORWARD_LEFT;

    return StrafeDirection.NONE;
  }

  /**
   * Change avatar gender and reload animations
   * @param {string} newGender - 'masculine' or 'feminine'
   */
  setAvatarGender(newGender) {
    if (newGender === this.avatarGender) return;
    this.avatarGender = newGender;
    // Animation reload is handled by parent (DripSyncViewport via hardReloadToken)
  }

  /**
   * Get current controller state (for debugging/ui)
   * @returns {object}
   */
  getState() {
    return {
      mode: this.mode,
      grounded: this.grounded,
      velocity: [...this.velocity],
      strafeDirection: this.strafeDirection,
      gender: this.avatarGender,
    };
  }

  /**
   * Reset controller to idle state
   */
  reset() {
    this.velocity = [0, 0, 0];
    this.grounded = true;
    this.mode = ThirdPersonMode.IDLE;
    this.strafeDirection = StrafeDirection.NONE;
    this.landingTimer = 0;
    if (this.anim) this.anim.setLocomotionState(ThirdPersonMode.IDLE);
  }

  /**
   * Destroy controller references
   */
  destroy() {
    this.reset();
    this.avatar = null;
    this.input = null;
    this.anim = null;
    this.camera = null;
  }
}

export default ThirdPersonController;