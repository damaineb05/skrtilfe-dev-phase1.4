/**
 * InputController
 * ─────────────────────────────────────────────────────────────
 * Normalized input layer for avatar movement.
 * Consumers (keyboard, gamepad, touch, AI) push raw input here.
 * MovementController reads the normalized shape — never raw events.
 *
 * Normalized input shape:
 * {
 *   forward:   boolean,
 *   backward:  boolean,
 *   left:      boolean,
 *   right:     boolean,
 *   run:       boolean,
 *   jump:      boolean,
 *   interact:  boolean,
 * }
 */

const DEFAULT_INPUT = Object.freeze({
  forward:  false,
  backward: false,
  left:     false,
  right:    false,
  run:      false,
  jump:     false,
  interact: false,
});

class InputController {
  constructor() {
    this._input = { ...DEFAULT_INPUT };
  }

  /**
   * Merge a partial input update into the current normalized state.
   * Only known keys are accepted; unknown keys are silently ignored.
   * @param {Partial<typeof DEFAULT_INPUT>} nextInput
   */
  setInput(nextInput) {
    if (!nextInput || typeof nextInput !== 'object') return;

    const updated = { ...this._input };
    for (const key of Object.keys(DEFAULT_INPUT)) {
      if (key in nextInput) {
        updated[key] = Boolean(nextInput[key]);
      }
    }
    this._input = updated;
  }

  /**
   * Return a snapshot of the current normalized input state.
   * @returns {typeof DEFAULT_INPUT}
   */
  getInput() {
    return { ...this._input };
  }

  /**
   * Returns true if any directional or action input is active.
   * @returns {boolean}
   */
  hasActiveInput() {
    return (
      this._input.forward  ||
      this._input.backward ||
      this._input.left     ||
      this._input.right    ||
      this._input.jump     ||
      this._input.interact
    );
  }

  /**
   * Reset all inputs to neutral (e.g. on focus loss or controller detach).
   */
  reset() {
    this._input = { ...DEFAULT_INPUT };
  }
}

export default InputController;