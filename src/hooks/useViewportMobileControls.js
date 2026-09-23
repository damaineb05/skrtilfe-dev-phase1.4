import { useEffect, useRef } from 'react';

/**
 * Mobile touch controls for viewport camera
 * Touch drag = rotate (OrbitControls)
 * Pinch = zoom
 */
export function useViewportMobileControls(containerRef, controlsRef) {
  const touchStartRef = useRef(null);
  const touchDistanceRef = useRef(null);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container || !controlsRef?.current) return;

    const controls = controlsRef.current;

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        // Single touch — rotate (let OrbitControls handle it)
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        touchDistanceRef.current = null;
      } else if (e.touches.length === 2) {
        // Two-finger pinch — zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
        touchStartRef.current = null;
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && touchDistanceRef.current !== null) {
        // Pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDistance = Math.sqrt(dx * dx + dy * dy);
        const delta = (touchDistanceRef.current - newDistance) * 0.01; // Sensitivity

        // Zoom via distance property
        if (controls && typeof controls.getDistance === 'function') {
          const currentDist = controls.getDistance();
          const newDist = Math.max(2.0, Math.min(10, currentDist + delta));
          const direction = controls.object.position.clone().sub(controls.target).normalize();
          controls.object.position.copy(controls.target.clone().add(direction.multiplyScalar(newDist)));
        }

        touchDistanceRef.current = newDistance;
      } else if (touchStartRef.current && e.touches.length === 1) {
        // Single touch drag — let OrbitControls handle via default behavior
        // (no manual rotation needed, pointerdown/move events work for this)
      }
    };

    const onTouchEnd = () => {
      touchStartRef.current = null;
      touchDistanceRef.current = null;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [containerRef, controlsRef]);
}