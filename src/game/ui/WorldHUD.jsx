import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Target, Menu as MenuIcon, Crosshair } from 'lucide-react';

/**
 * WorldHUD — minimal immersive overlay.
 * SKRTLIFE mark, username, SKRT balance, active mission, interaction prompt,
 * toast. Everything is pointer-events-none except the menu button so the
 * 3D viewport keeps pointer lock.
 */
export default function WorldHUD({ username, skrtBalance, mission, prompt, toast, onMenu }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => {}, 3500);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {/* top bar */}
      <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #00D4FF, #FF3366)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(0,212,255,0.3)',
          }}>
            <span style={{ fontFamily: 'Harvest, sans-serif', fontWeight: 900, fontSize: 18, color: '#070709' }}>S</span>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>SKRTLIFE</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{username}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 11px', borderRadius: 9,
            background: 'rgba(10,10,15,0.6)', border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
          }}>
            <Coins size={13} style={{ color: '#FFD700' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
              {(skrtBalance || 0).toLocaleString()} <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>SKRT</span>
            </span>
          </div>

          <button
            onClick={onMenu}
            style={{
              pointerEvents: 'auto',
              width: 34, height: 34, borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(10,10,15,0.6)', border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)', color: '#fff', cursor: 'pointer',
            }}
            aria-label="Open world menu"
          >
            <MenuIcon size={15} />
          </button>
        </div>
      </div>

      {/* mission card bottom-left */}
      <div style={{ position: 'absolute', left: 14, bottom: 14, maxWidth: 260 }}>
        {mission && (
          <div style={{
            padding: '11px 13px', borderRadius: 12,
            background: 'rgba(10,10,15,0.62)', border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <Target size={12} style={{ color: mission.status === 'completed' ? '#00D4FF' : '#FF3366' }} />
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
                {mission.status === 'completed' ? 'Mission Complete' : 'Current Mission'}
              </span>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{mission.title}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{mission.description}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 7 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#FFD700' }}>+{mission.reward_skrt} SKRT</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#00D4FF' }}>+{mission.reward_xp} XP</span>
            </div>
          </div>
        )}
      </div>

      {/* interaction prompt center-bottom */}
      <AnimatePresence>
        {prompt && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            style={{ position: 'absolute', bottom: 90, left: '50%', transform: 'translateX(-50%)' }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 12,
              background: 'rgba(10,10,15,0.7)', border: '1px solid rgba(0,212,255,0.35)',
              boxShadow: '0 0 24px rgba(0,212,255,0.15)', backdropFilter: 'blur(12px)',
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#00D4FF', color: '#070709', fontWeight: 900, fontSize: 12,
              }}>{prompt.key || 'E'}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{prompt.label}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <ToastItem key={toast.id} toast={toast} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast }) {
  useEffect(() => {}, []);
  const tone = toast.tone || 'info';
  const accent = tone === 'reward' ? '#FFD700' : tone === 'npc' ? '#FF3366' : '#00D4FF';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      transition={{ duration: 0.2 }}
      style={{ position: 'absolute', top: 64, left: '50%', transform: 'translateX(-50%)' }}
    >
      <div style={{
        padding: '12px 16px', borderRadius: 12, minWidth: 240, maxWidth: 380,
        background: 'rgba(10,10,15,0.78)', border: `1px solid ${accent}55`,
        boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 24px ${accent}22`, backdropFilter: 'blur(14px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <Crosshair size={13} style={{ color: accent }} />
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: accent }}>{toast.title}</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)' }}>{toast.body}</div>
      </div>
    </motion.div>
  );
}