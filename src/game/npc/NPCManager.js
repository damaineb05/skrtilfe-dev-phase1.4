import * as THREE from 'three';

/**
 * One NPC for BLOCK 001 ("Skrt Local"). Capsule body, neon accent, gentle idle
 * bob. Speech is surfaced through the HUD toast shell, not 3D billboards
 * (kept minimal for Phase One).
 */
export default class NPCManager {
  constructor(scene) {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a24, roughness: 0.7 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf2c79b, roughness: 0.6 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xff3366, emissive: 0xff3366, emissiveIntensity: 0.55 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.95, 6, 14), bodyMat);
    body.position.y = 1.0; body.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 18), skinMat);
    head.position.y = 1.8; head.castShadow = true;
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.07, 0.34), accentMat);
    band.position.set(0, 1.86, 0.15);

    g.add(body, head, band);
    g.position.set(6, 0, 2); // Phase F: relocated to the Central Plaza
    scene.add(g);
    this.group = g;
    this._baseY = 0;
  }

  update(dt) {
    this._baseY = Math.sin(performance.now() * 0.002) * 0.035;
    this.group.position.y = this._baseY;
    this.group.rotation.y += dt * 0.15;
  }
}