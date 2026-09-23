/**
 * CinematicHero — Phase D hero section
 * Full-viewport immersive hero with layered depth, ambient motion,
 * atmospheric copy and premium entry actions.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronDown } from 'lucide-react';

const BRAND_IMAGES = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/ca9d3b1ed_IMG_9553.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/97eeca7ce_IMG_9508.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/9d6eea39f_IMG_9556.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/e538a17c5_IMG_9542.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/beed4a71f_IMG_9557.jpg',
];

export default function CinematicHero({ currentUser }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setImgIdx(i => (i + 1) % BRAND_IMAGES.length), 7000);
    return () => clearInterval(iv);
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ height: '100svh', minHeight: 600, touchAction: 'pan-y' }}>

      {/* ── Layered background ── */}
      <AnimatePresence mode="wait">
        <motion.div key={imgIdx} className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}>
          <img src={BRAND_IMAGES[imgIdx]} alt="" className="w-full h-full object-cover object-top" />
        </motion.div>
      </AnimatePresence>

      {/* Gradient veil — depth layers */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 40%, rgba(10,10,15,0.92) 90%, rgba(10,10,15,1) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 70%, transparent 100%)' }} />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: 'rgba(0,212,255,0.05)', bottom: '5%', left: '-5%' }}
          animate={{ opacity: [0.04, 0.08, 0.04] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'rgba(255,51,102,0.04)', top: '10%', right: '-5%' }}
          animate={{ opacity: [0.03, 0.07, 0.03] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
      </div>

      {/* ── Hero content ── */}
      <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-14 lg:px-20"
        style={{ paddingBottom: 'max(64px, calc(64px + env(safe-area-inset-bottom, 0px)))' }}>
        <div className="max-w-screen-xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 32 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            {/* Pre-label */}
            <p className="text-[9px] tracking-[0.35em] uppercase mb-5 font-medium"
              style={{ color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Personal OS &nbsp;·&nbsp; Digital Identity &nbsp;·&nbsp; SS 2026
            </p>

            {/* Main headline */}
            <h1 className="font-harvest text-white leading-[0.88] mb-6 tracking-tight"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)', letterSpacing: '-0.03em' }}>
              LIVE IN<br />FULL EFFECT
            </h1>

            {/* Divider */}
            <motion.div className="mb-7"
              initial={{ scaleX: 0 }} animate={{ scaleX: entered ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.35)', transformOrigin: 'left' }} />

            {/* Sub copy */}
            <p className="text-sm font-light mb-10 max-w-sm leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>
              Your creative environment. Your digital presence. Your identity space — curated, owned, alive.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={createPageUrl('Dashboard')}
                className="w-full sm:w-auto px-9 text-[10px] font-bold tracking-[0.25em] uppercase text-black bg-white hover:bg-white/90 transition-all duration-300 inline-flex items-center justify-center"
                style={{ minHeight: 52 }}>
                Enter Your OS
              </Link>
              <Link to={createPageUrl('DripSync')}
                className="w-full sm:w-auto px-9 text-[10px] font-bold tracking-[0.25em] uppercase transition-all duration-300 inline-flex items-center justify-center"
                style={{ minHeight: 52, border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.04)' }}>
                Open DripSync
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Image indicators */}
      <div className="absolute bottom-7 right-6 md:right-16 flex gap-1.5 items-center">
        {BRAND_IMAGES.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-700"
            style={{
              width: i === imgIdx ? 18 : 4, height: 4,
              background: i === imgIdx ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.15)',
            }} />
        ))}
      </div>

      {/* Scroll cue — hidden on mobile to avoid overlap with indicators */}
      <motion.div
        animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5">
        <ChevronDown className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
      </motion.div>
    </section>
  );
}