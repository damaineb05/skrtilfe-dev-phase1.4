import * as THREE from 'three';
import { PIXEL_RATIO_CAP } from './deviceTier';

/**
 * Core Three.js renderer / scene / loop for SKRTLIFE WORLD.
 * Owns no gameplay — subsystems are added via addSystem(sys) where sys may
 * expose init(ctx) and update(dt, engine). Keeps rendering decoupled from
 * application UI and data.
 */
export default class GameEngine {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07070d);
    this.scene.fog = new THREE.FogExp2(0x07070d, 0.012);

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    // Conservative mobile tier (Phase F.5 §17): cap pixel ratio lower on coarse-pointer
    // devices to cut fragment work ~44%. One World — only renderer settings change.
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, PIXEL_RATIO_CAP));
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(62, w / h, 0.1, 600);
    this.clock = new THREE.Clock();
    this._running = false;
    this._systems = [];

    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  addSystem(sys) {
    this._systems.push(sys);
    if (sys.init) sys.init(this);
  }

  start() {
    this._running = true;
    this._last = performance.now();
    this._loop();
  }

  _loop = () => {
    if (!this._running) return;
    requestAnimationFrame(this._loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    for (const s of this._systems) if (s.update) s.update(dt, this);
    this.renderer.render(this.scene, this.camera);
  };

  _onResize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this._running = false;
    window.removeEventListener('resize', this._onResize);
    for (const s of this._systems) if (s.dispose) s.dispose(this);
    this._systems = [];
    this._disposeScene(this.scene);
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }

  /** Free GPU/CPU resources for every geometry / material / texture in the scene. */
  _disposeScene(root) {
    const disposers = new Set();
    root.traverse((obj) => {
      if (obj.geometry) disposers.add(obj.geometry);
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if (m.map) disposers.add(m.map);
          disposers.add(m);
        });
      }
    });
    disposers.forEach((d) => { if (d && typeof d.dispose === 'function') d.dispose(); });
  }
}