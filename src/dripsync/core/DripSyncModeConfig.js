/**
 * DripSyncModeConfig
 * ─────────────────────────────────────────────────────────────
 * Canonical mode system for DripSync experience modes.
 * Centralizes movement, camera, animation, and control visibility per mode.
 * Ensures mode switching is smooth and polished without breaking existing systems.
 */

export const DripSyncMode = Object.freeze({
  MODERN_GAMEPLAY: 'modern_gameplay',
  COD_STYLE:       'cod_style',
  RUNWAY_MALE:     'runway_male',
  RUNWAY_FEMALE:   'runway_female',
  CLOSET:          'closet',
});

/**
 * Movement profile — affects ThirdPersonController behavior
 */
export const MovementProfile = Object.freeze({
  modern_gameplay: {
    walkSpeed: 2.5,
    runSpeed: 6.0,
    jumpForce: 6.0,
    acceleration: 1.0,      // normal
    deceleration: 1.0,      // normal
    allowJump: true,
    allowRun: true,
    description: 'Standard movement',
  },
  cod_style: {
    walkSpeed: 2.5,
    runSpeed: 6.0,
    jumpForce: 6.0,
    acceleration: 1.3,      // snappier
    deceleration: 1.2,      // quicker stop
    allowJump: true,
    allowRun: true,
    description: 'Sharper game feel',
  },
  runway_male: {
    walkSpeed: 1.8,         // slower, more controlled
    runSpeed: 2.5,          // limited run
    jumpForce: 0,           // no jump
    acceleration: 0.8,      // slower start
    deceleration: 0.7,      // gliding decel
    allowJump: false,
    allowRun: true,
    description: 'Masculine showcase',
  },
  runway_female: {
    walkSpeed: 1.8,
    runSpeed: 2.5,
    jumpForce: 0,
    acceleration: 0.8,
    deceleration: 0.7,
    allowJump: false,
    allowRun: true,
    description: 'Feminine showcase',
  },
  closet: {
    walkSpeed: 0,           // no movement
    runSpeed: 0,
    jumpForce: 0,
    acceleration: 0,
    deceleration: 0,
    allowJump: false,
    allowRun: false,
    description: 'Dressing mode',
  },
});

/**
 * Camera profile — affects camera responsiveness and follow distance
 */
export const CameraProfile = Object.freeze({
  modern_gameplay: {
    distance: 4.5,
    height: 1.8,
    lookAhead: 0.3,
    responsiveness: 1.0,    // normal smoothing
    turnSpeed: 1.0,
    description: 'Standard third-person',
  },
  cod_style: {
    distance: 4.0,          // tighter
    height: 1.6,            // slightly lower
    lookAhead: 0.5,
    responsiveness: 1.4,    // snappier
    turnSpeed: 1.3,         // quicker rotation
    description: 'Tight FPS-style',
  },
  runway_male: {
    distance: 5.5,          // farther back (full body showcase)
    height: 2.0,            // slightly higher
    lookAhead: 0.2,
    responsiveness: 0.7,    // smooth, cinematic
    turnSpeed: 0.6,         // slow, controlled
    description: 'Showcase positioning',
  },
  runway_female: {
    distance: 5.5,
    height: 2.0,
    lookAhead: 0.2,
    responsiveness: 0.7,
    turnSpeed: 0.6,
    description: 'Showcase positioning',
  },
  closet: {
    distance: 3.5,          // close, detailed view
    height: 1.5,
    lookAhead: 0,
    responsiveness: 1.2,    // fast, responsive to zoom
    turnSpeed: 1.0,
    description: 'Detailed wearable view',
  },
});

/**
 * Animation profile — affects which animation set is used
 */
export const AnimationProfile = Object.freeze({
  modern_gameplay: {
    forceGender: null,      // use current avatar gender
    fallbackGender: 'masculine',
    animationSet: 'default',
    description: 'Current avatar profile',
  },
  cod_style: {
    forceGender: null,
    fallbackGender: 'masculine',
    animationSet: 'default',
    description: 'Current avatar profile',
  },
  runway_male: {
    forceGender: 'masculine',  // force male animations
    fallbackGender: 'masculine',
    animationSet: 'masculine',
    description: 'Masculine animations',
  },
  runway_female: {
    forceGender: 'feminine',   // force female animations
    fallbackGender: 'masculine',
    animationSet: 'feminine',
    description: 'Feminine animations',
  },
  closet: {
    forceGender: null,
    fallbackGender: 'masculine',
    animationSet: 'default',
    description: 'Current avatar profile',
  },
});

/**
 * Control visibility — determines which UI controls show per mode
 */
export const ControlVisibility = Object.freeze({
  modern_gameplay: {
    closetPanel: true,
    customizationPanel: true,
    wearableTransform: true,
    colorControl: true,
    animationLibrary: true,
    environmentControl: true,
    sceneObjectControl: true,
    socialPanel: true,
    saveLoad: true,
  },
  cod_style: {
    closetPanel: true,
    customizationPanel: true,
    wearableTransform: true,
    colorControl: true,
    animationLibrary: true,
    environmentControl: true,
    sceneObjectControl: true,
    socialPanel: true,
    saveLoad: true,
  },
  runway_male: {
    closetPanel: true,
    customizationPanel: false,  // reduced UI
    wearableTransform: false,
    colorControl: false,
    animationLibrary: false,
    environmentControl: true,
    sceneObjectControl: false,
    socialPanel: false,
    saveLoad: true,
  },
  runway_female: {
    closetPanel: true,
    customizationPanel: false,
    wearableTransform: false,
    colorControl: false,
    animationLibrary: false,
    environmentControl: true,
    sceneObjectControl: false,
    socialPanel: false,
    saveLoad: true,
  },
  closet: {
    closetPanel: true,         // primary
    customizationPanel: false,
    wearableTransform: true,   // prominent
    colorControl: true,        // prominent
    animationLibrary: false,
    environmentControl: false,
    sceneObjectControl: false,
    socialPanel: false,
    saveLoad: true,
  },
});

/**
 * Mode metadata
 */
export const ModeMetadata = Object.freeze({
  modern_gameplay: {
    label: 'Gameplay',
    icon: 'Gamepad2',
    description: 'Standard movement experience',
    color: '#00D4FF',      // cyan
  },
  cod_style: {
    label: 'COD Feel',
    icon: 'Crosshair',
    description: 'Sharper game-feel',
    color: '#FF3366',      // red
  },
  runway_male: {
    label: 'Runway M',
    icon: 'User',
    description: 'Masculine showcase',
    color: '#6C9EFF',      // blue
  },
  runway_female: {
    label: 'Runway F',
    icon: 'User',
    description: 'Feminine showcase',
    color: '#FFB6FF',      // pink
  },
  closet: {
    label: 'Closet',
    icon: 'ShoppingBag',
    description: 'Wearable dressing',
    color: '#FFD700',      // gold
  },
});

/**
 * Get complete mode configuration
 * @param {string} mode - DripSyncMode value
 * @returns {object} - { movement, camera, animation, controls, metadata }
 */
export function getDripSyncModeConfig(mode) {
  return {
    mode,
    movement: MovementProfile[mode] || MovementProfile.modern_gameplay,
    camera: CameraProfile[mode] || CameraProfile.modern_gameplay,
    animation: AnimationProfile[mode] || AnimationProfile.modern_gameplay,
    controls: ControlVisibility[mode] || ControlVisibility.modern_gameplay,
    metadata: ModeMetadata[mode] || ModeMetadata.modern_gameplay,
  };
}

/**
 * Get movement profile for a mode
 * @param {string} mode
 * @returns {object}
 */
export function getMovementProfile(mode) {
  return MovementProfile[mode] || MovementProfile.modern_gameplay;
}

/**
 * Get camera profile for a mode
 * @param {string} mode
 * @returns {object}
 */
export function getCameraProfile(mode) {
  return CameraProfile[mode] || CameraProfile.modern_gameplay;
}

/**
 * Get animation profile for a mode
 * @param {string} mode
 * @returns {object}
 */
export function getAnimationProfile(mode) {
  return AnimationProfile[mode] || AnimationProfile.modern_gameplay;
}

/**
 * Get control visibility for a mode
 * @param {string} mode
 * @returns {object}
 */
export function getControlVisibilityForMode(mode) {
  return ControlVisibility[mode] || ControlVisibility.modern_gameplay;
}

/**
 * Is closet mode?
 * @param {string} mode
 * @returns {boolean}
 */
export function isClosetMode(mode) {
  return mode === DripSyncMode.CLOSET;
}

/**
 * Is runway mode?
 * @param {string} mode
 * @returns {boolean}
 */
export function isRunwayMode(mode) {
  return mode === DripSyncMode.RUNWAY_MALE || mode === DripSyncMode.RUNWAY_FEMALE;
}

/**
 * Is gameplay mode (modern or cod)?
 * @param {string} mode
 * @returns {boolean}
 */
export function isGameplayMode(mode) {
  return mode === DripSyncMode.MODERN_GAMEPLAY || mode === DripSyncMode.COD_STYLE;
}

export default {
  DripSyncMode,
  MovementProfile,
  CameraProfile,
  AnimationProfile,
  ControlVisibility,
  ModeMetadata,
  getDripSyncModeConfig,
  getMovementProfile,
  getCameraProfile,
  getAnimationProfile,
  getControlVisibilityForMode,
  isClosetMode,
  isRunwayMode,
  isGameplayMode,
};