/**
 * Engine — Wearable Auto Binding
 * Re-export from canonical location for clean import paths.
 * Engine owns avatar lifecycle, wearable binding, animation state, and avatar config.
 */
export {
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
  default,
} from '../WearableAutoBinding';