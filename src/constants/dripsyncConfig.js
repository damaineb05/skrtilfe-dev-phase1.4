/**
 * DripSync Constants & Configuration
 * Single source of truth for all magic values used across the DripSync system.
 */

// ── Camera ───────────────────────────────────────────────────────────────────
export const DEFAULT_CAMERA_POSITION = [4, 3.5, 6];
export const DEFAULT_CAMERA_TARGET   = [0, 1.5, 0];

// ── Movement ─────────────────────────────────────────────────────────────────
export const MOVEMENT_SPEED      = 2.5;
export const RUN_MULTIPLIER      = 1.8;
export const TURN_SPEED          = 4.0;
export const JUMP_IMPULSE        = 7.0;
export const GRAVITY             = -20.0;
export const ACCELERATION        = 15.0;
export const MOVEMENT_DAMPING    = 10.0;

// ── Avatar ───────────────────────────────────────────────────────────────────
export const DEFAULT_AVATAR_URL  = 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb';
export const DEFAULT_AVATAR_HEIGHT = 1.8;

// ── Default Customization ────────────────────────────────────────────────────
export const DEFAULT_CUSTOMIZATION = {
  hairColor: '#8B4513',
  eyeColor: '#4A90E2',
  skinTone: '#FFDBAC',
  height: DEFAULT_AVATAR_HEIGHT,
  isVisible: true,
  currentAction: 'idle',
  hairStyleId: 'short_1',
  hairAssetUrl: null,
  skinFinish: 'matte',
  skinOverlay: 'none',
  overlayStrength: 0,
  headScale: 1,
  shoulderWidth: 1,
  limbScale: 1,
  facialHairStyleId: 'none',
  facialHairColor: '#3d2b1f',
  facialHairDensity: 0.6,
  eyebrowColor: '#3d2b1f',
  eyebrowThickness: 0.5,
  irisHue: 210,
  irisSaturation: 0.65,
  irisBrightness: 0.55,
  pupilSize: 0.45,
  scleraTint: '#ffffff',
  scleraTintStrength: 0,
  limbalRingIntensity: 0.6,
  eyeGloss: 0.35,
};

// ── Scene ────────────────────────────────────────────────────────────────────
export const SCENE_COLLISION_TARGET_SIZE = 20;
export const SCENE_LOAD_TIMEOUT_MS       = 30000;
export const ANIM_LOAD_TIMEOUT_MS        = 30000;

// ── Renderer ─────────────────────────────────────────────────────────────────
export const TONE_MAPPING_EXPOSURE  = 1.12;
export const MAX_PIXEL_RATIO        = 2;
export const SHADOW_MAP_SIZE        = 2048;
export const CAMERA_NEAR            = 0.1;
export const CAMERA_FAR             = 100;
export const CAMERA_FOV             = 50;
export const ORBIT_MIN_DISTANCE     = 2;
export const ORBIT_MAX_DISTANCE     = 15;
export const ORBIT_DAMPING_FACTOR   = 0.05;

// ── Animation names ──────────────────────────────────────────────────────────
export const ANIM_IDLE         = 'idle';
export const ANIM_WALK         = 'walk';
export const ANIM_RUN          = 'run';
export const ANIM_JUMP         = 'jump';
export const ANIM_BACKWARD     = 'backward';
export const ANIM_STRAFE_LEFT  = 'strafeLeft';
export const ANIM_STRAFE_RIGHT = 'strafeRight';

// ── Locomotion animation URLs ────────────────────────────────────────────────
const RPM_ANIM_BASE = 'https://raw.githubusercontent.com/crazyramirez/babylonjs-ReadyPlayerMe-Animation-Combiner/b0b0289e015b94845f259bba9f4460e461218a1c/resources/models/animations/masculine/locomotion';

export const LOCOMOTION_ANIMATION_URLS = {
  idle:        `${RPM_ANIM_BASE}/M_Idle_001.glb`,
  walk:        `${RPM_ANIM_BASE}/M_Walk_001.glb`,
  run:         `${RPM_ANIM_BASE}/M_Run_001.glb`,
  backward:    `${RPM_ANIM_BASE}/M_Walk_Backwards_001.glb`,
  strafeLeft:  `${RPM_ANIM_BASE}/M_Jog_Strafe_Left_002.glb`,
  strafeRight: `${RPM_ANIM_BASE}/M_Jog_Strafe_Right_002.glb`,
  jump:        `${RPM_ANIM_BASE}/M_Jog_Jump_Small_001.glb`,
};

// ── Background / Environment ─────────────────────────────────────────────────
// Note: Sketchfab download URLs require OAuth and will 403 in production.
// Use null (clean studio) or a direct CDN-hosted .glb URL instead.
export const DEFAULT_BACKGROUND = null;