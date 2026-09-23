/**
 * viewportCapture — Capture current Three.js viewport state as image
 * Used for avatar/look/asset preview thumbnails
 */

export async function captureViewportAsImage(canvas) {
  if (!canvas) {
    console.warn('captureViewportAsImage: canvas not provided');
    return null;
  }

  try {
    // Get canvas data as image
    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    return imageData;
  } catch (e) {
    console.error('Failed to capture viewport:', e);
    return null;
  }
}

export async function captureViewportAsBlob(canvas) {
  return new Promise((resolve, reject) => {
    if (!canvas) {
      resolve(null);
      return;
    }

    try {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.85);
    } catch (e) {
      console.error('Failed to capture viewport blob:', e);
      resolve(null);
    }
  });
}

/**
 * Capture viewport and return metadata snapshot
 */
export function createPreviewMetadata(avatarState) {
  return {
    captured_at: new Date().toISOString(),
    avatar_url: avatarState?.avatar_url,
    wearables_count: avatarState?.wearables?.length || 0,
    customization: avatarState?.customization || {},
    environment: avatarState?.environment?.id || null,
    has_animations: avatarState?.customAnimations?.length > 0 || false,
  };
}