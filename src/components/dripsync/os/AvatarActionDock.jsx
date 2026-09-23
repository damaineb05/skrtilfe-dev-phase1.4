import React from 'react';
import { motion } from 'framer-motion';
import { Shirt, Zap, Users, ShoppingBag, Camera, Maximize2, Settings, Layers } from 'lucide-react';

const DOCK_ITEMS = [
  { id: 'closet',     icon: Shirt,       label: 'Closet',     accent: '#a855f7' },
  { id: 'emotes',     icon: Zap,         label: 'Emotes',     accent: '#f59e0b' },
  { id: 'social',     icon: Users,       label: 'Social',     accent: '#06b6d4' },
  { id: 'shop',       icon: ShoppingBag, label: 'Shop',       accent: '#10b981' },
  { id: 'capture',    icon: Camera,      label: 'Capture',    accent: '#ec4899' },
  { id: 'scene',      icon: Layers,      label: 'Scene',      accent: '#8b5cf6' },
];

export default function AvatarActionDock({ activeItem, onSelect, viewMode, onViewMode }) {
  return (
    <motion.div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-end gap-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
    >
      {/* Main dock */}
      <div
        className="flex items-center gap-1.5 px-3 py-3"
        style={{
          background: 'rgba(8,8,16,0.85)',
          backdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 22,
          boxShadow: '0 16px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {DOCK_ITEMS.map((item, i) => {
          const isActive = activeItem === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => onSelect(item.id)}
              whileHover={{ y: -4, scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="relative flex flex-col items-center gap-1.5 group"
              title={item.label}
            >
              {/* Active glow ring */}
              {isActive && (
                <motion.div
                  layoutId="dockActive"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: `${item.accent}22`, border: `1px solid ${item.accent}55` }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 relative z-10"
                style={{
                  background: isActive ? `${item.accent}20` : 'rgba(255,255,255,0.05)',
                  boxShadow: isActive ? `0 0 20px ${item.accent}44` : 'none',
                }}
              >
                <Icon
                  className="w-5 h-5 transition-all duration-200"
                  style={{ color: isActive ? item.accent : 'rgba(255,255,255,0.45)' }}
                />
              </div>
              <span
                className="text-[8px] font-bold tracking-wider uppercase transition-all duration-200"
                style={{ color: isActive ? item.accent : 'rgba(255,255,255,0.25)' }}
              >
                {item.label}
              </span>
              {/* Active dot */}
              {isActive && (
                <motion.div
                  layoutId="dockDot"
                  className="w-1 h-1 rounded-full -mt-1"
                  style={{ background: item.accent }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* View mode pill */}
      <div
        className="flex flex-col gap-1.5 px-2.5 py-2.5"
        style={{
          background: 'rgba(8,8,16,0.85)',
          backdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 18,
          boxShadow: '0 16px 60px rgba(0,0,0,0.65)',
        }}
      >
        {[
          { id: 'focus', label: '◈', title: 'Focus' },
          { id: 'split', label: '⊞', title: 'Split' },
          { id: 'app',   label: '⊟', title: 'App' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => onViewMode(m.id)}
            title={m.title}
            className="w-8 h-7 rounded-lg text-xs font-black transition-all flex items-center justify-center"
            style={{
              background: viewMode === m.id ? 'rgba(168,85,247,0.25)' : 'transparent',
              color: viewMode === m.id ? '#c084fc' : 'rgba(255,255,255,0.25)',
              border: viewMode === m.id ? '1px solid rgba(168,85,247,0.4)' : '1px solid transparent',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}