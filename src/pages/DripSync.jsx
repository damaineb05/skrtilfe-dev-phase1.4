import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { normalizeAsset } from '@/hooks/useAvatarSaveLoad';

import DripSyncProvider from '../dripsync/react/DripSyncProvider.jsx';
import { useAuth } from '@/lib/AuthContext';
import OnboardingGate from '../components/onboarding/OnboardingGate';
import DripSyncDesktopLayout from '../components/dripsync/layouts/DripSyncDesktopLayout.jsx';
import DripSyncModals from '../components/dripsync/layouts/DripSyncModals.jsx';
import MobileDripSyncLayout from '../components/dripsync/MobileDripSyncLayout';
import ControlPanelVisibility from '../components/dripsync/ControlPanelVisibility';

import { useToast } from '@/components/ui/use-toast';
import { useSaveSystem } from '../hooks/useSaveSystem';
import { extractAvatarId } from '../components/utils/rpmHelpers';
import useAvatarActions from '../dripsync/react/useAvatarActions.js';
import { useSocialRoom } from '../components/dripsync/useSocialRoom';
import useRealmFromUrl from '../components/dripsync/useRealmFromUrl';
import { getAllAnimations } from '../components/dripsync/RPMAnimationLibrary';
import { DEFAULT_AVATAR_URL, DEFAULT_CUSTOMIZATION, DEFAULT_BACKGROUND } from '../constants/dripsyncConfig';

// Modular action hooks
import { useWearableActions } from '../components/dripsync/hooks/useWearableActions';
import { useAnimationActions } from '../components/dripsync/hooks/useAnimationActions';
import { useEnvironmentActions } from '../components/dripsync/hooks/useEnvironmentActions';
import { useAvatarLifecycle } from '../components/dripsync/hooks/useAvatarLifecycle';
import { hasGenesisAccess } from '../lib/useCanonicalGenesisAccess';
import {
  hydrateRuntimeFromUserConfig, buildCanonicalConfig, fingerprintConfig,
  persistAvatarProfile, useAvatarProfilePersistence,
} from '../lib/avatarPersistence';
import { normalizeAvatarConfig } from '../lib/avatarConfig';
import { stagePendingAvatar, getPendingAvatar, clearPendingAvatar } from '../lib/guestAvatarMigration';
import GuestIdentityFlow from '../components/dripsync/GuestIdentityFlow';
import DripSyncGuide from '../components/dripsync/DripSyncGuide';
import { isDripSyncOnboardingComplete, markDripSyncOnboardingComplete } from '../lib/dripsyncOnboarding';
import ContextualHint from '@/components/ui/ContextualHint';
import { setPrimaryGuidanceActive } from '@/lib/contextualHints';
import MembershipOffer from '@/components/membership/MembershipOffer';
import { getMembershipTier, MEMBERSHIP_TIERS } from '@/lib/membershipAccess';
import { DripSyncMode, getDripSyncModeConfig, isClosetMode } from '../dripsync/core/DripSyncModeConfig.js';
import { normalizeAvatarType, remapAnimationForGender, buildSkinIsolationMap } from '../dripsync/core/DripSyncAvatarState.js';

const cleanPageUrl = (paramsToRemove = ['tryOn']) => {
  const url = new URL(window.location.href);
  paramsToRemove.forEach(p => url.searchParams.delete(p));
  return url.toString();
};

// ─────────────────────────────────────────────
function DripSyncInner() {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const starterCheckRef = useRef(false);
  const prevUserIdRef = useRef(null);

  // ── Auth / user — sourced from global AuthContext ──────────────
  const { user: authUser, updateUser: updateAuthUser, isLoadingAuth } = useAuth();
  const [user, setUser] = useState(null);

  // Reset starter check whenever user identity changes (handles sign-out/sign-in)
  useEffect(() => {
    if (user?.id && user.id !== prevUserIdRef.current) {
      starterCheckRef.current = true;
      prevUserIdRef.current = user.id;
    }
  }, [user?.id]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [ownedProductIds, setOwnedProductIds] = useState([]);
  const [userHasGenesis, setUserHasGenesis] = useState(false);

  // ── Avatar / scene ───────────────────────────────────────────
  const [avatarSource, setAvatarSource] = useState(null);
  const [wearables, setWearables] = useState([]);
  const [customAnimations, setCustomAnimations] = useState([]);
  const [environment, setEnvironment] = useState({
    id: 'sky-grid',
    name: 'Sky Grid',
    url: 'https://media.base44.com/images/public/68bc2773ba0ba8d2da222a27/2fb984816_generated_image.png',
  });
  const [sceneLibrary, setSceneLibrary] = useState([]);
  const [currentRealm, setCurrentRealm] = useState(null);
  const [currentBackground, setCurrentBackground] = useState(DEFAULT_BACKGROUND);
  const [hardReloadToken, setHardReloadToken] = useState(0);
  const [customization, setCustomization] = useState(DEFAULT_CUSTOMIZATION);
  const [avatarGender, setAvatarGender] = useState('masculine'); // 'masculine' or 'feminine'

  // ── Upload / triage ──────────────────────────────────────────
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState('idle');
  const [currentUploadFile, setCurrentUploadFile] = useState(null);
  const [showTriageCard, setShowTriageCard] = useState(false);
  const [wearableError, setWearableError] = useState('');

  // ── Layout ───────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [activePanel, setActivePanel] = useState('closet');
  const [mobilePanel, setMobilePanel] = useState(null);

  // ── DripSync Mode System ──────────────────────────────────
  const [dripSyncMode, setDripSyncMode] = useState(DripSyncMode.MODERN_GAMEPLAY);
  const modeConfig = getDripSyncModeConfig(dripSyncMode);

  // ── Gizmo / transform ────────────────────────────────────────
  const [selectedWearableId, setSelectedWearableId] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedAssetType, setSelectedAssetType] = useState(null);
  const [transformMode, setTransformMode] = useState('translate');
  const [gizmoEnabled, setGizmoEnabled] = useState(false);
  const [isAssetLocked, setIsAssetLocked] = useState(false);

  // ── Animation ────────────────────────────────────────────────
  const [stateMachineState, setStateMachineState] = useState(null);
  const [previewAnimUrl, setPreviewAnimUrl] = useState(null);
  const [showAnimationLibrary, setShowAnimationLibrary] = useState(false);
  const [showAnimationTimeline, setShowAnimationTimeline] = useState(false);
  const [animationSequence, setAnimationSequence] = useState([]);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const allAnimations = useMemo(() => getAllAnimations(), []);

  // ── Save / looks / share ─────────────────────────────────────
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isRefreshingRpm, setIsRefreshingRpm] = useState(false);
  const [isHydratingTraits, setIsHydratingTraits] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [qualityMode, setQualityMode] = useState('high');
  const [showSaveLookModal, setShowSaveLookModal] = useState(false);
  const [showMyLooks, setShowMyLooks] = useState(false);
  const [showShareLookModal, setShowShareLookModal] = useState(false);
  const [lookToShare, setLookToShare] = useState(null);

  // ── Modals ───────────────────────────────────────────────────
  const [showDefaultAvatarPicker, setShowDefaultAvatarPicker] = useState(false);
  const [showStreamoji, setShowStreamoji] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [sellInventoryItem, setSellInventoryItem] = useState(null);

  // ── Scene objects ────────────────────────────────────────────
  const [sceneAvatars, setSceneAvatars] = useState([]);
  const [sceneFurniture, setSceneFurniture] = useState([]);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [interactiveObjects, setInteractiveObjects] = useState([]);
  const [nearestInteractable, setNearestInteractable] = useState(null);
  const [heldObjectLeft, setHeldObjectLeft] = useState(null);
  const [heldObjectRight, setHeldObjectRight] = useState(null);

  // ── Hooks ────────────────────────────────────────────────────
  const {
    assets: defaultAvatars, groupedAssets, getUserAssets, saveAsset, loadAsset: handleLoadAsset,
    deleteAsset: deleteDefaultAvatar, setStarter: setStarterAvatar, togglePublicTemplate, isLoading: isLoadingAssets,
  } = useSaveSystem(user);

  const {
    isInSocialRoom, socialRoomCode, socialParticipants, roomMessages, isChatOpen, setIsChatOpen,
    createSocialRoom, joinSocialRoom, leaveSocialRoom, sendRoomMessage,
    multiplayerConnected, multiplayerRoom, multiplayerPlayers,
    handleCreateRoom, handleJoinRoom, handleLeaveRoom,
  } = useSocialRoom({ user, toast });

  const currentAvatarId = useMemo(() => extractAvatarId(user?.avatar_config, avatarSource), [user?.avatar_config, avatarSource]);

  // Skin-isolation map — prevents shoes/hats/accessories from inheriting skin color
  const skinIsolationMap = useMemo(() => buildSkinIsolationMap(wearables), [wearables]);

  useRealmFromUrl({ setCurrentRealm, setEnvironment, setHardReloadToken, toast });

  // Wrap setUser to also update AuthContext so nav/layout stay in sync
  const setUserAndContext = useCallback((updaterOrValue) => {
    setUser(updaterOrValue);
    updateAuthUser(updaterOrValue);
  }, [updateAuthUser]);

  // ── Canonical persistence lifecycle (Phase C) ────────────────────────────
  // The SINGLE secure save path: buildCanonicalConfig → saveAvatarProfile.
  // Hydration guard + fingerprint dedup + rejected-fingerprint guard + single
  // in-flight save + stale-response guard all live in the hook.
  const getRuntimeState = useCallback(() => ({
    avatarSource, avatarId: null, gender: avatarGender,
    customization, wearables, customAnimations, environment, currentRealm,
  }), [avatarSource, avatarGender, customization, wearables, customAnimations, environment, currentRealm]);

  const stateFingerprint = useMemo(() => JSON.stringify({
    s: avatarSource, g: avatarGender, e: environment, r: currentRealm,
    c: customization, w: wearables, a: customAnimations,
  }), [avatarSource, avatarGender, environment, currentRealm, customization, wearables, customAnimations]);

  const { beginHydration, endHydration, saveNow } = useAvatarProfilePersistence({
    enabled: !!user && !isDemoMode,
    getRuntimeState,
    stateFingerprint,
    autoSave,
    onUnauthorized: (ids) => {
      toast({
        variant: 'destructive',
        title: 'Save blocked — item not owned',
        description: `${ids.length} equipped item(s) are not in your closet. Remove them to save.`,
        duration: 4000,
      });
    },
    onUserUpdate: (cfg) => updateAuthUser((u) => ({ ...(u || {}), avatar_config: cfg })),
  });

  const { hydrateTraitsFromRPM, redoRpmPull, handleSaveAvatar } = useAvatarActions({
    user, setUser: setUserAndContext, avatarSource, avatarGender, customization, wearables, customAnimations, environment,
    sceneLibrary, currentRealm, setAvatarSource, setWearables, setCustomAnimations,
    setEnvironment, setCurrentRealm, setCustomization, setHardReloadToken,
    setStatus, setIsHydratingTraits, setIsSavingAvatar, setIsRefreshingRpm, toast,
  });

  const canRefreshRpm = Boolean(extractAvatarId(user?.avatar_config, avatarSource));

  // ── Detect mobile ────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(prev => {
        if (prev !== mobile) {
          // Clear mobile panel state on layout switch
          if (!mobile) setMobilePanel(null);
          if (mobile) { setIsLeftPanelOpen(false); setIsRightPanelOpen(false); }
          else { setIsLeftPanelOpen(true); setIsRightPanelOpen(true); }
        }
        return mobile;
      });
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── RPM postMessage listener ─────────────────────────────────
  useEffect(() => {
    const onMsg = (event) => {
      if (typeof event.data !== 'string') return;
      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }
      if (msg?.source !== 'readyplayerme') return;
      if (msg.eventName === 'v2.avatar.exported' || msg.eventName === 'v1.avatar.exported') {
        const { avatarId, url, metadata } = msg.data || {};
        if (!avatarId || !url) return;
        const avatarUrl = `${url.split('?')[0]}?t=${Date.now()}`;
        setAvatarSource(avatarUrl);
        setWearables([]); setCustomAnimations([]); setEnvironment(null);
        setHardReloadToken(p => p + 1); setStatus('ready'); setShowStreamoji(false);
        // Persist + hydrate through the canonical save path (Phase C).
        // hydrateTraitsFromRPM saves the cleared-equipment state with the new
        // URL and merged traits via saveAvatarProfile (no direct updateMe).
        hydrateTraitsFromRPM(avatarId, metadata, avatarUrl);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [user, hydrateTraitsFromRPM]);

  // ── Try-On from URL ──────────────────────────────────────────
  useEffect(() => {
    const tryOnData = new URLSearchParams(window.location.search).get('tryOn');
    if (!tryOnData) return;
    try {
      const wd = JSON.parse(decodeURIComponent(tryOnData));
      const slotsToReplace = [wd.slot, ...(wd.replaces_slots || [])];
      setWearables(prev => {
        const filtered = prev.filter(w => !slotsToReplace.includes(w.slot || 'accessory'));
        return [...filtered, { id: Date.now(), name: wd.name, url: wd.url, bone: wd.bone, position: wd.position, rotation: wd.rotation, scale: wd.scale, slot: wd.slot, category: wd.category, metadata: wd.metadata, fromShop: true }];
      });
      setHardReloadToken(p => p + 1);
      setIsLeftPanelOpen(true); setActivePanel('closet');
      toast({ title: 'Product Equipped!', description: `${wd.name} added to your ${wd.slot || 'item'} slot.`, duration: 200 });
      setTryOnHintTrigger(true); // first try-on → one-time "TRY IT ON" hint
      window.history.replaceState({}, '', cleanPageUrl());
    } catch (e) { console.error('Failed to parse Try On data:', e); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync user from AuthContext + restore avatar state ────────────────────
  useEffect(() => {
    if (!authUser) {
      // Not authenticated — run in demo mode
      if (user !== null) return; // already handled
      setIsDemoMode(true);
      setWearables([
        { id: 'demo-1', name: 'SKRTLIFE Cap (Demo)', url: 'https://models.readyplayer.me/65e24e8c1f91b9bf7af7e882.glb', bone: 'Head', position: [0,0,0], rotation: [0,0,0], scale: 1, slot: 'headwear', isDemo: true },
        { id: 'demo-2', name: 'Genesis Tee (Demo)', url: 'https://models.readyplayer.me/65e24e8c1f91b9bf7af7e882.glb', bone: 'Spine1', position: [0,0,0], rotation: [0,0,0], scale: 1, slot: 'top', isDemo: true },
      ]);
      return;
    }

    setUser(authUser);
    const hasGenesis = hasGenesisAccess(authUser);
    setUserHasGenesis(hasGenesis);

    // Load orders for owned product IDs (non-critical, fire-and-forget)
    base44.entities.Order.filter({ user_email: authUser.email, payment_status: 'paid' })
      .then(orders => {
        const ids = new Set();
        orders.forEach(o => (o.line_items || []).forEach(i => { if (i.product_id) ids.add(i.product_id); }));
        setOwnedProductIds([...ids]);
      })
      .catch(() => { /* non-critical */ });

    // Restore avatar config through the canonical normalizer (v1 + v2 compat).
    // Hydration guard suppresses the post-load autosave; the seed fingerprint
    // (computed from the exact state being applied, cache-bust included) is set
    // so the just-loaded state is not immediately re-saved.
    beginHydration();
    const hydrated = hydrateRuntimeFromUserConfig(authUser);
    if (hydrated && hydrated.avatarSource) {
      const sourceWithTs = `${hydrated.avatarSource.split('?')[0]}?t=${Date.now()}`;
      setAvatarSource(sourceWithTs);
      setWearables(hydrated.wearables || []);
      setCustomAnimations(hydrated.customAnimations || []);
      if (hydrated.environment) setEnvironment(hydrated.environment);
      if (hydrated.currentRealm) setCurrentRealm(hydrated.currentRealm);
      setAvatarGender(hydrated.gender || 'masculine');
      setCustomization(prev => ({
        ...prev,
        ...(hydrated.customization || {}),
        isVisible: hydrated.customization ? hydrated.customization.isVisible !== false : true,
      }));
      setHardReloadToken(t => t + 1);
      endHydration(fingerprintConfig(buildCanonicalConfig({
        ...hydrated,
        avatarSource: sourceWithTs,
      })));
    } else {
      endHydration('');
      // If a guest avatar is pending migration, suppress the default-avatar
      // picker — the GuestIdentityFlow will hydrate from the migrated config.
      if (getPendingAvatar()) {
        starterCheckRef.current = false;
      } else {
        starterCheckRef.current = true;
        if (!hasGenesis) setShowDefaultAvatarPicker(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id]);

  // Auto-load starter avatar once useSaveSystem has fetched assets
  useEffect(() => {
    if (!starterCheckRef.current) return;
    const starter = groupedAssets.avatars.find(a => a.isStarter);
    if (!starter) return;
    // Use normalizeAsset for full V1/V2 compat
    const normalized = normalizeAsset(starter);
    if (!normalized?.avatarUrl) return;
    starterCheckRef.current = false;
    setAvatarGender(normalized.gender || 'masculine');
    setAvatarSource(`${normalized.avatarUrl.split('?')[0]}?t=${Date.now()}`);
    setWearables(normalized.wearables || []);
    setCustomAnimations(normalized.animations || []);
    setEnvironment(normalized.environment || null);
    setCurrentRealm(normalized.currentRealm || null);
    setCustomization(prev => ({ ...prev, ...(normalized.customization || {}), isVisible: true }));
    setHardReloadToken(t => t + 1);
  }, [groupedAssets.avatars]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load look from URL ───────────────────────────────────────
  useEffect(() => {
    const lookSlug = new URLSearchParams(window.location.search).get('look');
    if (!lookSlug) return;
    base44.entities.Look.filter({ slug: lookSlug }).then(looks => {
      if (looks.length > 0) handleLoadLook(looks[0]);
    }).catch(e => console.error('Failed to load look from URL:', e));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save is handled by useAvatarProfilePersistence (debounced,
  //    fingerprint-deduped, ownership-validated through saveAvatarProfile).

  // ── Wearable handlers ────────────────────────────────────────
  const {
    handleAddWearable, handleUpdateWearable, handleRemoveWearable, handleUpdatePhysics,
    handleWearableTransformChange, handleSnapToBone, handleResetTransform, handleMirrorToOpposite,
  } = useWearableActions({ wearables, setWearables, setHardReloadToken, toast });

  // ── Animation handlers ───────────────────────────────────────
  const handleAddAnimation = useCallback((anim) => setCustomAnimations(prev => [...prev, { ...anim, id: Date.now() }]), []);
  const handleRemoveAnimation = useCallback((id) => setCustomAnimations(prev => prev.filter(a => a.id !== id)), []);

  // ── Environment handlers ─────────────────────────────────────
  const {
    handleAddEnvironment, handleLoadSceneFromLibrary,
    handleRemoveSceneFromLibrary, handleRemoveEnvironment,
  } = useEnvironmentActions({ environment, setEnvironment, setSceneLibrary, setHardReloadToken, toast });

  // ── Upload / triage ──────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.name.toLowerCase().endsWith('.glb')) { setStatus('loading'); setCurrentUploadFile(file); setShowTriageCard(true); }
    else if (file) toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a .glb file.', duration: 200 });
  };

  const handleLoadFromInput = () => {
    if (!inputValue.trim()) return;
    if (inputValue.includes('sketchfab.com')) { setCurrentUploadFile({ url: inputValue, name: 'Sketchfab Model' }); setShowTriageCard(true); return; }
    setStatus('loading');
    const url = inputValue.includes('http') ? inputValue : `https://models.readyplayer.me/${inputValue}.glb`;
    setAvatarSource(`${url.split('?')[0]}?t=${Date.now()}`);
    setWearables([]); setCustomAnimations([]); setEnvironment(null); setCurrentRealm(null);
    setCustomization(prev => ({ ...prev, ...DEFAULT_CUSTOMIZATION }));
    setHardReloadToken(p => p + 1); setStatus('ready');
  };

  const handleTriageConfirm = (assetData) => {
    if (!currentUploadFile) return;
    let objectUrl = currentUploadFile.url || URL.createObjectURL(currentUploadFile);
    if (objectUrl.includes('sketchfab.com')) {
      const modelId = objectUrl.match(/models\/([a-zA-Z0-9]+)/)?.[1];
      if (modelId) objectUrl = `https://api.sketchfab.com/v3/models/${modelId}/download`;
    }
    if (assetData.type === 'avatar') {
      setAvatarSource(objectUrl); setWearables([]); setCustomAnimations([]); setEnvironment(null); setCurrentRealm(null);
      setCustomization(prev => ({ ...prev, ...DEFAULT_CUSTOMIZATION }));
      setHardReloadToken(p => p + 1); setStatus('ready');
    } else if (assetData.type === 'wearable') {
      handleAddWearable({ id: Date.now(), url: objectUrl, name: assetData.name || currentUploadFile.name, bone: assetData.slot === 'headwear' ? 'Head' : assetData.slot === 'footwear' ? 'LeftFoot' : 'Spine', position: [0,0,0], rotation: [0,0,0], scale: 1, slot: assetData.slot || 'accessory', metadata: assetData });
      setStatus('ready');
    } else if (assetData.type === 'animation') {
      handleAddAnimation({ id: Date.now(), name: assetData.name || currentUploadFile.name, url: objectUrl, metadata: assetData });
      setStatus('ready');
    } else if (assetData.type === 'environment') {
      handleAddEnvironment({ id: Date.now(), name: assetData.name || currentUploadFile.name, url: objectUrl, metadata: assetData });
      setStatus('ready');
    }
    setShowTriageCard(false); setCurrentUploadFile(null); setInputValue('');
  };

  // ── Reset interaction state on avatar reload ─────────────────
  useEffect(() => {
    setNearestInteractable(null);
    setHeldObjectLeft(null);
    setHeldObjectRight(null);
  }, [avatarSource]);

  // ── Look handlers ────────────────────────────────────────────
  const handleLoadLook = useCallback((look) => {
    console.log('[DRIPSYNC ACTION] LOAD_LOOK', look);

    // Support both legacy Look entity and new DripSyncAsset type='look'
    // Legacy Look entity uses avatar_url, current_realm, emotes
    // DripSyncAsset look uses avatarUrl, currentRealm, animations
    const avatarUrl = look.avatarUrl || look.avatar_url || look.metadata?.avatarUrl;
    if (avatarUrl) setAvatarSource(`${avatarUrl.split('?')[0]}?t=${Date.now()}`);

    setWearables(look.wearables || look.metadata?.wearables || []);
    setCustomAnimations(look.animations || look.emotes || look.metadata?.animations || look.customAnimations || []);
    setEnvironment(look.environment || look.metadata?.environment || null);
    setCurrentRealm(look.current_realm || look.currentRealm || look.metadata?.currentRealm || null);

    // Restore gender if present (V2 DripSyncAsset look)
    const gender = look.gender || look.metadata?.gender || look.metadata?.avatarType;
    if (gender) setAvatarGender(gender === 'feminine' || gender === 'female' ? 'feminine' : 'masculine');

    setCustomization(prev => ({
      ...prev,
      ...(look.customization || look.metadata?.customization || {}),
      ...(look.traits || {}),
      isVisible: true,
    }));
    setHardReloadToken(p => p + 1);
    setShowMyLooks(false);
    setStatus('ready');
    toast({ title: `✨ "${look.name || 'Look'}" loaded`, duration: 2000 });
  }, [toast]);

  const handleSaveLookSuccess = useCallback((newLook) => {
    toast({ title: 'Look Saved', description: `"${newLook.name}" saved!`, duration: 200 });
    setShowSaveLookModal(false); setLookToShare(newLook); setShowShareLookModal(true);
  }, [toast]);

  // ── Customization + hair ─────────────────────────────────────
  const { handleCustomizationChange, handleHairAssetChange } = useAvatarLifecycle({
    setAvatarSource, setWearables, setCustomAnimations, setEnvironment,
    setCurrentRealm, setCustomization, setHardReloadToken, toast,
  });

  // ── Avatar gender change — also remaps active animation ───────
  const handleAvatarGenderChange = useCallback((gender) => {
    const normalized = normalizeAvatarType(gender);
    setAvatarGender(normalized);
    // Remap current animation to the correct gender
    setPreviewAnimUrl(prev => {
      if (!prev) return null;
      const slug = customAnimations.find(a => a.url === prev)?.slug;
      if (!slug) return null;
      const remapped = remapAnimationForGender(slug, normalized);
      if (!remapped) return null;
      const found = customAnimations.find(a => a.slug === remapped);
      return found?.url || null;
    });
    setHardReloadToken(t => t + 1);
  }, [customAnimations]);

  // ── Mode change handler ──────────────────────────────────
  const handleModeChange = useCallback((newMode) => {
    setDripSyncMode(newMode);
    
    // Runway modes force gender
    if (newMode === DripSyncMode.RUNWAY_MALE) {
      setAvatarGender('masculine');
    } else if (newMode === DripSyncMode.RUNWAY_FEMALE) {
      setAvatarGender('feminine');
    }
    // Modern/COD/Closet use current gender
    
    setHardReloadToken(t => t + 1); // Reload animations
  }, []);

  // ── Animation / state machine ─────────────────────────────────
  const {
    handleStateMachineInit,
    handlePreviewAnimation,
    handleApplyAnimation,
    handleCancelPreview,
  } = useAnimationActions({ setPreviewAnimUrl, setStateMachineState });


  // ── Realm ────────────────────────────────────────────────────
  const handleRealmChange = useCallback((realm) => {
    setCurrentRealm(realm);
    setEnvironment(realm?.environment_url ? { id: realm.id, name: realm.name, url: realm.environment_url, metadata: realm } : null);
    setHardReloadToken(p => p + 1);
    toast({ title: 'Realm Changed', description: `Entered ${realm ? realm.name : 'default studio'}`, duration: 200 });
  }, [toast]);

  // ── Default avatar ───────────────────────────────────────────
  // Accepts a normalized avatar { glb_url | avatarUrl | model_url, gender, name }
  // from DefaultAvatarPicker (static registry or DB record) and loads + persists
  // it as the canonical avatar identity via saveAvatarProfile.
  const handleSelectDefaultAvatar = async (avatar) => {
    const modelUrl = avatar.glb_url || avatar.avatarUrl || avatar.model_url || 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb';
    const gender = avatar.gender === 'feminine' ? 'feminine' : 'masculine';
    if (avatar.gender) setAvatarGender(gender);
    setAvatarSource(modelUrl);
    setWearables([]); setCustomAnimations([]); setEnvironment(null); setCurrentRealm(null);
    setCustomization(prev => ({ ...prev, isVisible: true }));
    setHardReloadToken(p => p + 1);
    const res = await saveNow({ force: true, runtime: {
      avatarSource: modelUrl, avatarId: null, gender,
      customization: { ...customization, isVisible: true },
      wearables: [], customAnimations: [], environment: null, currentRealm: null,
    }});
    if (res.success) toast({ title: 'Avatar Applied', description: `${avatar.name || 'Avatar'} is now your default avatar.`, duration: 200 });
    else if (res.status !== 403) toast({ variant: 'destructive', title: 'Save failed', description: res.error || 'Please try again.', duration: 200 });
  };

  // ── Inventory / marketplace ──────────────────────────────────
  const handleEquipFromInventory = useCallback((wearable) => {
    handleAddWearable({ id: Date.now(), name: wearable.asset_name || wearable.name, url: wearable.asset_url || wearable.url, bone: wearable.asset_metadata?.bone || 'Hips', position: wearable.asset_metadata?.position || [0,0,0], rotation: wearable.asset_metadata?.rotation || [0,0,0], scale: wearable.asset_metadata?.scale || 1, slot: wearable.category || 'accessory', metadata: wearable.asset_metadata || {} });
    toast({ title: 'Item Equipped', duration: 200 });
  }, [handleAddWearable, toast]);

  const handleSellItem = useCallback((item) => { setSellInventoryItem(item); setShowCreateListing(true); }, []);

  // ── Sketchfab helper ─────────────────────────────────────────
  const handleSketchfab = () => {
    const url = prompt('Paste Sketchfab model URL:');
    if (url) { setInputValue(url); setCurrentUploadFile({ url, name: 'Sketchfab Model' }); setShowTriageCard(true); }
  };

  // ── Streamoji export ─────────────────────────────────────────
  const handleStreamojiExported = async (url) => {
    setAvatarSource(url); setWearables([]); setCustomAnimations([]); setEnvironment(null);
    setHardReloadToken(p => p + 1); setStatus('ready');
    if (user) {
      const res = await saveNow({ force: true, runtime: {
        avatarSource: url, avatarId: null, gender: avatarGender,
        customization, wearables: [], customAnimations: [], environment: null, currentRealm,
      }});
      if (!res.success && res.status !== 403) {
        toast({ variant: 'destructive', title: 'Save failed', description: res.error || 'Please try again.', duration: 200 });
      }
    }
    toast({ title: 'Streamoji Avatar Loaded!', duration: 200 });
  };

  // ── Asset Selection (avatar, wearable, prop, environment) ─────────
  const handleSelectAsset = useCallback((assetId, assetType, assetData) => {
    setSelectedAsset({ id: assetId, ...assetData });
    setSelectedAssetType(assetType);
    setIsAssetLocked(false);
    if (assetType === 'wearable') {
      setSelectedWearableId(assetId);
      if (!gizmoEnabled) setGizmoEnabled(true);
    }
  }, [gizmoEnabled]);

  const handleDeselectAsset = useCallback(() => {
    setSelectedAsset(null);
    setSelectedAssetType(null);
    setIsAssetLocked(false);
  }, []);

  const handleDuplicateAsset = useCallback(() => {
    if (selectedAssetType === 'wearable' && selectedWearableId) {
      const wearableToClone = wearables.find(w => w.id === selectedWearableId);
      if (wearableToClone) {
        const cloned = { ...wearableToClone, id: Date.now() };
        setWearables(prev => [...prev, cloned]);
        setHardReloadToken(p => p + 1);
        toast({ title: 'Wearable duplicated', description: `${wearableToClone.name} copied`, duration: 200 });
      }
    }
  }, [selectedAssetType, selectedWearableId, wearables, toast]);

  const handleDeleteAsset = useCallback(() => {
    if (!selectedAsset || !selectedAssetType) return;
    
    if (selectedAssetType === 'wearable' && selectedWearableId) {
      handleRemoveWearable(selectedWearableId);
      toast({ title: 'Wearable deleted', duration: 200 });
    }
    handleDeselectAsset();
  }, [selectedAsset, selectedAssetType, selectedWearableId, handleRemoveWearable, handleDeselectAsset, toast]);

  const handleResetAssetTransform = useCallback(() => {
    if (selectedAssetType === 'wearable' && selectedWearableId) {
      handleResetTransform(selectedWearableId);
    }
    toast({ title: 'Transform reset', duration: 200 });
  }, [selectedAssetType, selectedWearableId, handleResetTransform, toast]);

  const handleColorChange = useCallback((zone, hex) => {
    if (!selectedAssetType || !selectedAsset) return;
    
    // Avatar colors
    if (selectedAssetType === 'avatar') {
      const updatedConfig = {
        ...customization,
        [zone]: hex,
      };
      setCustomization(updatedConfig);
    }
    // Wearable colors
    else if (selectedAssetType === 'wearable' && selectedWearableId) {
      const wearable = wearables.find(w => w.id === selectedWearableId);
      if (wearable) {
        const updated = { ...wearable, color: hex };
        setWearables(prev => prev.map(w => (w.id === selectedWearableId ? updated : w)));
        setHardReloadToken(p => p + 1);
      }
    }
  }, [selectedAssetType, selectedAsset, selectedWearableId, wearables, customization]);

  // ── Shared props bundles ─────────────────────────────────────
  const sharedClosetProps = {
    inputValue, setInputValue, onLoadFromInput: handleLoadFromInput, fileInputRef,
    onSketchfab: handleSketchfab, onCreateAvatar: () => setShowStreamoji(true),
    onCreateStreamoji: () => setShowStreamoji(true),
    // onSaveDefault signature: (type, payload, name, thumbnail) — forwarded directly from ClosetPanelWithDefaults
    onSaveDefault: (type, payload, name, thumb) => saveAsset(type, {
      ...payload,
      avatarUrl: payload?.avatarUrl || avatarSource,
      gender: avatarGender,
      avatarType: avatarGender,     // V1 compat
      source: payload?.source || (avatarSource?.includes('readyplayer.me') ? 'rpm' : 'upload'),
    }, name, thumb),
    onRefreshDefaultAvatars: () => getUserAssets(true),
    // Pass ALL user assets (avatars + looks) to the library panel
    defaultAvatars: defaultAvatars,
    onLoadDefault: (asset) => {
      console.log('[DripSyncAsset V2] Loading asset:', asset);

      // Use V2 normalizeAsset for full backward compat (V1 + V2 schemas)
      const normalized = normalizeAsset(asset);

      if (!normalized?.avatarUrl) {
        toast({ variant: 'destructive', title: 'Avatar could not be loaded', description: 'Missing avatar URL. This asset may be corrupted.', duration: 4000 });
        console.error('[DripSyncAsset V2] Missing avatarUrl after normalization:', asset);
        return;
      }

      // Apply gender (V2 root field first, then V1 metadata fallback)
      const gender = normalized.gender || 'masculine';
      setAvatarGender(gender);

      // Apply all restored state
      setAvatarSource(`${normalized.avatarUrl.split('?')[0]}?t=${Date.now()}`);
      setWearables(normalized.wearables || []);
      setCustomAnimations(normalized.animations || []);
      setEnvironment(normalized.environment || null);
      setCurrentRealm(normalized.currentRealm || null);
      setCustomization(prev => ({
        ...prev,
        ...(normalized.customization || {}),
        isVisible: true,
      }));
      setHardReloadToken(p => p + 1);
      toast({ title: `${normalized.type === 'look' ? '✨' : '👤'} "${normalized.name || 'Avatar'}" loaded`, duration: 2000 });
    },
    onReplaceDefault: () => {
      // onReplaceDefault not used in new unified system; delete via UI instead
      console.log('[ClosetPanel] Replace deprecated, use delete + save instead');
    },
    onDeleteDefault: (avatar) => deleteDefaultAvatar(avatar.id),
    onSetStarter: (avatar) => setStarterAvatar(avatar.id),
    onToggleTemplate: togglePublicTemplate,
    avatarSource, avatarGender, customization, wearables, environment,
    onAddWearable: handleAddWearable, onUpdateWearable: handleUpdateWearable, onRemoveWearable: handleRemoveWearable,
    customAnimations, onAddAnimation: handleAddAnimation, onRemoveAnimation: handleRemoveAnimation,
    sceneLibrary, onAddEnvironment: handleAddEnvironment, onRemoveEnvironment: handleRemoveEnvironment,
    onLoadSceneFromLibrary: handleLoadSceneFromLibrary, onRemoveSceneFromLibrary: handleRemoveSceneFromLibrary,
    setError: setWearableError, currentAvatarId, ownedProductIds, isDemoMode,
    sceneFurniture, setSceneFurniture, sceneAvatars, setSceneAvatars,
    selectedObjectId, setSelectedObjectId,
    onAddFurniture: (fu) => setSceneFurniture(prev => [...prev, fu]),
    onUpdateFurniture: (id, patch) => setSceneFurniture(prev => prev.map(f => f.id === id ? {...f, ...patch} : f)),
    onRemoveFurniture: (id) => setSceneFurniture(prev => prev.filter(f => f.id !== id)),
  };

  // ── Picker routing: copy-on-select for community templates ─────────────
  // A static/DB default → handleSelectDefaultAvatar (existing force-save as
  // the user's starter). A published community template → load it into the
  // editor as a fresh, customizable instance (onLoadDefault). The template
  // record is only READ; the user's edits + later Save write their OWN
  // avatar_config. The original and other users' avatars are never modified.
  const handlePickAvatar = useCallback((avatar) => {
    // A saved avatar (the user's own DripSyncAsset) OR a published community
    // template both carry rawAsset → load the full saved model + customization
    // + wearables into the editor as a fresh, customizable instance. Only true
    // static-registry defaults (no rawAsset) go through the force-save path.
    if (avatar?.rawAsset) {
      sharedClosetProps.onLoadDefault(avatar.rawAsset);
      setShowDefaultAvatarPicker(false);
      toast({
        title: avatar.origin === 'template' ? 'Template loaded' : 'Avatar loaded',
        description: avatar.origin === 'template' ? 'Customize it, then Save to make it yours.' : 'Your saved look is ready to edit.',
        duration: 2500,
      });
    } else {
      handleSelectDefaultAvatar(avatar);
    }
  }, [sharedClosetProps, handleSelectDefaultAvatar, toast]);

  const sharedSocialProps = {
    isInSocialRoom, socialRoomCode, socialParticipants, createSocialRoom, joinSocialRoom, leaveSocialRoom, user,
    multiplayerConnected, multiplayerRoom, multiplayerPlayers,
    handleCreateRoom, handleJoinRoom, handleLeaveRoom,
    interactiveObjects, setInteractiveObjects,
    selectedObjectId, setSelectedObjectId,
    sceneAvatars, setSceneAvatars, sceneFurniture, setSceneFurniture,
  };

  // ── Guest → auth → canonical avatar migration ───────────────────────────
  // A guest (demo mode) cannot persist through saveAvatarProfile (no authed
  // user). On Save we stage their canonical config, redirect through the
  // platform auth flow, and on return migrate it into avatar_config — never
  // losing the avatar they just created.
  const navigate = useNavigate();
  const [guestFlow, setGuestFlow] = useState(null); // 'gate' | 'syncing' | 'conflict' | 'success'
  const pendingConfigRef = useRef(null);

  // Re-apply a (pending) canonical config to the editor runtime without persisting,
  // so a user whose migration was blocked can see their avatar, edit it, and retry.
  const applyPendingRuntime = useCallback((config) => {
    const hydrated = hydrateRuntimeFromUserConfig({ avatar_config: config });
    if (hydrated && hydrated.avatarSource) {
      setAvatarSource(`${hydrated.avatarSource.split('?')[0]}?t=${Date.now()}`);
      setWearables(hydrated.wearables || []);
      setCustomAnimations(hydrated.customAnimations || []);
      if (hydrated.environment) setEnvironment(hydrated.environment);
      if (hydrated.currentRealm) setCurrentRealm(hydrated.currentRealm);
      setAvatarGender(hydrated.gender || 'masculine');
      setHardReloadToken((t) => t + 1);
    }
  }, []);

  // Guest presses Save in demo mode → stage canonical config, open identity gate.
  const handleGuestSave = useCallback(() => {
    let url = typeof avatarSource === 'string' ? avatarSource : null;
    if (!url || url.startsWith('blob:')) {
      toast({ variant: 'destructive', title: 'No avatar to save', description: 'Create or load an avatar before saving your digital self.', duration: 3000 });
      return;
    }
    const config = buildCanonicalConfig(getRuntimeState());
    stagePendingAvatar(config, { returnTo: window.location.pathname + window.location.search });
    setGuestFlow('gate');
  }, [avatarSource, getRuntimeState, toast]);

  // Wrap the authenticated save so guests route through the migration gate.
  const onSaveAvatar = useCallback((...args) => {
    if (!user) { handleGuestSave(); return; }
    return handleSaveAvatar(...args);
  }, [user, handleGuestSave, handleSaveAvatar]);

  // Migrate the staged canonical config into the authenticated user's avatar_config.
  const migratePending = useCallback(async () => {
    const config = pendingConfigRef.current;
    if (!config) { setGuestFlow(null); return; }
    setGuestFlow('syncing');
    try {
      const res = await persistAvatarProfile(config, {
        onUserUpdate: (cfg) => updateAuthUser((u) => ({ ...(u || {}), avatar_config: cfg })),
      });
      if (res.success && res.avatar_config) {
        clearPendingAvatar();
        markDripSyncOnboardingComplete(user?.id);
        const hydrated = hydrateRuntimeFromUserConfig({ avatar_config: res.avatar_config });
        if (hydrated && hydrated.avatarSource) {
          setAvatarSource(`${hydrated.avatarSource.split('?')[0]}?t=${Date.now()}`);
          setWearables(hydrated.wearables || []);
          setCustomAnimations(hydrated.customAnimations || []);
          if (hydrated.environment) setEnvironment(hydrated.environment);
          if (hydrated.currentRealm) setCurrentRealm(hydrated.currentRealm);
          setAvatarGender(hydrated.gender || 'masculine');
          setHardReloadToken((t) => t + 1);
        }
        // Seed the persistence hook's dedup fingerprint so the just-migrated
        // state is not immediately re-saved by autosave.
        endHydration(fingerprintConfig(res.avatar_config));
        setGuestFlow('success');
        base44.analytics.track({ eventName: 'identity_created' });
      } else if (res.status === 403) {
        // Ownership blocked — keep pending, re-apply to editor so the user can
        // remove the unowned items and retry Save (now through the authed path).
        applyPendingRuntime(config);
        toast({ variant: 'destructive', title: 'Save blocked — item not owned', description: 'Some equipped items are not in your closet. Remove them and press Save again.', duration: 4000 });
        setGuestFlow(null);
      } else {
        // Migration failure — keep pending, re-apply so the user can retry.
        applyPendingRuntime(config);
        toast({ variant: 'destructive', title: 'Migration failed', description: res.error || 'Please try again.', duration: 3000 });
        setGuestFlow(null);
      }
    } catch (e) {
      applyPendingRuntime(config);
      toast({ variant: 'destructive', title: 'Migration failed', description: 'Please try again.', duration: 3000 });
      setGuestFlow(null);
    }
  }, [updateAuthUser, toast]);

  // On auth resolve, detect a staged guest avatar and begin migration.
  useEffect(() => {
    if (!authUser) return;
    const pending = getPendingAvatar();
    if (!pending) return;
    pendingConfigRef.current = pending.config;
    const existing = normalizeAvatarConfig(authUser.avatar_config);
    if (existing && existing.avatar && existing.avatar.model_url) {
      // CASE B — existing canonical avatar: let the user choose.
      setGuestFlow('conflict');
    } else {
      // CASE A — new account: migrate automatically.
      migratePending();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id]);

  const handleUseThisLook = useCallback(() => { migratePending(); }, [migratePending]);
  const handleKeepSaved = useCallback(() => {
    clearPendingAvatar();
    pendingConfigRef.current = null;
    setGuestFlow(null);
    toast({ title: 'Kept your saved avatar', duration: 2000 });
  }, [toast]);
  const handleEnterWorld = useCallback(() => { navigate('/World'); }, [navigate]);
  const handleKeepCustomizing = useCallback(() => { setGuestFlow(null); }, []);
  // Guest dismisses the save gate without signing in. The editor draft stays on
  // screen; only the staged handoff is cleared so a later unrelated login can't
  // ambush them with an unexpected migration. They can press Save again to retry.
  const handleGuestCancel = useCallback(() => {
    clearPendingAvatar();
    pendingConfigRef.current = null;
    setGuestFlow(null);
  }, []);
  const handleGuestAuth = useCallback(() => {
    // Return to this DripSync route after auth so migration completes in-context.
    base44.auth.redirectToLogin(window.location.href);
  }, []);

  // ── First-time DripSync guided experience ───────────────────────────────
  const [guideStep, setGuideStep] = useState(null); // 0-3 or null
  const [guideReveal, setGuideReveal] = useState(false);
  const guideInitRef = useRef(false);

  // Show the interactive guide only for first-time users: not completed, no
  // existing canonical avatar, and not mid guest→auth migration. Waits for
  // auth to resolve so a returning authenticated user is checked under their
  // own id (not the guest key).
  useEffect(() => {
    if (guideInitRef.current) return;
    if (isLoadingAuth) return;            // wait for auth to resolve
    if (guestFlow) return;                // migration owns the moment
    if (getPendingAvatar()) { guideInitRef.current = true; return; }
    const existing = normalizeAvatarConfig(authUser?.avatar_config);
    const hasAvatar = !!(existing && existing.avatar && existing.avatar.model_url);
    if (!isDripSyncOnboardingComplete(authUser?.id) && !hasAvatar) {
      setGuideStep(0);
    }
    guideInitRef.current = true;
  }, [authUser?.id, isLoadingAuth, guestFlow]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hide the guide the moment a guest→auth migration flow takes over.
  useEffect(() => { if (guestFlow) setGuideStep(null); }, [guestFlow]);

  const handleGuideNext = useCallback(() => setGuideStep((s) => (s == null ? s : Math.min(3, s + 1))), []);
  const handleGuideBack = useCallback(() => setGuideStep((s) => (s == null ? s : Math.max(0, s - 1))), []);
  const handleGuideSkip = useCallback(() => { markDripSyncOnboardingComplete(authUser?.id); setGuideStep(null); }, [authUser?.id]);
  const handleSaveIdentity = useCallback(async () => {
    if (!user) {
      // Guest → hand off to the existing GuestIdentityFlow (auth + migration).
      markDripSyncOnboardingComplete(authUser?.id);
      handleGuestSave();
      setGuideStep(null);
      return;
    }
    // Authenticated → existing saveAvatarProfile path, then reveal.
    const res = await handleSaveAvatar();
    if (res && res.success) {
      markDripSyncOnboardingComplete(authUser?.id);
      setGuideStep(null);
      setGuideReveal(true);
      base44.analytics.track({ eventName: 'identity_created' });
    }
  }, [user, authUser?.id, handleGuestSave, handleSaveAvatar]);
  const handleGuideKeepCustomizing = useCallback(() => setGuideReveal(false), []);

  // One-shot trigger for the first Shop → DripSync try-on contextual hint.
  const [tryOnHintTrigger, setTryOnHintTrigger] = useState(false);

  // Reflect main-guidance activity so contextual hints suppress during the
  // DripSyncGuide tutorial, the post-save reveal, and guest→auth migration
  // (priority/collision rule). Contextual hints queue until these clear.
  // ── Membership conversion layer ───────────────────────────────
  // The offer appears ONCE, after identity creation, only for free users who
  // haven't seen it. Returning / paid users go straight to World. CONTINUE FREE
  // is always available (no dark pattern); offer-seen is persisted on the user
  // so it never nags again. Membership state lives on the User, not avatar_config.
  const [showMembershipOffer, setShowMembershipOffer] = useState(false);

  useEffect(() => {
    setPrimaryGuidanceActive(guideStep !== null || guestFlow !== null || guideReveal || showMembershipOffer);
    return () => setPrimaryGuidanceActive(false); // never leak suppression across routes
  }, [guideStep, guestFlow, guideReveal, showMembershipOffer]);

  const handleEnterWorldWithOffer = useCallback(() => {
    const tier = getMembershipTier(user);
    if (user && !user.membership_offer_seen && tier === MEMBERSHIP_TIERS.FREE) {
      setGuideReveal(false);
      setGuestFlow(null);
      setShowMembershipOffer(true);
      base44.analytics.track({ eventName: 'membership_offer_viewed' });
    } else {
      base44.analytics.track({ eventName: 'world_entered_after_signup' });
      navigate('/World');
    }
  }, [user, navigate]);

  const handleContinueFree = useCallback(async () => {
    setShowMembershipOffer(false);
    try {
      await base44.auth.updateMe({ membership_offer_seen: true });
      updateAuthUser((u) => ({ ...(u || {}), membership_offer_seen: true }));
    } catch (e) { /* non-fatal — offer just may re-show */ }
    base44.analytics.track({ eventName: 'membership_continue_free' });
    base44.analytics.track({ eventName: 'world_entered_after_signup' });
    navigate('/World');
  }, [updateAuthUser, navigate]);

  const handleCheckoutStarted = useCallback((tier) => {
    base44.analytics.track({ eventName: 'membership_tier_selected', properties: { tier } });
    base44.analytics.track({ eventName: 'membership_checkout_started', properties: { tier } });
  }, []);

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen overflow-hidden" style={{ background: '#0A0A0F' }}>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .glass-panel-drip { background: rgba(10,10,15,0.92); backdrop-filter: blur(24px) saturate(140%); -webkit-backdrop-filter: blur(24px) saturate(140%); border: 1px solid rgba(255,255,255,0.08); position: relative; }
        .soft-glow-panel { box-shadow: 0 8px 40px rgba(0,0,0,0.6); }
        .tab-button-drip { position: relative; transition: all 0.2s ease; padding: 0 16px; height: 52px; display: flex; align-items: center; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; white-space: nowrap; }
        .tab-button-drip:hover { color: rgba(255,255,255,0.7); }
        .tab-button-drip.active { color: #fff; }
        .tab-button-drip.active::after { content: ''; position: absolute; bottom: 0; left: 16px; right: 16px; height: 1px; background: #fff; }
        .section-header-drip { border-left: 2px solid rgba(255,255,255,0.25); padding: 6px 10px; border-radius: 0 6px 6px 0; margin-bottom: 10px; background: rgba(255,255,255,0.03); }
        .color-swatch-drip { position: relative; border-radius: 8px; transition: all 0.2s ease; border: 2px solid rgba(255,255,255,0.1); }
        .color-swatch-drip:hover { transform: scale(1.12); border-color: rgba(255,255,255,0.3); }
        .color-swatch-drip.selected { border: 2px solid rgba(255,255,255,0.7); transform: scale(1.08); }
      `}</style>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".glb" onClick={e => { e.currentTarget.value = null; }} />

      {/* ── Mobile ── */}
      {isMobile && (
        <MobileDripSyncLayout
           avatarSource={avatarSource} wearables={wearables} customAnimations={customAnimations}
           environment={environment} customization={customization} avatarGender={avatarGender} hardReloadToken={hardReloadToken}
          selectedWearableId={selectedWearableId} onWearableTransformChange={handleWearableTransformChange}
          transformMode={transformMode} gizmoEnabled={gizmoEnabled} onStateMachineInit={handleStateMachineInit}
          qualityMode={qualityMode} currentRealm={currentRealm} currentBackground={currentBackground}
          isLoading={status === 'loading' || isHydratingTraits}
          loadingText={isHydratingTraits ? 'HYDRATING TRAITS...' : 'LOADING...'}
          interactiveObjects={interactiveObjects}
          nearestInteractable={nearestInteractable} heldObjectLeft={heldObjectLeft} heldObjectRight={heldObjectRight}
          previewAnimUrl={previewAnimUrl}
          inputValue={inputValue} setInputValue={setInputValue}
          onShare={() => setShowShareLookModal(true)}
          onViewLooks={() => setShowMyLooks(true)} onCreateAvatar={() => setShowStreamoji(true)}
          onCreateStreamoji={() => setShowStreamoji(true)} onRefresh={redoRpmPull}
          onCapture={() => toast({ title: 'Photo captured', description: 'Screenshot saved' })}
          onLoadAvatar={(file) => { setCurrentUploadFile(file); setShowTriageCard(true); }}
          onLoadFromUrl={(url) => { setInputValue(url); handleLoadFromInput(); }}
          isSaving={isSavingAvatar} isRefreshing={isRefreshingRpm} canRefresh={canRefreshRpm}
          mobilePanel={mobilePanel} setMobilePanel={setMobilePanel}
          hasSceneObjects={sceneAvatars.length > 0 || sceneFurniture.length > 0}
          onLoadFromInput={handleLoadFromInput} onFileClick={() => fileInputRef.current?.click()}
          onSketchfab={handleSketchfab}
          defaultAvatars={defaultAvatars}
          onLoadDefault={sharedClosetProps.onLoadDefault}
          onReplaceDefault={sharedClosetProps.onReplaceDefault}
          onDeleteDefault={sharedClosetProps.onDeleteDefault}
          onSetStarter={sharedClosetProps.onSetStarter}
          onSaveDefault={sharedClosetProps.onSaveDefault}
          onRefreshDefaultAvatars={sharedClosetProps.onRefreshDefaultAvatars}
          onAddWearable={handleAddWearable} onUpdateWearable={handleUpdateWearable} onRemoveWearable={handleRemoveWearable}
          onAddAnimation={handleAddAnimation} onRemoveAnimation={handleRemoveAnimation}
          sceneLibrary={sceneLibrary} onAddEnvironment={handleAddEnvironment} onRemoveEnvironment={handleRemoveEnvironment}
          onLoadSceneFromLibrary={handleLoadSceneFromLibrary} onRemoveSceneFromLibrary={handleRemoveSceneFromLibrary}
          setError={setWearableError} currentAvatarId={currentAvatarId} ownedProductIds={ownedProductIds} isDemoMode={isDemoMode}
          onCustomizationChange={handleCustomizationChange} onHairAssetChange={handleHairAssetChange}
          onAvatarGenderChange={handleAvatarGenderChange}
          dripSyncMode={dripSyncMode} onModeChange={handleModeChange}
          sceneFurniture={sceneFurniture} setSceneFurniture={setSceneFurniture}
          sceneAvatars={sceneAvatars} setSceneAvatars={setSceneAvatars}
          selectedObjectId={selectedObjectId} setSelectedObjectId={setSelectedObjectId}
          setInteractiveObjects={setInteractiveObjects}
          skinIsolationMap={skinIsolationMap}
          onRealmChange={handleRealmChange} onCreateRealm={() => toast({ title: 'Coming Soon', duration: 200 })} onBackgroundChange={setCurrentBackground}
          onSnapToBone={handleSnapToBone} onResetTransform={handleResetTransform} onMirrorToOpposite={handleMirrorToOpposite}
          onToggleGizmo={() => setGizmoEnabled(g => !g)} onTransformModeChange={setTransformMode} onSelectWearable={setSelectedWearableId}
          user={user} onEquipFromInventory={handleEquipFromInventory} onSellItem={handleSellItem}
          showMarketplace={showMarketplace} setShowMarketplace={setShowMarketplace}
          showDefaultAvatarPicker={showDefaultAvatarPicker} setShowDefaultAvatarPicker={setShowDefaultAvatarPicker}
          userHasGenesis={userHasGenesis} onSelectDefaultAvatar={handleSelectDefaultAvatar}
          roomMessages={roomMessages} sendRoomMessage={sendRoomMessage}
          isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} isInSocialRoom={isInSocialRoom}
          allAnimations={allAnimations}
          onPreviewAnimation={handlePreviewAnimation}
          onApplyAnimation={handleApplyAnimation}
          onCancelPreview={handleCancelPreview}
          onSave={onSaveAvatar}
          />
          )}

          {/* ── Desktop ── */}
          {!isMobile && (
          <div className="px-4 py-4 max-w-[95vw] mx-auto">
          <DripSyncDesktopLayout
            avatarSource={avatarSource} wearables={wearables} customAnimations={customAnimations}
            environment={environment} customization={customization} avatarGender={avatarGender} hardReloadToken={hardReloadToken}
            previewAnimUrl={previewAnimUrl} selectedWearableId={selectedWearableId}
            transformMode={transformMode} gizmoEnabled={gizmoEnabled}
            qualityMode={qualityMode} currentRealm={currentRealm} currentBackground={currentBackground}
            interactiveObjects={interactiveObjects} nearestInteractable={nearestInteractable}
            heldObjectLeft={heldObjectLeft} heldObjectRight={heldObjectRight}
            onWearableTransformChange={handleWearableTransformChange}
            onStateMachineInit={handleStateMachineInit}
            onNearestInteractable={setNearestInteractable}
            onHeldObjectChange={(hand, obj) => { if (hand === 'left') setHeldObjectLeft(obj); if (hand === 'right') setHeldObjectRight(obj); }}
            onRealmLoaded={(wm) => { if (wm?.environmentUrl && !environment) setEnvironment({ id: wm.realmId, name: wm.realmName, url: wm.environmentUrl }); }}
            onRealmError={(err) => toast({ variant: 'destructive', title: 'Realm load failed', description: err?.message, duration: 3000 })}
            isLeftPanelOpen={isLeftPanelOpen} setIsLeftPanelOpen={setIsLeftPanelOpen}
            isRightPanelOpen={isRightPanelOpen} setIsRightPanelOpen={setIsRightPanelOpen}
            activePanel={activePanel} setActivePanel={setActivePanel}
            isDemoMode={isDemoMode}
            showAnimationLibrary={showAnimationLibrary} setShowAnimationLibrary={setShowAnimationLibrary}
            showAnimationTimeline={showAnimationTimeline} setShowAnimationTimeline={setShowAnimationTimeline}
            animationSequence={animationSequence} setAnimationSequence={setAnimationSequence}
            isPlayingSequence={isPlayingSequence} setIsPlayingSequence={setIsPlayingSequence}
            stateMachineState={stateMachineState} allAnimations={allAnimations}
            onPreviewAnimation={handlePreviewAnimation} onApplyAnimation={handleApplyAnimation} onCancelPreview={handleCancelPreview}
            isSavingAvatar={isSavingAvatar} autoSave={autoSave} setAutoSave={setAutoSave}
            onSaveAvatar={onSaveAvatar} onSaveLook={() => setShowSaveLookModal(true)} onLoadLook={handleLoadLook}
            onViewLooks={() => setShowMyLooks(true)}
            onAvatarGenderChange={handleAvatarGenderChange}
            dripSyncMode={dripSyncMode} onModeChange={handleModeChange}
            onToggleGizmo={() => setGizmoEnabled(g => !g)}
            onTransformModeChange={setTransformMode} onSelectWearable={setSelectedWearableId}
            {...sharedClosetProps}
            onCustomizationChange={handleCustomizationChange} onHairAssetChange={handleHairAssetChange}
            onUpdatePhysics={handleUpdatePhysics}
            skinIsolationMap={skinIsolationMap}
            {...sharedSocialProps}
            onSnapToBone={handleSnapToBone} onResetTransform={handleResetTransform} onMirrorToOpposite={handleMirrorToOpposite}
            onEquipFromInventory={handleEquipFromInventory} onSellItem={handleSellItem} setShowMarketplace={setShowMarketplace}
            onBackgroundChange={setCurrentBackground}
            wearableError={wearableError}
            user={user}
            onSelectAsset={handleSelectAsset}
            onDeselectAsset={handleDeselectAsset}
          />
        </div>
      )}

      {/* ── Control Panel (asset-aware, always accessible) ── */}
      {!isMobile && (
        <div className="fixed bottom-6 right-6 z-25 max-w-sm">
          <ControlPanelVisibility
            selectedAsset={selectedAsset}
            selectedAssetType={selectedAssetType}
            onClose={handleDeselectAsset}
            onDuplicate={handleDuplicateAsset}
            onDelete={handleDeleteAsset}
            onReset={handleResetAssetTransform}
            onToggleLock={() => setIsAssetLocked(l => !l)}
            isLocked={isAssetLocked}
            gizmoEnabled={gizmoEnabled}
            onToggleGizmo={() => setGizmoEnabled(g => !g)}
            transformMode={transformMode}
            onTransformModeChange={setTransformMode}
            onColorChange={handleColorChange}
            currentColors={customization}
            isMobile={false}
          />
        </div>
      )}

      {isMobile && (
        <ControlPanelVisibility
          selectedAsset={selectedAsset}
          selectedAssetType={selectedAssetType}
          onClose={handleDeselectAsset}
          onDuplicate={handleDuplicateAsset}
          onDelete={handleDeleteAsset}
          onReset={handleResetAssetTransform}
          onToggleLock={() => setIsAssetLocked(l => !l)}
          isLocked={isAssetLocked}
          gizmoEnabled={gizmoEnabled}
          onToggleGizmo={() => setGizmoEnabled(g => !g)}
          transformMode={transformMode}
          onTransformModeChange={setTransformMode}
          onColorChange={handleColorChange}
          currentColors={customization}
          isMobile={true}
        />
      )}

      {/* ── Modals (always mounted, controlled by isOpen) ── */}
      <DripSyncModals
        isMobile={isMobile}
        showTriageCard={showTriageCard} currentUploadFile={currentUploadFile}
        onTriageConfirm={handleTriageConfirm} onTriageCancel={() => { setShowTriageCard(false); setCurrentUploadFile(null); setStatus('idle'); }}
        showMyLooks={showMyLooks} setShowMyLooks={setShowMyLooks} onLoadLook={handleLoadLook}
        showSaveLookModal={showSaveLookModal} setShowSaveLookModal={setShowSaveLookModal}
        avatarSource={avatarSource} customization={customization} wearables={wearables}
        customAnimations={customAnimations} environment={environment} currentRealm={currentRealm}
        user={user} onSaveLookSuccess={handleSaveLookSuccess} extractAvatarId={extractAvatarId}
        showShareLookModal={showShareLookModal} setShowShareLookModal={setShowShareLookModal} lookToShare={lookToShare}
        showDefaultAvatarPicker={showDefaultAvatarPicker} setShowDefaultAvatarPicker={setShowDefaultAvatarPicker}
        userHasGenesis={userHasGenesis} onSelectDefaultAvatar={handlePickAvatar}
        showStreamoji={showStreamoji} setShowStreamoji={setShowStreamoji} onStreamojiExported={handleStreamojiExported}
        showMarketplace={showMarketplace} setShowMarketplace={setShowMarketplace} onEquipFromInventory={handleEquipFromInventory}
        showCreateListing={showCreateListing} setShowCreateListing={setShowCreateListing}
        sellInventoryItem={sellInventoryItem} setSellInventoryItem={setSellInventoryItem}
        roomMessages={roomMessages} sendRoomMessage={sendRoomMessage}
        currentUserId={user?.id} isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} isInSocialRoom={isInSocialRoom}
      />

      {/* ── First-time guided experience ── */}
      <DripSyncGuide
        step={guideStep}
        reveal={guideReveal}
        onNext={handleGuideNext}
        onBack={handleGuideBack}
        onSkip={handleGuideSkip}
        onSaveIdentity={handleSaveIdentity}
        onEnterWorld={handleEnterWorldWithOffer}
        onKeepCustomizing={handleGuideKeepCustomizing}
      />

      {/* ── Post-onboarding contextual hints (one-time, non-blocking) ── */}
      <ContextualHint
        hintId="first_wardrobe"
        userId={user?.id}
        trigger={(activePanel === 'closet' || mobilePanel === 'closet') && guideStep === null}
        eligible={wearables.every((w) => !w || w.isDemo)}
        title="BUILD YOUR LOOK"
        body="Equip pieces to shape your digital identity."
        ctaLabel="GOT IT"
        position="bottom"
        z={90}
        autoMs={9000}
      />
      <ContextualHint
        hintId="first_tryon"
        userId={user?.id}
        trigger={tryOnHintTrigger}
        title="TRY IT ON"
        body="This piece is now previewing on your digital self."
        position="top"
        z={95}
        autoMs={8000}
      />

      {/* ── Membership conversion offer (post identity-created) ── */}
      <MembershipOffer
        open={showMembershipOffer}
        user={user}
        onContinueFree={handleContinueFree}
        onCheckoutStarted={handleCheckoutStarted}
      />

      {/* ── Guest → auth identity migration overlay ── */}
      <GuestIdentityFlow
        mode={guestFlow}
        onAuth={handleGuestAuth}
        onCancel={handleGuestCancel}
        onUseThisLook={handleUseThisLook}
        onKeepSaved={handleKeepSaved}
        onEnterWorld={handleEnterWorldWithOffer}
        onKeepCustomizing={handleKeepCustomizing}
      />
    </div>
  );
}

export default function DripSync() {
  return (
    <OnboardingGate>
      <DripSyncProvider>
        <DripSyncInner />
      </DripSyncProvider>
    </OnboardingGate>
  );
}