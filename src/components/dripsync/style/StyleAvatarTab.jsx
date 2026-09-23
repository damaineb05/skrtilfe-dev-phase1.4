import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const GENDER_OPTIONS = [
  {
    id: 'masculine',
    label: 'Male',
    icon: '♂',
    desc: 'Masculine rig',
    accent: '#06b6d4',
  },
  {
    id: 'feminine',
    label: 'Female',
    icon: '♀',
    desc: 'Feminine rig',
    accent: '#ec4899',
  },
];

/**
 * StyleAvatarTab
 * Avatar type selector + saved default avatar grid.
 */
export default function StyleAvatarTab({
  avatarType = 'masculine',
  onAvatarTypeChange,
  defaultAvatars = [],
  onLoadDefault,
  onCreateStreamoji,
}) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-4 space-y-4">
      {/* Streamoji sync */}
      {onCreateStreamoji && (
        <motion.button
          onClick={onCreateStreamoji}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(168,85,247,0.12))',
            border: '1px solid rgba(6,182,212,0.35)',
            color: '#22d3ee',
          }}
        >
          <Sparkles className="w-4 h-4" />
          Sync with Streamoji
        </motion.button>
      )}

      {/* Gender selector */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[10px] font-black tracking-[0.25em] uppercase text-white/40 mb-3">Avatar Type</p>
        <div className="grid grid-cols-2 gap-2">
          {GENDER_OPTIONS.map(opt => {
            const isActive = avatarType === opt.id;
            return (
              <motion.button
                key={opt.id}
                onClick={() => onAvatarTypeChange?.(opt.id)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-2 py-5 rounded-xl transition-all"
                style={{
                  background: isActive ? `${opt.accent}14` : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${isActive ? opt.accent + '55' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isActive ? `0 0 24px ${opt.accent}22` : 'none',
                }}
              >
                <span className="text-3xl" style={{ filter: isActive ? `drop-shadow(0 0 8px ${opt.accent})` : 'none' }}>
                  {opt.icon}
                </span>
                <span className="text-sm font-black" style={{ color: isActive ? opt.accent : 'rgba(255,255,255,0.5)' }}>
                  {opt.label}
                </span>
                <span className="text-[9px] tracking-wider" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {opt.desc}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: opt.accent }} />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Saved avatars — shows all type:'avatar' assets */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[10px] font-black tracking-[0.25em] uppercase text-white/40 mb-3">
          Saved Avatars <span className="text-white/20">({defaultAvatars.length})</span>
        </p>

        {defaultAvatars.length === 0 ? (
          <div className="py-6 text-center">
            <span className="text-3xl">👤</span>
            <p className="text-white/25 text-xs mt-2">No saved avatars yet</p>
            <p className="text-white/15 text-[10px] mt-0.5">Save your current avatar to build a library</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {defaultAvatars.map(av => {
              // V1 + V2 compat thumbnail resolution
              const thumb = av.thumbnailUrl || av.metadata?.thumbnailUrl || null;
              const gender = av.gender || av.metadata?.gender || av.metadata?.avatarType || null;
              return (
                <motion.button
                  key={av.id}
                  onClick={() => onLoadDefault?.(av)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-xl overflow-hidden flex flex-col relative"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="w-full aspect-square flex items-center justify-center overflow-hidden relative"
                    style={{ background: 'rgba(0,0,0,0.25)' }}>
                    {thumb ? (
                      <img src={thumb} alt={av.name} className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <div className="flex flex-col items-center gap-0.5" style={{ display: thumb ? 'none' : 'flex' }}>
                      <span className="text-xl">👤</span>
                      <span className="text-[7px] text-white/20">no preview</span>
                    </div>
                    {/* Starter badge */}
                    {av.isStarter && (
                      <div className="absolute top-1 right-1 bg-yellow-500 text-black px-1 py-0.5 rounded text-[7px] font-black">⭐</div>
                    )}
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-[9px] font-black text-white/70 truncate">{av.name}</p>
                    {gender && (
                      <span className="text-[7px] font-bold capitalize"
                        style={{ color: gender === 'feminine' ? '#ec4899' : '#00D4FF', opacity: 0.8 }}>
                        {gender === 'feminine' ? '♀' : '♂'} {gender}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}