/**
 * animationResolver — Gender-based animation set routing
 * Maps avatar gender to animation clip URLs
 * Provides safe fallback to masculine set if feminine clip missing
 */

// Animation set mappings — extensible for future avatar types
const ANIMATION_SETS = {
  masculine: {
    idle: 'https://raw.githubusercontent.com/readyplayerme/animation-library/master/masculine/glb/locomotion/F_Falling_Idle_000.glb',
    walk: 'https://raw.githubusercontent.com/readyplayerme/animation-library/master/masculine/glb/locomotion/F_Jog_001.glb',
    run: 'https://raw.githubusercontent.com/readyplayerme/animation-library/master/masculine/glb/locomotion/F_Run_001.glb',
    backward: 'https://raw.githubusercontent.com/readyplayerme/animation-library/master/masculine/glb/locomotion/F_Jog_Backwards_001.glb',
    strafeLeft: 'https://raw.githubusercontent.com/readyplayerme/animation-library/master/masculine/glb/locomotion/F_Jog_Strafe_Left_002.glb',
    strafeRight: 'https://raw.githubusercontent.com/readyplayerme/animation-library/master/masculine/glb/locomotion/F_Jog_Strafe_Right_002.glb',
    jump: 'https://raw.githubusercontent.com/readyplayerme/animation-library/master/masculine/glb/locomotion/F_Jog_Jump_Small_001.glb',
  },
  feminine: {
    idle: 'https://raw.githubusercontent.com/readyplayerme/animation-library/master/feminine/glb/locomotion/F_Falling_Idle_000.glb',
    walk: 'https://raw.githubusercontent.com/readyplayerme/animation-library/master/feminine/glb/locomotion/F_Walk_001.glb',
    run: 'https://raw.githubusercontent.com/readyplayerme/animation-library/master/feminine/glb/locomotion/F_Run_001.glb',
    backward: 'https://raw.githubusercontent.com/readyplayerme/animation-library/master/feminine/glb/locomotion/F_Walk_Backwards_001.glb',
    strafeLeft: 'https://raw.githubusercontent.com/readyplayerme/animation-library/master/feminine/glb/locomotion/F_Walk_Strafe_Left_001.glb',
    strafeRight: 'https://raw.githubusercontent.com/readyplayerme/animation-library/master/feminine/glb/locomotion/F_Walk_Strafe_Right_001.glb',
    jump: 'https://raw.githubusercontent.com/readyplayerme/animation-library/master/feminine/glb/locomotion/F_Jump_001.glb',
  },
};

/**
 * Normalize gender to safe value
 * @param {string|null|undefined} gender
 * @returns {'masculine' | 'feminine' | 'masculine'}
 */
export function normalizeGender(gender) {
  const normalized = String(gender || '').toLowerCase().trim();
  if (normalized === 'feminine' || normalized === 'female' || normalized === 'f') return 'feminine';
  if (normalized === 'masculine' || normalized === 'male' || normalized === 'm') return 'masculine';
  return 'masculine'; // default
}

/**
 * Get animation set for avatar gender
 * @param {string|null} gender — 'male', 'female', 'masculine', 'feminine', or unspecified
 * @returns {object} animation set for the normalized gender
 */
export function getAnimationSetForGender(gender) {
  const normalized = normalizeGender(gender);
  return ANIMATION_SETS[normalized] || ANIMATION_SETS.masculine;
}

/**
 * Get a specific animation clip URL by gender and state
 * Falls back to masculine if feminine clip missing or fails
 * @param {string|null} gender
 * @param {string} state — 'idle', 'walk', 'run', 'jump', 'backward', 'strafeLeft', 'strafeRight'
 * @returns {string|null} animation URL or null if not found
 */
export function getAnimationClip(gender, state) {
  const normalized = normalizeGender(gender);
  const set = ANIMATION_SETS[normalized];
  
  if (!set) return ANIMATION_SETS.masculine[state] || null;
  
  // Return clip if exists
  if (set[state]) return set[state];
  
  // Fallback to masculine if clip missing
  if (normalized !== 'masculine') {
    const fallbackSet = ANIMATION_SETS.masculine;
    return fallbackSet[state] || null;
  }
  
  return null;
}

/**
 * Get fallback animation clip for a state
 * Always returns masculine as ultimate fallback
 * @param {string} state
 * @returns {string|null}
 */
export function getFallbackAnimationClip(state) {
  return ANIMATION_SETS.masculine[state] || null;
}

/**
 * Get all animation clip states for a gender
 * @param {string|null} gender
 * @returns {object} { idle, walk, run, jump, ... }
 */
export function getAllAnimationClips(gender) {
  return getAnimationSetForGender(gender);
}

/**
 * Validate animation set completeness
 * @param {string|null} gender
 * @returns {object} { isComplete: boolean, missing: string[] }
 */
export function validateAnimationSet(gender) {
  const normalized = normalizeGender(gender);
  const set = ANIMATION_SETS[normalized];
  const required = ['idle', 'walk', 'run', 'jump'];
  
  const missing = required.filter(state => !set[state]);
  return {
    isComplete: missing.length === 0,
    missing,
    normalized,
  };
}