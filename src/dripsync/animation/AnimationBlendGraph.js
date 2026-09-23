/**
 * AnimationBlendGraph
 * ─────────────────────────────────────────────────────────────
 * Defines valid animation state transitions and blend durations.
 * Prevents illegal transitions (e.g., run → jump skips walk).
 * Supports landing recovery and smooth cross-fading.
 */

export const TransitionRule = Object.freeze({
  // State → next state mapping
  IDLE: {
    WALK: 0.25,      // idle → walk (fast)
    RUN: 0.2,        // idle → run (bypass walk for fast input)
    JUMP: 0.15,      // idle → jump
    LANDING: 0.3,    // landing → idle
  },
  WALK: {
    IDLE: 0.3,       // walk → idle (decel)
    RUN: 0.2,        // walk → run (accel)
    JUMP: 0.15,      // walk → jump (no prep)
    FALL: 0.1,       // walk → fall (unexpected)
    LANDING: 0.3,    // landing → walk
  },
  RUN: {
    IDLE: 0.4,       // run → idle (longer decel)
    WALK: 0.3,       // run → walk (reduce speed)
    JUMP: 0.15,      // run → jump
    FALL: 0.1,       // run → fall
    LANDING: 0.3,    // landing → run
  },
  JUMP: {
    FALL: 0.1,       // jump → fall (ascending → descending)
    LANDING: 0.2,    // jump → landing (recovery)
  },
  FALL: {
    LANDING: 0.2,    // fall → landing (impact recovery)
  },
  LANDING: {
    IDLE: 0.25,      // landing → idle (after recovery)
    WALK: 0.25,      // landing → walk
    RUN: 0.25,       // landing → run
    JUMP: 0.3,       // landing → jump (no immediate double-jump)
  },
});

/**
 * Resolve a state transition, ensuring valid path
 * @param {string} currentState - e.g. 'walk'
 * @param {string} targetState  - e.g. 'run'
 * @returns {string} - validated target state or current state if invalid
 */
export function resolveTransition(currentState, targetState) {
  if (!TransitionRule[currentState] || !TransitionRule[currentState][targetState]) {
    // Invalid transition — stay in current state
    return currentState;
  }
  return targetState;
}

/**
 * Get blend duration (cross-fade time in seconds)
 * @param {string} fromState - current state
 * @param {string} toState   - target state
 * @returns {number} - duration in seconds
 */
export function getBlendDuration(fromState, toState) {
  return TransitionRule[fromState]?.[toState] ?? 0.25;
}

/**
 * Check if a state is airborne (not grounded)
 * @param {string} state
 * @returns {boolean}
 */
export function isAirborne(state) {
  return state === 'jump' || state === 'fall';
}

/**
 * Check if a state is locomotion (not emote or special)
 * @param {string} state
 * @returns {boolean}
 */
export function isLocomotion(state) {
  return ['idle', 'walk', 'run', 'jump', 'fall', 'landing'].includes(state);
}