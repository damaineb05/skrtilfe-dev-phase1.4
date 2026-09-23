/**
 * ViewportScene — WebGLRenderer + Three.Scene creation helpers.
 * Pure functions. No React.
 */

/**
 * Create and configure a WebGLRenderer attached to an existing canvas.
 * @param {object} THREE
 * @param {HTMLCanvasElement} canvas
 * @param {number} width
 * @param {number} height
 * @returns {THREE.WebGLRenderer}
 */
export function createRenderer(THREE, canvas, width, height) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

/**
 * Create a bare Three.Scene.
 * @param {object} THREE
 * @returns {THREE.Scene}
 */
export function createScene(THREE) {
  return new THREE.Scene();
}