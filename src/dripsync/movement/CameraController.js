/**
 * CameraController
 * ─────────────────────────────────────────────────────────────
 * Lightweight viewport-agnostic camera abstraction.
 * Provides forward/right world-space vectors for movement direction resolution.
 * Works with any Three.js camera (PerspectiveCamera, OrthographicCamera).
 *
 * If no camera is attached, all directional queries return neutral vectors.
 */

// Neutral vectors (re-used as frozen fallbacks, never mutated)
const VECTOR_FORWARD = Object.freeze([0, 0, -1]);
const VECTOR_RIGHT   = Object.freeze([1, 0, 0]);
const VECTOR_ZERO    = Object.freeze([0, 0, 0]);

class CameraController {
  constructor() {
    this._camera = null;
  }

  /**
   * Attach a Three.js camera object.
   * @param {THREE.Camera} camera
   */
  attach(camera) {
    this._camera = camera || null;
  }

  /**
   * Return the currently attached camera, or null.
   * @returns {THREE.Camera | null}
   */
  getCamera() {
    return this._camera;
  }

  /**
   * Return the camera's world-space forward vector projected onto XZ plane,
   * normalized. Falls back to [0,0,-1] if no camera is attached.
   * @returns {[number, number, number]}
   */
  getForwardVector() {
    if (!this._camera) return [...VECTOR_FORWARD];

    try {
      // Extract forward direction from camera matrix
      const e = this._camera.matrixWorld.elements;
      // Column 2 (negated) = forward in world space
      const fx = -e[8];
      const fz = -e[10];
      const len = Math.sqrt(fx * fx + fz * fz);
      if (len < 1e-6) return [...VECTOR_FORWARD];
      return [fx / len, 0, fz / len];
    } catch (_) {
      return [...VECTOR_FORWARD];
    }
  }

  /**
   * Return the camera's world-space right vector projected onto XZ plane,
   * normalized. Falls back to [1,0,0] if no camera is attached.
   * @returns {[number, number, number]}
   */
  getRightVector() {
    if (!this._camera) return [...VECTOR_RIGHT];

    try {
      const e = this._camera.matrixWorld.elements;
      // Column 0 = right in world space
      const rx = e[0];
      const rz = e[2];
      const len = Math.sqrt(rx * rx + rz * rz);
      if (len < 1e-6) return [...VECTOR_RIGHT];
      return [rx / len, 0, rz / len];
    } catch (_) {
      return [...VECTOR_RIGHT];
    }
  }

  /**
   * Reset camera reference.
   */
  reset() {
    this._camera = null;
  }
}

export default CameraController;