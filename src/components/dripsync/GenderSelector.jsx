import React from 'react';
import { motion } from 'framer-motion';

/**
 * GenderSelector — Clean avatar gender selection
 * Simple radio-style selector for male/female avatar defaults
 * Mobile-friendly, optional (defaults to masculine)
 */
export default function GenderSelector({ value = 'masculine', onChange, isMobile = false }) {
  const options = [
    { id: 'masculine', label: 'Male', icon: '♂' },
    { id: 'feminine', label: 'Female', icon: '♀' },
  ];

  if (isMobile) {
    return (
      <div className="space-y-3 p-3 rounded-lg bg-white/5 border border-white/10">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-60">Avatar Type</label>
        <div className="flex gap-2">
          {options.map((opt) => (
            <motion.button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                value === opt.id
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-400 shadow-[0_0_12px_rgba(0,212,255,0.3)]'
                  : 'bg-white/5 border-white/10 text-text-60 hover:bg-white/10'
              }`}
            >
              <span className="mr-1">{opt.icon}</span>
              {opt.label}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Desktop
  return (
    <div className="space-y-3 p-4 rounded-xl bg-glass-panel border border-white/10">
      <label className="text-sm font-semibold uppercase tracking-wider text-text-100 block">Avatar Type</label>
      <div className="flex gap-3">
        {options.map((opt) => (
          <motion.button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border ${
              value === opt.id
                ? 'bg-skrt-cyan/15 border-skrt-cyan/50 text-skrt-cyan shadow-[0_0_16px_rgba(0,212,255,0.3)]'
                : 'bg-white/5 border-white/10 text-text-60 hover:bg-white/10'
            }`}
          >
            <span className="text-lg mr-2">{opt.icon}</span>
            {opt.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}