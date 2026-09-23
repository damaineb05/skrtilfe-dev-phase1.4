export const MovementMode = Object.freeze({
  IDLE: 'idle',
  WALK: 'walk',
  RUN:  'run',
  JUMP: 'jump',
  FALL: 'fall',
});

const WALK_SPEED = 2.5;
const RUN_SPEED  = 6.0;
const JUMP_FORCE = 6.0;
const GRAVITY    = -18.0;
const GROUND_Y   = 0;

class MovementController {
  constructor({ avatarRuntime, inputController, animationController, cameraController }) {
    this.avatar = avatarRuntime;
    this.input  = inputController;
    this.anim   = animationController;
    this.camera = cameraController;

    this.velocity = [0, 0, 0];
    this.grounded = true;
    this.mode = MovementMode.IDLE;

    this.forceIdle = false;
    this._initialized = false;  // track first frame
  }

  update(delta) {
    if (!delta) return;

    const root = this.avatar?.getRoot?.();
    if (!root) return;

    // Force grounded idle on first frame — ensures mobile loads grounded
    if (!this._initialized) {
      this._initialized = true;
      root.position.y = 0;  // GROUND_Y
      this.grounded = true;
      this.velocity = [0, 0, 0];
      this.mode = MovementMode.IDLE;
      if (this.anim) this.anim.setLocomotionState(MovementMode.IDLE);
      return;
    }

    const input = this.input.getInput();

    // ── ABSOLUTE IDLE (E KEY) ─────────────────
    if (input.idle) {
      this._forceIdleState(root);
      return;
    }

    // ── MOVEMENT INPUT ──────────────────────
    const dir = this._getDirection(input);
    const isMoving = dir[0] !== 0 || dir[2] !== 0;

    const speed = input.run ? RUN_SPEED : WALK_SPEED;

    let vx = isMoving ? dir[0] * speed : 0;
    let vz = isMoving ? dir[2] * speed : 0;

    // ── VERTICAL ────────────────────────────
    let vy = this.velocity[1];

    if (this.grounded && input.jump) {
      vy = JUMP_FORCE;
      this.grounded = false;
    } else {
      vy += GRAVITY * delta;
    }

    this.velocity = [vx, vy, vz];

    // ── APPLY MOVEMENT ──────────────────────
    root.position.x += vx * delta;
    root.position.y += vy * delta;
    root.position.z += vz * delta;

    // ── GROUND CHECK ────────────────────────
    if (root.position.y <= GROUND_Y) {
      root.position.y = GROUND_Y;
      this.grounded = true;
      this.velocity[1] = 0;
      if (!isMoving) {
        this.velocity[0] = 0;
        this.velocity[2] = 0;
      }
    }

    // ── ROTATION ────────────────────────────
    if (isMoving) {
      const angle = Math.atan2(vx, vz);
      root.rotation.y = angle;
    }

    // ── MODE LOGIC ──────────────────────────
    let nextMode;

    if (!this.grounded && vy > 0) {
      nextMode = MovementMode.JUMP;
    } else if (!this.grounded) {
      nextMode = MovementMode.FALL;
    } else if (!isMoving) {
      nextMode = MovementMode.IDLE;
    } else if (input.run && isMoving) {
      nextMode = MovementMode.RUN;
    } else {
      nextMode = MovementMode.WALK;
    }

    if (nextMode !== this.mode) {
      this.mode = nextMode;
      this.anim?.setLocomotionState(nextMode);
    }

    // ── LANDING STATE TRANSITION ──────────────
    // Force animation state when landing after jump/fall
    const wasInAir = this.mode === MovementMode.JUMP || this.mode === MovementMode.FALL;
    if (wasInAir && this.grounded && nextMode !== MovementMode.JUMP && nextMode !== MovementMode.FALL) {
      if (nextMode !== this.mode) {
        this.mode = nextMode;
        this.anim?.setLocomotionState(nextMode);
      }
    }
  }

  // ── ABSOLUTE IDLE FUNCTION ────────────────
  _forceIdleState(root) {
    // Stop ALL movement
    this.velocity = [0, 0, 0];

    // Snap to ground
    root.position.y = GROUND_Y;
    this.grounded = true;

    // Reset animation
    if (this.mode !== MovementMode.IDLE) {
      this.mode = MovementMode.IDLE;
      this.anim?.setLocomotionState(MovementMode.IDLE);
    }
  }

  // ── DIRECTION ─────────────────────────────
  _getDirection(input) {
    const forward = this.camera?.getForwardVector() || [0, 0, -1];
    const right   = this.camera?.getRightVector()   || [1, 0, 0];

    let x = 0, z = 0;

    if (input.forward)  { x += forward[0]; z += forward[2]; }
    if (input.backward) { x -= forward[0]; z -= forward[2]; }
    if (input.right)    { x += right[0];   z += right[2]; }
    if (input.left)     { x -= right[0];   z -= right[2]; }

    const len = Math.sqrt(x * x + z * z);
    if (len === 0) return [0, 0, 0];

    return [x / len, 0, z / len];
  }
}

export default MovementController;