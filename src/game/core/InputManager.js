/**
 * Keyboard + pointer-lock mouse input. Framework-agnostic.
 * Provides continuous movement state and a one-shot action queue for
 * discrete inputs (interact / jump / vehicle / menu).
 *
 * Mobile controllers can be layered on later by calling enqueue() externally.
 */

/** True when the key event originated inside a text field the user is editing —
 *  the InputManager must never capture those (so typing into a world overlay's
 *  input doesn't also drive the avatar). */
function isEditingTarget(t) {
  return !!(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable));
}

export default class InputManager {
  constructor(domElement) {
    this.dom = domElement;
    this.keys = {};
    this.mouseDX = 0;
    this.mouseDY = 0;
    this._queue = [];
    this.locked = false;
    this._lastUnlockAt = 0; // Chrome throws SecurityError if requestPointerLock() runs within ~1s of ESC-exit
    this.enabled = true; // flipped off while a world overlay (store / tablet / menu) is open
    this.touchMove = { x: 0, z: 0 };
    this.touchRun = false;

    this.lastInput = 'keyboard';
    this._onKeyDown = (e) => {
      if (isEditingTarget(e.target)) return; // never hijack text fields
      if (!this.enabled) return; // World input paused while a UI mode (store/dripsync/menu) is open — record no movement keys, enqueue no actions
      this.keys[e.code] = true;
      this.lastInput = 'keyboard';
      if (e.code === 'Space') e.preventDefault(); // avoid page scroll / button activation
      if (e.code === 'KeyE') this._enqueue('interact');
      if (e.code === 'KeyF') this._enqueue('vehicle');
      if (e.code === 'Space') this._enqueue('jump');
    };
    this._onKeyUp = (e) => {
      if (isEditingTarget(e.target)) return;
      this.keys[e.code] = false;
    };

    this._onMouseDown = (e) => {
      if (e.button !== 0) return;
      this.lastInput = 'mouse';
      if (!this.enabled) return; // don't capture pointer while a UI panel is open
      if (!this.locked && performance.now() - this._lastUnlockAt > 1200) {
        try {
          const p = this.dom.requestPointerLock?.();
          if (p && typeof p.catch === 'function') p.catch(() => {}); // promise variant (Chrome) rejects during cooldown
        } catch (e) { /* browser cooldown after ESC — ignore */ }
      }
    };
    this._onMouseMove = (e) => {
      if (this.locked) { this.mouseDX += e.movementX; this.mouseDY += e.movementY; this.lastInput = 'mouse'; }
    };
    this._onLockChange = () => {
      const wasLocked = this.locked;
      this.locked = document.pointerLockElement === this.dom;
      if (wasLocked && !this.locked) this._lastUnlockAt = performance.now();
    };
    this._onContext = (e) => e.preventDefault();
    // Losing focus (tab switch / alt-tab / window blur) often fires no keyup, so a
    // held movement key would read as "down" forever and the avatar would drift on
    // return. Drop all held input the moment the window loses focus.
    this._onBlur = () => this.clearKeys();

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
    document.addEventListener('visibilitychange', this._onBlur);
    this.dom.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('pointerlockchange', this._onLockChange);
    this.dom.addEventListener('contextmenu', this._onContext);
  }

  enqueue(a) { this._enqueue(a); }
  setTouchMove(x, z) { this.touchMove.x = x; this.touchMove.z = z; if (x || z) this.lastInput = 'touch'; }
  setTouchRun(v) { this.touchRun = !!v; }
  injectLook(dx, dy) { this.mouseDX += dx; this.mouseDY += dy; }
  _enqueue(a) { this._queue.push(a); }

  /** Drop all held input. Called when entering a non-playing UI mode so the
      avatar doesn't drift on a stuck key or an orphaned touch. */
  clearKeys() {
    this.keys = {};
    this.touchMove.x = 0; this.touchMove.z = 0;
    this.touchRun = false;
    this._queue = [];
  }

  consumeActions() { const q = this._queue; this._queue = []; return q; }

  get moveX() {
    if (!this.enabled) return 0;
    return (this.keys['KeyD'] ? 1 : 0) - (this.keys['KeyA'] ? 1 : 0) + this.touchMove.x;
  }
  get moveZ() {
    if (!this.enabled) return 0;
    return (this.keys['KeyW'] ? 1 : 0) - (this.keys['KeyS'] ? 1 : 0) + this.touchMove.z;
  }
  get running() {
    if (!this.enabled) return false;
    return !!(this.keys['ShiftLeft'] || this.keys['ShiftRight']) || this.touchRun;
  }

  consumeMouse() {
    const dx = this.mouseDX, dy = this.mouseDY;
    this.mouseDX = 0; this.mouseDY = 0;
    return this.enabled ? { dx, dy } : { dx: 0, dy: 0 };
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
    document.removeEventListener('visibilitychange', this._onBlur);
    this.dom.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('pointerlockchange', this._onLockChange);
    this.dom.removeEventListener('contextmenu', this._onContext);
  }
}