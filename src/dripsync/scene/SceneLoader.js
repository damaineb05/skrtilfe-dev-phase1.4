/**
 * SceneLoader
 * ─────────────────────────────────────────────────────────────
 * Focused environment/realm asset loader.
 * Validates the URL, fetches the GLTF/GLB via Three.js GLTFLoader,
 * and returns a normalized result — no scene mutation.
 *
 * Returns:
 *   { root, meshes, materials, metadata }
 */

const SUPPORTED_EXTENSIONS = ['.glb', '.gltf'];

/**
 * Validate an environment asset URL.
 * @param {string} url
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateEnvironmentUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, reason: 'URL is empty or not a string.' };
  }

  const trimmed = url.trim();

  try {
    new URL(trimmed);
  } catch (_) {
    // Accept relative paths
    if (!trimmed.startsWith('/') && !trimmed.startsWith('./') && !trimmed.startsWith('../')) {
      return { valid: false, reason: `Invalid URL format: "${trimmed}"` };
    }
  }

  const lower = trimmed.toLowerCase().split('?')[0];
  const hasValidExt = SUPPORTED_EXTENSIONS.some(ext => lower.endsWith(ext));
  if (!hasValidExt) {
    return {
      valid: false,
      reason: `Unsupported extension. Expected one of: ${SUPPORTED_EXTENSIONS.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Load an environment asset from a URL into a Three.js scene.
 *
 * @param {{
 *   environmentUrl: string,
 *   scene?: import('three').Scene,
 *   loaderOptions?: { timeoutMs?: number, dracoPath?: string }
 * }} options
 * @returns {Promise<{
 *   root: import('three').Object3D,
 *   meshes: import('three').Mesh[],
 *   materials: import('three').Material[],
 *   metadata: object
 * }>}
 */
export async function loadEnvironmentAsset({ environmentUrl, scene, loaderOptions = {} }) {
  // ── Validate ──────────────────────────────────────────────
  const validation = validateEnvironmentUrl(environmentUrl);
  if (!validation.valid) {
    throw new Error(`SceneLoader: invalid environment URL — ${validation.reason}`);
  }

  const { timeoutMs = 30000, dracoPath = null } = loaderOptions;

  // ── Dynamically import Three.js loader dependencies ───────
  const THREE = await import('three');
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

  let loader;

  if (dracoPath) {
    try {
      const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
      const draco = new DRACOLoader();
      draco.setDecoderPath(dracoPath);
      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(draco);
      loader = gltfLoader;
    } catch (_) {
      loader = new GLTFLoader();
    }
  } else {
    loader = new GLTFLoader();
  }

  // ── Load with timeout ─────────────────────────────────────
  const gltf = await Promise.race([
    new Promise((resolve, reject) => {
      loader.load(environmentUrl, resolve, undefined, reject);
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`SceneLoader: load timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);

  const root = gltf.scene;

  // ── Extract meshes + materials ────────────────────────────
  const meshes    = [];
  const materials = [];
  const matSet    = new Set();

  root.traverse(node => {
    if (node.isMesh) {
      meshes.push(node);
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      for (const m of mats) {
        if (m && !matSet.has(m.uuid)) {
          matSet.add(m.uuid);
          materials.push(m);
        }
      }
    }
  });

  // ── Optionally add to scene ───────────────────────────────
  if (scene) {
    scene.add(root);
  }

  // ── Build metadata ────────────────────────────────────────
  const metadata = {
    meshCount:     meshes.length,
    materialCount: materials.length,
    animations:    (gltf.animations || []).map(a => a.name),
    userData:      root.userData || {},
    sourceUrl:     environmentUrl,
  };

  return { root, meshes, materials, metadata };
}

export default { loadEnvironmentAsset, validateEnvironmentUrl };