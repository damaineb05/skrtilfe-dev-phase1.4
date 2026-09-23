import { useState, useCallback, useEffect } from 'react';
import { useSaveSystem } from './useSaveSystem';

/**
 * Outfit Library Hook
 * Extends SaveSystem for outfit-specific operations
 * Payload: { avatarId, wearableIds: [id1, id2, ...], colorSettings: {...} }
 */
export function useOutfitLibrary(user) {
  const { saveAsset, loadAsset, deleteAsset, groupedAssets } = useSaveSystem(user);
  const [selectedOutfitId, setSelectedOutfitId] = useState(null);

  // Get outfits from grouped assets
  const outfits = groupedAssets.outfits || [];

  // Auto-select first outfit on mount
  useEffect(() => {
    if (outfits.length > 0 && !selectedOutfitId) {
      setSelectedOutfitId(outfits[0].id);
    }
  }, [outfits, selectedOutfitId]);

  // Save outfit with wearables + colors
  const saveOutfit = useCallback(
    async (avatarId, wearableIds = [], colorSettings = {}, name, thumbnail) => {
      try {
        const payload = {
          avatarId,
          wearableIds, // Array of wearable IDs to apply
          colorSettings, // { slot: { hex, metalness, roughness } }
        };

        const result = await saveAsset('outfit', payload, name, thumbnail);
        if (result) {
          setSelectedOutfitId(result.id);
        }
        return result;
      } catch (error) {
        console.error('Failed to save outfit:', error);
        throw error;
      }
    },
    [saveAsset]
  );

  // Load outfit and return data for auto-apply
  const loadOutfit = useCallback(
    (outfitId) => {
      const outfit = outfits.find(o => o.id === outfitId);
      if (!outfit) {
        console.warn('Outfit not found:', outfitId);
        return null;
      }

      setSelectedOutfitId(outfitId);

      // Return outfit data for auto-application
      return {
        id: outfit.id,
        name: outfit.name,
        avatarId: outfit.metadata?.avatarId,
        wearableIds: outfit.metadata?.wearableIds || [], // Will be applied to avatar
        colorSettings: outfit.metadata?.colorSettings || {},
        thumbnail: outfit.thumbnailUrl,
      };
    },
    [outfits]
  );

  // Delete outfit from library
  const removeOutfit = useCallback(
    async (outfitId) => {
      try {
        await deleteAsset(outfitId);

        // Clear selection if deleted outfit was selected
        if (selectedOutfitId === outfitId) {
          setSelectedOutfitId(outfits.length > 0 ? outfits[0].id : null);
        }
      } catch (error) {
        console.error('Failed to delete outfit:', error);
        throw error;
      }
    },
    [deleteAsset, selectedOutfitId, outfits]
  );

  // Get currently selected outfit
  const selectedOutfit = outfits.find(o => o.id === selectedOutfitId);

  return {
    outfits,
    selectedOutfitId,
    selectedOutfit,
    saveOutfit,
    loadOutfit,
    removeOutfit,
    setSelectedOutfitId,
  };
}