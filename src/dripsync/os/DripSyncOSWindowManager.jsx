/**
 * DripSyncOSWindowManager — Draggable, 3D-anchored floating application window.
 *
 * Replaces DripSyncOSDistrictPanel.
 *
 * Features:
 * - Opens with initial position anchored to the district portal's projected screen coords
 * - Fully draggable via framer-motion
 * - macOS-style traffic light controls (close / minimize / maximize)
 * - SVG tether beam from window to portal position
 * - Renders district micro-apps via DripSyncOSApps router
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize2, Maximize2 } from 'lucide-react';
import DripSyncOSApps from './DripSyncOSApps';

export const DISTRICT_META = {
  closet:      { label: 'CLOSET',       sublabel: 'Avatar Studio',   icon: '👗', color: '#a855f7' },
  stream:      { label: 'STREAM HUB',   sublabel: 'Media Center',    icon: '📺', color: '#3b82f6' },
  marketplace: { label: 'MARKETPLACE',  sublabel: 'Digital Shop',    icon: '🛍️', color: '#06b6d4' },
  social:      { label: 'SOCIAL',       sublabel: 'Community',       icon: '👥', color: '#ec4899' },
  vault:       { label: 'VAULT',        sublabel: 'Collection',      icon: '🏆', color: '#f59e0b' },
  studio:      { label: 'STUDIO',       sublabel: 'Creator Tools',   icon: '🎬', color: '#10b981' },
};

// Window dimensions per district (w × h)
const SIZES = {
  stream:      { w: 680, h: 500 },
  closet:      { w: 460, h: 460 },
  marketplace: { w: 440, h: 460 },
  social:      { w: 400, h: 480 },
  vault:       { w: 440, h: 460 },
  studio:      { w: 420, h: 380 },
};

export default function DripSyncOSWindowManager({ districtId, portalScreenPos, onClose }) {
  const [maximized, setMaximized] = useState(false);

  const meta = DISTRICT_META[districtId];
  if (!meta) return null;

  const { w, h } = SIZES[districtId] || { w: 460, h: 460 };

  // ── Initial position: anchor near portal, clamped to viewport ───────────
  const vw = typeof window !== 'undefined' ? window.innerWidth  : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  const initX = portalScreenPos
    ? Math.max(20, Math.min(portalScreenPos.x - w * 0.5, vw - w - 20))
    : Math.max(20, (vw - w) / 2);
  const initY = portalScreenPos
    ? Math.max(56, Math.min(portalScreenPos.y - h * 0.6, vh - h - 20))
    : 80;

  return (
    <AnimatePresence>
      {/* ── SVG tether from window anchor to portal position ─────────────── */}
      {portalScreenPos && !maximized && (
        <motion.svg
          key={`tether-${districtId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none z-30"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={`tg-${districtId}`} gradientUnits="userSpaceOnUse"
              x1={initX + w * 0.5} y1={initY + h * 0.5}
              x2={portalScreenPos.x}  y2={portalScreenPos.y}>
              <stop offset="0%"   stopColor={meta.color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={meta.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Beam */}
          <line
            x1={initX + w * 0.5} y1={initY + h * 0.5}
            x2={portalScreenPos.x} y2={portalScreenPos.y}
            stroke={`url(#tg-${districtId})`}
            strokeWidth="1"
            strokeDasharray="5 7"
          />
          {/* Portal anchor dot */}
          <circle cx={portalScreenPos.x} cy={portalScreenPos.y} r="5" fill={meta.color} opacity="0.65" />
          <circle cx={portalScreenPos.x} cy={portalScreenPos.y} r="10" fill="none" stroke={meta.color} strokeWidth="1" opacity="0.28" />
        </motion.svg>
      )}

      {/* ── Application Window ────────────────────────────────────────────── */}
      <motion.div
        key={`win-${districtId}`}
        initial={{ opacity: 0, scale: 0.88, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.28, ease: [0.34, 1.15, 0.64, 1] }}

        /* Drag — framer-motion adds transform on top of absolute left/top */
        drag={!maximized}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{
          left: -(initX - 20),
          top:  -(initY - 56),
          right:  vw - initX - w - 20,
          bottom: vh - initY - h - 20,
        }}

        className={`absolute z-40 flex flex-col overflow-hidden select-none ${
          maximized ? 'inset-0 rounded-none' : 'rounded-2xl'
        }`}
        style={maximized ? {
          background: 'rgba(6,6,14,0.97)',
          backdropFilter: 'blur(40px) saturate(180%)',
          border: `1px solid ${meta.color}28`,
          boxShadow: `0 0 80px ${meta.color}15, 0 30px 100px rgba(0,0,0,0.9)`,
        } : {
          left: initX,
          top: initY,
          width: w,
          height: h,
          background: 'rgba(6,6,14,0.97)',
          backdropFilter: 'blur(40px) saturate(180%)',
          border: `1px solid ${meta.color}28`,
          boxShadow: `0 0 80px ${meta.color}15, 0 30px 100px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}
      >
        {/* ── Title bar / drag handle ──────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0 cursor-grab active:cursor-grabbing"
          style={{
            borderBottom: `1px solid ${meta.color}18`,
            background: `linear-gradient(90deg, ${meta.color}10, transparent 60%)`,
          }}
        >
          {/* macOS traffic lights */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full transition-all hover:brightness-125 flex-shrink-0"
              style={{ background: '#ff5f57' }}
              title="Close"
            />
            <button
              className="w-3 h-3 rounded-full flex-shrink-0 cursor-default"
              style={{ background: '#febc2e' }}
              title="Minimize (coming soon)"
            />
            <button
              onClick={() => setMaximized(m => !m)}
              className="w-3 h-3 rounded-full transition-all hover:brightness-125 flex-shrink-0"
              style={{ background: '#28c840' }}
              title={maximized ? 'Restore' : 'Maximize'}
            />
          </div>

          {/* District identity */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-base leading-none">{meta.icon}</span>
            <div className="min-w-0">
              <p className="text-[7px] font-black tracking-[0.3em] uppercase leading-none mb-0.5" style={{ color: `${meta.color}bb` }}>
                {meta.sublabel}
              </p>
              <p className="text-xs font-black text-white leading-tight truncate">{meta.label}</p>
            </div>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: meta.color }} />
          </div>

          {/* Maximize toggle */}
          <button
            onClick={() => setMaximized(m => !m)}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-all hover:bg-white/10 flex-shrink-0"
          >
            {maximized
              ? <Minimize2 className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
              : <Maximize2 className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
            }
          </button>
        </div>

        {/* ── App content ──────────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <DripSyncOSApps districtId={districtId} />
        </div>

        {/* ── Bottom accent ─────────────────────────────────────────────── */}
        <div
          className="h-px flex-shrink-0"
          style={{ background: `linear-gradient(90deg, transparent, ${meta.color}55, transparent)` }}
        />
      </motion.div>
    </AnimatePresence>
  );
}