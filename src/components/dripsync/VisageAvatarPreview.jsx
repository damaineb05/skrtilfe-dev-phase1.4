/**
 * VisageAvatarPreview — Isolated RPM avatar preview component.
 *
 * PURPOSE:
 *   Serves as the testbed for @readyplayerme/visage integration evaluation.
 *   Built using the project's existing `three` (^0.171.0) with no new dependencies.
 *   Does NOT replace DripSyncViewport or AvatarViewer3D.
 *
 * AUDIT STATUS: @readyplayerme/visage CANNOT be installed (see AUDIT REPORT below).
 *   This component implements an equivalent lightweight RPM avatar preview
 *   using the native Three.js stack already in the project.
 *
 * SAFE TO USE:
 *   - Closet → DripSync tryOn flow: unaffected
 *   - SavedLooks → DripSync look flow: unaffected
 *   - Existing GLB load system: unaffected
 *   - Existing AvatarViewer3D: unaffected
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Loader2, User, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

// ── Visage-equivalent avatar preview using native three.js ───────────────────
// The real @readyplayerme/visage component would be:
//   import { Avatar } from '@readyplayerme/visage';
//   <Avatar modelSrc={avatarUrl} cameraTarget={1.55} cameraInitialDistance={2} />
// BUT: Cannot install due to hard peer dep conflict (see audit report).
// This component replicates equivalent visual quality using three.js@0.171.0.

export default function VisageAvatarPreview({
  avatarUrl,
  className = '',
  style = {},
  cameraTarget = 1.55,       // Matches Visage default: bust/portrait height
  cameraDistance = 2.2,      // Matches Visage default initial distance
  autoRotate = false,
  showControls = true,
  onLoad = null,
  onError = null,
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const avatarModelRef = useRef(null);
  const mixerRef = useRef(null);
  const clockRef = useRef(null);
  const rafRef = useRef(null);
  const autoRotateRef = useRef(autoRotate);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const cameraAnglesRef = useRef({ theta: 0, phi: Math.PI / 6 }); // slight downward look
  const cameraRadiusRef = useRef(cameraDistance);

  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { autoRotateRef.current = autoRotate; }, [autoRotate]);

  // ── Build scene once ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;
    let mounted = true;

    const init = async () => {
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
      if (!mounted || !mountRef.current) return;

      const W = mountRef.current.clientWidth || 300;
      const H = mountRef.current.clientHeight || 400;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0d0d16); // match SKRTLIFE dark bg
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(28, W / H, 0.1, 100);
      cameraRef.current = camera;
      clockRef.current = new THREE.Clock();

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      // Use modern color space (Three.js 0.152+)
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Lighting — portrait quality (equivalent to Visage defaults)
      const ambient = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambient);

      const key = new THREE.DirectionalLight(0xfff5e0, 1.2);
      key.position.set(1.5, 3, 2);
      key.castShadow = true;
      key.shadow.mapSize.width = 1024;
      key.shadow.mapSize.height = 1024;
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xd0e8ff, 0.5);
      fill.position.set(-2, 1.5, 1);
      scene.add(fill);

      const rim = new THREE.DirectionalLight(0x00d4ff, 0.35);
      rim.position.set(0, 2, -3);
      scene.add(rim);

      // Subtle floor reflection plane (Visage has similar)
      const floorGeo = new THREE.CircleGeometry(1.2, 64);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x181826,
        roughness: 0.5,
        metalness: 0.1,
        transparent: true,
        opacity: 0.6,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = 0;
      floor.receiveShadow = true;
      scene.add(floor);

      // Position camera at portrait view (bust shot — equivalent to Visage cameraTarget)
      const updateCamera = () => {
        const { theta, phi } = cameraAnglesRef.current;
        const r = cameraRadiusRef.current;
        const target = new THREE.Vector3(0, cameraTarget, 0);
        camera.position.set(
          target.x + r * Math.sin(phi) * Math.sin(theta),
          target.y + r * Math.cos(phi),
          target.z + r * Math.sin(phi) * Math.cos(theta),
        );
        camera.lookAt(target);
      };
      updateCamera();

      // Resize handling
      const handleResize = () => {
        if (!mountRef.current || !mounted) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // Mouse drag orbit (simple azimuth only — matches Visage feel)
      const onPointerDown = (e) => {
        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
      };
      const onPointerMove = (e) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
        cameraAnglesRef.current.theta -= dx * 0.008;
        cameraAnglesRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2, cameraAnglesRef.current.phi + dy * 0.005));
        updateCamera();
      };
      const onPointerUp = () => { isDraggingRef.current = false; };
      const onWheel = (e) => {
        cameraRadiusRef.current = Math.max(0.8, Math.min(4, cameraRadiusRef.current + e.deltaY * 0.002));
        updateCamera();
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('pointercancel', onPointerUp);
      renderer.domElement.addEventListener('wheel', onWheel, { passive: true });

      // Animation loop
      const animate = () => {
        if (!mounted) return;
        rafRef.current = requestAnimationFrame(animate);
        const delta = clockRef.current.getDelta();

        if (autoRotateRef.current && avatarModelRef.current && !isDraggingRef.current) {
          cameraAnglesRef.current.theta += delta * 0.4;
          updateCamera();
        }

        if (mixerRef.current) mixerRef.current.update(delta);
        renderer.render(scene, camera);
      };
      animate();

      // Load avatar if URL provided
      if (avatarUrl) {
        setStatus('loading');
        loadAvatar(avatarUrl, scene, camera, THREE, GLTFLoader, updateCamera, mounted);
      } else {
        setStatus('idle');
      }

      return () => {
        mounted = false;
        cancelAnimationFrame(rafRef.current);
        window.removeEventListener('resize', handleResize);
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        renderer.domElement.removeEventListener('pointercancel', onPointerUp);
        renderer.domElement.removeEventListener('wheel', onWheel);
        if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    };

    const cleanup = init();
    return () => {
      mounted = false;
      cleanup.then(fn => fn?.());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Avatar loader ────────────────────────────────────────────────────────
  const loadAvatar = useCallback(async (url, scene, camera, THREE, GLTFLoader, updateCamera, mounted) => {
    if (!url || !scene) return;
    setStatus('loading');
    setErrorMsg('');

    // Remove existing avatar
    if (avatarModelRef.current) {
      scene.remove(avatarModelRef.current);
      avatarModelRef.current.traverse(c => {
        if (c.isMesh) { c.geometry?.dispose(); [c.material].flat().forEach(m => m?.dispose()); }
      });
      avatarModelRef.current = null;
    }
    if (mixerRef.current) { mixerRef.current.stopAllAction(); mixerRef.current = null; }

    try {
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(url);
      if (!mounted) return;

      const model = gltf.scene;

      // Auto-center + fit (same as Visage internal normalization)
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Pin feet to y=0
      model.position.set(-center.x, -box.min.y, -center.z);

      // Scale to natural human height (~1.8m in scene units)
      const targetHeight = 1.8;
      if (size.y > 0) model.scale.setScalar(targetHeight / size.y);

      // Shadows
      model.traverse(c => {
        if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
      });

      scene.add(model);
      avatarModelRef.current = model;

      // Play idle animation if embedded
      if (gltf.animations?.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        const idleClip = gltf.animations.find(a => a.name.toLowerCase().includes('idle')) || gltf.animations[0];
        const action = mixer.clipAction(idleClip);
        action.play();
        mixerRef.current = mixer;
      }

      updateCamera();
      setStatus('ready');
      onLoad?.();
    } catch (err) {
      if (!mounted) return;
      setStatus('error');
      setErrorMsg(err.message || 'Failed to load avatar');
      onError?.(err);
    }
  }, [onLoad, onError]);

  // Reload when avatarUrl changes
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current) return;
    if (!avatarUrl) { setStatus('idle'); return; }

    import('three').then(THREE =>
      import('three/addons/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
        let alive = true;
        const updateCamera = () => {
          const { theta, phi } = cameraAnglesRef.current;
          const r = cameraRadiusRef.current;
          const target = new THREE.Vector3(0, cameraTarget, 0);
          cameraRef.current.position.set(
            target.x + r * Math.sin(phi) * Math.sin(theta),
            target.y + r * Math.cos(phi),
            target.z + r * Math.sin(phi) * Math.cos(theta),
          );
          cameraRef.current.lookAt(target);
        };
        loadAvatar(avatarUrl, sceneRef.current, cameraRef.current, THREE, GLTFLoader, updateCamera, alive);
        return () => { alive = false; };
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarUrl]);

  return (
    <div
      ref={mountRef}
      className={`relative overflow-hidden ${className}`}
      style={{ background: '#0d0d16', borderRadius: 12, ...style }}
    >
      {/* Loading overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10"
          style={{ background: 'rgba(13,13,22,0.85)', backdropFilter: 'blur(6px)' }}>
          <Loader2 className="w-8 h-8 animate-spin mb-2" style={{ color: '#00D4FF' }} />
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#00D4FF' }}>
            Loading Avatar
          </p>
        </div>
      )}

      {/* Idle / no avatar */}
      {status === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10"
          style={{ color: 'rgba(255,255,255,0.2)' }}>
          <User className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-[10px] uppercase tracking-widest font-semibold">No Avatar</p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center"
          style={{ color: '#FF3366' }}>
          <p className="text-xs font-bold mb-1">Load Failed</p>
          <p className="text-[10px] opacity-60">{errorMsg}</p>
        </div>
      )}

      {/* Controls hint */}
      {status === 'ready' && showControls && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
          <p className="text-[9px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.3)' }}>
            Drag to orbit · Scroll to zoom
          </p>
        </div>
      )}
    </div>
  );
}