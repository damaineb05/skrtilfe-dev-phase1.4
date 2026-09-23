import { useCallback } from 'react';
import { useAvatarLibrary } from './useAvatarLibrary';
import { useMultiAvatarManager } from '@/components/dripsync/MultiAvatarManager';

/**
 * Integrated hook for DripSync Avatar Library
 * Combines avatar library (persistence) + multi-avatar management (viewport)
 */
export function useDripSyncAvatarLibrary(user) {
  const library = useAvatarLibrary(user);
  const multiAvatar = useMultiAvatarManager();

  // Load avatar from library into viewport
  const loadAvatarToViewport = useCallback(
    (assetId) => {
      const avatar = library.loadAvatar(assetId);
      if (!avatar) return null;

      // Add instance to viewport
      multiAvatar.addAvatarInstance(avatar.avatarUrl, avatar.customization);
      return avatar;
    },
    [library, multiAvatar]
  );

  // Save current selected avatar to library
  const saveSelectedAvatarToLibrary = useCallback(
    async (name, thumbnail) => {
      const selected = multiAvatar.selectedInstance;
      if (!selected) {
        throw new Error('No avatar selected');
      }

      return library.saveAvatar(
        selected.url,
        selected.customization,
        name,
        thumbnail
      );
    },
    [library, multiAvatar]
  );

  return {
    // Library API
    ...library,

    // Multi-avatar API
    avatarInstances: multiAvatar.avatarInstances,
    selectedInstanceId: multiAvatar.selectedInstanceId,
    selectedInstance: multiAvatar.selectedInstance,

    // Integrated API
    loadAvatarToViewport,
    saveSelectedAvatarToLibrary,
    addAvatarInstanceToViewport: multiAvatar.addAvatarInstance,
    removeAvatarInstanceFromViewport: multiAvatar.removeAvatarInstance,
    updateSelectedAvatarCustomization: multiAvatar.updateSelectedAvatar,
    updateSelectedAvatarTransform: multiAvatar.updateSelectedTransform,
    selectAvatarInstance: multiAvatar.setSelectedInstanceId,
  };
}