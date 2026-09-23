import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, ZapIcon, Coins, Bell, ChevronDown } from 'lucide-react';

const STATUS_CONFIG = {
  online:    { color: '#22d3ee', label: 'Online',    pulse: true },
  away:      { color: '#f59e0b', label: 'Away',      pulse: false },
  streaming: { color: '#a855f7', label: 'Streaming', pulse: true },
  session:   { color: '#10b981', label: 'In Session',pulse: true },
  offline:   { color: '#374151', label: 'Offline',   pulse: false },
};

export default function AvatarIdentityHUD({ user, xp = 0, level = 1, currency = 0, notifications = 0, status = 'online' }) {
  const [expanded, setExpanded] = useState(false);
  const stat = STATUS_CONFIG[status] || STATUS_CONFIG.online;
  const xpPercent = Math.min(100, (xp % 1000) / 10);
  const displayName = user?.full_name?.split(' ')[0] || 'Drip';
  const avatarUrl = user?.avatar_config?.thumbnailUrl || user?.avatar_config?.avatarUrl;

  return (
    <motion.div
      className="absolute top-5 left-5 z-40 select-none"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{
          background: 'rgba(8,8,16,0.82)',
          backdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
          minWidth: 220,
        }}
        onClick={() => setExpanded(v => !v)}
      >
        {/* Top row */}
        <div className="flex items-center gap-3 p-3.5 pb-2.5">
          {/* Avatar circle */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)', border: '2px solid rgba(168,85,247,0.5)' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
              ) : (
                <span className="text-white font-black text-sm">{displayName[0]?.toUpperCase()}</span>
              )}
            </div>
            {/* Status dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#080810] flex items-center justify-center"
              style={{ background: stat.color }}>
              {stat.pulse && (
                <div className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ background: stat.color }} />
              )}
            </div>
          </div>

          {/* Name + level */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-white font-bold text-sm leading-none truncate">{displayName}</p>
              <div className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-[8px] font-black tracking-wider"
                style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                LVL {level}
              </div>
            </div>
            <p className="text-[10px] mt-0.5 font-semibold" style={{ color: stat.color }}>{stat.label}</p>
          </div>

          {/* Expand + notifications */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {notifications > 0 && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                style={{ background: '#ef4444' }}>
                {notifications > 9 ? '9+' : notifications}
              </div>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-white/30 transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        </div>

        {/* XP bar */}
        <div className="px-3.5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>XP {xp % 1000} / 1000</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.2)' }}>
              <Coins className="w-2.5 h-2.5" style={{ color: '#fbbf24' }} />
              <span className="text-[9px] font-black text-yellow-400">{currency.toLocaleString()}</span>
            </div>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #a855f7, #06b6d4)' }}
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </div>

        {/* Expanded stats */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-3.5 pb-3.5 pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { label: 'Outfits', value: '12' },
                    { label: 'Items', value: '48' },
                    { label: 'Rep', value: '4.9k' },
                  ].map(s => (
                    <div key={s.label} className="text-center py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-white font-black text-sm leading-none">{s.value}</p>
                      <p className="text-[8px] tracking-wider uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}