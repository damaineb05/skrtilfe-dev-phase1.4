/**
 * DripSyncOSHUD — in-viewport overlay for the OS world.
 *
 * Shows:
 * - District proximity prompt ("Press E to enter [DISTRICT]")
 * - Minimap of all districts
 * - OS district panel launcher
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DripSyncOSWorld } from './DripSyncOSWorld';

const DISTRICT_META = {
  closet:      { label: 'CLOSET',      sublabel: 'Avatar Studio',    icon: '👗', color: '#a855f7', key: 'closet' },
  stream:      { label: 'STREAM HUB',  sublabel: 'Media Center',     icon: '📺', color: '#3b82f6', key: 'stream' },
  marketplace: { label: 'MARKETPLACE', sublabel: 'Digital Shop',     icon: '🛍️', color: '#06b6d4', key: 'marketplace' },
  social:      { label: 'SOCIAL',      sublabel: 'Community',        icon: '👥', color: '#ec4899', key: 'social' },
  vault:       { label: 'VAULT',       sublabel: 'Collection',       icon: '🏆', color: '#f59e0b', key: 'vault' },
  studio:      { label: 'STUDIO',      sublabel: 'Creator Tools',    icon: '🎬', color: '#10b981', key: 'studio' },
};

export default function DripSyncOSHUD({
  nearbyDistrict,
  activeDistrict,
  onOpen,
  onClose,
  avatarPos,   // { x, z } for minimap
}) {
  const meta = nearbyDistrict ? DISTRICT_META[nearbyDistrict.id] : null;

  return (
    <>
      {/* ── Proximity Prompt ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {nearbyDistrict && !activeDistrict && meta && (
          <motion.div
            key={nearbyDistrict.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
          >
            <div className="text-3xl">{meta.icon}</div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl"
              style={{
                background: 'rgba(0,0,0,0.82)',
                backdropFilter: 'blur(24px)',
                border: `1px solid ${meta.color}55`,
                boxShadow: `0 0 30px ${meta.color}33`,
              }}>
              <div className="text-left">
                <p className="text-[9px] font-black tracking-[0.3em] uppercase" style={{ color: meta.color }}>{meta.sublabel}</p>
                <p className="text-white text-sm font-black">{meta.label}</p>
              </div>
              <div className="w-px h-8 mx-1" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <button
                onClick={() => onOpen(nearbyDistrict.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs tracking-[0.2em] uppercase transition-all hover:scale-105 active:scale-95"
                style={{ background: meta.color, color: '#fff', boxShadow: `0 0 20px ${meta.color}66` }}
              >
                <kbd className="font-black text-xs opacity-80">E</kbd>
                Enter
              </button>
            </div>
            {/* Animated ring indicator */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute -inset-3 rounded-3xl pointer-events-none"
              style={{ border: `1px solid ${meta.color}`, borderRadius: 20 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Minimap ──────────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 right-6 z-30">
        <OSMinimap avatarPos={avatarPos} nearbyId={nearbyDistrict?.id} onOpen={onOpen} />
      </div>

      {/* ── OS Mode Indicator (top center) ───────────────────────────────── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0,212,255,0.25)',
          }}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[9px] font-black tracking-[0.3em] uppercase text-cyan-400">DripSync OS</span>
          <span className="text-[9px] tracking-[0.2em] text-white/30">· WASD to walk · E to enter</span>
        </div>
      </div>
    </>
  );
}

// ── Minimap ─────────────────────────────────────────────────────────────────
function OSMinimap({ avatarPos, nearbyId, onOpen }) {
  const SIZE = 110;
  const CENTER = SIZE / 2;
  const WORLD_RADIUS = 8; // matches DripSyncOSWorld districts
  const SCALE = (SIZE * 0.38) / WORLD_RADIUS;

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      {/* Background */}
      <svg width={SIZE} height={SIZE} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="mapBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0d0d1a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#070710" stopOpacity="0.98" />
          </radialGradient>
        </defs>
        {/* Map circle */}
        <circle cx={CENTER} cy={CENTER} r={CENTER - 2} fill="url(#mapBg)" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
        {/* Center ring */}
        <circle cx={CENTER} cy={CENTER} r={4} fill="none" stroke="#00D4FF" strokeWidth="1" opacity="0.6" />
        <circle cx={CENTER} cy={CENTER} r={1.5} fill="#00D4FF" opacity="0.8" />

        {/* District dots & spokes */}
        {DripSyncOSWorld.DISTRICTS.map((d) => {
          const dx = Math.cos(d.angle) * WORLD_RADIUS * SCALE;
          const dz = Math.sin(d.angle) * WORLD_RADIUS * SCALE;
          const mx = CENTER + dx;
          const my = CENTER + dz;
          const hex = '#' + d.color.toString(16).padStart(6, '0');
          const isNear = d.id === nearbyId;

          return (
            <g key={d.id}>
              {/* Spoke */}
              <line x1={CENTER} y1={CENTER} x2={mx} y2={my} stroke={hex} strokeWidth="0.5" opacity="0.2" />
              {/* District dot */}
              <circle cx={mx} cy={my} r={isNear ? 5.5 : 4} fill={hex} opacity={isNear ? 1 : 0.6} />
              {isNear && <circle cx={mx} cy={my} r={8} fill="none" stroke={hex} strokeWidth="1" opacity="0.5" />}
            </g>
          );
        })}

        {/* Avatar dot */}
        {avatarPos && (() => {
          const ax = CENTER + (avatarPos.x || 0) * SCALE;
          const ay = CENTER + (avatarPos.z || 0) * SCALE;
          return (
            <>
              <circle cx={ax} cy={ay} r={3.5} fill="#ffffff" opacity="0.95" />
              <circle cx={ax} cy={ay} r={6} fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.3" />
            </>
          );
        })()}
      </svg>

      {/* Label */}
      <div className="absolute -bottom-5 left-0 right-0 text-center">
        <span className="text-[7px] font-black tracking-[0.3em] uppercase" style={{ color: 'rgba(0,212,255,0.5)' }}>MAP</span>
      </div>
    </div>
  );
}