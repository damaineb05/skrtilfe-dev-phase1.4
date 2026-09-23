import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

/**
 * Hook to load and play RPM animations on an avatar
 * @param {Object} params
 * @param {THREE.Object3D} params.avatarRoot - The avatar's root object
 * @param {Object} params.currentClip - The current animation clip to play
 * @param {Function} params.onLoadStart - Callback when loading starts
 * @param {Function} params.onLoadComplete - Callback when loading completes
 * @param {Function} params.onError - Callback on error
 */
export function useRpmAnimation({ 
  avatarRoot, 
  currentClip,
  onLoadStart,
  onLoadComplete,
  onError 
}) {
  const mixerRef = useRef(null);
  const activeActionRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const animationFrameRef = useRef(null);

  // Animation update loop
  useEffect(() => {
    if (!mixerRef.current) return;

    const animate = () => {
      const delta = clockRef.current.getDelta();
      mixerRef.current.update(delta);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mixerRef.current]);

  // Load and play animation
  useEffect(() => {
    if (!avatarRoot || !currentClip) return;

    onLoadStart?.();

    const loader = new FBXLoader();

    loader.load(
      currentClip.fbxUrl,
      (fbx) => {
        if (!avatarRoot) return;

        // Create mixer if it doesn't exist
        if (!mixerRef.current) {
          mixerRef.current = new THREE.AnimationMixer(avatarRoot);
        }

        const mixer = mixerRef.current;

        // Get the animation clip
        const clip = fbx.animations[0];
        if (!clip) {
          console.warn('No animation found in FBX:', currentClip.id);
          onError?.('No animation data found');
          return;
        }

        // Fade out current animation
        if (activeActionRef.current) {
          activeActionRef.current.fadeOut(0.3);
        }

        // Create and play new animation
        const action = mixer.clipAction(clip);
        action.reset();
        action.fadeIn(0.3);
        action.play();

        activeActionRef.current = action;

        console.log('✅ Animation loaded:', currentClip.id);
        onLoadComplete?.();
      },
      (xhr) => {
        // Progress callback
        const percent = (xhr.loaded / xhr.total) * 100;
        console.log(`Loading ${currentClip.id}: ${percent.toFixed(0)}%`);
      },
      (error) => {
        console.error('Failed to load animation:', currentClip.id, error);
        onError?.(error.message || 'Failed to load animation');
      }
    );

    // Cleanup
    return () => {
      if (activeActionRef.current) {
        activeActionRef.current.fadeOut(0.3);
      }
    };
  }, [avatarRoot, currentClip]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    mixer: mixerRef.current,
    activeAction: activeActionRef.current,
  };
}