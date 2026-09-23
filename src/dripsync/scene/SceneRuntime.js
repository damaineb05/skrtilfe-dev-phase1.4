/**
 * SceneRuntime
 * ─────────────────────────────────────────────────────────────
 * Class-based scene/world runtime for a DripSync session.
 * Owns the normalized world model, object manager, and live Three.js root.
 *
 * Lifecycle:
 *   new SceneRuntime({ scene, repository, loader })
 *   await runtime.loadRealm(realmId)
 *   runtime.getWorldModel()          → normalized world model
 *   runtime.getObjectManager()       → SceneObjectManager instance
 *   runtime.destroy()
 */

import SceneObjectManager                                 from './SceneObjectManager.js';
import { buildWorldModel }                                from './SceneSerializer.js';
import { loadEnvironmentAsset }                           from './SceneLoader.js';
import { buildCollisionMap, serializeCollisionMap }       from './SceneCollision.js';

class SceneRuntime {
  /**
   * @param {{
   *   scene:      import('three').Scene,
   *   repository: import('../backend/DripSyncRepository').default,
   *   loaderOptions?: object
   * }} options
   */
  constructor({ scene, repository, loaderOptions = {} }) {
    if (!scene)      throw new Error('SceneRuntime: Three.js scene is required.');
    if (!repository) throw new Error('SceneRuntime: repository is required.');

    this._scene          = scene;
    this._repo           = repository;
    this._loaderOptions  = loaderOptions;
    this._objectManager  = new SceneObjectManager();
    this._worldModel     = null;
    this._environmentRoot = null;  // live Three.js Object3D — never in store
    this._destroyed      = false;
  }

  // ── Public API ───────────────────────────────────────────────

  /**
   * Load a realm by its entity ID.
   * Fetches realm record, environment data, and all scene objects.
   * Builds a full normalized world model with collision metadata.
   *
   * @param {string} realmId
   * @returns {Promise<object>} normalized worldModel
   */
  async loadRealm(realmId) {
    this._assertAlive();

    if (!realmId) {
      throw new Error('SceneRuntime.loadRealm: realmId is required.');
    }

    // ── 1. Fetch realm record ─────────────────────────────────
    const realmRecord = await this._repo.getRealmById(realmId);
    if (!realmRecord) {
      throw new Error(`SceneRuntime.loadRealm: realm "${realmId}" not found.`);
    }

    // ── 2. Fetch scene objects ────────────────────────────────
    let rawObjects = [];
    try {
      rawObjects = await this._repo.getSceneObjectsByRealm(realmId);
    } catch (err) {
      console.warn(`SceneRuntime.loadRealm: getSceneObjectsByRealm failed — ${err?.message}`);
      rawObjects = [];
    }

    // ── 3. Build initial world model (no collision yet) ───────
    const partialModel = buildWorldModel({ realm: realmRecord, objects: rawObjects });

    // ── 4. Populate object manager ────────────────────────────
    this._objectManager.setObjects(partialModel.objects);

    // ── 5. Load environment asset ─────────────────────────────
    let environmentMetadata = null;
    if (partialModel.environmentUrl) {
      try {
        const loaded = await loadEnvironmentAsset({
          environmentUrl: partialModel.environmentUrl,
          scene:          this._scene,
          loaderOptions:  this._loaderOptions,
        });
        this._environmentRoot = loaded.root;
        environmentMetadata   = loaded.metadata;
      } catch (err) {
        // Environment load failure is an error — propagate clearly
        throw new Error(`SceneRuntime.loadRealm: environment asset failed to load — ${err.message}`);
      }
    }

    // ── 6. Build collision metadata ───────────────────────────
    const collisionMap   = buildCollisionMap(partialModel);
    const collisionArray = serializeCollisionMap(collisionMap);

    // ── 7. Assemble final world model ─────────────────────────
    this._worldModel = {
      ...partialModel,
      collisions:          collisionArray,
      environmentMetadata: environmentMetadata || null,
      ready:               true,
    };

    return this._worldModel;
  }

  /**
   * Load only the environment asset for a pre-normalized realm record.
   * Useful when realm metadata is already available but asset isn't loaded yet.
   *
   * @param {object} realmRecord  — normalized (from SceneSerializer.normalizeRealm)
   * @returns {Promise<object>} environmentMetadata
   */
  async loadEnvironment(realmRecord) {
    this._assertAlive();

    if (!realmRecord?.environmentUrl) {
      throw new Error('SceneRuntime.loadEnvironment: environmentUrl is required on realmRecord.');
    }

    const loaded = await loadEnvironmentAsset({
      environmentUrl: realmRecord.environmentUrl,
      scene:          this._scene,
      loaderOptions:  this._loaderOptions,
    });

    this._environmentRoot = loaded.root;
    return loaded.metadata;
  }

  /**
   * Fetch + hydrate scene objects for a realm (without reloading environment).
   * Updates the object manager in place.
   *
   * @param {string} realmId
   * @returns {Promise<object[]>} normalized objects
   */
  async loadObjects(realmId) {
    this._assertAlive();

    const rawObjects = await this._repo.getSceneObjectsByRealm(realmId);
    const partial    = buildWorldModel({ realm: { id: realmId }, objects: rawObjects });

    this._objectManager.setObjects(partial.objects);

    if (this._worldModel) {
      this._worldModel.objects    = partial.objects;
      const collisionMap          = buildCollisionMap(this._worldModel);
      this._worldModel.collisions = serializeCollisionMap(collisionMap);
    }

    return partial.objects;
  }

  /**
   * Return the current normalized world model (or null if not yet loaded).
   * @returns {object|null}
   */
  getWorldModel() {
    return this._worldModel;
  }

  /**
   * Return the live SceneObjectManager.
   * @returns {SceneObjectManager}
   */
  getObjectManager() {
    return this._objectManager;
  }

  /**
   * Tear down the runtime: remove environment root from scene, clear objects.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    // Remove environment from Three.js scene
    if (this._environmentRoot && this._scene) {
      this._scene.remove(this._environmentRoot);
      this._environmentRoot = null;
    }

    this._objectManager.clear();
    this._worldModel  = null;
    this._scene       = null;
    this._repo        = null;
  }

  // ── Private ──────────────────────────────────────────────────

  _assertAlive() {
    if (this._destroyed) {
      throw new Error('SceneRuntime: cannot use a destroyed instance.');
    }
  }
}

export default SceneRuntime;