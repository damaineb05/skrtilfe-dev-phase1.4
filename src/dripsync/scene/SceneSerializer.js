/**
 * SceneSerializer
 * ─────────────────────────────────────────────────────────────
 * Normalizes realm/environment/object records from persistence
 * into runtime-friendly, serializable structures.
 *
 * None of these functions perform I/O — pure data transformation only.
 */

/**
 * Normalize a Realm entity record from persistence.
 *
 * Assumed Realm entity fields:
 *   id, name, slug, description, status,
 *   environment_id, environment_url, thumbnail_url,
 *   spawn_points (array), lighting, tags, metadata
 *
 * @param {object} raw
 * @returns {object}
 */
export function normalizeRealm(raw) {
  if (!raw) return null;
  return {
    id:             raw.id,
    name:           raw.name           || 'Unnamed Realm',
    slug:           raw.slug           || null,
    description:    raw.description    || null,
    status:         raw.status         || 'active',
    environmentId:  raw.environment_id || raw.environmentId || null,
    environmentUrl: raw.environment_url || raw.environmentUrl || raw.asset_url || null,
    thumbnailUrl:   raw.thumbnail_url  || raw.preview_url   || null,
    spawnPoints:    _normalizeSpawnPoints(raw.spawn_points || raw.spawnPoints),
    lighting:       raw.lighting       || 'default',
    tags:           raw.tags           || [],
    metadata:       raw.metadata       || {},
    createdAt:      raw.created_date   || null,
    updatedAt:      raw.updated_date   || null,
    raw,
  };
}

/**
 * Normalize a SceneObject entity record from persistence.
 *
 * Assumed SceneObject entity fields:
 *   id, name, type, asset_url, model_url,
 *   realm_id, position (array[3]), rotation (array[3]), scale (number|array[3]),
 *   is_static, is_collidable, collision_type, collision_shape, metadata
 *
 * @param {object} raw
 * @returns {object}
 */
export function normalizeSceneObject(raw) {
  if (!raw) return null;

  const pos = _normalizeVec3(raw.position || raw.world_position);
  const rot = _normalizeVec3(raw.rotation || raw.world_rotation);
  const scl = _normalizeScale(raw.scale);

  return {
    id:             raw.id,
    name:           raw.name           || 'Object',
    type:           raw.type           || raw.object_type || 'prop',
    assetUrl:       raw.asset_url      || raw.model_url   || null,
    realmId:        raw.realm_id       || null,
    position:       pos,
    rotation:       rot,
    scale:          scl,
    isStatic:       raw.is_static      !== false,   // default true
    isCollidable:   raw.is_collidable  !== false,   // default true
    collisionType:  raw.collision_type || 'box',    // 'box' | 'sphere' | 'mesh' | 'none'
    collisionShape: raw.collision_shape || null,    // optional custom descriptor
    metadata:       raw.metadata       || {},
    raw,
  };
}

/**
 * Normalize a list of SceneObject records.
 * Silently drops malformed records (null id or missing asset).
 *
 * @param {object[]} rawList
 * @returns {object[]}
 */
export function normalizeSceneObjects(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .map(raw => {
      try { return normalizeSceneObject(raw); } catch (_) { return null; }
    })
    .filter(obj => obj !== null && obj.id);
}

/**
 * Build a full normalized world model from realm + objects.
 *
 * @param {{
 *   realm:        object,   // raw Realm record
 *   objects?:     object[], // raw SceneObject records
 *   collisions?:  object[]  // optional pre-built collision descriptors
 * }} options
 * @returns {object} worldModel
 */
export function buildWorldModel({ realm, objects = [], collisions = [] }) {
  const normalizedRealm   = normalizeRealm(realm);
  const normalizedObjects = normalizeSceneObjects(objects);

  return {
    realmId:        normalizedRealm?.id        || null,
    realmName:      normalizedRealm?.name      || null,
    environmentId:  normalizedRealm?.environmentId  || null,
    environmentUrl: normalizedRealm?.environmentUrl || null,
    spawnPoints:    normalizedRealm?.spawnPoints    || [],
    lighting:       normalizedRealm?.lighting       || 'default',
    objects:        normalizedObjects,
    collisions:     collisions,
    metadata:       normalizedRealm?.metadata       || {},
    ready:          false,   // set to true by SceneRuntime after full load
  };
}

// ── Private helpers ──────────────────────────────────────────

function _normalizeVec3(val) {
  if (Array.isArray(val) && val.length >= 3) {
    return [Number(val[0]) || 0, Number(val[1]) || 0, Number(val[2]) || 0];
  }
  if (val && typeof val === 'object') {
    return [Number(val.x) || 0, Number(val.y) || 0, Number(val.z) || 0];
  }
  return [0, 0, 0];
}

function _normalizeScale(val) {
  if (Array.isArray(val) && val.length >= 3) {
    return [Number(val[0]) || 1, Number(val[1]) || 1, Number(val[2]) || 1];
  }
  if (typeof val === 'number' && val > 0) {
    return [val, val, val];
  }
  return [1, 1, 1];
}

function _normalizeSpawnPoints(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(sp => ({
    id:       sp.id       || null,
    name:     sp.name     || 'spawn',
    position: _normalizeVec3(sp.position),
    rotation: _normalizeVec3(sp.rotation),
  }));
}

export default {
  normalizeRealm,
  normalizeSceneObject,
  normalizeSceneObjects,
  buildWorldModel,
};