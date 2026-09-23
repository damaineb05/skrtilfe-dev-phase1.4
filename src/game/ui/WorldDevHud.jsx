import React, { useEffect, useState } from 'react';

/**
 * WorldDevHud — development-only diagnostics overlay for SKRTLIFE WORLD.
 * Gated by ?dev=1 in the URL so it never ships to production.
 *
 * Shows: FPS, player X/Y/Z, current game mode, pointer-lock state, last input
 * type (keyboard/mouse/touch), current interaction, current zone, multiplayer
 * presence status. This is debugging infrastructure, not final SKRTLIFE UI.
 */
export default function WorldDevHud({ ctxRef, mode, zoneLabel, isTouch }) {
  const [dev] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('dev') === '1';
  });
  const [s, setS] = useState({ fps: 0, x: '0.0', y: '0.0', z: '0.0', locked: false, enabled: true, input: '—', ix: null, presence: '—', calls: 0, tris: 0, tex: 0 });

  useEffect(() => {
    if (!dev) return;
    let raf = 0, frames = 0, acc = 0, last = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      acc += now - last; last = now; frames++;
      if (acc >= 250) {
        const ctx = ctxRef.current;
        const p = ctx?.player?.position;
        const info = ctx?.engine?.renderer?.info;
        setS({
          fps: Math.round((frames * 1000) / acc),
          x: p ? p.x.toFixed(1) : '0.0',
          y: p ? p.y.toFixed(1) : '0.0',
          z: p ? p.z.toFixed(1) : '0.0',
          locked: !!(ctx?.input?.locked),
          enabled: ctx?.input?.enabled !== false,
          input: ctx?.input?.lastInput || (isTouch ? 'touch' : 'keyboard'),
          ix: ctx?.interaction?.current?.id || null,
          presence: ctx?.presence ? 'stub (P2)' : 'offline',
          calls: info?.render?.calls ?? 0,
          tris: info?.render?.triangles ?? 0,
          tex: info?.memory?.textures ?? 0,
        });
        frames = 0; acc = 0;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dev, ctxRef, isTouch]);

  if (!dev) return null;

  const Row = ({ k, v }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, fontSize: 10.5 }}>
      <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
      <span style={{ color: '#00D4FF', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
    </div>
  );

  return (
    <div style={{
      position: 'absolute', top: 60, right: 14, zIndex: 60, pointerEvents: 'none',
      padding: '10px 12px', borderRadius: 10, minWidth: 176,
      background: 'rgba(7,7,9,0.72)', border: '1px solid rgba(0,212,255,0.25)',
      boxShadow: '0 0 24px rgba(0,212,255,0.1)', backdropFilter: 'blur(10px)',
      display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'ui-monospace, monospace',
    }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 2 }}>DEV · WORLD</div>
      <Row k="FPS" v={s.fps} />
      <Row k="POS" v={`${s.x}, ${s.y}, ${s.z}`} />
      <Row k="MODE" v={mode} />
      <Row k="ENABLED" v={s.enabled ? 'YES' : 'NO'} />
      <Row k="PLOCK" v={s.locked ? 'ON' : 'OFF'} />
      <Row k="INPUT" v={s.input} />
      <Row k="INTERACT" v={s.ix || '—'} />
      <Row k="ZONE" v={zoneLabel} />
      <Row k="CALLS" v={s.calls} />
      <Row k="TRIS" v={s.tris.toLocaleString()} />
      <Row k="TEX" v={s.tex} />
      <Row k="MP" v={s.presence} />
    </div>
  );
}