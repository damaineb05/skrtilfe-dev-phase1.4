import { useCallback } from 'react';
import { useSaveSystem } from './useSaveSystem';
import { useSavePreviewModal } from './useSavePreviewModal';

/**
 * Combined hook for DripSync saving workflow
 * Integrates SaveSystem + SavePreviewModal
 */
export function useDripSyncSave(user) {
  const { saveAsset, groupedAssets } = useSaveSystem(user);

  const saveModalControls = useSavePreviewModal(saveAsset);

  // Shortcut to open save modal with canvas
  const triggerSaveLook = useCallback(
    async (canvas) => {
      await saveModalControls.openSaveModal(canvas, 'look');
    },
    [saveModalControls]
  );

  const triggerSaveAvatar = useCallback(
    async (canvas) => {
      await saveModalControls.openSaveModal(canvas, 'avatar');
    },
    [saveModalControls]
  );

  const triggerSaveScene = useCallback(
    async (canvas) => {
      await saveModalControls.openSaveModal(canvas, 'scene');
    },
    [saveModalControls]
  );

  return {
    // Save triggers (pass canvas element)
    triggerSaveLook,
    triggerSaveAvatar,
    triggerSaveScene,

    // Modal controls
    ...saveModalControls,

    // Assets
    groupedAssets,
  };
}