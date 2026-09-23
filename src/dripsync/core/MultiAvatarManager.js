import { DripSyncAnimationManager, AnimationState } from './DripSyncAnimationManager';

/**
 * MultiAvatarManager
 * Manages multiple avatars in a scene
 * Ensures only active avatar responds to input
 */
export class MultiAvatarManager {
  constructor(scene) {
    this.scene = scene;
    this.avatars = new Map(); // id -> { mesh, manager, active }
    this.activeAvatarId = null;
  }

  /**
   * Register a new avatar
   */
  registerAvatar(id, mesh) {
    if (this.avatars.has(id)) {
      console.warn(`[MultiAvatarManager] Avatar ${id} already registered`);
      return null;
    }

    const manager = new DripSyncAnimationManager(mesh, this.scene);
    manager.initMixer();

    this.avatars.set(id, {
      id,
      mesh,
      manager,
      active: false,
    });

    // Set first avatar as active
    if (!this.activeAvatarId) {
      this.setActiveAvatar(id);
    }

    return manager;
  }

  /**
   * Unregister avatar
   */
  unregisterAvatar(id) {
    const avatar = this.avatars.get(id);
    if (avatar) {
      avatar.manager.dispose();
      this.avatars.delete(id);

      if (this.activeAvatarId === id) {
        const nextId = this.avatars.keys().next().value;
        this.setActiveAvatar(nextId);
      }
    }
  }

  /**
   * Set which avatar is active (receives input)
   */
  setActiveAvatar(id) {
    // Deactivate current
    if (this.activeAvatarId) {
      const prev = this.avatars.get(this.activeAvatarId);
      if (prev) prev.active = false;
    }

    // Activate new
    const avatar = this.avatars.get(id);
    if (avatar) {
      avatar.active = true;
      this.activeAvatarId = id;
      return avatar.manager;
    }

    console.warn(`[MultiAvatarManager] Avatar ${id} not found`);
    return null;
  }

  /**
   * Get active avatar manager
   */
  getActiveManager() {
    const avatar = this.avatars.get(this.activeAvatarId);
    return avatar?.manager || null;
  }

  /**
   * Get specific avatar manager
   */
  getAvatar(id) {
    const avatar = this.avatars.get(id);
    return avatar?.manager || null;
  }

  /**
   * Play animation on active avatar
   */
  playAnimation(name, options = {}) {
    const manager = this.getActiveManager();
    if (manager) {
      return manager.playAnimation(name, options);
    }
  }

  /**
   * Update all avatars
   */
  updateAll(deltaTime) {
    this.avatars.forEach(avatar => {
      if (avatar.manager) {
        avatar.manager.update(deltaTime);
      }
    });
  }

  /**
   * Dispose all avatars
   */
  dispose() {
    this.avatars.forEach(avatar => {
      avatar.manager.dispose();
    });
    this.avatars.clear();
    this.activeAvatarId = null;
  }
}