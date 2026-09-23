import * as THREE from 'three';
import { LOOK, CAMERA_DAMPING } from '@/lib/interaction/interactionConfig';

/**
 * Third-person orbit camera that follows the player avatar.
 * Consumes mouse deltas from InputManager each frame.
 */
export default class CameraRig {
  constructor(camera, input) {
    this.camera = camera;
    this.input = input;
    this.yaw = 0;
    this.pitch = 0.42;
    this.distance = 6.5;
    this.target = new THREE.Vector3();
    this._off = new THREE.Vector3();
    this._desired = new THREE.Vector3();
    // Conservative camera obstruction (Phase F.5 §7): optional world colliders.
    // When set, the desired camera position is pulled in along its ray so it
    // never sits inside a wall. Does NOT change the follow/look math.
    this._colliders = null;
    this._cOrigin = new THREE.Vector3();
    this._cDir = new THREE.Vector3();
    this._cHit = new THREE.Vector3();
    this._cRay = new THREE.Ray();
  }

  /** Provide the world's collision boxes so the camera can avoid clipping into walls. */
  setColliders(box3Array) { this._colliders = box3Array || null; }

  setTarget(v) { this.target.copy(v); }

  update(dt) {
    const { dx, dy } = this.input.consumeMouse();
    this.yaw -= dx * LOOK.YAW_PER_PX;
    this.pitch = Math.max(LOOK.PITCH_MIN, Math.min(LOOK.PITCH_MAX, this.pitch + dy * LOOK.PITCH_PER_PX));

    const cp = Math.cos(this.pitch);
    const d = this.distance;
    this._off.set(
      Math.sin(this.yaw) * cp * d,
      Math.sin(this.pitch) * d + 1.5,
      Math.cos(this.yaw) * cp * d
    );
    this._desired.copy(this.target).add(this._off);
    this._avoidObstruction();

    const k = 1 - Math.pow(CAMERA_DAMPING.FOLLOW_K_BASE, dt);
    this.camera.position.lerp(this._desired, k);
    this.camera.lookAt(this.target.x, this.target.y + 1.35, this.target.z);
  }

  /** World-space forward vector on XZ (the direction the avatar should move when pressing W). */
  forward(out) {
    return out.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
  }
  right(out) {
    return out.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
  }

  /** Raycast from the look origin to the desired camera pos; if a collider is
   *  closer than the full distance, pull the camera in to just before it. */
  _avoidObstruction() {
    if (!this._colliders || !this._colliders.length) return;
    this._cOrigin.copy(this.target); this._cOrigin.y += 1.35;
    this._cDir.copy(this._desired).sub(this._cOrigin);
    const full = this._cDir.length();
    if (full < 0.001) return;
    this._cDir.normalize();
    this._cRay.set(this._cOrigin, this._cDir);
    let nearest = full;
    for (const b of this._colliders) {
      const hit = this._cRay.intersectBox(b, this._cHit);
      if (hit) {
        const hd = this._cOrigin.distanceTo(hit);
        if (hd < nearest) nearest = hd;
      }
    }
    if (nearest < full) {
      const safe = Math.max(0.6, nearest - 0.5);
      this._desired.copy(this._cOrigin).addScaledVector(this._cDir, safe);
    }
  }
}