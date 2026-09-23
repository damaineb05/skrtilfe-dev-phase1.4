import { updateAnimationState } from './DripSyncAnimationManager';

/**
 * MobileAnimationWheelController
 * Backend logic for mobile animation picker wheel
 * Handles category filtering, selection, and lazy loading
 * Updates AnimationState — does NOT directly play animations
 */
export class MobileAnimationWheelController {
  constructor(animationLibrary = [], options = {}) {
    this.library = animationLibrary;
    this.categories = this.extractCategories();
    
    // Wheel state
    this.currentCategory = options.defaultCategory || 'idle';
    this.selectedIndex = 0;
    this.activeAvatarManager = null;
    
    // Cache
    this.loadedAnimations = new Map();
    this.loadingPromises = new Map();
    
    // Settings
    this.debounceMs = 100;
    this.lastSwipeTime = 0;
    
    // Debug
    this.debug = options.debug || false;
  }

  /**
   * Extract unique categories from library
   */
  extractCategories() {
    const cats = new Set();
    this.library.forEach(anim => {
      if (anim.category) cats.add(anim.category);
    });
    return Array.from(cats).sort();
  }

  /**
   * Get animations by category
   */
  getAnimationsByCategory(category) {
    return this.library.filter(a => a.category === category);
  }

  /**
   * Set active avatar manager for loading
   */
  setActiveAvatarManager(manager) {
    this.activeAvatarManager = manager;
  }

  /**
   * Set current category and reset selected index
   */
  setCategory(category) {
    if (this.categories.includes(category)) {
      this.currentCategory = category;
      this.selectedIndex = 0;
      
      if (this.debug) {
        console.log(`[AnimationWheel] Category set to: ${category}`);
      }
      
      return this.getAnimationsByCategory(category);
    }
    return [];
  }

  /**
   * Get current category's animations
   */
  getCurrentAnimations() {
    return this.getAnimationsByCategory(this.currentCategory);
  }

  /**
   * Get selected animation
   */
  getSelectedAnimation() {
    const anims = this.getCurrentAnimations();
    if (anims.length === 0) return null;
    return anims[this.selectedIndex % anims.length];
  }

  /**
   * Next animation (swipe up or button)
   */
  nextAnimation() {
    const now = Date.now();
    if (now - this.lastSwipeTime < this.debounceMs) return;
    this.lastSwipeTime = now;

    const anims = this.getCurrentAnimations();
    if (anims.length > 0) {
      this.selectedIndex = (this.selectedIndex + 1) % anims.length;
    }

    if (this.debug) {
      console.log(`[AnimationWheel] Next animation: index=${this.selectedIndex}`);
    }

    return this.getSelectedAnimation();
  }

  /**
   * Previous animation (swipe down or button)
   */
  previousAnimation() {
    const now = Date.now();
    if (now - this.lastSwipeTime < this.debounceMs) return;
    this.lastSwipeTime = now;

    const anims = this.getCurrentAnimations();
    if (anims.length > 0) {
      this.selectedIndex = (this.selectedIndex - 1 + anims.length) % anims.length;
    }

    if (this.debug) {
      console.log(`[AnimationWheel] Previous animation: index=${this.selectedIndex}`);
    }

    return this.getSelectedAnimation();
  }

  /**
   * Select animation by id and trigger state update
   * This is the main entry point for wheel selection
   */
  async selectAnimation(animationId) {
    const anim = this.library.find(a => a.id === animationId);
    if (!anim) {
      console.warn(`[AnimationWheel] Animation not found: ${animationId}`);
      return;
    }

    if (this.debug) {
      console.log(`[AnimationWheel] Selected animation: ${anim.name} (${anim.id})`);
    }

    // Load animation if needed
    if (this.activeAvatarManager && anim.url && !this.loadedAnimations.has(anim.id)) {
      await this.loadAnimation(anim);
    }

    // Update animation state (triggers AnimationManager to play)
    updateAnimationState({
      isEmoting: true,
      activeEmote: anim.id,
    });
  }

  /**
   * Load animation from URL
   * Handles lazy loading with caching
   */
  async loadAnimation(animation) {
    const { id, url, name } = animation;

    // Return cached promise if already loading
    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id);
    }

    // Already loaded
    if (this.loadedAnimations.has(id)) {
      return Promise.resolve(this.loadedAnimations.get(id));
    }

    if (!this.activeAvatarManager) {
      console.warn('[AnimationWheel] No active avatar manager for loading');
      return;
    }

    // Load via animation manager
    const promise = (async () => {
      try {
        if (this.debug) {
          console.log(`[AnimationWheel] Loading animation: ${name} from ${url}`);
        }

        await this.activeAvatarManager.loadAnimation(id, url, { isEmote: true });
        this.loadedAnimations.set(id, true);

        if (this.debug) {
          console.log(`[AnimationWheel] Animation loaded: ${name}`);
        }

        return true;
      } catch (error) {
        console.error(`[AnimationWheel] Failed to load ${name}:`, error);
        
        // Fallback to idle on error
        updateAnimationState({
          isEmoting: false,
          activeEmote: 'idle',
        });
        
        return false;
      }
    })();

    this.loadingPromises.set(id, promise);
    return promise;
  }

  /**
   * Swipe handler for mobile wheel
   * deltaY > 0 = swipe down (previous)
   * deltaY < 0 = swipe up (next)
   */
  onSwipe(deltaY) {
    if (deltaY > 0) {
      this.previousAnimation();
    } else {
      this.nextAnimation();
    }
  }

  /**
   * Tap handler — select current animation
   */
  onTap() {
    const selected = this.getSelectedAnimation();
    if (selected) {
      this.selectAnimation(selected.id);
    }
  }

  /**
   * Get all animations for current category as wheel data
   */
  getWheelData() {
    const anims = this.getCurrentAnimations();
    return {
      category: this.currentCategory,
      items: anims,
      selectedIndex: this.selectedIndex,
      selected: this.getSelectedAnimation(),
    };
  }

  /**
   * Preload movement animations (called on avatar load)
   */
  async preloadMovementAnimations() {
    if (!this.activeAvatarManager) return;

    const movements = ['idle', 'walk', 'run'];
    const toLoad = this.library.filter(
      a => movements.includes(a.category) && a.url && !this.loadedAnimations.has(a.id)
    );

    if (this.debug) {
      console.log(`[AnimationWheel] Preloading ${toLoad.length} movement animations`);
    }

    for (const anim of toLoad) {
      await this.loadAnimation(anim);
    }
  }

  /**
   * Clear loaded animations cache
   */
  clearCache() {
    this.loadedAnimations.clear();
    this.loadingPromises.clear();
  }

  /**
   * Dispose
   */
  dispose() {
    this.clearCache();
    this.activeAvatarManager = null;
    if (this.debug) {
      console.log('[AnimationWheel] Disposed');
    }
  }
}

/**
 * Convert animation library to wheel-friendly structure
 */
export function normalizeAnimationLibrary(animations) {
  return animations.map(anim => ({
    id: anim.id || anim.name || `anim_${Math.random()}`,
    name: anim.name || 'Untitled',
    category: anim.category || 'emote',
    url: anim.url || anim.sourceUrl,
    gender: anim.gender || 'neutral',
    lazyLoad: anim.lazyLoad !== false, // default true
  }));
}