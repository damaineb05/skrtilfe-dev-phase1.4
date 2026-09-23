/**
 * DripSyncViewport — Shell component.
 *
 * Responsibilities:
 *  - Receive props
 *  - Own all refs
 *  - Compose viewport modules (Scene, Camera, Lighting, Controls, AvatarBridge, EnvironmentBridge)
 *  - Run the animation loop
 *  - Render canvas + HUD overlays
 *
 * Does NOT: load avatars independently from the engine, create animation state machines.
 */
import React, { useRef, useEffect, useState, useCallback, useMemo, useImperativeHandle } from 'react';
import { Loader2, Lightbulb, Eye, EyeOff, Maximize2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Viewport modules
import { createRenderer, createScene } from './viewport/ViewportScene.jsx';
import { createCamera, createOrbitControls, createResizeObserver, resetCameraToAvatar, guardCameraPosition } from './viewport/ViewportCamera.jsx';
import { LIGHTING_PRESETS, buildSceneLighting, applyLightingPreset as applyPreset } from './viewport/ViewportLighting.jsx';
import { attachKeyboardListeners, updateMovement, MOVEMENT_SETTINGS } from './viewport/ViewportControls.jsx';
import { attachAvatarToScene, removeAvatarFromScene, ensureAvatarAttached } from './viewport/ViewportAvatarBridge.jsx';
import { resolveSketchfabUrl, clearEnvironment, loadAndAttachEnvironment, loadBackgroundEnvironment } from './viewport/ViewportEnvironmentBridge.jsx';
import { disposeThreeObject } from './viewport/ViewportCleanup.jsx';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

// Existing utilities (unchanged)
import { classifyAvatar, applyCustomizationToAvatar, autoUnifySkinTone } from '../utils/appearanceHelpers';
import { AnimationStateMachine } from './AnimationStateMachine';
import DragJoystick from './DragJoystick';
import { CollisionSystem } from './CollisionSystem';
import { InteractionManager } from './EnvironmentalInteractionSystem';
import { bindWearableToAvatarSkeleton, updateWearableBinding, analyzeWearable, findBoneInSkeleton, getDefaultBoneForSlot } from './WearableAutoBinding';

// New animation engine (production-ready)
import { DripSyncAnimationManager, AnimationState, updateAnimationState, getNextAnimation } from '../../dripsync/core/DripSyncAnimationManager';
import { AnimationUpdateLoop } from '../../dripsync/core/AnimationUpdateLoop';
import { InputHandler } from '../../dripsync/core/InputHandler';
import ViewportInput from '../../dripsync/movement/ViewportInput';
import MovementDevHud from './viewport/MovementDevHud';

// OS World
import { DripSyncOSWorld } from '../../dripsync/os/DripSyncOSWorld';
import DripSyncOSHUD from '../../dripsync/os/DripSyncOSHUD';
import DripSyncOSWindowManager from '../../dripsync/os/DripSyncOSWindowManager';

// ─── Animation resolver with gender support ──────────────────────────────────
import { getAnimationClip, normalizeGender } from '../../utils/animationResolver.js';

// ─── Camera Manager ───────────────────────────────────────────────────────────
import { DripSyncCameraManager, getPresetForStyleTab } from '../../dripsync/camera/DripSyncCameraManager.js';

// ─── Day/Night Detection ────────────────────────────────────────────────────
const DAY_BG   = 'https://media.base44.com/images/public/68bc2773ba0ba8d2da222a27/7899b4788_ChatGPTImageApr262026at07_16_53PM.png';
const NIGHT_BG = 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80';
const DAWN_BG  = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80'; // warm pink/purple sunrise
const DUSK_BG  = 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1920&q=80'; // golden orange sunset

function getBgUrl(tod) {
  if (tod === 'night') return NIGHT_BG;
  if (tod === 'dawn')  return DAWN_BG;
  if (tod === 'dusk')  return DUSK_BG;
  return DAY_BG;
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 6 && h < 8)   return 'dawn';
  if (h >= 8 && h < 18)  return 'day';
  if (h >= 18 && h < 20) return 'dusk';
  return 'night';
}

// ─── Component ───────────────────────────────────────────────────────────────
const DripSyncViewport = React.forwardRef(({
  avatar,
  wearables = [],
  customAnimations = [],
  environment,
  avatarConfig = {},
  avatarGender = 'masculine',
  hardReloadToken,
  previewAnimationUrl,
  selectedWearableId,
  onWearableTransformChange,
  transformMode = 'translate',
  gizmoEnabled = false,
  onStateMachineInit,
  qualityMode = 'high',
  currentBackground = null,
  interactiveObjects = [],
  onNearestInteractable,
  onHeldObjectChange,
  // ── Style camera mode ─────────────────────────────────────────────────────
  styleCameraMode = false,     // true = enter STYLE_VIEW, false = NORMAL_VIEW
  styleCameraFocus = null,     // tab id or slot string for auto-framing
  skinIsolationMap = null,     // passed through (no-op here, consumed by wearable binder)
}, forwardedRef) => {
  // ── DOM refs ──────────────────────────────────────────────────────────────
  const mountRef  = useRef(null);
  const canvasRef = useRef(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [status, setStatus]               = useState('ready');
  const [errorMessage, setErrorMessage]   = useState('');
  const [isMobile, setIsMobile]           = useState(false);
  const [currentPreset, setCurrentPreset] = useState('studio');
  const [showLightingMenu, setShowLightingMenu] = useState(false);
  const [showControls, setShowControls]   = useState(true);
  const [threeModules, setThreeModules]   = useState(null);
  const [timeOfDay, setTimeOfDay]         = useState(getTimeOfDay);

  // ── OS World state ────────────────────────────────────────────────────────
  const [osEnabled, setOsEnabled]             = useState(false);
  const [nearbyDistrict, setNearbyDistrict]   = useState(null);
  const [activeDistrict, setActiveDistrict]   = useState(null);
  const [avatarMapPos, setAvatarMapPos]       = useState({ x: 0, z: 0 });
  const [portalScreenPos, setPortalScreenPos] = useState(null); // projected screen pos for tether
  const osWorldRef = useRef(null);
  const lastDistrictIdRef = useRef(null);

  // ── Third-person click-to-view camera state ───────────────────────────────
  const [tpvLabel, setTpvLabel] = useState(null);
  const tpvAnimRef              = useRef(null);

  // ── Camera manager ref ────────────────────────────────────────────────────
  const cameraManagerRef = useRef(null);

  // ── Three.js core refs ────────────────────────────────────────────────────
  const sceneRef    = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef   = useRef(null);
  const controlsRef = useRef(null);
  const clockRef    = useRef(null);
  const rafRef      = useRef(0);

  // ── Avatar refs ───────────────────────────────────────────────────────────
  const modelRef        = useRef(null);
  const avatarRef       = useRef(null); // canonical avatar ref — always mirrors modelRef, tagged with userData.source
  const lastAvatarRef   = useRef(null);
  const lastAssetUrlRef = useRef(null); // tracks resolved URL to prevent duplicate loads
  const mixerRef        = useRef(null);
  const stateMachineRef = useRef(null);
  const avatarPartsRef  = useRef(null);
  const targetScaleRef  = useRef(1);
  
  // ── Production animation engine refs ───────────────────────────────────────
  const animationManagerRef = useRef(null);
  const animationUpdateLoopRef = useRef(null);
  const inputHandlerRef = useRef(null);

  // ── Wearable refs ─────────────────────────────────────────────────────────
  const wearableObjectsMapRef       = useRef(new Map());
  const equippedWearablesRef        = useRef(new Map()); // Track equipped wearables by id to prevent duplicates
  const transformControlsRef        = useRef(null);
  const selectedWearableObjectRef   = useRef(null);

  // ── Environment refs ──────────────────────────────────────────────────────
  const environmentObjectRef  = useRef(null);
  const lastEnvironmentRef    = useRef(null);
  const colliderMeshesRef     = useRef([]);
  const collisionSystemRef    = useRef(null);
  const environment3DRef      = useRef(null);
  const particleSystemRef     = useRef(null);

  // ── Interaction refs ──────────────────────────────────────────────────────
  const interactionManagerRef    = useRef(null);
  const interactiveObjectsMapRef = useRef(new Map());
  const footIKEnabledRef         = useRef(true);

  // ── Lighting refs ─────────────────────────────────────────────────────────
  const lightsRef = useRef({ ambient: null, key: null, fill: null, rim: null, accent: null, ground: null });

  // ── Input refs ────────────────────────────────────────────────────────────
  const keysRef     = useRef({ w:false, a:false, s:false, d:false, shift:false, space:false, e:false, r:false, q:false, f:false, '1':false,'2':false,'3':false,'4':false,'5':false });
  // Single normalized input layer for movement (keyboard + touch + future gamepad).
  const inputRef    = useRef(null);
  if (inputRef.current === null) inputRef.current = new ViewportInput();
  const runModeRef  = useRef(false);
  const emoteLockRef  = useRef(false);
  const idleOverrideRef = useRef('None');
  const velocityRef   = useRef(null);
  const onGroundRef   = useRef(true);
  const isMobileRunningRef = useRef(false);
  const customAnimationsRef = useRef(customAnimations);
  useEffect(() => { customAnimationsRef.current = customAnimations; }, [customAnimations]);

  // ── Mobile detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Time-of-day: manual override or auto-detect ──────────────────────────
  const [timeOverride, setTimeOverride] = useState(null); // null = auto

  const cycleTimeOfDay = () => {
    const cycle = ['day', 'night', 'dawn', 'dusk'];
    setTimeOverride(prev => {
      const current = prev ?? timeOfDay;
      const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
      return next;
    });
  };

  const effectiveTimeOfDay = timeOverride ?? timeOfDay;

  // Auto-poll only when not overridden
  useEffect(() => {
    if (timeOverride !== null) return;
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeOverride]);

  // ── Controls visibility pref ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dripsync-show-controls');
      if (saved !== null) setShowControls(saved === 'true');
    } catch (_) { /* ignore */ }
  }, []);

  // ── Load Three.js modules ─────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const THREE = await import('three');
        if (!mounted) return;
        setThreeModules({ THREE, GLTFLoader, FBXLoader, OrbitControls, SkeletonUtils, TransformControls });
        clockRef.current    = new THREE.Clock();
        velocityRef.current = new THREE.Vector3();
        onGroundRef.current = true;
        // Engine ready
      } catch (err) {
        console.error('Failed to load Three.js modules:', err);
        if (mounted) { setStatus('error'); setErrorMessage('Failed to load 3D engine. Please refresh the page.'); }
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ── Initialize CameraManager once Three.js is ready ──────────────────────
  useEffect(() => {
    if (!threeModules) return;
    cameraManagerRef.current = new DripSyncCameraManager(cameraRef, controlsRef, threeModules.THREE);
    return () => {
      cameraManagerRef.current?.dispose();
      cameraManagerRef.current = null;
    };
  }, [threeModules]);

  // ── React to styleCameraMode prop changes ──────────────────────────────────
  useEffect(() => {
    const mgr = cameraManagerRef.current;
    if (!mgr) return;
    if (styleCameraMode) {
      // Force avatar to idle while in style mode
      if (stateMachineRef.current?.currentState !== 'idle') {
        stateMachineRef.current?.transitionTo('idle', { force: true });
      }
      // Lock movement input (normalized layer)
      inputRef.current?.reset();
      mgr.enterStyleMode();
    } else {
      mgr.exitStyleMode();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleCameraMode]);

  // ── React to styleCameraFocus changes (auto-frame by tab/slot) ─────────────
  useEffect(() => {
    const mgr = cameraManagerRef.current;
    if (!mgr || !mgr.isStyleMode || !styleCameraFocus) return;
    const preset = getPresetForStyleTab(styleCameraFocus);
    mgr.focusPreset(preset);
  }, [styleCameraFocus]);

  // ── Lighting preset toggle ────────────────────────────────────────────────
  const handleLightingPreset = useCallback((presetName) => {
    if (!threeModules || !sceneRef.current) return;
    applyPreset(presetName, threeModules.THREE, sceneRef.current, lightsRef);
    setCurrentPreset(presetName);
  }, [threeModules]);

  const toggleControls = useCallback(() => {
    setShowControls(prev => {
      const next = !prev;
      try { localStorage.setItem('dripsync-show-controls', next.toString()); } catch (_) { /* ignore */ }
      return next;
    });
  }, []);

  // ── Helpers used across effects ───────────────────────────────────────────
  const getUrlFromSrc = useCallback(async (src) => {
    if (!src) return null;
    if (typeof src === 'string') return src;
    if (src instanceof File || src instanceof Blob) return URL.createObjectURL(src);
    return null;
  }, []);

  const clampScale = useCallback(() => {
    const m = modelRef.current;
    if (!m) return;
    if (m.scale.x < 0.5) m.scale.setScalar(0.5);
    if (m.scale.x > 2.5) m.scale.setScalar(2.5);
  }, []);

  const verifyAvatarVisible = useCallback(() => {
    const model = modelRef.current;
    const scene = sceneRef.current;
    if (!model || !scene) return;
    // Re-add if model was removed from scene without clearing the ref
    if (!scene.children.includes(model)) {
      scene.add(model);
    }
    ensureAvatarAttached(scene, model);
    clampScale();
    guardCameraPosition(cameraRef, modelRef);
  }, [clampScale]);

  // ── Animation clip loader (gender-aware) ──────────────────────────────────────
  const loadAnimationClips = useCallback(async (sources) => {
    const { THREE } = threeModules || {};
    if (!THREE || !modelRef.current) return;
    const target = modelRef.current;
    const mixer  = mixerRef.current || new THREE.AnimationMixer(target);
    mixerRef.current = mixer;

    if (!stateMachineRef.current) {
      stateMachineRef.current = new AnimationStateMachine(mixer, THREE);
      if (onStateMachineInit) onStateMachineInit(stateMachineRef.current);
    }

    const failedAnimations = [];
    for (const { name, url, isEmote } of sources) {
      if (!stateMachineRef.current || stateMachineRef.current.actions[name.toLowerCase()]) continue;
      try {
        let clips = [];
        const withTimeout = (fn) => Promise.race([fn(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 30000))]);
        if (url.toLowerCase().endsWith('.fbx')) {
          if (FBXLoader && SkeletonUtils) {
            const fbx = await withTimeout(() => new FBXLoader().loadAsync(url));
            clips = (fbx.animations || []).map(c => SkeletonUtils.retargetClip(target, fbx, c));
          }
        } else if (GLTFLoader) {
          const gltf = await withTimeout(() => new GLTFLoader().loadAsync(url));
          clips = (gltf.animations || []).map(c => { try { return SkeletonUtils ? SkeletonUtils.retargetClip(target, gltf.scene, c) : c; } catch { return c; } });
        }
        if (!clips.length) { failedAnimations.push(name); continue; }
        const best  = clips.sort((a, b) => b.duration - a.duration)[0];
        const hips  = ['Hips','mixamorig:Hips','Armature|Hips'];
        const tracks = best.tracks.filter(t => !hips.some(h => t.name.startsWith(`${h}.position`)));
        const clip   = new THREE.AnimationClip(name, best.duration, tracks);
        const action = mixer.clipAction(clip);
        stateMachineRef.current.registerAction(name, action, { isEmote: isEmote || false, duration: best.duration * 1000 });
      } catch (_) { failedAnimations.push(name); }
    }
    const critical = failedAnimations.filter(n => ['idle','walk','run'].includes(n.toLowerCase()));
    if (critical.length === 3) throw new Error('Failed to load critical animations.');
  }, [threeModules, onStateMachineInit]);

  const loadLocomotionClips = useCallback(async () => {
    const { THREE } = threeModules || {};
    if (!THREE || !modelRef.current) return;
    if (!mixerRef.current) mixerRef.current = new THREE.AnimationMixer(modelRef.current);
    // State machine is created before this is called during avatar load — just ensure it exists
    if (!stateMachineRef.current) {
      stateMachineRef.current = new AnimationStateMachine(mixerRef.current, THREE);
    }
    
    // ── Load gender-based animation set ──────────────────────────────
    const normalizedGender = normalizeGender(avatarGender);
    const locomotionStates = ['idle', 'walk', 'run', 'backward', 'strafeLeft', 'strafeRight', 'jump'];
    const sources = locomotionStates.map(state => {
      const url = getAnimationClip(normalizedGender, state);
      return { name: state, url: url || '', isEmote: false };
    }).filter(s => s.url);
    
    try {
      await loadAnimationClips(sources);
      if (stateMachineRef.current?.actions?.idle) stateMachineRef.current.transitionTo('idle', { force: true });
    } catch (err) {
      // Some animations failed to load — gracefully continue in T-pose
      if (stateMachineRef.current?.actions?.idle) stateMachineRef.current.transitionTo('idle', { force: true });
    }
  }, [threeModules, loadAnimationClips, avatarGender]);

  // ── setAction (for external emote / animation URL triggers) ──────────────
  const setAction = useCallback(async (nameOrUrl, force = false, playAsOneOff = false) => {
    if (!stateMachineRef.current || !threeModules || !modelRef.current || !mixerRef.current) return;
    const { THREE } = threeModules;
    const mixer = mixerRef.current;
    const model = modelRef.current;
    let animName = nameOrUrl.toLowerCase();
    let actionData = stateMachineRef.current.actions[animName];

    if (nameOrUrl.startsWith('http') && !actionData) {
      try {
        let clips = [];
        if (nameOrUrl.toLowerCase().endsWith('.fbx')) {
          if (FBXLoader) { const fbx = await new FBXLoader().loadAsync(nameOrUrl); clips = fbx.animations || []; }
        } else if (GLTFLoader) {
          const gltf = await new GLTFLoader().loadAsync(nameOrUrl); clips = gltf.animations || [];
        }
        if (clips.length > 0) {
          animName = `dynamic_${Date.now()}`;
          const best = clips.sort((a, b) => b.duration - a.duration)[0];
          let retargeted = best;
          if (SkeletonUtils) {
            try {
              // Reuse the already-loaded GLTF scene for retargeting — avoid second network fetch
              const srcGltf = nameOrUrl.toLowerCase().endsWith('.fbx') ? null
                : await new GLTFLoader().loadAsync(nameOrUrl).catch(() => null);
              if (srcGltf) retargeted = SkeletonUtils.retargetClip(model, srcGltf.scene, best);
            } catch (_) { /* use raw clip if retargeting fails */ }
          }
          const hips   = ['Hips','mixamorig:Hips','Armature|Hips'];
          const tracks = retargeted.tracks.filter(t => !hips.some(h => t.name.startsWith(`${h}.position`)));
          const clip   = new THREE.AnimationClip(animName, retargeted.duration, tracks);
          const action = mixer.clipAction(clip);
          stateMachineRef.current.registerAction(animName, action, { isEmote: playAsOneOff, duration: retargeted.duration * 1000 });
          actionData = stateMachineRef.current.actions[animName];
        } else { return; }
      } catch (_) { return; }
    }

    if (!actionData) {
      const map = { w:'walk',forward:'walk',s:'backward',backward:'backward',a:'strafeLeft',strafeleft:'strafeLeft',d:'strafeRight',straferight:'strafeRight',shift:'run',run:'run',sprint:'run',space:'jump',jump:'jump',jumping:'jump',idle:'idle',rest:'idle' };
      const mapped = map[animName];
      if (mapped && stateMachineRef.current.actions[mapped.toLowerCase()]) { animName = mapped.toLowerCase(); }
      else { return; }
    }

    if (playAsOneOff) stateMachineRef.current.preview(animName);
    else stateMachineRef.current.transitionTo(animName, { force });
    requestAnimationFrame(() => verifyAvatarVisible());
  }, [threeModules, verifyAvatarVisible]);

  // ── Remove wearable by id ────────────────────────────────────────────────
  const removeWearable = useCallback((id) => {
    if (!avatarRef.current) return;
    
    const wearable = equippedWearablesRef.current.get(id);
    if (!wearable) {
      console.log('[DripSync] WEARABLE NOT FOUND:', id);
      return;
    }

    // Remove from avatar
    avatarRef.current.remove(wearable);
    
    // Dispose GPU resources (geometry, materials)
    disposeThreeObject(wearable);

    // Remove from state maps
    equippedWearablesRef.current.delete(id);
    wearableObjectsMapRef.current.delete(id);

    console.log('[DripSync] WEARABLE REMOVED:', id);
  }, []);

  // ── Safe scene reset ──────────────────────────────────────────────────────
  const resetDripSyncScene = useCallback(() => {
    if (!sceneRef.current) return;

    // Remove all objects except camera and lights
    const objectsToRemove = [];
    sceneRef.current.children.forEach((obj) => {
      // Keep camera (it won't be a child of scene, but guard anyway)
      if (obj === cameraRef.current) return;
      // Keep lights
      if (obj.isLight) return;
      objectsToRemove.push(obj);
    });

    // Remove and dispose objects
    objectsToRemove.forEach((obj) => {
      sceneRef.current.remove(obj);
      disposeThreeObject(obj);
    });

    // Clear avatar and wearable state
    avatarRef.current = null;
    modelRef.current = null;
    equippedWearablesRef.current.clear();
    wearableObjectsMapRef.current.clear();
    lastAvatarRef.current = null;
    lastAssetUrlRef.current = null;

    // Reset animation mixer/state machine
    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      // modelRef is already nulled above — uncacheRoot needs the original ref, skip it safely
      mixerRef.current = null;
    }
    stateMachineRef.current = null;

    console.log('[DripSync] SCENE RESET');
  }, []);

  // ── Reset keys on mobile/desktop switch ──────────────────────────────────
  useEffect(() => {
    keysRef.current = { w:false,a:false,s:false,d:false,shift:false,space:false,e:false,r:false,'1':false,'2':false,'3':false,'4':false,'5':false };
    isMobileRunningRef.current = false;
    runModeRef.current = false;
    if (stateMachineRef.current?.currentState !== 'idle') stateMachineRef.current?.transitionTo('idle', { force: true });
  }, [isMobile]);

  // ── Environment: animate floating objects ─────────────────────────────────
  const animate3DEnvironment = useCallback((delta) => {
    if (!environment3DRef.current) return;
    const time = Date.now() * 0.001;
    environment3DRef.current.traverse((child) => {
      if (child.userData.floatSpeed) {
        child.position.y += Math.sin(time * child.userData.floatSpeed + child.userData.floatOffset) * 0.002;
        child.rotation.x += child.userData.rotateSpeed * delta;
        child.rotation.y += child.userData.rotateSpeed * 0.5 * delta;
      }
    });
    if (particleSystemRef.current) {
      const pos = particleSystemRef.current.geometry.attributes.position.array;
      const vel = particleSystemRef.current.geometry.userData.velocities;
      const isRain = particleSystemRef.current.userData.isRain;
      for (let i = 0; i < pos.length / 3; i++) {
        if (isRain) { pos[i*3+1] -= vel[i]*delta*10; if (pos[i*3+1]<0){ pos[i*3+1]=30; pos[i*3]=(Math.random()-0.5)*50; pos[i*3+2]=(Math.random()-0.5)*50; } }
        else { pos[i*3+1] += vel[i]*delta*0.5; if (pos[i*3+1]>30) pos[i*3+1]=0; }
      }
      particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // INIT EFFECT — renderer / scene / camera / lighting / controls / loop
  // Runs ONCE when threeModules become available.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current || !canvasRef.current || !threeModules) return;
    const { THREE } = threeModules;
    let mounted = true;

    // Scene & Renderer
    const scene    = createScene(THREE);
    const renderer = createRenderer(THREE, canvasRef.current, mountRef.current.clientWidth, mountRef.current.clientHeight);
    sceneRef.current    = scene;
    rendererRef.current = renderer;

    // Ground plane — visible gray surface
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.95, metalness: 0.0 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    ground.userData.isDefaultGround = true;
    scene.add(ground);

    // Grid overlay on top of ground
    const gridHelper = new THREE.GridHelper(200, 100, 0x9ca3af, 0x9ca3af);
    gridHelper.position.y = 0.002;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.22;
    gridHelper.userData.isDefaultGrid = true;
    scene.add(gridHelper);

    // Sky background — picks day or night image based on current time
    const tod = effectiveTimeOfDay;
    const bgUrl = getBgUrl(tod);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      bgUrl,
      (tex) => { scene.background = tex; },
      undefined,
      () => { scene.background = new THREE.Color(tod === 'night' ? 0x0a0a1a : tod === 'dusk' ? 0x1a0a05 : tod === 'dawn' ? 0x1a0a1a : 0x87ceeb); }
    );

    // Camera & Orbit Controls
    const camera = createCamera(THREE, mountRef.current.clientWidth, mountRef.current.clientHeight, cameraRef);
    createOrbitControls(OrbitControls, camera, renderer.domElement, controlsRef);

    // Default camera position: slightly above ground, facing forward
    camera.position.set(0, 2.5, 6);
    camera.lookAt(0, 1.0, 0);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 1.0, 0);
      controlsRef.current.minDistance = 1.5;
      controlsRef.current.maxDistance = 20;
      controlsRef.current.maxPolarAngle = Math.PI / 2 - 0.05; // prevent clipping into ground
      controlsRef.current.update();
    }

    // Lighting
    const appliedPreset = buildSceneLighting(THREE, scene, lightsRef);
    setCurrentPreset(appliedPreset);

    // Resize observer
    const resizeObs = createResizeObserver(mountRef.current, cameraRef, rendererRef);

    // Keyboard listeners — attach on every device. On pure touch devices they
    // are harmless (no physical keys); on touch-capable desktops this restores
    // WASD / Space that the old touch-only guard incorrectly disabled.
    let removeKeys = attachKeyboardListeners({
      input: inputRef.current, keysRef, runModeRef, emoteLockRef, velocityRef, stateMachineRef,
      interactionManagerRef, modelRef, threeModules,
      getCustomAnimations: () => customAnimationsRef.current,
    });

    // If no avatar, mark ready immediately after scene init
    if (!avatar) setStatus('ready');

    // ── Build OS World (if enabled) ──────────────────────────────────────
    // We build it here so it shares the same Three.js scene
    // The osEnabled flag is checked reactively below, but we also expose a
    // ref so the animation loop can call world.update(delta).
    if (osWorldRef.current) { osWorldRef.current.dispose(); osWorldRef.current = null; }

    // Animation loop
    const animate = () => {
     if (!mounted) return;
     rafRef.current = requestAnimationFrame(animate);
     const delta = clockRef.current?.getDelta() || 0.016;

     clampScale();

     // Smooth scale
     if (modelRef.current && threeModules) {
       const m = modelRef.current, t = targetScaleRef.current, s = m.scale.x;
       const smoothed = THREE.MathUtils.damp(s, t, 8, delta);
       if (Math.abs(smoothed - s) > 1e-4) m.scale.setScalar(smoothed);
     }

     // Movement — the single controller. updateMovement is the only code that
     // mutates modelRef.position. Reads normalized input (keyboard + touch).
     if (stateMachineRef.current) {
       updateMovement(THREE, delta, {
         input: inputRef.current, runModeRef, emoteLockRef, idleOverrideRef,
         velocityRef, onGroundRef, stateMachineRef, mixerRef, controlsRef,
         collisionSystemRef, colliderMeshesRef, modelRef, camera,
       });
     }

     animate3DEnvironment(delta);
     wearableObjectsMapRef.current.forEach((w) => { if (w.userData.boundToSkeleton) updateWearableBinding(w, delta); });
     if (interactionManagerRef.current && footIKEnabledRef.current) interactionManagerRef.current.update(delta);
     if (controlsRef.current) controlsRef.current.update();

     // ── OS World update ──────────────────────────────────────────────
     if (osWorldRef.current) {
       osWorldRef.current.update(delta);
       // Check avatar proximity
       const model = modelRef.current;
       if (model) {
         const pos = model.position;
         setAvatarMapPos({ x: pos.x, z: pos.z });
         const district = osWorldRef.current.getDistrictAtPosition(pos);
         const distId = district?.id || null;
         if (distId !== lastDistrictIdRef.current) {
           lastDistrictIdRef.current = distId;
           setNearbyDistrict(district || null);
           if (district) osWorldRef.current.highlightDistrict(district.id);
           else osWorldRef.current.clearHighlight();
         }
       }
     }

     rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      removeKeys();
      resizeObs.disconnect();
      controlsRef.current?.dispose();
      rendererRef.current?.dispose();
      interactionManagerRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threeModules, clampScale, animate3DEnvironment]);

  // ─────────────────────────────────────────────────────────────────────────
  // AVATAR LOADING EFFECT
  // ─────────────────────────────────────────────────────────────────────────
  // When avatar is cleared after being set, reset tracking refs
  useEffect(() => {
    if (!avatar) {
      lastAvatarRef.current   = null;
      lastAssetUrlRef.current = null;
      avatarRef.current       = null;
    }
  }, [avatar]);

  // When hardReloadToken changes (e.g. loading a saved avatar), bust the duplicate-load guards
  // so the avatar loading effect always fires even if the URL base is the same.
  useEffect(() => {
    if (!hardReloadToken) return;
    lastAvatarRef.current   = null;
    lastAssetUrlRef.current = null;
  }, [hardReloadToken]);

  useEffect(() => {
    if (!threeModules || !sceneRef.current || lastAvatarRef.current === avatar) return;
    if (!avatar) return; // handled by effect above
    const { THREE } = threeModules;
    let mounted = true;

    (async () => {
      try {
        if (!avatar) { setStatus('ready'); return; }

        const avatarUrl = await getUrlFromSrc(avatar);
        if (!avatarUrl) { setStatus('ready'); return; }

        // ── Duplicate load guard (primary check via userData.source on avatarRef) ──
        if (avatarRef.current?.userData?.source === avatarUrl) {
          console.log('[DripSync] Skipping duplicate avatar load:', avatarUrl);
          lastAvatarRef.current = avatar;
          lastAssetUrlRef.current = avatarUrl;
          return;
        }
        // Secondary guard: same resolved URL already tracked
        if (lastAssetUrlRef.current === avatarUrl) {
          console.log('[DripSync] Skipping duplicate asset load (url match):', avatarUrl);
          lastAvatarRef.current = avatar;
          return;
        }

        // ── Remove previous avatar ────────────────────────────────────────────
        if (avatarRef.current) {
          console.log('[DripSync] AVATAR REMOVED:', avatarRef.current.userData?.source || 'unknown');
          removeAvatarFromScene(sceneRef.current, modelRef, mixerRef, stateMachineRef, wearableObjectsMapRef);
          avatarRef.current = null;
          equippedWearablesRef.current.clear();
        } else if (modelRef.current) {
          // Fallback: modelRef set without avatarRef (shouldn't happen, but guard it)
          sceneRef.current.remove(modelRef.current);
          disposeThreeObject(modelRef.current);
          modelRef.current = null;
        }
        wearableObjectsMapRef.current.clear();

        // ── Load new avatar ───────────────────────────────────────────────────
        const gltf = await new GLTFLoader().loadAsync(avatarUrl);
        if (!mounted) return;

        const model = gltf.scene;
        if (!model?.children?.length) throw new Error('Loaded model is empty');

        // Tag avatar with source URL for future duplicate detection
        model.userData.source = avatarUrl;

        // Store in both refs immediately
        modelRef.current  = model;
        avatarRef.current = model;

        // Attach to scene (guard against double-add)
        if (!sceneRef.current.children.includes(model)) {
          attachAvatarToScene(THREE, sceneRef.current, model, modelRef);
        }
        console.log('[DripSync] AVATAR LOADED:', avatarUrl);

        lastAvatarRef.current = avatar;
        lastAssetUrlRef.current = avatarUrl;

        // Systems
        collisionSystemRef.current = new CollisionSystem(sceneRef.current, model);
        if (colliderMeshesRef.current.length > 0) collisionSystemRef.current.updateColliders(colliderMeshesRef.current);

        interactionManagerRef.current = new InteractionManager(sceneRef.current, model, {
          onObjectNear:  (obj) => { if (onNearestInteractable) onNearestInteractable(obj); },
          onObjectFar:   ()    => { if (onNearestInteractable) onNearestInteractable(null); },
          onInteraction: (type, obj) => {
            if (type === 'pickup') {
              const hand = obj === interactionManagerRef.current?.heldObjectRight ? 'right' : 'left';
              if (onHeldObjectChange) onHeldObjectChange(hand, obj);
            } else if (type === 'drop' || type === 'throw') {
              if (onHeldObjectChange) { onHeldObjectChange('left', null); onHeldObjectChange('right', null); }
            }
          },
        });

        // Appearance
        avatarPartsRef.current = classifyAvatar(model);
        autoUnifySkinTone(model, THREE);
        if (avatarConfig && avatarPartsRef.current) applyCustomizationToAvatar(model, avatarPartsRef.current, avatarConfig, THREE);

        // Mixer + state machine — always fresh on new avatar load
        const mixer = new THREE.AnimationMixer(model);
        mixerRef.current = mixer;
        stateMachineRef.current = new AnimationStateMachine(mixer, THREE);
        if (onStateMachineInit) onStateMachineInit(stateMachineRef.current);

        // Built-in GLB clips
        if (gltf.animations.length > 0) {
          gltf.animations.forEach(clip => {
            const action = mixer.clipAction(clip);
            stateMachineRef.current?.registerAction(clip.name, action, {
              isEmote: action.loop === THREE.LoopOnce,
              duration: clip.duration * 1000,
            });
          });
        }

        await loadLocomotionClips().catch(() => { /* animation loading partial failure — T-pose fallback */ });

        // Auto-frame camera to model bounds
        if (cameraRef.current && controlsRef.current) {
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3()).length();
          const center = box.getCenter(new THREE.Vector3());
          cameraRef.current.position.set(center.x, center.y + size, center.z + size * 2);
          cameraRef.current.lookAt(center);
          controlsRef.current.target.copy(center);
          controlsRef.current.update();
        }

        setStatus('ready');
      } catch (_) {
        setStatus('ready');
        lastAvatarRef.current   = null;
        lastAssetUrlRef.current = null;
        avatarRef.current       = null;
      }
    })();
    return () => { mounted = false; };
  // NOTE: avatarConfig intentionally excluded — customization is applied by the separate effect below.
  // onStateMachineInit excluded — it's stable from parent (useCallback) and doesn't need to re-trigger load.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatar, threeModules, getUrlFromSrc, loadLocomotionClips]);

  // ─────────────────────────────────────────────────────────────────────────
  // ENVIRONMENT (user-provided) LOADING EFFECT
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!threeModules || !sceneRef.current) return;
    const { THREE } = threeModules;
    let mounted = true;

    const envUrl = environment?.url || environment?.modelUrl;
    if (lastEnvironmentRef.current === envUrl && envUrl) return;

    (async () => {
      setErrorMessage(''); // clear stale errors on new environment attempt
      try {
        if (envUrl) {
          let finalUrl = await getUrlFromSrc(envUrl);
          if (!finalUrl || !mounted) return;
          // Guard: must be GLB/GLTF
          const isGlb = finalUrl.toLowerCase().includes('.glb') || finalUrl.toLowerCase().includes('.gltf');
          if (!isGlb) {
            setErrorMessage('Environment URL must point to a .glb or .gltf file');
            return;
          }
          finalUrl = resolveSketchfabUrl(finalUrl);

          await loadAndAttachEnvironment({
            finalUrl, environment, THREE, GLTFLoader,
            scene: sceneRef.current, environmentObjectRef, lastEnvironmentRef,
            colliderMeshesRef, collisionSystemRef, modelRef, velocityRef, onGroundRef,
            cameraRef, controlsRef, envUrl,
          });
        } else if (!envUrl && environmentObjectRef.current) {
          clearEnvironment(sceneRef.current, environmentObjectRef, lastEnvironmentRef, colliderMeshesRef, collisionSystemRef);
        }
      } catch (err) {
        // Environment load failed — silently clear and show message in UI
        setErrorMessage(`Environment failed to load: ${err.message || 'Unknown error'}`);
        if (environmentObjectRef.current) {
          sceneRef.current.remove(environmentObjectRef.current);
          disposeThreeObject(environmentObjectRef.current);
          environmentObjectRef.current = null;
        }
        lastEnvironmentRef.current = null;
      }
    })();
    return () => { mounted = false; };
  }, [environment, threeModules, getUrlFromSrc]);

  // ─────────────────────────────────────────────────────────────────────────
  // CURRENT BACKGROUND (3d-environment type) LOADING EFFECT
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!threeModules || !sceneRef.current) return;
    // Only load if it's explicitly a 3d-environment type with a GLB/GLTF URL
    if (!currentBackground) return;
    if (currentBackground.type !== '3d-environment') return;
    const modelUrl = currentBackground.modelUrl;
    if (!modelUrl || typeof modelUrl !== 'string') return;
    // Guard: must be a GLB/GLTF file, not a JSON or other format
    const isGlbOrGltf = modelUrl.toLowerCase().includes('.glb') || modelUrl.toLowerCase().includes('.gltf');
    if (!isGlbOrGltf) {
      console.warn('[DripSync] currentBackground.modelUrl is not a GLB/GLTF — skipping load:', modelUrl);
      return;
    }
    const { THREE } = threeModules;

    loadBackgroundEnvironment({
      modelUrl,
      config: currentBackground.config,
      THREE, GLTFLoader,
      scene: sceneRef.current,
      environmentObjectRef,
      colliderMeshesRef,
      collisionSystemRef,
    }).catch((err) => {
      console.warn('[DripSync] Background environment load failed:', err.message);
    });
  }, [currentBackground, threeModules]);

  // ─────────────────────────────────────────────────────────────────────────
  // WEARABLES LOADING EFFECT (Basic attachment system)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!threeModules || !sceneRef.current || !modelRef.current || !avatarRef.current) return;
    const { THREE } = threeModules;
    let mounted = true;

    (async () => {
      for (const item of wearables) {
        if (!item.url) continue;

        // ── Duplicate prevention ──────────────────────────────────────────
        if (equippedWearablesRef.current.has(item.id)) {
          console.log('[DripSync] WEARABLE SKIPPED:', item.id, item.name);
          continue;
        }

        const url = await getUrlFromSrc(item.url);
        if (!url || !mounted) continue;

        try {
          let gltf;
          try { gltf = await new GLTFLoader().loadAsync(url); }
          catch { continue; } // skip silently if wearable fails to load

          const wearable = gltf.scene;
          if (!wearable?.children?.length) continue;

          // ── Tag wearable metadata ─────────────────────────────────────
          wearable.userData.wearableId   = item.id;
          wearable.userData.wearableName = item.name;

          // ── Apply transforms (position, rotation, scale) ───────────────
          wearable.position.set(0, 0, 0);
          wearable.rotation.fromArray(item.rotation || [0, 0, 0]);
          wearable.scale.setScalar(item.scale || 1);

          // ── Cast/receive shadows ──────────────────────────────────────
          wearable.traverse(c => {
            if (c.isMesh) {
              c.castShadow = true;
              c.receiveShadow = true;
            }
          });

          // ── Attach as child of avatar ─────────────────────────────────
          avatarRef.current.add(wearable);
          equippedWearablesRef.current.set(item.id, wearable);
          wearableObjectsMapRef.current.set(item.id, wearable);

          console.log('[DripSync] WEARABLE ATTACHED:', item.id, item.name);
        } catch (_) { /* wearable load failed — skip silently */ }
      }

      // ── Remove detached wearables ─────────────────────────────────────
      const ids = new Set(wearables.map(w => w.id));
      equippedWearablesRef.current.forEach((obj, id) => {
        if (!ids.has(id)) {
          obj.parent?.remove(obj);
          disposeThreeObject(obj);
          equippedWearablesRef.current.delete(id);
          wearableObjectsMapRef.current.delete(id);
        }
      });
    })();
    return () => { mounted = false; };
  }, [wearables, threeModules, getUrlFromSrc]);

  // ─────────────────────────────────────────────────────────────────────────
  // INTERACTIVE OBJECTS LOADING EFFECT
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!threeModules || !sceneRef.current || !interactiveObjects?.length) return;
    let mounted = true;

    (async () => {
      for (const obj of interactiveObjects) {
        if (!obj.url || interactiveObjectsMapRef.current.has(obj.id)) continue;
        try {
          const gltf = await new GLTFLoader().loadAsync(obj.url);
          if (!mounted) return;
          const s = gltf.scene;
          s.position.fromArray(obj.position || [0,0,-3]);
          s.rotation.fromArray(obj.rotation || [0,0,0]);
          s.scale.setScalar(obj.scale || 1);
          s.userData.interactionType = obj.interactionType;
          s.userData.objectId = obj.id;
          s.userData.isInteractive = true;
          s.traverse(c => { if (c.isMesh) { c.castShadow=true; c.receiveShadow=true; } });
          sceneRef.current.add(s);
          interactiveObjectsMapRef.current.set(obj.id, s);
          if (interactionManagerRef.current) interactionManagerRef.current.registerInteractable(s, obj.interactionType);
        } catch (_) { /* interactive object load failed — skip silently */ }
      }
      const ids = new Set(interactiveObjects.map(o => o.id));
      interactiveObjectsMapRef.current.forEach((s, id) => {
        if (!ids.has(id)) { s.parent?.remove(s); disposeThreeObject(s); interactiveObjectsMapRef.current.delete(id); }
      });
    })();
    return () => { mounted = false; };
  }, [interactiveObjects, threeModules]);

  // ─────────────────────────────────────────────────────────────────────────
  // WEARABLE TRANSFORM SYNC EFFECT
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!wearableObjectsMapRef.current.size) return;
    wearables.forEach(w => {
      const obj = wearableObjectsMapRef.current.get(w.id);
      if (!obj) return;
      const p = w.position || [0,0,0], r = w.rotation || [0,0,0];
      if (Math.abs(obj.position.x-p[0])>0.0001||Math.abs(obj.position.y-p[1])>0.0001||Math.abs(obj.position.z-p[2])>0.0001) obj.position.fromArray(p);
      if (Math.abs(obj.rotation.x-r[0])>0.001 ||Math.abs(obj.rotation.y-r[1])>0.001 ||Math.abs(obj.rotation.z-r[2])>0.001)  obj.rotation.fromArray(r);
      if (Math.abs(obj.scale.x-(w.scale||1))>0.0001) obj.scale.setScalar(w.scale||1);
    });
  }, [wearables]);

  // ─────────────────────────────────────────────────────────────────────────
  // TRANSFORM CONTROLS (GIZMO)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!threeModules || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const tc = new TransformControls(cameraRef.current, rendererRef.current.domElement);
    tc.setMode(transformMode); tc.setSize(0.75); tc.visible = false;
    sceneRef.current.add(tc);
    transformControlsRef.current = tc;

    tc.addEventListener('dragging-changed', (e) => { if (controlsRef.current) controlsRef.current.enabled = !e.value; });

    let timeout = null;
    tc.addEventListener('objectChange', () => {
      if (!selectedWearableObjectRef.current || !onWearableTransformChange) return;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const o = selectedWearableObjectRef.current;
        onWearableTransformChange(selectedWearableId, {
          position: [o.position.x, o.position.y, o.position.z],
          rotation: [o.rotation.x, o.rotation.y, o.rotation.z],
          scale: o.scale.x,
        });
      }, 50);
    });

    return () => {
      clearTimeout(timeout);
      if (transformControlsRef.current) {
        transformControlsRef.current.detach();
        sceneRef.current?.remove(transformControlsRef.current);
        transformControlsRef.current.dispose();
        transformControlsRef.current = null;
      }
    };
  }, [threeModules, transformMode, onWearableTransformChange, selectedWearableId]);

  useEffect(() => { if (transformControlsRef.current) transformControlsRef.current.setMode(transformMode); }, [transformMode]);

  useEffect(() => {
    if (!transformControlsRef.current) return;
    if (!selectedWearableId || !gizmoEnabled) {
      transformControlsRef.current.detach(); transformControlsRef.current.visible = false; selectedWearableObjectRef.current = null; return;
    }
    const obj = wearableObjectsMapRef.current.get(selectedWearableId);
    if (obj?.parent) { transformControlsRef.current.attach(obj); transformControlsRef.current.visible = true; selectedWearableObjectRef.current = obj; }
    else { transformControlsRef.current.detach(); transformControlsRef.current.visible = false; selectedWearableObjectRef.current = null; }
  }, [selectedWearableId, gizmoEnabled, wearables]);

  useEffect(() => { if (transformControlsRef.current) transformControlsRef.current.visible = gizmoEnabled && !!selectedWearableId; }, [gizmoEnabled, selectedWearableId]);

  // ─────────────────────────────────────────────────────────────────────────
  // REAL-TIME CUSTOMIZATION EFFECT
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!modelRef.current || !avatarPartsRef.current || !threeModules) return;
    const timer = setTimeout(() => {
      try {
        const { THREE } = threeModules;
        applyCustomizationToAvatar(modelRef.current, avatarPartsRef.current, avatarConfig, THREE);
        if (avatarConfig.height) targetScaleRef.current = avatarConfig.height / 1.8;
        if (avatarConfig.isVisible !== undefined) modelRef.current.visible = avatarConfig.isVisible;
      } catch (_) { /* customization apply failed — non-fatal */ }
    }, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarConfig, threeModules]);

  // ── Swap background texture when time-of-day changes (auto or manual) ────
  useEffect(() => {
    if (!sceneRef.current || !threeModules) return;
    const { THREE } = threeModules;
    const bgUrl = getBgUrl(effectiveTimeOfDay);
    const fallbackColor = {
      night: 0x0a0a1a, dusk: 0x1a0805, dawn: 0x1a0a1e, day: 0x87ceeb
    }[effectiveTimeOfDay] ?? 0x87ceeb;

    new THREE.TextureLoader().load(
      bgUrl,
      (tex) => {
        if (!sceneRef.current) return;
        // Smooth crossfade: start canvas overlay at opacity 0, fade old bg out then swap
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.style.transition = 'opacity 0.6s ease';
          canvas.style.opacity = '0';
          setTimeout(() => {
            if (sceneRef.current) sceneRef.current.background = tex;
            canvas.style.opacity = '1';
          }, 300);
        } else {
          sceneRef.current.background = tex;
        }
      },
      undefined,
      () => { if (sceneRef.current) sceneRef.current.background = new THREE.Color(fallbackColor); }
    );
  }, [effectiveTimeOfDay, threeModules]);

  // ── Custom animation clips ────────────────────────────────────────────────
  useEffect(() => {
    if (!modelRef.current || !mixerRef.current || !threeModules || !customAnimations?.length) return;
    loadAnimationClips(customAnimations.map(a => ({ name: a.name, url: a.url, isEmote: true })));
  }, [customAnimations, loadAnimationClips, threeModules]);

  // ── Preview / current action ──────────────────────────────────────────────
  useEffect(() => { if (previewAnimationUrl) setAction(previewAnimationUrl, true, true); }, [previewAnimationUrl, setAction]);
  useEffect(() => {
    if (!avatarConfig?.currentAction || !stateMachineRef.current) return;
    const loco = ['idle','walk','run','jump','backward','strafeleft','straferight'];
    if (!loco.includes(avatarConfig.currentAction.toLowerCase())) setAction(avatarConfig.currentAction, true, true);
  }, [avatarConfig?.currentAction, setAction]);

  // ── OS World: build / dispose on toggle ───────────────────────────────────
  useEffect(() => {
    if (!threeModules || !sceneRef.current) return;
    const { THREE } = threeModules;
    if (osEnabled) {
      if (!osWorldRef.current) {
        osWorldRef.current = new DripSyncOSWorld(THREE, sceneRef.current);
      }
      // Style ground for OS mode — dark with cyan tint
      sceneRef.current.traverse((obj) => {
        if (obj.userData.isDefaultGround && obj.material) {
          obj.material.color.set(0x050510);
          obj.material.emissive?.set(0x00050f);
          obj.material.emissiveIntensity = 0.3;
        }
        if (obj.userData.isDefaultGrid && obj.material) {
          obj.material.color.set(0x00d4ff);
          obj.material.opacity = 0.15;
        }
      });
    } else {
      if (osWorldRef.current) {
        osWorldRef.current.dispose();
        osWorldRef.current = null;
        setNearbyDistrict(null);
        lastDistrictIdRef.current = null;
      }
      // Restore ground
      sceneRef.current.traverse((obj) => {
        if (obj.userData.isDefaultGround && obj.material) {
          obj.material.color.set(0x6b7280);
          obj.material.emissiveIntensity = 0;
        }
        if (obj.userData.isDefaultGrid && obj.material) {
          obj.material.color.set(0x9ca3af);
          obj.material.opacity = 0.22;
        }
      });
    }
  }, [osEnabled, threeModules]);

  // ── Project a 3D world position → 2D screen coords ───────────────────────
  const projectToScreen = useCallback((worldPos) => {
    if (!cameraRef.current || !mountRef.current || !threeModules) return null;
    const { THREE } = threeModules;
    const vec = new THREE.Vector3(worldPos.x, worldPos.y, worldPos.z);
    vec.project(cameraRef.current);
    const rect = mountRef.current.getBoundingClientRect();
    return {
      x: (vec.x * 0.5 + 0.5) * rect.width,
      y: (-vec.y * 0.5 + 0.5) * rect.height,
    };
  }, [threeModules]);

  // ── Open a district: project portal pos + frame camera ───────────────────
  const openDistrict = useCallback((districtId) => {
    setActiveDistrict(districtId);

    // Find the district's 3D position for tether
    const dist = osWorldRef.current?.districts.find(d => d.id === districtId);
    if (dist) {
      const screen = projectToScreen({ x: dist.x, y: 1.5, z: dist.z });
      setPortalScreenPos(screen);

      // Camera: frame avatar (0,0,0) + portal midpoint, slightly offset right
      if (cameraRef.current && controlsRef.current && threeModules) {
        const { THREE } = threeModules;
        if (tpvAnimRef.current) tpvAnimRef.current();
        let cancelled = false;
        tpvAnimRef.current = () => { cancelled = true; };

        // Midpoint between avatar and portal in XZ, lifted
        const midX = dist.x * 0.35;
        const midZ = dist.z * 0.35;
        const perpAngle = dist.angle + Math.PI / 2;
        const camOffset = 4.5;
        const targetCamPos = new THREE.Vector3(
          midX + Math.cos(perpAngle) * camOffset,
          3.2,
          midZ + Math.sin(perpAngle) * camOffset
        );
        const targetLookAt = new THREE.Vector3(midX, 1.2, midZ);

        const startCamPos = cameraRef.current.position.clone();
        const startTarget = controlsRef.current.target.clone();
        const startTime   = performance.now();
        const duration    = 0.6;

        const tick = () => {
          if (cancelled) return;
          const t = Math.min((performance.now() - startTime) / (duration * 1000), 1);
          const e3 = 1 - Math.pow(1 - t, 3);
          cameraRef.current.position.lerpVectors(startCamPos, targetCamPos, e3);
          controlsRef.current.target.lerpVectors(startTarget, targetLookAt, e3);
          controlsRef.current.update();
          if (t < 1) requestAnimationFrame(tick);
          else tpvAnimRef.current = null;
        };
        requestAnimationFrame(tick);
      }
    } else {
      setPortalScreenPos(null);
    }
  }, [projectToScreen, threeModules]);

  // ── OS Keyboard E — open nearby district ─────────────────────────────────
  useEffect(() => {
    if (!osEnabled) return;
    const onKeyDown = (e) => {
      if (e.key === 'e' || e.key === 'E') {
        if (nearbyDistrict && !activeDistrict) openDistrict(nearbyDistrict.id);
        else if (activeDistrict) setActiveDistrict(null);
      }
      if (e.key === 'Escape') setActiveDistrict(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [osEnabled, nearbyDistrict, activeDistrict, openDistrict]);

  // ── Third-person click-to-view camera ─────────────────────────────────────
  // When the user clicks anywhere in the viewport (not on a UI overlay), we
  // raycast the scene. If a wearable / avatar mesh is clicked, we tween the
  // camera to a nice third-person position behind & above the avatar, looking
  // at the hit point. This also reframes to the avatar's current position so
  // the clicked panel/item is centred in view.
  const handleViewportClick = useCallback((e) => {
    if (!threeModules || !cameraRef.current || !controlsRef.current) return;
    if (e.target !== canvasRef.current) return;
    if (!modelRef.current) return;
    // Disable click-to-view while style camera is active
    if (cameraManagerRef.current?.isStyleMode) return;

    const { THREE } = threeModules;
    const canvas  = canvasRef.current;
    const rect    = canvas.getBoundingClientRect();
    const ndcX    = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    const ndcY    = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), cameraRef.current);

    // Collect all scene meshes (avatar + wearables + OS portals)
    const targets = [];
    if (modelRef.current) modelRef.current.traverse(c => { if (c.isMesh) targets.push(c); });
    if (osWorldRef.current) {
      sceneRef.current.traverse(c => { if (c.isMesh && !targets.includes(c)) targets.push(c); });
    }

    const hits = raycaster.intersectObjects(targets, false);
    if (!hits.length) return; // clicked empty space — leave camera alone

    const hit      = hits[0];
    const hitPoint = hit.point.clone();

    // Determine a third-person camera position:
    // Stand 3–4 m behind the avatar (opposite direction from clicked point),
    // 1.8 m high, and look at the avatar's chest.
    const avatar = modelRef.current;
    const avatarPos = avatar.position.clone();
    avatarPos.y = 0;

    // Direction from avatar → hit point in XZ plane
    const toHit = hitPoint.clone().sub(avatarPos);
    toHit.y = 0;
    const dist = toHit.length();

    // If click is very close (wearable on avatar body), offset camera behind avatar's facing
    const behind = dist > 0.3
      ? toHit.normalize().negate()
      : new THREE.Vector3(0, 0, -1).applyQuaternion(avatar.quaternion);

    const targetCamPos = avatarPos.clone()
      .add(behind.multiplyScalar(3.5))
      .add(new THREE.Vector3(0, 2.0, 0));

    const targetLookAt = avatarPos.clone().add(new THREE.Vector3(0, 1.4, 0));

    // Smoothly tween camera & orbit target using a simple lerp loop
    if (tpvAnimRef.current) tpvAnimRef.current(); // cancel previous tween
    let cancelled = false;
    tpvAnimRef.current = () => { cancelled = true; };

    const startCamPos = cameraRef.current.position.clone();
    const startTarget = controlsRef.current.target.clone();
    const duration    = 0.5; // seconds
    const startTime   = performance.now();

    // If clicked a district portal, delegate to openDistrict for full framing + window
    const clickedDistrictId = hit.object?.userData?.districtId
      || hit.object?.parent?.userData?.districtId;
    if (osEnabled && clickedDistrictId) {
      openDistrict(clickedDistrictId);
      return;
    }

    // Determine label from what was hit
    let label = 'Avatar';
    if (hit.object?.userData?.wearableName)   label = hit.object.userData.wearableName;
    else if (hit.object?.userData?.wearableId) label = 'Wearable';
    setTpvLabel(label);
    setTimeout(() => setTpvLabel(null), 1800);

    const tick = () => {
      if (cancelled) return;
      const t = Math.min((performance.now() - startTime) / (duration * 1000), 1);
      // Ease out cubic
      const e3 = 1 - Math.pow(1 - t, 3);

      cameraRef.current.position.lerpVectors(startCamPos, targetCamPos, e3);
      controlsRef.current.target.lerpVectors(startTarget, targetLookAt, e3);
      controlsRef.current.update();

      if (t < 1) requestAnimationFrame(tick);
      else tpvAnimRef.current = null;
    };
    requestAnimationFrame(tick);
  }, [threeModules]);

  // ── Mobile bridge — touch feeds the SAME normalized input layer as keyboard ──
  const handleMobileMove = (keys) => {
    const input = inputRef.current;
    if (!input) return;
    input.setMove('forward',  !!keys.w);
    input.setMove('backward', !!keys.s);
    input.setMove('left',     !!keys.a);
    input.setMove('right',    !!keys.d);
    input.setSource('touch');
  };
  const handleMobileRunToggle = (r) => { isMobileRunningRef.current = r; runModeRef.current = r; inputRef.current?.setRun(r); };
  const handleMobileJump      = (j) => { inputRef.current?.setJump(j); inputRef.current?.setSource('touch'); };

  // ── Expose canvas + camera controls ───────────────────────────────────────
  React.useImperativeHandle(forwardedRef, () => ({
    captureViewport: () => canvasRef.current?.toDataURL('image/jpeg', 0.85) || null,
    focusPreset: (presetKey) => cameraManagerRef.current?.focusPreset(presetKey),
    focusForSlot: (slot)     => cameraManagerRef.current?.focusForSlot(slot),
    enterStyleMode: ()       => cameraManagerRef.current?.enterStyleMode(),
    exitStyleMode:  ()       => cameraManagerRef.current?.exitStyleMode(),
  }), []);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div ref={mountRef} className="relative w-full h-full bg-transparent">
      <canvas ref={canvasRef} className="w-full h-full" style={{ background: 'transparent' }} onClick={handleViewportClick} />

      <MovementDevHud input={inputRef.current} velocityRef={velocityRef} onGroundRef={onGroundRef} stateMachineRef={stateMachineRef} />

      {/* Third-person view label flash */}
      {tpvLabel && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          style={{ animation: 'fadeInUp 0.2s ease-out forwards' }}>
          <div className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.25em] uppercase"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,212,255,0.35)', color: '#00D4FF' }}>
            👁 {tpvLabel}
          </div>
        </div>
      )}

      {/* ── OS World HUD & Panels ─────────────────────────────────────── */}
      {osEnabled && (
        <>
          <DripSyncOSHUD
            nearbyDistrict={nearbyDistrict}
            activeDistrict={activeDistrict}
            onOpen={openDistrict}
            onClose={() => setActiveDistrict(null)}
            avatarPos={avatarMapPos}
          />
          {activeDistrict && (
            <DripSyncOSWindowManager
              districtId={activeDistrict}
              portalScreenPos={portalScreenPos}
              onClose={() => { setActiveDistrict(null); setPortalScreenPos(null); }}
            />
          )}
        </>
      )}

      {/* ── OS Toggle Button ──────────────────────────────────────────── */}
      {status === 'ready' && (
        <button
          onClick={() => setOsEnabled(v => !v)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-full font-black text-[9px] tracking-[0.25em] uppercase transition-all hover:scale-105 active:scale-95"
          style={{
            background: osEnabled ? 'rgba(0,212,255,0.18)' : 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${osEnabled ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.12)'}`,
            color: osEnabled ? '#00D4FF' : 'rgba(255,255,255,0.4)',
            boxShadow: osEnabled ? '0 0 24px rgba(0,212,255,0.25)' : 'none',
          }}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${osEnabled ? 'bg-cyan-400 animate-pulse' : 'bg-white/20'}`} />
          {osEnabled ? 'OS MODE · ON' : 'OS MODE'}
        </button>
      )}



      {/* Status badges */}
      <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
        <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border shadow-[0_0_15px_rgba(0,255,255,0.5)] ${
          status === 'ready'   ? 'bg-green-500/20 text-green-400 border-green-500/50' :
          status === 'loading' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' :
                                 'bg-red-500/20 text-red-400 border-red-500/50'
        }`}>
          {status === 'ready' ? '● ONLINE' : status === 'loading' ? '⟳ LOADING' : '⚠ ERROR'}
        </div>
        {/* Time-of-day toggle badge */}
        <button
          onClick={cycleTimeOfDay}
          title="Click to cycle: Day → Night → Dawn → Dusk"
          className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
          style={{
            background: timeOverride !== null ? 'rgba(0,212,255,0.15)' : 'rgba(0,0,0,0.6)',
            borderColor: timeOverride !== null ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.1)',
            color: timeOverride !== null ? '#00D4FF' : 'rgba(255,255,255,0.6)',
            boxShadow: timeOverride !== null ? '0 0 10px rgba(0,212,255,0.3)' : 'none',
          }}
        >
          {effectiveTimeOfDay === 'night' ? '🌙 Night' : effectiveTimeOfDay === 'dusk' ? '🌆 Dusk' : effectiveTimeOfDay === 'dawn' ? '🌅 Dawn' : '☀️ Day'}
          {timeOverride !== null && <span className="ml-1 opacity-70">•</span>}
        </button>
      </div>

      {/* Lighting + controls toggle */}
      {status === 'ready' && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
          <button onClick={toggleControls}
            className="w-10 h-10 rounded-lg bg-black/90 backdrop-blur-2xl border border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all flex items-center justify-center"
            title={showControls ? 'Hide Controls' : 'Show Controls'}>
            {showControls ? <EyeOff className="w-5 h-5 text-cyan-400" /> : <Eye className="w-5 h-5 text-gray-500" />}
          </button>

          <button onClick={() => setShowLightingMenu(v => !v)}
            className="w-10 h-10 rounded-lg bg-black/90 backdrop-blur-2xl border border-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center"
            title="Lighting Controls">
            <Lightbulb className="w-5 h-5 text-purple-400" />
          </button>

          <AnimatePresence>
            {showLightingMenu && (
              <motion.div
                initial={{ opacity:0, y:-10, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-10, scale:0.95 }}
                className="absolute top-14 right-0 w-56 bg-black/95 backdrop-blur-2xl border border-purple-500/30 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.3)] p-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-500/20">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    <Lightbulb className="w-3 h-3 inline mr-1" />LIGHTING
                  </span>
                  <button onClick={() => setShowLightingMenu(false)} className="text-gray-500 hover:text-purple-400 transition-colors" aria-label="Close lighting menu">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(LIGHTING_PRESETS).map(([key, preset]) => {
                    const Icon = preset.icon;
                    return (
                      <button key={key} onClick={() => handleLightingPreset(key)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          currentPreset === key
                            ? 'bg-purple-500/20 border border-purple-400 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                            : 'bg-gray-900/50 border border-gray-800/50 text-gray-400 hover:bg-gray-800/70 hover:border-gray-700 hover:text-white'
                        }`}>
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-semibold">{preset.name}</span>
                        {currentPreset === key && <div className="ml-auto w-2 h-2 rounded-full bg-purple-400 animate-pulse" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Loading overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-cyan-400" />
              <div className="absolute inset-0 w-12 h-12 mx-auto animate-ping">
                <div className="w-full h-full rounded-full border-2 border-cyan-400/30" />
              </div>
            </div>
            <p className="text-sm font-bold text-cyan-400 uppercase tracking-wider">INITIALIZING DRIPSYNC</p>
            <p className="text-xs text-gray-500 mt-1">Loading cyberpunk engine...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-black/90 backdrop-blur-2xl border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.3)] rounded-xl p-6 m-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
              <span className="text-3xl">⚠</span>
            </div>
            <h3 className="font-bold text-lg mb-2 text-red-400 uppercase tracking-wider">SYSTEM ERROR</h3>
            <p className="text-sm text-gray-400">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* No-avatar empty state — centered call-to-action */}
      {status === 'ready' && !avatar && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center max-w-xs mx-4">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', boxShadow: '0 0 24px rgba(0,212,255,0.12)' }}>
              <Sparkles className="w-6 h-6" style={{ color: '#00D4FF' }} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              DripSync Studio
            </p>
            <h3 className="text-base font-bold text-white mb-1">No avatar loaded</h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {isMobile ? 'Tap the Closet tab to load or create your avatar.' : 'Open the Closet panel to load or create your avatar.'}
            </p>
            {errorMessage && (
              <p className="text-xs mt-2" style={{ color: 'rgba(255,80,80,0.85)' }}>{errorMessage}</p>
            )}
          </div>
        </div>
      )}

      {/* Gizmo HUD */}
      {gizmoEnabled && selectedWearableId && status === 'ready' && (
        <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-2xl border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 z-20">
          <Maximize2 className="w-4 h-4 text-purple-400" />
          <span className="text-gray-400">MODE:</span>
          <span className="text-purple-400 uppercase tracking-wider">{transformMode}</span>
        </div>
      )}
      {gizmoEnabled && status === 'ready' && (
        <div className="absolute top-16 right-4 bg-black/90 backdrop-blur-2xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] px-3 py-2 rounded-lg text-xs max-w-[200px] z-20">
          <p className="font-bold mb-2 text-purple-400 uppercase tracking-wider text-[10px]">GIZMO CONTROLS</p>
          <ul className="space-y-1 text-[10px] text-gray-400">
            <li>• <span className="text-cyan-400">Drag</span> handles to transform</li>
            <li>• <kbd className="bg-purple-500/20 px-1 rounded border border-purple-500/40 text-purple-400">Shift</kbd> to orbit</li>
            <li>• <span className="text-green-400">Auto-save</span> enabled</li>
          </ul>
        </div>
      )}

      {/* Mobile joystick */}
      {isMobile && status === 'ready' && avatar && showControls && (
        <DragJoystick onMove={handleMobileMove} onRunToggle={handleMobileRunToggle} onJump={handleMobileJump} />
      )}
    </div>
  );
});

export default DripSyncViewport;