/**
 * DemoPresence — simulates live community activity
 * Shows the 4 default avatars as active participants
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_AVATARS } from '@/lib/defaultAvatars';

const STATUS_CYCLE_MS = 4000;

function usePresenceSimulation() {
  const [statuses, setStatuses] = useState(() =>
    DEFAULT_AVATARS.reduce((acc, av) => {
      acc[av.id] = av.status_options[0];
      return acc;
    }, {})
  );
  const [typing, setTyping] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setStatuses(prev => {
        const next = { ...prev };
        const randomAv = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
        const opts = randomAv.status_options;
        next[randomAv.id] = opts[Math.floor(Math.random() * opts.length)];
        return next;
      });

      // Randomly simulate typing
      const av = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
      setTyping(prev => ({ ...prev, [av.id]: true }));
      setTimeout(() => setTyping(prev => ({ ...prev, [av.id]: false })), 2200);
    }, STATUS_CYCLE_MS);
    return () => clearInterval(interval);
  }, []);

  return { statuses, typing };
}

export function DemoPresenceBar({ className = '' }) {
  const { statuses, typing } = usePresenceSimulation();

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {DEFAULT_AVATARS.map((av) => (
        <motion.div
          key={av.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: DEFAULT_AVATARS.indexOf(av) * 0.1 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="relative">
            <img src={av.portrait} alt={av.name} className="w-6 h-6 rounded-full object-cover" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black"
              style={{ background: '#4ade80' }} />
          </div>
          <span className="text-[10px] font-medium text-white">{av.name}</span>
          <AnimatePresence mode="wait">
            {typing[av.id] ? (
              <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-0.5">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1 h-1 rounded-full bg-white/40"
                    animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, delay: i * 0.12, duration: 0.6 }} />
                ))}
              </motion.div>
            ) : (
              <motion.span key={statuses[av.id]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {statuses[av.id]}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

export function DemoPresenceCards({ className = '' }) {
  const { statuses, typing } = usePresenceSimulation();

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
      {DEFAULT_AVATARS.map((av, i) => (
        <motion.div
          key={av.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl"
          style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="relative" style={{ aspectRatio: '3/4' }}>
            <img src={av.image} alt={av.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)' }} />

            {/* Live dot */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">Live</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-sm font-bold text-white leading-tight">{av.name}</p>
              <p className="text-[9px] font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{av.role}</p>

              <AnimatePresence mode="wait">
                {typing[av.id] ? (
                  <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50"
                        animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, delay: i * 0.12, duration: 0.6 }} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.p key={statuses[av.id]} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-[9px] font-medium" style={{ color: av.badge_color }}>
                    {statuses[av.id]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function DemoPresence({ variant = 'bar', className = '' }) {
  if (variant === 'cards') return <DemoPresenceCards className={className} />;
  return <DemoPresenceBar className={className} />;
}