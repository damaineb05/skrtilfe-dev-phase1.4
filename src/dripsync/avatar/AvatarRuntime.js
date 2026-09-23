/**
 * AvatarRuntime
 * ─────────────────────────────────────────────────────────────
 * Class-based runtime object for the active DripSync avatar.
 * Owns the live Three.js objects; serializable state lives in
 * DripSyncStore, not here.
 *
 * Lifecycle:
 *   new AvatarRuntime({ avatarRecord, scene, loader })
 *     → .load()          — async, transitions idle → loading → loaded/ready
 *     → .applyAppearance(config)
 *     → .getBone(name)   — for wearable binding
 *     → .destroy()       — unmount and cleanup
 */

import { loadAvatarModel } from './AvatarLoader.js';
import { normalizeAppearanceConfig, applyAppearanceToRuntime } from './AvatarAppearance.js';

export const RuntimeStatus = Object.freeze({
  IDLE:    'idle',
  LOADING: 'loading',
  LOADED:  'loaded',
  READY:   'ready',
  ERROR:   'error',
});

class AvatarRuntime {
  /**
   * @param {{
   *   avatarRecord:   object,          — normalized avatar from repository
   *   scene?:         THREE.Scene,     — optional; can be attached later
   *   loaderOptions?: object
   * }}
   */
  constructor({ avatarRecord, scene = null, loaderOptions = {} }) {
    if (!avatarRecord) {
      throw new Error('AvatarRuntime: avatarRecord is required.');
    }

    this._record        = avatarRecord;
    this._scene         = scene;
    this._loaderOptions = loaderOptions;

    // Live Three.js objects — never serialized
    this._root       = null;
    this._skeleton   = null;
    this._animations = [];

    // Serializable status
    this._status    = RuntimeStatus.IDLE;
    this._error     = null;
    this._metadata  = null;

    this._destroyed = false;
  }

  // ── Public API ──────────────────────────────────────────────

  /**
   * Load the avatar model from the record's model URL.
   * Transitions: idle → loading → loaded (→ ready after applyAppearance or immediately).
   *
   * @returns {Promise<void>}
   */
  async load() {
    this._assertAlive();

    if (this._status === RuntimeStatus.LOADING) {
      throw new Error('AvatarRuntime: already loading.');
    }

    const modelUrl = this._resolveModelUrl();

    if (!modelUrl) {
      const err = 'AvatarRuntime: avatar record has no model URL. Cannot load.';
      this._setError(err);
      throw new Error(err);
    }

    this._status = RuntimeStatus.LOADING;
    this._error  = null;

    try {
      const result = await loadAvatarModel({
        modelUrl,
        scene:         this._scene,
        loaderOptions: this._loaderOptions,
      });

      this._root       = result.root;
      this._skeleton   = result.skeleton;
      this._animations = result.animations;
      this._metadata   = result.metadata;
      this._status     = RuntimeStatus.LOADED;

      // Immediately promote to ready (appearance can be applied separately)
      this._status = RuntimeStatus.READY;

    } catch (err) {
      this._setError(err?.message || String(err));
      throw err;
    }
  }

  /**
   * Attach or replace the Three.js scene after construction.
   * Safe to call before or after load().
   * @param {THREE.Scene} scene
   */
  attachScene(scene) {
    this._assertAlive();
    this._scene = scene;

    // If already loaded, add root to the new scene
    if (this._root && scene) {
      scene.add(this._root);
    }
  }

  // ── Accessors ───────────────────────────────────────────────

  /** @returns {THREE.Object3D | null} */
  getRoot() { return this._root; }

  /** @returns {THREE.Skeleton | null} */
  getSkeleton() { return this._skeleton; }

  /** @returns {THREE.AnimationClip[]} */
  getAnimations() { return this._animations; }

  /** @returns {string} one of RuntimeStatus values */
  getStatus() { return this._status; }

  /** @returns {string | null} */
  getError() { return this._error; }

  /** @returns {object | null} */
  getMetadata() { return this._metadata; }

  /** @returns {boolean} */
  isReady() { return this._status === RuntimeStatus.READY; }

  /**
   * Look up a bone by name from the loaded skeleton.
   * Returns null if skeleton isn't loaded or bone doesn't exist.
   * @param {string} name
   * @returns {THREE.Bone | null}
   */
  getBone(name) {
    if (!this._skeleton) return null;
    return this._skeleton.bones.find(b => b.name === name) || null;
  }

  // ── Appearance ──────────────────────────────────────────────

  /**
   * Apply an appearance config to the loaded avatar.
   * Safe to call with partial or empty config.
   * @param {object} appearanceConfig
   */
  applyAppearance(appearanceConfig) {
    this._assertAlive();

    if (this._status !== RuntimeStatus.READY && this._status !== RuntimeStatus.LOADED) {
      console.warn('AvatarRuntime.applyAppearance: avatar is not yet loaded. Skipping.');
      return;
    }

    const normalized = normalizeAppearanceConfig(appearanceConfig);
    applyAppearanceToRuntime(this._root, normalized);
  }

  // ── Lifecycle ───────────────────────────────────────────────

  /**
   * Remove root from scene and release references.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    if (this._root) {
      if (this._scene) {
        this._scene.remove(this._root);
      }
      // Dispose geometries and materials
      this._root.traverse((node) => {
        if (node.geometry) node.geometry.dispose();
        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach(m => m.dispose());
          } else {
            node.material.dispose();
          }
        }
      });
      this._root = null;
    }

    this._skeleton   = null;
    this._animations = [];
    this._scene      = null;
    this._status     = RuntimeStatus.IDLE;
  }

  // ── Private ─────────────────────────────────────────────────

  _resolveModelUrl() {
    const r = this._record;
    return r?.modelUrl || r?.model_url || r?.avatar_url || r?.url || null;
  }

  _setError(message) {
    this._status = RuntimeStatus.ERROR;
    this._error  = message;
    console.error(`AvatarRuntime error: ${message}`);
  }

  _assertAlive() {
    if (this._destroyed) {
      throw new Error('AvatarRuntime: cannot use a destroyed runtime instance.');
    }
  }
}

export default AvatarRuntime;