/**
 * useAvatarActions
 * Extracted from pages/DripSync.jsx — RPM avatar actions and save logic.
 *
 * Phase C: every avatar_config write now flows through persistAvatarProfile
 * (saveAvatarProfile backend), which validates equipped catalog wearables
 * against AssetOwnership. No more direct base44.auth.updateMe({ avatar_config }).
 */
import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { extractAvatarId, hydrateAvatarTraits } from '../../components/utils/rpmHelpers';
import { buildCanonicalConfig, persistAvatarProfile } from '@/lib/avatarPersistence';

export default function useAvatarActions({
  user, setUser, avatarSource, avatarGender, customization, wearables, customAnimations, environment,
  sceneLibrary, currentRealm, setAvatarSource, setWearables, setCustomAnimations,
  setEnvironment, setCurrentRealm, setCustomization, setHardReloadToken,
  setStatus, setIsHydratingTraits, setIsSavingAvatar, setIsRefreshingRpm, toast,
}) {
  // Shared persistence helper — builds canonical v2 from the current runtime
  // snapshot and routes through saveAvatarProfile. onUserUpdate keeps the
  // AuthContext user in sync (replacing the old direct updateMe).
  const persistNow = useCallback(async (runtimeOverrides = {}) => {
    const avatarId = extractAvatarId(user?.avatar_config, avatarSource);
    const config = buildCanonicalConfig({
      avatarSource,
      avatarId,
      gender: avatarGender,
      customization,
      wearables,
      customAnimations,
      environment,
      currentRealm,
      ...runtimeOverrides,
    });
    return persistAvatarProfile(config, {
      expectedRevision: user?.avatar_config?.revision ?? 0,
      onUserUpdate: (cfg) => setUser((u) => ({ ...(u || {}), avatar_config: cfg })),
      onUnauthorized: (ids) => {
        toast({
          variant: 'destructive',
          title: 'Save blocked — item not owned',
          description: `${ids.length} equipped item(s) are not in your closet. Remove them to save.`,
          duration: 4000,
        });
      },
    });
  }, [user, avatarSource, avatarGender, customization, wearables, customAnimations, environment, currentRealm, setUser, toast]);

  const hydrateTraitsFromRPM = useCallback(async (avatarId, exportMetadata, avatarUrl) => {
    setIsHydratingTraits(true);
    try {
      const result = await hydrateAvatarTraits(avatarId, {
        proxyUrl: '/api/rpm/avatar',
        fallbacks: {
          skinTone: customization.skinTone,
          hairColor: customization.hairColor,
          eyeColor: customization.eyeColor,
          bodyType: exportMetadata?.bodyType || 'fullbody'
        }
      });
      if (result.success) {
        const { traits } = result;
        const mergedCustomization = {
          ...customization,
          skinTone: traits.skinTone,
          hairColor: traits.hairColor,
          eyeColor: traits.eyeColor,
          hairAssetUrl: traits.hairAssetUrl || null,
        };
        setCustomization((prev) => ({ ...prev, ...mergedCustomization }));
        if (user) {
          // RPM export clears equipment and sets a new avatar URL; persist the
          // full post-export state (new URL + cleared equipment + merged traits)
          // in one canonical save.
          const res = await persistNow({
            avatarSource: avatarUrl,
            avatarId,
            wearables: [],
            customAnimations: [],
            environment: null,
            customization: mergedCustomization,
          });
          if (res.success) {
            toast({ title: 'Traits hydrated', description: 'Avatar traits applied from Ready Player Me.', duration: 200 });
          } else if (res.status === 403) {
            // onUnauthorized already toasted
          }
        }
      } else {
        throw new Error(result.error || 'Hydration failed');
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Hydration failed', description: 'Failed to hydrate traits. Using defaults.', duration: 200 });
    } finally {
      setIsHydratingTraits(false);
    }
  }, [user, customization, avatarSource, persistNow, setCustomization, setIsHydratingTraits, toast]);

  const redoRpmPull = useCallback(async () => {
    const avatarId = extractAvatarId(user?.avatar_config, avatarSource);
    if (!avatarId) {
      toast({ variant: 'destructive', title: 'No RPM avatar detected', description: 'Please create or load a Ready Player Me avatar first.' });
      return;
    }
    setIsRefreshingRpm(true);
    try {
      const result = await hydrateAvatarTraits(avatarId, {
        proxyUrl: '/api/rpm/avatar',
        fallbacks: { skinTone: customization.skinTone, hairColor: customization.hairColor, eyeColor: customization.eyeColor, bodyType: user?.avatar_config?.traits?.bodyType || 'fullbody' },
        currentTraits: { skinTone: customization.skinTone, hairColor: customization.hairColor, eyeColor: customization.eyeColor, bodyType: customization.bodyType, outfitGender: customization.outfitGender }
      });
      if (result.success) {
        const { traits, sources } = result;
        const mergedCustomization = {
          ...customization,
          skinTone: traits.skinTone,
          hairColor: traits.hairColor,
          eyeColor: traits.eyeColor,
          hairAssetUrl: traits.hairAssetUrl || null,
          isVisible: true,
        };
        setCustomization((prev) => ({ ...prev, ...mergedCustomization }));
        const res = await persistNow({ customization: mergedCustomization });
        setTimeout(() => setHardReloadToken((prev) => prev + 1), 100);
        if (res.success) {
          let description = sources.proxy && sources.metadata ? 'Full refresh complete! Traits updated from Ready Player Me API.'
            : !sources.proxy && sources.metadata ? 'Refreshed from public metadata.'
            : 'Using cached traits.';
          toast({ title: '✨ Refresh Successful', description, duration: 200 });
        }
      } else {
        throw new Error(result.error || 'Refresh failed');
      }
    } catch (e) {
      toast({ variant: 'default', title: 'Refresh completed with limitations', description: 'Some RPM data could not be fetched, but your avatar is safe.', duration: 200 });
    } finally {
      setIsRefreshingRpm(false);
    }
  }, [user, avatarSource, customization, persistNow, setCustomization, setHardReloadToken, setIsRefreshingRpm, toast]);

  const handleSaveAvatar = useCallback(async () => {
    setIsSavingAvatar(true);
    try {
      let urlToSave = typeof avatarSource === 'string' ? avatarSource : null;
      if (urlToSave?.startsWith('blob:')) urlToSave = null;
      if (!urlToSave) {
        toast({ variant: 'destructive', title: 'Save failed', description: 'No avatar URL to save (blob URLs must be uploaded first).', duration: 2000 });
        return;
      }
      const res = await persistNow({ avatarSource: urlToSave });
      if (res.success) {
        toast({ title: 'Avatar saved', description: 'Your avatar settings are now stored.', duration: 2000 });
      } else if (res.status !== 403) {
        toast({ variant: 'destructive', title: 'Save failed', description: res.error || 'Please try again.', duration: 2000 });
      }
      return res;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Save failed', description: 'Please try again.', duration: 2000 });
    } finally {
      setIsSavingAvatar(false);
    }
  }, [avatarSource, persistNow, setIsSavingAvatar, toast]);

  return { hydrateTraitsFromRPM, redoRpmPull, handleSaveAvatar };
}