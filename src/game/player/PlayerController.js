import * as THREE from 'three';
import { LOCOMOTION } from '@/lib/interaction/interactionConfig';

/**
 * Third-person character controller. Reads continuous input from InputManager
 * and camera-relative directions from CameraRig, integrates gravity + jump,
 * resolves XZ collisions against WorldManager boxes, and drives the avatar's
 * animation state.
 *
 * onInteract is invoked once when the player presses E (the SkrtWorld shell
 * resolves it against the current InteractionManager target).
 */
export default class PlayerController {
  constructor({ avatar, input, camera, world }) {
    this.avatar = avatar;
    this.input = input;
    this.camera = camera;
    this.world = world;

    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.rotation = 0;

    this.walkSpeed = LOCOMOTION.WALK_SPEED;
    this.runSpeed = LOCOMOTION.RUN_SPEED;
    this.jumpVelocity = LOCOMOTION.JUMP_VELOCITY;
    this.gravity = LOCOMOTION.GRAVITY;
    this.grounded = true;

    this.onInteract = null;
    this.onVehicle = null;

    this._fwd = new THREE.Vector3();
    this._right = new THREE.Vector3();
    this._dir = new THREE.Vector3();
    this._testing = new THREE.Vector3();
  }

  spawnAt(v, rot = 0) {
    this.position.set(v.x, v.y, v.z);
    this.rotation = rot;
    this.velocity.set(0, 0, 0);
    this.grounded = true;
    this.avatar.root.position.copy(this.position);
    this.avatar.root.rotation.y = rot;
    this.camera.setTarget(this.position);
    this.camera.yaw = -rot;
  }

  update(dt) {
    this.camera.forward(this._fwd);
    this.camera.right(this._right);

    const mz = this.input.moveZ;
    const mx = this.input.moveX;
    this._dir.set(0, 0, 0).addScaledVector(this._fwd, mz).addScaledVector(this._right, mx);
    const moving = this._dir.lengthSq() > 0.001;
    if (moving) this._dir.normalize();

    const speed = this.input.running ? this.runSpeed : this.walkSpeed;
    // Smooth accel/decel toward desired velocity — responsive, not twitchy.
    const desX = this._dir.x * speed;
    const desZ = this._dir.z * speed;
    const rate = moving ? LOCOMOTION.ACCEL : LOCOMOTION.DECEL;
    const vk = Math.min(1, rate * dt);
    this.velocity.x += (desX - this.velocity.x) * vk;
    this.velocity.z += (desZ - this.velocity.z) * vk;

    // gravity + jump
    this.velocity.y -= this.gravity * dt;
    const actions = this.input.consumeActions();
    for (const a of actions) {
      if (a === 'jump' && this.grounded) { this.velocity.y = this.jumpVelocity; this.grounded = false; }
      else if (a === 'interact' && this.onInteract) this.onInteract();
      else if (a === 'vehicle' && this.onVehicle) this.onVehicle();
    }

    // horizontal integrate + collide
    const nextX = this.position.x + this.velocity.x * dt;
    const nextZ = this.position.z + this.velocity.z * dt;
    const resolved = this.world.resolveCollisions(this.position, nextX, nextZ);
    this.position.x = resolved.x;
    this.position.z = resolved.z;

    // vertical integrate (floor at y=0)
    this.position.y += this.velocity.y * dt;
    if (this.position.y <= 0) { this.position.y = 0; this.velocity.y = 0; this.grounded = true; }

    if (moving) {
      // Smoothly turn toward travel direction (shortest angular path) — no snap.
      const targetRot = Math.atan2(this._dir.x, this._dir.z);
      let delta = targetRot - this.rotation;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      this.rotation += delta * Math.min(1, LOCOMOTION.TURN_RATE * dt);
    }

    this.avatar.root.position.copy(this.position);
    this.avatar.root.rotation.y = this.rotation;

    // animation state
    let state = 'idle';
    if (!this.grounded) state = this.velocity.y > 0.3 ? 'jump' : 'fall';
    else if (moving) state = this.input.running ? 'run' : 'walk';
    this.avatar.setState(state);

    this.camera.setTarget(this.position);
  }
}