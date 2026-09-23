/**
 * Captures a thumbnail from the DripSync viewport canvas
 */
export async function captureAvatarThumbnail() {
  try {
    const canvasEl = document.querySelector('canvas');
    if (canvasEl) {
      return canvasEl.toDataURL('image/png');
    }
  } catch (err) {
    console.warn('Failed to capture thumbnail:', err);
  }
  return null;
}