/**
 * ModeSelector
 * ─────────────────────────────────────────────────────────────
 * Polished DripSync mode selector component.
 * Displays mode buttons with smooth transitions and visual feedback.
 * Responsive to mobile/desktop layouts.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Crosshair, User, ShoppingBag } from 'lucide-react';
import { DripSyncMode, ModeMetadata } from '../../dripsync/core/DripSyncModeConfig.js';

const IconMap = {
  Gamepad2,
  Crosshair,
  User,
  ShoppingBag,
};

export default function ModeSelector({ currentMode, onChange, isMobile = false }) {
  const modes = Object.values(DripSyncMode);

  return (
    <div className={isMobile ? 'px-4 py-3' : 'p-3'}>
      {/* Label */}
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-3"
        style={{ color: 'rgba(255,255,255,0.3)' }}>
        Mode
      </p>

      {/* Buttons */}
      <div className={isMobile ? 'space-y-2' : 'space-y-2'}>
        {modes.map((mode) => {
          const meta = ModeMetadata[mode];
          const isActive = currentMode === mode;
          const IconComponent = IconMap[meta.icon];

          return (
            <motion.button
              key={mode}
              onClick={() => onChange(mode)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200"
              style={{
                background: isActive
                  ? `${meta.color}20`
                  : 'rgba(255,255,255,0.03)',
                border: isActive
                  ? `1px solid ${meta.color}40`
                  : '1px solid rgba(255,255,255,0.08)',
                color: isActive ? meta.color : 'rgba(255,255,255,0.6)',
              }}
            >
              {/* Icon */}
              {IconComponent && (
                <IconComponent className="w-4 h-4 flex-shrink-0" />
              )}

              {/* Label + Description */}
              <div className="flex-1 text-left">
                <p className="text-sm font-bold leading-tight">
                  {meta.label}
                </p>
                <p className="text-[10px] opacity-60 leading-tight">
                  {meta.description}
                </p>
              </div>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="modeIndicator"
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: meta.color }}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}