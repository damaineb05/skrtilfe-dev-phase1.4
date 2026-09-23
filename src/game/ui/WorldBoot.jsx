import React from 'react';
import { motion } from 'framer-motion';

/**
 * WorldBoot — full-screen loader and error / auth gate for SKRTLIFE WORLD.
 */
export default function WorldBoot({ loading, error, onLogin }) {
  if (loading !== false) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#070709', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
          style={{ width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg,#00D4FF,#FF3366)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(0,212,255,0.3)' }}
        >
          <span style={{ fontFamily: 'Harvest, sans-serif', fontWeight: 900, fontSize: 24, color: '#070709' }}>S</span>
        </motion.div>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Syncing Your Drip</div>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Resolving canonical identity</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
              style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D4FF', display: 'inline-block' }}
            />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#070709', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#FF3366', letterSpacing: '0.04em' }}>World failed to start</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', maxWidth: 420, textAlign: 'center' }}>{error || 'Unknown error'}</div>
      {onLogin && (
        <button onClick={onLogin} style={{ marginTop: 8, padding: '10px 18px', borderRadius: 10, background: '#00D4FF', color: '#070709', fontWeight: 800, fontSize: 12, border: 'none', cursor: 'pointer' }}>
          Sign in to enter
        </button>
      )}
    </div>
  );
}