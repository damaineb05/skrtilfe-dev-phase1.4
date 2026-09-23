/**
 * Hook — useAvatarLifecycle
 * Encapsulates avatar source changes, hair asset swaps, and customization updates.
 * Consumed by DripSync page.
 */
import { useCallback } from 'react';
import { DEFAULT_CUSTOMIZATION } from '../../../constants/dripsyncConfig';

export function useAvatarLifecycle({
  setAvatarSource, setWearables, setCustomAnimations, setEnvironment,
  setCurrentRealm, setCustomization, setHardReloadToken, toast,
}) {

  const resetAvatarState = useCallback((newUrl) => {
    setAvatarSource(newUrl);
    setWearables([]);
    setCustomAnimations([]);
    setEnvironment(null);
    setCurrentRealm(null);
    setCustomization(prev => ({ ...prev, ...DEFAULT_CUSTOMIZATION }));
    setHardReloadToken(p => p + 1);
  }, [setAvatarSource, setWearables, setCustomAnimations, setEnvironment, setCurrentRealm, setCustomization, setHardReloadToken]);

  const handleCustomizationChange = useCallback((next) => {
    setCustomization(prev => ({ ...prev, ...next, isVisible: next.isVisible !== false }));
  }, [setCustomization]);

  const handleHairAssetChange = useCallback((hairAssetUrl) => {
    setWearables(prev => {
      const without = prev.filter(w => !w.isHair);
      if (!hairAssetUrl) return without;
      return [
        ...without,
        {
          id: Date.now(), url: hairAssetUrl, name: 'Hair Style',
          bone: 'Head', position: [0, 0, 0], rotation: [0, 0, 0], scale: 1,
          isHair: true, slot: 'headwear', metadata: { type: 'hair', source: 'rpm' },
        },
      ];
    });
    setCustomization(prev => ({ ...prev, hairAssetUrl }));
    setHardReloadToken(p => p + 1);
    toast('Hair style updated');
  }, [setWearables, setCustomization, setHardReloadToken, toast]);

  return {
    resetAvatarState,
    handleCustomizationChange,
    handleHairAssetChange,
  };
}

export default useAvatarLifecycle;