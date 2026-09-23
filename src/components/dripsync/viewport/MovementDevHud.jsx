import React, { useEffect, useState } from 'react';

/**
 * MovementDevHud — development-only movement diagnostic for DripSync.
 * Gated by ?dev=1 so it never ships to production.
 *
 * Shows: input X/Z, grounded, vertical velocity, jump requested, locomotion
 * state, active input source, transform owner, engine-attached flag.
 */
export default function MovementDevHud({ input, velocityRef, onGroundRef, stateMachineRef }) {
  const [dev] = useState(() =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === '1'
  );
  const [s, setS] = useState({ mx: 0, mz: 0, grounded: true, vy: 0, jump: false, state: 'idle', source: 'keyboard' });

  useEffect(() => {
    if (!dev) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const v = velocityRef?.current;
      setS({
        mx: input?.forward ? 1 : input?.backward ? -1 : 0,
        mz: input?.left ? -1 : input?.right ? 1 : 0,
        grounded: !!(onGroundRef?.current),
        vy: v ? v.y : 0,
        jump: !!(input?.jumpQueued),
        state: stateMachineRef?.current?.currentState || 'idle',
        source: input?.source || 'keyboard',
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dev, input, velocityRef, onGroundRef, stateMachineRef]);

  if (!dev) return null;

  const Row = (k, v) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 10 }}>
      <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
      <span style={{ color: '#00D4FF', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
    </div>
  );

  return (
    <div style={{
      position: 'absolute', top: 12, left: 12, zIndex: 60, pointerEvents: 'none',
      padding: '9px 11px', borderRadius: 9, minWidth: 168,
      background: 'rgba(7,7,9,0.72)', border: '1px solid rgba(0,212,255,0.25)',
      boxShadow: '0 0 24px rgba(0,212,255,0.1)', backdropFilter: 'blur(10px)',
      display: 'flex', flexDirection: 'column', gap: 5, fontFamily: 'ui-monospace, monospace',
    }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 2 }}>DEV · MOVEMENT</div>
      {Row('INPUT', `${s.mx},${s.mz}`)}
      {Row('GROUNDED', s.grounded ? 'YES' : 'NO')}
      {Row('VY', s.vy.toFixed(2))}
      {Row('JUMP_REQ', s.jump ? 'YES' : 'NO')}
      {Row('STATE', s.state)}
      {Row('SOURCE', s.source)}
      {Row('OWNER', 'viewport')}
      {Row('ENGINE', 'NO')}
    </div>
  );
}