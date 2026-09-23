/**
 * Viewport — DripSync Viewport (shell)
 * Re-export from canonical location for clean import paths.
 *
 * Shell responsibilities: receive props, own refs, compose viewport modules.
 * It must not load avatars or create animation state machines independently of the engine.
 *
 * Viewport modules:
 *  ViewportScene.js           — renderer + scene creation
 *  ViewportCamera.js          — camera + OrbitControls + resize
 *  ViewportLighting.js        — lighting presets
 *  ViewportControls.js        — WASD / jump / emote input
 *  ViewportAvatarBridge.js    — attach/remove avatar from scene
 *  ViewportEnvironmentBridge.js — environment attach/remove
 *  ViewportCleanup.js         — GPU resource disposal
 */
export { default } from '../DripSyncViewport';