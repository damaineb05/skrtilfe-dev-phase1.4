/**
 * CinematicEntry — Phase D entry gate
 * Full-screen immersive entry with ambient particle field,
 * layered depth, cycling visuals, and premium two-action CTA.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BRAND_IMAGES = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/ca9d3b1ed_IMG_9553.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/97eeca7ce_IMG_9508.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/9d6eea39f_IMG_9556.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/e538a17c5_IMG_9542.jpg',
];

// Floating ambient orbs — pure CSS, zero JS per frame
function AmbientField() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Static glow orbs */}
      <div className="absolute top-[15%] left-[8%] w-[420px] h-[420px] rounded-full blur-[120px] opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, #00D4FF 0%, transparent 70%)' }} />
      <div className="absolute bottom-[10%] right-[5%] w-[360px] h-[360px] rounded-full blur-[100px] opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, #FF3366 0%, transparent 70%)' }} />
      <div className="absolute top-[55%] left-[50%] w-[300px] h-[300px] rounded-full blur-[90px] opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)' }} />

      {/* Animated orbs */}
      <motion.div
        className="absolute w-[180px] h-[180px] rounded-full blur-[60px]"
        style={{ background: 'rgba(0,212,255,0.12)', top: '30%', left: '20%' }}
        animate={{ x: [0, 30, -10, 0], y: [0, -20, 15, 0], opacity: [0.08, 0.14, 0.06, 0.08] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[140px] h-[140px] rounded-full blur-[50px]"
        style={{ background: 'rgba(255,51,102,0.10)', top: '60%', right: '25%' }}
        animate={{ x: [0, -25, 15, 0], y: [0, 18, -12, 0], opacity: [0.06, 0.12, 0.05, 0.06] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Scanline texture */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)', backgroundSize: '100% 3px' }} />
    </div>
  );
}

export default function CinematicEntry({ onEnter, currentUser }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle → entering → done
  const [showSub, setShowSub] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowSub(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setImgIdx(i => (i + 1) % BRAND_IMAGES.length), 6000);
    return () => clearInterval(iv);
  }, []);

  const handleEnter = (mode) => {
    setPhase('entering');
    setTimeout(() => { setPhase('done'); onEnter(mode); }, 900);
  };

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden flex flex-col items-center justify-center"
      style={{ background: '#030305', zIndex: 100, touchAction: 'none' }}
      initial={{ opacity: 1, scale: 1 }}
      animate={phase === 'entering' ? { opacity: 0, scale: 1.04 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Cycling background */}
      <AnimatePresence mode="wait">
        <motion.div key={imgIdx} className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}>
          <img src={BRAND_IMAGES[imgIdx]} alt="" className="w-full h-full object-cover object-top" />
        </motion.div>
      </AnimatePresence>

      {/* Veil layers */}
      <div className="absolute inset-0" style={{ background: 'rgba(3,3,5,0.72)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(3,3,5,0.5) 0%, rgba(3,3,5,0.3) 40%, rgba(3,3,5,0.85) 85%, rgba(3,3,5,1) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(3,3,5,0.6) 0%, transparent 60%)' }} />

      <AmbientField />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
        {/* Tri-dot mark */}
        <motion.div
          className="flex items-center gap-3 mb-12"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}>
          <motion.span className="w-2 h-2 rounded-full" style={{ background: '#FF3366' }}
            animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 0 }} />
          <motion.span className="w-2 h-2 rounded-full" style={{ background: '#00D4FF' }}
            animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 0.6 }} />
          <motion.span className="w-2 h-2 rounded-full" style={{ background: '#FFD700' }}
            animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 1.2 }} />
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          className="font-harvest text-white leading-none tracking-tighter mb-3"
          style={{ fontSize: 'clamp(5rem, 20vw, 11rem)', letterSpacing: '-0.04em' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35 }}>
          SKRTLIFE
        </motion.h1>

        {/* Tagline */}
        <AnimatePresence>
          {showSub && (
            <motion.p
              className="text-[9px] md:text-[10px] tracking-[0.45em] uppercase font-light mb-12"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}>
              Personal OS &nbsp;·&nbsp; Digital Identity &nbsp;·&nbsp; SS 2026
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTAs */}
        <AnimatePresence>
          {showSub && (
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-sm"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}>
              <motion.button
                onClick={() => handleEnter('connect')}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                className="w-full sm:flex-1 text-[10px] font-bold tracking-[0.3em] uppercase text-black bg-white hover:bg-white/90 transition-colors"
                style={{ minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Connect Identity
              </motion.button>
              <motion.button
                onClick={() => handleEnter('guest')}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                className="w-full sm:flex-1 text-[10px] font-bold tracking-[0.3em] uppercase transition-colors"
                style={{ minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.04)' }}
              >
                Enter as Guest
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom micro-label */}
        <motion.p className="mt-10 text-[9px] tracking-[0.3em] uppercase"
          style={{ color: 'rgba(255,255,255,0.15)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }}>
          High-end Streetwear &nbsp;×&nbsp; Creative Environment
        </motion.p>
      </div>

      {/* Bottom image indicators */}
      <div className="absolute left-0 right-0 flex justify-center gap-1.5"
        style={{ bottom: 'max(32px, calc(16px + env(safe-area-inset-bottom, 16px)))' }}>
        {BRAND_IMAGES.map((_, i) => (
          <motion.div key={i}
            className="rounded-full transition-all duration-700"
            style={{
              width: i === imgIdx ? 20 : 4,
              height: 4,
              background: i === imgIdx ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
            }} />
        ))}
      </div>
    </motion.div>
  );
}