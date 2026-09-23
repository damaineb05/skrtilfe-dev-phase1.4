import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, ShoppingBag, Sparkles, Shirt, Car, Radio, Compass } from 'lucide-react';

/**
 * WorldDirectory — the in-world district directory (Phase F §13). A simple
 * "YOU ARE HERE" overlay listing the major locations. Opened from the
 * OPEN_DIRECTORY interaction kiosk in the plaza. Not a minimap.
 */
const LOCATIONS = [
  { id: 'flagship', name: 'SKRTLIFE Flagship', desc: 'Featured drops & checkout', icon: ShoppingBag, accent: '#ff3366', dir: 'EAST' },
  { id: 'five_lines', name: 'Five Lines', desc: 'Premium division · limited', icon: Sparkles, accent: '#00d4ff', dir: 'WEST' },
  { id: 'dripsync', name: 'DripSync Lab', desc: 'Avatar · outfit · identity', icon: Shirt, accent: '#00d4ff', dir: 'NORTH' },
  { id: 'garage', name: 'Garage', desc: 'SKRTLIFE Motorsport', icon: Car, accent: '#ff3366', dir: 'NORTH' },
  { id: 'event', name: 'Event / Drop Space', desc: 'Drops · shows · community', icon: Radio, accent: '#ff3366', dir: 'SOUTH' },
];

export default function WorldDirectory({ open, onClose, discovered = [] }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          style={{ position: 'absolute', inset: 0, zIndex: 45, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(7,7,9,0.82)', backdropFilter: 'blur(14px)', padding: 16 }}
        >
          <motion.div
            initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }} transition={{ duration: 0.22 }}
            style={{ width: 'min(560px, 94vw)', borderRadius: 18, background: 'rgba(12,12,20,0.95)', border: '1px solid rgba(0,212,255,0.22)', boxShadow: '0 24px 90px rgba(0,0,0,0.7)' }}
          >
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#00D4FF,#FF3366)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Compass size={14} color="#070709" />
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>SKRTLIFE District</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={12} color="#00D4FF" /> You Are Here · Central Plaza
                  </div>
                </div>
              </div>
              <button onClick={onClose} aria-label="Close directory" style={{ color: 'rgba(255,255,255,0.6)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {/* list */}
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LOCATIONS.map((loc) => {
                const Icon = loc.icon;
                const found = discovered.includes(loc.id) || discovered.includes(`skrtlife_${loc.id}`);
                return (
                  <div key={loc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${loc.accent}1a`, border: `1px solid ${loc.accent}40` }}>
                      <Icon size={15} color={loc.accent} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{loc.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{loc.desc}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', color: loc.accent }}>{loc.dir}</span>
                      <span style={{ fontSize: 9, color: found ? '#00D4FF' : 'rgba(255,255,255,0.3)', fontWeight: 700 }}>{found ? 'DISCOVERED' : 'UNDISCOVERED'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '0 18px 14px', textAlign: 'center' }}>
              <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
                Walk to a location and press <span style={{ color: '#00D4FF', fontWeight: 800 }}>E</span> to enter.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}