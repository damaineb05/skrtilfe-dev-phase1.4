import { useState, useCallback } from 'react';

// Slot definitions and bone mappings
const SLOT_CONFIG = {
  head: { bone: 'Head', label: 'Head' },
  torso: { bone: 'Spine', label: 'Torso' },
  legs: { bone: 'Hips', label: 'Legs' },
  feet: { bone: 'LeftFoot', label: 'Feet' },
};

/**
 * Wearable System Hook
 * Manages wearable attachments per avatar instance
 * - One item per slot (auto-replaces)
 * - Track wearable GLB, bone attachment, transform
 * - Follow avatar animations
 */
export function useWearableSystem() {
  // Structure: { [avatarInstanceId]: { [slot]: wearableData } }
  const [wearablesByAvatar, setWearablesByAvatar] = useState({});

  // Apply wearable to avatar slot
  const applyWearable = useCallback((avatarId, wearableId, wearableData) => {
    if (!avatarId || !wearableData) return;

    const { slot = 'torso', glbUrl, name, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 } = wearableData;

    setWearablesByAvatar(prev => ({
      ...prev,
      [avatarId]: {
        ...(prev[avatarId] || {}),
        [slot]: {
          id: wearableId,
          name,
          glbUrl,
          slot,
          bone: SLOT_CONFIG[slot]?.bone || 'Hips',
          position,
          rotation,
          scale,
          appliedAt: Date.now(),
        },
      },
    }));
  }, []);

  // Remove wearable from slot
  const removeWearable = useCallback((avatarId, slot) => {
    setWearablesByAvatar(prev => {
      const updated = { ...prev[avatarId] };
      delete updated[slot];
      return {
        ...prev,
        [avatarId]: updated,
      };
    });
  }, []);

  // Get all wearables for avatar
  const getAvatarWearables = useCallback((avatarId) => {
    return wearablesByAvatar[avatarId] || {};
  }, [wearablesByAvatar]);

  // Get wearable in specific slot
  const getWearableInSlot = useCallback((avatarId, slot) => {
    return wearablesByAvatar[avatarId]?.[slot] || null;
  }, [wearablesByAvatar]);

  // Update wearable transform (position, rotation, scale)
  const updateWearableTransform = useCallback(
    (avatarId, slot, position, rotation, scale) => {
      setWearablesByAvatar(prev => ({
        ...prev,
        [avatarId]: {
          ...(prev[avatarId] || {}),
          [slot]: {
            ...(prev[avatarId]?.[slot] || {}),
            position,
            rotation,
            scale,
          },
        },
      }));
    },
    []
  );

  // Clear all wearables for avatar
  const clearAvatarWearables = useCallback((avatarId) => {
    setWearablesByAvatar(prev => {
      const updated = { ...prev };
      delete updated[avatarId];
      return updated;
    });
  }, []);

  return {
    wearablesByAvatar,
    applyWearable,
    removeWearable,
    getAvatarWearables,
    getWearableInSlot,
    updateWearableTransform,
    clearAvatarWearables,
    SLOT_CONFIG,
  };
}