/**
 * WearableBinder
 * ─────────────────────────────────────────────────────────────
 * Attaches and detaches wearable 3D assets to a live AvatarRuntime.
 *
 * Binding strategy (phase 1 — deterministic, no full rig retargeting):
 *   - Resolve target attachment node from transform.bone:
 *       1. Try AvatarRuntime.getBone(bone)       — rig bone node
 *       2. Try AvatarRuntime.getRoot()           — avatar scene root
 *       3. Fall back to the raw scene root
 *   - Apply resolved [position, rotation, scale] to the wearable root
 *   - Add wearable root as a child of the attachment node
 *
 * Future binding profiles can specify:
 *   - target bone overrides
 *   - per-axis offsets
 *   - hide-body region lists
 *   - layer priority for Z-fighting avoidance
 */

import { loadWearableModel }       from './WearableLoader.js';
import { resolveTransform }        from './WearableTransforms.js';
import WearableBindingRegistry     from './WearableBindingRegistry.js';

// ── Helpers ───────────────────────────────────────────────────

/**
 * Apply a resolved WearableTransform to a Three.js Object3D.
 * @param {THREE.Object3D}  node
 * @param {WearableTransform} transform
 */
function applyTransformToNode(node, transform) {
  if (!node) return;
  if (transform.position) {
    node.position.set(transform.position[0], transform.position[1], transform.position[2]);
  }
  if (transform.rotation) {
    node.rotation.set(transform.rotation[0], transform.rotation[1], transform.rotation[2]);
  }
  if (typeof transform.scale === 'number') {
    node.scale.setScalar(transform.scale);
  }
}

/**
 * Dispose of mesh geometry and materials to free GPU memory.
 * @param {THREE.Mesh[]}     meshes
 * @param {THREE.Material[]} materials
 */
function disposeMeshResources(meshes, materials) {
  for (const mesh of (meshes || [])) {
    mesh.geometry?.dispose();
  }
  for (const mat of (materials || [])) {
    mat.dispose?.();
  }
}

// ── WearableBinder ────────────────────────────────────────────

class WearableBinder {
  /**
   * @param {{
   *   scene:         THREE.Scene,
   *   avatarRuntime: import('../avatar/AvatarRuntime').default,
   *   loader?:       typeof import('./WearableLoader').loadWearableModel,
   * }} options
   */
  constructor({ scene, avatarRuntime, loader }) {
    if (!scene)         throw new Error('WearableBinder: scene is required.');
    if (!avatarRuntime) throw new Error('WearableBinder: avatarRuntime is required.');

    this._scene         = scene;
    this._avatarRuntime = avatarRuntime;
    this._loader        = loader || loadWearableModel;
    this._registry      = new WearableBindingRegistry();
    this._destroyed     = false;
  }

  // ── Public API ───────────────────────────────────────────────

  /**
   * Attach a wearable to the avatar runtime.
   * If the slot is already occupied, replaces it cleanly.
   *
   * @param {{
   *   wearable:          object,           — wearable/product entity record
   *   slot:              string,
   *   transformOverride?: object,          — partial WearableTransform
   *   loaderOptions?:    object,
   * }}
   * @returns {Promise<{ ok: boolean, slot: string, reason?: string, message?: string }>}
   */
  async attach({ wearable, slot, transformOverride, loaderOptions }) {
    this._assertAlive();

    // ── Validate inputs ──────────────────────────────────────
    if (!slot || typeof slot !== 'string') {
      return { ok: false, slot, reason: 'INVALID_SLOT', message: `WearableBinder: invalid slot "${slot}".` };
    }
    if (!wearable || typeof wearable !== 'object') {
      return { ok: false, slot, reason: 'INVALID_WEARABLE', message: 'WearableBinder: wearable record is required.' };
    }

    const modelUrl = wearable.model_3d_url || wearable.modelUrl || wearable.asset_url;
    if (!modelUrl) {
      return {
        ok:      false,
        slot,
        reason:  'NO_MODEL_URL',
        message: `WearableBinder: wearable "${wearable.id || wearable.title}" has no model URL.`,
      };
    }

    // ── Avatar readiness check ───────────────────────────────
    if (!this._avatarRuntime) {
      return { ok: false, slot, reason: 'NO_AVATAR_RUNTIME', message: 'WearableBinder: no avatar runtime available.' };
    }

    // ── Detach existing occupant for this slot ───────────────
    if (this._registry.has(slot)) {
      await this.detach(slot);
    }

    // ── Load asset ───────────────────────────────────────────
    let loadResult;
    try {
      loadResult = await this._loader({ modelUrl, loaderOptions });
    } catch (err) {
      return {
        ok:      false,
        slot,
        reason:  'LOAD_FAILED',
        message: `WearableBinder: asset load failed for slot "${slot}" — ${err?.message || err}`,
      };
    }

    // ── Resolve transform ────────────────────────────────────
    const transform = resolveTransform(wearable, transformOverride);

    // ── Find attachment node ─────────────────────────────────
    let attachNode = null;

    if (transform.bone) {
      // Try named bone on the avatar skeleton
      if (typeof this._avatarRuntime.getBone === 'function') {
        attachNode = this._avatarRuntime.getBone(transform.bone);
      }
    }

    if (!attachNode) {
      // Fall back to avatar root object
      if (typeof this._avatarRuntime.getRoot === 'function') {
        attachNode = this._avatarRuntime.getRoot();
      }
    }

    if (!attachNode) {
      // Last resort: scene root
      attachNode = this._scene;
    }

    // ── Apply transform & attach ─────────────────────────────
    const wearableRoot = loadResult.root;
    applyTransformToNode(wearableRoot, transform);

    try {
      attachNode.add(wearableRoot);
    } catch (err) {
      // Clean up loaded asset if attach fails
      disposeMeshResources(loadResult.meshes, loadResult.materials);
      return {
        ok:      false,
        slot,
        reason:  'ATTACH_FAILED',
        message: `WearableBinder: failed to attach wearable root to scene — ${err?.message || err}`,
      };
    }

    // ── Register ─────────────────────────────────────────────
    this._registry.register(slot, {
      wearableId:  wearable.id  || wearable.title || slot,
      wearableMeta: wearable,
      root:        wearableRoot,
      meshes:      loadResult.meshes,
      materials:   loadResult.materials,
      skeleton:    loadResult.skeleton,
      transform,
      attachNode,
      metadata:    loadResult.metadata,
    });

    return { ok: true, slot };
  }

  /**
   * Detach the wearable bound to a slot, freeing its scene node and GPU resources.
   * @param {string} slot
   * @returns {{ ok: boolean, slot: string, reason?: string }}
   */
  detach(slot) {
    this._assertAlive();

    const entry = this._registry.get(slot);
    if (!entry) {
      return { ok: false, slot, reason: 'NOT_BOUND' };
    }

    // Remove from scene graph
    if (entry.root && entry.attachNode) {
      try { entry.attachNode.remove(entry.root); } catch (_) {}
    } else if (entry.root) {
      try { this._scene.remove(entry.root); } catch (_) {}
    }

    // Dispose GPU resources
    disposeMeshResources(entry.meshes, entry.materials);

    // Remove from registry
    this._registry.remove(slot);

    return { ok: true, slot };
  }

  /**
   * Detach multiple slots at once.
   * @param {string[]} slots
   * @returns {{ slot: string, ok: boolean }[]}
   */
  detachMany(slots) {
    this._assertAlive();
    return (slots || []).map(slot => this.detach(slot));
  }

  /**
   * Return the registry entry for a slot, or null.
   * @param {string} slot
   * @returns {object | null}
   */
  getAttached(slot) {
    return this._registry.get(slot);
  }

  /**
   * Return all currently bound slot entries.
   * @returns {object[]}
   */
  getAllAttached() {
    return this._registry.getAll();
  }

  /**
   * Return a serializable slot→wearableId snapshot (safe for store/events).
   * @returns {Record<string, string>}
   */
  getSerializableSnapshot() {
    return this._registry.getSerializableSnapshot();
  }

  /**
   * Tear down: detach all wearables and release references.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    for (const entry of this._registry.getAll()) {
      if (entry.root && entry.attachNode) {
        try { entry.attachNode.remove(entry.root); } catch (_) {}
      } else if (entry.root) {
        try { this._scene.remove(entry.root); } catch (_) {}
      }
      disposeMeshResources(entry.meshes, entry.materials);
    }

    this._registry.clear();
    this._scene         = null;
    this._avatarRuntime = null;
  }

  // ── Private ──────────────────────────────────────────────────

  _assertAlive() {
    if (this._destroyed) {
      throw new Error('WearableBinder: cannot use a destroyed binder instance.');
    }
  }
}

export default WearableBinder;