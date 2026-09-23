/**
 * Scene Normalization Utility
 * Automatically scales and centers uploaded environments to fit viewport
 */

export function normalizeSceneToViewport(sceneModel, THREE, options = {}) {
  const {
    targetMaxSize = 10,
    floorAtZero = true,
    centerHorizontally = true,
    customScale = null
  } = options;

  // Compute initial bounding box
  const box = new THREE.Box3().setFromObject(sceneModel);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Calculate scale to fit target size
  const maxDim = Math.max(size.x, size.y, size.z);
  let scale;
  
  if (customScale !== null && customScale !== undefined) {
    scale = customScale;
  } else {
    // Auto-fit: environment fills targetMaxSize units on its longest axis
    scale = targetMaxSize / maxDim;
  }

  // Apply uniform scaling
  sceneModel.scale.setScalar(scale);

  // Recalculate bounds after scaling
  box.setFromObject(sceneModel);
  const scaledCenter = box.getCenter(new THREE.Vector3());

  // Center horizontally
  if (centerHorizontally) {
    sceneModel.position.x = -scaledCenter.x;
    sceneModel.position.z = -scaledCenter.z;
  }

  // Place floor at y=0
  if (floorAtZero) {
    sceneModel.position.y = -box.min.y;
  }

  console.log(`✅ Scene normalized: scale=${scale.toFixed(4)}, size=${maxDim.toFixed(2)} → ${(maxDim * scale).toFixed(2)}`);

  return {
    originalSize: size,
    scaledSize: box.getSize(new THREE.Vector3()),
    scale: scale,
    center: scaledCenter
  };
}

export function extractCollisionMeshes(sceneModel) {
  const colliders = [];
  
  sceneModel.traverse(child => {
    if (child.isMesh) {
      child.userData.isCollider = true;
      colliders.push(child);
    }
  });

  return colliders;
}

export function validateSceneComplexity(sceneModel) {
  let totalVertices = 0;
  let meshCount = 0;

  sceneModel.traverse(child => {
    if (child.isMesh && child.geometry) {
      if (child.geometry.attributes.position) {
        totalVertices += child.geometry.attributes.position.count;
      }
      meshCount++;
    }
  });

  const warnings = [];

  if (totalVertices > 500000) {
    warnings.push(`High vertex count: ${totalVertices.toLocaleString()} vertices. May impact performance.`);
  }

  if (meshCount > 1000) {
    warnings.push(`High mesh count: ${meshCount} meshes. Consider optimizing.`);
  }

  return {
    totalVertices,
    meshCount,
    warnings,
    isValid: warnings.length === 0
  };
}