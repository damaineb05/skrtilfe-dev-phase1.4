/**
 * ViewportCleanup — GPU resource disposal utilities.
 * Pure functions, no React, no Three imports (passed in as objects).
 */

/**
 * Recursively disposes geometry, materials, and textures from a Three.js object.
 * @param {THREE.Object3D} obj
 */
export function disposeThreeObject(obj) {
  if (!obj) return;
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        if (m.map) m.map.dispose();
        if (m.normalMap) m.normalMap.dispose();
        if (m.roughnessMap) m.roughnessMap.dispose();
        if (m.metalnessMap) m.metalnessMap.dispose();
        m.dispose();
      });
    }
  });
}