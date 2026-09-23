import { useCallback, useRef } from 'react';

/**
 * Outfit Auto-Apply Hook
 * Instantly applies outfit wearables without reload lag
 * Uses requestAnimationFrame for smooth application
 */
export function useOutfitAutoApply(wearableSystem) {
  const applyTimeoutRef = useRef(null);

  // Apply outfit wearables to selected avatar (instant)
  const applyOutfitWearables = useCallback(
    (avatarId, wearableIds = [], colorSettings = {}, wearableData = {}) => {
      // Clear pending timeout
      if (applyTimeoutRef.current) {
        clearTimeout(applyTimeoutRef.current);
      }

      // Use RAF for smooth frame-aligned application
      requestAnimationFrame(() => {
        // Remove all current wearables from avatar first
        if (wearableSystem?.clearAvatarWearables) {
          wearableSystem.clearAvatarWearables(avatarId);
        }

        // Apply each wearable in sequence (optimized for fast switching)
        wearableIds.forEach((wearableId, index) => {
          const wearable = wearableData[wearableId];
          if (wearable && wearableSystem?.applyWearable) {
            // Stagger very slightly to avoid frame blocking
            applyTimeoutRef.current = setTimeout(() => {
              wearableSystem.applyWearable(avatarId, wearableId, {
                ...wearable,
                slot: wearable.slot || 'torso',
              });
            }, index * 2); // 2ms stagger per item
          }
        });

        // Apply color settings if provided
        if (colorSettings && wearableSystem?.updateColorSettings) {
          wearableSystem.updateColorSettings(avatarId, colorSettings);
        }
      });
    },
    [wearableSystem]
  );

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (applyTimeoutRef.current) {
      clearTimeout(applyTimeoutRef.current);
    }
  }, []);

  return {
    applyOutfitWearables,
    cleanup,
  };
}