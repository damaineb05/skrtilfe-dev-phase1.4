/**
 * WearableAutoBinding
 * ─────────────────────────────────────────────────────────────────
 * Engine owns avatar lifecycle, wearable binding, animation state, and avatar config.
 *
 * Clean import path:  @/components/dripsync/engine/WearableAutoBinding
 * ─────────────────────────────────────────────────────────────────
 * Automatic wearable-to-armature binding system.
 * Detects bones, retargets animations, and syncs transforms.
 */

// Standard bone name mappings for different armature conventions
const BONE_MAPPINGS = {
  // Mixamo to RPM/Standard
  'mixamorig:Hips': 'Hips',
  'mixamorig:Spine': 'Spine',
  'mixamorig:Spine1': 'Spine1',
  'mixamorig:Spine2': 'Spine2',
  'mixamorig:Neck': 'Neck',
  'mixamorig:Head': 'Head',
  'mixamorig:LeftShoulder': 'LeftShoulder',
  'mixamorig:LeftArm': 'LeftArm',
  'mixamorig:LeftForeArm': 'LeftForeArm',
  'mixamorig:LeftHand': 'LeftHand',
  'mixamorig:RightShoulder': 'RightShoulder',
  'mixamorig:RightArm': 'RightArm',
  'mixamorig:RightForeArm': 'RightForeArm',
  'mixamorig:RightHand': 'RightHand',
  'mixamorig:LeftUpLeg': 'LeftUpLeg',
  'mixamorig:LeftLeg': 'LeftLeg',
  'mixamorig:LeftFoot': 'LeftFoot',
  'mixamorig:LeftToeBase': 'LeftToeBase',
  'mixamorig:RightUpLeg': 'RightUpLeg',
  'mixamorig:RightLeg': 'RightLeg',
  'mixamorig:RightFoot': 'RightFoot',
  'mixamorig:RightToeBase': 'RightToeBase',
  
  // Common variations
  'Armature|Hips': 'Hips',
  'Armature|Spine': 'Spine',
  'Armature|Head': 'Head',
  'root': 'Hips',
  'pelvis': 'Hips',
  'spine_01': 'Spine',
  'spine_02': 'Spine1',
  'spine_03': 'Spine2',
  'neck_01': 'Neck',
  'head': 'Head',
  'clavicle_l': 'LeftShoulder',
  'upperarm_l': 'LeftArm',
  'lowerarm_l': 'LeftForeArm',
  'hand_l': 'LeftHand',
  'clavicle_r': 'RightShoulder',
  'upperarm_r': 'RightArm',
  'lowerarm_r': 'RightForeArm',
  'hand_r': 'RightHand',
  'thigh_l': 'LeftUpLeg',
  'calf_l': 'LeftLeg',
  'foot_l': 'LeftFoot',
  'thigh_r': 'RightUpLeg',
  'calf_r': 'RightLeg',
  'foot_r': 'RightFoot',
};

// Wearable slot to bone defaults
const SLOT_BONE_DEFAULTS = {
  headwear: 'Head',
  eyewear: 'Head',
  facewear: 'Head',
  earring: 'Head',
  neckwear: 'Neck',
  top: 'Spine1',
  outerwear: 'Spine',
  wristwear: 'LeftHand',
  handwear: 'LeftHand',
  bottom: 'Hips',
  footwear: 'LeftFoot',
  accessory: 'Spine',
  backpack: 'Spine2',
  belt: 'Hips',
  gloves: 'LeftHand',
  jewelry: 'Neck',
  bag: 'RightHand',
  weapon: 'RightHand',
  shield: 'LeftHand',
  wings: 'Spine2',
  tail: 'Hips',
};

/**
 * Normalize bone name to standard format
 */
export function normalizeBoneName(boneName) {
  if (!boneName) return null;
  
  // Direct mapping
  if (BONE_MAPPINGS[boneName]) {
    return BONE_MAPPINGS[boneName];
  }
  
  // Case-insensitive search
  const lowerName = boneName.toLowerCase();
  for (const [key, value] of Object.entries(BONE_MAPPINGS)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  
  // Partial match for common patterns
  if (lowerName.includes('head')) return 'Head';
  if (lowerName.includes('neck')) return 'Neck';
  if (lowerName.includes('spine')) {
    if (lowerName.includes('2') || lowerName.includes('upper')) return 'Spine2';
    if (lowerName.includes('1') || lowerName.includes('mid')) return 'Spine1';
    return 'Spine';
  }
  if (lowerName.includes('hip') || lowerName.includes('pelvis')) return 'Hips';
  if (lowerName.includes('shoulder') && lowerName.includes('left')) return 'LeftShoulder';
  if (lowerName.includes('shoulder') && lowerName.includes('right')) return 'RightShoulder';
  if (lowerName.includes('arm') && lowerName.includes('left')) {
    if (lowerName.includes('fore') || lowerName.includes('lower')) return 'LeftForeArm';
    return 'LeftArm';
  }
  if (lowerName.includes('arm') && lowerName.includes('right')) {
    if (lowerName.includes('fore') || lowerName.includes('lower')) return 'RightForeArm';
    return 'RightArm';
  }
  if (lowerName.includes('hand') && lowerName.includes('left')) return 'LeftHand';
  if (lowerName.includes('hand') && lowerName.includes('right')) return 'RightHand';
  if (lowerName.includes('leg') && lowerName.includes('left')) {
    if (lowerName.includes('up') || lowerName.includes('thigh')) return 'LeftUpLeg';
    return 'LeftLeg';
  }
  if (lowerName.includes('leg') && lowerName.includes('right')) {
    if (lowerName.includes('up') || lowerName.includes('thigh')) return 'RightUpLeg';
    return 'RightLeg';
  }
  if (lowerName.includes('foot') && lowerName.includes('left')) return 'LeftFoot';
  if (lowerName.includes('foot') && lowerName.includes('right')) return 'RightFoot';
  
  return boneName; // Return original if no match
}

/**
 * Get bone from avatar skeleton
 */
export function findBoneInSkeleton(skeleton, boneName) {
  if (!skeleton || !boneName) return null;
  
  // Normalize the target name
  const normalizedTarget = normalizeBoneName(boneName);
  
  // Search through skeleton bones
  let foundBone = null;
  
  skeleton.traverse((child) => {
    if (foundBone) return;
    
    if (child.isBone || child.type === 'Bone') {
      const normalizedChildName = normalizeBoneName(child.name);
      
      // Exact match
      if (child.name === boneName || normalizedChildName === normalizedTarget) {
        foundBone = child;
        return;
      }
      
      // Case-insensitive match
      if (child.name.toLowerCase() === boneName.toLowerCase()) {
        foundBone = child;
        return;
      }
    }
  });
  
  return foundBone;
}

/**
 * Extract skeleton from avatar model
 */
export function extractSkeleton(model) {
  if (!model) return null;
  
  let skeleton = null;
  
  model.traverse((child) => {
    if (skeleton) return;
    
    // Check for SkinnedMesh with skeleton
    if (child.isSkinnedMesh && child.skeleton) {
      skeleton = child.skeleton;
      return;
    }
    
    // Check for bone root
    if ((child.isBone || child.type === 'Bone') && !skeleton) {
      // Find root bone
      let root = child;
      while (root.parent && (root.parent.isBone || root.parent.type === 'Bone')) {
        root = root.parent;
      }
      skeleton = root;
    }
  });
  
  return skeleton;
}

/**
 * Detect if wearable has its own skeleton
 */
export function detectWearableSkeleton(wearableScene) {
  let hasSkeleton = false;
  let skeletonRoot = null;
  const bones = [];
  
  wearableScene.traverse((child) => {
    if (child.isBone || child.type === 'Bone') {
      hasSkeleton = true;
      bones.push(child.name);
      
      if (!skeletonRoot) {
        let root = child;
        while (root.parent && (root.parent.isBone || root.parent.type === 'Bone')) {
          root = root.parent;
        }
        skeletonRoot = root;
      }
    }
    
    if (child.isSkinnedMesh) {
      hasSkeleton = true;
    }
  });
  
  return {
    hasSkeleton,
    skeletonRoot,
    boneNames: bones,
    boneCount: bones.length
  };
}

/**
 * Auto-detect appropriate bone for wearable based on its geometry
 */
export function autoDetectAttachmentBone(wearableScene, THREE) {
  if (!wearableScene || !THREE) return 'Spine';
  
  // Calculate bounding box
  const box = new THREE.Box3().setFromObject(wearableScene);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  
  // Analyze position and size to guess attachment point
  // Assuming avatar is roughly 1.8m tall, centered at origin
  
  const relativeY = center.y;
  const aspectRatio = size.x / (size.y || 0.01);
  
  // Head region (above 1.5m for 1.8m avatar)
  if (relativeY > 0.8) {
    if (aspectRatio > 2) return 'Head'; // Wide = glasses/headband
    if (size.y > 0.3) return 'Head'; // Tall = hat
    return 'Head';
  }
  
  // Shoulder/neck region (1.3-1.5m)
  if (relativeY > 0.7 && relativeY <= 0.8) {
    if (size.x > 0.5) return 'Spine2'; // Wide = cape/backpack
    return 'Neck';
  }
  
  // Torso region (0.8-1.3m)
  if (relativeY > 0.4 && relativeY <= 0.7) {
    if (size.y > 0.4) return 'Spine1'; // Long = shirt/jacket
    return 'Spine';
  }
  
  // Hip/waist region (0.6-0.8m)
  if (relativeY > 0.3 && relativeY <= 0.4) {
    return 'Hips';
  }
  
  // Leg region (0.2-0.6m)
  if (relativeY > 0.1 && relativeY <= 0.3) {
    if (center.x < -0.1) return 'LeftUpLeg';
    if (center.x > 0.1) return 'RightUpLeg';
    return 'Hips';
  }
  
  // Foot region (below 0.2m)
  if (relativeY <= 0.1) {
    if (center.x < -0.05) return 'LeftFoot';
    if (center.x > 0.05) return 'RightFoot';
    return 'LeftFoot';
  }
  
  return 'Spine'; // Default fallback
}

/**
 * Bind wearable skeleton to avatar skeleton
 */
export function bindWearableToAvatarSkeleton(wearableScene, avatarModel, THREE) {
  if (!wearableScene || !avatarModel || !THREE) {
    console.warn('Missing required parameters for skeleton binding');
    return { success: false, error: 'Missing parameters' };
  }
  
  const wearableInfo = detectWearableSkeleton(wearableScene);
  const avatarSkeleton = extractSkeleton(avatarModel);
  
  if (!avatarSkeleton) {
    console.warn('Could not find avatar skeleton');
    return { success: false, error: 'No avatar skeleton found' };
  }
  
  console.log('🔗 Binding wearable to avatar armature...');
  console.log(`  Wearable has skeleton: ${wearableInfo.hasSkeleton}`);
  console.log(`  Wearable bones: ${wearableInfo.boneCount}`);
  
  const boundBones = [];
  const failedBones = [];
  
  if (wearableInfo.hasSkeleton && wearableInfo.boneCount > 0) {
    // Full skeleton binding - bind each wearable bone to corresponding avatar bone
    wearableScene.traverse((child) => {
      if (child.isSkinnedMesh && child.skeleton) {
        const wearableSkeleton = child.skeleton;
        
        // Map wearable bones to avatar bones
        wearableSkeleton.bones.forEach((wearableBone, index) => {
          const normalizedName = normalizeBoneName(wearableBone.name);
          const avatarBone = findBoneInSkeleton(avatarModel, normalizedName);
          
          if (avatarBone) {
            // Create a bone binding by making wearable bone follow avatar bone
            wearableBone.userData.boundToAvatarBone = avatarBone;
            wearableBone.userData.originalMatrix = wearableBone.matrix.clone();
            boundBones.push({ wearable: wearableBone.name, avatar: avatarBone.name });
          } else {
            failedBones.push(wearableBone.name);
          }
        });
        
        // Update skeleton with new bone references
        child.skeleton.update();
      }
    });
  } else {
    // Simple attachment - no skeleton, just parent to appropriate bone
    const attachBone = autoDetectAttachmentBone(wearableScene, THREE);
    const avatarBone = findBoneInSkeleton(avatarModel, attachBone);
    
    if (avatarBone) {
      // Store original parent for cleanup
      wearableScene.userData.originalParent = wearableScene.parent;
      wearableScene.userData.attachedToBone = avatarBone.name;
      
      // Parent to bone
      avatarBone.add(wearableScene);
      boundBones.push({ wearable: 'root', avatar: avatarBone.name });
    } else {
      return { success: false, error: `Could not find bone: ${attachBone}` };
    }
  }
  
  console.log(`✅ Bound ${boundBones.length} bones successfully`);
  if (failedBones.length > 0) {
    console.warn(`⚠️ Failed to bind ${failedBones.length} bones:`, failedBones);
  }
  
  return {
    success: true,
    boundBones,
    failedBones,
    hasFullSkeleton: wearableInfo.hasSkeleton && wearableInfo.boneCount > 0
  };
}

/**
 * Update wearable transforms to follow avatar animation
 */
export function updateWearableBinding(wearableScene, delta) {
  if (!wearableScene) return;
  
  wearableScene.traverse((child) => {
    if (child.isSkinnedMesh && child.skeleton) {
      child.skeleton.bones.forEach((bone) => {
        const avatarBone = bone.userData.boundToAvatarBone;
        if (avatarBone) {
          // Copy world transform from avatar bone
          bone.position.copy(avatarBone.position);
          bone.quaternion.copy(avatarBone.quaternion);
          bone.scale.copy(avatarBone.scale);
        }
      });
      child.skeleton.update();
    }
  });
}

/**
 * Detach wearable from skeleton
 */
export function detachWearableFromSkeleton(wearableScene, scene) {
  if (!wearableScene) return;
  
  // Clear bone bindings
  wearableScene.traverse((child) => {
    if (child.isSkinnedMesh && child.skeleton) {
      child.skeleton.bones.forEach((bone) => {
        delete bone.userData.boundToAvatarBone;
        delete bone.userData.originalMatrix;
      });
    }
  });
  
  // Restore original parent
  if (wearableScene.userData.originalParent) {
    wearableScene.userData.originalParent.add(wearableScene);
  } else if (scene) {
    scene.add(wearableScene);
  }
  
  delete wearableScene.userData.originalParent;
  delete wearableScene.userData.attachedToBone;
}

/**
 * Get default bone for a wearable slot
 */
export function getDefaultBoneForSlot(slot) {
  return SLOT_BONE_DEFAULTS[slot] || 'Spine';
}

/**
 * Analyze wearable and suggest best configuration
 */
export function analyzeWearable(wearableScene, THREE) {
  if (!wearableScene || !THREE) {
    return { slot: 'accessory', bone: 'Spine', confidence: 0 };
  }
  
  const box = new THREE.Box3().setFromObject(wearableScene);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  
  const skeletonInfo = detectWearableSkeleton(wearableScene);
  const suggestedBone = autoDetectAttachmentBone(wearableScene, THREE);
  
  // Determine slot based on bone
  let suggestedSlot = 'accessory';
  for (const [slot, bone] of Object.entries(SLOT_BONE_DEFAULTS)) {
    if (bone === suggestedBone) {
      suggestedSlot = slot;
      break;
    }
  }
  
  // Calculate confidence based on how well the geometry matches expected proportions
  let confidence = 0.5;
  
  // Higher confidence if it has skeleton that matches avatar structure
  if (skeletonInfo.hasSkeleton && skeletonInfo.boneCount > 10) {
    confidence = 0.9;
  } else if (size.y > 0.1 && size.y < 2) {
    confidence = 0.7;
  }
  
  return {
    slot: suggestedSlot,
    bone: suggestedBone,
    confidence,
    hasSkeleton: skeletonInfo.hasSkeleton,
    boneCount: skeletonInfo.boneCount,
    boundingBox: { center: center.toArray(), size: size.toArray() }
  };
}

export default {
  normalizeBoneName,
  findBoneInSkeleton,
  extractSkeleton,
  detectWearableSkeleton,
  autoDetectAttachmentBone,
  bindWearableToAvatarSkeleton,
  updateWearableBinding,
  detachWearableFromSkeleton,
  getDefaultBoneForSlot,
  analyzeWearable,
  BONE_MAPPINGS,
  SLOT_BONE_DEFAULTS,
};