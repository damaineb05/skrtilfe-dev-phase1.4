/**
 * DRIPSYNC AVATAR SESSION STORE — V2
 * Single Source of Truth for all active avatar state.
 * Replaces 15+ individual useState calls in DripSync.jsx.
 *
 * Architecture:
 *   - React Context + useReducer for predictable updates
 *   - All avatar state reads come from useAvatarStore()
 *   - All avatar state writes go through dispatchAvatar()
 *   - DripSync.jsx becomes a thin orchestrator
 */
import { createContext, useContext, useReducer, useCallback, useRef, useEffect, createElement } from 'react';

// ─── Default State ────────────────────────────────────────────────────────────
export const DEFAULT_AVATAR_STATE = {
  // Identity
  avatarUrl: null,
  avatarId: null,
  source: null,              // 'rpm' | 'upload' | 'default' | 'look' | 'system'
  gender: 'masculine',       // 'masculine' | 'feminine' | 'neutral'
  savedAssetId: null,        // ID of the DripSyncAsset last loaded from library

  // Customization
  customization: {
    skinTone: '#C68642',
    eyeColor: '#4A90D9',
    hairColor: '#3B1F0A',
    isVisible: true,
  },

  // Wearables
  wearables: [],

  // Animations
  customAnimations: [],

  // Scene
  environment: null,
  currentRealm: null,
  sceneLibrary: [],

  // Viewport
  hardReloadToken: 0,

  // Save state
  isDirty: false,
  lastSavedAt: null,
  thumbnailUrl: null,
};

// ─── Action Types ─────────────────────────────────────────────────────────────
export const AVATAR_ACTIONS = {
  SET_AVATAR_URL:      'SET_AVATAR_URL',
  SET_GENDER:          'SET_GENDER',
  SET_CUSTOMIZATION:   'SET_CUSTOMIZATION',
  PATCH_CUSTOMIZATION: 'PATCH_CUSTOMIZATION',
  SET_WEARABLES:       'SET_WEARABLES',
  ADD_WEARABLE:        'ADD_WEARABLE',
  REMOVE_WEARABLE:     'REMOVE_WEARABLE',
  UPDATE_WEARABLE:     'UPDATE_WEARABLE',
  SET_ANIMATIONS:      'SET_ANIMATIONS',
  ADD_ANIMATION:       'ADD_ANIMATION',
  REMOVE_ANIMATION:    'REMOVE_ANIMATION',
  SET_ENVIRONMENT:     'SET_ENVIRONMENT',
  SET_REALM:           'SET_REALM',
  SET_SCENE_LIBRARY:   'SET_SCENE_LIBRARY',
  HARD_RELOAD:         'HARD_RELOAD',
  LOAD_FULL_STATE:     'LOAD_FULL_STATE',
  MARK_SAVED:          'MARK_SAVED',
  SET_THUMBNAIL:       'SET_THUMBNAIL',
  RESET:               'RESET',
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function avatarReducer(state, action) {
  switch (action.type) {

    case AVATAR_ACTIONS.SET_AVATAR_URL:
      return {
        ...state,
        avatarUrl: action.url,
        avatarId: action.avatarId ?? state.avatarId,
        source: action.source ?? state.source,
        isDirty: true,
        hardReloadToken: state.hardReloadToken + 1,
      };

    case AVATAR_ACTIONS.SET_GENDER:
      return {
        ...state,
        gender: action.gender,
        isDirty: true,
        hardReloadToken: state.hardReloadToken + 1,
      };

    case AVATAR_ACTIONS.SET_CUSTOMIZATION:
      return {
        ...state,
        customization: { ...action.customization, isVisible: true },
        isDirty: true,
      };

    case AVATAR_ACTIONS.PATCH_CUSTOMIZATION:
      return {
        ...state,
        customization: { ...state.customization, ...action.patch, isVisible: true },
        isDirty: true,
      };

    case AVATAR_ACTIONS.SET_WEARABLES:
      return {
        ...state,
        wearables: action.wearables,
        isDirty: true,
        hardReloadToken: state.hardReloadToken + 1,
      };

    case AVATAR_ACTIONS.ADD_WEARABLE: {
      const newWearable = action.wearable;
      // Exclusive slot replacement
      const EXCLUSIVE_SLOTS = ['headwear','hat','hair','glasses','eyewear','top','shirt','jacket','bottom','pants','shoes','footwear','full_body'];
      const isExclusive = EXCLUSIVE_SLOTS.includes(newWearable.slot);
      const slotsToReplace = [newWearable.slot, ...(newWearable.replaces_slots || [])];
      const filtered = isExclusive
        ? state.wearables.filter(w => !slotsToReplace.includes(w.slot))
        : state.wearables;
      return {
        ...state,
        wearables: [...filtered, newWearable],
        isDirty: true,
      };
    }

    case AVATAR_ACTIONS.REMOVE_WEARABLE:
      return {
        ...state,
        wearables: state.wearables.filter(w => w.id !== action.id),
        isDirty: true,
      };

    case AVATAR_ACTIONS.UPDATE_WEARABLE:
      return {
        ...state,
        wearables: state.wearables.map(w => w.id === action.id ? { ...w, ...action.patch } : w),
        isDirty: true,
      };

    case AVATAR_ACTIONS.SET_ANIMATIONS:
      return { ...state, customAnimations: action.animations, isDirty: true };

    case AVATAR_ACTIONS.ADD_ANIMATION:
      return { ...state, customAnimations: [...state.customAnimations, action.animation], isDirty: true };

    case AVATAR_ACTIONS.REMOVE_ANIMATION:
      return { ...state, customAnimations: state.customAnimations.filter(a => a.id !== action.id), isDirty: true };

    case AVATAR_ACTIONS.SET_ENVIRONMENT:
      return { ...state, environment: action.environment, isDirty: true };

    case AVATAR_ACTIONS.SET_REALM:
      return { ...state, currentRealm: action.realm, isDirty: true };

    case AVATAR_ACTIONS.SET_SCENE_LIBRARY:
      return { ...state, sceneLibrary: action.library };

    case AVATAR_ACTIONS.HARD_RELOAD:
      return { ...state, hardReloadToken: state.hardReloadToken + 1 };

    case AVATAR_ACTIONS.LOAD_FULL_STATE: {
      // Load a complete avatar state — from DripSyncAsset, user.avatar_config, or Look
      const s = action.state;
      return {
        ...state,
        avatarUrl: s.avatarUrl ?? state.avatarUrl,
        avatarId: s.avatarId ?? state.avatarId,
        source: s.source ?? state.source,
        gender: s.gender ?? s.avatarType ?? s.metadata?.gender ?? s.metadata?.avatarType ?? state.gender,
        customization: {
          ...DEFAULT_AVATAR_STATE.customization,
          ...(s.customization || s.metadata?.customization || {}),
          isVisible: true,
        },
        wearables: s.wearables ?? s.metadata?.wearables ?? state.wearables,
        customAnimations: s.animations ?? s.customAnimations ?? s.metadata?.animations ?? state.customAnimations,
        environment: s.environment ?? s.metadata?.environment ?? state.environment,
        currentRealm: s.currentRealm ?? s.realm ?? s.metadata?.currentRealm ?? state.currentRealm,
        savedAssetId: s.id ?? state.savedAssetId,
        isDirty: false,
        hardReloadToken: state.hardReloadToken + 1,
      };
    }

    case AVATAR_ACTIONS.MARK_SAVED:
      return {
        ...state,
        isDirty: false,
        lastSavedAt: new Date().toISOString(),
        thumbnailUrl: action.thumbnailUrl ?? state.thumbnailUrl,
        savedAssetId: action.assetId ?? state.savedAssetId,
      };

    case AVATAR_ACTIONS.SET_THUMBNAIL:
      return { ...state, thumbnailUrl: action.url };

    case AVATAR_ACTIONS.RESET:
      return { ...DEFAULT_AVATAR_STATE, hardReloadToken: state.hardReloadToken + 1 };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AvatarStoreContext = createContext(null);

export function AvatarStoreProvider({ children }) {
  const [avatarState, dispatch] = useReducer(avatarReducer, DEFAULT_AVATAR_STATE);

  return createElement(AvatarStoreContext.Provider, { value: { avatarState, dispatch } }, children);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAvatarStore() {
  const ctx = useContext(AvatarStoreContext);
  if (!ctx) throw new Error('useAvatarStore must be used inside AvatarStoreProvider');

  const { avatarState, dispatch } = ctx;

  // ── Action creators ──────────────────────────────────────────────────────
  const setAvatarUrl = useCallback((url, avatarId, source) => {
    dispatch({ type: AVATAR_ACTIONS.SET_AVATAR_URL, url, avatarId, source });
  }, [dispatch]);

  const setGender = useCallback((gender) => {
    dispatch({ type: AVATAR_ACTIONS.SET_GENDER, gender });
  }, [dispatch]);

  const setCustomization = useCallback((customization) => {
    dispatch({ type: AVATAR_ACTIONS.SET_CUSTOMIZATION, customization });
  }, [dispatch]);

  const patchCustomization = useCallback((patch) => {
    dispatch({ type: AVATAR_ACTIONS.PATCH_CUSTOMIZATION, patch });
  }, [dispatch]);

  const setWearables = useCallback((wearables) => {
    dispatch({ type: AVATAR_ACTIONS.SET_WEARABLES, wearables });
  }, [dispatch]);

  const addWearable = useCallback((wearable) => {
    dispatch({ type: AVATAR_ACTIONS.ADD_WEARABLE, wearable });
  }, [dispatch]);

  const removeWearable = useCallback((id) => {
    dispatch({ type: AVATAR_ACTIONS.REMOVE_WEARABLE, id });
  }, [dispatch]);

  const updateWearable = useCallback((id, patch) => {
    dispatch({ type: AVATAR_ACTIONS.UPDATE_WEARABLE, id, patch });
  }, [dispatch]);

  const setAnimations = useCallback((animations) => {
    dispatch({ type: AVATAR_ACTIONS.SET_ANIMATIONS, animations });
  }, [dispatch]);

  const addAnimation = useCallback((animation) => {
    dispatch({ type: AVATAR_ACTIONS.ADD_ANIMATION, animation });
  }, [dispatch]);

  const removeAnimation = useCallback((id) => {
    dispatch({ type: AVATAR_ACTIONS.REMOVE_ANIMATION, id });
  }, [dispatch]);

  const setEnvironment = useCallback((environment) => {
    dispatch({ type: AVATAR_ACTIONS.SET_ENVIRONMENT, environment });
  }, [dispatch]);

  const setRealm = useCallback((realm) => {
    dispatch({ type: AVATAR_ACTIONS.SET_REALM, realm });
  }, [dispatch]);

  const setSceneLibrary = useCallback((library) => {
    dispatch({ type: AVATAR_ACTIONS.SET_SCENE_LIBRARY, library });
  }, [dispatch]);

  const hardReload = useCallback(() => {
    dispatch({ type: AVATAR_ACTIONS.HARD_RELOAD });
  }, [dispatch]);

  const loadFullState = useCallback((state) => {
    dispatch({ type: AVATAR_ACTIONS.LOAD_FULL_STATE, state });
  }, [dispatch]);

  const markSaved = useCallback((assetId, thumbnailUrl) => {
    dispatch({ type: AVATAR_ACTIONS.MARK_SAVED, assetId, thumbnailUrl });
  }, [dispatch]);

  const setThumbnail = useCallback((url) => {
    dispatch({ type: AVATAR_ACTIONS.SET_THUMBNAIL, url });
  }, [dispatch]);

  const resetAvatar = useCallback(() => {
    dispatch({ type: AVATAR_ACTIONS.RESET });
  }, [dispatch]);

  return {
    avatarState,
    dispatch,
    // Actions
    setAvatarUrl,
    setGender,
    setCustomization,
    patchCustomization,
    setWearables,
    addWearable,
    removeWearable,
    updateWearable,
    setAnimations,
    addAnimation,
    removeAnimation,
    setEnvironment,
    setRealm,
    setSceneLibrary,
    hardReload,
    loadFullState,
    markSaved,
    setThumbnail,
    resetAvatar,
  };
}