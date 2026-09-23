// Utility functions for avatar appearance customization

// Safe hex color validation
export function safeHex(colorString) {
  if (!colorString) return '#FFFFFF';
  const str = String(colorString).trim();
  if (str.startsWith('#') && (str.length === 4 || str.length === 7)) {
    return str;
  }
  return '#FFFFFF';
}

// Clamp number between min and max
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Clamp between 0 and 1
export function clamp01(value) {
  return clamp(value, 0, 1);
}

// Convert hex to THREE.Color
export function hexToThreeColor(hex, THREE) {
  const sanitized = safeHex(hex);
  return new THREE.Color(sanitized);
}

// HSL to RGB conversion for advanced eye color
export function hslToRgb(h, s, l) {
  h = h / 360; // Convert to 0-1 range
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r, g, b };
}

/**
 * Classify avatar parts by mesh name patterns
 * @param {THREE.Object3D} model - The avatar model
 * @returns {Object} Classified parts
 */
// RPM (Ready Player Me) skin mesh name patterns
const RPM_SKIN_NAMES = [
  'wolf3d_body', 'wolf3d_avatar', 'wolf3d_skin', 'wolf3d_head',
  'avatar', 'body_custom', 'body_1'
];

// Check if a mesh is a skin/flesh mesh (should receive skin tone)
function isSkinMesh(name) {
  // RPM avatars
  if (RPM_SKIN_NAMES.some(s => name.includes(s))) return true;
  // Generic skin keywords
  if (name.includes('skin') || name.includes('flesh')) return true;
  // Body parts that show skin
  if (
    name.includes('body') || name.includes('torso') ||
    name.includes('arm') || name.includes('leg') ||
    name.includes('hand') || name.includes('foot') ||
    name.includes('neck') || name.includes('chest') ||
    name.includes('head') || name.includes('face') ||
    name.includes('skull') || name.includes('spine')
  ) return true;
  return false;
}

export function classifyAvatar(model) {
  const parts = {
    body: [],   // all skin-bearing meshes (body, arms, hands, legs, feet)
    head: [],   // head/face skin meshes
    hair: [],
    eyes: [],
    eyebrows: [],
    facialHair: [],
    teeth: [],
    tongue: [],
    eyelashes: [],
  };

  model.traverse((child) => {
    if (!child.isMesh) return;

    const name = child.name.toLowerCase();

    // Hair detection
    if (name.includes('hair') || name.includes('hairstyle')) {
      parts.hair.push(child);
    }
    // Eye detection
    else if (name.includes('eye') && !name.includes('brow') && !name.includes('lash')) {
      parts.eyes.push(child);
    }
    // Eyebrow detection
    else if (name.includes('brow') || name.includes('eyebrow')) {
      parts.eyebrows.push(child);
    }
    // Facial hair detection
    else if (name.includes('beard') || name.includes('mustache') || name.includes('facial')) {
      parts.facialHair.push(child);
    }
    // Teeth detection
    else if (name.includes('teeth') || name.includes('tooth')) {
      parts.teeth.push(child);
    }
    // Tongue detection
    else if (name.includes('tongue')) {
      parts.tongue.push(child);
    }
    // Eyelash detection
    else if (name.includes('lash') || name.includes('eyelash')) {
      parts.eyelashes.push(child);
    }
    // Head skin mesh
    else if (name.includes('head') || name.includes('face') || name.includes('skull')) {
      parts.head.push(child);
      parts.body.push(child); // also add to body so skin tone applies
    }
    // All other skin-bearing meshes go into body
    else if (isSkinMesh(name)) {
      parts.body.push(child);
    }
  });

  console.log('🔍 Avatar parts classified:', {
    body: parts.body.length,
    head: parts.head.length,
    hair: parts.hair.length,
    eyes: parts.eyes.length,
    eyebrows: parts.eyebrows.length,
    facialHair: parts.facialHair.length,
    teeth: parts.teeth.length,
    tongue: parts.tongue.length,
    eyelashes: parts.eyelashes.length,
  });

  return parts;
}

/**
 * Apply complete customization to avatar
 * @param {THREE.Object3D} model - The avatar model
 * @param {Object} parts - Classified avatar parts
 * @param {Object} config - Customization configuration
 * @param {Object} THREE - Three.js library
 */
export function applyCustomizationToAvatar(model, parts, config, THREE) {
  if (!model || !parts || !config || !THREE) {
    console.warn('Missing parameters for avatar customization');
    return;
  }

  console.log('🎨 Applying customization:', config);

  // === BODY CUSTOMIZATION ===
  
  // Skin tone on body and head
  if (config.skinTone) {
    const skinColor = hexToThreeColor(config.skinTone, THREE);
    [...parts.body, ...parts.head].forEach(mesh => {
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => {
            mat.color.copy(skinColor);
            mat.needsUpdate = true;
          });
        } else {
          mesh.material.color.copy(skinColor);
          mesh.material.needsUpdate = true;
        }
      }
    });
  }

  // Skin finish (matte vs gloss)
  if (config.skinFinish) {
    const roughness = config.skinFinish === 'matte' ? 0.9 : 0.3;
    const metalness = config.skinFinish === 'matte' ? 0.0 : 0.2;
    
    [...parts.body, ...parts.head].forEach(mesh => {
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => {
            if (mat.roughness !== undefined) mat.roughness = roughness;
            if (mat.metalness !== undefined) mat.metalness = metalness;
            mat.needsUpdate = true;
          });
        } else {
          if (mesh.material.roughness !== undefined) mesh.material.roughness = roughness;
          if (mesh.material.metalness !== undefined) mesh.material.metalness = metalness;
          mesh.material.needsUpdate = true;
        }
      }
    });
  }

  // Body proportions
  if (config.headScale !== undefined && config.headScale !== 1) {
    const headBone = model.getObjectByName('Head') || model.getObjectByName('head');
    if (headBone) {
      const scale = clamp(config.headScale, 0.8, 1.2);
      headBone.scale.setScalar(scale);
    }
  }

  if (config.shoulderWidth !== undefined && config.shoulderWidth !== 1) {
    const leftShoulder = model.getObjectByName('LeftShoulder') || model.getObjectByName('leftShoulder');
    const rightShoulder = model.getObjectByName('RightShoulder') || model.getObjectByName('rightShoulder');
    const scale = clamp(config.shoulderWidth, 0.8, 1.2);
    
    if (leftShoulder) leftShoulder.scale.x = scale;
    if (rightShoulder) rightShoulder.scale.x = scale;
  }

  if (config.limbScale !== undefined && config.limbScale !== 1) {
    const scale = clamp(config.limbScale, 0.8, 1.2);
    ['LeftArm', 'RightArm', 'LeftLeg', 'RightLeg'].forEach(boneName => {
      const bone = model.getObjectByName(boneName) || model.getObjectByName(boneName.toLowerCase());
      if (bone) bone.scale.setScalar(scale);
    });
  }

  // === FACE CUSTOMIZATION ===

  // Hair color
  if (config.hairColor && parts.hair.length > 0) {
    const hairColor = hexToThreeColor(config.hairColor, THREE);
    parts.hair.forEach(mesh => {
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => {
            mat.color.copy(hairColor);
            mat.needsUpdate = true;
          });
        } else {
          mesh.material.color.copy(hairColor);
          mesh.material.needsUpdate = true;
        }
      }
    });
  }

  // Eyebrow color
  if (config.eyebrowColor && parts.eyebrows.length > 0) {
    const browColor = hexToThreeColor(config.eyebrowColor, THREE);
    parts.eyebrows.forEach(mesh => {
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => {
            mat.color.copy(browColor);
            mat.needsUpdate = true;
          });
        } else {
          mesh.material.color.copy(browColor);
          mesh.material.needsUpdate = true;
        }
      }
    });
  }

  // Eyebrow thickness
  if (config.eyebrowThickness !== undefined && parts.eyebrows.length > 0) {
    const thickness = clamp01(config.eyebrowThickness);
    const scale = 0.5 + (thickness * 1.0); // 0.5 to 1.5 range
    parts.eyebrows.forEach(mesh => {
      mesh.scale.y = scale;
    });
  }

  // Facial hair color
  if (config.facialHairColor && parts.facialHair.length > 0) {
    const facialColor = hexToThreeColor(config.facialHairColor, THREE);
    parts.facialHair.forEach(mesh => {
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => {
            mat.color.copy(facialColor);
            mat.needsUpdate = true;
          });
        } else {
          mesh.material.color.copy(facialColor);
          mesh.material.needsUpdate = true;
        }
      }
    });
  }

  // Facial hair density (opacity)
  if (config.facialHairDensity !== undefined && parts.facialHair.length > 0) {
    const density = clamp01(config.facialHairDensity);
    parts.facialHair.forEach(mesh => {
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => {
            mat.opacity = density;
            mat.transparent = density < 1;
            mat.needsUpdate = true;
          });
        } else {
          mesh.material.opacity = density;
          mesh.material.transparent = density < 1;
          mesh.material.needsUpdate = true;
        }
      }
    });
  }

  // Facial hair visibility based on style
  if (config.facialHairStyleId !== undefined && parts.facialHair.length > 0) {
    const visible = config.facialHairStyleId !== 'none';
    parts.facialHair.forEach(mesh => {
      mesh.visible = visible;
    });
  }

  // === EYES CUSTOMIZATION ===

  if (parts.eyes.length > 0) {
    // Advanced eye color with HSL
    if (config.irisHue !== undefined || config.irisSaturation !== undefined || config.irisBrightness !== undefined) {
      const hue = config.irisHue ?? 210;
      const sat = config.irisSaturation ?? 0.65;
      const bright = config.irisBrightness ?? 0.55;
      
      const rgb = hslToRgb(hue, sat, bright);
      const eyeColor = new THREE.Color(rgb.r, rgb.g, rgb.b);
      
      parts.eyes.forEach(mesh => {
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => {
              mat.color.copy(eyeColor);
              mat.needsUpdate = true;
            });
          } else {
            mesh.material.color.copy(eyeColor);
            mesh.material.needsUpdate = true;
          }
        }
      });
    }
    // Fallback to simple eye color
    else if (config.eyeColor) {
      const eyeColor = hexToThreeColor(config.eyeColor, THREE);
      parts.eyes.forEach(mesh => {
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => {
              mat.color.copy(eyeColor);
              mat.needsUpdate = true;
            });
          } else {
            mesh.material.color.copy(eyeColor);
            mesh.material.needsUpdate = true;
          }
        }
      });
    }

    // Eye gloss
    if (config.eyeGloss !== undefined) {
      const gloss = clamp01(config.eyeGloss);
      const roughness = 1 - gloss; // Inverse of gloss
      const metalness = gloss * 0.5;
      
      parts.eyes.forEach(mesh => {
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => {
              if (mat.roughness !== undefined) mat.roughness = roughness;
              if (mat.metalness !== undefined) mat.metalness = metalness;
              mat.needsUpdate = true;
            });
          } else {
            if (mesh.material.roughness !== undefined) mesh.material.roughness = roughness;
            if (mesh.material.metalness !== undefined) mesh.material.metalness = metalness;
            mesh.material.needsUpdate = true;
          }
        }
      });
    }

    // Pupil size (scale)
    if (config.pupilSize !== undefined) {
      const scale = 0.5 + (clamp01(config.pupilSize) * 0.8); // 0.5 to 1.3
      parts.eyes.forEach(mesh => {
        const pupilMesh = mesh.children.find(c => c.name.toLowerCase().includes('pupil'));
        if (pupilMesh) {
          pupilMesh.scale.setScalar(scale);
        }
      });
    }
  }

  // === VISIBILITY ===
  
  if (config.isVisible !== undefined) {
    model.visible = config.isVisible;
  }

  // === HEIGHT (Model Scale) ===
  
  if (config.height !== undefined) {
    // Height is handled at parent level, not here
    console.log('Height adjustment requested:', config.height);
  }

  console.log('✅ Customization applied successfully');
}

/**
 * Auto-detect the dominant skin color from the avatar model and apply it
 * uniformly to ALL skin-bearing meshes (head, arms, hands, legs, feet, body).
 * This ensures RPM and other avatars load with consistent skin across all parts.
 */
export function autoUnifySkinTone(model, THREE) {
  if (!model || !THREE) return;

  // Skin mesh name patterns (same as in classifyAvatar)
  const SKIN_KEYWORDS = [
    'skin', 'flesh', 'body', 'torso', 'arm', 'leg', 'hand', 'foot',
    'neck', 'chest', 'head', 'face', 'skull', 'avatar', 'wolf3d_body',
    'wolf3d_avatar', 'wolf3d_head', 'wolf3d_skin'
  ];
  const EXCLUDE = ['hair', 'hairstyle', 'eye', 'brow', 'lash', 'teeth', 'tooth', 'tongue', 'beard', 'mustache', 'outfit', 'shirt', 'pants', 'shoe', 'glasses', 'hat', 'beard', 'glasses', 'top', 'bottom', 'cloth'];

  const skinMeshes = [];

  model.traverse((child) => {
    if (!child.isMesh) return;
    const name = child.name.toLowerCase();
    if (EXCLUDE.some(ex => name.includes(ex))) return;
    if (SKIN_KEYWORDS.some(kw => name.includes(kw))) {
      skinMeshes.push(child);
    }
  });

  if (skinMeshes.length < 2) return; // nothing to unify

  // Find the dominant skin color by sampling from head or body mesh
  let dominantColor = null;
  const preferredPriority = ['head', 'face', 'wolf3d_head', 'body', 'wolf3d_body', 'avatar'];

  // Try preferred meshes first
  for (const keyword of preferredPriority) {
    const mesh = skinMeshes.find(m => m.name.toLowerCase().includes(keyword));
    if (mesh && mesh.material) {
      const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      if (mat && mat.color) {
        dominantColor = mat.color.clone();
        break;
      }
    }
  }

  // Fallback: use first skin mesh
  if (!dominantColor && skinMeshes[0]?.material) {
    const mat = Array.isArray(skinMeshes[0].material) ? skinMeshes[0].material[0] : skinMeshes[0].material;
    if (mat && mat.color) {
      dominantColor = mat.color.clone();
    }
  }

  if (!dominantColor) return;

  // Apply the dominant skin color uniformly to all skin meshes
  skinMeshes.forEach(mesh => {
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach(mat => {
      if (mat && mat.color && !mat.color.equals(dominantColor)) {
        mat.color.copy(dominantColor);
        mat.needsUpdate = true;
      }
    });
  });

  console.log(`🎨 Auto-unified skin tone across ${skinMeshes.length} meshes: #${dominantColor.getHexString()}`);
}

/**
 * Apply real-time customization updates
 * Optimized for frequent updates
 */
export function applyRealtimeCustomization(model, parts, config, THREE) {
  if (!model || !parts || !config || !THREE) return;

  // Only update what changed
  const updates = {};

  // Color updates (most common)
  if (config.skinTone) {
    const skinColor = hexToThreeColor(config.skinTone, THREE);
    [...parts.body, ...parts.head].forEach(mesh => {
      if (mesh.material) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach(mat => {
          if (!mat.color.equals(skinColor)) {
            mat.color.copy(skinColor);
            mat.needsUpdate = true;
          }
        });
      }
    });
  }

  if (config.hairColor && parts.hair.length > 0) {
    const hairColor = hexToThreeColor(config.hairColor, THREE);
    parts.hair.forEach(mesh => {
      if (mesh.material) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach(mat => {
          if (!mat.color.equals(hairColor)) {
            mat.color.copy(hairColor);
            mat.needsUpdate = true;
          }
        });
      }
    });
  }

  if (config.eyeColor && parts.eyes.length > 0) {
    const eyeColor = hexToThreeColor(config.eyeColor, THREE);
    parts.eyes.forEach(mesh => {
      if (mesh.material) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach(mat => {
          if (!mat.color.equals(eyeColor)) {
            mat.color.copy(eyeColor);
            mat.needsUpdate = true;
          }
        });
      }
    });
  }

  // Visibility
  if (config.isVisible !== undefined && model.visible !== config.isVisible) {
    model.visible = config.isVisible;
  }
}