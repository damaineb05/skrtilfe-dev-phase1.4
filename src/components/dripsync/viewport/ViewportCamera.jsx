/**
 * ViewportCamera — camera creation, OrbitControls setup, reset helpers.
 * Pure functions. No React. No side-effects on import.
 */

/**
 * Create a perspective camera and store in cameraRef.
 * @param {object} THREE
 * @param {number} width
 * @param {number} height
 * @param {React.MutableRefObject} cameraRef
 * @returns {THREE.PerspectiveCamera}
 */
export function createCamera(THREE, width, height, cameraRef) {
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(4, 3.5, 6);
  cameraRef.current = camera;
  return camera;
}

/**
 * Create OrbitControls and store in controlsRef.
 * @param {Function} OrbitControls  — THREE OrbitControls class
 * @param {THREE.Camera} camera
 * @param {HTMLElement} domElement
 * @param {React.MutableRefObject} controlsRef
 * @returns {OrbitControls|null}
 */
export function createOrbitControls(OrbitControls, camera, domElement, controlsRef) {
  if (!OrbitControls) return null;
  const controls = new OrbitControls(camera, domElement);
  controls.target.set(0, 1.5, 0);
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.minDistance = 2.0;    // Closer min (was 1.5)
  controls.maxDistance = 10;     // Tighter max (was 12)
  controls.zoomSpeed = 1.5;      // Smooth zoom
  controls.minPolarAngle = Math.PI * 0.15;  // 27° — better shoulder view
  controls.maxPolarAngle = Math.PI * 0.8;   // 144° — prevents underground
  controls.enableDamping = true;
  controls.dampingFactor = 0.08; // Smoother damping (was 0.05)
  controls.rotateSpeed = 1.0;    // Consistent rotation
  controls.enabled = true;
  controls.autoRotate = false;   // Never auto-rotate
  controls.update();
  controlsRef.current = controls;
  return controls;
}

/**
 * Install a ResizeObserver that keeps camera aspect + renderer size in sync.
 * @param {HTMLElement} mountEl
 * @param {React.MutableRefObject} cameraRef
 * @param {React.MutableRefObject} rendererRef
 * @returns {ResizeObserver}
 */
export function createResizeObserver(mountEl, cameraRef, rendererRef) {
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0 && cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    }
  });
  observer.observe(mountEl);
  return observer;
}

/**
 * Recentre the camera back to the default avatar view.
 * @param {React.MutableRefObject} cameraRef
 * @param {React.MutableRefObject} controlsRef
 */
/**
 * Lock camera target to avatar position (avatar-centric orbit).
 * Call this every frame in animation loop to keep camera locked.
 */
export function lockCameraToAvatar(cameraRef, controlsRef, avatarPos, avatarHeight = 1.5) {
  const cam = cameraRef?.current;
  const ctrls = controlsRef?.current;
  if (!cam || !ctrls || !avatarPos) return;
  
  // Target point is avatar's center + height offset
  const targetY = avatarPos.y + avatarHeight;
  const targetX = avatarPos.x;
  const targetZ = avatarPos.z;
  
  // Smooth lerp to follow avatar (prevents snap-jumps)
  ctrls.target.x += (targetX - ctrls.target.x) * 0.12;
  ctrls.target.y += (targetY - ctrls.target.y) * 0.12;
  ctrls.target.z += (targetZ - ctrls.target.z) * 0.12;
}

/**
 * Smoothly lerp the camera to a target position over time.
 * Call this in your animation loop when you want a smooth camera transition.
 */
export function lerpCameraTo(cameraRef, controlsRef, targetPos, targetLook, alpha = 0.08) {
  const cam = cameraRef?.current;
  const ctrls = controlsRef?.current;
  if (!cam) return;
  cam.position.lerp(targetPos, alpha);
  if (ctrls && targetLook) ctrls.target.lerp(targetLook, alpha);
}

export function resetCameraToAvatar(cameraRef, controlsRef) {
  const camera = cameraRef.current;
  const controls = controlsRef.current;
  
  if (camera) {
    camera.position.set(4, 3.5, 6);
    camera.lookAt(0, 1.5, 0);
  }
  
  if (controls) {
    controls.target.set(0, 1.5, 0);
    controls.enabled = true;
    controls.enableZoom = true;
    controls.autoRotate = false;
    controls.update();
  }
}

/**
 * Safety guard — reset camera if it drifted to infinity or the model teleported.
 * @param {React.MutableRefObject} cameraRef
 * @param {React.MutableRefObject} modelRef
 */
export function guardCameraPosition(cameraRef, modelRef) {
  const cam = cameraRef.current;
  const m   = modelRef.current;
  if (!cam || !m) return;
  const d = cam.position.length();
  if (!isFinite(d) || d > 1000) { cam.position.set(4, 3.5, 6); cam.lookAt(0, 1.5, 0); }
  if (Math.abs(m.position.x) > 100 || Math.abs(m.position.y) > 100 || Math.abs(m.position.z) > 100) m.position.set(0, 0, 0);
}