/**
 * create3DEnvironment
 * Procedurally generates Three.js scene geometry for DripSync environments.
 * Extracted from DripSyncViewport for maintainability.
 */

export function create3DEnvironment(THREE, scene, envConfig, refs) {
  const { environment3DRef, particleSystemRef, lightsRef } = refs;

  // Clear previous 3D environment
  if (environment3DRef.current) {
    scene.remove(environment3DRef.current);
    environment3DRef.current = null;
  }
  if (particleSystemRef.current) {
    scene.remove(particleSystemRef.current);
    particleSystemRef.current = null;
  }

  if (!envConfig || !envConfig.config) return;

  const config = envConfig.config;
  const envGroup = new THREE.Group();
  envGroup.name = 'environment3D';

  if (config.skyColor) scene.background = new THREE.Color(config.skyColor);
  if (config.fogDensity && config.fogDensity > 0 && config.fogColor) {
    scene.fog = new THREE.FogExp2(config.fogColor, config.fogDensity);
  }

  if (lightsRef.current.ambient && config.ambientIntensity !== undefined) {
    lightsRef.current.ambient.intensity = config.ambientIntensity;
  }
  if (lightsRef.current.key) {
    if (config.directionalColor !== undefined) lightsRef.current.key.color.setHex(config.directionalColor);
    if (config.directionalIntensity !== undefined) lightsRef.current.key.intensity = config.directionalIntensity;
  }

  // Ground + grid
  const gridSize = 100;
  const gridHelper = new THREE.GridHelper(gridSize, 50, config.gridColor, config.gridSecondaryColor);
  gridHelper.position.y = 0.01;
  gridHelper.material.opacity = 0.4;
  gridHelper.material.transparent = true;
  envGroup.add(gridHelper);

  const groundGeo = new THREE.PlaneGeometry(gridSize, gridSize);
  const groundMat = new THREE.MeshStandardMaterial({ color: config.groundColor, metalness: 0.8, roughness: 0.2, transparent: true, opacity: 0.9 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  envGroup.add(ground);

  if (config.neonRings) {
    for (let i = 1; i <= 5; i++) {
      const ringMat = new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? config.gridColor : config.gridSecondaryColor, emissive: i % 2 === 0 ? config.gridColor : config.gridSecondaryColor, emissiveIntensity: 2, metalness: 1, roughness: 0 });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(i * 3, 0.03, 8, 64), ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.02;
      envGroup.add(ring);
    }
  }

  if (config.floatingObjects) {
    for (let i = 0; i < 20; i++) {
      const t = Math.random();
      const geo = t < 0.33 ? new THREE.BoxGeometry(0.3, 0.3, 0.3) : t < 0.66 ? new THREE.OctahedronGeometry(0.2) : new THREE.TetrahedronGeometry(0.25);
      const mat = new THREE.MeshStandardMaterial({ color: Math.random() > 0.5 ? config.gridColor : config.gridSecondaryColor, emissive: Math.random() > 0.5 ? config.gridColor : config.gridSecondaryColor, emissiveIntensity: 1.5, metalness: 0.9, roughness: 0.1, wireframe: Math.random() > 0.7 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 30, 2 + Math.random() * 8, (Math.random() - 0.5) * 30);
      mesh.userData.floatSpeed = 0.5 + Math.random() * 1;
      mesh.userData.floatOffset = Math.random() * Math.PI * 2;
      mesh.userData.rotateSpeed = 0.2 + Math.random() * 0.5;
      envGroup.add(mesh);
    }
  }

  if (config.studioLights) {
    [[5,8,5],[-5,8,5],[5,8,-5],[-5,8,-5]].forEach((pos, i) => {
      const spot = new THREE.SpotLight(i%2===0?config.gridColor:config.gridSecondaryColor, 2, 20, Math.PI/6, 0.5, 2);
      spot.position.set(...pos);
      spot.target.position.set(0,0,0);
      envGroup.add(spot); envGroup.add(spot.target);
    });
  }

  if (config.cityBuildings) {
    for (let i = 0; i < 30; i++) {
      const w=2+Math.random()*4, d=2+Math.random()*4, h=5+Math.random()*20;
      const building = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({color:0x0a0a15,metalness:0.9,roughness:0.3}));
      const angle = (i/30)*Math.PI*2, radius = 20+Math.random()*30;
      building.position.set(Math.cos(angle)*radius, h/2, Math.sin(angle)*radius);
      envGroup.add(building);
    }
  }

  if (config.skatePark) {
    const concreteMat = new THREE.MeshStandardMaterial({color:0x808080,roughness:0.9,metalness:0.1});
    const metalMat = new THREE.MeshStandardMaterial({color:0xcccccc,roughness:0.3,metalness:0.8});
    // Half pipe
    const hps = new THREE.Shape();
    hps.moveTo(-4,0); hps.lineTo(-4,3); hps.quadraticCurveTo(-4,0,0,0); hps.quadraticCurveTo(4,0,4,3); hps.lineTo(4,0);
    const hp = new THREE.Mesh(new THREE.ExtrudeGeometry(hps,{depth:8,bevelEnabled:false}), concreteMat);
    hp.rotation.x=-Math.PI/2; hp.position.set(-10,0,-5); hp.castShadow=true; hp.receiveShadow=true;
    envGroup.add(hp);
    // Box
    const box = new THREE.Mesh(new THREE.BoxGeometry(6,0.5,2), concreteMat);
    box.position.set(0,0.25,5); box.castShadow=true; box.receiveShadow=true;
    envGroup.add(box);
    // Flat bar
    const fb = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,5,8), metalMat);
    fb.rotation.z=Math.PI/2; fb.position.set(-8,0.4,8);
    envGroup.add(fb);
  }

  // Particles
  const particleCount = config.particles === 'rain' ? 2000 : 500;
  const pGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    positions[i*3]=(Math.random()-0.5)*50; positions[i*3+1]=Math.random()*30; positions[i*3+2]=(Math.random()-0.5)*50;
    velocities[i]=0.5+Math.random()*1;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.userData.velocities = velocities;
  const pMat = new THREE.PointsMaterial({color:config.particleColor, size:config.particles==='rain'?0.05:0.1, transparent:true, opacity:0.6, blending:THREE.AdditiveBlending});
  const particles = new THREE.Points(pGeo, pMat);
  particles.userData.isRain = config.particles === 'rain';
  particleSystemRef.current = particles;
  scene.add(particles);

  scene.add(envGroup);
  environment3DRef.current = envGroup;
}