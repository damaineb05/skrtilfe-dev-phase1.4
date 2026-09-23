import { useCallback, useEffect, useRef } from 'react';

/**
 * Plays animations on avatar with crossfading
 * Prevents conflicts and manages animation state
 */
export function useAvatarAnimationPlayer(stateMachineRef, meshRef) {
  const currentAnimationRef = useRef(null);
  const fadeOutTimeoutRef = useRef(null);

  const playAnimation = useCallback((animationId, options = {}) => {
    const {
      crossfadeDuration = 0.3,
      loop = true,
      speed = 1.0,
      preview = false, // Low-intensity preview while scrolling
    } = options;

    if (!stateMachineRef?.current && !meshRef?.current) {
      console.warn('No animation system available');
      return;
    }

    // If state machine has play method
    if (stateMachineRef.current?.playAnimation) {
      try {
        stateMachineRef.current.playAnimation(animationId, {
          crossfadeDuration,
          loop,
          speed: preview ? speed * 0.5 : speed,
          preview,
        });
        currentAnimationRef.current = animationId;
      } catch (err) {
        console.warn('Animation play failed:', err.message);
      }
      return;
    }

    // Fallback: Use Three.js AnimationMixer
    if (meshRef?.current?.animations?.length > 0) {
      const THREE = window.THREE;
      if (!THREE) return;

      const mesh = meshRef.current;
      const mixer = mesh.mixer || new THREE.AnimationMixer(mesh);
      if (!mixer) return;

      const clip = THREE.AnimationClip.findByName(mesh.animations, animationId);
      if (!clip) {
        console.warn(`Animation clip not found: ${animationId}`);
        return;
      }

      // Stop previous animation with crossfade
      if (fadeOutTimeoutRef.current) {
        clearTimeout(fadeOutTimeoutRef.current);
      }

      const action = mixer.clipAction(clip);
      if (!action) return;

      action.loop = loop ? THREE.LoopRepeat : THREE.LoopOnce;
      action.timeScale = preview ? speed * 0.5 : speed;

      // Crossfade from previous
      if (mixer._actions?.length > 0) {
        const previous = mixer._actions[mixer._actions.length - 1];
        if (previous && previous !== action) {
          previous.fadeOut(crossfadeDuration);
        }
      }

      action.fadeIn(crossfadeDuration);
      action.play();
      currentAnimationRef.current = animationId;
    }
  }, [stateMachineRef, meshRef]);

  const stopAnimation = useCallback((fadeDuration = 0.2) => {
    if (stateMachineRef?.current?.stopAnimation) {
      stateMachineRef.current.stopAnimation(fadeDuration);
    }
    currentAnimationRef.current = null;
  }, [stateMachineRef]);

  const getCurrentAnimation = useCallback(() => {
    return currentAnimationRef.current;
  }, []);

  return {
    playAnimation,
    stopAnimation,
    getCurrentAnimation,
  };
}