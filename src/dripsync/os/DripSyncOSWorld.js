/**
 * DripSyncOSWorld — builds the 3D OS hub environment inside the Three.js scene.
 *
 * Creates floating district portals around the avatar spawn point.
 * Each portal is a glowing ring + label + zone trigger the avatar can enter.
 *
 * Returns { dispose, getDistrictAtPosition, update }
 */
export class DripSyncOSWorld {
  constructor(THREE, scene) {
    this.THREE = THREE;
    this.scene = scene;
    this.districts = [];
    this.portalMeshes = [];
    this.labelSprites = [];
    this._frameCount = 0;

    this._buildWorld();
  }

  // ── District definitions ────────────────────────────────────────────────
  static DISTRICTS = [
    {
      id: 'closet',
      label: 'CLOSET',
      sublabel: 'Avatar Studio',
      angle: 0,
      radius: 8,
      color: 0xa855f7,
      glowColor: '#a855f7',
      icon: '👗',
    },
    {
      id: 'stream',
      label: 'STREAM HUB',
      sublabel: 'Media Center',
      angle: (Math.PI * 2) / 6,
      radius: 8,
      color: 0x3b82f6,
      glowColor: '#3b82f6',
      icon: '📺',
    },
    {
      id: 'marketplace',
      label: 'MARKETPLACE',
      sublabel: 'Digital Shop',
      angle: (Math.PI * 2 * 2) / 6,
      radius: 8,
      color: 0x06b6d4,
      glowColor: '#06b6d4',
      icon: '🛍️',
    },
    {
      id: 'social',
      label: 'SOCIAL',
      sublabel: 'Community',
      angle: Math.PI,
      radius: 8,
      color: 0xec4899,
      glowColor: '#ec4899',
      icon: '👥',
    },
    {
      id: 'vault',
      label: 'VAULT',
      sublabel: 'Collection',
      angle: (Math.PI * 2 * 4) / 6,
      radius: 8,
      color: 0xf59e0b,
      glowColor: '#f59e0b',
      icon: '🏆',
    },
    {
      id: 'studio',
      label: 'STUDIO',
      sublabel: 'Creator Tools',
      angle: (Math.PI * 2 * 5) / 6,
      radius: 8,
      color: 0x10b981,
      glowColor: '#10b981',
      icon: '🎬',
    },
  ];

  _buildWorld() {
    const { THREE, scene } = this;

    // ── Central platform ─────────────────────────────────────────────────
    const platGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.08, 64);
    const platMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.7,
      roughness: 0.25,
      emissive: 0x0d0d1a,
      emissiveIntensity: 0.5,
    });
    const platform = new THREE.Mesh(platGeo, platMat);
    platform.position.set(0, 0.04, 0);
    platform.receiveShadow = true;
    platform.userData.isOSObject = true;
    scene.add(platform);
    this.portalMeshes.push(platform);

    // Central glow ring
    const ringGeo = new THREE.TorusGeometry(2.6, 0.04, 8, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 2,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.09, 0);
    ring.userData.isOSObject = true;
    scene.add(ring);
    this.portalMeshes.push(ring);

    // ── HUB label canvas sprite ──────────────────────────────────────────
    this._addLabel(scene, 'DRIPSYNC OS', 0, 2.8, 0, 0.04, '#00D4FF', 1.6);

    // ── District portals ─────────────────────────────────────────────────
    DripSyncOSWorld.DISTRICTS.forEach((d) => {
      const x = Math.cos(d.angle) * d.radius;
      const z = Math.sin(d.angle) * d.radius;

      // Portal arch ring
      const portalGeo = new THREE.TorusGeometry(1.1, 0.06, 12, 64);
      const portalMat = new THREE.MeshStandardMaterial({
        color: d.color,
        emissive: d.color,
        emissiveIntensity: 1.8,
        metalness: 0.4,
        roughness: 0.3,
      });
      const portal = new THREE.Mesh(portalGeo, portalMat);
      portal.position.set(x, 1.5, z);
      portal.lookAt(0, 1.5, 0);
      portal.userData.isOSObject = true;
      portal.userData.districtId = d.id;
      scene.add(portal);
      this.portalMeshes.push(portal);

      // Portal fill plane (translucent glow)
      const fillGeo = new THREE.CircleGeometry(1.0, 32);
      const fillMat = new THREE.MeshStandardMaterial({
        color: d.color,
        emissive: d.color,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
      });
      const fill = new THREE.Mesh(fillGeo, fillMat);
      fill.position.set(x, 1.5, z);
      fill.lookAt(0, 1.5, 0);
      fill.userData.isOSObject = true;
      fill.userData.districtId = d.id;
      fill.userData.isPortalFill = true;
      scene.add(fill);
      this.portalMeshes.push(fill);

      // Floor zone indicator
      const zoneGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.02, 32);
      const zoneMat = new THREE.MeshStandardMaterial({
        color: d.color,
        emissive: d.color,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.2,
      });
      const zone = new THREE.Mesh(zoneGeo, zoneMat);
      zone.position.set(x, 0.02, z);
      zone.userData.isOSObject = true;
      zone.userData.districtId = d.id;
      zone.userData.isZone = true;
      scene.add(zone);
      this.portalMeshes.push(zone);

      // District label
      this._addLabel(scene, d.label, x, 3.0, z, 0.028, `#${d.color.toString(16).padStart(6, '0')}`, 1.2);
      this._addLabel(scene, d.sublabel, x, 2.55, z, 0.018, 'rgba(255,255,255,0.45)', 0.8);

      // Pillar posts (L+R)
      [-1, 1].forEach((side) => {
        const pillarGeo = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
        const pillarMat = new THREE.MeshStandardMaterial({
          color: d.color,
          emissive: d.color,
          emissiveIntensity: 0.6,
          metalness: 0.8,
          roughness: 0.2,
        });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);

        // Offset perpendicular to the facing direction
        const perpAngle = d.angle + Math.PI / 2;
        const ox = Math.cos(perpAngle) * 1.05 * side;
        const oz = Math.sin(perpAngle) * 1.05 * side;
        pillar.position.set(x + ox, 1.5, z + oz);
        pillar.userData.isOSObject = true;
        scene.add(pillar);
        this.portalMeshes.push(pillar);
      });

      // Point light at portal
      const light = new THREE.PointLight(d.color, 0.8, 6);
      light.position.set(x, 2.0, z);
      light.userData.isOSObject = true;
      scene.add(light);
      this.portalMeshes.push(light);

      this.districts.push({ ...d, x, z, light, portalFill: fill, zone });
    });

    // ── Ambient floor lines (grid spokes) ───────────────────────────────
    DripSyncOSWorld.DISTRICTS.forEach((d, i) => {
      const points = [
        new THREE.Vector3(0, 0.01, 0),
        new THREE.Vector3(
          Math.cos(d.angle) * d.radius,
          0.01,
          Math.sin(d.angle) * d.radius
        ),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: d.color,
        transparent: true,
        opacity: 0.18,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.userData.isOSObject = true;
      scene.add(line);
      this.portalMeshes.push(line);
    });
  }

  _addLabel(scene, text, x, y, z, size, color, opacity = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 128);
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.font = `bold ${size < 0.025 ? 48 : 38}px Inter, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const texture = new this.THREE.CanvasTexture(canvas);
    const mat = new this.THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
    const sprite = new this.THREE.Sprite(mat);
    sprite.position.set(x, y, z);
    sprite.scale.set(size < 0.025 ? 1.6 : 2.0, 0.4, 1);
    sprite.userData.isOSObject = true;
    scene.add(sprite);
    this.labelSprites.push(sprite);
  }

  /**
   * Call each frame from the animation loop.
   * Pulses portal fills and rotates rings.
   */
  update(delta) {
    this._frameCount += delta;
    const t = this._frameCount;

    this.districts.forEach((d, i) => {
      // Pulse portal fill opacity
      if (d.portalFill?.material) {
        d.portalFill.material.opacity = 0.08 + Math.sin(t * 1.5 + i * 1.1) * 0.07;
      }
      // Pulse zone floor
      if (d.zone?.material) {
        d.zone.material.opacity = 0.12 + Math.sin(t * 1.2 + i * 0.8) * 0.08;
      }
      // Pulse light intensity
      if (d.light) {
        d.light.intensity = 0.6 + Math.sin(t * 1.8 + i * 1.3) * 0.3;
      }
    });

    // Rotate all torus portal rings slowly
    this.portalMeshes.forEach((m) => {
      if (m.geometry?.type === 'TorusGeometry' && m.userData.districtId) {
        m.rotation.z += delta * 0.25;
      }
    });
  }

  /**
   * Returns the district the avatar is near (within trigger radius).
   * @param {THREE.Vector3} avatarPos
   * @returns {object|null} district definition or null
   */
  getDistrictAtPosition(avatarPos) {
    const TRIGGER_RADIUS = 2.2;
    for (const d of this.districts) {
      const dx = avatarPos.x - d.x;
      const dz = avatarPos.z - d.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < TRIGGER_RADIUS) return d;
    }
    return null;
  }

  /**
   * Highlight a specific district (e.g. when avatar is near).
   */
  highlightDistrict(districtId) {
    this.districts.forEach((d) => {
      const isTarget = d.id === districtId;
      if (d.portalFill?.material) {
        d.portalFill.material.opacity = isTarget ? 0.35 : 0.1;
      }
      if (d.light) {
        d.light.intensity = isTarget ? 2.2 : 0.8;
      }
    });
  }

  clearHighlight() {
    this.districts.forEach((d) => {
      if (d.portalFill?.material) d.portalFill.material.opacity = 0.1;
      if (d.light) d.light.intensity = 0.8;
    });
  }

  dispose() {
    const { scene } = this;
    this.portalMeshes.forEach((m) => {
      scene.remove(m);
      if (m.geometry) m.geometry.dispose();
      if (m.material) {
        if (Array.isArray(m.material)) m.material.forEach((mt) => mt.dispose());
        else m.material.dispose();
      }
    });
    this.labelSprites.forEach((s) => {
      scene.remove(s);
      s.material?.map?.dispose();
      s.material?.dispose();
    });
    this.portalMeshes = [];
    this.labelSprites = [];
    this.districts = [];
  }
}