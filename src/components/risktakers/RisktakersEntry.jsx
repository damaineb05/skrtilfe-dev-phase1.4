import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function RisktakersEntry({ onEnter }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-[9990]"
      style={{ background: '#050505' }}
    >
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '200px'
        }}
      />

      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(180,150,80,0.06) 0%, transparent 70%)' }}
      />

      <AnimatePresenceWrapper ready={ready}>
        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 flex flex-col items-center"
        >
          <img
            src="https://media.base44.com/images/public/68bc2773ba0ba8d2da222a27/d210c1fef_WHITELOGO.png"
            alt="SKRTLIFE"
            className="w-16 h-auto mb-8 opacity-60"
          />
          <div className="flex gap-1.5 mb-1">
            {['#B8960C','#B8960C','#B8960C'].map((c, i) => (
              <motion.span
                key={i}
                className="w-1 h-1 rounded-full"
                style={{ background: c }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.4] }}
                transition={{ delay: 0.5 + i * 0.15, duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
              />
            ))}
          </div>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-center font-black tracking-tighter mb-4"
          style={{
            fontSize: 'clamp(52px, 14vw, 88px)',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: '#fff',
          }}
        >
          Risktakers.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 px-8"
          style={{
            fontSize: 'clamp(14px, 3.5vw, 18px)',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.02em',
            maxWidth: 320,
          }}
        >
          Become who you decide to be.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          onClick={onEnter}
          whileTap={{ scale: 0.96 }}
          className="px-12 py-4 rounded-full font-bold uppercase tracking-[0.18em] text-sm transition-all"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: '#fff',
            backdropFilter: 'blur(12px)',
            letterSpacing: '0.18em',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        >
          Enter
        </motion.button>

        {/* Bottom signature */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-10 text-[10px] uppercase tracking-[0.3em]"
          style={{ color: 'rgba(255,255,255,0.15)' }}
        >
          SKRTLIFE Digital Society
        </motion.p>
      </AnimatePresenceWrapper>
    </div>
  );
}

function AnimatePresenceWrapper({ ready, children }) {
  if (!ready) return null;
  return <>{children}</>;
}