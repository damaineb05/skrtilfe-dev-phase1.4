/**
 * ViewportLighting — lighting presets and scene lighting setup.
 * No React. Accepts THREE + scene + lightsRef, mutates in place.
 */
import { Lightbulb, Sun, Moon, Zap, Sparkles } from 'lucide-react';

export const LIGHTING_PRESETS = {
  studio: {
    name: 'Studio', icon: Lightbulb,
    ambient:  { color: 0xffffff, intensity: 1.3 },
    key:      { color: 0xffffff, intensity: 1.2, position: [5, 10, 7] },
    fill:     { color: 0x00ffff, intensity: 0.4, position: [-5, 3, -5] },
    rim:      { color: 0xffffff, intensity: 0.8, position: [0, 3, -8] },
    accent1:  { color: 0x00ffff, intensity: 0.5, position: [3, 2, 3] },
    accent2:  { color: 0xff00ff, intensity: 0.5, position: [-3, 2, -3] },
    hemi:     { skyColor: 0xffffff, groundColor: 0x444444, intensity: 0.4 },
    fog:      { enabled: true, near: 10, far: 50 },
  },
  outdoor: {
    name: 'Outdoor', icon: Sun,
    ambient:  { color: 0xffffee, intensity: 1.3 },
    key:      { color: 0xffffdd, intensity: 1.5, position: [10, 15, 5] },
    fill:     { color: 0xaaccff, intensity: 0.3, position: [-8, 5, -3] },
    rim:      { color: 0xffffff, intensity: 0.5, position: [0, 5, -10] },
    accent1:  { color: 0xffeeaa, intensity: 0.3, position: [5, 3, 5] },
    accent2:  { color: 0xaaddff, intensity: 0.3, position: [-5, 3, -5] },
    hemi:     { skyColor: 0x87ceeb, groundColor: 0x8b7355, intensity: 0.6 },
    fog:      { enabled: false },
  },
  neon: {
    name: 'Neon', icon: Zap,
    ambient:  { color: 0x110033, intensity: 1.3 },
    key:      { color: 0xff00ff, intensity: 0.8, position: [5, 8, 7] },
    fill:     { color: 0x00ffff, intensity: 0.6, position: [-5, 3, -5] },
    rim:      { color: 0xff0088, intensity: 1.0, position: [0, 3, -8] },
    accent1:  { color: 0xff00ff, intensity: 0.8, position: [3, 2, 3] },
    accent2:  { color: 0x00ffff, intensity: 0.8, position: [-3, 2, -3] },
    hemi:     { skyColor: 0x2200ff, groundColor: 0x220044, intensity: 0.3 },
    fog:      { enabled: true, near: 5, far: 30 },
  },
  cinematic: {
    name: 'Cinematic', icon: Sparkles,
    ambient:  { color: 0xffffff, intensity: 1.3 },
    key:      { color: 0xffddaa, intensity: 1.8, position: [8, 12, 5] },
    fill:     { color: 0x6688ff, intensity: 0.2, position: [-6, 2, -6] },
    rim:      { color: 0xffffff, intensity: 1.2, position: [-2, 4, -10] },
    accent1:  { color: 0xff8844, intensity: 0.4, position: [4, 1, 4] },
    accent2:  { color: 0x4466ff, intensity: 0.4, position: [-4, 1, -4] },
    hemi:     { skyColor: 0xffffee, groundColor: 0x332211, intensity: 0.3 },
    fog:      { enabled: true, near: 15, far: 60 },
  },
  night: {
    name: 'Night', icon: Moon,
    ambient:  { color: 0x223355, intensity: 1.3 },
    key:      { color: 0xaaccff, intensity: 0.8, position: [5, 10, 7] },
    fill:     { color: 0x4455aa, intensity: 0.3, position: [-5, 3, -5] },
    rim:      { color: 0x8899ff, intensity: 0.6, position: [0, 3, -8] },
    accent1:  { color: 0x6688ff, intensity: 0.4, position: [3, 2, 3] },
    accent2:  { color: 0x4466aa, intensity: 0.4, position: [-3, 2, -3] },
    hemi:     { skyColor: 0x334466, groundColor: 0x111122, intensity: 0.5 },
    fog:      { enabled: true, near: 8, far: 40 },
  },
};

/**
 * Build all scene lights from a preset and store refs.
 * Returns the preset name that was applied.
 * @param {object} THREE
 * @param {THREE.Scene} scene
 * @param {React.MutableRefObject} lightsRef
 * @returns {string} appliedPresetName
 */
export function buildSceneLighting(THREE, scene, lightsRef) {
  scene.background = null;
  scene.fog = null;

  let savedPreset = 'studio';
  try {
    const saved = localStorage.getItem('dripsync-lighting-preset');
    if (saved && LIGHTING_PRESETS[saved]) savedPreset = saved;
  } catch (_) { /* ignore */ }

  const preset = LIGHTING_PRESETS[savedPreset];

  const ambientLight = new THREE.AmbientLight(preset.ambient.color, preset.ambient.intensity);
  scene.add(ambientLight);
  lightsRef.current.ambient = ambientLight;

  const keyLight = new THREE.DirectionalLight(preset.key.color, preset.key.intensity);
  keyLight.position.set(...preset.key.position);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 50;
  keyLight.shadow.camera.left = -10;
  keyLight.shadow.camera.right = 10;
  keyLight.shadow.camera.top = 10;
  keyLight.shadow.camera.bottom = -10;
  keyLight.shadow.bias = -0.0001;
  scene.add(keyLight);
  lightsRef.current.key = keyLight;

  const fillLight = new THREE.DirectionalLight(preset.fill.color, preset.fill.intensity);
  fillLight.position.set(...preset.fill.position);
  scene.add(fillLight);
  lightsRef.current.fill = fillLight;

  const rimLight = new THREE.DirectionalLight(preset.rim.color, preset.rim.intensity);
  rimLight.position.set(...preset.rim.position);
  scene.add(rimLight);
  lightsRef.current.rim = rimLight;

  const accentLight1 = new THREE.PointLight(preset.accent1.color, preset.accent1.intensity, 20);
  accentLight1.position.set(...preset.accent1.position);
  scene.add(accentLight1);

  const accentLight2 = new THREE.PointLight(preset.accent2.color, preset.accent2.intensity, 20);
  accentLight2.position.set(...preset.accent2.position);
  scene.add(accentLight2);
  lightsRef.current.accent = { light1: accentLight1, light2: accentLight2 };

  const hemiLight = new THREE.HemisphereLight(preset.hemi.skyColor, preset.hemi.groundColor, preset.hemi.intensity);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);
  lightsRef.current.ground = hemiLight;

  return savedPreset;
}

/**
 * Hot-swap lights to a new preset without recreating the scene.
 * @param {string} presetName
 * @param {object} THREE
 * @param {THREE.Scene} scene
 * @param {React.MutableRefObject} lightsRef
 */
export function applyLightingPreset(presetName, THREE, scene, lightsRef) {
  const preset = LIGHTING_PRESETS[presetName];
  if (!preset) return;

  const l = lightsRef.current;
  if (l.ambient) { l.ambient.color.setHex(preset.ambient.color); l.ambient.intensity = preset.ambient.intensity; }
  if (l.key)     { l.key.color.setHex(preset.key.color); l.key.intensity = preset.key.intensity; l.key.position.set(...preset.key.position); }
  if (l.fill)    { l.fill.color.setHex(preset.fill.color); l.fill.intensity = preset.fill.intensity; l.fill.position.set(...preset.fill.position); }
  if (l.rim)     { l.rim.color.setHex(preset.rim.color); l.rim.intensity = preset.rim.intensity; l.rim.position.set(...preset.rim.position); }
  if (l.accent)  {
    l.accent.light1.color.setHex(preset.accent1.color); l.accent.light1.intensity = preset.accent1.intensity; l.accent.light1.position.set(...preset.accent1.position);
    l.accent.light2.color.setHex(preset.accent2.color); l.accent.light2.intensity = preset.accent2.intensity; l.accent.light2.position.set(...preset.accent2.position);
  }
  if (l.ground)  { l.ground.color.setHex(preset.hemi.skyColor); l.ground.groundColor.setHex(preset.hemi.groundColor); l.ground.intensity = preset.hemi.intensity; }

  if (preset.fog.enabled) {
    const bgColor = scene.background || new THREE.Color(0x000000);
    if (scene.fog) { scene.fog.near = preset.fog.near; scene.fog.far = preset.fog.far; if (bgColor?.isColor) scene.fog.color.copy(bgColor); }
    else scene.fog = new THREE.Fog(bgColor, preset.fog.near, preset.fog.far);
  } else {
    scene.fog = null;
  }

  try { localStorage.setItem('dripsync-lighting-preset', presetName); } catch (_) { /* ignore */ }
}