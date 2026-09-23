import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Scene3D({ onNavigate }) {
  const mountRef = useRef(null);

  const portals = [
    { position: [-3, 1, -2], label: 'SHOP', color: '#00D4FF', target: 'Shop' },
    { position: [3, 1, -2], label: 'STUDIO', color: '#FF3366', target: 'Studio' },
    { position: [-2.5, 2.5, -3], label: 'GENESIS', color: '#FFD700', target: 'GenesisMarketplace' },
    { position: [2.5, 2.5, -3], label: 'DRIPSYNC', color: '#A855F7', target: 'DripSync' },
  ];

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0A0F');
    scene.fog = new THREE.Fog('#0A0A0F', 5, 20);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 2, 8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const blueLight = new THREE.PointLight(0x00D4FF, 1);
    blueLight.position.set(0, 5, 0);
    scene.add(blueLight);
    const redLight = new THREE.PointLight(0xFF3366, 0.5);
    redLight.position.set(-5, 3, -5);
    scene.add(redLight);
    const yellowLight = new THREE.PointLight(0xFFD700, 0.5);
    yellowLight.position.set(5, 3, -5);
    scene.add(yellowLight);

    // Avatar
    const avatarGroup = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00D4FF, emissive: 0x00D4FF, emissiveIntensity: 0.3, metalness: 0.9, roughness: 0.1 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 1.2, 16, 32), bodyMat);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), bodyMat.clone());
    head.position.y = 0.9;
    avatarGroup.add(body, head);
    scene.add(avatarGroup);

    // Portal boxes
    const portalMeshes = portals.map((p) => {
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(p.color),
        emissive: new THREE.Color(p.color),
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.8,
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.05), mat);
      mesh.position.set(...p.position);
      mesh.userData.target = p.target;
      scene.add(mesh);
      return mesh;
    });

    // Grid
    const grid = new THREE.GridHelper(20, 40, 0x00D4FF, 0xFF3366);
    grid.position.y = -2;
    scene.add(grid);

    // Particles
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ size: 0.05, color: 0x00D4FF, transparent: true, opacity: 0.6 }));
    scene.add(particles);

    // Animation loop
    let animId;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      avatarGroup.rotation.y = t * 0.3;
      avatarGroup.position.y = Math.sin(t * 1.5) * 0.1;
      particles.rotation.y = t * 0.05;
      portalMeshes.forEach((m, i) => {
        m.rotation.y += 0.005;
        m.position.y = portals[i].position[1] + Math.sin(t + portals[i].position[0]) * 0.1;
      });
      grid.position.z = (t * 0.5) % 2;
      camera.rotation.y = Math.sin(t * 0.1) * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    // Click handling
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleClick = (e) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(portalMeshes);
      if (hits.length > 0 && onNavigate) {
        onNavigate(hits[0].object.userData.target);
      }
    };
    mount.addEventListener('click', handleClick);

    // Resize
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}