/**
 * DripSyncProvider
 * ─────────────────────────────────────────────────────────────
 * Mounts the DripSync runtime once per React tree.
 * Creates the repository → store → engine triad, boots for the
 * current user, and exposes state + engine through context.
 *
 * Auth: reads the user from the project's existing useAuth() hook
 * (@/lib/AuthContext). Pass `userId` prop to override (e.g. in tests).
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import DripSyncRepository from '../backend/DripSyncRepository.js';
import DripSyncStore       from '../core/DripSyncStore.js';
import DripSyncEngine      from '../core/DripSyncEngine.js';
import { DripSyncEvents }  from '../core/DripSyncEvents.js';
import { useAuth }         from '@/lib/AuthContext';

// ── Context ────────────────────────────────────────────────────

export const DripSyncContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────

/**
 * @param {{
 *   userId?:    string,   — override auth source (optional)
 *   children:   React.ReactNode,
 *   onEvent?:   (eventName: string, payload: any) => void,
 * }}
 */
export default function DripSyncProvider({ userId: userIdProp, children, onEvent }) {
  const authCtx = useAuth?.() || {};
  const resolvedUserId = userIdProp || authCtx?.user?.email || null;

  // ── Engine refs (stable across renders) ─────────────────────
  const repoRef   = useRef(null);
  const storeRef  = useRef(null);
  const engineRef = useRef(null);

  // ── React state — driven by store subscription ───────────────
  const [state, setState] = useState(() => DripSyncStore.prototype
    ? new DripSyncStore().getState()   // grab initial shape
    : {}
  );
  const [bootedFor, setBootedFor] = useState(null); // userId we've booted for
  const [bootStatus, setBootStatus] = useState('idle'); // idle | booting | ready | error
  const [bootError,  setBootError]  = useState(null);

  // ── One-time engine creation ─────────────────────────────────
  useEffect(() => {
    const repo   = new DripSyncRepository();
    const store  = new DripSyncStore();
    const engine = new DripSyncEngine({
      repository: repo,
      store,
      onEvent: (name, payload) => {
        // Forward to caller if provided
        if (onEvent) {
          try { onEvent(name, payload); } catch (_) {}
        }
        // Reflect boot lifecycle in local React state
        if (name === DripSyncEvents.BOOT_STARTED)   setBootStatus('booting');
        if (name === DripSyncEvents.BOOT_COMPLETED) setBootStatus('ready');
        if (name === DripSyncEvents.BOOT_FAILED) {
          setBootStatus('error');
          setBootError(payload?.error || 'Boot failed');
        }
      },
    });

    repoRef.current   = repo;
    storeRef.current  = store;
    engineRef.current = engine;

    // Subscribe React state to store updates
    const unsubscribe = store.subscribe((nextState) => {
      setState({ ...nextState });
    });

    // Seed initial state
    setState(store.getState());

    return () => {
      unsubscribe();
      engine.destroy();
      repoRef.current   = null;
      storeRef.current  = null;
      engineRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Boot when userId becomes available ──────────────────────
  useEffect(() => {
    if (!resolvedUserId || !engineRef.current) return;
    if (bootedFor === resolvedUserId) return; // already booted for this user

    setBootedFor(resolvedUserId);
    setBootError(null);

    engineRef.current.boot(resolvedUserId).catch((err) => {
      setBootError(err?.message || 'DripSync boot error');
    });
  }, [resolvedUserId, bootedFor]);

  // ── Reset on logout ──────────────────────────────────────────
  useEffect(() => {
    if (!resolvedUserId && bootedFor && storeRef.current) {
      storeRef.current.reset();
      setBootedFor(null);
      setBootStatus('idle');
      setBootError(null);
    }
  }, [resolvedUserId, bootedFor]);

  // ── Stable action wrappers (never change reference) ─────────
  const equipWearable = useCallback(({ wearableId }) =>
    engineRef.current?.equipWearable({ wearableId }) ?? Promise.resolve({ ok: false }),
  []);

  const unequipSlot = useCallback((slot) =>
    engineRef.current?.unequipSlot(slot) ?? Promise.resolve({ ok: false }),
  []);

  const saveOutfitPreset = useCallback((name) =>
    engineRef.current?.saveOutfitPreset(name) ?? Promise.resolve({ ok: false }),
  []);

  const applyOutfitPreset = useCallback((presetId) =>
    engineRef.current?.applyOutfitPreset(presetId) ?? Promise.resolve({ success: false }),
  []);

  const grantPurchaseEntitlements = useCallback((orderId) =>
    engineRef.current?.grantPurchaseEntitlements(orderId) ?? Promise.resolve({ success: false }),
  []);

  const refreshCloset = useCallback(() =>
    engineRef.current?.refreshCloset() ?? Promise.resolve(),
  []);

  const loadRealm = useCallback((realmId) =>
    engineRef.current?.loadRealm(realmId) ?? Promise.resolve(null),
  []);

  // ── Context value ────────────────────────────────────────────
  const value = {
    // Raw engine — advanced consumers only
    engine: engineRef.current,

    // Full store state (reactive)
    state,

    // Convenience slices
    avatar:  state.avatar  || {},
    closet:  state.closet  || {},
    loadout: state.loadout || {},
    session: state.session || {},

    // Boot meta
    bootStatus,
    bootError,
    isBooting: bootStatus === 'booting',
    isReady:   bootStatus === 'ready',

    // Stable actions
    equipWearable,
    unequipSlot,
    saveOutfitPreset,
    applyOutfitPreset,
    grantPurchaseEntitlements,
    refreshCloset,
    loadRealm,
  };

  return (
    <DripSyncContext.Provider value={value}>
      {children}
    </DripSyncContext.Provider>
  );
}

// ── Internal hook (used by all other hooks) ───────────────────

export function useDripSyncContext() {
  const ctx = useContext(DripSyncContext);
  if (!ctx) {
    throw new Error(
      'useDripSyncContext: component must be rendered inside <DripSyncProvider>.'
    );
  }
  return ctx;
}