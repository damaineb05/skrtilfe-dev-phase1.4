import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, User, Sparkles, Globe, X } from 'lucide-react';
import ContextualHint from '@/components/ui/ContextualHint';
import AvatarSection from './dripsync/AvatarSection';
import DripSection from './dripsync/DripSection';
import LooksSection from './dripsync/LooksSection';
import WorldSection from './dripsync/WorldSection';

/**
 * DripSyncTabletOverlay — the in-world DripSync OS surface.
 *
 * Opened by the OPEN_DRIPSYNC interaction zone OR the WorldMenu DripSync entry;
 * both call setMode('dripsync'). The World stays mounted underneath (no route
 * navigation), player position / camera / environment / avatar are preserved.
 *
 * Sections are lazy (each fetches its own read-safe data on mount):
 *   AVATAR — current DripSync identity + equipped state (read).
 *   DRIP   — owned saved looks (apply) + readable Wearable catalog (equip if
 *            owned via AssetOwnership, else preview-only).
 *   LOOKS  — saved Looks (apply if owned/public) + OutfitPresets (read-only).
 *   WORLD  — live session position + progression (read).
 *
 * The only equip write is base44.auth.updateMe({ avatar_config }) — an
 * owner-writable DripSync config record; it creates no ownership / economic
 * state. Ownership is validated before any equip.
 */
const TABS = [
  { id: 'avatar', label: 'AVATAR', icon: User },
  { id: 'drip', label: 'DRIP', icon: Shirt },
  { id: 'looks', label: 'LOOKS', icon: Sparkles },
  { id: 'world', label: 'WORLD', icon: Globe },
];

export default function DripSyncTabletOverlay({ open, onClose, user, ctxRef, updateUser, onToast }) {
  const [tab, setTab] = useState('avatar');
  useEffect(() => { if (open) setTab('avatar'); }, [open]);

  return (
    <AnimatePresence>
      {open && user && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(7,7,9,0.78)', backdropFilter: 'blur(14px)', padding: 16 }}
        >
          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 18, opacity: 0, scale: 0.97 }} transition={{ duration: 0.22 }}
            style={{ width: 'min(760px, 96vw)', height: 'min(680px, 88vh)', borderRadius: 22, background: 'linear-gradient(160deg, rgba(12,12,20,0.97), rgba(8,8,14,0.97))', border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 60px rgba(0,212,255,0.15), 0 24px 90px rgba(0,0,0,0.7)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {/* header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#00D4FF,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(0,212,255,0.3)' }}>
                  <Shirt size={18} color="#070709" />
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>In-World OS</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'Harvest, sans-serif' }}>DripSync</div>
                </div>
              </div>
              <button onClick={onClose} aria-label="Close DripSync" style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {/* tabs */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 6 }}>
              {TABS.map(t => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', border: '1px solid ' + (active ? 'rgba(0,212,255,0.35)' : 'transparent'), background: active ? 'rgba(0,212,255,0.08)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'all 0.18s' }}>
                    <Icon size={14} style={{ color: active ? '#00D4FF' : 'rgba(255,255,255,0.4)' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em' }}>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* content */}
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
              {tab === 'avatar' && <AvatarSection user={user} updateUser={updateUser} onToast={onToast} />}
              {tab === 'drip' && <DripSection user={user} updateUser={updateUser} onToast={onToast} />}
              {tab === 'looks' && <LooksSection user={user} updateUser={updateUser} onToast={onToast} />}
              {tab === 'world' && <WorldSection user={user} ctxRef={ctxRef} />}
            </div>

            {/* footer */}
            <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>World paused · click canvas to resume play</span>
              <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}>
                <X size={13} /> Close
              </button>
            </div>
          </motion.div>

          {/* One-time contextual hint: in-world DripSync shares the same identity. */}
          <ContextualHint
            hintId="world_dripsync"
            userId={user?.id}
            trigger={open && !!user}
            title="CHANGE YOUR DRIP ANYWHERE"
            body="Equip or remove pieces without leaving the World."
            ctaLabel="GOT IT"
            position="bottom"
            z={45}
            autoMs={8000}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}