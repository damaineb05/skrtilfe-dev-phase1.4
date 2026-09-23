import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export function useDripSyncLibrary(user) {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all assets for current user
  const fetchAssets = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const result = await base44.entities.DripSyncAsset.filter({
        user_id: user.id,
      });
      setAssets(result || []);
      console.log('[LIBRARY FETCH]', result);
    } catch (err) {
      console.error('[LIBRARY FETCH ERROR]', err);
      toast.error('Failed to load library');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Save avatar (creates type: "avatar" asset)
  const saveAvatar = useCallback(
    async (avatarUrl, customization, wearables, environment, name, thumbnail) => {
      if (!user?.id) {
        toast.error('Must be logged in to save');
        return null;
      }

      try {
        const asset = await base44.entities.DripSyncAsset.create({
          user_id: user.id,
          type: 'avatar',
          name: name || 'Untitled Avatar',
          avatarUrl,
          avatarId: extractAvatarId(avatarUrl),
          thumbnailUrl: thumbnail,
          isDefault: false,
          isStarter: false,
          metadata: {
            customization,
            wearables: wearables || [],
          },
        });

        console.log('[LIBRARY SAVE] Avatar', asset);
        setAssets(prev => [asset, ...prev]);
        toast.success(`Avatar "${name}" saved to library`);
        return asset;
      } catch (err) {
        console.error('[LIBRARY SAVE ERROR]', err);
        toast.error('Failed to save avatar');
        return null;
      }
    },
    [user?.id]
  );

  // Save as default (creates type: "avatar" with isDefault: true)
  const saveAsDefault = useCallback(
    async (avatarUrl, customization, wearables, environment, name, thumbnail) => {
      if (!user?.id) {
        toast.error('Must be logged in to save');
        return null;
      }

      try {
        const asset = await base44.entities.DripSyncAsset.create({
          user_id: user.id,
          type: 'avatar',
          name: name || 'Untitled Avatar',
          avatarUrl,
          avatarId: extractAvatarId(avatarUrl),
          thumbnailUrl: thumbnail,
          isDefault: true,
          isStarter: false,
          metadata: {
            customization,
            wearables: wearables || [],
            environment,
          },
        });

        console.log('[LIBRARY SAVE] Default Avatar', asset);
        setAssets(prev => [asset, ...prev]);
        toast.success(`"${name}" saved as default avatar`);
        return asset;
      } catch (err) {
        console.error('[LIBRARY SAVE ERROR]', err);
        toast.error('Failed to save default avatar');
        return null;
      }
    },
    [user?.id]
  );

  // Save look (creates type: "look" asset with full metadata)
  const saveLook = useCallback(
    async (name, avatarUrl, customization, wearables, animations, environment, realm, thumbnail) => {
      if (!user?.id) {
        toast.error('Must be logged in to save');
        return null;
      }

      try {
        const asset = await base44.entities.DripSyncAsset.create({
          user_id: user.id,
          type: 'look',
          name: name || 'Untitled Look',
          avatarUrl,
          avatarId: extractAvatarId(avatarUrl),
          thumbnailUrl: thumbnail,
          isDefault: false,
          isStarter: false,
          metadata: {
            customization,
            wearables: wearables || [],
            animations: animations || [],
            environment,
            currentRealm: realm,
          },
        });

        console.log('[LIBRARY SAVE] Look', asset);
        setAssets(prev => [asset, ...prev]);
        toast.success(`Look "${name}" saved to library`);
        return asset;
      } catch (err) {
        console.error('[LIBRARY SAVE ERROR]', err);
        toast.error('Failed to save look');
        return null;
      }
    },
    [user?.id]
  );

  // Load asset into viewport
  const loadAsset = useCallback((asset) => {
    console.log('[LIBRARY LOAD]', asset);
    return {
      avatarUrl: asset.avatarUrl,
      customization: asset.metadata?.customization || {},
      wearables: asset.metadata?.wearables || [],
      animations: asset.metadata?.animations || [],
      environment: asset.metadata?.environment || null,
      realm: asset.metadata?.currentRealm || null,
    };
  }, []);

  // Delete asset
  const deleteAsset = useCallback(
    async (asset) => {
      try {
        await base44.entities.DripSyncAsset.delete(asset.id);
        console.log('[LIBRARY DELETE]', asset.id);
        setAssets(prev => prev.filter(a => a.id !== asset.id));
        toast.success('Asset deleted');
      } catch (err) {
        console.error('[LIBRARY DELETE ERROR]', err);
        toast.error('Failed to delete asset');
        throw err;
      }
    },
    []
  );

  // Set as starter
  const setStarter = useCallback(
    async (asset) => {
      if (asset.type !== 'avatar') {
        toast.error('Only avatars can be set as starter');
        return;
      }

      try {
        // Update all assets to isStarter = false, then set this one
        await Promise.all(
          assets
            .filter(a => a.isStarter)
            .map(a => base44.entities.DripSyncAsset.update(a.id, { isStarter: false }))
        );

        await base44.entities.DripSyncAsset.update(asset.id, { isStarter: true });
        console.log('[LIBRARY SET STARTER]', asset.id);

        setAssets(prev =>
          prev.map(a => ({
            ...a,
            isStarter: a.id === asset.id,
          }))
        );

        toast.success(`"${asset.name}" set as starter`);
      } catch (err) {
        console.error('[LIBRARY SET STARTER ERROR]', err);
        toast.error('Failed to set starter');
      }
    },
    [assets]
  );

  return {
    assets,
    isLoading,
    fetchAssets,
    saveAvatar,
    saveAsDefault,
    saveLook,
    loadAsset,
    deleteAsset,
    setStarter,
  };
}

// Helper to extract avatar ID from URL
function extractAvatarId(url) {
  if (!url) return null;
  const match = url.match(/avatars\/([a-f0-9\-]+)/);
  return match?.[1] || null;
}