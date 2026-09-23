/**
 * Hook — useWearableActions
 * Wearable CRUD with slot-based replace logic for clean outfit management.
 */
import { useCallback } from 'react';

// Slots that can only hold one item at a time
const EXCLUSIVE_SLOTS = new Set([
  'headwear','eyewear','top','bottom','shoes','full_body',
  'gloves','outerwear','footwear','facewear','neckwear'
]);

export function useWearableActions({ wearables, setWearables, setHardReloadToken, toast }) {

  /**
   * Add a wearable — replaces existing items in the same exclusive slot.
   */
  const handleAddWearable = useCallback((wearable) => {
    const slot = wearable.slot || wearable.category || 'accessory';
    const shouldReplace = EXCLUSIVE_SLOTS.has(slot);
    const newItem = {
      ...wearable,
      id: wearable.id || Date.now(),
      slot,
      physics: {
        enabled: false, type: 'cloth', gravity: 9.8, damping: 0.1,
        stiffness: 0.5, mass: 1, windStrength: 0,
        jiggleIntensity: 0.5, jiggleDamping: 0.8,
        ...(wearable.physics || {}),
      },
    };

    setWearables(prev => {
      // Remove existing item in the same exclusive slot (and any replaces_slots)
      const slotsToReplace = [slot, ...(wearable.replaces_slots || [])];
      const filtered = shouldReplace
        ? prev.filter(w => !slotsToReplace.includes(w.slot || w.category || 'accessory'))
        : prev;
      return [...filtered, newItem];
    });
  }, [setWearables]);

  const handleUpdateWearable = useCallback((id, updates) => {
    setWearables(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, [setWearables]);

  const handleRemoveWearable = useCallback((id) => {
    setWearables(prev => prev.filter(w => w.id !== id));
  }, [setWearables]);

  const handleUpdatePhysics = useCallback((wearableId, physics) => {
    setWearables(prev => prev.map(w => w.id === wearableId ? { ...w, physics } : w));
  }, [setWearables]);

  const handleWearableTransformChange = useCallback((wearableId, transform) => {
    setWearables(prev => prev.map(w => w.id === wearableId ? { ...w, ...transform } : w));
  }, [setWearables]);

  const handleSnapToBone = useCallback((wearableId) => {
    setWearables(prev => prev.map(w => w.id === wearableId ? { ...w, position: [0,0,0], rotation: [0,0,0] } : w));
    setHardReloadToken(t => t + 1);
    toast('Snapped to bone');
  }, [setWearables, setHardReloadToken, toast]);

  const handleResetTransform = useCallback((wearableId) => {
    setWearables(prev => prev.map(w => w.id === wearableId ? { ...w, position: [0,0,0], rotation: [0,0,0], scale: 1 } : w));
    setHardReloadToken(t => t + 1);
    toast('Transform reset');
  }, [setWearables, setHardReloadToken, toast]);

  const handleMirrorToOpposite = useCallback((wearableId) => {
    const wearable = wearables.find(w => w.id === wearableId);
    if (!wearable) return;
    const patterns = [
      { test: /left/i,  replace: s => s.replace(/left/i,  'Right') },
      { test: /right/i, replace: s => s.replace(/right/i, 'Left') },
      { test: /_l\b/i,  replace: s => s.replace(/_l\b/i,  '_R') },
      { test: /_r\b/i,  replace: s => s.replace(/_r\b/i,  '_L') },
    ];
    const found = patterns.find(p => p.test.test(wearable.bone));
    if (!found) {
      toast.error('Cannot mirror — not on a left/right bone');
      return;
    }
    const oppositeBone = found.replace(wearable.bone);
    setWearables(prev => [...prev, {
      ...wearable, id: Date.now(), bone: oppositeBone,
      name: `${wearable.name} (Mirrored)`,
      position: [-wearable.position[0], wearable.position[1], wearable.position[2]],
      rotation: [wearable.rotation[0], -wearable.rotation[1], -wearable.rotation[2]],
    }]);
    setHardReloadToken(p => p + 1);
    toast(`Mirrored to ${oppositeBone}`);
  }, [wearables, setWearables, setHardReloadToken, toast]);

  return {
    handleAddWearable,
    handleUpdateWearable,
    handleRemoveWearable,
    handleUpdatePhysics,
    handleWearableTransformChange,
    handleSnapToBone,
    handleResetTransform,
    handleMirrorToOpposite,
  };
}

export default useWearableActions;