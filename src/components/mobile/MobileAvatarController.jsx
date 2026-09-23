import React, { useState, useRef } from 'react';
import { useAnimationLoader } from '@/hooks/useAnimationLoader';
import { useAvatarAnimationPlayer } from '@/hooks/useAvatarAnimationPlayer';
import { useAvatarCamera } from '@/hooks/useAvatarCamera';
import { useMobileAvatarContext } from '@/hooks/useMobileAvatarContext.jsx';
import AvatarControlSheet from './AvatarControlSheet';

/**
 * Complete mobile avatar control system
 * Integrates animation loading, picker wheel, camera, and bottom sheet
 * 
 * Automatically pulls refs from MobileAvatarContext if available,
 * or accepts them as props for manual integration
 */
export default function MobileAvatarController({
  avatarMeshRef: propAvatarMeshRef = null,
  cameraRef: propCameraRef = null,
  stateMachineRef: propStateMachineRef = null,
  isMobile = true,
}) {
  // All hooks must be called at top level before any early returns
  const [currentAnimationId, setCurrentAnimationId] = useState(null);
  const lastZoomRef = useRef(null);

  // Try to get refs from context, fallback to props
  let avatarMeshRef = propAvatarMeshRef;
  let cameraRef = propCameraRef;
  let stateMachineRef = propStateMachineRef;

  try {
    const contextRefs = useMobileAvatarContext();
    avatarMeshRef = avatarMeshRef || contextRefs.avatarMeshRef;
    cameraRef = cameraRef || contextRefs.cameraRef;
    stateMachineRef = stateMachineRef || contextRefs.stateMachineRef;
  } catch (e) {
    // Context not available, use props only
  }

  const { animations, isLoading } = useAnimationLoader(avatarMeshRef, stateMachineRef);
  const { playAnimation } = useAvatarAnimationPlayer(stateMachineRef, avatarMeshRef);
  const { applyPreset, setZoom, setOrbitAngle, toggleOrbit } = useAvatarCamera(cameraRef);

  // Don't render on desktop or while loading
  if (!isMobile || isLoading) {
    return null;
  }

  // Handle animation selection from picker wheel
  const handleAnimationSelect = (animationId, animationData) => {
    setCurrentAnimationId(animationId);
    
    // Play animation with live preview blending
    playAnimation(animationId, {
      crossfadeDuration: 0.3,
      loop: true,
      speed: 1.0,
      preview: false, // Full intensity since animation is centered
    });
  };

  // Handle camera changes from control panel
  const handleCameraChange = (cameraState) => {
    if (cameraState.preset) {
      // Apply preset
      const presetMap = {
        front: { position: [0, 1.6, 3], rotation: [0, 0, 0], zoom: 3 },
        side: { position: [3, 1.6, 0], rotation: [0, Math.PI / 2, 0], zoom: 2.5 },
        fullbody: { position: [0, 1, 5], rotation: [0, 0, 0], zoom: 3 },
        closeup: { position: [0, 1.7, 1], rotation: [0, 0, 0], zoom: 1.5 },
      };
      applyPreset(presetMap[cameraState.preset]);
    } else {
      // Apply individual controls
      if (cameraState.zoom !== undefined && cameraState.zoom !== lastZoomRef.current) {
        setZoom(cameraState.zoom);
        lastZoomRef.current = cameraState.zoom;
      }
      if (cameraState.orbitAngle !== undefined) {
        setOrbitAngle(cameraState.orbitAngle);
      }
      if (cameraState.orbit !== undefined) {
        toggleOrbit(cameraState.orbit);
      }
    }
  };

  return (
    <AvatarControlSheet
      animations={animations}
      currentAnimationId={currentAnimationId}
      onAnimationSelect={handleAnimationSelect}
      onCameraChange={handleCameraChange}
    />
  );
}