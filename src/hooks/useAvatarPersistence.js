/**
 * DRIPSYNC AVATAR PERSISTENCE — V2 (Phase C)
 * Restores avatar state from user.avatar_config on login and auto-saves through
 * the canonical saveAvatarProfile backend (ownership-validated).
 *
 * This hook is built on the useAvatarStore context. DripSync.jsx uses its own
 * local state + useAvatarProfilePersistence directly, so this hook is retained
 * for any consumer still on the AvatarStore. Either way, the SAVE path now
 * flows through persistAvatarProfile — no direct base44.auth.updateMe.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useAvatarStore } from './useAvatarStore';
import { useToast } from '@/components/ui/use-toast';
import {
  hydrateRuntimeFromUserConfig, buildCanonicalConfig, fingerprintConfig, persistAvatarProfile,
} from '@/lib/avatarPersistence';

const AUTO_SAVE_DEBOUNCE = 3000; // ms

export function useAvatarPersistence({ user, onUserUpdate }) {
  const { toast } = useToast();
  const { avatarState, loadFullState, markSaved } = useAvatarStore();
  const autoSaveTimerRef = useRef(null);
  const isRestoredRef = useRef(false);
  const lastPersistedFpRef = useRef('');
  const rejectedFpRef = useRef('');
  const revisionRef = useRef(user?.avatar_config?.revision ?? 0);
  const conflictedRef = useRef(false);
  const savingRef = useRef(false);

  // ── Restore avatar state from user.avatar_config on login ────────────────
  const restoreFromProfile = useCallback((userProfile) => {
    if (!userProfile || isRestoredRef.current) return null;
    const hydrated = hydrateRuntimeFromUserConfig(userProfile);
    if (!hydrated || !hydrated.avatarSource) return null;

    isRestoredRef.current = true;
    revisionRef.current = userProfile.avatar_config?.revision ?? 0;
    conflictedRef.current = false;
    lastPersistedFpRef.current = fingerprintConfig(buildCanonicalConfig(hydrated));

    loadFullState({
      avatarUrl: hydrated.avatarSource,
      avatarId: hydrated.avatarId,
      source: hydrated.source,
      gender: hydrated.gender,
      customization: hydrated.customization,
      wearables: hydrated.wearables,
      animations: hydrated.customAnimations,
      environment: hydrated.environment,
      currentRealm: hydrated.currentRealm,
    });
    return hydrated;
  }, [loadFullState]);

  // Reset restore guard when user changes
  useEffect(() => {
    isRestoredRef.current = false;
    lastPersistedFpRef.current = '';
    rejectedFpRef.current = '';
    revisionRef.current = user?.avatar_config?.revision ?? 0;
    conflictedRef.current = false;
  }, [user?.id]);

  // ── Auto-save through saveAvatarProfile (ownership-validated) ───────────
  useEffect(() => {
    if (!user?.id || !avatarState.isDirty) return;
    if (!avatarState.avatarUrl) return;

    const config = buildCanonicalConfig({
      avatarSource: avatarState.avatarUrl,
      avatarId: avatarState.avatarId,
      gender: avatarState.gender,
      customization: avatarState.customization,
      wearables: avatarState.wearables,
      customAnimations: avatarState.customAnimations,
      environment: avatarState.environment,
      currentRealm: avatarState.currentRealm,
    });
    const fp = fingerprintConfig(config);
    if (fp === lastPersistedFpRef.current) return;        // identical — skip
    if (fp === rejectedFpRef.current) return;              // rejected unchanged — skip

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      if (savingRef.current || conflictedRef.current) return;
      savingRef.current = true;
      const res = await persistAvatarProfile(config, {
        expectedRevision: revisionRef.current,
        onUserUpdate: (cfg) => { revisionRef.current = cfg.revision; if (onUserUpdate) onUserUpdate((prev) => (prev ? { ...prev, avatar_config: cfg } : prev)); },
        onUnauthorized: () => { rejectedFpRef.current = fp; },
      });
      savingRef.current = false;
      if (res.status === 409) {
        conflictedRef.current = true;
        toast({ variant: 'destructive', title: 'Avatar changed elsewhere', description: res.error });
      }
      if (res.success) {
        lastPersistedFpRef.current = fp;
        rejectedFpRef.current = '';
        markSaved();
      } else if (res.status === 403) {
        rejectedFpRef.current = fp;
      }
    }, AUTO_SAVE_DEBOUNCE);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [
    user?.id,
    avatarState.isDirty,
    avatarState.avatarUrl,
    avatarState.gender,
    avatarState.customization,
    avatarState.wearables,
    avatarState.customAnimations,
    avatarState.environment,
    avatarState.currentRealm,
    onUserUpdate,
    markSaved,
    toast,
  ]);

  return { restoreFromProfile };
}