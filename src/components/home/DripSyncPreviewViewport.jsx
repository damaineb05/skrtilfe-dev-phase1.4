import React, { useRef, useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const DEFAULT_AVATAR = 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb';

export default function DripSyncPreviewViewport({ avatarUrl = DEFAULT_AVATAR }) {
  const mountRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const mixerRef = useRef(null);
  const modelRef = useRef(null);
  const clockRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!mountRef.current || !canvasRef.current) return;

    let isMounted = true;
    let THREE, GLTFLoader, OrbitControls;

    const init = async () => {
      try {
        THREE = await import('three');
        const gltfModule = await import('three/addons/loaders/GLTFLoader.js');
        GLTFLoader = gltfModule.GLTFLoader;
        const controlsModule = await import('three/addons/controls/OrbitControls.js');
        OrbitControls = controlsModule.OrbitControls;

        if (!isMounted) return;

        clockRef.current = new THREE.Clock();

        // Renderer
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: true,
        });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.shadowMap.enabled = true;
        rendererRef.current = renderer;

        // Scene
        const scene = new THREE.Scene();
        scene.background = null;
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(
          50,
          mountRef.current.clientWidth / mountRef.current.clientHeight,
          0.1,
          100
        );
        camera.position.set(0, 1.2, 3);
        cameraRef.current = camera;

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambient);

        const key = new THREE.DirectionalLight(0xffffff, 1.0);
        key.position.set(5, 10, 7);
        scene.add(key);

        const fill = new THREE.DirectionalLight(0x00ffff, 0.3);
        fill.position.set(-5, 3, -5);
        scene.add(fill);

        const rim = new THREE.DirectionalLight(0xffffff, 0.6);
        rim.position.set(0, 3, -8);
        scene.add(rim);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 1, 0);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.5;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.update();

        // Load avatar
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(avatarUrl);
        if (!isMounted) return;

        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.y = -box.min.y;
        model.position.x = -center.x;
        model.position.z = -center.z;

        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);
        modelRef.current = model;

        // Animation mixer
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        setStatus('ready');

        // Animation loop
        const animate = () => {
          if (!isMounted) return;
          rafRef.current = requestAnimationFrame(animate);

          const delta = clockRef.current?.getDelta() || 0.016;

          if (mixerRef.current) {
            mixerRef.current.update(delta);
          }

          controls.update();
          renderer.render(scene, camera);
        };

        animate();

        // Resize
        const resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0 && cameraRef.current && rendererRef.current) {
              cameraRef.current.aspect = width / height;
              cameraRef.current.updateProjectionMatrix();
              rendererRef.current.setSize(width, height);
            }
          }
        });
        resizeObserver.observe(mountRef.current);

        return () => {
          resizeObserver.disconnect();
        };
      } catch (err) {
        console.error('DripSyncPreviewViewport error:', err);
        setStatus('error');
      }
    };

    init();

    return () => {
      isMounted = false;
      cancelAnimationFrame(rafRef.current);
      rendererRef.current?.dispose();
    };
  }, [avatarUrl]);

  return (
    <div ref={mountRef} className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ background: 'transparent' }} />

      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-cyan-400" />
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Loading Avatar</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-4">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-cyan-400" />
            <p className="text-sm text-gray-400">Avatar Preview</p>
          </div>
        </div>
      )}
    </div>
  );
}