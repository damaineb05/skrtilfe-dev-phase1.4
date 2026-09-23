import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Lock, MousePointerClick, Grid3x3, Loader2, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function StudioViewport({ avatarUrl }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const canvasRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const animationIdRef = useRef(null);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    isHoveringRef.current = isHovering;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !isHovering;
    }
  }, [isHovering]);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  // Scene init — runs once only
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 4.5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const spot1 = new THREE.SpotLight(0xffffff, 1.2);
    spot1.position.set(5, 8, 5);
    spot1.castShadow = true;
    scene.add(spot1);
    const spot2 = new THREE.SpotLight(0xffffff, 0.8);
    spot2.position.set(-5, 8, -5);
    scene.add(spot2);
    const pointLight = new THREE.PointLight(0x00D4FF, 0.5);
    pointLight.position.set(0, 2, 0);
    scene.add(pointLight);

    // Grid
    const gridHelper = new THREE.GridHelper(10, 10, 0x00D4FF, 0x1a1a2e);
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 3.5;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.target.set(0, 0.3, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Load Avatar
    const loader = new GLTFLoader();
    const src = avatarUrl || 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb';

    loader.load(
      src,
      (gltf) => {
        const avatar = gltf.scene;
        avatar.scale.set(1.8, 1.8, 1.8);
        avatar.position.set(0, -1, 0);
        avatar.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        scene.add(avatar);
        setIsLoading(false);
        setLoadFailed(false);
      },
      undefined,
      (error) => {
        if (error) {
          setIsLoading(false);
          setLoadFailed(true);
        }
      }
    );

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.autoRotate = !isHoveringRef.current;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!canvas) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationIdRef.current);
      renderer.dispose();
      scene.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarUrl]); // only re-init when avatarUrl changes, NOT on hover

  const handleClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      base44.auth.redirectToLogin(createPageUrl('DripSync'));
    }
  };

  return (
    <Link
      to={createPageUrl('DripSync')}
      onClick={handleClick}
      className="absolute inset-0 group cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* 3D Canvas — always rendered so Three.js has a target */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${loadFailed ? 'opacity-0' : 'opacity-100'}`}
        style={{ pointerEvents: 'all' }}
      />

      {/* Fallback placeholder when avatar fails to load */}
      {loadFailed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a12] to-[#0d1020]">
          <div className="w-24 h-24 rounded-full bg-slate-800/60 border border-[#00D4FF]/20 flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-slate-500" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Avatar Studio</p>
          <p className="text-slate-600 text-xs mt-1">Click to open DripSync</p>
          {/* Ambient grid lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
               style={{
                 backgroundImage: `linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)`,
                 backgroundSize: '40px 40px'
               }} />
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && !loadFailed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-[#00D4FF] animate-spin mx-auto mb-3" />
            <p className="text-white/50 text-sm">Loading avatar...</p>
          </div>
        </div>
      )}

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4">
          <Badge className="bg-black/60 backdrop-blur-sm text-[#00D4FF] border-[#00D4FF]/30 pointer-events-auto">
            <Grid3x3 className="w-3 h-3 mr-1" />
            Studio Viewport
          </Badge>
        </div>

        {!currentUser && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-center pointer-events-auto">
              <div className="w-16 h-16 rounded-full bg-[#00D4FF]/20 border border-[#00D4FF]/40 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-[#00D4FF]" />
              </div>
              <p className="text-white font-semibold text-lg mb-2">Sign in to access Studio</p>
              <p className="text-white/60 text-sm">Create and customize your avatar</p>
            </div>
          </div>
        )}

        {currentUser && isHovering && !isLoading && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full border border-[#00D4FF]/30">
            <MousePointerClick className="w-4 h-4 text-[#00D4FF]" />
            <span className="text-white text-sm font-medium">Click to enter Studio</span>
          </div>
        )}
      </div>
    </Link>
  );
}