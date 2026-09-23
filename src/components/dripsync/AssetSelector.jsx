/**
 * AssetSelector — Universal asset type mapping for DripSync controls
 * Determines control visibility and targeting based on selected asset type
 */

export const ASSET_TYPES = {
  AVATAR: 'avatar',
  WEARABLE: 'wearable',
  PROP: 'prop',
  ENVIRONMENT: 'environment',
  DECORATIVE_OBJECT: 'decorative_object',
  PREVIEW_ASSET: 'preview_asset',
  MEDIA_SURFACE: 'media_surface',
  VIDEO_SCREEN: 'video_screen',
  AUDIO_OBJECT: 'audio_object',
  LIVESTREAM_PANEL: 'livestream_panel',
};

export const CONTROL_VISIBILITY = {
  // Avatar controls
  [ASSET_TYPES.AVATAR]: {
    movement: true,
    animation: true,
    customization: true,
    wearableAttach: true,
    saveLook: true,
    colorize: true,
    colorPanel: true,
    transform: false,
    gizmo: false,
    lock: false,
    duplicate: false,
    delete: false,
    reset: false,
  },
  // Wearable controls
  [ASSET_TYPES.WEARABLE]: {
    movement: false,
    animation: false,
    customization: false,
    wearableAttach: true,
    saveLook: false,
    colorize: true,
    colorPanel: true,
    transform: true,
    gizmo: true,
    lock: true,
    duplicate: true,
    delete: true,
    reset: true,
  },
  // Prop / decorative object controls
  [ASSET_TYPES.PROP]: {
    movement: false,
    animation: false,
    customization: false,
    wearableAttach: false,
    saveLook: false,
    colorize: false,
    colorPanel: false,
    transform: true,
    gizmo: true,
    lock: true,
    duplicate: true,
    delete: true,
    reset: true,
  },
  [ASSET_TYPES.DECORATIVE_OBJECT]: {
    movement: false,
    animation: false,
    customization: false,
    wearableAttach: false,
    saveLook: false,
    colorize: false,
    colorPanel: false,
    transform: true,
    gizmo: true,
    lock: true,
    duplicate: true,
    delete: true,
    reset: true,
  },
  // Environment controls
  [ASSET_TYPES.ENVIRONMENT]: {
    movement: false,
    animation: false,
    customization: false,
    wearableAttach: false,
    saveLook: false,
    colorize: false,
    colorPanel: false,
    transform: true,
    gizmo: false,
    lock: false,
    duplicate: false,
    delete: false,
    reset: true,
  },
  // Preview asset (floating, not yet attached)
  [ASSET_TYPES.PREVIEW_ASSET]: {
    movement: false,
    animation: false,
    customization: false,
    wearableAttach: true,
    saveLook: false,
    colorize: true,
    colorPanel: true,
    transform: true,
    gizmo: true,
    lock: false,
    duplicate: false,
    delete: true,
    reset: false,
  },
  // Future media assets
  [ASSET_TYPES.MEDIA_SURFACE]: {
    movement: false,
    animation: false,
    customization: false,
    wearableAttach: false,
    saveLook: false,
    colorize: false,
    colorPanel: false,
    transform: true,
    gizmo: true,
    lock: true,
    duplicate: true,
    delete: true,
    reset: true,
  },
  [ASSET_TYPES.VIDEO_SCREEN]: {
    movement: false,
    animation: false,
    customization: false,
    wearableAttach: false,
    saveLook: false,
    colorize: false,
    colorPanel: false,
    transform: true,
    gizmo: true,
    lock: true,
    duplicate: true,
    delete: true,
    reset: true,
  },
  [ASSET_TYPES.AUDIO_OBJECT]: {
    movement: false,
    animation: false,
    customization: false,
    wearableAttach: false,
    saveLook: false,
    colorize: false,
    colorPanel: false,
    transform: true,
    gizmo: true,
    lock: true,
    duplicate: true,
    delete: true,
    reset: true,
  },
  [ASSET_TYPES.LIVESTREAM_PANEL]: {
    movement: false,
    animation: false,
    customization: false,
    wearableAttach: false,
    saveLook: false,
    colorize: false,
    colorPanel: false,
    transform: true,
    gizmo: true,
    lock: true,
    duplicate: true,
    delete: true,
    reset: true,
  },
};

/**
 * Get control visibility for a given asset type
 */
export const getControlsForAsset = (assetType) => {
  return CONTROL_VISIBILITY[assetType] || {
    movement: false,
    animation: false,
    customization: false,
    wearableAttach: false,
    saveLook: false,
    colorize: false,
    transform: false,
    gizmo: false,
    lock: false,
    duplicate: false,
    delete: false,
    reset: false,
  };
};

/**
 * Determine asset type label for display
 */
export const getAssetTypeLabel = (assetType) => {
  const labels = {
    [ASSET_TYPES.AVATAR]: 'Avatar',
    [ASSET_TYPES.WEARABLE]: 'Wearable',
    [ASSET_TYPES.PROP]: 'Prop',
    [ASSET_TYPES.ENVIRONMENT]: 'Environment',
    [ASSET_TYPES.DECORATIVE_OBJECT]: 'Object',
    [ASSET_TYPES.PREVIEW_ASSET]: 'Preview',
    [ASSET_TYPES.MEDIA_SURFACE]: 'Media Surface',
    [ASSET_TYPES.VIDEO_SCREEN]: 'Video Screen',
    [ASSET_TYPES.AUDIO_OBJECT]: 'Audio Object',
    [ASSET_TYPES.LIVESTREAM_PANEL]: 'Livestream Panel',
  };
  return labels[assetType] || 'Asset';
};

/**
 * Color zones for avatar/wearable targeting
 */
export const COLOR_ZONES = {
  SKIN: 'skin',
  HAIR: 'hair',
  EYES: 'eyes',
  SHOES: 'shoes',
  TOP: 'top_outfit',
  BOTTOM: 'bottom_outfit',
  ACCESSORY: 'accessories',
};