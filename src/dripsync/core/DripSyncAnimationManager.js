import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

/**
 * DripSyncAnimationManager
 * Centralized, production-ready animation system
 * Handles loading, blending, and playback for a single avatar mesh
 */
export class DripSyncAnimationManager {
  constructor(mesh, scene) {
    this.mesh = mesh;
    this.scene = scene;
    this.animations = {}; // { name -> AnimationClip }
    this.currentAnimation = null;
    this.mixer = null;
    this.currentAction = null;
    this.animationQueue = [];
    this.isTransitioning = false;
    this.blendDuration = 0.5; // seconds
    this.cache = new Map(); // URL cache
    this.loadingPromises = new Map(); // Prevent duplicate loads
    this.gltfLoader = new GLTFLoader();
    this.fbxLoader = new FBXLoader();
  }

  /**
   * Initialize mixer from mesh
   */
  initMixer() {
    if (!this.mesh) {
      console.warn('[AnimationManager] No mesh provided');
      return;
    }
    this.mixer = new THREE.AnimationMixer(this.mesh);
    // Extract animations from mesh if available
    if (this.mesh.animations && this.mesh.animations.length > 0) {
      this.mesh.animations.forEach(clip => {
        this.animations[clip.name.toLowerCase()] = clip;
      });
    }
  }

  /**
   * Load a single animation from URL or internal
   * Returns promise for async loading
   */
  async loadAnimation(name, urlOrClip, metadata = {}) {
    const key = `${name}-${urlOrClip}`;

    // Return cached promise if already loading
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    const promise = (async () => {
      try {
        // If it's already an AnimationClip, just store it
        if (urlOrClip instanceof THREE.AnimationClip) {
          this.animations[name] = urlOrClip;
          this.cache.set(key, urlOrClip);
          return urlOrClip;
        }

        // If it's a URL, load it
        if (typeof urlOrClip === 'string' && urlOrClip.includes('http')) {
          if (this.cache.has(key)) {
            return this.cache.get(key);
          }

          let clips = [];
          
          try {
            if (urlOrClip.toLowerCase().endsWith('.fbx')) {
              const fbx = await this.fbxLoader.loadAsync(urlOrClip);
              clips = fbx.animations || [];
            } else {
              const gltf = await this.gltfLoader.loadAsync(urlOrClip);
              clips = gltf.animations || [];
            }
          } catch (err) {
            throw new Error(`Failed to load animation from ${urlOrClip}: ${err.message}`);
          }

          if (clips.length > 0) {
            let clip = clips[0];
            // Retarget if necessary
            if (SkeletonUtils && this.mesh && this.mesh.skeleton) {
              try {
                if (urlOrClip.toLowerCase().endsWith('.fbx')) {
                  const fbx = await this.fbxLoader.loadAsync(urlOrClip);
                  clip = SkeletonUtils.retargetClip(this.mesh, fbx, clip);
                } else {
                  const gltf = await this.gltfLoader.loadAsync(urlOrClip);
                  clip = SkeletonUtils.retargetClip(this.mesh, gltf.scene, clip);
                }
              } catch (_) {
                // Use raw clip if retargeting fails
              }
            }
            
            this.animations[name] = clip;
            this.cache.set(key, clip);
            return clip;
          }

          throw new Error(`No animations found in ${urlOrClip}`);
        }

        console.warn(`[AnimationManager] Invalid animation source: ${urlOrClip}`);
        return null;
      } catch (error) {
        console.error(`[AnimationManager] Failed to load animation "${name}":`, error);
        return null;
      }
    })();

    this.loadingPromises.set(key, promise);
    return promise;
  }

  /**
   * Preload core animations
   */
  async preloadBaseAnimations() {
    if (!this.mixer) {
      this.initMixer();
    }

    const baseAnimations = ['idle', 'walk', 'run'];
    const promises = baseAnimations.map(anim => {
      // Only load if not already available
      if (!this.animations[anim]) {
        return this.loadAnimation(anim, anim);
      }
      return Promise.resolve();
    });

    await Promise.all(promises);
  }

  /**
   * Play animation by name with blending
   */
  playAnimation(name, options = {}) {
    const {
      loop = THREE.LoopRepeat,
      clampWhenFinished = false,
      crossFadeDuration = this.blendDuration,
      speed = 1.0,
    } = options;

    if (!this.mixer) {
      this.initMixer();
    }

    const clip = this.animations[name.toLowerCase()];
    if (!clip) {
      console.warn(`[AnimationManager] Animation not found: ${name}`);
      // Fallback to idle
      if (name !== 'idle' && this.animations['idle']) {
        return this.playAnimation('idle', options);
      }
      return null;
    }

    // Prevent duplicate playback
    if (this.currentAnimation === name && this.currentAction) {
      return this.currentAction;
    }

    this.isTransitioning = true;

    // Fade out current animation
    if (this.currentAction) {
      this.currentAction.fadeOut(crossFadeDuration);
    }

    // Create new action
    const newAction = this.mixer.clipAction(clip);
    newAction.loop = loop;
    newAction.clampWhenFinished = clampWhenFinished;
    newAction.timeScale = speed;
    newAction.fadeIn(crossFadeDuration);
    newAction.play();

    this.currentAnimation = name;
    this.currentAction = newAction;

    // Reset transition flag after blend
    setTimeout(() => {
      this.isTransitioning = false;
    }, crossFadeDuration * 1000);

    return newAction;
  }

  /**
   * Stop current animation
   */
  stopCurrent() {
    if (this.currentAction) {
      this.currentAction.stop();
      this.currentAction = null;
      this.currentAnimation = null;
    }
  }

  /**
   * Update mixer (call in render loop)
   */
  update(deltaTime) {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  /**
   * Get animation duration
   */
  getAnimationDuration(name) {
    const clip = this.animations[name.toLowerCase()];
    return clip ? clip.duration : 0;
  }

  /**
   * Check if animation exists
   */
  hasAnimation(name) {
    return Boolean(this.animations[name.toLowerCase()]);
  }

  /**
   * Get all available animations
   */
  getAvailableAnimations() {
    return Object.keys(this.animations);
  }

  /**
   * Clear all animations and dispose
   */
  dispose() {
    this.stopCurrent();
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.mesh);
    }
    this.animations = {};
    this.cache.clear();
    this.loadingPromises.clear();
  }
}

/**
 * Global Animation State
 * Centralized state for all animation decisions
 */
export const AnimationState = {
  current: 'idle',
  isMoving: false,
  isRunning: false,
  isJumping: false,
  isEmoting: false,
  activeEmote: null,
  speed: 1.0,
};

/**
 * Update animation state based on priority
 * Priority: jump > run > walk > emote > idle
 */
export function updateAnimationState(state) {
  Object.assign(AnimationState, state);
}

/**
 * Determine which animation should play based on current state
 */
export function getNextAnimation() {
  if (AnimationState.isJumping) return 'jump';
  if (AnimationState.isRunning) return 'run';
  if (AnimationState.isMoving) return 'walk';
  if (AnimationState.isEmoting && AnimationState.activeEmote) {
    return AnimationState.activeEmote;
  }
  return 'idle';
}