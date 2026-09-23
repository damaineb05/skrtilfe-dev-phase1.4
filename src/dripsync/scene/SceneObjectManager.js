/**
 * SceneObjectManager
 * ─────────────────────────────────────────────────────────────
 * Runtime-memory manager for normalized scene object records.
 * No persistence — operates entirely in-memory.
 *
 * All objects are expected to be normalized SceneObject shapes
 * (output of SceneSerializer.normalizeSceneObject).
 */

class SceneObjectManager {
  constructor() {
    /** @type {Map<string, object>} */
    this._objects = new Map();
  }

  /**
   * Replace the entire object set.
   * Silently skips objects without a valid id.
   * @param {object[]} objects
   */
  setObjects(objects) {
    this._objects.clear();
    if (!Array.isArray(objects)) return;
    for (const obj of objects) {
      if (obj && obj.id) {
        this._objects.set(obj.id, obj);
      }
    }
  }

  /**
   * Return a copy of all managed objects as an array.
   * @returns {object[]}
   */
  getObjects() {
    return Array.from(this._objects.values());
  }

  /**
   * Retrieve a single object by id.
   * @param {string} id
   * @returns {object|null}
   */
  getObjectById(id) {
    return this._objects.get(id) || null;
  }

  /**
   * Add or replace a single object.
   * Throws if the object has no id.
   * @param {object} object
   */
  addObject(object) {
    if (!object || !object.id) {
      throw new Error('SceneObjectManager: object must have a valid id.');
    }
    this._objects.set(object.id, object);
  }

  /**
   * Remove an object by id.
   * No-op if the id is not found.
   * @param {string} id
   * @returns {boolean} true if removed, false if not found
   */
  removeObject(id) {
    return this._objects.delete(id);
  }

  /**
   * Check if an object with the given id exists.
   * @param {string} id
   * @returns {boolean}
   */
  hasObject(id) {
    return this._objects.has(id);
  }

  /**
   * Return the count of managed objects.
   * @returns {number}
   */
  get count() {
    return this._objects.size;
  }

  /**
   * Return objects filtered by type.
   * @param {string} type
   * @returns {object[]}
   */
  getObjectsByType(type) {
    return this.getObjects().filter(o => o.type === type);
  }

  /** Clear all objects. */
  clear() {
    this._objects.clear();
  }
}

export default SceneObjectManager;