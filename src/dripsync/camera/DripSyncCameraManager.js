/**
 * DripSyncCameraManager
 * ─────────────────────────────────────────────────────────────
 * Centralized camera state machine for DripSync viewport.
 *
 * Modes:
 *   NORMAL_VIEW   — default gameplay / exploration camera
 *   STYLE_VIEW    — avatar customization close-up
 *
 * Auto-framing presets:
 *   FACE_PRESET · TORSO_PRESET · LOWER_BODY_PRESET · SHOE_PRESET
 *
 * All transitions use ease-in-out cubic interpolation (no snapping).
 * Duration: 600 ms by default.
 */

// ── Camera mode constants ──────────────────────────────────────
export const CameraMode = Object.freeze({
  NORMAL_VIEW: 'NORMAL_VIEW',
  STYLE_VIEW:  'STYLE_VIEW',
});

// ── Preset definitions ─────────────────────────────────────────
// Each preset: { position: [x,y,z], target: [x,y,z] }
export const CAMERA_PRESETS = Object.freeze({
  DEFAULT: {
    position: [0, 2.5, 6],
    target:   [0, 1.0, 0],
  },
  STYLE_DEFAULT: {
    position: [0, 1.65, 1.2],
    target:   [0, 1.55, 0],
  },
  FACE: {
    position: [0, 1.72, 0.75],
    target:   [0, 1.65, 0],
  },
  TORSO: {
    position: [0, 1.45, 1.35],
    target:   [0, 1.25, 0],
  },
  LOWER_BODY: {
    position: [0, 0.95, 1.5],
    target:   [0, 0.70, 0],
  },
  SHOE: {
    position: [0, 0.40, 1.0],
    target:   [0, 0.15, 0],
  },
  ACCESSORY: {
    position: [0, 1.55, 1.0],
    target:   [0, 1.40, 0],
  },
  HAT: {
    position: [0, 1.85, 0.85],
    target:   [0, 1.75, 0],
  },
});

// ── Style mode orbit constraints ───────────────────────────────
export const STYLE_ORBIT_CONSTRAINTS = Object.freeze({
  minDistance: 0.5,
  maxDistance: 2.5,
  minPolarAngle: Math.PI * 0.3,   // ~54° — never looking down at feet from above
  maxPolarAngle: Math.PI * 0.65,  // ~117° — slight upward tilt allowed
  enablePan: false,
  rotateSpeed: 0.7,
});

// ── Default orbit constraints (restored on exit) ───────────────
export const NORMAL_ORBIT_CONSTRAINTS = Object.freeze({
  minDistance: 1.5,
  maxDistance: 20,
  minPolarAngle: Math.PI * 0.15,
  maxPolarAngle: Math.PI / 2 - 0.05,
  enablePan: false,
  rotateSpeed: 1.0,
});

/**
 * Ease-in-out cubic (t ∈ [0,1])
 */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * DripSyncCameraManager
 *
 * Usage:
 *   const mgr = new DripSyncCameraManager(cameraRef, controlsRef, THREE);
 *   mgr.enterStyleMode();
 *   mgr.focusPreset('FACE');
 *   mgr.exitStyleMode();
 */
export class DripSyncCameraManager {
  constructor(cameraRef, controlsRef, THREE) {
    this.cameraRef   = cameraRef;
    this.controlsRef = controlsRef;
    this.THREE       = THREE;

    this._mode         = CameraMode.NORMAL_VIEW;
    this._tweenRaf     = null;
    this._cancelTween  = null;

    // Saved state for restoration
    this._savedPosition = null;
    this._savedTarget   = null;
  }

  get mode() { return this._mode; }
  get isStyleMode() { return this._mode === CameraMode.STYLE_VIEW; }

  // ── Enter Style Mode ────────────────────────────────────────
  enterStyleMode(duration = 650) {
    const cam  = this.cameraRef.current;
    const ctrl = this.controlsRef.current;
    if (!cam || !ctrl) return;

    // Save current state for restoration
    this._savedPosition = cam.position.clone();
    this._savedTarget   = ctrl.target.clone();

    this._mode = CameraMode.STYLE_VIEW;

    // Disable movement input via data attribute on document
    document.dispatchEvent(new CustomEvent('dripsync:style-mode-enter'));

    // Apply orbit constraints for style mode
    this._applyOrbitConstraints(STYLE_ORBIT_CONSTRAINTS);

    // Tween to style default
    const preset = CAMERA_PRESETS.STYLE_DEFAULT;
    this._tweenTo(
      new this.THREE.Vector3(...preset.position),
      new this.THREE.Vector3(...preset.target),
      duration
    );
  }

  // ── Exit Style Mode ─────────────────────────────────────────
  exitStyleMode(duration = 650) {
    const cam  = this.cameraRef.current;
    const ctrl = this.controlsRef.current;
    if (!cam || !ctrl) return;

    this._mode = CameraMode.NORMAL_VIEW;

    // Notify for movement re-enable
    document.dispatchEvent(new CustomEvent('dripsync:style-mode-exit'));

    // Restore orbit constraints
    this._applyOrbitConstraints(NORMAL_ORBIT_CONSTRAINTS);

    // Restore saved position or fallback to DEFAULT
    const targetPos = this._savedPosition ?? new this.THREE.Vector3(...CAMERA_PRESETS.DEFAULT.position);
    const targetLook = this._savedTarget   ?? new this.THREE.Vector3(...CAMERA_PRESETS.DEFAULT.target);

    this._tweenTo(targetPos, targetLook, duration, () => {
      this._savedPosition = null;
      this._savedTarget   = null;
    });
  }

  // ── Focus a category preset ─────────────────────────────────
  focusPreset(presetKey, duration = 450) {
    if (!this.isStyleMode) return; // only in style mode
    const preset = CAMERA_PRESETS[presetKey?.toUpperCase()] || CAMERA_PRESETS.STYLE_DEFAULT;
    this._tweenTo(
      new this.THREE.Vector3(...preset.position),
      new this.THREE.Vector3(...preset.target),
      duration
    );
  }

  // ── Map wearable slot → preset ──────────────────────────────
  focusForSlot(slot) {
    const map = {
      top:       'TORSO',
      jacket:    'TORSO',
      bottom:    'LOWER_BODY',
      shoes:     'SHOE',
      hat:       'HAT',
      accessory: 'ACCESSORY',
      jewellery: 'ACCESSORY',
      skin:      'FACE',
      hair:      'FACE',
      face:      'FACE',
      eyes:      'FACE',
      appearance:'FACE',
    };
    this.focusPreset(map[slot?.toLowerCase()] || 'STYLE_DEFAULT');
  }

  // ── Internal tween ──────────────────────────────────────────
  _tweenTo(targetPos, targetLook, duration = 600, onComplete) {
    this._cancelCurrentTween();

    const cam  = this.cameraRef.current;
    const ctrl = this.controlsRef.current;
    if (!cam || !ctrl) return;

    const startPos    = cam.position.clone();
    const startTarget = ctrl.target.clone();
    const startTime   = performance.now();

    let cancelled = false;
    this._cancelTween = () => { cancelled = true; };

    const tick = () => {
      if (cancelled) return;
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const e = easeInOutCubic(t);

      cam.position.lerpVectors(startPos, targetPos, e);
      ctrl.target.lerpVectors(startTarget, targetLook, e);
      ctrl.update();

      if (t < 1) {
        this._tweenRaf = requestAnimationFrame(tick);
      } else {
        this._tweenRaf = null;
        this._cancelTween = null;
        onComplete?.();
      }
    };

    this._tweenRaf = requestAnimationFrame(tick);
  }

  _cancelCurrentTween() {
    if (this._cancelTween) { this._cancelTween(); this._cancelTween = null; }
    if (this._tweenRaf)    { cancelAnimationFrame(this._tweenRaf); this._tweenRaf = null; }
  }

  _applyOrbitConstraints(constraints) {
    const ctrl = this.controlsRef.current;
    if (!ctrl) return;
    ctrl.minDistance    = constraints.minDistance;
    ctrl.maxDistance    = constraints.maxDistance;
    ctrl.minPolarAngle  = constraints.minPolarAngle;
    ctrl.maxPolarAngle  = constraints.maxPolarAngle;
    ctrl.enablePan      = constraints.enablePan;
    ctrl.rotateSpeed    = constraints.rotateSpeed;
    ctrl.update();
  }

  dispose() {
    this._cancelCurrentTween();
  }
}

// ── Slot → preset key mapping (exported for consumers) ────────
export function getPresetForStyleTab(tabId) {
  const map = {
    appearance: 'FACE',
    skin:       'FACE',
    hair:       'FACE',
    eyes:       'FACE',
    wearables:  'STYLE_DEFAULT',
    animations: 'STYLE_DEFAULT',
    avatar:     'STYLE_DEFAULT',
    looks:      'STYLE_DEFAULT',
  };
  return map[tabId] || 'STYLE_DEFAULT';
}

export function getPresetForWearableSlot(slot) {
  const map = {
    top:       'TORSO',
    jacket:    'TORSO',
    bottom:    'LOWER_BODY',
    shoes:     'SHOE',
    hat:       'HAT',
    accessory: 'ACCESSORY',
    jewellery: 'ACCESSORY',
  };
  return map[slot] || 'STYLE_DEFAULT';
}