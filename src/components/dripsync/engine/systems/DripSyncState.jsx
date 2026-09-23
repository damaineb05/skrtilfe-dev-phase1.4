/**
 * DripSyncState — Global state store
 *
 * Single source of truth for:
 *  - activeAvatar: currently loaded avatar model reference
 *  - equippedWearables: map of equipped wearables by id
 *  - currentScene: active Three.js scene reference
 *
 * Usage:
 *  import { DripSyncState } from '@/components/dripsync/engine/systems/DripSyncState';
 *  DripSyncState.setActiveAvatar(model);
 *  DripSyncState.addWearable(id, wearableObject);
 *  DripSyncState.removeWearable(id);
 */

const DripSyncState = {
  activeAvatar: null,
  equippedWearables: {},
  currentScene: null,

  // ── Avatar ─────────────────────────────────────────────────────────────
  setActiveAvatar(avatar) {
    this.activeAvatar = avatar;
    console.log('[DripSyncState] Avatar set:', avatar?.userData?.source || 'null');
  },

  getActiveAvatar() {
    return this.activeAvatar;
  },

  clearActiveAvatar() {
    this.activeAvatar = null;
    console.log('[DripSyncState] Avatar cleared');
  },

  // ── Wearables ──────────────────────────────────────────────────────────
  addWearable(id, wearable) {
    this.equippedWearables[id] = wearable;
    console.log('[DripSyncState] Wearable added:', id);
  },

  removeWearable(id) {
    delete this.equippedWearables[id];
    console.log('[DripSyncState] Wearable removed:', id);
  },

  getWearable(id) {
    return this.equippedWearables[id];
  },

  hasWearable(id) {
    return id in this.equippedWearables;
  },

  getAllWearables() {
    return this.equippedWearables;
  },

  clearWearables() {
    this.equippedWearables = {};
    console.log('[DripSyncState] All wearables cleared');
  },

  // ── Scene ──────────────────────────────────────────────────────────────
  setCurrentScene(scene) {
    this.currentScene = scene;
    console.log('[DripSyncState] Scene set');
  },

  getCurrentScene() {
    return this.currentScene;
  },

  clearCurrentScene() {
    this.currentScene = null;
    console.log('[DripSyncState] Scene cleared');
  },

  // ── Full reset ─────────────────────────────────────────────────────────
  reset() {
    this.activeAvatar = null;
    this.equippedWearables = {};
    this.currentScene = null;
    console.log('[DripSyncState] Full reset');
  },
};

export default DripSyncState;