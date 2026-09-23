/**
 * AnimationLibrary
 * ─────────────────────────────────────────────────────────────
 * Manages animation clip registry (locomotion + emotes).
 * Resolves clips by state name using gender-aware lookup.
 * Supports fallback blending if clip unavailable.
 */

class AnimationLibrary {
  /**
   * @param {{
   *   locomotionClips?: Map<string, THREE.AnimationClip>,
   *   emoteClips?:      Map<string, THREE.AnimationClip>,
   *   avatarGender?:    string ('masculine' or 'feminine'),
   * }}
   */
  constructor({ locomotionClips = new Map(), emoteClips = new Map(), avatarGender = 'masculine' } = {}) {
    this.locomotion = locomotionClips;
    this.emotes = emoteClips;
    this.avatarGender = avatarGender || 'masculine';
  }

  /**
   * Resolve locomotion clip by state name
   * Supports gender-aware lookup: idle_f, walk_m, etc.
   * Falls back to gender-agnostic name if gender variant not found
   * @param {string} state - 'idle', 'walk', 'run', 'jump', 'fall', 'landing'
   * @returns {THREE.AnimationClip | null}
   */
  resolveClip(state) {
    if (!state) return null;

    const stateName = state.toLowerCase();

    // Try gender-specific clip first
    const genderSuffix = this.avatarGender === 'feminine' ? '_f' : '_m';
    const genderKey = `${stateName}${genderSuffix}`;
    if (this.locomotion.has(genderKey)) {
      return this.locomotion.get(genderKey);
    }

    // Fall back to generic clip
    if (this.locomotion.has(stateName)) {
      return this.locomotion.get(stateName);
    }

    // Last resort: return null (animation controller handles graceful fallback)
    return null;
  }

  /**
   * Resolve emote clip by ID
   * @param {string} emoteId - e.g. 'wave', 'dance'
   * @returns {THREE.AnimationClip | null}
   */
  resolveEmote(emoteId) {
    if (!emoteId) return null;
    return this.emotes.get(emoteId) || null;
  }

  /**
   * Register a locomotion clip
   * @param {string} stateName - 'idle', 'walk', etc.
   * @param {THREE.AnimationClip} clip
   */
  registerLocomotion(stateName, clip) {
    if (stateName && clip) {
      this.locomotion.set(stateName.toLowerCase(), clip);
    }
  }

  /**
   * Register an emote clip
   * @param {string} emoteId
   * @param {THREE.AnimationClip} clip
   */
  registerEmote(emoteId, clip) {
    if (emoteId && clip) {
      this.emotes.set(emoteId.toLowerCase(), clip);
    }
  }

  /**
   * Get available locomotion states
   * @returns {string[]}
   */
  getAvailableStates() {
    return Array.from(this.locomotion.keys());
  }

  /**
   * Get available emotes
   * @returns {string[]}
   */
  getAvailableEmotes() {
    return Array.from(this.emotes.keys());
  }

  /**
   * Update avatar gender (invalidates cache)
   * @param {string} newGender - 'masculine' or 'feminine'
   */
  setAvatarGender(newGender) {
    this.avatarGender = newGender || 'masculine';
  }

  /**
   * Clear all clips (for unload)
   */
  clear() {
    this.locomotion.clear();
    this.emotes.clear();
  }

  /**
   * Get library state snapshot
   * @returns {object}
   */
  getState() {
    return {
      gender: this.avatarGender,
      locomotionCount: this.locomotion.size,
      emoteCount: this.emotes.size,
      states: this.getAvailableStates(),
      emotes: this.getAvailableEmotes(),
    };
  }
}

export default AnimationLibrary;