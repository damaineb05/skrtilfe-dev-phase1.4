/**
 * ViewportEnvironmentBridge — environment GLB attach/remove from scene.
 *
 * Handles:
 *  - loading a user-provided environment URL
 *  - Sketchfab URL rewriting
 *  - scene normalisation + collision extraction
 *  - currentBackground (3d-environment type)
 *  - removing old environment when null
 */
import { disposeThreeObject } from './ViewportCleanup.jsx';
import { normalizeSceneToViewport, extractCollisionMeshes, validateSceneComplexity } from '../sceneNormalizer';

/**
 * Rewrite a Sketchfab model page URL to the API download endpoint.
 * @param {string} url
 * @returns {string}
 */
export function resolveSketchfabUrl(url) {
  if (!url.includes('sketchfab.com')) return url;
  const modelId = url.match(/models\/([a-zA-Z0-9]+)/)?.[1];
  if (modelId) return `https://api.sketchfab.com/v3/models/${modelId}/download`;
  console.warn('⚠️ Could not extract Sketchfab model ID from URL');
  return url;
}

/**
 * Remove the currently-loaded environment from the scene.
 * @param {THREE.Scene} scene
 * @param {React.MutableRefObject} environmentObjectRef
 * @param {React.MutableRefObject} lastEnvironmentRef
 * @param {React.MutableRefObject} colliderMeshesRef
 * @param {React.MutableRefObject} collisionSystemRef
 */
export function clearEnvironment(scene, environmentObjectRef, lastEnvironmentRef, colliderMeshesRef, collisionSystemRef) {
  if (scene && environmentObjectRef.current) {
    scene.remove(environmentObjectRef.current);
    disposeThreeObject(environmentObjectRef.current);
    environmentObjectRef.current = null;
  }
  lastEnvironmentRef.current = null;
  colliderMeshesRef.current  = [];
  if (collisionSystemRef.current) collisionSystemRef.current.updateColliders([]);
}

/**
 * Load and attach an environment GLB to the scene.
 * Resolves Sketchfab URLs, normalises scale, enables shadows, extracts colliders.
 *
 * @param {object} params
 * @returns {Promise<void>}
 */
export async function loadAndAttachEnvironment({
  finalUrl,
  environment,
  THREE,
  GLTFLoader,
  scene,
  environmentObjectRef,
  lastEnvironmentRef,
  colliderMeshesRef,
  collisionSystemRef,
  modelRef,
  velocityRef,
  onGroundRef,
  cameraRef,
  controlsRef,
  envUrl,
}) {
  // Remove old
  if (environmentObjectRef.current) {
    scene.remove(environmentObjectRef.current);
    disposeThreeObject(environmentObjectRef.current);
    environmentObjectRef.current = null;
  }

  const loader   = new GLTFLoader();
  const envGltf  = await Promise.race([
    loader.loadAsync(finalUrl),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Load timeout after 30s')), 30000)),
  ]);

  const envScene       = envGltf.scene;
  const customScale    = environment?.config?.scale    || 1;
  const customRotation = environment?.config?.rotationY || 0;

  const validation = validateSceneComplexity(envScene);
  if (validation.warnings.length > 0) console.warn('⚠️ Scene warnings:', validation.warnings);

  const targetMaxSize = environment?.config?.targetMaxSize || 20;
  normalizeSceneToViewport(envScene, THREE, {
    targetMaxSize,
    floorAtZero: true,
    centerHorizontally: true,
    customScale: customScale !== 1 ? customScale : null,
  });
  envScene.rotation.y = (customRotation * Math.PI) / 180;

  const enableShadows    = environment?.config?.enableShadows    !== false;
  const enableCollisions = environment?.config?.enableCollisions !== false;

  envScene.traverse((child) => {
    if (child.isMesh) { child.castShadow = enableShadows; child.receiveShadow = enableShadows; }
  });

  if (enableCollisions) {
    colliderMeshesRef.current = extractCollisionMeshes(envScene);
  }

  scene.add(envScene);
  environmentObjectRef.current = envScene;
  lastEnvironmentRef.current   = envUrl;

  if (collisionSystemRef.current && enableCollisions) {
    collisionSystemRef.current.updateColliders(colliderMeshesRef.current);

    let lowestY = Infinity;
    envScene.traverse((child) => {
      if (child.isMesh) {
        const bbox = new THREE.Box3().setFromObject(child);
        if (bbox.min.y < lowestY) lowestY = bbox.min.y;
      }
    });
    const groundLevel = lowestY !== Infinity ? lowestY : 0;
    collisionSystemRef.current.setGroundLevel(groundLevel);

    if (modelRef.current && groundLevel !== Infinity) {
      modelRef.current.position.y = groundLevel;
      if (velocityRef.current) velocityRef.current.y = 0;
      onGroundRef.current = true;
    }
  }

  // Recenter camera
  if (cameraRef.current) cameraRef.current.position.set(4, 3.5, 6);
  if (controlsRef.current) {
    controlsRef.current.target.set(0, 1.5, 0);
    controlsRef.current.enabled = true;
    controlsRef.current.update();
  }
}

/**
 * Load a currentBackground 3d-environment model (e.g. default stage).
 * Simpler version — no collision, just loads + normalises + attaches.
 */
export async function loadBackgroundEnvironment({
  modelUrl,
  config,
  THREE,
  GLTFLoader,
  scene,
  environmentObjectRef,
  colliderMeshesRef,
  collisionSystemRef,
}) {
  if (environmentObjectRef.current) {
    scene.remove(environmentObjectRef.current);
    disposeThreeObject(environmentObjectRef.current);
    environmentObjectRef.current = null;
  }

  const loader  = new GLTFLoader();
  const envGltf = await Promise.race([
    loader.loadAsync(modelUrl),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Load timeout after 30s')), 30000)),
  ]);

  const envScene = envGltf.scene;
  normalizeSceneToViewport(envScene, THREE, {
    targetMaxSize: 30,
    floorAtZero: true,
    centerHorizontally: true,
    customScale: config?.scale || 1,
  });

  envScene.traverse((child) => {
    if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
  });

  scene.add(envScene);
  environmentObjectRef.current = envScene;

  colliderMeshesRef.current = extractCollisionMeshes(envScene);
  if (collisionSystemRef.current) collisionSystemRef.current.updateColliders(colliderMeshesRef.current);
}