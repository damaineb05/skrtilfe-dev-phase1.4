import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

// Preload and cache 3D models
export function preloadModel(url) {
  useGLTF.preload(url);
}

// Cleanup unused models
export function disposeModel(url) {
  useGLTF.clear(url);
}

// Optimized 3D model component with automatic cleanup
export function OptimizedModel({ url, ...props }) {
  const { scene } = useGLTF(url);
  
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [scene]);

  return <primitive object={scene} {...props} />;
}

// Performance monitor for 3D scenes
export function usePerformanceMonitor(onDrop) {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationId;

    const checkPerformance = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime.current;

      if (elapsed >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / elapsed);
        
        if (fps < 30 && onDrop) {
          onDrop(fps);
        }

        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationId = requestAnimationFrame(checkPerformance);
    };

    checkPerformance();

    return () => cancelAnimationFrame(animationId);
  }, [onDrop]);
}

// Optimized Canvas with performance settings
export function OptimizedCanvas({ children, ...props }) {
  return (
    <Canvas
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        alpha: true,
      }}
      dpr={[1, 2]} // Limit pixel ratio for better performance
      performance={{ min: 0.5 }} // Adaptive performance
      frameloop="demand" // Only render when needed
      {...props}
    >
      {children}
    </Canvas>
  );
}