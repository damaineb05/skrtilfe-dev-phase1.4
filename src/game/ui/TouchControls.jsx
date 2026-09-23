import React, { useRef, useState, useCallback, useEffect } from 'react';
import { isTouchDevice } from '@/lib/interaction/interactionConfig';

/**
 * TouchControls — minimal mobile/tablet input layer for SKRTLIFE WORLD.
 *
 * Left half of the screen: a dynamic thumbstick → movement (camera-relative,
 * fed into InputManager.setTouchMove). Right half: drag → camera look
 * (InputManager.injectLook). Two action buttons surface interact / jump.
 *
 * Desktop (no touch) renders nothing — keyboard + mouse stay authoritative.
 * The layer sits below the HUD (z-5) and the world overlays (z-40), so the HUD
 * menu button and the store / tablet surfaces keep receiving their own touches.
 */
export default function TouchControls({ input, enabled = true, canInteract = false }) {
  const [touch] = useState(isTouchDevice);
  const moveId = useRef(null);
  const moveCenter = useRef({ x: 0, y: 0 });
  const lookId = useRef(null);
  const lookLast = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0, active: false });
  const [running, setRunning] = useState(false);
  const R = 58;

  const resetMove = useCallback(() => {
    moveId.current = null;
    lookId.current = null;
    lookLast.current = null;
    setKnob({ x: 0, y: 0, active: false });
    input?.setTouchMove(0, 0);
    input?.setTouchRun(false);
    setRunning(false);
  }, [input]);

  // Opening any World overlay (store / dripsync / menu) flips enabled false →
  // drop any in-flight thumbstick / look so movement never sticks and the camera
  // never jumps when the overlay closes.
  useEffect(() => { if (!enabled) resetMove(); }, [enabled, resetMove]);

  const onStart = useCallback((e) => {
    if (!input || !enabled) return;
    for (const t of Array.from(e.changedTouches)) {
      if (t.clientX < window.innerWidth * 0.5 && moveId.current === null) {
        moveId.current = t.identifier;
        moveCenter.current = { x: t.clientX, y: t.clientY };
        setKnob({ x: 0, y: 0, active: true });
      } else if (lookId.current === null) {
        lookId.current = t.identifier;
        lookLast.current = { x: t.clientX, y: t.clientY };
      }
    }
  }, [input]);

  const onMove = useCallback((e) => {
    if (!input || !enabled) return;
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === moveId.current) {
        let dx = t.clientX - moveCenter.current.x;
        let dy = t.clientY - moveCenter.current.y;
        const len = Math.hypot(dx, dy);
        const cl = len > R ? R / len : 1;
        dx *= cl; dy *= cl;
        setKnob({ x: dx, y: dy, active: true });
        input.setTouchMove(dx / R, -dy / R); // up on screen → forward (+z)
        const isRun = len > R * 0.82;
        input.setTouchRun(isRun);
        setRunning(isRun);
      } else if (t.identifier === lookId.current && lookLast.current) {
        const dx = t.clientX - lookLast.current.x;
        const dy = t.clientY - lookLast.current.y;
        lookLast.current = { x: t.clientX, y: t.clientY };
        input.injectLook(dx, dy);
      }
    }
  }, [input, R]);

  const onEnd = useCallback((e) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === moveId.current) resetMove();
      else if (t.identifier === lookId.current) { lookId.current = null; lookLast.current = null; }
    }
  }, [resetMove]);

  if (!touch || !input) return null;

  const btn = (bg) => ({
    pointerEvents: 'auto', width: 58, height: 58, borderRadius: '50%',
    background: bg, border: '1px solid rgba(255,255,255,0.25)', color: '#fff',
    fontWeight: 800, fontSize: 15, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 18px rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)',
  });

  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 5, touchAction: 'none' }}
      onTouchStart={(e) => { e.preventDefault(); onStart(e); }}
      onTouchMove={(e) => { e.preventDefault(); onMove(e); }}
      onTouchEnd={(e) => { e.preventDefault(); onEnd(e); }}
      onTouchCancel={(e) => { e.preventDefault(); onEnd(e); }}
    >
      {knob.active && (
        <div style={{
          position: 'absolute', left: moveCenter.current.x - R, top: moveCenter.current.y - R,
          width: R * 2, height: R * 2, borderRadius: '50%',
          border: '1px solid rgba(0,212,255,0.4)', background: 'rgba(0,212,255,0.05)',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', left: R + knob.x - 22, top: R + knob.y - 22,
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(0,212,255,0.4)', border: '1px solid rgba(0,212,255,0.7)',
          }} />
        </div>
      )}

      <div style={{ position: 'absolute', right: 18, bottom: 72, display: 'flex', flexDirection: 'column', gap: 12, pointerEvents: 'none' }}>
        {canInteract && (
          <button
            onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); input.enqueue('interact'); }}
            style={btn('rgba(0,212,255,0.35)')}
            aria-label="Interact"
          >E</button>
        )}
        <button
          onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); input.enqueue('jump'); }}
          style={btn('rgba(255,51,102,0.4)')}
          aria-label="Jump"
        >↑</button>
      </div>

      <div style={{ position: 'absolute', left: 16, top: 64, fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}>
        {running ? 'Running' : 'Drag left to move · drag right to look'}
      </div>
    </div>
  );
}