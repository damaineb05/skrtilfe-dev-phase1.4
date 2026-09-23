/**
 * GLB Validation Utility for Wearable Assets
 * 
 * Validates GLB files for:
 * - Non-power-of-two (NPOT) textures
 * - Material count limits
 * - Skeleton/rig existence
 * - Triangle/polycount
 * - File size limits
 */

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Validation thresholds
export const VALIDATION_LIMITS = {
  // Triangle counts by category
  triangles: {
    upper: 15000,
    lower: 12000,
    footwear: 8000,
    headwear: 10000,
    accessory: 5000,
    full_outfit: 25000,
    eyewear: 3000,
    gloves: 6000,
    jewelry: 4000,
    hair: 12000,
  },
  // Material count
  maxMaterials: 4,
  // File size (bytes)
  maxFileSize: 10 * 1024 * 1024, // 10MB
  // Texture size
  maxTextureSize: 2048,
  recommendedTextureSizes: [256, 512, 1024, 2048],
};

/**
 * Check if a number is power of two
 */
export function isPowerOfTwo(value) {
  return (value & (value - 1)) === 0 && value !== 0;
}

/**
 * Analyze GLB file and return validation results
 * @param {File|Blob} file - The GLB file to validate
 * @param {string} category - The wearable category (upper, lower, etc.)
 * @returns {Promise<ValidationResult>}
 */
export async function validateGLB(file, category = 'accessory') {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
    info: {},
  };

  // 1. File size check
  if (file.size > VALIDATION_LIMITS.maxFileSize) {
    result.errors.push(
      `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds limit of ${VALIDATION_LIMITS.maxFileSize / 1024 / 1024}MB`
    );
    result.valid = false;
  }

  result.info.fileSize = file.size;
  result.info.fileSizeMB = (file.size / 1024 / 1024).toFixed(2);

  try {
    // 2. Load and parse GLB
    const gltf = await loadGLB(file);
    
    // 3. Check for skeleton/rig
    const hasSkeleton = checkForSkeleton(gltf);
    if (!hasSkeleton.found) {
      result.warnings.push('No skeleton/armature detected. This may not work as a wearable.');
    }
    result.info.hasSkeleton = hasSkeleton.found;
    result.info.boneCount = hasSkeleton.boneCount;

    // 4. Count triangles
    const triangleCount = countTriangles(gltf);
    const triangleLimit = VALIDATION_LIMITS.triangles[category] || VALIDATION_LIMITS.triangles.accessory;
    
    if (triangleCount > triangleLimit) {
      result.errors.push(
        `Triangle count ${triangleCount.toLocaleString()} exceeds limit of ${triangleLimit.toLocaleString()} for category "${category}"`
      );
      result.valid = false;
    }
    
    result.info.triangleCount = triangleCount;
    result.info.triangleLimit = triangleLimit;

    // 5. Analyze materials
    const materials = analyzeMaterials(gltf);
    
    if (materials.count > VALIDATION_LIMITS.maxMaterials) {
      result.warnings.push(
        `Material count ${materials.count} exceeds recommended limit of ${VALIDATION_LIMITS.maxMaterials}`
      );
    }
    
    result.info.materialCount = materials.count;
    result.info.materials = materials.details;

    // 6. Check textures
    const textures = analyzeTextures(gltf);
    
    // Check for NPOT textures
    const npotTextures = textures.filter(t => !t.isPowerOfTwo);
    if (npotTextures.length > 0) {
      result.errors.push(
        `Found ${npotTextures.length} non-power-of-two (NPOT) texture(s). All textures must be POT (e.g., 512, 1024, 2048).`
      );
      result.valid = false;
      result.info.npotTextures = npotTextures.map(t => ({
        name: t.name,
        size: `${t.width}x${t.height}`,
      }));
    }

    // Check for oversized textures
    const oversizedTextures = textures.filter(
      t => t.width > VALIDATION_LIMITS.maxTextureSize || t.height > VALIDATION_LIMITS.maxTextureSize
    );
    if (oversizedTextures.length > 0) {
      result.warnings.push(
        `Found ${oversizedTextures.length} texture(s) larger than ${VALIDATION_LIMITS.maxTextureSize}px. Consider downsizing for performance.`
      );
      result.info.oversizedTextures = oversizedTextures.map(t => ({
        name: t.name,
        size: `${t.width}x${t.height}`,
      }));
    }

    result.info.textureCount = textures.length;
    result.info.textures = textures.map(t => ({
      name: t.name,
      size: `${t.width}x${t.height}`,
      isPowerOfTwo: t.isPowerOfTwo,
    }));

    // 7. Check mesh structure
    const meshInfo = analyzeMeshes(gltf);
    result.info.meshCount = meshInfo.count;
    result.info.vertexCount = meshInfo.vertexCount;

    // 8. Check for LODs
    const hasLODs = checkForLODs(gltf);
    if (!hasLODs) {
      result.info.hasLODs = false;
      result.warnings.push('No LOD (Level of Detail) groups detected. Consider adding LODs for better performance.');
    } else {
      result.info.hasLODs = true;
    }

    // 9. Performance score
    result.info.performanceScore = calculatePerformanceScore({
      triangleCount,
      triangleLimit,
      materialCount: materials.count,
      textureCount: textures.length,
      hasNPOT: npotTextures.length > 0,
      hasLODs,
    });

  } catch (error) {
    result.errors.push(`Failed to parse GLB file: ${error.message}`);
    result.valid = false;
    console.error('GLB validation error:', error);
  }

  return result;
}

/**
 * Load GLB file using Three.js GLTFLoader
 */
async function loadGLB(file) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      loader.parse(
        arrayBuffer,
        '',
        (gltf) => resolve(gltf),
        (error) => reject(error)
      );
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Check if the GLB has a skeleton/armature
 */
function checkForSkeleton(gltf) {
  let boneCount = 0;
  
  gltf.scene.traverse((node) => {
    if (node.isBone) {
      boneCount++;
    }
  });

  return {
    found: boneCount > 0,
    boneCount,
  };
}

/**
 * Count total triangles in the GLB
 */
function countTriangles(gltf) {
  let triangleCount = 0;

  gltf.scene.traverse((node) => {
    if (node.isMesh && node.geometry) {
      const geometry = node.geometry;
      if (geometry.index) {
        triangleCount += geometry.index.count / 3;
      } else if (geometry.attributes.position) {
        triangleCount += geometry.attributes.position.count / 3;
      }
    }
  });

  return Math.floor(triangleCount);
}

/**
 * Analyze materials in the GLB
 */
function analyzeMaterials(gltf) {
  const materials = new Set();
  const details = [];

  gltf.scene.traverse((node) => {
    if (node.isMesh && node.material) {
      const material = node.material;
      
      if (Array.isArray(material)) {
        material.forEach(mat => {
          materials.add(mat.uuid);
          details.push({
            name: mat.name || 'Unnamed',
            type: mat.type,
          });
        });
      } else {
        materials.add(material.uuid);
        details.push({
          name: material.name || 'Unnamed',
          type: material.type,
        });
      }
    }
  });

  return {
    count: materials.size,
    details: details.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i), // Dedupe
  };
}

/**
 * Analyze textures in the GLB
 */
function analyzeTextures(gltf) {
  const textures = [];
  const processedTextures = new Set();

  gltf.scene.traverse((node) => {
    if (node.isMesh && node.material) {
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      
      materials.forEach(material => {
        // Check all possible texture maps
        const textureProps = [
          'map', 'normalMap', 'roughnessMap', 'metalnessMap', 
          'aoMap', 'emissiveMap', 'bumpMap', 'alphaMap'
        ];

        textureProps.forEach(prop => {
          const texture = material[prop];
          if (texture && texture.image && !processedTextures.has(texture.uuid)) {
            processedTextures.add(texture.uuid);
            
            const width = texture.image.width || 0;
            const height = texture.image.height || 0;
            
            textures.push({
              name: texture.name || prop,
              width,
              height,
              isPowerOfTwo: isPowerOfTwo(width) && isPowerOfTwo(height),
            });
          }
        });
      });
    }
  });

  return textures;
}

/**
 * Analyze meshes in the GLB
 */
function analyzeMeshes(gltf) {
  let meshCount = 0;
  let vertexCount = 0;

  gltf.scene.traverse((node) => {
    if (node.isMesh && node.geometry) {
      meshCount++;
      if (node.geometry.attributes.position) {
        vertexCount += node.geometry.attributes.position.count;
      }
    }
  });

  return { count: meshCount, vertexCount };
}

/**
 * Check if the GLB has LOD groups
 */
function checkForLODs(gltf) {
  let hasLODs = false;

  gltf.scene.traverse((node) => {
    if (node.isLOD || node.name.toLowerCase().includes('lod')) {
      hasLODs = true;
    }
  });

  return hasLODs;
}

/**
 * Calculate a performance score (0-100)
 */
function calculatePerformanceScore(metrics) {
  let score = 100;

  // Triangle count penalty
  const triangleRatio = metrics.triangleCount / metrics.triangleLimit;
  if (triangleRatio > 1) {
    score -= 30;
  } else if (triangleRatio > 0.8) {
    score -= 15;
  } else if (triangleRatio > 0.6) {
    score -= 5;
  }

  // Material count penalty
  if (metrics.materialCount > VALIDATION_LIMITS.maxMaterials) {
    score -= 10;
  }

  // Texture count penalty
  if (metrics.textureCount > 8) {
    score -= 10;
  } else if (metrics.textureCount > 4) {
    score -= 5;
  }

  // NPOT texture penalty
  if (metrics.hasNPOT) {
    score -= 20;
  }

  // LOD bonus
  if (metrics.hasLODs) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate a human-readable validation summary
 */
export function generateValidationSummary(result) {
  const lines = [];

  if (result.valid) {
    lines.push('✅ **Validation Passed**');
  } else {
    lines.push('❌ **Validation Failed**');
  }

  if (result.errors.length > 0) {
    lines.push('\n**Errors:**');
    result.errors.forEach(err => lines.push(`  • ${err}`));
  }

  if (result.warnings.length > 0) {
    lines.push('\n**Warnings:**');
    result.warnings.forEach(warn => lines.push(`  • ${warn}`));
  }

  lines.push('\n**Asset Info:**');
  lines.push(`  • File Size: ${result.info.fileSizeMB}MB`);
  lines.push(`  • Triangles: ${result.info.triangleCount?.toLocaleString() || 'N/A'}`);
  lines.push(`  • Materials: ${result.info.materialCount || 'N/A'}`);
  lines.push(`  • Textures: ${result.info.textureCount || 'N/A'}`);
  lines.push(`  • Has Skeleton: ${result.info.hasSkeleton ? 'Yes' : 'No'}`);
  lines.push(`  • Performance Score: ${result.info.performanceScore || 'N/A'}/100`);

  return lines.join('\n');
}