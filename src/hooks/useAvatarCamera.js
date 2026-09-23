import { useCallback, useRef } from 'react';

/**
 * Smooth camera control system with orbit, zoom, and lerp transitions
 * Works with Three.js camera
 */
export function useAvatarCamera(cameraRef) {
  const stateRef = useRef({
    position: [0, 1.6, 3],
    rotation: [0, 0, 0],
    zoom: 3,
    orbitAngle: 0,
    orbitEnabled: false,
    isAnimating: false,
  });

  const animFrameRef = useRef(null);

  // Lerp between two values
  const lerp = useCallback((a, b, t) => {
    return a + (b - a) * t;
  }, []);

  // Lerp array of numbers
  const lerpArray = useCallback((a, b, t) => {
    return a.map((val, i) => lerp(val, b[i] || 0, t));
  }, [lerp]);

  // Smoothly transition camera to target
  const transitionTo = useCallback((targetState, duration = 800) => {
    if (!cameraRef?.current) return;

    const startState = { ...stateRef.current };
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress; // easeInOutQuad

      // Lerp position
      const newPosition = lerpArray(startState.position, targetState.position || startState.position, easeProgress);

      // Lerp rotation
      const newRotation = lerpArray(startState.rotation, targetState.rotation || startState.rotation, easeProgress);

      // Lerp zoom
      const newZoom = lerp(startState.zoom, targetState.zoom !== undefined ? targetState.zoom : startState.zoom, easeProgress);

      // Lerp orbit angle
      const newOrbitAngle = lerp(startState.orbitAngle, targetState.orbitAngle !== undefined ? targetState.orbitAngle : startState.orbitAngle, easeProgress);

      // Apply to camera
      cameraRef.current.position.set(...newPosition);
      cameraRef.current.rotation.order = 'YXZ';
      cameraRef.current.rotation.set(...newRotation);

      // Update state
      stateRef.current = {
        ...stateRef.current,
        position: newPosition,
        rotation: newRotation,
        zoom: newZoom,
        orbitAngle: newOrbitAngle,
        orbitEnabled: targetState.orbitEnabled !== undefined ? targetState.orbitEnabled : stateRef.current.orbitEnabled,
      };

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        stateRef.current.isAnimating = false;
      }
    };

    stateRef.current.isAnimating = true;
    animFrameRef.current = requestAnimationFrame(animate);
  }, [cameraRef, lerp, lerpArray]);

  // Apply camera preset
  const applyPreset = useCallback((preset) => {
    if (!cameraRef?.current) return;

    transitionTo({
      position: preset.position,
      rotation: preset.rotation,
      zoom: preset.zoom || 3,
    }, 600);
  }, [cameraRef, transitionTo]);

  // Set zoom with smooth transition
  const setZoom = useCallback((zoom) => {
    if (!cameraRef?.current) return;

    transitionTo({
      zoom,
    }, 300);
  }, [cameraRef, transitionTo]);

  // Set orbit angle with smooth transition
  const setOrbitAngle = useCallback((angle) => {
    if (!cameraRef?.current) return;

    const currentState = stateRef.current;
    const theta = (angle * Math.PI) / 180;
    const radius = Math.sqrt(currentState.position[0] ** 2 + currentState.position[2] ** 2) || 3;

    const newPosition = [
      Math.sin(theta) * radius,
      currentState.position[1],
      Math.cos(theta) * radius,
    ];

    transitionTo({
      position: newPosition,
      orbitAngle: angle,
    }, 400);
  }, [transitionTo]);

  // Toggle orbit mode
  const toggleOrbit = useCallback((enabled) => {
    stateRef.current.orbitEnabled = enabled;
  }, []);

  // Handle touch drag for rotation
  const handleTouchDrag = useCallback((deltaX, deltaY) => {
    if (!cameraRef?.current) return;

    const sensitivity = 0.01;
    const state = stateRef.current;

    // Horizontal drag = orbit
    const newAngle = state.orbitAngle + deltaX * sensitivity * 10;
    setOrbitAngle(newAngle);

    // Vertical drag = zoom
    if (Math.abs(deltaY) > 5) {
      const newZoom = Math.max(0.5, Math.min(8, state.zoom - deltaY * sensitivity * 0.1));
      setZoom(newZoom);
    }
  }, [cameraRef, setOrbitAngle, setZoom]);

  // Reset to default
  const reset = useCallback(() => {
    transitionTo({
      position: [0, 1.6, 3],
      rotation: [0, 0, 0],
      zoom: 3,
      orbitAngle: 0,
      orbitEnabled: false,
    }, 600);
  }, [transitionTo]);

  return {
    applyPreset,
    setZoom,
    setOrbitAngle,
    toggleOrbit,
    handleTouchDrag,
    reset,
    getState: () => stateRef.current,
  };
}