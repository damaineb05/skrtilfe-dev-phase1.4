import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  Loader2, RotateCcw, ZoomIn, ZoomOut, Play, Pause,
  Sun, Moon, Sparkles, Lightbulb, Box
} from 'lucide-react';

const LIGHTING_PRESETS = [
  { key: 'studio',   label: 'Studio',   icon: Lightbulb, bg: 0xf0f0f0, ambient: 0.8, key1: [0xffffff, 1.4, 5, 10, 7], key2: [0xffffff, 0.6, -5, 4, -4] },
  { key: 'neon',     label: 'Neon',     icon: Sparkles,  bg: 0x0f0f23, ambient: 0.2, key1: [0xff00ff, 1.0, 5, 5, 5],  key2: [0x00ffff, 0.8, -5, 3, -3] },
  { key: 'natural',  label: 'Natural',  icon: Sun,       bg: 0xe0e8f0, ambient: 1.0, key1: [0xfffaf0, 1.5, 8, 12, 6], key2: [0x87ceeb, 0.8, -6, 2, -5] },
  { key: 'night',    label: 'Night',    icon: Moon,      bg: 0x0a0a15, ambient: 0.2, key1: [0x6688ff, 0.8, 4, 8, 5],  key2: [0x332255, 0.4, -4, 2, -4] },
];

// Fallback demo GLB — a simple public asset
const DEMO_MODEL = 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';

export default function NFT3DViewerModal({ isOpen, onClose, nft }) {
  const mountRef = useRef(null);
  const rafRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const sceneRef = useRef(null);
  const lightsRef = useRef({ key1: null, key2: null, ambient: null });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [preset, setPreset] = useState(0); // index into LIGHTING_PRESETS
  const [zoom, setZoom] = useState(1);

  const modelUrl = nft?.model_url || DEMO_MODEL;

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    const container = mountRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 1000);
    camera.position.set(0, 1, 3);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const key1 = new THREE.DirectionalLight(0xffffff, 1.4);
    key1.position.set(5, 10, 7);
    key1.castShadow = true;
    scene.add(key1);
    const key2 = new THREE.DirectionalLight(0xffffff, 0.6);
    key2.position.set(-5, 4, -4);
    scene.add(key2);
    lightsRef.current = { ambient, key1, key2 };

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.minDistance = 0.5;
    controls.maxDistance = 20;
    controlsRef.current = controls;

    // Load model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        if (!mounted) return;
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        model.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        scene.add(model);
        controls.target.set(0, (size.y * scale) / 4, 0);
        controls.update();
        setLoading(false);

        // Play animations if any
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach(clip => mixer.clipAction(clip).play());
          const clock = new THREE.Clock();
          const origAnimate = animate;
          animate = () => {
            if (!mounted) return;
            rafRef.current = requestAnimationFrame(animate);
            mixer.update(clock.getDelta());
            controls.update();
            renderer.render(scene, camera);
          };
        }
      },
      undefined,
      (err) => {
        if (!mounted) return;
        console.error('NFT 3D load error:', err);
        setError('3D model unavailable');
        setLoading(false);
      }
    );

    // Animate
    let animate = () => {
      if (!mounted) return;
      rafRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!container || !mounted) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isOpen, modelUrl]);

  // Apply lighting preset
  useEffect(() => {
    if (!sceneRef.current || !lightsRef.current.ambient) return;
    const p = LIGHTING_PRESETS[preset];
    sceneRef.current.background = new THREE.Color(p.bg);
    lightsRef.current.ambient.intensity = p.ambient;
    if (lightsRef.current.key1) {
      lightsRef.current.key1.color.setHex(p.key1[0]);
      lightsRef.current.key1.intensity = p.key1[1];
      lightsRef.current.key1.position.set(p.key1[2], p.key1[3], p.key1[4]);
    }
    if (lightsRef.current.key2) {
      lightsRef.current.key2.color.setHex(p.key2[0]);
      lightsRef.current.key2.intensity = p.key2[1];
      lightsRef.current.key2.position.set(p.key2[2], p.key2[3], p.key2[4]);
    }
  }, [preset]);

  // Auto-rotate toggle
  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  const handleZoom = (delta) => {
    if (!controlsRef.current) return;
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta));
    setZoom(newZoom);
    const cam = controlsRef.current.object;
    if (cam) {
      const dir = cam.position.clone().normalize();
      cam.position.copy(dir.multiplyScalar(3 / newZoom));
      controlsRef.current.update();
    }
  };

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      setZoom(1);
    }
    setAutoRotate(true);
    setPreset(0);
  };

  const P = LIGHTING_PRESETS[preset];
  const PIcon = P.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full bg-gray-900 border-cyan-500/30 text-white p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-4 pb-2 border-b border-white/10">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Box className="w-4 h-4 text-cyan-400" />
            {nft?.name || 'NFT'} — 3D Viewer
          </DialogTitle>
        </DialogHeader>

        {/* Viewport */}
        <div ref={mountRef} className="relative w-full" style={{ height: 420 }}>
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
              <p className="text-sm text-white/60">Loading 3D model…</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-10">
              <Box className="w-12 h-12 text-white/20 mb-3" />
              <p className="text-white/50 text-sm">{error}</p>
            </div>
          )}
          {!loading && !error && (
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xl rounded-lg px-3 py-1.5 text-xs text-white/60 pointer-events-none z-10">
              Drag to rotate • Scroll to zoom • Shift+drag to pan
            </div>
          )}
        </div>

        {/* Controls Bar */}
        {!loading && !error && (
          <div className="px-4 py-3 border-t border-white/10 bg-gray-950/80 flex flex-wrap items-center gap-3">
            {/* Auto-rotate */}
            <Button
              size="sm"
              variant={autoRotate ? 'default' : 'outline'}
              onClick={() => setAutoRotate(v => !v)}
              className={autoRotate ? 'bg-cyan-500 hover:bg-cyan-600 text-black' : 'border-white/20 text-white'}
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
              Rotate
            </Button>

            {/* Zoom */}
            <div className="flex items-center gap-1 border border-white/20 rounded-lg px-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/70 hover:text-white" onClick={() => handleZoom(-0.25)}>
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs font-mono w-10 text-center text-white/70">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/70 hover:text-white" onClick={() => handleZoom(0.25)}>
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Lighting presets */}
            <div className="flex items-center gap-1">
              {LIGHTING_PRESETS.map((lp, i) => {
                const LIcon = lp.icon;
                return (
                  <button
                    key={lp.key}
                    title={lp.label}
                    onClick={() => setPreset(i)}
                    className={`p-1.5 rounded-lg text-xs transition-all ${i === preset ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-white/40 hover:text-white border border-transparent'}`}
                  >
                    <LIcon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Reset */}
            <Button size="sm" variant="outline" onClick={handleReset} className="border-white/20 text-white ml-auto">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}