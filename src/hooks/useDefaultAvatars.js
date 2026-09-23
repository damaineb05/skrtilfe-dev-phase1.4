import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export function useDefaultAvatars(user, extractAvatarId) {
  const [defaultAvatars, setDefaultAvatars] = useState([]);
  const { toast } = useToast();

  // Only fetch avatars for the current user
  const fetchDefaultAvatars = useCallback(async () => {
    if (!user?.id) return;
    try {
      const avatars = await base44.entities.DefaultAvatar.filter(
        { user_id: user.id },
        '-updated_date',
        100
      );
      setDefaultAvatars(avatars || []);
    } catch (err) {
      console.warn('[DRIPSYNC] fetchDefaultAvatars failed:', err);
    }
  }, [user?.id]);

  const saveAsDefaultAvatar = useCallback(async (avatarSource, customization, wearables, environment, name, thumbnailUrl) => {
    if (!avatarSource) {
      toast({ variant: 'destructive', title: 'No Avatar', description: 'Load an avatar first.' });
      return null;
    }
    if (!name?.trim()) {
      toast({ variant: 'destructive', title: 'Invalid Name', description: 'Please enter an avatar name.' });
      return null;
    }
    if (!user?.id) {
      toast({ variant: 'destructive', title: 'Not logged in', description: 'Please log in to save avatars.' });
      return null;
    }

    console.log('[DRIPSYNC] SAVE_DEFAULT_AVATAR', { name, avatarSource });

    try {
      const newDefault = await base44.entities.DefaultAvatar.create({
        user_id: user.id,
        name: name.trim(),
        avatarUrl: avatarSource,
        thumbnailUrl: thumbnailUrl || null,
        avatarId: extractAvatarId ? extractAvatarId(user?.avatar_config, avatarSource) : null,
        source: avatarSource.includes('readyplayer.me') ? 'rpm' : 'uploaded',
        assetType: 'avatar',
        isDefaultAvatar: true,
        isStarterAvatar: false,
        metadataJson: {
          customization: customization || {},
          wearables: wearables || [],
          environment: environment || null,
          currentRealm: null,
        },
      });
      setDefaultAvatars(prev => [newDefault, ...prev]);
      toast({ title: 'Saved!', description: `"${name}" added to your avatars.` });
      return newDefault;
    } catch (err) {
      console.error('[DRIPSYNC] saveAsDefaultAvatar failed:', err);
      toast({ variant: 'destructive', title: 'Save failed', description: 'Could not save avatar. Try again.' });
      return null;
    }
  }, [user, extractAvatarId, toast]);

  const loadDefaultAvatar = useCallback((defaultAvatar) => {
    const url = defaultAvatar.avatarUrl || defaultAvatar.model_url || defaultAvatar.glb_url;
    console.log('[DRIPSYNC] LOAD_DEFAULT_AVATAR', { url, avatar: defaultAvatar });
    return {
      avatarUrl: url,
      wearables: defaultAvatar.metadataJson?.wearables || [],
      environment: defaultAvatar.metadataJson?.environment || null,
      currentRealm: defaultAvatar.metadataJson?.currentRealm || null,
      customization: defaultAvatar.metadataJson?.customization || {},
    };
  }, []);

  const replaceDefaultAvatar = useCallback(async (defaultAvatarId, avatarSource, customization, wearables, environment) => {
    console.log('[DRIPSYNC] REPLACE_DEFAULT_AVATAR', { defaultAvatarId });
    try {
      const updated = await base44.entities.DefaultAvatar.update(defaultAvatarId, {
        avatarUrl: avatarSource,
        metadataJson: {
          customization: customization || {},
          wearables: wearables || [],
          environment: environment || null,
          currentRealm: null,
        },
      });
      setDefaultAvatars(prev => prev.map(a => a.id === defaultAvatarId ? { ...a, ...updated } : a));
      toast({ title: 'Replaced', description: 'Avatar updated with current look.' });
    } catch (err) {
      console.error('[DRIPSYNC] replaceDefaultAvatar failed:', err);
      toast({ variant: 'destructive', title: 'Replace failed', description: 'Could not update avatar.' });
    }
  }, [toast]);

  const deleteDefaultAvatar = useCallback(async (defaultAvatarId) => {
    console.log('[DRIPSYNC] DELETE_DEFAULT_AVATAR', { defaultAvatarId });
    try {
      await base44.entities.DefaultAvatar.delete(defaultAvatarId);
      setDefaultAvatars(prev => prev.filter(a => a.id !== defaultAvatarId));
      toast({ title: 'Deleted', description: 'Avatar removed.' });
    } catch (err) {
      console.error('[DRIPSYNC] deleteDefaultAvatar failed:', err);
      toast({ variant: 'destructive', title: 'Delete failed', description: 'Could not delete avatar.' });
    }
  }, [toast]);

  const setStarterAvatar = useCallback(async (defaultAvatarId) => {
    if (!user?.id) return;
    console.log('[DRIPSYNC] SET_STARTER_AVATAR', { defaultAvatarId });
    try {
      // Clear existing starters for THIS user only
      const userAvatars = await base44.entities.DefaultAvatar.filter({ user_id: user.id });
      for (const avatar of userAvatars) {
        if (avatar.isStarterAvatar && avatar.id !== defaultAvatarId) {
          await base44.entities.DefaultAvatar.update(avatar.id, { isStarterAvatar: false });
        }
      }
      await base44.entities.DefaultAvatar.update(defaultAvatarId, { isStarterAvatar: true });
      setDefaultAvatars(prev => prev.map(a => ({ ...a, isStarterAvatar: a.id === defaultAvatarId })));
      toast({ title: 'Starter Set', description: 'This avatar loads automatically on your next visit.' });
    } catch (err) {
      console.error('[DRIPSYNC] setStarterAvatar failed:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not set starter avatar.' });
    }
  }, [user?.id, toast]);

  return {
    defaultAvatars,
    fetchDefaultAvatars,
    saveAsDefaultAvatar,
    loadDefaultAvatar,
    replaceDefaultAvatar,
    deleteDefaultAvatar,
    setStarterAvatar,
  };
}