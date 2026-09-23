/**
 * ViewportControls — the single DripSync movement pipeline.
 *
 *   keyboard / touch / future gamepad
 *     → ViewportInput (normalized)
 *     → updateMovement (the one movement controller)
 *     → avatar transform (modelRef — the one transform owner)
 *     → camera follow + state machine
 *
 * Ownership rule: updateMovement is the ONLY code that mutates modelRef.position.
 * It may call stateMachine.transitionTo / preview, but must NOT create
 * AnimationStateMachine instances. Animation follows movement; it never gates it.
 */

const MOVEMENT_SETTINGS = {
  moveSpeed: 2.5,
  runMultiplier: 1.8,
  turnSpeed: 4.0,
  jumpImpulse: 7.0,
  gravity: -20.0,
  damping: 10.0,
};
export { MOVEMENT_SETTINGS };

// Keys we preventDefault so they don't scroll the page / trigger buttons.
const PREVENT_KEYS = new Set([
  'w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
  ' ', 'shift', 'e', 'r', '1', '2', '3', '4', '5',
]);

function isEditingTarget(t) {
  return !!(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable));
}

/**
 * Attach keyboard listeners. Movement keys (WASD / arrows / Shift / Space / E)
 * feed the normalized ViewportInput; emote + interaction hotkeys stay on keysRef.
 * Input is ignored while typing in a field, and cleared on blur / hidden tab.
 * Returns a cleanup function.
 */
export function attachKeyboardListeners(refs) {
  const {
    input, keysRef, runModeRef, emoteLockRef, velocityRef, stateMachineRef,
    interactionManagerRef, modelRef, threeModules, getCustomAnimations,
  } = refs;

  const triggerEmote = (emoteName) => {
    if (emoteLockRef.current || !stateMachineRef.current) return;
    if (velocityRef.current) velocityRef.current.set(0, 0, 0);
    emoteLockRef.current = true;
    stateMachineRef.current.preview(emoteName);
    setTimeout(() => { emoteLockRef.current = false; }, 3000);
  };

  const onKeyDown = (e) => {
    if (isEditingTarget(e.target)) return; // never hijack text fields
    const key = e.key.toLowerCase();
    if (PREVENT_KEYS.has(key)) e.preventDefault();

    // Normalized movement input
    switch (key) {
      case 'w': case 'arrowup':    input.setMove('forward', true); break;
      case 's': case 'arrowdown':  input.setMove('backward', true); break;
      case 'a': case 'arrowleft':  input.setMove('left', true); break;
      case 'd': case 'arrowright': input.setMove('right', true); break;
      case 'shift':                input.setRun(true); break;
      case ' ':                    input.setJump(true); input.setSource('keyboard'); break;
      case 'e':                    input.setInteract(true); break;
      default: break;
    }
    if (key !== ' ' && key !== 'shift') input.setSource('keyboard');

    // Non-movement hotkeys (emotes / interaction) on keysRef
    if (keysRef && key in keysRef.current) keysRef.current[key] = true;

    if (key === 'r' && runModeRef) runModeRef.current = !runModeRef.current;

    if (key === 'e' && interactionManagerRef.current) interactionManagerRef.current.interact('right');
    if (key === 'q' && interactionManagerRef.current) interactionManagerRef.current.dropHeldObject('right');
    if (key === 'f' && interactionManagerRef.current && modelRef.current && threeModules) {
      const dir = new threeModules.THREE.Vector3(0, 0.3, 1);
      dir.applyQuaternion(modelRef.current.quaternion);
      interactionManagerRef.current.throwHeldObject(dir, 'right');
    }
    if (keysRef?.current?.shift && key === 'e') triggerEmote('pose_hero');
    if (keysRef?.current?.shift && ['1', '2', '3', '4', '5'].includes(key)) {
      const anims = getCustomAnimations ? getCustomAnimations() : [];
      const anim = anims[Number(key) - 1];
      if (anim) triggerEmote(anim.name);
    }
  };

  const onKeyUp = (e) => {
    if (isEditingTarget(e.target)) return;
    const key = e.key.toLowerCase();
    switch (key) {
      case 'w': case 'arrowup':    input.setMove('forward', false); break;
      case 's': case 'arrowdown': input.setMove('backward', false); break;
      case 'a': case 'arrowleft': input.setMove('left', false); break;
      case 'd': case 'arrowright': input.setMove('right', false); break;
      case 'shift':                input.setRun(false); break;
      case ' ':                    input.setJump(false); break;
      case 'e':                    input.setInteract(false); break;
      default: break;
    }
    if (keysRef && key in keysRef.current) keysRef.current[key] = false;
  };

  const reset = () => input.reset();

  window.addEventListener('keydown', onKeyDown, { passive: false });
  window.addEventListener('keyup', onKeyUp, { passive: false });
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', reset);
    document.removeEventListener('visibilitychange', reset);
  };
}

/**
 * Per-frame movement — the single controller. Reads normalized input, applies
 * velocity + edge-triggered jump + camera follow, drives the animation state
 * machine. This is the ONLY code that mutates modelRef.position.
 */
export function updateMovement(THREE, delta, refs) {
  const {
    input, runModeRef, emoteLockRef, idleOverrideRef,
    velocityRef, onGroundRef, stateMachineRef, mixerRef, controlsRef,
    collisionSystemRef, colliderMeshesRef, modelRef, camera,
  } = refs;

  const model = modelRef.current;
  if (!model || !mixerRef.current || !stateMachineRef.current || !camera) return;

  // Emote lock freezes movement (not the other way around) — animation never gates movement.
  if (emoteLockRef.current) {
    if (velocityRef.current) velocityRef.current.set(0, 0, 0);
    mixerRef.current.update(delta);
    if (controlsRef.current) controlsRef.current.update();
    return;
  }

  const cameraForward = new THREE.Vector3();
  camera.getWorldDirection(cameraForward);
  cameraForward.y = 0;
  cameraForward.normalize();
  const cameraRight = new THREE.Vector3().crossVectors(camera.up, cameraForward).normalize();

  const forward  = input.forward ? 1 : input.backward ? -1 : 0;
  const strafe   = input.left ? -1 : input.right ? 1 : 0;
  const wantsRun = runModeRef.current || input.run;
  const jumpJustPressed = input.consumeJump(); // edge-triggered — one jump per press

  const moveDir = new THREE.Vector3();
  if (forward !== 0) moveDir.add(cameraForward.clone().multiplyScalar(forward));
  if (strafe !== 0)  moveDir.add(cameraRight.clone().multiplyScalar(strafe));
  moveDir.normalize();

  const speed = MOVEMENT_SETTINGS.moveSpeed * (wantsRun ? MOVEMENT_SETTINGS.runMultiplier : 1);
  const targetVel = moveDir.clone().multiplyScalar(speed);

  if (velocityRef.current) {
    velocityRef.current.x = THREE.MathUtils.damp(velocityRef.current.x, targetVel.x, MOVEMENT_SETTINGS.damping, delta);
    velocityRef.current.z = THREE.MathUtils.damp(velocityRef.current.z, targetVel.z, MOVEMENT_SETTINGS.damping, delta);
    velocityRef.current.y += MOVEMENT_SETTINGS.gravity * delta;
  }

  if (jumpJustPressed && onGroundRef.current) {
    if (collisionSystemRef.current) {
      collisionSystemRef.current.jump();
    } else if (velocityRef.current) {
      velocityRef.current.y = MOVEMENT_SETTINGS.jumpImpulse;
      onGroundRef.current = false;
    }
    if (stateMachineRef.current?.actions?.jump) stateMachineRef.current.preview('jump');
  }

  if (velocityRef.current) {
    const currentPos = model.position.clone();
    const desiredPos = currentPos.clone().addScaledVector(velocityRef.current, delta);

    if (collisionSystemRef.current && colliderMeshesRef.current.length > 0) {
      const result = collisionSystemRef.current.update(currentPos, desiredPos, delta);
      model.position.copy(result.position);
      onGroundRef.current = result.grounded;
      if (result.grounded && velocityRef.current.y < 0) velocityRef.current.y = 0;
    } else {
      model.position.copy(desiredPos);
      if (model.position.y <= 0) { model.position.y = 0; velocityRef.current.y = 0; onGroundRef.current = true; }
    }

    const hv = new THREE.Vector3(velocityRef.current.x, 0, velocityRef.current.z);
    if (hv.lengthSq() > 0.01) {
      const tq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), hv.clone().normalize());
      model.quaternion.slerp(tq, MOVEMENT_SETTINGS.turnSpeed * delta);
    }
  }

  if (onGroundRef.current && stateMachineRef.current.currentState !== 'jump' &&
      !stateMachineRef.current.isTransitioning && !stateMachineRef.current.isPreviewing()) {
    const isMoving = forward !== 0 || strafe !== 0;
    let targetState = 'idle';
    if (isMoving) {
      if (forward < 0 && strafe === 0)      targetState = 'backward';
      else if (strafe < 0 && forward === 0) targetState = 'strafeLeft';
      else if (strafe > 0 && forward === 0) targetState = 'strafeRight';
      else                                  targetState = wantsRun ? 'run' : 'walk';
    } else if (idleOverrideRef.current === 'RunInPlace' && runModeRef.current) {
      targetState = 'run';
    }
    if (stateMachineRef.current.currentState !== targetState) stateMachineRef.current.transitionTo(targetState);
  }

  mixerRef.current.update(delta);

  // Camera follows the one authoritative avatar.
  if (controlsRef.current && model) {
    const avatarPos = model.position;
    const targetY = avatarPos.y + 1.5;
    const lerpFactor = THREE.MathUtils.clamp(delta * 8, 0, 1);
    controlsRef.current.target.x += (avatarPos.x - controlsRef.current.target.x) * lerpFactor;
    controlsRef.current.target.y += (targetY - controlsRef.current.target.y) * lerpFactor;
    controlsRef.current.target.z += (avatarPos.z - controlsRef.current.target.z) * lerpFactor;
    const distToAvatar = controlsRef.current.target.distanceTo(avatarPos);
    if (distToAvatar > 100) controlsRef.current.target.set(avatarPos.x, targetY, avatarPos.z);
  }
}