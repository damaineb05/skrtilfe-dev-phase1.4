/**
 * useSaveSystem V2
 * Backward-compatible asset management hook.
 * Wraps the new useAvatarSaveLoad and adds library management
 * (list, cache, delete, setStarter).
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { normalizeAsset } from './useAvatarSaveLoad';

const CACHE_KEY = 'dripsync_user_assets_v2';
const CACHE_EXPIRY = 1000 * 60 * 15; // 15 min

export function useSaveSystem(user) {
  const [assets, setAssets] = useState([]);
  const [groupedAssets, setGroupedAssets] = useState({
    avatars: [],
    looks: [],
    outfits: [],
    scenes: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState(null);

  const assetsRef = useRef([]);
  useEffect(() => { assetsRef.current = assets; }, [assets]);

  // Group assets by type
  const groupAssetsByType = useCallback((assetList) => {
    const grouped = {
      avatars: assetList.filter(a => a.type === 'avatar'),
      looks:   assetList.filter(a => a.type === 'look'),
      outfits: assetList.filter(a => a.type === 'outfit'),
      scenes:  assetList.filter(a => a.type === 'scene'),
    };
    setGroupedAssets(grouped);
    return grouped;
  }, []);

  const saveToLocalCache = useCallback((assetList, userId) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        userId,
        assets: assetList,
        timestamp: Date.now(),
      }));
    } catch (err) {
      console.warn('[CACHE] Write failed:', err);
    }
  }, []);

  const loadFromLocalCache = useCallback((userId) => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const cacheData = JSON.parse(cached);
      if (Date.now() - cacheData.timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      if (cacheData.userId !== userId) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return cacheData.assets;
    } catch (err) {
      console.warn('[CACHE] Read failed:', err);
      return null;
    }
  }, []);

  // ── Fetch user assets ─────────────────────────────────────────────────────
  const getUserAssets = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setAssets([]);
      setGroupedAssets({ avatars: [], looks: [], outfits: [], scenes: [] });
      return { avatars: [], looks: [], outfits: [], scenes: [] };
    }

    if (!forceRefresh) {
      const cached = loadFromLocalCache(user.id);
      if (cached) {
        setAssets(cached);
        setCacheTimestamp(Date.now());
        return groupAssetsByType(cached);
      }
    }

    setIsLoading(true);
    try {
      const result = await base44.entities.DripSyncAsset.filter({ user_id: user.id });
      const assetList = result || [];
      setAssets(assetList);
      setCacheTimestamp(Date.now());
      saveToLocalCache(assetList, user.id);
      return groupAssetsByType(assetList);
    } catch (err) {
      console.error('[SAVE SYSTEM V2] Fetch error:', err);
      toast.error('Failed to load saved avatars');
      return { avatars: [], looks: [], outfits: [], scenes: [] };
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, loadFromLocalCache, saveToLocalCache, groupAssetsByType]);

  // ── Save asset (V2 — called by ClosetPanelWithDefaults) ───────────────────
  const saveAsset = useCallback(async (type, payload, name, thumbnail) => {
    if (!user?.id) {
      toast.error('Must be logged in to save');
      return null;
    }

    const allowedTypes = ['avatar', 'look', 'outfit', 'scene'];
    if (!allowedTypes.includes(type)) {
      toast.error('Invalid asset type');
      return null;
    }

    const dedupKey = `save_dedup_${type}_${name}`;
    if (sessionStorage.getItem(dedupKey)) return null;
    sessionStorage.setItem(dedupKey, '1');
    setTimeout(() => sessionStorage.removeItem(dedupKey), 2000);

    if (!payload?.avatarUrl) {
      toast.error('Cannot save — no avatar URL found.');
      return null;
    }

    try {
      const asset = await base44.entities.DripSyncAsset.create({
        user_id: user.id,
        type,
        name: name || `Untitled ${type}`,
        // V2 root-level fields
        avatarUrl: payload.avatarUrl,
        avatarId: payload.avatarId || null,
        gender: payload.gender || payload.avatarType || 'masculine',
        source: payload.source || (payload.avatarUrl?.includes('readyplayer.me') ? 'rpm' : 'upload'),
        thumbnailUrl: thumbnail || null,
        isDefault: false,
        isStarter: false,
        schema_version: 2,
        // Full metadata (V1 compat fields included)
        metadata: {
          ...payload,
          avatarUrl: payload.avatarUrl,        // V1 compat
          thumbnailUrl: thumbnail || null,      // V1 compat
          avatarType: payload.gender || payload.avatarType || 'masculine', // V1 compat
          gender: payload.gender || 'masculine',
          source: payload.source || 'upload',
          asset_version: 2,
        },
      });

      setAssets(prev => {
        const updated = [asset, ...prev];
        saveToLocalCache(updated, user.id);
        groupAssetsByType(updated);
        return updated;
      });

      toast.success(`${type === 'look' ? '✨' : '👤'} "${name}" saved!`);
      return asset;
    } catch (err) {
      console.error('[SAVE SYSTEM V2] Save error:', err);
      toast.error(`Failed to save ${type}`);
      return null;
    }
  }, [user?.id, saveToLocalCache, groupAssetsByType]);

  // ── Load asset — returns normalized state object ───────────────────────────
  const loadAsset = useCallback((asset) => {
    const normalized = normalizeAsset(asset);

    if (!normalized?.avatarUrl) {
      console.warn('[SAVE SYSTEM V2] loadAsset: missing avatarUrl on', asset?.id, asset?.name);
    }

    return {
      type: normalized.type,
      name: normalized.name,
      avatarUrl: normalized.avatarUrl,
      avatarId: normalized.avatarId,
      gender: normalized.gender,
      source: normalized.source,
      customization: normalized.customization,
      wearables: normalized.wearables,
      animations: normalized.animations,
      environment: normalized.environment,
      realm: normalized.currentRealm,
    };
  }, []);

  // ── Delete asset ───────────────────────────────────────────────────────────
  const deleteAsset = useCallback(async (assetId) => {
    try {
      await base44.entities.DripSyncAsset.delete(assetId);
      setAssets(prev => {
        const updated = prev.filter(a => a.id !== assetId);
        saveToLocalCache(updated, user.id);
        groupAssetsByType(updated);
        return updated;
      });
      toast.success('Asset deleted');
    } catch (err) {
      console.error('[SAVE SYSTEM V2] Delete error:', err);
      toast.error('Failed to delete asset');
      throw err;
    }
  }, [user?.id, saveToLocalCache, groupAssetsByType]);

  // ── Set starter ────────────────────────────────────────────────────────────
  const setStarter = useCallback(async (assetId) => {
    try {
      const current = assetsRef.current;
      await Promise.all(
        current
          .filter(a => a.isStarter)
          .map(a => base44.entities.DripSyncAsset.update(a.id, { isStarter: false }))
      );
      await base44.entities.DripSyncAsset.update(assetId, { isStarter: true });

      setAssets(prev => {
        const updated = prev.map(a => ({ ...a, isStarter: a.id === assetId }));
        saveToLocalCache(updated, user.id);
        groupAssetsByType(updated);
        return updated;
      });
      toast.success('Default avatar updated');
    } catch (err) {
      console.error('[SAVE SYSTEM V2] setStarter error:', err);
      toast.error('Failed to set default avatar');
    }
  }, [user?.id, saveToLocalCache, groupAssetsByType]);

  // ── Publish / unpublish as community template (owner only) ───────────────
  // Toggling is_public_template makes the avatar READABLE by everyone (RLS)
  // so it appears in the community template catalog. Only the owner/admin can
  // update the record (update RLS guards this); other users can only READ + load
  // a copy. Account identity is never surfaced by the catalog UI.
  const togglePublicTemplate = useCallback(async (assetId, isPublic, templateName) => {
    try {
      const updated = await base44.entities.DripSyncAsset.update(assetId, {
        is_public_template: !!isPublic,
        template_name: templateName || null,
      });
      setAssets(prev => {
        const next = prev.map(a => (a.id === assetId ? { ...a, ...updated } : a));
        saveToLocalCache(next, user.id);
        groupAssetsByType(next);
        return next;
      });
      toast.success(isPublic ? 'Shared as community template' : 'Removed from templates');
      return updated;
    } catch (err) {
      console.error('[SAVE SYSTEM V2] togglePublicTemplate error:', err);
      toast.error('Could not update template sharing');
      return null;
    }
  }, [user?.id, saveToLocalCache, groupAssetsByType, toast]);

  // ── Auto-fetch on user change ──────────────────────────────────────────────
  useEffect(() => {
    if (user?.id) getUserAssets();
  }, [user?.id, getUserAssets]);

  return {
    assets,
    groupedAssets,
    isLoading,
    cacheTimestamp,
    getUserAssets,
    saveAsset,
    loadAsset,
    deleteAsset,
    setStarter,
    togglePublicTemplate,
  };
}