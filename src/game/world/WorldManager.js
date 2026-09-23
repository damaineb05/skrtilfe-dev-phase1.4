import * as THREE from 'three';
import WorldGrid from './WorldGrid';
import { InteractionType } from '../interactions/InteractionTypes';
import { SHADOW_MAP_SIZE } from '../core/deviceTier';

/**
 * WorldManager — builds the SKRTLIFE DISTRICT (Phase F), the first polished
 * walkable neighborhood. Owns geometry, lights, collision boxes (THREE.Box3),
 * and the registry of interactable zones consumed by InteractionManager.
 *
 * PUBLIC API (preserved from Phase One — gameplay architecture unchanged):
 *   this.colliders               // THREE.Box3[]
 *   this.interactables           // { id, type, position, radius, label, zone? }[]
 *   this.grid                    // WorldGrid
 *   this.storeInteriorAnchor     // THREE.Vector3 — flagship featured-product pedestal
 *   this.fiveLinesInteriorAnchor // THREE.Vector3 — five-lines display pedestal
 *   resolveCollisions(prev, nextX, nextZ)
 *   nearestInteractable(pos, maxR)
 *
 * Aesthetic: NYC × luxury streetwear × digital identity. Built from clean
 * modular primitives (no external GLB yet) so every piece is swappable later
 * via AssetRegistry. Interaction points are Vector3 zones — they survive any
 * asset replacement.
 *
 * DISTRICT LAYOUT (X east, Z south; spawn faces -Z/south toward the monument):
 *   STREET EXIT / GARAGE       z ≈ +38 / +26   (north)
 *        DRIPSYNC LAB          z ≈ +12
 *   FIVE LINES ── PLAZA ── FLAGSHIP   z ≈ 0   (plaza, monument, spawn)
 *        EVENT / DROP SPACE    z ≈ -26         (south — spawn faces this)
 */
export default class WorldManager {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    scene.add(this.group);

    this.colliders = [];
    this.interactables = [];
    this._pulse = []; // accent rings whose opacity animates (feels alive)

    this.grid = new WorldGrid({ cell: 2, origin: new THREE.Vector3(0, 0, 0) });
    this.storeInteriorAnchor = new THREE.Vector3(20, 0, -4);
    this.fiveLinesInteriorAnchor = new THREE.Vector3(-20, 0, -4);

    this._palette();
    this._lights();
    this._build();
  }

  /* ── shared material palette (reuse → fewer materials, consistent look) ── */
  _palette() {
    const std = (color, roughness, metalness, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    this.mat = {
      concrete:     std(0x1b1b22, 0.96, 0.04),
      sidewalk:     std(0x26262e, 0.92, 0.05),
      asphalt:      std(0x0c0c11, 0.98, 0.02),
      darkMetal:    std(0x121219, 0.5, 0.72),
      paintedSteel: std(0x202028, 0.45, 0.6),
      railSteel:    std(0x3a3a44, 0.4, 0.7),
      glass:        std(0x021018, 0.25, 0.2, { transparent: true, opacity: 0.34, emissive: 0x00d4ff, emissiveIntensity: 0.18 }),
      glassDark:    std(0x05050a, 0.2, 0.3, { transparent: true, opacity: 0.55 }),
      interiorW:    std(0xe8e8ee, 0.55, 0.05),
      galleryW:     std(0xececea, 0.85, 0.02),
      galleryFloor: std(0xcfcfc8, 0.5, 0.08),
      wood:         std(0x2a2018, 0.8, 0.05),
      tire:         std(0x111114, 0.9, 0.1),
      emissiveCyan: new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 1.0, roughness: 0.3 }),
      emissiveRed:  new THREE.MeshStandardMaterial({ color: 0xff3366, emissive: 0xff3366, emissiveIntensity: 0.9, roughness: 0.3 }),
      emissiveAmber: new THREE.MeshStandardMaterial({ color: 0xffb347, emissive: 0xffb347, emissiveIntensity: 0.8, roughness: 0.3 }),
      screenCyan:  new THREE.MeshBasicMaterial({ color: 0x00d4ff }),
      screenWhite: new THREE.MeshBasicMaterial({ color: 0xf4f4f8 }),
    };
    this._geo = { box: new THREE.BoxGeometry(1, 1, 1), slab: new THREE.PlaneGeometry(1, 1), cyl: new THREE.CylinderGeometry(1, 1, 1, 14) };
  }

  _lights() {
    this.scene.add(new THREE.HemisphereLight(0x9fb4ff, 0x14141c, 0.5));
    const sun = new THREE.DirectionalLight(0xffe6c2, 1.05);
    sun.position.set(24, 34, -10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);
    const c = sun.shadow.camera;
    c.left = -48; c.right = 48; c.top = 48; c.bottom = -48; c.near = 1; c.far = 110;
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0x00d4ff, 0.26);
    fill.position.set(-20, 14, 16);
    this.scene.add(fill);
    // a small number of static accent point lights — no per-prop lights
    this._point(0, 6.5, -3, 0x00d4ff, 0.9, 22);   // monument uplight
    this._point(20, 3.4, -4, 0xfff0e0, 0.7, 16);  // flagship interior
    this._point(-20, 3.2, -4, 0xdfe7ff, 0.45, 14); // five-lines gallery
    this._point(0, 4.6, 12, 0x00d4ff, 0.6, 14);   // dripsync lab
    this._point(0, 6, -22, 0xff3366, 0.8, 20);    // event stage
  }

  _point(x, y, z, color, intensity, dist) {
    const l = new THREE.PointLight(color, intensity, dist, 2);
    l.position.set(x, y, z);
    this.scene.add(l);
  }

  /* ── primitive helpers ── */
  _box(x, y, z, w, h, d, mat, opts = {}) {
    const m = new THREE.Mesh(this._geo.box, mat);
    m.scale.set(w, h, d);
    m.position.set(x, y, z);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = opts.receive !== false;
    if (opts.rotY) m.rotation.y = opts.rotY;
    this.group.add(m);
    if (opts.collide !== false) this.colliders.push(new THREE.Box3().setFromObject(m));
    return m;
  }
  _plane(x, y, z, w, d, mat) {
    const m = new THREE.Mesh(this._geo.slab, mat);
    m.scale.set(w, d, 1);
    m.position.set(x, y, z);
    m.rotation.x = -Math.PI / 2;
    m.receiveShadow = true;
    this.group.add(m);
    return m;
  }
  _cyl(x, y, z, r, h, mat, opts = {}) {
    const m = new THREE.Mesh(this._geo.cyl, mat);
    m.scale.set(r, h, r);
    m.position.set(x, y, z);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = true;
    this.group.add(m);
    if (opts.collide !== false) this.colliders.push(new THREE.Box3().setFromObject(m));
    return m;
  }

  /* A wall running along X (spans width w) at a fixed z, with an optional
     centered door gap + lintel above. */
  _wallX(z, xC, w, h, mat, gapW = 0) {
    const t = 0.4;
    if (gapW <= 0) { this._box(xC, h / 2, z, w, h, t, mat); return; }
    const seg = (w - gapW) / 2;
    this._box(xC - (gapW / 2 + seg / 2), h / 2, z, seg, h, t, mat);
    this._box(xC + (gapW / 2 + seg / 2), h / 2, z, seg, h, t, mat);
    this._box(xC, h - 0.25, z, gapW, 0.5, t, mat, { collide: false });
  }
  /* A wall running along Z (spans depth d) at a fixed x, with an optional
     centered door gap + lintel above. */
  _wallZ(x, zC, d, h, mat, gapW = 0) {
    const t = 0.4;
    if (gapW <= 0) { this._box(x, h / 2, zC, t, h, d, mat); return; }
    const seg = (d - gapW) / 2;
    this._box(x, h / 2, zC - (gapW / 2 + seg / 2), t, h, seg, mat);
    this._box(x, h / 2, zC + (gapW / 2 + seg / 2), t, h, seg, mat);
    this._box(x, h - 0.25, zC, t, 0.5, gapW, mat, { collide: false });
  }
  /* Enterable room: 4 perimeter walls with a door gap on one face + a roof.
     Interior is open (no solid shell collider) so the player can walk in. */
  _room(cx, cz, w, h, d, mat, doorSide, doorW) {
    this._wallX(cz - d / 2, cx, w, h, mat, doorSide === 'south' ? doorW : 0);
    this._wallX(cz + d / 2, cx, w, h, mat, doorSide === 'north' ? doorW : 0);
    this._wallZ(cx - w / 2, cz, d, h, mat, doorSide === 'west' ? doorW : 0);
    this._wallZ(cx + w / 2, cz, d, h, mat, doorSide === 'east' ? doorW : 0);
    this._box(cx, h + 0.15, cz, w, 0.3, d, mat, { collide: false, cast: false }); // roof
  }

  /* canvas texture signage */
  _signTexture(line1, line2, opts = {}) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = opts.bg ?? '#06060a';
    ctx.fillRect(0, 0, 512, 256);
    if (opts.border) { ctx.strokeStyle = opts.border; ctx.lineWidth = 6; ctx.strokeRect(8, 8, 496, 240); }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (line1) { ctx.fillStyle = opts.color1 ?? '#ffffff'; ctx.font = `800 ${opts.size1 ?? 64}px Inter, system-ui, sans-serif`; ctx.fillText(line1, 256, opts.twoLine ? 96 : 128); }
    if (opts.twoLine) { ctx.fillStyle = opts.color2 ?? '#00d4ff'; ctx.font = `800 ${opts.size2 ?? 30}px Inter, system-ui, sans-serif`; ctx.fillText(line2, 256, 178); }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }
  _sign(x, y, z, w, h, tex, opts = {}) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true }));
    m.position.set(x, y, z);
    if (opts.rotY) m.rotation.y = opts.rotY;
    this.group.add(m);
    return m;
  }

  /* Five Lines mark — exactly five descending horizontal lines, the second
     line from the BOTTOM is the contrasting off-color (cyan). Used sparingly. */
  _fiveLinesMark(x, y, z, w, h, rotY = 0) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0a0a0e'; ctx.fillRect(0, 0, 512, 256);
    const lines = 5, barH = 26, gap = 14;
    const totalH = lines * barH + (lines - 1) * gap;
    let top = 128 - totalH / 2;
    for (let i = 0; i < lines; i++) {
      const frac = (lines - i) / lines;            // 1.0 → 0.2 (top longest)
      const bw = 360 * frac + 60;
      const x = (512 - bw) / 2;
      ctx.fillStyle = i === lines - 2 ? '#00d4ff' : '#e8e8ea'; // 2nd from bottom = off-color
      ctx.fillRect(x, top, bw, barH);
      top += barH + gap;
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true }));
    m.position.set(x, y, z); m.rotation.y = rotY;
    this.group.add(m);
    return m;
  }

  /* asphalt with NYC-style lane lines + crosswalk + SKRTLIFE stencil */
  _asphaltTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 1024;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0c0c11'; ctx.fillRect(0, 0, 512, 1024);
    for (let i = 0; i < 1400; i++) {
      const g = 14 + Math.floor(Math.random() * 10);
      ctx.fillStyle = `rgb(${g},${g},${g + 4})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 1024, 2, 2);
    }
    ctx.fillStyle = '#e0b94f';
    for (let y = 40; y < 1024; y += 90) ctx.fillRect(252, y, 8, 50);
    ctx.fillStyle = '#d8d8de';
    ctx.fillRect(210, 880, 92, 8);
    ctx.save();
    ctx.translate(256, 500); ctx.rotate(-0.04);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.font = '900 120px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('SKRTLIFE', 0, 0);
    ctx.restore();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 3);
    return tex;
  }

  _posterTexture(title, sub, accent) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 384;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0a0a0e'; ctx.fillRect(0, 0, 256, 384);
    ctx.fillStyle = accent; ctx.fillRect(0, 0, 256, 8); ctx.fillRect(0, 376, 256, 8);
    ctx.fillStyle = '#fff'; ctx.font = '900 30px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(title, 128, 150);
    ctx.fillStyle = accent; ctx.font = '700 18px Inter, system-ui, sans-serif';
    ctx.fillText(sub, 128, 230);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '700 13px Inter, system-ui, sans-serif';
    ctx.fillText('SKRTLIFE', 128, 330);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  _build() {
    this._ground();
    this._road();
    this._plaza();
    this._monument();
    this._flagship();
    this._fiveLines();
    this._dripsyncLab();
    this._garage();
    this._eventSpace();
    this._streetProps();
    this._skyline();
    this._interactables();
  }

  _ground() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), this.mat.concrete);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.group.add(ground);
  }

  _road() {
    const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(10, 80), new THREE.MeshStandardMaterial({ map: this._asphaltTexture(), roughness: 0.95 }));
    asphalt.rotation.x = -Math.PI / 2;
    asphalt.position.set(0, 0.02, 0);
    asphalt.receiveShadow = true;
    this.group.add(asphalt);
    this._plane(-15, 0.05, 0, 20, 80, this.mat.sidewalk);
    this._plane(15, 0.05, 0, 20, 80, this.mat.sidewalk);
    this._plane(0, 0.04, -3, 26, 22, this.mat.sidewalk);
    this._box(-5.2, 0.12, 0, 0.3, 0.24, 80, this.mat.sidewalk, { collide: false });
    this._box(5.2, 0.12, 0, 0.3, 0.24, 80, this.mat.sidewalk, { collide: false });
    for (let i = 0; i < 5; i++) this._box(-3.6 + i * 1.8, 0.06, -14, 0.9, 0.06, 8.4, this.mat.screenWhite, { collide: false, cast: false });
  }

  _plaza() {
    this._plane(0, 0.05, -3, 22, 20, this.mat.sidewalk);
    const wm = this._signTexture('', 'SKRTLIFE', { color1: '#00d4ff', size1: 80, bg: 'rgba(0,0,0,0)' });
    const wmMesh = new THREE.Mesh(new THREE.PlaneGeometry(12, 3), new THREE.MeshBasicMaterial({ map: wm, transparent: true, opacity: 0.5 }));
    wmMesh.rotation.x = -Math.PI / 2;
    wmMesh.position.set(0, 0.06, 4);
    this.group.add(wmMesh);
    this._directoryPylon(9, 6, 'FLAGSHIP · EAST', '#ff3366');
    this._directoryPylon(-9, 6, 'FIVE LINES · WEST', '#00d4ff');
    this._directoryPylon(0, 10, 'DRIPSYNC · NORTH', '#00d4ff');
    this._directoryPylon(0, -16, 'EVENT · SOUTH', '#ff3366');
    // physical directory kiosk (OPEN_DIRECTORY interaction point)
    this._directoryKiosk(-6, 2);
  }

  _directoryKiosk(x, z) {
    this._box(x, 0.9, z, 1.0, 1.8, 1.0, this.mat.darkMetal);
    this._box(x, 1.9, z, 1.1, 0.2, 1.1, this.mat.emissiveCyan, { collide: false, cast: false });
    this._sign(x, 1.1, z + 0.51, 0.9, 0.9, this._signTexture('i', 'DIRECTORY', { color1: '#00d4ff', color2: '#fff', twoLine: true, size1: 90, size2: 22, bg: 'rgba(8,8,12,0.9)', border: '#00d4ff' }));
    this._sign(x, 1.1, z - 0.51, 0.9, 0.9, this._signTexture('i', 'DIRECTORY', { color1: '#00d4ff', color2: '#fff', twoLine: true, size1: 90, size2: 22, bg: 'rgba(8,8,12,0.9)', border: '#00d4ff' }), { rotY: Math.PI });
  }

  _directoryPylon(x, z, text, color) {
    this._cyl(x, 1.3, z, 0.08, 2.6, this.mat.darkMetal, { collide: false });
    const tex = this._signTexture(text, '', { color1: color, size1: 36, bg: 'rgba(8,8,12,0.85)', border: color });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.7), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
    s.position.set(x, 2.4, z);
    // face the sign toward the plaza center so it's readable on approach
    if (x > 0) s.rotation.y = -Math.PI / 2;       // east pylon faces west
    else if (x < 0) s.rotation.y = Math.PI / 2;   // west pylon faces east
    else if (z > 0) s.rotation.y = Math.PI;        // north pylon faces south
    else s.rotation.y = 0;                          // south pylon faces north
    this.group.add(s);
  }

  _monument() {
    this._box(0, 0.6, -3, 3.2, 1.2, 3.2, this.mat.darkMetal);
    this._box(0, 3.4, -3, 1.8, 5.6, 1.8, this.mat.concrete);
    this._box(0, 6.5, -3, 1.9, 0.5, 1.9, this.mat.emissiveCyan, { collide: false });
    this._fiveLinesMark(0, 3.4, -3 - 0.92, 1.3, 1.9, Math.PI);
    this._sign(0, 4.6, -3 + 0.92, 1.6, 0.5, this._signTexture('SKRTLIFE', '', { color1: '#fff', size1: 64, bg: 'rgba(0,0,0,0)' }), { rotY: 0 });
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.0, 2.6, 40), new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.08, -3);
    this.group.add(ring);
    this._addPulse(ring, { base: 0.5, amp: 0.18, speed: 1.4, phase: 0 });
    this._bench(-4.2, -3, Math.PI / 2);
    this._bench(4.2, -3, Math.PI / 2);
  }

  _bench(x, z, rotY = 0) {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.6), this.mat.wood);
    seat.position.y = 0.45; seat.castShadow = true;
    const leg = this.mat.paintedSteel;
    const l1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.5), leg); l1.position.set(-1.0, 0.22, 0);
    const l2 = l1.clone(); l2.position.x = 1.0;
    g.add(seat, l1, l2);
    g.position.set(x, 0, z); g.rotation.y = rotY;
    this.group.add(g);
    this.colliders.push(new THREE.Box3().setFromObject(g));
  }

  /* ── SKRTLIFE FLAGSHIP (east) — premium storefront + interior ── */
  _flagship() {
    const cx = 20, cz = -4, w = 14, h = 6, d = 12;
    this._room(cx, cz, w, h, d, this.mat.concrete, 'west', 4);
    // glass storefront panes beside the door (west face)
    this._box(cx - w / 2, 1.6, cz - 4, 0.1, 3.2, 3.6, this.mat.glass, { collide: false });
    this._box(cx - w / 2, 1.6, cz + 4, 0.1, 3.2, 3.6, this.mat.glass, { collide: false });
    this._box(cx - w / 2 - 0.05, 0.4, cz, 0.1, 0.2, d, this.mat.emissiveCyan, { collide: false, cast: false });
    // interior polished floor
    this._plane(cx, 0.08, cz, w - 1, d - 1, this.mat.interiorW);
    // product pedestals (3)
    [cz - 3, cz, cz + 3].forEach((pz) => {
      this._box(cx, 0.6, pz, 1.4, 1.2, 1.4, this.mat.darkMetal);
      const halo = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.3, 32), new THREE.MeshBasicMaterial({ color: 0xff3366, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
      halo.rotation.x = -Math.PI / 2; halo.position.set(cx, 0.1, pz);
      this.group.add(halo);
    });
    // interior digital screen on the north wall
    this._sign(cx, 3.2, cz + d / 2 - 0.25, 4, 1.6, this._signTexture('SKRTLIFE', 'FLAGSHIP', { color1: '#fff', color2: '#ff3366', twoLine: true }), { rotY: Math.PI });
    // facade signage above the door (exterior west face)
    this._sign(cx - w / 2 - 0.1, 6.2, cz, w - 2, 1.1, this._signTexture('SKRTLIFE', 'FLAGSHIP', { color1: '#fff', color2: '#ff3366', twoLine: true }), { rotY: Math.PI / 2 });
    // loading door (visual) on the north exterior + crates
    this._box(cx, 1.6, cz + d / 2 + 0.2, 3, 3.2, 0.1, this.mat.darkMetal, { collide: false });
    this._box(cx, 0.5, cz + d / 2 + 1.4, 1.2, 1, 1.2, this.mat.wood);
    this._box(cx + 1.2, 1.5, cz + d / 2 + 1.4, 0.9, 0.8, 0.9, this.mat.wood);
    // scaffolding against the east exterior
    this._scaffold(cx + w / 2 + 0.6, cz, d - 2);
  }

  /* ── FIVE LINES (west) — luxury/minimal gallery ── */
  _fiveLines() {
    const cx = -20, cz = -4, w = 12, h = 5.5, d = 11;
    this._room(cx, cz, w, h, d, this.mat.galleryW, 'east', 4);
    // glass door (east face gap)
    this._box(cx + w / 2, 1.4, cz, 0.1, 2.8, 3.4, this.mat.glassDark, { collide: false });
    // interior plaster floor
    this._plane(cx, 0.08, cz, w - 1, d - 1, this.mat.galleryFloor);
    // single pedestal
    this._box(cx, 0.5, cz, 1.4, 1.0, 1.4, this.mat.galleryW);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.2, 32), new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(cx, 0.09, cz);
    this.group.add(ring);
    this._addPulse(ring, { base: 0.3, amp: 0.12, speed: 1.1, phase: 2.4 });
    // Five Lines mark — sparingly, one large motif high on the east facade
    this._fiveLinesMark(cx + w / 2 + 0.06, 4.0, cz - 3.2, 1.6, 2.2, Math.PI / 2);
    // "FIVE LINES" wordmark low beside the door
    this._sign(cx + w / 2 + 0.1, 1.4, cz + 3.6, 2.6, 0.5, this._signTexture('FIVE LINES', '', { color1: '#0a0a0e', size1: 40, bg: 'rgba(236,236,234,0.92)' }), { rotY: Math.PI / 2 });
    // quiet base uplight strip
    this._box(cx + w / 2 - 0.1, 0.2, cz, 0.1, 0.08, d - 1, this.mat.emissiveCyan, { collide: false, cast: false });
  }

  /* ── DRIPSYNC LAB (north) — physical home for DripSync ── */
  _dripsyncLab() {
    const cx = 0, cz = 12, w = 14, h = 5, d = 10;
    this._room(cx, cz, w, h, d, this.mat.darkMetal, 'south', 5);
    // glass sidelights flanking the south door — clear central walkway (§12 affordance)
    this._box(cx - 3.2, 1.4, cz - d / 2, 1.8, 2.8, 0.1, this.mat.glass, { collide: false });
    this._box(cx + 3.2, 1.4, cz - d / 2, 1.8, 2.8, 0.1, this.mat.glass, { collide: false });
    // interior floor
    this._plane(cx, 0.08, cz, w - 1, d - 1, this.mat.interiorW);
    // the mirror/terminal device on the north interior wall
    this._box(cx, 1.1, cz + d / 2 - 0.6, 3.2, 2.2, 0.3, this.mat.darkMetal);
    this._box(cx, 2.2, cz + d / 2 - 0.46, 3.0, 2.0, 0.06, this.mat.emissiveCyan, { collide: false, cast: false });
    this._sign(cx, 2.2, cz + d / 2 - 0.4, 2.8, 1.7, this._signTexture('DRIPSYNC', 'AVATAR LAB', { color1: '#00d4ff', color2: '#fff', twoLine: true, size1: 56, size2: 26 }));
    // scanner ring on the floor
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.7, 40), new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(cx, 0.1, cz);
    this.group.add(ring);
    this._addPulse(ring, { base: 0.4, amp: 0.24, speed: 2.3, phase: 1.2 }); // scanner pulse — interactive affordance (§12)
    // facade signage above the south door (exterior)
    this._sign(cx, 5.4, cz - d / 2 - 0.1, w - 2, 1.0, this._signTexture('DRIPSYNC', 'LAB', { color1: '#00d4ff', color2: '#fff', twoLine: true, size1: 58, size2: 24 }));
  }

  /* ── GARAGE (far north) — motorsport display, no driving physics ── */
  _garage() {
    const cx = 0, cz = 26, w = 16, h = 5.5, d = 12;
    this._room(cx, cz, w, h, d, this.mat.darkMetal, 'south', 10); // wide open south face
    // checkered valance above the garage opening
    for (let i = 0; i < 8; i++) this._box(cx - w / 2 + 1 + i * 1.8, h - 0.6, cz - d / 2 + 0.05, 1.6, 0.5, 0.1, i % 2 ? this.mat.screenWhite : this.mat.asphalt, { collide: false, cast: false });
    // checkered pit-lane entry strip at the threshold (§13 motorsport marking)
    for (let i = 0; i < 8; i++) this._box(cx - w / 2 + 1 + i * 1.8, 0.05, cz - d / 2, 1.6, 0.02, 0.5, i % 2 ? this.mat.screenWhite : this.mat.asphalt, { collide: false, cast: false, receive: false });
    // polished garage floor
    this._plane(cx, 0.08, cz, w - 1, d - 1, this.mat.galleryFloor);
    // display vehicle is owned by VehicleManager (positioned in the bay); only
    // architecture + workshop details live here so the vehicle stays swappable.
    this._box(cx - 5, 0.6, cz - 4, 1.6, 1.2, 0.8, this.mat.paintedSteel);
    this._cyl(cx + 5, 0.5, cz - 4, 0.5, 1.0, this.mat.tire);
    this._cyl(cx + 5.8, 0.5, cz - 4, 0.5, 1.0, this.mat.tire);
    // signage above the opening
    this._sign(cx, 5.8, cz - d / 2 - 0.1, w - 2, 1.0, this._signTexture('SKRTLIFE', 'MOTORSPORT', { color1: '#fff', color2: '#ff3366', twoLine: true, size1: 56, size2: 24 }));
  }

  /* ── EVENT / DROP SPACE (south) — flexible stage ── */
  _eventSpace() {
    const cx = 0, cz = -26, w = 16, d = 10;
    this._box(cx, 0.4, cz, w, 0.8, d, this.mat.darkMetal);
    this._box(cx, 3.2, cz - d / 2, w, 6, 0.4, this.mat.darkMetal);
    this._sign(cx, 4.0, cz - d / 2 + 0.25, w - 2, 3.2, this._signTexture('DROP', 'LIVE SOON', { color1: '#ff3366', color2: '#fff', twoLine: true, size1: 130, size2: 30 }));
    this._box(cx - w / 2 + 0.4, 4, cz, 0.4, 8, 0.4, this.mat.railSteel, { collide: false });
    this._box(cx + w / 2 - 0.4, 4, cz, 0.4, 8, 0.4, this.mat.railSteel, { collide: false });
    this._box(cx, 7.6, cz, w - 1, 0.3, 0.3, this.mat.railSteel, { collide: false });
    this._jerseyBarrier(cx - 5, cz + d / 2 + 0.6);
    this._jerseyBarrier(cx, cz + d / 2 + 0.6);
    this._jerseyBarrier(cx + 5, cz + d / 2 + 0.6);
    this._box(cx - 4, 7.4, cz, 0.1, 0.1, d - 1, this.mat.emissiveRed, { collide: false, cast: false });
    this._box(cx + 4, 7.4, cz, 0.1, 0.1, d - 1, this.mat.emissiveCyan, { collide: false, cast: false });
    this._directoryPylon(0, -19, 'SKRTLIFE · STAGE', '#ff3366');
  }

  _jerseyBarrier(x, z) {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 0.5), this.mat.paintedSteel);
    b.position.y = 0.4; b.castShadow = true;
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 0.4), this.mat.paintedSteel);
    top.position.y = 0.9;
    g.add(b, top); g.position.set(x, 0, z);
    this.group.add(g);
    this.colliders.push(new THREE.Box3().setFromObject(g));
  }

  /* ── NYC DNA street props ── */
  _streetProps() {
    for (let z = -30; z <= 30; z += 10) {
      this._cyl(-5.6, 0.5, z, 0.12, 1.0, this.mat.paintedSteel);
      this._cyl(5.6, 0.5, z, 0.12, 1.0, this.mat.paintedSteel);
    }
    [-9, 9].forEach((x) => [-12, 0, 12].forEach((z) => this._lamp(x, z)));
    this._trashCan(-10, 4); this._trashCan(10, 4);
    this._bench(-9, 8); this._bench(9, 8);
    this._cyl(11, 0.3, -10, 0.12, 0.6, this.mat.emissiveRed);
    this._cyl(13, 2.4, -16, 0.1, 4.8, this.mat.paintedSteel, { collide: false });
    this._box(12.6, 0.7, -16, 0.5, 1.4, 0.5, this.mat.darkMetal);
    this._poster(20, 3, -4 + 6 + 0.05, 0, 'NEXT DROP', 'FALL 26', '#ff3366');
    this._poster(-13, 3, 12 - 5 - 0.05, Math.PI, 'DRIPSYNC', 'LIVE NOW', '#00d4ff');
    this._box(13.5, 1.4, -10, 0.1, 2.8, 1.4, this.mat.paintedSteel);
    this._sign(13.56, 2.6, -10, 1.2, 0.3, this._signTexture('STAFF ONLY', '', { color1: '#ffb347', size1: 28, bg: 'rgba(8,8,12,0.9)' }), { rotY: -Math.PI / 2 });
    this._chainLink(-27, -4, 8, Math.PI / 2);
    this._box(0, 3, 38, 10, 6, 0.5, this.mat.concrete);
    this._sign(0, 4.2, 38 - 0.3, 9, 1.2, this._signTexture('STREET', 'EXIT', { color1: '#fff', color2: '#00d4ff', twoLine: true, size1: 64, size2: 28 }));
  }

  _lamp(x, z) {
    this._cyl(x, 2.2, z, 0.08, 4.4, this.mat.paintedSteel, { collide: false });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), this.mat.emissiveAmber);
    head.position.set(x, 4.4, z);
    this.group.add(head);
  }
  _trashCan(x, z) { this._cyl(x, 0.6, z, 0.34, 1.2, this.mat.darkMetal); }

  _scaffold(x, z, len) {
    const g = new THREE.Group();
    const m = this.mat.railSteel;
    const post = (px) => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 6, 0.1), m); p.position.set(px, 3, 0); g.add(p); };
    post(-len / 2); post(len / 2); post(0);
    [2, 4.2, 5.8].forEach((ry) => { const r = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, 0.08), m); r.position.set(0, ry, 0); g.add(r); });
    const plank = new THREE.Mesh(new THREE.BoxGeometry(len, 0.1, 0.8), this.mat.wood);
    plank.position.set(0, 2, 0); g.add(plank);
    g.position.set(x, 0, z);
    this.group.add(g);
    this.colliders.push(new THREE.Box3().setFromObject(g));
  }

  _chainLink(x, z, len, rotY = 0) {
    const g = new THREE.Group();
    const frame = this.mat.paintedSteel;
    const post = (px) => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 0.08), frame); p.position.set(px, 1.2, 0); g.add(p); };
    post(-len / 2); post(len / 2);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(len, 2.0), new THREE.MeshBasicMaterial({ color: 0x2a2a32, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
    mesh.position.set(0, 1.2, 0); g.add(mesh);
    g.position.set(x, 0, z); g.rotation.y = rotY;
    this.group.add(g);
    this.colliders.push(new THREE.Box3().setFromObject(g));
  }

  _poster(x, y, z, rotY, title, sub, accent) {
    this._sign(x, y, z, 1.6, 2.4, this._posterTexture(title, sub, accent), { rotY });
  }

  _skyline() {
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const r = 62 + (i % 3) * 7;
      const bx = Math.cos(a) * r, bz = Math.sin(a) * r;
      const hh = 10 + ((i * 41) % 22);
      this._box(bx, hh / 2, bz, 9, hh, 9, this.mat.concrete, { collide: false, cast: false, receive: false });
      if (i % 2 === 0) this._box(bx, hh + 0.3, bz, 9, 0.3, 9, this.mat.emissiveCyan, { collide: false, cast: false });
    }
  }

  /* ── interactable zones — typed, position-based (survive asset replacement) ── */
  _interactables() {
    const V = THREE.Vector3;
    this.interactables.push({ id: 'flagship', type: InteractionType.ENTER_STORE, zone: 'flagship', position: new V(13, 0, -4), radius: 3.6, label: 'Enter SKRTLIFE Flagship' });
    this.interactables.push({ id: 'five_lines', type: InteractionType.ENTER_STORE, zone: 'five_lines', position: new V(-14, 0, -4), radius: 3.6, label: 'Enter Five Lines' });
    this.interactables.push({ id: 'dripsync_lab', type: InteractionType.OPEN_DRIPSYNC, position: new V(0, 0, 7), radius: 3.4, label: 'Open DripSync Lab' });
    this.interactables.push({ id: 'garage', type: InteractionType.ENTER_VEHICLE, position: new V(0, 0, 26), radius: 3.6, label: 'Inspect Vehicle' });
    this.interactables.push({ id: 'event', type: InteractionType.ENTER_EVENT, position: new V(0, 0, -21), radius: 3.6, label: 'Enter Event Space' });
    this.interactables.push({ id: 'directory', type: InteractionType.OPEN_DIRECTORY, position: new V(-6, 0, 2), radius: 2.8, label: 'View District Directory' });
    this.interactables.push({ id: 'npc', type: InteractionType.TALK_TO_NPC, position: new V(6, 0, 2), radius: 2.8, label: 'Talk to Skrt Local' });
  }

  resolveCollisions(prev, nextX, nextZ) {
    const r = 0.5;
    let outX = nextX, outZ = nextZ;
    const pt = new THREE.Vector3();
    for (const b of this.colliders) {
      const bx = b.clone().expandByScalar(r);
      pt.set(outX, b.min.y + 0.2, prev.z);
      const hitX = bx.containsPoint(pt);
      pt.set(prev.x, b.min.y + 0.2, outZ);
      const hitZ = bx.containsPoint(pt);
      if (hitX && hitZ) { outX = prev.x; outZ = prev.z; continue; }
      if (hitX) outX = prev.x;
      if (hitZ) outZ = prev.z;
    }
    outX = Math.max(-38, Math.min(38, outX));
    outZ = Math.max(-38, Math.min(38, outZ));
    return { x: outX, z: outZ };
  }

  nearestInteractable(pos, maxR = 3.2) {
    let best = null, bd = maxR * maxR;
    const p = new THREE.Vector3(pos.x, 0, pos.z);
    for (const it of this.interactables) {
      const d = it.position.distanceToSquared(p);
      if (d < bd) { bd = d; best = it; }
    }
    return best;
  }

  _addPulse(mesh, { base, amp, speed, phase }) {
    this._pulse.push({ mesh, base, amp, speed, phase });
  }

  /** Animate registered accent rings (opacity pulse) so the district feels alive. */
  update() {
    if (!this._pulse.length) return;
    const t = performance.now() * 0.001;
    for (const p of this._pulse) {
      const m = p.mesh;
      if (!m || !m.material) continue;
      m.material.opacity = p.base + p.amp * (0.5 + 0.5 * Math.sin(t * p.speed + p.phase));
    }
  }
}