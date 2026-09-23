import * as THREE from 'three';

/**
 * DripSync Collision System — Robust Edition
 * 
 * Features:
 * - Capsule-based avatar collider
 * - Downward raycasting for proper floor following (walks on stairs, ramps, interior floors)
 * - 8-directional horizontal raycasting for wall / obstacle push-back
 * - Upward ray to detect low ceilings (prevents clipping through overhangs)
 * - Ground-level fallback when no mesh floor found
 * - Real-time gravity + jump physics
 */

const GRAVITY = -22;
const JUMP_IMPULSE = 7.5;
const MAX_STEP_HEIGHT = 0.45;       // how high a step the avatar can auto-climb
const FLOOR_SNAP_DISTANCE = 0.6;   // max downward ray distance to snap to floor
const WALL_SKIN = 0.32;            // push-back distance from walls

export class CollisionSystem {
  constructor(scene, avatar) {
    this.scene = scene;
    this.avatar = avatar;
    this.enabled = true;

    this.avatarCollider = {
      radius: WALL_SKIN,
      height: 1.8,
      center: new THREE.Vector3(0, 0.9, 0),
    };

    this.groundLevel = 0;
    this.collisionMeshes = [];

    // Physics state
    this.verticalVelocity = 0;
    this._isGrounded = true;

    // Raycasters
    this.downRay = new THREE.Raycaster();
    this.downRay.near = 0;
    this.downRay.far = FLOOR_SNAP_DISTANCE + MAX_STEP_HEIGHT + 2;

    this.horizontalRay = new THREE.Raycaster();
    this.horizontalRay.near = 0;
    this.horizontalRay.far = WALL_SKIN + 0.15;

    this.upRay = new THREE.Raycaster();
    this.upRay.near = 0;
    this.upRay.far = 0.3;

    // 8 horizontal directions for wall checks
    this._wallDirs = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0.707, 0, 0.707),
      new THREE.Vector3(-0.707, 0, 0.707),
      new THREE.Vector3(0.707, 0, -0.707),
      new THREE.Vector3(-0.707, 0, -0.707),
    ];

    this._down = new THREE.Vector3(0, -1, 0);
    this._up = new THREE.Vector3(0, 1, 0);

    this.debugMode = false;
    this.debugHelpers = [];
  }

  // ─────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────

  registerEnvironmentMeshes(meshes) {
    this.collisionMeshes = Array.isArray(meshes) ? meshes : [meshes];
    console.log(`[Collision] Registered ${this.collisionMeshes.length} collision meshes`);
  }

  updateColliders(meshes) {
    this.collisionMeshes = Array.isArray(meshes) ? [...meshes] : [meshes];
    console.log(`[Collision] Updated ${this.collisionMeshes.length} collision meshes`);
  }

  setGroundLevel(level) {
    this.groundLevel = typeof level === 'number' ? level : 0;
  }

  getIsGrounded() {
    return this._isGrounded;
  }

  jump() {
    if (this._isGrounded) {
      this.verticalVelocity = JUMP_IMPULSE;
      this._isGrounded = false;
    }
  }

  /**
   * Main entry: called from the animation loop with current avatar position and delta.
   * Returns the corrected position.
   */
  update(currentPos, desiredHorizontalPos, delta) {
    if (!this.enabled) {
      return { position: desiredHorizontalPos, grounded: true };
    }

    // 1. Horizontal wall push-back
    let pos = this._resolveWalls(desiredHorizontalPos.clone());

    // 2. Vertical: gravity + floor snap
    this.verticalVelocity += GRAVITY * delta;
    pos.y += this.verticalVelocity * delta;

    const floorResult = this._findFloor(pos);

    if (floorResult.found) {
      const floorY = floorResult.y;
      if (pos.y <= floorY + 0.01) {
        pos.y = floorY;
        this.verticalVelocity = 0;
        this._isGrounded = true;
      } else {
        this._isGrounded = false;
      }
    } else {
      // Fallback to flat ground plane
      const fallback = this.groundLevel;
      if (pos.y <= fallback) {
        pos.y = fallback;
        this.verticalVelocity = 0;
        this._isGrounded = true;
      } else {
        this._isGrounded = false;
      }
    }

    // 3. Ceiling check
    pos = this._resolveCeiling(pos);

    // 4. World boundary safety net
    const MAX = 120;
    pos.x = Math.max(-MAX, Math.min(MAX, pos.x));
    pos.z = Math.max(-MAX, Math.min(MAX, pos.z));

    return { position: pos, grounded: this._isGrounded };
  }

  /** Legacy compat: constrainMovement used by DripSyncViewport */
  constrainMovement(currentPos, desiredPos) {
    // horizontal only wall check
    return this._resolveWalls(desiredPos.clone());
  }

  /** Legacy compat: called by DripSyncViewport after manual Y integration */
  applyPhysics(position, delta) {
    return position;
  }

  /** Legacy compat */
  checkCollisions(proposedPosition) {
    let pos = this._resolveWalls(proposedPosition.clone());
    const floorResult = this._findFloor(pos);
    const floorY = floorResult.found ? floorResult.y : this.groundLevel;
    if (pos.y < floorY) {
      pos.y = floorY;
      this._isGrounded = true;
    }
    return this._checkBoundaries(pos);
  }

  isGrounded(position) {
    const floorResult = this._findFloor(position);
    if (floorResult.found) {
      return Math.abs(position.y - floorResult.y) < 0.12;
    }
    return Math.abs(position.y - this.groundLevel) < 0.12;
  }

  updateCollider(radius, height, offset) {
    if (radius) this.avatarCollider.radius = radius;
    if (height) this.avatarCollider.height = height;
    if (offset) this.avatarCollider.center.copy(offset);
  }

  dispose() {
    this.debugHelpers.forEach(h => {
      if (h.parent) h.parent.remove(h);
      h.geometry?.dispose();
      h.material?.dispose();
    });
    this.debugHelpers = [];
    this.collisionMeshes = [];
  }

  // ─────────────────────────────────────────────
  // Internal helpers
  // ─────────────────────────────────────────────

  /** Cast a ray downward from slightly above avatar position to find floor mesh */
  _findFloor(pos) {
    if (this.collisionMeshes.length === 0) return { found: false };

    // Cast from capsule center height, looking down
    const origin = new THREE.Vector3(
      pos.x,
      pos.y + this.avatarCollider.height,
      pos.z
    );

    this.downRay.set(origin, this._down);
    this.downRay.far = this.avatarCollider.height + FLOOR_SNAP_DISTANCE + MAX_STEP_HEIGHT;

    const hits = this.downRay.intersectObjects(this.collisionMeshes, true);
    if (hits.length === 0) return { found: false };

    // Pick the highest floor hit (for stairs / ramps)
    let bestY = -Infinity;
    for (const hit of hits) {
      // Only treat near-horizontal faces as floor (normal.y > 0.5)
      const normal = hit.face?.normal;
      if (normal) {
        // transform normal to world space
        const worldNormal = normal.clone().transformDirection(hit.object.matrixWorld);
        if (worldNormal.y < 0.4) continue; // skip walls / ceilings
      }
      const hitY = hit.point.y;
      if (hitY > bestY) bestY = hitY;
    }

    if (bestY === -Infinity) return { found: false };
    return { found: true, y: bestY };
  }

  /** Push avatar away from walls using horizontal raycasts */
  _resolveWalls(pos) {
    if (this.collisionMeshes.length === 0) return pos;

    const capsuleBase = new THREE.Vector3(pos.x, pos.y + 0.05, pos.z);
    const capsuleMid  = new THREE.Vector3(pos.x, pos.y + this.avatarCollider.height * 0.5, pos.z);
    const capsuleTop  = new THREE.Vector3(pos.x, pos.y + this.avatarCollider.height * 0.9, pos.z);
    const checkPoints = [capsuleBase, capsuleMid, capsuleTop];

    for (const dir of this._wallDirs) {
      for (const origin of checkPoints) {
        this.horizontalRay.set(origin, dir);
        this.horizontalRay.far = WALL_SKIN + 0.12;

        const hits = this.horizontalRay.intersectObjects(this.collisionMeshes, true);
        if (hits.length === 0) continue;

        const hit = hits[0];

        // Only push back on near-vertical surfaces (walls)
        const normal = hit.face?.normal;
        if (normal) {
          const worldNormal = normal.clone().transformDirection(hit.object.matrixWorld);
          if (Math.abs(worldNormal.y) > 0.75) continue; // nearly horizontal = floor/ceiling, skip
        }

        const penetration = WALL_SKIN - hit.distance;
        if (penetration > 0) {
          // Push back along the opposite of the ray direction
          pos.x -= dir.x * penetration;
          pos.z -= dir.z * penetration;
        }
      }
    }

    return pos;
  }

  /** Prevent clipping through ceilings */
  _resolveCeiling(pos) {
    if (this.collisionMeshes.length === 0) return pos;

    const origin = new THREE.Vector3(pos.x, pos.y + this.avatarCollider.height, pos.z);
    this.upRay.set(origin, this._up);
    this.upRay.far = 0.25;

    const hits = this.upRay.intersectObjects(this.collisionMeshes, true);
    if (hits.length > 0) {
      const hit = hits[0];
      const headY = hit.point.y - this.avatarCollider.height;
      if (pos.y > headY) {
        pos.y = headY;
        if (this.verticalVelocity > 0) this.verticalVelocity = 0;
      }
    }
    return pos;
  }

  _checkBoundaries(pos) {
    const MAX = 120;
    pos.x = Math.max(-MAX, Math.min(MAX, pos.x));
    pos.z = Math.max(-MAX, Math.min(MAX, pos.z));
    return pos;
  }

  setDebugMode(enabled) {
    this.debugMode = enabled;
    if (!enabled) {
      this.debugHelpers.forEach(h => {
        if (h.parent) h.parent.remove(h);
      });
      this.debugHelpers = [];
    }
  }
}

export default CollisionSystem;