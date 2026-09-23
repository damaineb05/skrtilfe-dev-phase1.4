/**
 * DripSyncOSDistrictPanel — the floating panel that opens when a district is entered.
 *
 * Renders the appropriate district UI in a glass panel overlay.
 * Fully dismissable. Avatar stays in the 3D world behind it.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import StreamingHub from '@/components/streaming/StreamingHub';

const DISTRICT_META = {
  closet:      { label: 'CLOSET',      sublabel: 'Avatar Studio',   icon: '👗', color: '#a855f7' },
  stream:      { label: 'STREAM HUB',  sublabel: 'Media Center',    icon: '📺', color: '#3b82f6' },
  marketplace: { label: 'MARKETPLACE', sublabel: 'Digital Shop',    icon: '🛍️', color: '#06b6d4' },
  social:      { label: 'SOCIAL',      sublabel: 'Community',       icon: '👥', color: '#ec4899' },
  vault:       { label: 'VAULT',       sublabel: 'Collection',      icon: '🏆', color: '#f59e0b' },
  studio:      { label: 'STUDIO',      sublabel: 'Creator Tools',   icon: '🎬', color: '#10b981' },
};

// ── Placeholder district views ───────────────────────────────────────────────
function ComingSoonView({ meta }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="text-5xl">{meta.icon}</div>
      <p className="text-[9px] font-black tracking-[0.3em] uppercase" style={{ color: meta.color }}>{meta.sublabel}</p>
      <h2 className="text-2xl font-black text-white">{meta.label}</h2>
      <p className="text-sm text-white/40 max-w-xs text-center leading-relaxed">
        This district is being constructed. Check back soon.
      </p>
      <div className="flex items-center gap-2 mt-2">
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: meta.color }} />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: meta.color }}>Coming Soon</span>
      </div>
    </div>
  );
}

function DistrictContent({ districtId, meta }) {
  switch (districtId) {
    case 'stream':
      return <StreamingHub />;
    default:
      return <ComingSoonView meta={meta} />;
  }
}

export default function DripSyncOSDistrictPanel({ districtId, onClose }) {
  const [maximized, setMaximized] = useState(false);
  const meta = DISTRICT_META[districtId];
  if (!meta) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={districtId}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.28, ease: [0.34, 1.2, 0.64, 1] }}
        className={`absolute z-40 flex flex-col overflow-hidden ${
          maximized
            ? 'inset-0 rounded-none'
            : 'top-10 left-10 right-10 bottom-10 rounded-2xl'
        }`}
        style={{
          background: 'rgba(8,8,16,0.95)',
          backdropFilter: 'blur(32px)',
          border: `1px solid ${meta.color}33`,
          boxShadow: `0 0 60px ${meta.color}22, 0 24px 80px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: `1px solid ${meta.color}22` }}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{meta.icon}</span>
            <div>
              <p className="text-[8px] font-black tracking-[0.3em] uppercase" style={{ color: meta.color }}>{meta.sublabel}</p>
              <p className="text-sm font-black text-white">{meta.label}</p>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: meta.color }} />
              <span className="text-[8px] font-bold tracking-[0.2em] uppercase" style={{ color: `${meta.color}aa` }}>LIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setMaximized(m => !m)}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-white/10">
              {maximized
                ? <Minimize2 className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                : <Maximize2 className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
              }
            </button>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-white/10">
              <X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <DistrictContent districtId={districtId} meta={meta} />
        </div>

        {/* Bottom accent bar */}
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${meta.color}66, transparent)` }} />
      </motion.div>
    </AnimatePresence>
  );
}