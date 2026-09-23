/**
 * SKRTLIFE Input Language — shared interaction constants & conventions.
 *
 * DripSync (avatar inspection) and World (third-person locomotion) are
 * different jobs, but they share ONE input language: the same look/zoom
 * direction philosophy, damping feel, device detection, and input-priority
 * model. This module is the single source — controllers import constants
 * instead of hardcoding magic numbers, so the two surfaces stay in lockstep
 * as feel is tuned.
 *
 * ── Direction conventions (both surfaces) ──────────────────────────
 *   Drag / look RIGHT  → view orbits / turns right.
 *   Drag / look DOWN   → view tilts (World: camera rises, looks down).
 *   Wheel UP            → zoom in.
 *   Pinch OPEN (mobile) → zoom out.
 *
 *   DripSync drag = inspect identity. World drag = look around environment.
 *   The gesture and direction feel related; the difference is contextual,
 *   not contradictory. DripSync has no WASD locomotion (avatar is inspected,
 *   not navigated); World adds WASD/Shift as camera-relative locomotion.
 *
 * ── Input priority (highest first) ──────────────────────────────────
 *   A lower layer pauses while any higher one is active.
 *     SYSTEM MODAL
 *       → DRIPSYNC / WORLD OVERLAY
 *         → INTERACTIVE UI
 *           → CAMERA (look / orbit)
 *             → PLAYER MOVEMENT
 *   When DripSyncTabletOverlay (or any World UI mode) is open, World
 *   movement + pointer lock pause and held input is cleared; on close,
 *   movement resumes with no stuck keys, no pointer state, no camera jump.
 */

// ── Look / orbit sensitivity ───────────────────────────────────
// Radians per pixel of pointer movement. World CameraRig consumes these
// directly. DripSync OrbitControls uses its own rotateSpeed but targets
// this same baseline feel.
export const LOOK = Object.freeze({
  YAW_PER_PX: 0.0024,   // horizontal orbit per pixel
  PITCH_PER_PX: 0.0024, // vertical orbit per pixel
  PITCH_MIN: 0.16,     // World: lowest camera pitch (near level)
  PITCH_MAX: 1.15,     // World: highest camera pitch (steep down)
});

// ── Camera damping feel ────────────────────────────────────────
// Frame-rate-independent lerp baseline. World CameraRig follows with
// `k = 1 - pow(FOLLOW_K_BASE, dt)` — snappy but smooth.
export const CAMERA_DAMPING = Object.freeze({
  FOLLOW_K_BASE: 0.0001,
});

// ── Locomotion feel (World) ──────────────────────────────────────
// Horizontal velocity approaches desired dir*speed at ACCEL (moving) or
// DECEL (stopping). Character facing turns toward travel at TURN_RATE.
// Tuned to feel responsive (not twitchy) and smooth (not floaty).
export const LOCOMOTION = Object.freeze({
  WALK_SPEED: 6.2,    // m/s — standard travel
  RUN_SPEED: 10.5,    // m/s — Shift sprint
  JUMP_VELOCITY: 7.2, // m/s — initial jump impulse
  GRAVITY: 22,        // m/s² — downward accel
  ACCEL: 14,     // velocity approach rate while moving (per second)
  DECEL: 10,     // velocity approach rate while stopping (per second)
  TURN_RATE: 12, // character facing turn rate (rad/s)
});

// ── Touch ──────────────────────────────────────────────────────
export const TOUCH = Object.freeze({
  JOYSTICK_DEADZONE: 0.15, // analog stick rest deadzone
  LOOK_SPLIT_RATIO: 0.5,   // World: left half = move, right half = look
});

// ── Device detection ───────────────────────────────────────────
/** True on coarse-pointer devices (phones / tablets) — excludes touch-capable desktops. */
export function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(pointer: coarse)').matches ?? false;
}

/** True on narrow viewports (mobile-width layouts). */
export function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}