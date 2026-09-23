/**
 * useOutfitPresets
 * ─────────────────────────────────────────────────────────────
 * Preset action wrappers for UI components.
 *
 * Note on preset list state:
 *   The current DripSyncStore does not yet track a `presets[]` list
 *   in its reactive state. Preset save/apply goes through the engine
 *   which persists to the OutfitPreset entity, but the list is not
 *   hydrated into the store during the boot sequence.
 *
 *   For this phase the hook is action-focused. To display a preset
 *   list, components should call `fetchPresets()` which returns the
 *   raw array directly (not reactive). A future phase can add
 *   `presets` to the store and remove the imperative fetch.
 */

import { useState, useCallback } from 'react';
import { useDripSyncContext }     from './DripSyncProvider.jsx';

/**
 * @returns {{
 *   saveOutfitPreset:   (name: string) => Promise<{ ok: boolean, preset?: object, message?: string }>,
 *   applyOutfitPreset:  (presetId: string) => Promise<{ success: boolean, message?: string }>,
 *   fetchPresets:       () => Promise<object[]>,   — imperative list fetch
 *   isSaving:           boolean,
 *   isApplying:         boolean,
 *   lastSaveResult:     object | null,
 *   lastApplyResult:    object | null,
 * }}
 */
export default function useOutfitPresets() {
  const { engine, saveOutfitPreset, applyOutfitPreset, state } = useDripSyncContext();

  const [isSaving,        setIsSaving]        = useState(false);
  const [isApplying,      setIsApplying]       = useState(false);
  const [lastSaveResult,  setLastSaveResult]   = useState(null);
  const [lastApplyResult, setLastApplyResult]  = useState(null);

  const wrappedSave = useCallback(async (name) => {
    setIsSaving(true);
    try {
      const result = await saveOutfitPreset(name);
      setLastSaveResult(result);
      return result;
    } finally {
      setIsSaving(false);
    }
  }, [saveOutfitPreset]);

  const wrappedApply = useCallback(async (presetId) => {
    setIsApplying(true);
    try {
      const result = await applyOutfitPreset(presetId);
      setLastApplyResult(result);
      return result;
    } finally {
      setIsApplying(false);
    }
  }, [applyOutfitPreset]);

  /**
   * Imperatively fetch the preset list for the current user + avatar.
   * Not reactive — call on mount or after a save.
   * Returns [] if engine is not ready.
   */
  const fetchPresets = useCallback(async () => {
    if (!engine) return [];
    const { session, avatar } = state;
    const userId   = session?.userId;
    const avatarId = avatar?.activeAvatarId;
    if (!userId) return [];

    try {
      return await engine._repo.getOutfitPresets(userId, avatarId);
    } catch (_) {
      return [];
    }
  }, [engine, state]);

  return {
    saveOutfitPreset:  wrappedSave,
    applyOutfitPreset: wrappedApply,
    fetchPresets,
    isSaving,
    isApplying,
    lastSaveResult,
    lastApplyResult,
  };
}