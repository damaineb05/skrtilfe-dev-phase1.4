/**
 * AvatarLoader
 * ─────────────────────────────────────────────────────────────
 * Handles avatar asset loading only.
 * Accepts a model URL + optional Three.js scene, returns a
 * normalized result object.  No engine orchestration here.
 *
 * Assumptions (project 3D stack):
 *   - three.js is installed (GLTFLoader via three/examples)
 *   - Avatar models are .glb files (RPM / custom)
 *   - scene parameter is optional; loader works headless if absent
 */

/**
 * Validate a model URL before attempting a network request.
 * @param {string} url
 * @returns {{ ok: boolean, reason?: string }}
 */
export function validateModelUrl(url) {
  if (!url || typeof url !== 'string') {
    return { ok: false, reason: 'Model URL is empty or not a string.' };
  }
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
    return { ok: false, reason: `Model URL does not look valid: "${trimmed}"` };
  }
  return { ok: true };
}

/**
 * Load an avatar GLB model.
 *
 * @param {{
 *   modelUrl:       string,
 *   scene?:         THREE.Scene,
 *   loaderOptions?: { crossOrigin?: string, onProgress?: (event) => void }
 * }} params
 *
 * @returns {Promise<{
 *   root:       THREE.Object3D,
 *   skeleton:   THREE.Skeleton | null,
 *   animations: THREE.AnimationClip[],
 *   metadata:   { modelUrl: string, loadedAt: string, boneCount: number }
 * }>}
 */
export async function loadAvatarModel({ modelUrl, scene = null, loaderOptions = {} }) {
  const validation = validateModelUrl(modelUrl);
  if (!validation.ok) {
    throw new Error(`AvatarLoader: ${validation.reason}`);
  }

  // Lazy-import GLTFLoader so this module doesn't blow up in environments
  // where three.js isn't loaded (e.g. unit tests, server-side).
  let GLTFLoader;
  try {
    const mod = await import('three/examples/jsm/loaders/GLTFLoader.js');
    GLTFLoader = mod.GLTFLoader;
  } catch (_) {
    throw new Error('AvatarLoader: three/examples/jsm/loaders/GLTFLoader.js could not be imported. Ensure three.js is installed.');
  }

  const loader = new GLTFLoader();

  if (loaderOptions.crossOrigin) {
    loader.crossOrigin = loaderOptions.crossOrigin;
  }

  const gltf = await new Promise((resolve, reject) => {
    loader.load(
      modelUrl,
      resolve,
      loaderOptions.onProgress || undefined,
      (err) => reject(new Error(`AvatarLoader: Failed to load model at "${modelUrl}". ${err?.message || err}`))
    );
  });

  const root = gltf.scene;

  // Optionally add to scene immediately
  if (scene) {
    scene.add(root);
  }

  // Extract skeleton from the first SkinnedMesh found
  let skeleton = null;
  root.traverse((node) => {
    if (!skeleton && node.isSkinnedMesh && node.skeleton) {
      skeleton = node.skeleton;
    }
  });

  const animations = gltf.animations || [];
  const boneCount  = skeleton?.bones?.length ?? 0;

  return {
    root,
    skeleton,
    animations,
    metadata: {
      modelUrl,
      loadedAt:  new Date().toISOString(),
      boneCount,
    },
  };
}

export default { loadAvatarModel, validateModelUrl };