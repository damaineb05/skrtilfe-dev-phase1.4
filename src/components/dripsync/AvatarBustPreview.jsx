/**
 * AvatarBustPreview
 * Mini Three.js viewport showing the top-half of the avatar
 * with a waving/celebration animation.
 */
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// RPM wave animation — plays on the avatar
const WAVE_ANIM_URL =
  'https://raw.githubusercontent.com/readyplayerme/animation-library/master/masculine/glb/expression/M_Standing_Expressions_001.glb';

export default function AvatarBustPreview({ avatarUrl, className = '' }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    const W = el.clientWidth  || 280;
    const H = el.clientHeight || 320;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080b14);

    // ── Camera — framed to show bust (top ~55% of avatar) ─────────────────
    const camera = new THREE.PerspectiveCamera(28, W / H, 0.01, 100);
    camera.position.set(0, 1.52, 1.65);
    camera.lookAt(0, 1.3, 0);

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Lighting ───────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0x00d4ff, 1.4);
    key.position.set(1.5, 3, 2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(-2, 1.5, 1);
    scene.add(fill);
    // Subtle cyan rim
    const rim = new THREE.PointLight(0x00d4ff, 0.6, 5);
    rim.position.set(0, 1.8, -1.2);
    scene.add(rim);

    // ── Animation mixer state ──────────────────────────────────────────────
    let mixer = null;
    let clock = new THREE.Clock();
    let avatarMesh = null;

    // ── Load avatar ────────────────────────────────────────────────────────
    const loader = new GLTFLoader();

    const loadWaveAndPlay = (mixer) => {
      loader.load(
        WAVE_ANIM_URL,
        (animGltf) => {
          const clip = animGltf.animations[0];
          if (!clip || !mixer) return;
          const action = mixer.clipAction(clip);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.play();
        },
        undefined,
        () => { /* silently ignore if animation fails */ }
      );
    };

    if (avatarUrl) {
      loader.load(
        avatarUrl,
        (gltf) => {
          avatarMesh = gltf.scene;

          // Compute bounding box to center avatar at feet
          const box = new THREE.Box3().setFromObject(avatarMesh);
          const center = box.getCenter(new THREE.Vector3());
          avatarMesh.position.x -= center.x;
          avatarMesh.position.z -= center.z;
          // Stand avatar on y=0
          avatarMesh.position.y -= box.min.y;

          scene.add(avatarMesh);

          // Play wave animation if present in the avatar GLB
          if (gltf.animations?.length > 0) {
            mixer = new THREE.AnimationMixer(avatarMesh);
            const clip = gltf.animations[0];
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.play();
          } else {
            // Load external wave animation
            mixer = new THREE.AnimationMixer(avatarMesh);
            loadWaveAndPlay(mixer);
          }
        },
        undefined,
        () => { /* silently ignore */ }
      );
    }

    // ── Subtle auto-rotate for polish ──────────────────────────────────────
    let angle = 0;

    // ── Render loop ────────────────────────────────────────────────────────
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      mixer?.update(delta);

      // Gentle left-right sway
      angle += delta * 0.25;
      if (avatarMesh) {
        avatarMesh.rotation.y = Math.sin(angle) * 0.15;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [avatarUrl]);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
    />
  );
}