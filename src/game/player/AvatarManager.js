import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { loadGLB } from '../assets/AssetRegistry';

const BONE_BY_SLOT = {
  headwear: 'Head', hat: 'Head', eyewear: 'Head', glasses: 'Head',
  top: 'Spine1', shirt: 'Spine1', jacket: 'Spine1',
  bottom: 'Spine', pants: 'Spine',
  shoes: 'LeftFoot', footwear: 'LeftFoot',
  full_body: 'Spine1', accessory: 'Spine1', bag: 'Spine',
};

/**
 * AvatarManager — loads the SKRTLIFE user's CANONICAL avatar (User.avatar_config)
 * into the Three.js scene and keeps the player visual stable for the controller,
 * camera, and collision systems.
 *
 *   WorldAvatarAdapter.buildWorldAvatarSpec(user)
 *        ↓
 *   AvatarManager.loadFromConfig(spec)
 *        ↓
 *   base avatar (AssetRegistry-cached GLB) + equipped wearables (bone-attached)
 *        ↓ fallback
 *   SKRTLIFE primitive placeholder
 *
 * Architecture contract (Phase D):
 *   - `this.root` (THREE.Group) is created once and NEVER replaced. PlayerController
 *     copies position/rotation onto it every frame; CameraRig targets the
 *     controller's position (not a child mesh). So swapping the visual inside
 *     `this.root` (hot-refresh) never resets position, camera, or collision.
 *   - A failed base model → placeholder. A failed wearable → logged + skipped.
 *     No single cosmetic asset can crash the World.
 *   - GLBs load through AssetRegistry.loadGLB (cached) so the same model is never
 *     downloaded twice. The cached scene is reused directly (single local user);
 *     multiplayer will require SkeletonUtils.clone per remote instance — noted,
 *     not implemented in Phase D.
 */
export default class AvatarManager {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    scene.add(this.root);
    this.mixer = null;
    this.actions = {};
    this.current = null;
    this._lastState = null;
    this.model = null;
    this.source = null;
    this._attachedWearables = []; // [{ object, boneName }]
    this._loader = new GLTFLoader(); // fallback only if the registry misses
    this._loadGen = 0; // monotonic token — an earlier load bails if a newer one started
  }

  /**
   * Load the canonical avatar from a WorldAvatarSpec (built by
   * WorldAvatarAdapter from User.avatar_config). Resolves the base avatar,
   * attaches equipped wearables by rig bone, applies supported customization,
   * and initializes animations. Falls back to the placeholder if the base
   * model is missing or fails.
   *
   * Safe to call again for hot-refresh: detaches previous wearables, reloads
   * the base, re-attaches. `this.root` (and thus the player's transform) is
   * preserved — position/camera/collision are untouched.
   *
   * @returns {Promise<{loaded:boolean, source:string, wearablesApplied:number, wearablesFailed:number}>}
   */
  async loadFromConfig(spec) {
    // Generation guard: if a newer load starts before this one's GLB resolves,
    // bail without touching the root — an earlier selection must never overwrite
    // a later one (rapid switching / double hot-refresh). The caller (SkrtWorld)
    // also dedupes by fingerprint, so concurrent calls don't occur in practice;
    // this is defense-in-depth for the base-model swap.
    const gen = ++this._loadGen;
    const baseUrl = spec?.baseModelUrl;
    if (baseUrl) {
      try {
        const { scene, animations } = await this._loadGLB(baseUrl);
        if (gen !== this._loadGen) return { loaded: false, source: 'stale', wearablesApplied: 0, wearablesFailed: 0 };
        this._detachPreviousWearables();
        this._setModel(scene, animations);
        this.source = 'avatar';
        if (spec.customization) this._applyCustomization(spec.customization);
        const worn = await this._attachWearables(spec.wearables || []);
        return {
          loaded: true,
          source: 'avatar',
          wearablesApplied: worn.applied.length,
          wearablesFailed: worn.failed.length,
        };
      } catch (e) {
        console.warn('[AvatarManager] avatar load failed — placeholder', e);
      }
    }
    if (gen !== this._loadGen) return { loaded: false, source: 'stale', wearablesApplied: 0, wearablesFailed: 0 };
    this._detachPreviousWearables();
    this._setPlaceholder();
    this.source = 'placeholder';
    return { loaded: false, source: 'placeholder', wearablesApplied: 0, wearablesFailed: 0 };
  }

  /**
   * @deprecated World now loads identity from User.avatar_config via
   * loadFromConfig (WorldAvatarAdapter). Kept only for backward compatibility.
   */
  async loadFromProfile(profile) {
    return this.loadFromConfig({ baseModelUrl: profile?.base_avatar_url, wearables: [] });
  }

  // ── GLB loading (AssetRegistry cache first) ─────────────────────────────────
  async _loadGLB(url) {
    try {
      return await loadGLB(url); // cached — avoids repeated downloads on hot-refresh
    } catch {
      const gltf = await this._loader.loadAsync(url);
      return { scene: gltf.scene, animations: gltf.animations || [] };
    }
  }

  // ── Wearable attachment ──────────────────────────────────────────────────────
  _detachPreviousWearables() {
    for (const a of this._attachedWearables) {
      try {
        a.object.parent?.remove(a.object);
      } catch {
        /* ignore — already detached */
      }
    }
    this._attachedWearables = [];
  }

  async _attachWearables(wearables) {
    const applied = [];
    const failed = [];
    for (const w of wearables) {
      if (!w || !w.url) continue;
      try {
        const { scene } = await this._loadGLB(w.url);
        scene.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });
        const boneName = w.bone || BONE_BY_SLOT[w.slot] || 'Spine1';
        const bone = this._findBone(this.model, boneName);
        if (bone) bone.add(scene);
        else this.root.add(scene); // fallback: no rig bone match → root-attach

        const p = w.position || [0, 0, 0];
        scene.position.set(p[0] || 0, p[1] || 0, p[2] || 0);
        const r = w.rotation || [0, 0, 0];
        scene.rotation.set(r[0] || 0, r[1] || 0, r[2] || 0);
        scene.scale.setScalar(typeof w.scale === 'number' ? w.scale : 1);

        this._attachedWearables.push({ object: scene, boneName });
        applied.push(w);
      } catch (e) {
        // A broken wearable must not fail the avatar — log and continue.
        console.warn(`[AvatarManager] wearable "${w.name || w.url}" skipped`, e);
        failed.push(w);
      }
    }
    return { applied, failed };
  }

  _findBone(root, name) {
    if (!root || !name) return null;
    let found = null;
    root.traverse((o) => {
      if (!found && o.isBone && o.name === name) found = o;
    });
    return found;
  }

  // ── Customization (best-effort material tint by name) ─────────────────────────
  // RPM GLBs name materials "Skin", "Eyes", "Hair". We match case-insensitively
  // and tint. No match → silently skipped. Never throws.
  _applyCustomization(cust) {
    if (!cust || !this.model) return;
    const tints = [];
    if (cust.skinTone) tints.push({ re: /skin|body|face/i, color: cust.skinTone });
    if (cust.eyeColor) tints.push({ re: /eye/i, color: cust.eyeColor });
    if (cust.hairColor) tints.push({ re: /hair/i, color: cust.hairColor });
    if (!tints.length) return;
    this.model.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m || !m.name) return;
        for (const t of tints) {
          if (t.re.test(m.name)) {
            try {
              m.color = new THREE.Color(t.color);
              m.needsUpdate = true;
            } catch {
              /* ignore — unsupported material type */
            }
          }
        }
      });
    });
  }

  // ── Model / placeholder ─────────────────────────────────────────────────────
  _clear() {
    while (this.root.children.length) this.root.remove(this.root.children[0]);
  }

  _setModel(model, anims) {
    this._clear();
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    this.root.add(model);
    this.model = model;
    this.mixer = null;
    this.actions = {};
    if (anims && anims.length) {
      this.mixer = new THREE.AnimationMixer(model);
      anims.forEach((c) => {
        this.actions[c.name.toLowerCase()] = this.mixer.clipAction(c);
      });
    }
    this._lastState = null;
    this.setState('idle');
  }

  _setPlaceholder() {
    this._clear();
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1b1b24, roughness: 0.7, metalness: 0.15 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf2c79b, roughness: 0.6 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.7, roughness: 0.4 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.95, 6, 14), bodyMat);
    body.position.y = 1.0;
    body.castShadow = true;
    body.receiveShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 20), skinMat);
    head.position.y = 1.85;
    head.castShadow = true;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.3), accentMat);
    visor.position.set(0, 1.9, 0.16);
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.32), accentMat);
    chest.position.set(0, 1.35, 0.2);
    g.add(body, head, visor, chest);
    this.root.add(g);
    this.model = g;
    this.mixer = null;
    this.actions = {};
    this._lastState = null;
  }

  // ── Animation ───────────────────────────────────────────────────────────────
  _play(name) {
    if (!this.mixer || !this.actions[name]) {
      // no clip by that name — keep whatever is playing; movement still works
      return;
    }
    Object.values(this.actions).forEach((a) => {
      if (a !== this.actions[name]) a.fadeOut(0.18);
    });
    const a = this.actions[name];
    a.reset().fadeIn(0.18).play();
    this.current = name;
  }

  setState(state) {
    const map = { idle: 'idle', walk: 'walk', run: 'run', jump: 'jump', fall: 'jump' };
    const target = map[state] || 'idle';
    if (target === this._lastState) return;
    this._lastState = target;
    if (this.mixer) this._play(target);
  }

  update(dt) {
    if (this.mixer) this.mixer.update(dt);
  }
}