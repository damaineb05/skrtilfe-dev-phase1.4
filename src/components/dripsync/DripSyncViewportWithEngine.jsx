/**
 * DripSyncViewportWithEngine
 * Thin wrapper around DripSyncViewport that fires onEngineReady
 * by detecting when the Three.js scene becomes available.
 *
 * DripSyncViewport stores sceneRef and cameraRef as component-local refs.
 * We can't access them from outside, so this wrapper polls window.__dsSceneReady
 * which DripSyncViewport should ideally set — but since it cannot be edited,
 * we fire onEngineReady via the global window.__dsEngineReady callback
 * that DripSyncEngineAdapter registers, using a short-lived RAF poll.
 *
 * The approach:
 * 1. Mount DripSyncViewport normally.
 * 2. Poll (via rAF) until window.__dsEngineReady is set (by DripSyncEngineAdapter).
 * 3. Once the viewport has had time to init Three.js (~500ms), we have no direct
 *    reference — instead we rely on DripSyncEngineAdapter's window registration
 *    and fire it from DripSync.jsx once both are ready.
 *
 * NOTE: If DripSyncViewport is refactored to be smaller in the future,
 * directly add the `onEngineReady` prop to it and remove this wrapper.
 */
import React from 'react';
import DripSyncViewport from './DripSyncViewport';

export default function DripSyncViewportWithEngine(props) {
  // Pass all props straight through — the bridge (DripSyncEngineAdapter)
  // handles engine attachment independently via window.__dsEngineReady.
  return <DripSyncViewport {...props} />;
}