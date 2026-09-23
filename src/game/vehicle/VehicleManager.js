import * as THREE from 'three';

/**
 * VehicleManager — Phase One placeholder ride. Visual only (no driving
 * physics yet); enter/exit hide the avatar and spin gently to demonstrate the
 * occupant hand-off. A proper vehicle controller arrives in a later phase.
 */
export default class VehicleManager {
  constructor(scene) {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0c0c12, roughness: 0.45, metalness: 0.7 });
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.3, metalness: 0.4, roughness: 0.4 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 4.0), bodyMat);
    body.position.y = 0.75; body.castShadow = true;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 2.0), cabinMat);
    cabin.position.set(0, 1.2, -0.2);
    const wheels = [];
    const wmat = new THREE.MeshStandardMaterial({ color: 0x222230 });
    [
      [-0.9, 1.3], [0.9, 1.3], [-0.9, -1.3], [0.9, -1.3],
    ].forEach(([x, z]) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.32, 18), wmat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.4, z);
      wheels.push(w);
    });
    g.add(body, cabin, ...wheels);

    // neon underglow
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 4.2),
      new THREE.MeshBasicMaterial({ color: 0xff3366, transparent: true, opacity: 0.5 })
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(0, 0.08, 0);
    g.add(glow);

    g.position.set(0, 0, 27); // Phase F: moved into the SKRTLIFE Garage display bay
    scene.add(g);
    this.group = g;
    this.occupied = false;
  }

  enter(avatarRoot) {
    this.occupied = true;
    avatarRoot.visible = false;
  }

  /** Exit the vehicle: reveal the avatar and return the exit world position.
   *  The caller must apply the returned position to the PLAYER CONTROLLER
   *  (not just the avatar root), because PlayerController overwrites
   *  avatar.root.position from `this.position` every frame — setting the root
   *  alone would snap back. Returns null if the avatar wasn't passed. */
  exit(avatarRoot) {
    this.occupied = false;
    if (avatarRoot) avatarRoot.visible = true;
    const p = this.group.position;
    // place the player just south of the vehicle (toward the garage door)
    return { x: p.x, y: 0, z: p.z - 3.2 };
  }

  update(dt) {
    if (this.occupied) this.group.rotation.y += dt * 0.35;
  }
}