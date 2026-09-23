/**
 * useDripSyncEngine
 * ─────────────────────────────────────────────────────────────
 * Stable hook that provides access to the DripSync engine modules.
 * Returns a frozen reference — never re-instantiates the engine.
 *
 * The engine instance comes from DripSyncProvider (session/commerce engine).
 * For the rendering-side engine (AvatarModule, WearableModule, etc.) the
 * modules are accessed via the engine ref passed from the viewport layer.
 *
 * Usage:
 *   const { engine } = useDripSyncEngine();
 *   engine.on('avatar:loaded', handler);
 */

import { useCallback, useRef } from 'react';

/**
 * Minimal stable hook that holds a rendering-engine ref.
 * Call setEngineRef(instance) once from the Viewport once the engine is ready.
 * All returned functions are memoized with useCallback.
 *
 * @returns {{
 *   engineRef: React.MutableRefObject,
 *   setEngineRef: (engine: object) => void,
 *   getAvatar: () => THREE.Group | null,
 *   getStateMachine: () => object | null,
 *   getState: () => object,
 *   loadAvatar: (obj: THREE.Group, meta: object) => void,
 *   addWearable: (wearable: object) => void,
 *   removeWearable: (slot: string) => void,
 *   playAnimation: (name: string, opts?: object) => void,
 *   setEnvironment: (env: object | null) => void,
 *   on: (event: string, cb: Function) => Function,
 *   off: (event: string, cb: Function) => void,
 * }}
 */
export function useDripSyncEngine() {
  const engineRef = useRef(null);

  const setEngineRef = useCallback((engine) => {
    engineRef.current = engine;
  }, []);

  const getAvatar = useCallback(() => {
    return engineRef.current?.getAvatar() ?? null;
  }, []);

  const getStateMachine = useCallback(() => {
    return engineRef.current?.getStateMachine() ?? null;
  }, []);

  const getState = useCallback(() => {
    return engineRef.current?.getState() ?? {};
  }, []);

  const loadAvatar = useCallback((avatarObject, meta = {}) => {
    engineRef.current?.loadAvatar(avatarObject, meta);
  }, []);

  const addWearable = useCallback((wearable) => {
    engineRef.current?.addWearable(wearable);
  }, []);

  const removeWearable = useCallback((slot) => {
    engineRef.current?.removeWearable(slot);
  }, []);

  const playAnimation = useCallback((name, opts = {}) => {
    engineRef.current?.playAnimation(name, opts);
  }, []);

  const setEnvironment = useCallback((env) => {
    engineRef.current?.setEnvironment(env);
  }, []);

  const on = useCallback((event, cb) => {
    return engineRef.current?.on(event, cb) ?? (() => {});
  }, []);

  const off = useCallback((event, cb) => {
    engineRef.current?.off(event, cb);
  }, []);

  return {
    engineRef,
    setEngineRef,
    getAvatar,
    getStateMachine,
    getState,
    loadAvatar,
    addWearable,
    removeWearable,
    playAnimation,
    setEnvironment,
    on,
    off,
  };
}

export default useDripSyncEngine;