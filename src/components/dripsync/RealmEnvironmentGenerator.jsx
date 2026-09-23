import * as THREE from 'three';

/**
 * Procedurally generates 3D environments for DripSync realms
 * Each generator creates a complete Three.js scene with geometry, materials, and lighting
 */

// Color utilities
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
};

// Create neon material
const createNeonMaterial = (color, intensity = 1) => {
  return new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: intensity,
    metalness: 0.2,
    roughness: 0.3
  });
};

// Create glass material
const createGlassMaterial = (color = 0x88ccff, opacity = 0.3) => {
  return new THREE.MeshPhysicalMaterial({
    color: color,
    transparent: true,
    opacity: opacity,
    metalness: 0,
    roughness: 0,
    transmission: 0.9,
    thickness: 0.5
  });
};

// ============================================
// ENVIRONMENT GENERATORS
// ============================================

export const generateStudioEnvironment = (scene) => {
  // White infinite floor
  const floorGeo = new THREE.PlaneGeometry(100, 100);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Cyclorama backdrop
  const backdropGeo = new THREE.CylinderGeometry(50, 50, 30, 64, 1, true, 0, Math.PI);
  const backdropMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, side: THREE.DoubleSide });
  const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
  backdrop.position.set(0, 15, -25);
  scene.add(backdrop);

  // Studio lights (visual representation)
  for (let i = 0; i < 3; i++) {
    const lightBoxGeo = new THREE.BoxGeometry(2, 0.3, 1.5);
    const lightBoxMat = createNeonMaterial(0xffffff, 2);
    const lightBox = new THREE.Mesh(lightBoxGeo, lightBoxMat);
    lightBox.position.set(-5 + i * 5, 8, -3);
    scene.add(lightBox);
  }
};

export const generateCyberpunkEnvironment = (scene) => {
  // Dark ground with neon grid
  const floorGeo = new THREE.PlaneGeometry(100, 100, 50, 50);
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x0a0a0f, 
    roughness: 0.8,
    metalness: 0.2
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Neon grid lines
  const gridMat = createNeonMaterial(0xff00ff, 1.5);
  for (let i = -20; i <= 20; i += 2) {
    const lineGeo = new THREE.BoxGeometry(0.05, 0.02, 40);
    const line = new THREE.Mesh(lineGeo, gridMat);
    line.position.set(i, 0.01, 0);
    scene.add(line);
    
    const line2 = new THREE.Mesh(lineGeo, gridMat);
    line2.rotation.y = Math.PI / 2;
    line2.position.set(0, 0.01, i);
    scene.add(line2);
  }

  // Buildings
  for (let i = 0; i < 20; i++) {
    const height = 5 + Math.random() * 20;
    const buildingGeo = new THREE.BoxGeometry(3 + Math.random() * 4, height, 3 + Math.random() * 4);
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.7 });
    const building = new THREE.Mesh(buildingGeo, buildingMat);
    
    const side = Math.random() > 0.5 ? 1 : -1;
    building.position.set(
      side * (8 + Math.random() * 15),
      height / 2,
      -20 + Math.random() * 40
    );
    building.castShadow = true;
    scene.add(building);

    // Neon signs on buildings
    if (Math.random() > 0.5) {
      const signColor = [0xff00ff, 0x00ffff, 0xff3366][Math.floor(Math.random() * 3)];
      const signGeo = new THREE.BoxGeometry(2, 0.5, 0.1);
      const signMat = createNeonMaterial(signColor, 2);
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(
        building.position.x - side * 1.5,
        height * 0.7,
        building.position.z + 2
      );
      scene.add(sign);
    }
  }

  // Rain particles
  const rainGeo = new THREE.BufferGeometry();
  const rainCount = 5000;
  const rainPositions = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount * 3; i += 3) {
    rainPositions[i] = (Math.random() - 0.5) * 50;
    rainPositions[i + 1] = Math.random() * 30;
    rainPositions[i + 2] = (Math.random() - 0.5) * 50;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
  const rainMat = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.05, transparent: true, opacity: 0.6 });
  const rain = new THREE.Points(rainGeo, rainMat);
  rain.name = 'rain';
  scene.add(rain);
};

export const generateTokyoEnvironment = (scene) => {
  // Street ground
  const streetGeo = new THREE.PlaneGeometry(10, 50);
  const streetMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 });
  const street = new THREE.Mesh(streetGeo, streetMat);
  street.rotation.x = -Math.PI / 2;
  scene.add(street);

  // Sidewalks
  [-6, 6].forEach(x => {
    const sidewalkGeo = new THREE.BoxGeometry(3, 0.15, 50);
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
    const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    sidewalk.position.set(x, 0.075, 0);
    scene.add(sidewalk);
  });

  // Japanese style buildings
  for (let z = -20; z <= 20; z += 6) {
    [-9, 9].forEach(x => {
      const height = 8 + Math.random() * 12;
      const buildingGeo = new THREE.BoxGeometry(5, height, 5);
      const buildingMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
      const building = new THREE.Mesh(buildingGeo, buildingMat);
      building.position.set(x, height / 2, z);
      scene.add(building);

      // Glowing windows
      for (let wy = 2; wy < height - 1; wy += 1.5) {
        if (Math.random() > 0.3) {
          const windowGeo = new THREE.BoxGeometry(0.8, 0.6, 0.1);
          const windowColor = Math.random() > 0.5 ? 0xffaa66 : 0xffffcc;
          const windowMat = createNeonMaterial(windowColor, 0.5);
          const window = new THREE.Mesh(windowGeo, windowMat);
          window.position.set(x - Math.sign(x) * 2.5, wy, z);
          scene.add(window);
        }
      }

      // Neon signs (Japanese style)
      if (Math.random() > 0.4) {
        const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0xff00ff];
        const signGeo = new THREE.BoxGeometry(0.1, 3, 1.5);
        const signMat = createNeonMaterial(colors[Math.floor(Math.random() * colors.length)], 1.5);
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(x - Math.sign(x) * 2.5, height * 0.5, z + 2.5);
        scene.add(sign);
      }
    });
  }

  // Lanterns
  for (let z = -18; z <= 18; z += 4) {
    const lanternGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const lanternMat = createNeonMaterial(0xff6600, 1);
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.set(-4, 3, z);
    scene.add(lantern);
  }
};

export const generateSciFiEnvironment = (scene) => {
  // Metallic floor with hex pattern
  const floorGeo = new THREE.PlaneGeometry(30, 50, 30, 50);
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x2a2a3a, 
    metalness: 0.8, 
    roughness: 0.3 
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Corridor walls
  [-6, 6].forEach(x => {
    const wallGeo = new THREE.BoxGeometry(0.5, 8, 50);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, metalness: 0.7, roughness: 0.4 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(x, 4, 0);
    scene.add(wall);

    // Wall panels with glow
    for (let z = -20; z <= 20; z += 5) {
      const panelGeo = new THREE.BoxGeometry(0.1, 2, 3);
      const panelMat = createNeonMaterial(0x00ffff, 0.5);
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(x - Math.sign(x) * 0.3, 4, z);
      scene.add(panel);
    }
  });

  // Ceiling
  const ceilingGeo = new THREE.PlaneGeometry(12, 50);
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, metalness: 0.6 });
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 8;
  scene.add(ceiling);

  // Ceiling lights
  for (let z = -20; z <= 20; z += 4) {
    const lightGeo = new THREE.BoxGeometry(8, 0.1, 0.5);
    const lightMat = createNeonMaterial(0x00ffff, 2);
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.set(0, 7.9, z);
    scene.add(light);
  }

  // Holographic displays
  for (let z = -15; z <= 15; z += 10) {
    const displayGeo = new THREE.PlaneGeometry(2, 3);
    const displayMat = createGlassMaterial(0x00ffff, 0.5);
    const display = new THREE.Mesh(displayGeo, displayMat);
    display.position.set(-5.5, 4, z);
    display.rotation.y = Math.PI / 2;
    scene.add(display);
  }
};

export const generateArcadeEnvironment = (scene) => {
  // Checkered floor
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Arcade cabinets
  const cabinetPositions = [
    [-8, -5], [-8, 0], [-8, 5],
    [8, -5], [8, 0], [8, 5],
    [-4, -8], [0, -8], [4, -8]
  ];

  cabinetPositions.forEach(([x, z], i) => {
    // Cabinet body
    const cabinetGeo = new THREE.BoxGeometry(1.5, 4, 2);
    const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
    const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
    cabinet.position.set(x, 2, z);
    scene.add(cabinet);

    // Screen (glowing)
    const colors = [0x00ff00, 0x00ffff, 0xff00ff, 0xffff00, 0xff6600];
    const screenGeo = new THREE.BoxGeometry(1.2, 1.5, 0.1);
    const screenMat = createNeonMaterial(colors[i % colors.length], 1);
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(x, 3, z + 1);
    scene.add(screen);
  });

  // Neon ceiling strips
  for (let x = -12; x <= 12; x += 4) {
    const stripGeo = new THREE.BoxGeometry(0.2, 0.1, 30);
    const stripMat = createNeonMaterial([0xff00ff, 0x00ffff][Math.abs(x / 4) % 2], 1.5);
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.position.set(x, 6, 0);
    scene.add(strip);
  }
};

export const generateBasketballEnvironment = (scene) => {
  // Court floor with lines
  const courtGeo = new THREE.PlaneGeometry(28, 15);
  const courtMat = new THREE.MeshStandardMaterial({ color: 0xc4956a, roughness: 0.8 });
  const court = new THREE.Mesh(courtGeo, courtMat);
  court.rotation.x = -Math.PI / 2;
  court.position.y = 0.01;
  scene.add(court);

  // Court lines
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  
  // Center circle
  const circleGeo = new THREE.RingGeometry(1.8, 1.9, 32);
  const circle = new THREE.Mesh(circleGeo, lineMat);
  circle.rotation.x = -Math.PI / 2;
  circle.position.y = 0.02;
  scene.add(circle);

  // Half court line
  const halfLineGeo = new THREE.BoxGeometry(0.1, 0.01, 15);
  const halfLine = new THREE.Mesh(halfLineGeo, lineMat);
  halfLine.position.y = 0.02;
  scene.add(halfLine);

  // Three point lines (simplified arcs)
  [-12, 12].forEach(x => {
    const arcGeo = new THREE.RingGeometry(5.8, 5.9, 32, 1, 0, Math.PI);
    const arc = new THREE.Mesh(arcGeo, lineMat);
    arc.rotation.x = -Math.PI / 2;
    arc.rotation.z = x > 0 ? Math.PI / 2 : -Math.PI / 2;
    arc.position.set(x, 0.02, 0);
    scene.add(arc);
  });

  // Basketball hoops
  [-13, 13].forEach(x => {
    // Backboard
    const backboardGeo = new THREE.BoxGeometry(0.1, 1.1, 1.8);
    const backboardMat = createGlassMaterial(0xffffff, 0.3);
    const backboard = new THREE.Mesh(backboardGeo, backboardMat);
    backboard.position.set(x, 3.05, 0);
    scene.add(backboard);

    // Rim
    const rimGeo = new THREE.TorusGeometry(0.23, 0.02, 8, 16);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xff4400, metalness: 0.8 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x - Math.sign(x) * 0.4, 3.05, 0);
    scene.add(rim);

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.5);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(x + Math.sign(x) * 0.5, 1.75, 0);
    scene.add(pole);
  });

  // Chain link fence
  for (let z = -8; z <= 8; z += 0.5) {
    const fenceGeo = new THREE.BoxGeometry(0.02, 3, 0.02);
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9 });
    const fence = new THREE.Mesh(fenceGeo, fenceMat);
    fence.position.set(15, 1.5, z);
    scene.add(fence);
  }

  // Bleachers
  for (let row = 0; row < 3; row++) {
    const bleacherGeo = new THREE.BoxGeometry(20, 0.3, 1);
    const bleacherMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const bleacher = new THREE.Mesh(bleacherGeo, bleacherMat);
    bleacher.position.set(0, 0.5 + row * 0.6, -9 - row);
    scene.add(bleacher);
  }
};

export const generateNightclubEnvironment = (scene) => {
  // Dark reflective floor
  const floorGeo = new THREE.PlaneGeometry(40, 40);
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x0a0a0a, 
    metalness: 0.9, 
    roughness: 0.1 
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // DJ Booth
  const boothGeo = new THREE.BoxGeometry(6, 1.2, 3);
  const boothMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const booth = new THREE.Mesh(boothGeo, boothMat);
  booth.position.set(0, 0.6, -15);
  scene.add(booth);

  // DJ equipment (turntables)
  [-1.5, 1.5].forEach(x => {
    const deckGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(x, 1.25, -15);
    scene.add(deck);
  });

  // Speaker stacks
  [-18, 18].forEach(x => {
    for (let y = 0; y < 3; y++) {
      const speakerGeo = new THREE.BoxGeometry(3, 2, 2);
      const speakerMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      const speaker = new THREE.Mesh(speakerGeo, speakerMat);
      speaker.position.set(x, 1 + y * 2, -14);
      scene.add(speaker);

      // Speaker cone
      const coneGeo = new THREE.CircleGeometry(0.6, 32);
      const coneMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(x, 1 + y * 2, -12.9);
      scene.add(cone);
    }
  });

  // Dance floor tiles (alternating colors)
  const colors = [0xff00ff, 0x00ffff, 0xffff00, 0x00ff00];
  for (let x = -6; x <= 6; x += 2) {
    for (let z = -6; z <= 6; z += 2) {
      const tileGeo = new THREE.BoxGeometry(1.9, 0.1, 1.9);
      const tileMat = createNeonMaterial(colors[Math.abs(x + z) % colors.length], 0.5);
      const tile = new THREE.Mesh(tileGeo, tileMat);
      tile.position.set(x, 0.05, z);
      scene.add(tile);
    }
  }

  // Laser beams
  for (let i = 0; i < 8; i++) {
    const laserGeo = new THREE.CylinderGeometry(0.02, 0.02, 15, 8);
    const laserMat = createNeonMaterial([0xff00ff, 0x00ffff][i % 2], 3);
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.rotation.x = Math.PI / 4 + (i * 0.1);
    laser.rotation.z = (i / 8) * Math.PI * 2;
    laser.position.set(0, 8, -10);
    scene.add(laser);
  }

  // Disco ball
  const ballGeo = new THREE.SphereGeometry(1, 16, 16);
  const ballMat = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc, 
    metalness: 1, 
    roughness: 0.1,
    envMapIntensity: 2
  });
  const ball = new THREE.Mesh(ballGeo, ballMat);
  ball.position.set(0, 10, 0);
  ball.name = 'discoBall';
  scene.add(ball);
};

export const generateBeachEnvironment = (scene) => {
  // Sand
  const sandGeo = new THREE.PlaneGeometry(100, 50);
  const sandMat = new THREE.MeshStandardMaterial({ color: 0xe8d4a8, roughness: 0.9 });
  const sand = new THREE.Mesh(sandGeo, sandMat);
  sand.rotation.x = -Math.PI / 2;
  scene.add(sand);

  // Water
  const waterGeo = new THREE.PlaneGeometry(100, 50);
  const waterMat = new THREE.MeshStandardMaterial({ 
    color: 0x0088aa, 
    transparent: true, 
    opacity: 0.8,
    roughness: 0.1
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -0.1, 35);
  scene.add(water);

  // Palm trees
  const palmPositions = [[-8, -5], [10, -3], [-15, -8], [18, -6]];
  palmPositions.forEach(([x, z]) => {
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 6, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b6914 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 3, z);
    scene.add(trunk);

    // Leaves
    for (let i = 0; i < 6; i++) {
      const leafGeo = new THREE.ConeGeometry(0.3, 3, 4);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.rotation.z = Math.PI / 3;
      leaf.rotation.y = (i / 6) * Math.PI * 2;
      leaf.position.set(x + Math.cos(i) * 0.5, 6, z + Math.sin(i) * 0.5);
      scene.add(leaf);
    }
  });

  // Beach umbrella
  const umbrellaGeo = new THREE.ConeGeometry(2, 0.5, 8, 1, true);
  const umbrellaMat = new THREE.MeshStandardMaterial({ 
    color: 0xff4444, 
    side: THREE.DoubleSide 
  });
  const umbrella = new THREE.Mesh(umbrellaGeo, umbrellaMat);
  umbrella.position.set(0, 2.5, 0);
  scene.add(umbrella);

  // Umbrella pole
  const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.5);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(0, 1.25, 0);
  scene.add(pole);

  // Beach chair
  const chairGeo = new THREE.BoxGeometry(1, 0.1, 2);
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x0066cc });
  const chair = new THREE.Mesh(chairGeo, chairMat);
  chair.rotation.x = -0.3;
  chair.position.set(2, 0.4, 0);
  scene.add(chair);
};

export const generateForestEnvironment = (scene) => {
  // Grass ground
  const groundGeo = new THREE.PlaneGeometry(100, 100);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.9 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Trees
  for (let i = 0; i < 40; i++) {
    const x = (Math.random() - 0.5) * 60;
    const z = (Math.random() - 0.5) * 60;
    
    if (Math.abs(x) < 5 && Math.abs(z) < 5) continue; // Clear center area

    const trunkHeight = 4 + Math.random() * 4;
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, trunkHeight, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, trunkHeight / 2, z);
    scene.add(trunk);

    // Foliage (multiple layers)
    for (let j = 0; j < 3; j++) {
      const foliageGeo = new THREE.ConeGeometry(2 - j * 0.5, 3 - j * 0.5, 8);
      const foliageMat = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color().setHSL(0.3, 0.6, 0.3 + Math.random() * 0.1) 
      });
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.set(x, trunkHeight + j * 1.5, z);
      scene.add(foliage);
    }
  }

  // Glowing particles (fireflies)
  const fireflyGeo = new THREE.BufferGeometry();
  const fireflyCount = 200;
  const fireflyPositions = new Float32Array(fireflyCount * 3);
  for (let i = 0; i < fireflyCount * 3; i += 3) {
    fireflyPositions[i] = (Math.random() - 0.5) * 40;
    fireflyPositions[i + 1] = 0.5 + Math.random() * 5;
    fireflyPositions[i + 2] = (Math.random() - 0.5) * 40;
  }
  fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
  const fireflyMat = new THREE.PointsMaterial({ 
    color: 0xffff00, 
    size: 0.15, 
    transparent: true, 
    opacity: 0.8 
  });
  const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
  fireflies.name = 'fireflies';
  scene.add(fireflies);

  // Mushrooms (glowing)
  for (let i = 0; i < 15; i++) {
    const x = (Math.random() - 0.5) * 30;
    const z = (Math.random() - 0.5) * 30;
    
    const stemGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.3, 8);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.set(x, 0.15, z);
    scene.add(stem);

    const capGeo = new THREE.SphereGeometry(0.15, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const capMat = createNeonMaterial(0x00ff88, 0.5);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(x, 0.3, z);
    scene.add(cap);
  }
};

export const generateCrystalCaveEnvironment = (scene) => {
  // Cave floor
  const floorGeo = new THREE.PlaneGeometry(50, 50);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.9 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Crystal clusters
  const crystalColors = [0x00ffff, 0xff00ff, 0x00ff88, 0xffaa00, 0x8844ff];
  
  for (let i = 0; i < 30; i++) {
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    const color = crystalColors[Math.floor(Math.random() * crystalColors.length)];

    // Create crystal cluster
    const clusterCount = 3 + Math.floor(Math.random() * 4);
    for (let j = 0; j < clusterCount; j++) {
      const height = 1 + Math.random() * 3;
      const crystalGeo = new THREE.ConeGeometry(0.2 + Math.random() * 0.3, height, 6);
      const crystalMat = createNeonMaterial(color, 0.8);
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(
        x + (Math.random() - 0.5) * 2,
        height / 2,
        z + (Math.random() - 0.5) * 2
      );
      crystal.rotation.x = (Math.random() - 0.5) * 0.3;
      crystal.rotation.z = (Math.random() - 0.5) * 0.3;
      scene.add(crystal);
    }
  }

  // Ceiling stalactites
  for (let i = 0; i < 20; i++) {
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    const height = 1 + Math.random() * 2;
    
    const stalactiteGeo = new THREE.ConeGeometry(0.3, height, 6);
    const stalactiteMat = new THREE.MeshStandardMaterial({ color: 0x4a4a5a });
    const stalactite = new THREE.Mesh(stalactiteGeo, stalactiteMat);
    stalactite.rotation.x = Math.PI;
    stalactite.position.set(x, 12 - height / 2, z);
    scene.add(stalactite);
  }

  // Ambient glow particles
  const glowGeo = new THREE.BufferGeometry();
  const glowCount = 500;
  const glowPositions = new Float32Array(glowCount * 3);
  for (let i = 0; i < glowCount * 3; i += 3) {
    glowPositions[i] = (Math.random() - 0.5) * 40;
    glowPositions[i + 1] = Math.random() * 10;
    glowPositions[i + 2] = (Math.random() - 0.5) * 40;
  }
  glowGeo.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));
  const glowMat = new THREE.PointsMaterial({ 
    color: 0x44ffff, 
    size: 0.08, 
    transparent: true, 
    opacity: 0.6 
  });
  const glow = new THREE.Points(glowGeo, glowMat);
  scene.add(glow);
};

export const generateSpaceStationEnvironment = (scene) => {
  // Station floor
  const floorGeo = new THREE.PlaneGeometry(30, 30, 15, 15);
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x3a3a4a, 
    metalness: 0.8, 
    roughness: 0.3 
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Observation windows (curved)
  const windowGeo = new THREE.PlaneGeometry(20, 8);
  const windowMat = createGlassMaterial(0x000033, 0.3);
  const window = new THREE.Mesh(windowGeo, windowMat);
  window.position.set(0, 4, -12);
  scene.add(window);

  // Earth visible through window (background sphere)
  const earthGeo = new THREE.SphereGeometry(15, 32, 32);
  const earthMat = new THREE.MeshStandardMaterial({ 
    color: 0x4488ff,
    emissive: 0x112244,
    emissiveIntensity: 0.5
  });
  const earth = new THREE.Mesh(earthGeo, earthMat);
  earth.position.set(0, 0, -50);
  scene.add(earth);

  // Control panels
  for (let x = -8; x <= 8; x += 4) {
    const panelGeo = new THREE.BoxGeometry(3, 1.5, 0.3);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, metalness: 0.7 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(x, 1, -10);
    panel.rotation.x = -0.3;
    scene.add(panel);

    // Screen
    const screenGeo = new THREE.PlaneGeometry(2.5, 1.2);
    const screenMat = createNeonMaterial(0x00ff88, 0.5);
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(x, 1.1, -9.8);
    screen.rotation.x = -0.3;
    scene.add(screen);
  }

  // Ceiling with lights
  const ceilingGeo = new THREE.PlaneGeometry(30, 30);
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, metalness: 0.6 });
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 8;
  scene.add(ceiling);

  // Ring lights
  const ringGeo = new THREE.TorusGeometry(3, 0.1, 8, 32);
  const ringMat = createNeonMaterial(0xffffff, 1);
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 7.9, 0);
  scene.add(ring);
};

// Export the generator function
export const generateRealmEnvironment = (scene, realmType) => {
  const generators = {
    'studio': generateStudioEnvironment,
    'cyberpunk': generateCyberpunkEnvironment,
    'tokyo': generateTokyoEnvironment,
    'scifi': generateSciFiEnvironment,
    'arcade': generateArcadeEnvironment,
    'basketball': generateBasketballEnvironment,
    'nightclub': generateNightclubEnvironment,
    'beach': generateBeachEnvironment,
    'forest': generateForestEnvironment,
    'crystal': generateCrystalCaveEnvironment,
    'spacestation': generateSpaceStationEnvironment,
    'rooftop': generateCyberpunkEnvironment, // Reuse cyberpunk with different lighting
    'underwater': generateCrystalCaveEnvironment, // Reuse crystal with blue tint
    'desert': generateBeachEnvironment, // Similar to beach
    'skatepark': generateBasketballEnvironment, // Similar outdoor court
    'concert': generateNightclubEnvironment, // Similar to nightclub
    'tavern': generateArcadeEnvironment, // Reuse arcade structure
    'gallery': generateStudioEnvironment, // Clean space
    'vaporwave': generateArcadeEnvironment, // Retro style
    'mall': generateSciFiEnvironment, // Reuse corridor
    'zen': generateForestEnvironment, // Nature based
    'clouds': generateSpaceStationEnvironment, // High altitude
    'subway': generateSciFiEnvironment, // Underground corridor
    'haunted': generateForestEnvironment, // Dark forest variant
    'racing': generateBasketballEnvironment, // Open area
  };

  const generator = generators[realmType];
  if (generator) {
    generator(scene);
    return true;
  }
  return false;
};

export default generateRealmEnvironment;