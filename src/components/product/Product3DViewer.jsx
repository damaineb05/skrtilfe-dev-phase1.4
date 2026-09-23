import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Expand,
  Minimize2,
  Sun,
  Moon,
  Sparkles,
  Lightbulb,
  Box,
  Layers,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Settings,
  ChevronDown,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';

// Lighting presets for product viewing
const LIGHTING_PRESETS = {
  studio: {
    name: 'Studio',
    icon: Lightbulb,
    ambient: 0.8,
    keyIntensity: 1.2,
    keyColor: 0xffffff,
    fillIntensity: 0.6,
    fillColor: 0xffffff,
    rimIntensity: 0.8,
    rimColor: 0xffffff,
    background: 0xf5f5f5
  },
  dramatic: {
    name: 'Dramatic',
    icon: Sparkles,
    ambient: 0.3,
    keyIntensity: 2.0,
    keyColor: 0xffd700,
    fillIntensity: 0.2,
    fillColor: 0x4444ff,
    rimIntensity: 1.5,
    rimColor: 0xff4444,
    background: 0x111111
  },
  natural: {
    name: 'Natural',
    icon: Sun,
    ambient: 1.0,
    keyIntensity: 1.5,
    keyColor: 0xfffaf0,
    fillIntensity: 0.8,
    fillColor: 0x87ceeb,
    rimIntensity: 0.5,
    rimColor: 0xffffff,
    background: 0xe8e8e8
  },
  night: {
    name: 'Night',
    icon: Moon,
    ambient: 0.2,
    keyIntensity: 0.8,
    keyColor: 0x6688ff,
    fillIntensity: 0.3,
    fillColor: 0x332255,
    rimIntensity: 1.0,
    rimColor: 0x8888ff,
    background: 0x0a0a15
  },
  neon: {
    name: 'Neon',
    icon: Sparkles,
    ambient: 0.1,
    keyIntensity: 1.0,
    keyColor: 0xff00ff,
    fillIntensity: 0.8,
    fillColor: 0x00ffff,
    rimIntensity: 1.2,
    rimColor: 0xff3366,
    background: 0x0f0f23
  }
};

export default function Product3DViewer({
  modelUrl,
  productName = 'Product',
  onClose,
  isFullscreen = false,
  onToggleFullscreen
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [threeModules, setThreeModules] = useState(null);
  
  // Viewer state
  const [autoRotate, setAutoRotate] = useState(true);
  const [explodeAmount, setExplodeAmount] = useState(0);
  const [currentLighting, setCurrentLighting] = useState('studio');
  const [showControls, setShowControls] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Three.js refs
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const clockRef = useRef(null);
  const rafRef = useRef(null);
  const lightsRef = useRef({});
  const originalPositionsRef = useRef(new Map());

  // Load Three.js modules
  useEffect(() => {
    let mounted = true;
    
    const loadModules = async () => {
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
        const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
        
        if (mounted) {
          setThreeModules({ THREE, GLTFLoader, OrbitControls });
        }
      } catch (err) {
        console.error('Failed to load Three.js:', err);
        if (mounted) setError('Failed to load 3D engine');
      }
    };
    
    loadModules();
    return () => { mounted = false; };
  }, []);

  // Apply lighting preset
  const applyLighting = useCallback((presetName) => {
    if (!threeModules || !sceneRef.current || !lightsRef.current.ambient) return;
    
    const { THREE } = threeModules;
    const preset = LIGHTING_PRESETS[presetName];
    if (!preset) return;

    // Update ambient
    lightsRef.current.ambient.intensity = preset.ambient;
    
    // Update key light
    if (lightsRef.current.key) {
      lightsRef.current.key.intensity = preset.keyIntensity;
      lightsRef.current.key.color.setHex(preset.keyColor);
    }
    
    // Update fill light
    if (lightsRef.current.fill) {
      lightsRef.current.fill.intensity = preset.fillIntensity;
      lightsRef.current.fill.color.setHex(preset.fillColor);
    }
    
    // Update rim light
    if (lightsRef.current.rim) {
      lightsRef.current.rim.intensity = preset.rimIntensity;
      lightsRef.current.rim.color.setHex(preset.rimColor);
    }
    
    // Update background
    sceneRef.current.background = new THREE.Color(preset.background);
    
    setCurrentLighting(presetName);
  }, [threeModules]);

  // Explode view functionality
  const applyExplode = useCallback((amount) => {
    if (!modelRef.current || !threeModules) return;
    
    const { THREE } = threeModules;
    const model = modelRef.current;
    
    // Store original positions on first explode
    if (originalPositionsRef.current.size === 0) {
      model.traverse((child) => {
        if (child.isMesh) {
          originalPositionsRef.current.set(child.uuid, child.position.clone());
        }
      });
    }
    
    // Calculate center of model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    
    // Apply explosion
    model.traverse((child) => {
      if (child.isMesh) {
        const originalPos = originalPositionsRef.current.get(child.uuid);
        if (originalPos) {
          // Get world position
          const worldPos = new THREE.Vector3();
          child.getWorldPosition(worldPos);
          
          // Direction from center
          const direction = worldPos.clone().sub(center).normalize();
          
          // If direction is zero (at center), use random direction
          if (direction.length() < 0.01) {
            direction.set(
              Math.random() - 0.5,
              Math.random() - 0.5,
              Math.random() - 0.5
            ).normalize();
          }
          
          // Apply offset based on explode amount
          const offset = direction.multiplyScalar(amount * 0.5);
          child.position.copy(originalPos.clone().add(offset));
        }
      }
    });
    
    setExplodeAmount(amount);
  }, [threeModules]);

  // Reset view
  const resetView = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    applyExplode(0);
    setZoomLevel(1);
    setAutoRotate(true);
  }, [applyExplode]);

  // Zoom controls
  const handleZoom = useCallback((delta) => {
    if (!cameraRef.current) return;
    
    const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta));
    setZoomLevel(newZoom);
    
    const targetDistance = 5 / newZoom;
    const direction = cameraRef.current.position.clone().normalize();
    cameraRef.current.position.copy(direction.multiplyScalar(targetDistance));
  }, [zoomLevel]);

  // Initialize scene
  useEffect(() => {
    if (!threeModules || !containerRef.current || !canvasRef.current || !modelUrl) return;
    
    const { THREE, GLTFLoader, OrbitControls } = threeModules;
    let mounted = true;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(3, 2, 5);
    cameraRef.current = camera;
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;
    
    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    lightsRef.current.ambient = ambient;
    
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 10, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);
    lightsRef.current.key = keyLight;
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);
    lightsRef.current.fill = fillLight;
    
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, 5, -10);
    scene.add(rimLight);
    lightsRef.current.rim = rimLight;
    
    // Ground plane (subtle)
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Clock for animations
    clockRef.current = new THREE.Clock();
    
    // Load model
    const loader = new GLTFLoader();
    setIsLoading(true);
    
    loader.load(
      modelUrl,
      (gltf) => {
        if (!mounted) return;
        
        const model = gltf.scene;
        
        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        model.position.y -= (box.min.y * scale);
        
        // Enable shadows
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        scene.add(model);
        modelRef.current = model;
        
        // Handle animations
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;
          gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
        }
        
        // Update camera target
        controls.target.set(0, size.y * scale / 2, 0);
        controls.update();
        
        setIsLoading(false);
      },
      undefined,
      (err) => {
        console.error('Failed to load model:', err);
        if (mounted) {
          setError('Failed to load 3D model');
          setIsLoading(false);
        }
      }
    );
    
    // Animation loop
    const animate = () => {
      if (!mounted) return;
      rafRef.current = requestAnimationFrame(animate);
      
      const delta = clockRef.current.getDelta();
      
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.update();
      }
      
      renderer.render(scene, camera);
    };
    animate();
    
    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      
      // Clear original positions
      originalPositionsRef.current.clear();
    };
  }, [threeModules, modelUrl, autoRotate]);

  // Update auto-rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  const currentPreset = LIGHTING_PRESETS[currentLighting];
  const PresetIcon = currentPreset?.icon || Lightbulb;

  return (
    <div 
      ref={containerRef} 
      className={`relative bg-gray-100 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full min-h-[400px] rounded-xl'}`}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-600">Loading 3D Model...</p>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-6">
            <Box className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}
      
      {/* Top Controls */}
      <AnimatePresence>
        {showControls && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 flex items-center justify-between"
          >
            {/* Product Name */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
              <h3 className="font-semibold text-gray-900">{productName}</h3>
            </div>
            
            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Lighting Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="bg-white/90 backdrop-blur-sm shadow-lg">
                    <PresetIcon className="w-4 h-4 mr-2" />
                    {currentPreset?.name}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Lighting Preset</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(LIGHTING_PRESETS).map(([key, preset]) => {
                    const Icon = preset.icon;
                    return (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => applyLighting(key)}
                        className={currentLighting === key ? 'bg-cyan-50' : ''}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {preset.name}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Fullscreen Toggle */}
              {onToggleFullscreen && (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={onToggleFullscreen}
                  className="bg-white/90 backdrop-blur-sm shadow-lg"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
                </Button>
              )}
              
              {/* Close Button (fullscreen only) */}
              {isFullscreen && onClose && (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={onClose}
                  className="bg-white/90 backdrop-blur-sm shadow-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Bottom Controls */}
      <AnimatePresence>
        {showControls && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* View Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={autoRotate ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoRotate(!autoRotate)}
                    title={autoRotate ? "Stop Auto-Rotate" : "Start Auto-Rotate"}
                  >
                    {autoRotate ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                    Rotate
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetView}
                    title="Reset View"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                  
                  <div className="flex items-center gap-1 border rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleZoom(-0.2)}
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-mono w-12 text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleZoom(0.2)}
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Explode View */}
                <div className="flex items-center gap-3 flex-1 max-w-xs">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Explode</span>
                  </div>
                  <Slider
                    value={[explodeAmount]}
                    onValueChange={([val]) => applyExplode(val)}
                    min={0}
                    max={2}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono w-8 text-right text-gray-500">
                    {explodeAmount.toFixed(1)}
                  </span>
                </div>
                
                {/* Info */}
                <div className="text-xs text-gray-500 hidden sm:flex items-center gap-2">
                  <Move className="w-3 h-3" />
                  <span>Drag to rotate • Scroll to zoom • Shift+drag to pan</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toggle Controls Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowControls(!showControls)}
        className="absolute bottom-4 right-4 bg-white/50 backdrop-blur-sm hover:bg-white/80 z-10"
        title={showControls ? "Hide Controls" : "Show Controls"}
      >
        {showControls ? <Eye className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
      </Button>
    </div>
  );
}