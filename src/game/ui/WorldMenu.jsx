import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Play, User, Shirt, ShoppingBag, Users, Target, Settings as SettingsIcon, Compass, LogOut, Coins,
} from 'lucide-react';

const ITEMS = [
  { id: 'resume', label: 'Resume', desc: 'Back to the world', icon: Play },
  { id: 'dripsync', label: 'DripSync', desc: 'Open the avatar studio', icon: Shirt },
  { id: 'shop', label: 'Shop', desc: 'Flagship store & drops', icon: ShoppingBag },
  { id: 'profile', label: 'Profile', desc: 'Your SKRTLIFE identity', icon: User },
  { id: 'community', label: 'Community', desc: 'Feed, drops & creators', icon: Users },
  { id: 'missions', label: 'Missions', desc: 'World objectives', icon: Target },
  { id: 'inventory', label: 'Inventory', desc: 'Your closet & gear', icon: Compass },
  { id: 'settings', label: 'Settings', desc: 'World preferences', icon: SettingsIcon },
  { id: 'directory', label: 'Leave World', desc: 'Return to SKRTLIFE site', icon: LogOut },
];

export default function WorldMenu({ open, onClose, onAction, username, skrtBalance }) {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(7,7,9,0.82)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ width: 'min(680px, 92vw)' }}>
            <div style={{ textAlign: 'center', marginBottom: 26 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '8px 14px', borderRadius: 999,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg,#00D4FF,#FF3366)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Harvest, sans-serif', fontWeight: 900, fontSize: 13, color: '#070709' }}>S</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>SKRTLIFE World Menu</span>
              </div>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{username}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#FFD700', fontSize: 12, fontWeight: 700 }}>
                  <Coins size={12} /> {(skrtBalance || 0).toLocaleString()} SKRT
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              {ITEMS.map((it) => {
                const Icon = it.icon;
                return (
                  <button
                    key={it.id}
                    onClick={() => onAction(it.id)}
                    style={{
                      textAlign: 'left', padding: '14px 14px', borderRadius: 12, cursor: 'pointer',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                      color: '#fff', display: 'flex', flexDirection: 'column', gap: 6,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'; e.currentTarget.style.background = 'rgba(0,212,255,0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  >
                    <Icon size={16} style={{ color: '#00D4FF' }} />
                    <span style={{ fontSize: 13, fontWeight: 800 }}>{it.label}</span>
                    <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)' }}>{it.desc}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: 22 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Press ESC to resume</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}