import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

// Inline canvas capture (canvasThumbnailCapture.js removed in cleanup)
async function captureCanvasThumbnail(canvasElement, options = {}) {
  const { format = 'image/jpeg', quality = 0.9 } = options;
  if (!canvasElement) throw new Error('Canvas element not found');
  return canvasElement.toDataURL(format, quality);
}

async function uploadThumbnail(dataUrl, filename = 'thumbnail.jpg') {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  const file = new File([new Blob([u8arr], { type: mime })], filename, { type: 'image/jpeg' });
  const result = await base44.integrations.Core.UploadFile({ file });
  return result.file_url;
}

/**
 * Hook to manage SavePreviewModal lifecycle
 * Handles thumbnail capture, upload, and asset saving
 */
export function useSavePreviewModal(saveAssetFn) {
  const [isOpen, setIsOpen] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [canvasRef, setCanvasRef] = useState(null);
  const [assetType, setAssetType] = useState('look');

  // Capture canvas and show modal
  const openSaveModal = useCallback(
    async (canvas, type = 'look') => {
      if (!canvas) {
        console.warn('Canvas element not provided for save modal');
        return;
      }

      try {
        setAssetType(type);
        setCanvasRef(canvas);

        // Capture canvas to data URL
        const dataUrl = await captureCanvasThumbnail(canvas, {
          width: 512,
          height: 512,
          format: 'image/jpeg',
          quality: 0.85,
        });

        setThumbnailUrl(dataUrl);
        setIsOpen(true);
      } catch (error) {
        console.error('Failed to capture thumbnail:', error);
        throw error;
      }
    },
    []
  );

  // Handle save action
  const handleSave = useCallback(
    async (name, thumbnail) => {
      if (!thumbnail) {
        throw new Error('No thumbnail available');
      }

      try {
        // Upload thumbnail to storage
        const uploadedThumbnailUrl = await uploadThumbnail(
          thumbnail,
          `${assetType}-${Date.now()}.jpg`
        );

        // Save asset with uploaded thumbnail
        const result = await saveAssetFn(assetType, {}, name, uploadedThumbnailUrl);

        if (!result) {
          throw new Error('Failed to save asset');
        }

        return result;
      } catch (error) {
        console.error('Save error:', error);
        throw error;
      }
    },
    [assetType, saveAssetFn]
  );

  const closeSaveModal = useCallback(() => {
    setIsOpen(false);
    // Don't reset thumbnail immediately to avoid flicker
    setTimeout(() => {
      setThumbnailUrl(null);
      setCanvasRef(null);
    }, 300);
  }, []);

  return {
    isOpen,
    thumbnailUrl,
    assetType,
    openSaveModal,
    closeSaveModal,
    handleSave,
  };
}