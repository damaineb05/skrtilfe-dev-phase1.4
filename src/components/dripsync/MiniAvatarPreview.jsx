import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { User } from 'lucide-react';

export default function MiniAvatarPreview({ avatarUrl, wearables = [], customization = {} }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const avatarRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !avatarUrl) {
      setError('No avatar URL');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0a0f);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Camera — positioned to show top half of avatar
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.8, 1.2); // Focus on shoulders/head
    camera.lookAt(0, 0.8, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Load avatar
    const loader = new GLTFLoader();
    loader.load(
      avatarUrl,
      (gltf) => {
        const avatar = gltf.scene;
        avatar.position.set(0, 0, 0);
        avatar.scale.set(1, 1, 1);

        // Apply customization (basic visibility for now)
        if (!customization.isVisible) {
          avatar.visible = false;
        }

        scene.add(avatar);
        avatarRef.current = avatar;

        // Auto-rotate for visual interest
        let rotationAngle = 0;
        const animate = () => {
          animationFrameRef.current = requestAnimationFrame(animate);
          rotationAngle += 0.005;
          if (avatar) avatar.rotation.y = rotationAngle;
          renderer.render(scene, camera);
        };
        animate();

        setIsLoading(false);
      },
      (progress) => {
        // Optional: track progress
      },
      (err) => {
        console.error('Failed to load avatar:', err);
        setError('Failed to load avatar');
        setIsLoading(false);
      }
    );

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (renderer && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, [avatarUrl, customization.isVisible]);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center"
    >
      {isLoading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 rounded-xl">
          <div className="flex flex-col items-center gap-2 text-white/60">
            <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-xs">Loading avatar...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center gap-2 text-white/30">
          <User className="w-10 h-10" />
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}