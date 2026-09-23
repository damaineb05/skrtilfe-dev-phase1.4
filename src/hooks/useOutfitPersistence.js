import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Outfit Persistence Hook
 * Save/load outfit combinations as wearable ID sets
 */
export function useOutfitPersistence(user) {
  const [outfits, setOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's saved outfits
  const fetchOutfits = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const items = await base44.entities.DripSyncAsset.filter(
        { user_id: user.id, asset_type: 'outfit' },
        '-updated_date',
        100
      );
      setOutfits(items || []);
    } catch (error) {
      console.error('Failed to fetch outfits:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Save outfit (wearable IDs + avatar config)
  const saveOutfit = useCallback(
    async (name, wearableIds, avatarConfig, thumbnail) => {
      if (!user?.id) throw new Error('User not authenticated');

      const outfitData = {
        name,
        user_id: user.id,
        asset_type: 'outfit',
        thumbnailUrl: thumbnail,
        metadata: {
          wearableIds: wearableIds || {}, // { slot: wearableId }
          avatarConfig,
          savedAt: new Date().toISOString(),
        },
      };

      try {
        // Create or update via base44 SDK
        const saved = await base44.entities.DripSyncAsset.create(outfitData);
        setOutfits(prev => [saved, ...prev]);
        return saved;
      } catch (error) {
        console.error('Failed to save outfit:', error);
        throw error;
      }
    },
    [user?.id]
  );

  // Load outfit
  const loadOutfit = useCallback((outfitId) => {
    const outfit = outfits.find(o => o.id === outfitId);
    if (!outfit) return null;

    return {
      id: outfit.id,
      name: outfit.name,
      wearableIds: outfit.metadata?.wearableIds || {},
      avatarConfig: outfit.metadata?.avatarConfig,
      thumbnail: outfit.thumbnailUrl,
    };
  }, [outfits]);

  // Delete outfit
  const deleteOutfit = useCallback(
    async (outfitId) => {
      try {
        await base44.entities.DripSyncAsset.delete(outfitId);
        setOutfits(prev => prev.filter(o => o.id !== outfitId));
      } catch (error) {
        console.error('Failed to delete outfit:', error);
        throw error;
      }
    },
    []
  );

  return {
    outfits,
    isLoading,
    fetchOutfits,
    saveOutfit,
    loadOutfit,
    deleteOutfit,
  };
}