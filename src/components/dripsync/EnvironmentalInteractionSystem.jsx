import * as THREE from 'three';

/**
 * Environmental Interaction System
 * Handles IK-based avatar interactions with scene objects
 */

// ==================== IK SOLVER ====================

export class IKSolver {
  constructor(options = {}) {
    this.iterations = options.iterations || 10;
    this.tolerance = options.tolerance || 0.01;
  }

  /**
   * Two-bone IK solver (for arms and legs)
   * @param {THREE.Bone} root - Upper bone (shoulder/hip)
   * @param {THREE.Bone} mid - Middle bone (elbow/knee)
   * @param {THREE.Bone} end - End bone (hand/foot)
   * @param {THREE.Vector3} target - Target position in world space
   * @param {THREE.Vector3} poleTarget - Pole vector for elbow/knee direction
   * @param {number} blend - Blend factor (0-1)
   */
  solveTwoBone(root, mid, end, target, poleTarget, blend = 1) {
    if (!root || !mid || !end) return;

    // Get world positions
    const rootPos = new THREE.Vector3();
    const midPos = new THREE.Vector3();
    const endPos = new THREE.Vector3();
    
    root.getWorldPosition(rootPos);
    mid.getWorldPosition(midPos);
    end.getWorldPosition(endPos);

    // Calculate bone lengths
    const upperLength = rootPos.distanceTo(midPos);
    const lowerLength = midPos.distanceTo(endPos);
    const totalLength = upperLength + lowerLength;

    // Direction to target
    const targetPos = target.clone();
    const toTarget = targetPos.clone().sub(rootPos);
    const targetDist = Math.min(toTarget.length(), totalLength * 0.999);

    if (targetDist < 0.001) return;

    // Normalize direction
    const targetDir = toTarget.normalize();

    // Calculate angles using law of cosines
    const a = upperLength;
    const b = lowerLength;
    const c = targetDist;

    // Angle at root (shoulder/hip)
    const cosAngleRoot = (a * a + c * c - b * b) / (2 * a * c);
    const angleRoot = Math.acos(THREE.MathUtils.clamp(cosAngleRoot, -1, 1));

    // Angle at mid (elbow/knee)
    const cosAngleMid = (a * a + b * b - c * c) / (2 * a * b);
    const angleMid = Math.acos(THREE.MathUtils.clamp(cosAngleMid, -1, 1));

    // Calculate pole direction (for elbow/knee bend direction)
    const poleDir = poleTarget.clone().sub(rootPos).normalize();
    const cross = new THREE.Vector3().crossVectors(targetDir, poleDir).normalize();
    const bendDir = new THREE.Vector3().crossVectors(cross, targetDir).normalize();

    // Calculate new mid position
    const newMidPos = rootPos.clone()
      .add(targetDir.clone().multiplyScalar(Math.cos(angleRoot) * upperLength))
      .add(bendDir.clone().multiplyScalar(Math.sin(angleRoot) * upperLength));

    // Store original rotations for blending
    const origRootQuat = root.quaternion.clone();
    const origMidQuat = mid.quaternion.clone();

    // Rotate root bone to point at new mid position
    const rootToMid = newMidPos.clone().sub(rootPos).normalize();
    const rootUp = new THREE.Vector3(0, 1, 0);
    const rootMatrix = new THREE.Matrix4().lookAt(rootPos, newMidPos, rootUp);
    const rootQuat = new THREE.Quaternion().setFromRotationMatrix(rootMatrix);

    // Apply with blend
    root.quaternion.slerp(rootQuat, blend);

    // Rotate mid bone to point at target
    mid.getWorldPosition(midPos); // Update after root rotation
    const midToEnd = targetPos.clone().sub(midPos).normalize();
    const midMatrix = new THREE.Matrix4().lookAt(midPos, targetPos, rootUp);
    const midQuat = new THREE.Quaternion().setFromRotationMatrix(midMatrix);

    mid.quaternion.slerp(midQuat, blend);
  }

  /**
   * Foot placement IK - adjusts foot to ground height
   */
  solveFootPlacement(hipBone, kneeBone, footBone, groundHeight, blend = 1) {
    if (!footBone) return;

    const footPos = new THREE.Vector3();
    footBone.getWorldPosition(footPos);

    // Adjust foot to ground level
    const targetY = groundHeight + 0.02; // Small offset above ground
    if (footPos.y < targetY + 0.1) {
      const target = footPos.clone();
      target.y = targetY;

      const poleTarget = footPos.clone();
      poleTarget.z += 0.5; // Knee bends forward

      this.solveTwoBone(hipBone, kneeBone, footBone, target, poleTarget, blend);
    }
  }
}

// ==================== INTERACTIVE OBJECT BASE ====================

export class InteractiveObject {
  constructor(mesh, options = {}) {
    this.mesh = mesh;
    this.type = options.type || 'generic';
    this.interactionRadius = options.interactionRadius || 1.5;
    this.isHighlighted = false;
    this.isInteracting = false;
    this.interactionPoint = options.interactionPoint || new THREE.Vector3();
    this.onInteract = options.onInteract || (() => {});
    this.onRelease = options.onRelease || (() => {});
    
    // Store original material for highlighting
    if (mesh) {
      this.originalMaterial = mesh.material?.clone();
      this.highlightMaterial = this.createHighlightMaterial();
    }
  }

  createHighlightMaterial() {
    return new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.9
    });
  }

  highlight(enabled) {
    if (!this.mesh || this.isHighlighted === enabled) return;
    this.isHighlighted = enabled;
    
    if (enabled) {
      this.mesh.material = this.highlightMaterial;
    } else {
      this.mesh.material = this.originalMaterial;
    }
  }

  getWorldInteractionPoint() {
    if (!this.mesh) return this.interactionPoint.clone();
    const worldPos = new THREE.Vector3();
    this.mesh.getWorldPosition(worldPos);
    return worldPos.add(this.interactionPoint);
  }

  update(delta) {
    // Override in subclasses
  }

  dispose() {
    this.highlightMaterial?.dispose();
  }
}

// ==================== PICKUPABLE OBJECT ====================

export class PickupableObject extends InteractiveObject {
  constructor(mesh, options = {}) {
    super(mesh, { ...options, type: 'pickup' });
    this.isHeld = false;
    this.holdBone = null;
    this.holdOffset = options.holdOffset || new THREE.Vector3(0, 0.1, 0.1);
    this.holdRotation = options.holdRotation || new THREE.Euler(0, 0, 0);
    this.originalParent = mesh?.parent;
    this.originalPosition = mesh?.position.clone();
    this.originalRotation = mesh?.rotation.clone();
    this.weight = options.weight || 1;
    this.throwForce = options.throwForce || 5;
    
    // Physics state
    this.velocity = new THREE.Vector3();
    this.angularVelocity = new THREE.Vector3();
    this.isPhysicsActive = false;
  }

  pickup(handBone) {
    if (!this.mesh || this.isHeld) return false;
    
    this.isHeld = true;
    this.holdBone = handBone;
    this.isPhysicsActive = false;
    this.velocity.set(0, 0, 0);
    
    // Reparent to hand bone
    const worldPos = new THREE.Vector3();
    this.mesh.getWorldPosition(worldPos);
    
    handBone.add(this.mesh);
    this.mesh.position.copy(this.holdOffset);
    this.mesh.rotation.copy(this.holdRotation);
    
    this.onInteract(this);
    return true;
  }

  drop() {
    if (!this.mesh || !this.isHeld) return false;
    
    // Get world position before releasing
    const worldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();
    this.mesh.getWorldPosition(worldPos);
    this.mesh.getWorldQuaternion(worldQuat);
    
    // Reparent to original parent
    if (this.originalParent) {
      this.originalParent.add(this.mesh);
    }
    this.mesh.position.copy(worldPos);
    this.mesh.quaternion.copy(worldQuat);
    
    this.isHeld = false;
    this.holdBone = null;
    this.isPhysicsActive = true;
    this.velocity.set(0, -0.1, 0);
    
    this.onRelease(this);
    return true;
  }

  throw(direction, force = null) {
    if (!this.drop()) return;
    
    const throwStrength = force || this.throwForce;
    this.velocity.copy(direction.normalize().multiplyScalar(throwStrength));
    this.angularVelocity.set(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).multiplyScalar(3);
  }

  update(delta) {
    if (!this.mesh || !this.isPhysicsActive) return;
    
    // Simple physics simulation
    const gravity = -9.8;
    this.velocity.y += gravity * delta;
    
    this.mesh.position.add(this.velocity.clone().multiplyScalar(delta));
    this.mesh.rotation.x += this.angularVelocity.x * delta;
    this.mesh.rotation.y += this.angularVelocity.y * delta;
    this.mesh.rotation.z += this.angularVelocity.z * delta;
    
    // Ground collision
    if (this.mesh.position.y < 0.1) {
      this.mesh.position.y = 0.1;
      this.velocity.y *= -0.3; // Bounce
      this.velocity.x *= 0.8; // Friction
      this.velocity.z *= 0.8;
      this.angularVelocity.multiplyScalar(0.9);
      
      // Stop when slow enough
      if (this.velocity.length() < 0.1) {
        this.isPhysicsActive = false;
        this.velocity.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);
      }
    }
  }
}

// ==================== BUTTON OBJECT ====================

export class ButtonObject extends InteractiveObject {
  constructor(mesh, options = {}) {
    super(mesh, { ...options, type: 'button' });
    this.isPressed = false;
    this.pressDepth = options.pressDepth || 0.05;
    this.resetDelay = options.resetDelay || 0.5;
    this.resetTimer = 0;
    this.originalY = mesh?.position.y || 0;
    this.onPress = options.onPress || (() => {});
    this.color = options.color || 0xff0000;
    
    // Visual feedback
    if (mesh) {
      this.pressedMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.5
      });
      this.unpressedMaterial = new THREE.MeshStandardMaterial({
        color: this.color,
        emissive: this.color,
        emissiveIntensity: 0.2
      });
      mesh.material = this.unpressedMaterial;
    }
  }

  press() {
    if (!this.mesh || this.isPressed) return false;
    
    this.isPressed = true;
    this.mesh.position.y = this.originalY - this.pressDepth;
    this.mesh.material = this.pressedMaterial;
    this.resetTimer = this.resetDelay;
    
    this.onPress(this);
    this.onInteract(this);
    return true;
  }

  update(delta) {
    if (!this.isPressed) return;
    
    this.resetTimer -= delta;
    if (this.resetTimer <= 0) {
      this.isPressed = false;
      this.mesh.position.y = this.originalY;
      this.mesh.material = this.unpressedMaterial;
      this.onRelease(this);
    }
  }

  dispose() {
    super.dispose();
    this.pressedMaterial?.dispose();
    this.unpressedMaterial?.dispose();
  }
}

// ==================== LEVER OBJECT ====================

export class LeverObject extends InteractiveObject {
  constructor(mesh, options = {}) {
    super(mesh, { ...options, type: 'lever' });
    this.isOn = options.initialState || false;
    this.rotationAxis = options.rotationAxis || 'x';
    this.rotationRange = options.rotationRange || Math.PI / 4;
    this.onToggle = options.onToggle || (() => {});
    
    this.updateVisual();
  }

  toggle() {
    if (!this.mesh) return;
    
    this.isOn = !this.isOn;
    this.updateVisual();
    this.onToggle(this.isOn, this);
    this.onInteract(this);
  }

  updateVisual() {
    if (!this.mesh) return;
    
    const angle = this.isOn ? this.rotationRange : -this.rotationRange;
    this.mesh.rotation[this.rotationAxis] = angle;
  }
}

// ==================== PLATFORM / STEP ====================

export class PlatformObject extends InteractiveObject {
  constructor(mesh, options = {}) {
    super(mesh, { ...options, type: 'platform' });
    this.height = options.height || 0.3;
    this.bounds = options.bounds || new THREE.Box3();
    
    if (mesh) {
      this.bounds.setFromObject(mesh);
    }
  }

  isPointAbove(point) {
    const expandedBounds = this.bounds.clone();
    expandedBounds.max.y += 2; // Extend upward to catch avatars above
    return expandedBounds.containsPoint(point);
  }

  getHeightAt(point) {
    if (this.isPointAbove(point)) {
      return this.bounds.max.y;
    }
    return null;
  }
}

// ==================== SLOPE OBJECT ====================

export class SlopeObject extends InteractiveObject {
  constructor(mesh, options = {}) {
    super(mesh, { ...options, type: 'slope' });
    this.startHeight = options.startHeight || 0;
    this.endHeight = options.endHeight || 1;
    this.direction = options.direction || new THREE.Vector3(0, 0, 1);
    this.length = options.length || 2;
    this.startPoint = options.startPoint || new THREE.Vector3();
  }

  getHeightAt(point) {
    // Project point onto slope direction
    const toPoint = point.clone().sub(this.startPoint);
    const projection = toPoint.dot(this.direction);
    
    if (projection < 0 || projection > this.length) return null;
    
    const t = projection / this.length;
    return THREE.MathUtils.lerp(this.startHeight, this.endHeight, t);
  }
}

// ==================== INTERACTION MANAGER ====================

export class InteractionManager {
  constructor(scene, avatar, options = {}) {
    this.scene = scene;
    this.avatar = avatar;
    this.objects = [];
    this.ikSolver = new IKSolver();
    
    // Avatar bone references
    this.bones = {
      leftHand: null,
      rightHand: null,
      leftFoot: null,
      rightFoot: null,
      leftKnee: null,
      rightKnee: null,
      leftHip: null,
      rightHip: null,
      leftShoulder: null,
      rightShoulder: null,
      leftElbow: null,
      rightElbow: null,
      spine: null,
      hips: null
    };
    
    // Interaction state
    this.nearestObject = null;
    this.heldObjectLeft = null;
    this.heldObjectRight = null;
    this.isReaching = false;
    this.reachTarget = null;
    this.reachHand = 'right';
    this.reachBlend = 0;
    
    // Ground detection
    this.groundHeight = 0;
    this.leftFootHeight = 0;
    this.rightFootHeight = 0;
    
    // Callbacks
    this.onObjectNear = options.onObjectNear || (() => {});
    this.onObjectFar = options.onObjectFar || (() => {});
    this.onInteraction = options.onInteraction || (() => {});
    
    this.findBones();
  }

  findBones() {
    if (!this.avatar) return;
    
    this.avatar.traverse((child) => {
      if (!child.isBone) return;
      
      const name = child.name.toLowerCase();
      
      // Hand bones
      if (name.includes('hand') || name.includes('wrist')) {
        if (name.includes('left') || name.includes('_l')) {
          this.bones.leftHand = child;
        } else if (name.includes('right') || name.includes('_r')) {
          this.bones.rightHand = child;
        }
      }
      
      // Foot bones
      if (name.includes('foot') || name.includes('ankle')) {
        if (name.includes('left') || name.includes('_l')) {
          this.bones.leftFoot = child;
        } else if (name.includes('right') || name.includes('_r')) {
          this.bones.rightFoot = child;
        }
      }
      
      // Knee bones
      if (name.includes('knee') || name.includes('leg') && name.includes('lower')) {
        if (name.includes('left') || name.includes('_l')) {
          this.bones.leftKnee = child;
        } else if (name.includes('right') || name.includes('_r')) {
          this.bones.rightKnee = child;
        }
      }
      
      // Hip/thigh bones
      if (name.includes('thigh') || name.includes('upleg') || (name.includes('leg') && name.includes('upper'))) {
        if (name.includes('left') || name.includes('_l')) {
          this.bones.leftHip = child;
        } else if (name.includes('right') || name.includes('_r')) {
          this.bones.rightHip = child;
        }
      }
      
      // Arm bones
      if (name.includes('shoulder') || name.includes('arm') && name.includes('upper')) {
        if (name.includes('left') || name.includes('_l')) {
          this.bones.leftShoulder = child;
        } else if (name.includes('right') || name.includes('_r')) {
          this.bones.rightShoulder = child;
        }
      }
      
      if (name.includes('elbow') || name.includes('forearm') || (name.includes('arm') && name.includes('lower'))) {
        if (name.includes('left') || name.includes('_l')) {
          this.bones.leftElbow = child;
        } else if (name.includes('right') || name.includes('_r')) {
          this.bones.rightElbow = child;
        }
      }
      
      // Spine
      if (name.includes('spine') && !this.bones.spine) {
        this.bones.spine = child;
      }
      
      // Hips
      if (name.includes('hips') || name.includes('pelvis')) {
        this.bones.hips = child;
      }
    });
  }

  addObject(object) {
    this.objects.push(object);
    return object;
  }

  removeObject(object) {
    const index = this.objects.indexOf(object);
    if (index !== -1) {
      object.dispose();
      this.objects.splice(index, 1);
    }
  }

  createPickupable(geometry, material, position, options = {}) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    this.scene.add(mesh);
    
    const obj = new PickupableObject(mesh, options);
    return this.addObject(obj);
  }

  createButton(position, options = {}) {
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16);
    const material = new THREE.MeshStandardMaterial({ color: options.color || 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    this.scene.add(mesh);
    
    const obj = new ButtonObject(mesh, options);
    return this.addObject(obj);
  }

  createLever(position, options = {}) {
    const baseGeo = new THREE.BoxGeometry(0.1, 0.02, 0.1);
    const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
    
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    
    const base = new THREE.Mesh(baseGeo, material);
    const handle = new THREE.Mesh(handleGeo, material.clone());
    
    handle.position.y = 0.1;
    base.add(handle);
    base.position.copy(position);
    base.castShadow = true;
    this.scene.add(base);
    
    const obj = new LeverObject(handle, options);
    obj.baseMesh = base;
    return this.addObject(obj);
  }

  createPlatform(position, size, options = {}) {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshStandardMaterial({ 
      color: options.color || 0x555555,
      roughness: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add(mesh);
    
    const obj = new PlatformObject(mesh, { ...options, height: size.y });
    return this.addObject(obj);
  }

  getAvatarPosition() {
    if (!this.avatar) return new THREE.Vector3();
    const pos = new THREE.Vector3();
    this.avatar.getWorldPosition(pos);
    return pos;
  }

  findNearestInteractable() {
    const avatarPos = this.getAvatarPosition();
    let nearest = null;
    let nearestDist = Infinity;
    
    for (const obj of this.objects) {
      if (obj.isHeld) continue;
      
      const objPos = obj.getWorldInteractionPoint();
      const dist = avatarPos.distanceTo(objPos);
      
      if (dist < obj.interactionRadius && dist < nearestDist) {
        nearest = obj;
        nearestDist = dist;
      }
    }
    
    return nearest;
  }

  interact(hand = 'right') {
    if (!this.nearestObject) return false;
    
    const obj = this.nearestObject;
    
    switch (obj.type) {
      case 'pickup':
        const handBone = hand === 'left' ? this.bones.leftHand : this.bones.rightHand;
        if (handBone && obj.pickup(handBone)) {
          if (hand === 'left') {
            this.heldObjectLeft = obj;
          } else {
            this.heldObjectRight = obj;
          }
          this.onInteraction('pickup', obj);
          return true;
        }
        break;
        
      case 'button':
        if (obj.press()) {
          this.onInteraction('press', obj);
          return true;
        }
        break;
        
      case 'lever':
        obj.toggle();
        this.onInteraction('toggle', obj);
        return true;
    }
    
    return false;
  }

  dropHeldObject(hand = 'right') {
    const heldObj = hand === 'left' ? this.heldObjectLeft : this.heldObjectRight;
    if (!heldObj) return false;
    
    heldObj.drop();
    if (hand === 'left') {
      this.heldObjectLeft = null;
    } else {
      this.heldObjectRight = null;
    }
    this.onInteraction('drop', heldObj);
    return true;
  }

  throwHeldObject(direction, hand = 'right', force = null) {
    const heldObj = hand === 'left' ? this.heldObjectLeft : this.heldObjectRight;
    if (!heldObj) return false;
    
    heldObj.throw(direction, force);
    if (hand === 'left') {
      this.heldObjectLeft = null;
    } else {
      this.heldObjectRight = null;
    }
    this.onInteraction('throw', heldObj);
    return true;
  }

  startReach(target, hand = 'right') {
    this.isReaching = true;
    this.reachTarget = target;
    this.reachHand = hand;
    this.reachBlend = 0;
  }

  stopReach() {
    this.isReaching = false;
    this.reachTarget = null;
    this.reachBlend = 0;
  }

  updateFootIK() {
    // Check ground height under each foot
    const leftFootPos = new THREE.Vector3();
    const rightFootPos = new THREE.Vector3();
    
    if (this.bones.leftFoot) {
      this.bones.leftFoot.getWorldPosition(leftFootPos);
    }
    if (this.bones.rightFoot) {
      this.bones.rightFoot.getWorldPosition(rightFootPos);
    }
    
    // Check platforms and slopes
    let leftHeight = this.groundHeight;
    let rightHeight = this.groundHeight;
    
    for (const obj of this.objects) {
      if (obj.type === 'platform' || obj.type === 'slope') {
        const leftH = obj.getHeightAt(leftFootPos);
        const rightH = obj.getHeightAt(rightFootPos);
        
        if (leftH !== null && leftH > leftHeight) leftHeight = leftH;
        if (rightH !== null && rightH > rightHeight) rightHeight = rightH;
      }
    }
    
    this.leftFootHeight = leftHeight;
    this.rightFootHeight = rightHeight;
    
    // Apply foot IK
    if (this.bones.leftHip && this.bones.leftKnee && this.bones.leftFoot) {
      this.ikSolver.solveFootPlacement(
        this.bones.leftHip,
        this.bones.leftKnee,
        this.bones.leftFoot,
        leftHeight,
        0.5
      );
    }
    
    if (this.bones.rightHip && this.bones.rightKnee && this.bones.rightFoot) {
      this.ikSolver.solveFootPlacement(
        this.bones.rightHip,
        this.bones.rightKnee,
        this.bones.rightFoot,
        rightHeight,
        0.5
      );
    }
  }

  updateReachIK(delta) {
    if (!this.isReaching || !this.reachTarget) return;
    
    // Smooth blend in
    this.reachBlend = Math.min(1, this.reachBlend + delta * 3);
    
    const shoulder = this.reachHand === 'left' ? this.bones.leftShoulder : this.bones.rightShoulder;
    const elbow = this.reachHand === 'left' ? this.bones.leftElbow : this.bones.rightElbow;
    const hand = this.reachHand === 'left' ? this.bones.leftHand : this.bones.rightHand;
    
    if (shoulder && elbow && hand) {
      const shoulderPos = new THREE.Vector3();
      shoulder.getWorldPosition(shoulderPos);
      
      // Pole target slightly behind and to the side
      const poleTarget = shoulderPos.clone();
      poleTarget.z -= 0.3;
      poleTarget.x += this.reachHand === 'left' ? -0.2 : 0.2;
      
      this.ikSolver.solveTwoBone(
        shoulder,
        elbow,
        hand,
        this.reachTarget,
        poleTarget,
        this.reachBlend
      );
    }
  }

  update(delta) {
    // Update all objects
    for (const obj of this.objects) {
      obj.update(delta);
    }
    
    // Find nearest interactable
    const newNearest = this.findNearestInteractable();
    
    if (newNearest !== this.nearestObject) {
      if (this.nearestObject) {
        this.nearestObject.highlight(false);
        this.onObjectFar(this.nearestObject);
      }
      
      this.nearestObject = newNearest;
      
      if (newNearest) {
        newNearest.highlight(true);
        this.onObjectNear(newNearest);
      }
    }
    
    // Update IK
    this.updateFootIK();
    this.updateReachIK(delta);
  }

  dispose() {
    for (const obj of this.objects) {
      obj.dispose();
      if (obj.mesh) {
        this.scene.remove(obj.mesh);
        obj.mesh.geometry?.dispose();
      }
      if (obj.baseMesh) {
        this.scene.remove(obj.baseMesh);
      }
    }
    this.objects = [];
  }
}

export default InteractionManager;