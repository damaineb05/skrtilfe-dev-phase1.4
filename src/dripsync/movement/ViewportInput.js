/**
 * ViewportInput — the single normalized input layer for DripSync movement.
 *
 * Keyboard, touch, and future gamepad push normalized state here. The movement
 * controller (ViewportControls.updateMovement) reads ONLY this — never raw
 * events. This is the one input pipeline for DripSync locomotion.
 *
 * Jump is edge-triggered: a press queues exactly one jump; holding the key
 * does not repeat. consumeJump() drains the queue (one jump per press).
 */

export const ViewportInputSource = Object.freeze({
  KEYBOARD: 'keyboard',
  TOUCH: 'touch',
  GAMEPAD: 'gamepad',
});

const DEFAULT_STATE = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  run: false,
  interact: false,
  _jumpHeld: false,
  _jumpQueued: false,
};

export default class ViewportInput {
  constructor() {
    this._s = { ...DEFAULT_STATE };
    this._source = ViewportInputSource.KEYBOARD;
  }

  /** Binary directional / modifier set. axis ∈ forward|backward|left|right|run|interact. */
  setMove(axis, value) {
    if (axis in this._s && axis[0] !== '_') this._s[axis] = !!value;
  }
  setRun(v) { this._s.run = !!v; }
  setInteract(v) { this._s.interact = !!v; }

  /** Jump press/release — edge-triggers a single queued jump on press. */
  setJump(down) {
    if (down && !this._s._jumpHeld) this._s._jumpQueued = true;
    this._s._jumpHeld = !!down;
  }

  /** Analog joystick (x, y in [-1,1]) → boolean directions with a deadzone. */
  setJoystick(x, y, deadzone = 0.15) {
    this._source = ViewportInputSource.TOUCH;
    this._s.forward  = y < -deadzone;
    this._s.backward = y > deadzone;
    this._s.left     = x < -deadzone;
    this._s.right    = x > deadzone;
    if (Math.abs(x) < deadzone && Math.abs(y) < deadzone) {
      this._source = ViewportInputSource.TOUCH; // remain touch even at rest
    }
  }

  setSource(src) { this._source = src; }

  /** Drain the queued jump. Returns true once per press (edge-triggered). */
  consumeJump() {
    const q = this._s._jumpQueued;
    this._s._jumpQueued = false;
    return q;
  }

  get forward()  { return this._s.forward; }
  get backward() { return this._s.backward; }
  get left()     { return this._s.left; }
  get right()    { return this._s.right; }
  get run()      { return this._s.run; }
  get interact() { return this._s.interact; }
  get source()   { return this._source; }
  get jumpHeld() { return this._s._jumpHeld; }
  get jumpQueued() { return this._s._jumpQueued; }

  /** Drop all held input (blur / visibility loss / panel transitions). */
  reset() {
    this._s = { ...DEFAULT_STATE };
  }
}