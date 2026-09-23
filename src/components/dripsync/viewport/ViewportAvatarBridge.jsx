/**
 * ViewportAvatarBridge — avatar attach/detach from the Three.js scene.
 *
 * Ownership boundary:
 *  - Does NOT load GLB files.
 *  - Does NOT create AnimationStateMachine instances.
 *  - Only attaches a pre-loaded model to the scene and handles cleanup.
 */
import { disposeThreeObject } from './ViewportCleanup.jsx';

/**
 * Attach an avatar model to the scene with centering + shadow setup.
 * Uses a double-attach guard so calling this twice is safe.
 *
 * @param {object} THREE
 * @param {THREE.Scene} scene
 * @param {THREE.Object3D} model  — already-loaded GLB scene
 * @param {React.MutableRefObject} modelRef
 */
export function attachAvatarToScene(THREE, scene, model, modelRef) {
  const box    = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.y  = -box.min.y;
  model.position.x  = -center.x;
  model.position.z  = -center.z;
  model.traverse((child) => {
    if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
  });

  // double-attach guard
  if (!scene.children.includes(model)) scene.add(model);
  modelRef.current = model;
}

/**
 * Remove the current avatar from the scene and dispose GPU resources.
 *
 * @param {THREE.Scene} scene
 * @param {React.MutableRefObject} modelRef
 * @param {React.MutableRefObject} mixerRef
 * @param {React.MutableRefObject} stateMachineRef
 * @param {React.MutableRefObject} wearableObjectsMapRef
 */
export function removeAvatarFromScene(scene, modelRef, mixerRef, stateMachineRef, wearableObjectsMapRef) {
  const model = modelRef.current;
  if (!scene || !model) return;

  if (mixerRef.current) {
    mixerRef.current.stopAllAction();
    mixerRef.current.uncacheRoot(model);
    mixerRef.current = null;
  }

  scene.remove(model);
  disposeThreeObject(model);
  modelRef.current       = null;
  stateMachineRef.current = null;
  if (wearableObjectsMapRef) wearableObjectsMapRef.current.clear();
}

/**
 * Ensure the avatar model is still attached to the scene (anti-vanish guard).
 *
 * @param {THREE.Scene} scene
 * @param {THREE.Object3D|null} model
 */
export function ensureAvatarAttached(scene, model) {
  if (!scene || !model) return;
  if (!scene.children.includes(model)) scene.add(model);
  model.visible = true;
}