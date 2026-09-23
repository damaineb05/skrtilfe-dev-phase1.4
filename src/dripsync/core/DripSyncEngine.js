/**
 * DripSyncEngine
 * ─────────────────────────────────────────────────────────────
 * Top-level orchestrator for a DripSync DATA session.
 *
 * Scope: repository (data), store (state), event bus, scene/realm runtime,
 * closet/loadout hydration, wearable equip/unequip, outfit presets, and
 * purchase entitlement grants.
 *
 * NOT in scope (removed — the viewport is the authoritative movement/avatar
 * runtime): InputController, CameraController, MovementController,
 * AvatarRuntime, WearableBinder, AnimationLibrary/Controller, EmoteController.
 * There is exactly one avatar, one normalized input layer (ViewportInput), one
 * movement controller (ViewportControls.updateMovement), and one transform
 * owner (the viewport's modelRef) across desktop and mobile.
 *
 * Usage:
 *   const engine = new DripSyncEngine({ repository, store, onEvent });
 *   await engine.boot(userEmail);
 *   await engine.equipWearable({ wearableId });
 *   await engine.unequipSlot('top');
 */

import { DripSyncEvents }                                  from './DripSyncEvents.js';
import SceneRuntime                                        from '../scene/SceneRuntime.js';
import { hydrateUserCloset }                               from '../closet/ClosetService.js';
import { hydrateAvatarLoadout, equipWearableToAvatar,
         unequipSlotFromAvatar }                           from '../outfit/LoadoutService.js';
import { saveOutfitPreset, applyOutfitPreset }             from '../outfit/OutfitManager.js';
import { grantPurchaseEntitlements, refreshClosetAfterGrant } from '../commerce/EntitlementManager.js';

class DripSyncEngine {
  /**
   * @param {{
   *   repository: import('../backend/DripSyncRepository').default,
   *   store:      import('./DripSyncStore').default,
   *   onEvent?:   (eventName: string, payload?: any) => void
   * }} options
   */
  constructor({ repository, store, onEvent = null }) {
    if (!repository) throw new Error('DripSyncEngine: repository is required');
    if (!store)      throw new Error('DripSyncEngine: store is required');

    this._repo      = repository;
    this._store     = store;
    this._onEvent   = onEvent;
    this._destroyed = false;

    // Scene runtime (realm loading) — the only runtime this engine owns.
    this._sceneRuntime = null;
  }

  // ── Public API ───────────────────────────────────────────────

  /**
   * Boot a full DripSync session for the given user.
   * @param {string} userId — user email
   */
  async boot(userId) {
    this._assertAlive();

    this._emit(DripSyncEvents.BOOT_STARTED, { userId });
    this._store.setState({ session: { userId, status: 'booting', error: null } });

    try {
      const avatar = await this._loadAvatar(userId);
      await this._hydrateCloset(userId);

      if (avatar?.id) {
        await this._hydrateLoadout(avatar.id);
      }

      this._store.setState({ session: { status: 'ready' } });
      this._emit(DripSyncEvents.BOOT_COMPLETED, { userId, avatar });

    } catch (err) {
      const message = err?.message || 'Unknown boot error';
      this._store.setState({ session: { status: 'error', error: message } });
      this._emit(DripSyncEvents.BOOT_FAILED, { userId, error: message });
      this._emit(DripSyncEvents.ERROR,       { source: 'boot', error: message });
      throw err;
    }
  }

  /**
   * Load (or reload) a specific avatar by ID into the store.
   * @param {string} avatarId
   */
  async loadAvatar(avatarId) {
    this._assertAlive();
    const avatar = await this._repo.getActiveAvatar(avatarId);
    this._applyAvatarToStore(avatar);
    this._emit(DripSyncEvents.AVATAR_LOADED, { avatar });
    return avatar;
  }

  /**
   * Attach scene runtime to the engine using an existing Three.js scene.
   * Creates a SceneRuntime instance ready for realm loading.
   * @param {THREE.Scene} sceneContext
   */
  attachSceneRuntime(sceneContext) {
    this._assertAlive();

    if (this._sceneRuntime) {
      this._sceneRuntime.destroy();
      this._sceneRuntime = null;
    }

    this._sceneRuntime = new SceneRuntime({
      scene:      sceneContext,
      repository: this._repo,
    });

    this._emit(DripSyncEvents.SCENE_RUNTIME_ATTACHED, { hasScene: !!sceneContext });
  }

  /**
   * Load a realm by its entity ID. Requires scene runtime to be attached.
   * @param {string} realmId
   * @returns {Promise<object>} normalized worldModel
   */
  async loadRealm(realmId) {
    this._assertAlive();

    this._store.setState({
      scene: { activeRealmId: realmId, ready: false, error: null },
    });
    this._emit(DripSyncEvents.REALM_LOAD_STARTED, { realmId });

    if (!this._sceneRuntime) {
      const msg = 'SceneRuntime not attached. Call attachSceneRuntime() first.';
      this._store.setState({ scene: { error: msg } });
      this._emit(DripSyncEvents.REALM_LOAD_FAILED, { realmId, error: msg });
      throw new Error(`DripSyncEngine.loadRealm: ${msg}`);
    }

    try {
      const worldModel = await this._sceneRuntime.loadRealm(realmId);

      this._store.setState({
        scene: {
          activeRealmId:  worldModel.realmId,
          environmentId:  worldModel.environmentId,
          environmentUrl: worldModel.environmentUrl,
          objects:        worldModel.objects,
          collisions:     worldModel.collisions,
          spawnPoints:    worldModel.spawnPoints,
          lighting:       worldModel.lighting,
          ready:          true,
          error:          null,
        },
      });

      this._emit(DripSyncEvents.REALM_LOADED, {
        realmId,
        objectCount:    worldModel.objects.length,
        collisionCount: worldModel.collisions.length,
      });
      this._emit(DripSyncEvents.SCENE_OBJECTS_UPDATED, { objects: worldModel.objects });

      return worldModel;
    } catch (err) {
      const message = err?.message || String(err);
      this._store.setState({ scene: { ready: false, error: message } });
      this._emit(DripSyncEvents.REALM_LOAD_FAILED, { realmId, error: message });
      throw err;
    }
  }

  /** Return the current normalized world model from the scene runtime. */
  getWorldModel() {
    return this._sceneRuntime?.getWorldModel() || null;
  }

  /** Returns the serializable avatar config slice from the store. */
  getAvatarConfig() {
    return this._store.getState().avatar || {};
  }

  /** @returns {import('./DripSyncStore').DripSyncState} */
  getState() {
    return this._store.getState();
  }

  /** Subscribe to state changes. @returns {() => void} unsubscribe */
  subscribe(listener) {
    return this._store.subscribe(listener);
  }

  // ── Commerce / Entitlements ──────────────────────────────

  /**
   * Grant wearable ownership from a completed purchase order, then refresh closet.
   * @param {string} orderId
   * @returns {Promise<{ success: boolean, granted: object[], warnings: object[], errors: object[] }>}
   */
  async grantPurchaseEntitlements(orderId) {
    this._assertAlive();

    const { userId } = this._store.getState().session;
    if (!userId) {
      const msg = 'No active session to grant entitlements to.';
      this._emit(DripSyncEvents.ENTITLEMENT_GRANT_FAILED, { orderId, error: msg });
      return { success: false, granted: [], warnings: [], errors: [{ message: msg }] };
    }

    this._emit(DripSyncEvents.ENTITLEMENT_GRANT_STARTED, { orderId, userId });

    try {
      const result = await grantPurchaseEntitlements({
        repository: this._repo,
        userId,
        orderId,
      });

      if (result.success && result.granted.length > 0) {
        this._store.setState({
          commerce: {
            lastOrderGranted: orderId,
            lastGrantedAt:    new Date().toISOString(),
          },
          closet: {
            lastGrantResult: { granted: result.granted, warnings: result.warnings },
          },
        });

        if (result.skipped.length > 0 || result.warnings.length > 0) {
          this._emit(DripSyncEvents.ENTITLEMENT_GRANT_PARTIAL, {
            orderId,
            granted:  result.granted.length,
            skipped:  result.skipped.length,
            warnings: result.warnings,
          });
        } else {
          this._emit(DripSyncEvents.ENTITLEMENT_GRANTED, {
            orderId,
            grantedItems: result.granted,
          });
        }
      } else if (!result.success) {
        this._emit(DripSyncEvents.ENTITLEMENT_GRANT_FAILED, {
          orderId,
          errors: result.errors,
        });
        return result;
      }

      await refreshClosetAfterGrant({ engine: this, userId });
      this._emit(DripSyncEvents.CLOSET_REFRESHED, { source: 'purchase_grant' });

      return result;
    } catch (err) {
      const message = err?.message || String(err);
      this._emit(DripSyncEvents.ENTITLEMENT_GRANT_FAILED, { orderId, error: message });
      return {
        success:  false,
        granted:  [],
        warnings: [],
        errors:   [{ message }],
      };
    }
  }

  /** Manually refresh the user's closet. */
  async refreshCloset() {
    this._assertAlive();
    const { userId } = this._store.getState().session;
    if (!userId) return;

    await this._hydrateCloset(userId);
    this._store.setState({ closet: { lastRefreshedAt: new Date().toISOString() } });
    this._emit(DripSyncEvents.CLOSET_REFRESHED, { source: 'manual' });
  }

  // ── Preset API ────────────────────────────────────────────────

  /**
   * Save the current loadout as a named outfit preset.
   * @param {string} name
   * @returns {Promise<{ ok: boolean, preset?: object, message?: string }>}
   */
  async saveOutfitPreset(name) {
    this._assertAlive();
    const { avatar, loadout, session } = this._store.getState();
    const avatarId = avatar?.activeAvatarId;
    const userId   = session?.userId;

    if (!avatarId) {
      return { ok: false, message: 'No active avatar to save a preset for.' };
    }

    const result = await saveOutfitPreset({
      repository:     this._repo,
      avatarId,
      userId,
      name,
      currentLoadout: loadout?.equippedBySlot || {},
    });

    if (result.ok) {
      this._emit(DripSyncEvents.OUTFIT_SAVED, { preset: result.preset, name });
    }

    return result;
  }

  /**
   * Apply a saved outfit preset by its ID. Validates, applies, rolls back on failure.
   * @param {string} presetId
   * @returns {Promise<object>} apply result
   */
  async applyOutfitPreset(presetId) {
    this._assertAlive();
    const { avatar, loadout, closet, session } = this._store.getState();
    const avatarId = avatar?.activeAvatarId;
    const userId   = session?.userId;

    if (!avatarId) {
      this._emit(DripSyncEvents.OUTFIT_APPLY_FAILED, { presetId, reason: 'NO_AVATAR' });
      return { success: false, message: 'No active avatar.' };
    }

    const presetRecord = await this._repo.getOutfitPresetById(presetId);
    if (!presetRecord) {
      this._emit(DripSyncEvents.OUTFIT_APPLY_FAILED, { presetId, reason: 'PRESET_NOT_FOUND' });
      return { success: false, message: 'Preset not found.' };
    }

    const ownerships = (closet?.items || []).map(i => i.ownership).filter(Boolean);

    const result = await applyOutfitPreset({
      repository:     this._repo,
      avatarId,
      userId,
      presetRecord,
      currentLoadout: loadout?.equippedBySlot || {},
      ownerships,
    });

    if (result.success) {
      this._store.setState({ loadout: { equippedBySlot: result.equippedBySlot, dirty: false } });
      this._emit(DripSyncEvents.OUTFIT_APPLIED,    { presetId, equippedBySlot: result.equippedBySlot });
      this._emit(DripSyncEvents.LOADOUT_UPDATED,   { equippedBySlot: result.equippedBySlot });
    } else {
      this._store.setState({ loadout: { equippedBySlot: result.equippedBySlot, dirty: false } });

      if (result.restored_previous_state) {
        this._emit(DripSyncEvents.OUTFIT_ROLLBACK_COMPLETED, { presetId, restoredSlots: result.equippedBySlot });
      } else {
        this._emit(DripSyncEvents.OUTFIT_ROLLBACK_FAILED,    { presetId });
      }

      this._emit(DripSyncEvents.OUTFIT_APPLY_FAILED, {
        presetId,
        applied:  result.applied,
        failed:   result.failed,
        message:  result.message,
        restored: result.restored_previous_state,
      });
    }

    return result;
  }

  // ── Wearable equip / unequip ───────────────────────────────────

  /**
   * Equip a wearable to the current avatar.
   * @param {{ wearableId: string }}
   * @returns {Promise<{ ok: boolean, reason?: string, message?: string }>}
   */
  async equipWearable({ wearableId }) {
    this._assertAlive();

    const { avatar, closet, loadout } = this._store.getState();
    const avatarId = avatar?.activeAvatarId;
    const userId   = this._store.getState().session?.userId;

    if (!avatarId) {
      const msg = 'No active avatar to equip wearable on.';
      this._emit(DripSyncEvents.EQUIP_FAILED, { wearableId, reason: 'NO_AVATAR', message: msg });
      return { ok: false, reason: 'NO_AVATAR', message: msg };
    }

    const result = await equipWearableToAvatar({
      repository:     this._repo,
      userId,
      avatarId,
      wearableId,
      ownerships:     closet.items.map(i => i.ownership).filter(Boolean),
      currentLoadout: loadout.equippedBySlot,
    });

    if (result.ok) {
      this._store.setState({ loadout: { equippedBySlot: result.equippedBySlot, dirty: false } });
      this._emit(DripSyncEvents.WEARABLE_EQUIPPED, { wearableId, equippedBySlot: result.equippedBySlot });
      this._emit(DripSyncEvents.LOADOUT_UPDATED,   { equippedBySlot: result.equippedBySlot });
    } else {
      this._emit(DripSyncEvents.EQUIP_FAILED, { wearableId, reason: result.reason, message: result.message });
    }

    return { ok: result.ok, reason: result.reason, message: result.message };
  }

  /**
   * Unequip a slot from the current avatar.
   * @param {string} slot
   * @returns {Promise<{ ok: boolean, reason?: string, message?: string }>}
   */
  async unequipSlot(slot) {
    this._assertAlive();

    const { avatar, loadout } = this._store.getState();
    const avatarId = avatar?.activeAvatarId;
    const userId   = this._store.getState().session?.userId;

    if (!avatarId) {
      const msg = 'No active avatar.';
      this._emit(DripSyncEvents.UNEQUIP_FAILED, { slot, reason: 'NO_AVATAR', message: msg });
      return { ok: false, reason: 'NO_AVATAR', message: msg };
    }

    const result = await unequipSlotFromAvatar({
      repository:     this._repo,
      userId,
      avatarId,
      slot,
      currentLoadout: loadout.equippedBySlot,
    });

    if (result.ok) {
      this._store.setState({ loadout: { equippedBySlot: result.equippedBySlot, dirty: false } });
      this._emit(DripSyncEvents.WEARABLE_UNEQUIPPED, { slot, equippedBySlot: result.equippedBySlot });
      this._emit(DripSyncEvents.LOADOUT_UPDATED,   { equippedBySlot: result.equippedBySlot });
    } else {
      this._emit(DripSyncEvents.UNEQUIP_FAILED, { slot, reason: result.reason, message: result.message });
    }

    return { ok: result.ok, reason: result.reason, message: result.message };
  }

  /** Re-hydrate the closet for a user. */
  async hydrateCloset(userId) {
    this._assertAlive();
    return this._hydrateCloset(userId);
  }

  /** Re-hydrate the loadout for an avatar. */
  async hydrateLoadout(avatarId) {
    this._assertAlive();
    return this._hydrateLoadout(avatarId);
  }

  /** Tear down the engine and scene runtime cleanly. */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._sceneRuntime?.destroy();
    this._sceneRuntime = null;
    this._store.reset();
  }

  // ── Private helpers ──────────────────────────────────────────

  async _loadAvatar(userId) {
    const avatar = await this._repo.getActiveAvatar(userId);
    this._applyAvatarToStore(avatar);
    this._emit(DripSyncEvents.AVATAR_LOADED, { avatar });
    return avatar;
  }

  async _hydrateCloset(userId) {
    this._store.setState({ closet: { loading: true } });

    const { loadout } = this._store.getState();
    const result = await hydrateUserCloset({
      repository:     this._repo,
      userId,
      equippedBySlot: loadout?.equippedBySlot || {},
    });

    this._store.setState({
      closet: {
        items:      result.items,
        totalOwned: result.totalOwned,
        skipped:    result.skipped,
        empty:      result.empty,
        loading:    false,
      },
    });

    this._emit(DripSyncEvents.CLOSET_LOADED, {
      count:   result.totalOwned,
      skipped: result.skipped,
      empty:   result.empty,
    });
    return result;
  }

  async _hydrateLoadout(avatarId) {
    const equippedBySlot = await hydrateAvatarLoadout({ repository: this._repo, avatarId });

    this._store.setState({
      loadout: {
        equippedBySlot,
        dirty: false,
      },
    });

    this._emit(DripSyncEvents.LOADOUT_LOADED, {
      avatarId,
      slotCount: Object.keys(equippedBySlot).length,
    });

    return equippedBySlot;
  }

  _applyAvatarToStore(avatar) {
    this._store.setState({
      avatar: {
        activeAvatarId: avatar?.id          || null,
        profile:        avatar              || null,
        modelUrl:       avatar?.modelUrl    || null,
        appearance:     avatar?.appearance  || null,
        runtimeReady:   false,
        runtimeStatus:  'idle',
        runtimeError:   null,
      },
    });
  }

  _emit(eventName, payload = {}) {
    this._emit_internal(eventName, payload);
    if (eventName !== DripSyncEvents.STATE_CHANGED) {
      this._emit_internal(DripSyncEvents.STATE_CHANGED, { triggeredBy: eventName });
    }
  }

  _emit_internal(eventName, payload) {
    if (this._onEvent) {
      try { this._onEvent(eventName, payload); } catch (_) { /* never crash engine */ }
    }
  }

  _assertAlive() {
    if (this._destroyed) {
      throw new Error('DripSyncEngine: cannot use a destroyed engine instance.');
    }
  }
}

export default DripSyncEngine;