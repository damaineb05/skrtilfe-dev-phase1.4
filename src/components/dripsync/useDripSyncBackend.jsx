import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * DripSync Backend Hooks
 * Production-grade data layer using Base44 entity system
 * Maps to backend architecture: Avatar, Wearable, DripSyncState, CollisionProfile, Environment
 */

/**
 * useAuth - Identity root for all DripSync logic
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  return { user, loading };
}

/**
 * useAvatar - Load RPM avatar GLB reliably
 * Frontend Guarantee: Avatar GLB URL always comes from backend
 */
export function useAvatar(userEmail) {
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAvatar = useCallback(async () => {
    if (!userEmail) return null;
    
    setLoading(true);
    try {
      const avatars = await base44.entities.Avatar.filter(
        { user_email: userEmail, is_active: true },
        '-updated_date',
        1
      );
      const activeAvatar = avatars?.[0] || null;
      setAvatar(activeAvatar);
      return activeAvatar;
    } catch (error) {
      console.error('Failed to load avatar:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  const saveAvatar = useCallback(async (avatarData) => {
    if (!userEmail) return;
    
    try {
      // Deactivate existing avatars
      const existing = await base44.entities.Avatar.filter({ user_email: userEmail });
      await Promise.all(
        existing.map(av => base44.entities.Avatar.update(av.id, { is_active: false }))
      );
      
      // Create new active avatar
      const newAvatar = await base44.entities.Avatar.create({
        ...avatarData,
        user_email: userEmail,
        is_active: true
      });
      
      setAvatar(newAvatar);
      return newAvatar;
    } catch (error) {
      console.error('Failed to save avatar:', error);
      throw error;
    }
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) {
      getAvatar();
    }
  }, [userEmail, getAvatar]);

  return { avatar, loading, getAvatar, saveAvatar };
}

/**
 * useWearables - Real GLB wearables registry
 */
export function useWearables() {
  const [wearables, setWearables] = useState([]);
  const [loading, setLoading] = useState(false);

  const getWearables = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const data = await base44.entities.Wearable.filter(filters);
      setWearables(data || []);
      return data;
    } catch (error) {
      console.error('Failed to load wearables:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getPlatformWearables = useCallback(async () => {
    return getWearables({ is_platform_asset: true });
  }, [getWearables]);

  const getWearablesByCategory = useCallback(async (category) => {
    return getWearables({ category, is_platform_asset: true });
  }, [getWearables]);

  useEffect(() => {
    getPlatformWearables();
  }, [getPlatformWearables]);

  return { 
    wearables, 
    loading, 
    getWearables, 
    getPlatformWearables,
    getWearablesByCategory 
  };
}

/**
 * useDripSyncState - Persistence = identity continuity
 * Visual Guarantee: Reload = exact same avatar, wearables, camera, animation
 */
export function useDripSyncState(userEmail) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadState = useCallback(async () => {
    if (!userEmail) return null;
    
    setLoading(true);
    try {
      const states = await base44.entities.DripSyncState.filter(
        { user_email: userEmail },
        '-updated_date',
        1
      );
      const latestState = states?.[0] || null;
      setState(latestState);
      return latestState;
    } catch (error) {
      console.error('Failed to load DripSync state:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  const saveState = useCallback(async (stateData) => {
    if (!userEmail) return;
    
    try {
      if (state?.id) {
        // Update existing state
        const updated = await base44.entities.DripSyncState.update(state.id, {
          ...stateData,
          user_email: userEmail
        });
        setState(updated);
        return updated;
      } else {
        // Create new state
        const newState = await base44.entities.DripSyncState.create({
          ...stateData,
          user_email: userEmail
        });
        setState(newState);
        return newState;
      }
    } catch (error) {
      console.error('Failed to save DripSync state:', error);
      throw error;
    }
  }, [userEmail, state]);

  const updateState = useCallback(async (partialState) => {
    if (!state) return;
    return saveState({ ...state, ...partialState });
  }, [state, saveState]);

  useEffect(() => {
    if (userEmail) {
      loadState();
    }
  }, [userEmail, loadState]);

  return { state, loading, loadState, saveState, updateState };
}

/**
 * useCollisionProfiles - Collision metadata system
 */
export function useCollisionProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const getProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.CollisionProfile.list();
      setProfiles(data || []);
      return data;
    } catch (error) {
      console.error('Failed to load collision profiles:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getProfileById = useCallback(async (id) => {
    try {
      const profile = await base44.entities.CollisionProfile.filter({ id }, '', 1);
      return profile?.[0] || null;
    } catch (error) {
      console.error('Failed to load collision profile:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    getProfiles();
  }, [getProfiles]);

  return { profiles, loading, getProfiles, getProfileById };
}

/**
 * useEnvironments - Environment registry (future-proofing)
 */
export function useEnvironments() {
  const [environments, setEnvironments] = useState([]);
  const [loading, setLoading] = useState(false);

  const getEnvironments = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const data = await base44.entities.Environment.filter(filters);
      setEnvironments(data || []);
      return data;
    } catch (error) {
      console.error('Failed to load environments:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getPublicEnvironments = useCallback(async () => {
    return getEnvironments({ is_public: true });
  }, [getEnvironments]);

  useEffect(() => {
    getPublicEnvironments();
  }, [getPublicEnvironments]);

  return { 
    environments, 
    loading, 
    getEnvironments, 
    getPublicEnvironments 
  };
}

/**
 * useGenesis - Genesis + token gating expansion
 * Layers on top without refactoring DripSync core
 */
export function useGenesis(userEmail) {
  const [genesisStatus, setGenesisStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const getGenesisStatus = useCallback(async () => {
    if (!userEmail) return null;
    
    setLoading(true);
    try {
      // Check user role (admin = Genesis holder in current setup)
      const user = await base44.auth.me();
      const isGenesis = user?.role === 'admin' || user?.genesis_holder === true;
      
      const status = {
        active: isGenesis,
        tier: isGenesis ? 'genesis' : 'standard',
        user_email: userEmail
      };
      
      setGenesisStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to check Genesis status:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  const canAccessFeature = useCallback((featureName) => {
    if (!genesisStatus) return false;
    
    // Feature gating logic
    const genesisFeatures = [
      'premium_wearables',
      'custom_environments',
      'animation_packs',
      'multiplayer_rooms',
      'creator_tools'
    ];
    
    if (genesisFeatures.includes(featureName)) {
      return genesisStatus.active;
    }
    
    return true; // Public feature
  }, [genesisStatus]);

  useEffect(() => {
    if (userEmail) {
      getGenesisStatus();
    }
  }, [userEmail, getGenesisStatus]);

  return { genesisStatus, loading, getGenesisStatus, canAccessFeature };
}

/**
 * useDripSyncRuntime - Combined hook for full DripSync experience
 * Orchestrates all backend systems
 */
export function useDripSyncRuntime() {
  const { user, loading: authLoading } = useAuth();
  const { avatar, loading: avatarLoading, saveAvatar } = useAvatar(user?.email);
  const { wearables, loading: wearablesLoading } = useWearables();
  const { state, saveState, updateState } = useDripSyncState(user?.email);
  const { genesisStatus, canAccessFeature } = useGenesis(user?.email);
  const { environments } = useEnvironments();
  const { profiles: collisionProfiles } = useCollisionProfiles();

  const loading = authLoading || avatarLoading || wearablesLoading;

  return {
    user,
    avatar,
    wearables,
    state,
    genesisStatus,
    environments,
    collisionProfiles,
    loading,
    saveAvatar,
    saveState,
    updateState,
    canAccessFeature
  };
}

export default useDripSyncRuntime;