/**
 * WearableLoader
 * ─────────────────────────────────────────────────────────────
 * Handles wearable asset loading only.
 * Returns a normalized result — never mutates the scene directly.
 *
 * Assumptions about the 3D stack:
 *   - Three.js r150+ (GLTFLoader from three/examples/jsm)
 *   - Wearable assets are .glb files served from a public URL
 *   - DRACOLoader is optional; falls back gracefully if not configured
 */

// ── URL validation ────────────────────────────────────────────

const VALID_EXTENSIONS = ['.glb', '.gltf'];

/**
 * Returns true if the string looks like a loadable 3D asset URL.
 * @param {string} url
 * @returns {boolean}
 */
function isValidModelUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
    return false;
  }
  return VALID_EXTENSIONS.some(ext => trimmed.split('?')[0].endsWith(ext));
}

// ── Loader ───────────────────────────────────────────────────

/**
 * Load a wearable .glb asset and return a normalized result.
 *
 * @param {{
 *   modelUrl:       string,
 *   scene?:         THREE.Scene,       — optional; loader does NOT add to scene
 *   loaderOptions?: {
 *     dracoPath?:   string,            — path to Draco decoder folder
 *     timeout?:     number,            — ms before giving up (default: 20000)
 *   }
 * }} options
 *
 * @returns {Promise<{
 *   root:      THREE.Group,
 *   skeleton:  THREE.Skeleton | null,
 *   meshes:    THREE.Mesh[],
 *   materials: THREE.Material[],
 *   metadata:  { animationCount: number, boneCount: number, meshCount: number, sourceUrl: string }
 * }>}
 */
export async function loadWearableModel({ modelUrl, scene: _scene, loaderOptions = {} }) {
  // ── Validate ─────────────────────────────────────────────────
  if (!modelUrl) {
    throw new Error('WearableLoader: modelUrl is required.');
  }
  if (!isValidModelUrl(modelUrl)) {
    throw new Error(
      `WearableLoader: invalid or unsupported modelUrl "${modelUrl}". ` +
      `Expected a .glb or .gltf URL.`
    );
  }

  const { dracoPath = null, timeout = 20_000 } = loaderOptions;

  // ── Dynamic import (keeps non-3D environments safe) ──────────
  const THREE       = await import('three');
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

  const loader = new GLTFLoader();

  // Attach Draco decoder if a path was provided
  if (dracoPath) {
    const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
    const draco = new DRACOLoader();
    draco.setDecoderPath(dracoPath);
    loader.setDRACOLoader(draco);
  }

  // ── Load ──────────────────────────────────────────────────────
  const gltf = await Promise.race([
    new Promise((resolve, reject) => {
      loader.load(modelUrl, resolve, undefined, (err) => {
        reject(new Error(`WearableLoader: failed to load "${modelUrl}" — ${err?.message || err}`));
      });
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`WearableLoader: timeout loading "${modelUrl}" after ${timeout}ms`)), timeout)
    ),
  ]);

  const root = gltf.scene;

  // ── Normalize ─────────────────────────────────────────────────
  const meshes    = [];
  const materials = [];
  let   skeleton  = null;

  root.traverse((node) => {
    if (node.isMesh) {
      meshes.push(node);
      // Collect unique materials
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      for (const mat of mats) {
        if (mat && !materials.includes(mat)) materials.push(mat);
      }
    }
    if (node.isSkinnedMesh && node.skeleton && !skeleton) {
      skeleton = node.skeleton;
    }
  });

  return {
    root,
    skeleton: skeleton || null,
    meshes,
    materials,
    metadata: {
      animationCount: (gltf.animations || []).length,
      boneCount:      skeleton ? skeleton.bones.length : 0,
      meshCount:      meshes.length,
      sourceUrl:      modelUrl,
    },
  };
}

export default { loadWearableModel };