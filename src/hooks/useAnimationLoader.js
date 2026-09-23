import { useCallback, useEffect, useState } from 'react';

/**
 * Dynamically loads available animations from:
 * - Avatar's glTF animation clips
 * - ReadyPlayerMe animation library
 * - Custom animation sources already loaded
 */
export function useAnimationLoader(avatarMeshRef, stateMachineRef) {
  const [animations, setAnimations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Format animation name: "Armature_mixamorig_idle" → "Idle"
  const formatAnimationName = useCallback((rawName) => {
    if (!rawName) return 'Unknown';
    
    // Remove common prefixes
    let cleaned = rawName
      .replace(/^[A-Z]+-|^armature_|^mixamorig_/gi, '')
      .replace(/_/g, ' ')
      .trim();
    
    // Capitalize each word
    return cleaned
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, []);

  // Extract animations from Three.js avatar mesh
  const extractMeshAnimations = useCallback(() => {
    if (!avatarMeshRef?.current) return [];

    const clips = [];
    const seen = new Set();

    // Walk through mesh animations
    if (avatarMeshRef.current.animations?.length) {
      avatarMeshRef.current.animations.forEach((clip) => {
        if (!seen.has(clip.name)) {
          clips.push({
            id: clip.name,
            name: formatAnimationName(clip.name),
            duration: clip.duration,
            source: 'mesh',
          });
          seen.add(clip.name);
        }
      });
    }

    return clips;
  }, [avatarMeshRef, formatAnimationName]);

  // Extract animations from existing state machine
  const extractStateMachineAnimations = useCallback(() => {
    if (!stateMachineRef?.current) return [];

    const clips = [];
    const seen = new Set();

    // If state machine has animation registry
    if (stateMachineRef.current.animationRegistry) {
      Object.entries(stateMachineRef.current.animationRegistry).forEach(([id, data]) => {
        if (!seen.has(id)) {
          clips.push({
            id,
            name: formatAnimationName(data.name || id),
            duration: data.duration || 0,
            source: 'state-machine',
          });
          seen.add(id);
        }
      });
    }

    return clips;
  }, [stateMachineRef, formatAnimationName]);

  // Get animations from RPM library or global animation library
  const getLibraryAnimations = useCallback(() => {
    const clips = [];
    const seen = new Set();

    // Try to access existing animation library from window or imported source
    const animLib = window.__rpmAnimations || window.__animationLibrary || [];
    
    if (Array.isArray(animLib)) {
      animLib.forEach((anim) => {
        const id = anim.id || anim.name;
        if (!seen.has(id)) {
          clips.push({
            id,
            name: formatAnimationName(anim.name || id),
            duration: anim.duration || 2.0,
            source: 'library',
            url: anim.url,
          });
          seen.add(id);
        }
      });
    }

    return clips;
  }, [formatAnimationName]);

  // Load all animations on mount or when refs change
  useEffect(() => {
    setIsLoading(true);

    // Combine all animation sources
    const allAnimations = [
      ...extractMeshAnimations(),
      ...extractStateMachineAnimations(),
      ...getLibraryAnimations(),
    ];

    // Deduplicate by id
    const uniqueMap = new Map();
    allAnimations.forEach((anim) => {
      if (!uniqueMap.has(anim.id)) {
        uniqueMap.set(anim.id, anim);
      }
    });

    const final = Array.from(uniqueMap.values());

    // If no animations found, provide sensible defaults
    if (final.length === 0) {
      final.push(
        { id: 'idle', name: 'Idle', duration: 1.0, source: 'default' },
        { id: 'walk', name: 'Walk', duration: 0.5, source: 'default' },
        { id: 'run', name: 'Run', duration: 0.4, source: 'default' }
      );
    }

    setAnimations(final);
    setIsLoading(false);
  }, [extractMeshAnimations, extractStateMachineAnimations, getLibraryAnimations]);

  return { animations, isLoading };
}