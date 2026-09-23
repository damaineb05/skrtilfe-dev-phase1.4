import { useState, useCallback, useEffect } from 'react';
import { useSaveSystem } from './useSaveSystem';

/**
 * Avatar Library hook
 * Manages saving, loading, and deleting avatars in UserAssets
 */
export function useAvatarLibrary(user) {
  const { saveAsset, loadAsset, deleteAsset, groupedAssets } = useSaveSystem(user);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);

  // Get avatars from grouped assets
  const avatars = groupedAssets.avatars || [];

  // Auto-select first avatar on mount
  useEffect(() => {
    if (avatars.length > 0 && !selectedAvatarId) {
      setSelectedAvatarId(avatars[0].id);
    }
  }, [avatars, selectedAvatarId]);

  // Save avatar to library
  const saveAvatar = useCallback(
    async (avatarUrl, customization = {}, name, thumbnail) => {
      try {
        const payload = {
          avatarUrl,
          customization,
        };

        const result = await saveAsset('avatar', payload, name, thumbnail);
        if (result) {
          setSelectedAvatarId(result.id);
        }
        return result;
      } catch (error) {
        console.error('Failed to save avatar:', error);
        throw error;
      }
    },
    [saveAsset]
  );

  // Load avatar into viewport
  const loadAvatar = useCallback(
    (assetId) => {
      const avatar = avatars.find(a => a.id === assetId);
      if (!avatar) {
        console.warn('Avatar not found:', assetId);
        return null;
      }

      setSelectedAvatarId(assetId);
      return {
        id: avatar.id,
        avatarUrl: avatar.metadata?.avatarUrl,
        customization: avatar.metadata?.customization || {},
      };
    },
    [avatars]
  );

  // Delete avatar from library
  const removeAvatar = useCallback(
    async (assetId) => {
      try {
        await deleteAsset(assetId);

        // Clear selection if deleted avatar was selected
        if (selectedAvatarId === assetId) {
          setSelectedAvatarId(avatars.length > 0 ? avatars[0].id : null);
        }
      } catch (error) {
        console.error('Failed to delete avatar:', error);
        throw error;
      }
    },
    [deleteAsset, selectedAvatarId, avatars]
  );

  // Get currently selected avatar
  const selectedAvatar = avatars.find(a => a.id === selectedAvatarId);

  return {
    avatars,
    selectedAvatarId,
    selectedAvatar,
    saveAvatar,
    loadAvatar,
    removeAvatar,
    setSelectedAvatarId,
  };
}