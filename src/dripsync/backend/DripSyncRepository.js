/**
 * DripSyncRepository
 * ─────────────────────────────────────────────────────────────
 * THE ONLY DripSync layer that may call Base44 directly.
 * All other DripSync modules must go through this interface.
 *
 * Entity mapping (from project schema):
 *   Avatar          → avatar profiles owned by users (created_by = user email)
 *   AssetOwnership  → items in a user's closet (user_id field)
 *   AvatarWearables → currently equipped items per avatar (avatar_id field)
 *   OutfitPreset    → saved outfit presets (user_id, avatar_id fields)
 *   Realm           → realm/environment definitions (id, name, environment_url, …)
 *   SceneObject     → per-realm 3D objects (realm_id, asset_url, position, …)
 */

import { base44 } from '@/api/base44Client';

class DripSyncRepository {

  /**
   * Fetch the active avatar for a given user.
   * The Avatar entity uses `created_by` (user email) as ownership.
   * We order by most-recently updated and take the first result
   * (future: a dedicated `is_active` flag on Avatar can replace this).
   *
   * @param {string} userId  — user email (Base44 created_by convention)
   * @returns {Promise<object|null>}
   */
  async getActiveAvatar(userId) {
    if (!userId) return null;

    const results = await base44.entities.Avatar.filter(
      { created_by: userId },
      '-updated_date',
      1
    );

    if (!results || results.length === 0) return null;
    return this._normalizeAvatar(results[0]);
  }

  /**
   * Fetch all items in a user's virtual closet.
   * AssetOwnership tracks every asset a user has acquired.
   *
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  async getUserCloset(userId) {
    if (!userId) return [];

    const results = await base44.entities.AssetOwnership.filter(
      { user_id: userId },
      '-created_date',
      200
    );

    return (results || []).map(item => this._normalizeClosetItem(item));
  }

  /**
   * Fetch the equipped wearables for a specific avatar.
   * AvatarWearables stores the slot → asset mapping per avatar.
   *
   * @param {string} avatarId
   * @returns {Promise<object[]>}
   */
  async getAvatarWearables(avatarId) {
    if (!avatarId) return [];

    const results = await base44.entities.AvatarWearables.filter(
      { avatar_id: avatarId },
      '-updated_date',
      50
    );

    return (results || []).map(item => this._normalizeWearable(item));
  }

  /**
   * Fetch saved outfit presets for a user / avatar pair.
   *
   * @param {string} userId
   * @param {string} avatarId
   * @returns {Promise<object[]>}
   */
  async getOutfitPresets(userId, avatarId) {
    if (!userId) return [];

    const filter = avatarId
      ? { user_id: userId, avatar_id: avatarId }
      : { user_id: userId };

    const results = await base44.entities.OutfitPreset.filter(
      filter,
      '-updated_date',
      50
    );

    return (results || []).map(preset => this._normalizePreset(preset));
  }

  /**
   * Persist a new outfit preset record.
   * @param {object} payload — { user_id, avatar_id, name, slots, item_count }
   * @returns {Promise<object>} created record
   */
  async saveOutfitPreset(payload) {
    return base44.entities.OutfitPreset.create(payload);
  }

  /**
   * Fetch a single outfit preset by its entity ID.
   * @param {string} presetId
   * @returns {Promise<object|null>}
   */
  async getOutfitPresetById(presetId) {
    if (!presetId) return null;
    try {
      const result = await base44.entities.OutfitPreset.get(presetId);
      return result ? this._normalizePreset(result) : null;
    } catch (_) {
      return null;
    }
  }

  /**
   * Delete an outfit preset by its entity ID.
   * @param {string} presetId
   * @returns {Promise<void>}
   */
  async deleteOutfitPreset(presetId) {
    if (!presetId) return;
    await base44.entities.OutfitPreset.delete(presetId);
  }

  /**
   * Fetch all AssetOwnership records for a user.
   * Used by ClosetService as the ownership source of truth.
   *
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  async getOwnershipsByUser(userId) {
    if (!userId) return [];

    const results = await base44.entities.AssetOwnership.filter(
      { user_id: userId },
      '-created_date',
      500
    );

    return results || [];
  }

  /**
   * Fetch a specific set of Wearable records by their IDs.
   * Performs targeted per-ID fetches to avoid loading the full catalog.
   * Falls back gracefully if individual records are missing.
   *
   * @param {string[]} wearableIds
   * @returns {Promise<object[]>}
   */
  async getWearablesByIds(wearableIds) {
    if (!wearableIds || wearableIds.length === 0) return [];

    const results = await Promise.allSettled(
      wearableIds.map(id => base44.entities.Wearable.get(id))
    );

    return results
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => r.value);
  }

  /**
   * Fetch a single Wearable by its ID.
   * Returns null if not found.
   * @param {string} wearableId
   * @returns {Promise<object|null>}
   */
  async getWearableById(wearableId) {
    if (!wearableId) return null;
    try {
      const result = await base44.entities.Wearable.get(wearableId);
      return result ? this._normalizeWearableCatalog(result) : null;
    } catch (_) {
      return null;
    }
  }

  /**
   * Fetch the ownership record for a specific user + wearable pair.
   * Used as fallback when ownerships aren't already in memory.
   * @param {string} userId
   * @param {string} wearableId
   * @returns {Promise<object|null>}
   */
  async getOwnershipByUserAndWearable(userId, wearableId) {
    if (!userId || !wearableId) return null;

    const results = await base44.entities.AssetOwnership.filter(
      { user_id: userId, asset_id: wearableId },
      '-created_date',
      1
    );

    if (!results || results.length === 0) return null;
    const raw = results[0];
    return {
      ownershipId: raw.id,
      wearableId:  raw.asset_id || raw.wearable_id || null,
      userId:      raw.user_id  || raw.created_by  || null,
      quantity:    typeof raw.quantity === 'number' ? raw.quantity : 1,
      isActive:    raw.is_active !== false,
      source:      raw.source || 'owned',
      acquiredAt:  raw.created_date || null,
      raw,
    };
  }

  /**
   * Persist a new equipped wearable record for an avatar.
   * Creates an AvatarWearables entity record.
   * @param {object} payload
   * @returns {Promise<object>} created record
   */
  async equipAvatarWearable(payload) {
    return base44.entities.AvatarWearables.create(payload);
  }

  /**
   * Remove an equipped wearable record by its entity ID.
   * @param {string} equippedRecordId
   * @returns {Promise<void>}
   */
  async unequipAvatarWearable(equippedRecordId) {
    if (!equippedRecordId) return;
    await base44.entities.AvatarWearables.delete(equippedRecordId);
  }

  // ── Normalizers ─────────────────────────────────────────────


  // Provide stable shapes regardless of backend field drift.

  _normalizeAvatar(raw) {
    if (!raw) return null;
    return {
      id:           raw.id,
      name:         raw.name || 'My Avatar',
      modelUrl:     raw.rpm_url || raw.model_url || raw.avatar_url || null,
      thumbnailUrl: raw.thumbnail_url || raw.preview_url || null,
      appearance:   raw.traits || raw.customization || raw.appearance || null,
      gender:       raw.gender || null,
      createdBy:    raw.created_by,
      updatedAt:    raw.updated_date,
      raw,
    };
  }

  _normalizeClosetItem(raw) {
    if (!raw) return null;
    return {
      id:          raw.id,
      assetId:     raw.asset_id || raw.product_id || null,
      assetName:   raw.asset_name || raw.name || null,
      slot:        raw.slot || raw.wearable_slot || null,
      modelUrl:    raw.model_url || raw.asset_url || null,
      thumbnailUrl:raw.thumbnail_url || raw.image_url || null,
      source:      raw.source || 'owned', // 'owned' | 'minted' | 'gifted'
      userId:      raw.user_id,
      raw,
    };
  }

  _normalizeWearable(raw) {
    if (!raw) return null;
    return {
      id:        raw.id,
      avatarId:  raw.avatar_id,
      slot:      raw.slot || raw.wearable_slot || null,
      assetId:   raw.asset_id || null,
      modelUrl:  raw.model_url || raw.asset_url || null,
      bone:      raw.bone || raw.wearable_bone || 'Hips',
      position:  raw.position || raw.wearable_position || [0, 0, 0],
      rotation:  raw.rotation || raw.wearable_rotation || [0, 0, 0],
      scale:     raw.scale    || raw.wearable_scale    || 1,
      raw,
    };
  }

  _normalizePreset(raw) {
    if (!raw) return null;
    return {
      id:         raw.id,
      name:       raw.name || 'Untitled Preset',
      userId:     raw.user_id,
      avatarId:   raw.avatar_id || null,
      // Canonical slots map — may be object or array in older records
      slots:      raw.slots || raw.outfit_slots || raw.items || raw.outfit_items || {},
      itemCount:  raw.item_count || 0,
      thumbnail:  raw.thumbnail_url || null,
      updatedAt:  raw.updated_date,
      createdAt:  raw.created_date,
      raw,
    };
  }

  // ── Scene / Realm ────────────────────────────────────────

  /**
   * Fetch a single Realm record by its entity ID.
   * @param {string} realmId
   * @returns {Promise<object|null>}
   */
  async getRealmById(realmId) {
    if (!realmId) return null;
    try {
      const result = await base44.entities.Realm.get(realmId);
      return result || null;
    } catch (_) {
      return null;
    }
  }

  /**
   * Fetch all SceneObject records that belong to a realm.
   * @param {string} realmId
   * @returns {Promise<object[]>}
   */
  async getSceneObjectsByRealm(realmId) {
    if (!realmId) return [];
    const results = await base44.entities.SceneObject.filter(
      { realm_id: realmId },
      'created_date',
      500
    );
    return results || [];
  }

  /**
   * Fetch the default/featured realm (first active realm, ordered by creation).
   * Returns null if no realms exist.
   * @returns {Promise<object|null>}
   */
  async getDefaultRealm() {
    try {
      const results = await base44.entities.Realm.filter(
        { status: 'active' },
        'created_date',
        1
      );
      return (results && results.length > 0) ? results[0] : null;
    } catch (_) {
      return null;
    }
  }

  // ── Commerce / Entitlements ──────────────────────────────────────

  /**
   * Fetch a single Order record by its entity ID.
   * @param {string} orderId
   * @returns {Promise<object|null>}
   */
  async getOrderById(orderId) {
    if (!orderId) return null;
    try {
      const result = await base44.entities.Order.get(orderId);
      return result || null;
    } catch (_) {
      return null;
    }
  }

  /**
   * Fetch all OrderItem records for a specific order.
   * @param {string} orderId
   * @returns {Promise<object[]>}
   */
  async getOrderItemsByOrder(orderId) {
    if (!orderId) return [];
    const results = await base44.entities.Order.filter(
      { order_id: orderId },
      'created_date',
      500
    );
    return results || [];
  }

  /**
   * Fetch a Wearable by its associated product ID.
   * Assumes Wearable has a product_id field or similar mapping.
   * @param {string} productId
   * @returns {Promise<object|null>}
   */
  async getWearableByProductId(productId) {
    if (!productId) return null;
    try {
      const results = await base44.entities.Wearable.filter(
        { product_id: productId },
        '-created_date',
        1
      );
      return (results && results.length > 0) ? results[0] : null;
    } catch (_) {
      return null;
    }
  }

  /**
   * Fetch a Wearable by its variant SKU.
   * Assumes Wearable has a variant_sku field or similar.
   * @param {string} variantSku
   * @returns {Promise<object|null>}
   */
  async getWearableByVariantSku(variantSku) {
    if (!variantSku) return null;
    try {
      const results = await base44.entities.Wearable.filter(
        { variant_sku: variantSku },
        '-created_date',
        1
      );
      return (results && results.length > 0) ? results[0] : null;
    } catch (_) {
      return null;
    }
  }

  /**
   * Create a new AssetOwnership record.
   * @param {object} payload
   * @returns {Promise<object>} created ownership record
   */
  async createOwnership(payload) {
    return base44.entities.AssetOwnership.create(payload);
  }

  /**
   * Update an existing AssetOwnership record by its entity ID.
   * @param {string} ownershipId
   * @param {object} updates
   * @returns {Promise<object>} updated record
   */
  async updateOwnership(ownershipId, updates) {
    if (!ownershipId) throw new Error('ownershipId is required.');
    return base44.entities.AssetOwnership.update(ownershipId, updates);
  }

  /** Normalize a Wearable catalog record (used by getWearableById). */
  _normalizeWearableCatalog(raw) {
    if (!raw) return null;
    return {
      id:           raw.id,
      name:         raw.name         || raw.title     || 'Unnamed Wearable',
      slot:         raw.slot         || raw.wearable_slot || null,
      modelUrl:     raw.model_url    || raw.asset_url  || raw.glb_url || null,
      thumbnailUrl: raw.thumbnail_url || raw.image_url || raw.preview_url || null,
      rarity:       raw.rarity       || raw.rarity_tier || null,
      tags:         raw.tags         || [],
      raw,
    };
  }
}

export default DripSyncRepository;