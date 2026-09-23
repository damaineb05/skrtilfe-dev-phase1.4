/**
 * SceneCollision
 * ─────────────────────────────────────────────────────────────
 * Collision metadata layer for the DripSync world runtime.
 *
 * Phase 1: builds clean serializable collision descriptors from
 * world model data. No physics resolution — that is a future layer.
 *
 * A collision descriptor shape:
 * {
 *   objectId:   string,
 *   name:       string,
 *   type:       'box' | 'sphere' | 'mesh' | 'none',
 *   position:   [x, y, z],
 *   rotation:   [x, y, z],
 *   scale:      [x, y, z],
 *   isStatic:   boolean,
 *   customShape: object | null  // forwarded from SceneObject.collisionShape
 * }
 */

/**
 * Build a collision map from a world model.
 * Returns a map keyed by objectId for O(1) lookup.
 *
 * @param {object} worldModel  — output of SceneSerializer.buildWorldModel
 * @returns {Map<string, object>} collisionMap
 */
export function buildCollisionMap(worldModel) {
  const map = new Map();

  if (!worldModel || !Array.isArray(worldModel.objects)) {
    return map;
  }

  for (const obj of worldModel.objects) {
    if (!obj || !obj.id) continue;
    if (obj.collisionType === 'none' || obj.isCollidable === false) continue;

    const descriptor = _buildDescriptor(obj);
    map.set(obj.id, descriptor);
  }

  return map;
}

/**
 * Return a plain array of collidable object descriptors from a world model.
 * Convenience wrapper around buildCollisionMap for consumers that prefer arrays.
 *
 * @param {object} worldModel
 * @returns {object[]}
 */
export function getCollidableObjects(worldModel) {
  const map = buildCollisionMap(worldModel);
  return Array.from(map.values());
}

/**
 * Serialize a collision map to a plain array (for store persistence).
 *
 * @param {Map<string, object>} collisionMap
 * @returns {object[]}
 */
export function serializeCollisionMap(collisionMap) {
  if (!(collisionMap instanceof Map)) return [];
  return Array.from(collisionMap.values());
}

/**
 * Rebuild a collision map from a serialized array (e.g. from store state).
 *
 * @param {object[]} descriptors
 * @returns {Map<string, object>}
 */
export function deserializeCollisionMap(descriptors) {
  const map = new Map();
  if (!Array.isArray(descriptors)) return map;
  for (const d of descriptors) {
    if (d && d.objectId) map.set(d.objectId, d);
  }
  return map;
}

// ── Private helpers ──────────────────────────────────────────

function _buildDescriptor(obj) {
  return {
    objectId:    obj.id,
    name:        obj.name        || 'Object',
    type:        obj.collisionType || 'box',
    position:    obj.position    || [0, 0, 0],
    rotation:    obj.rotation    || [0, 0, 0],
    scale:       obj.scale       || [1, 1, 1],
    isStatic:    obj.isStatic    !== false,
    customShape: obj.collisionShape || null,
  };
}

export default {
  buildCollisionMap,
  getCollidableObjects,
  serializeCollisionMap,
  deserializeCollisionMap,
};