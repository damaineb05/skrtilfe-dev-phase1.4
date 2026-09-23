import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const heroImages = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/ca9d3b1ed_IMG_9553.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/97eeca7ce_IMG_9508.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/9d6eea39f_IMG_9556.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/4a9e69e2b_IMG_9505.jpg',
];

export default function CyberpunkHero({ products = [], onAddToCart }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = products.length > 0
    ? products.slice(0, 4).map((p, i) => ({ ...p, heroImage: heroImages[i] || p.media?.[0]?.url }))
    : heroImages.map((url, i) => ({ title: 'LIVE IN FULL EFFECT', price: null, heroImage: url, collection: 'SKRTLIFE' }));

  useEffect(() => {
    const interval = setInterval(() => setActiveIndex(prev => (prev + 1) % slides.length), 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const current = slides[activeIndex];
  const prev = () => setActiveIndex(i => i === 0 ? slides.length - 1 : i - 1);
  const next = () => setActiveIndex(i => (i + 1) % slides.length);

  return (
    <section className="relative overflow-hidden bg-black" style={{ height: '92vh', minHeight: 600 }}>

      {/* Background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={current.heroImage}
            alt={current.title}
            className="w-full h-full object-cover object-top"
          />
          {/* Luxury gradient overlay — heavy at bottom, subtle at top */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 75%, rgba(0,0,0,0.97) 100%)'
          }} />
          {/* Left vignette */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 50%)'
          }} />
        </motion.div>
      </AnimatePresence>

      {/* Top strip — collection label */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 lg:px-16 pt-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-white opacity-60" />
          <span className="text-[10px] tracking-[0.35em] uppercase font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {current.collection || 'SKRTLIFE'} — SS26
          </span>
        </div>
        <span className="text-[10px] tracking-[0.35em] uppercase font-medium hidden md:block" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-20 px-8 lg:px-16 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            {/* Pre-label */}
            <p className="text-[10px] tracking-[0.4em] uppercase mb-5 font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
              New Arrival
            </p>

            {/* Title */}
            <h1 className="font-black leading-[0.9] tracking-tight mb-6 text-white"
              style={{ fontSize: 'clamp(3rem, 9vw, 6.5rem)', letterSpacing: '-0.02em' }}>
              {current.title || 'LIVE IN FULL EFFECT'}
            </h1>

            {/* Divider line */}
            <div className="w-12 h-px mb-6" style={{ background: 'rgba(255,255,255,0.4)' }} />

            {/* Description */}
            <p className="text-sm leading-relaxed mb-8 max-w-sm font-light" style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.02em' }}>
              Engineered for those who move at the edge of culture. Limited edition. Uncompromising quality.
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to={createPageUrl('Shop')}
                className="inline-block px-9 py-4 text-xs font-bold tracking-[0.2em] uppercase text-black transition-all duration-300 hover:opacity-90"
                style={{ background: '#FFFFFF' }}
              >
                Shop Now
              </Link>

              {current.price && (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>From</span>
                  <span className="text-2xl font-bold text-white">${current.price}</span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation — bottom right */}
      <div className="absolute bottom-8 right-8 lg:right-16 z-20 flex items-center gap-3">
        <button onClick={prev}
          className="w-10 h-10 flex items-center justify-center border transition-all duration-200 hover:bg-white hover:text-black"
          style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}>
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setActiveIndex(i)}
              className="transition-all duration-300"
              style={{
                height: '1px',
                width: i === activeIndex ? '28px' : '10px',
                background: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>

        <button onClick={next}
          className="w-10 h-10 flex items-center justify-center border transition-all duration-200 hover:bg-white hover:text-black"
          style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Vertical side label — desktop only */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden xl:flex flex-col items-center gap-3">
        <div className="w-px h-16" style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))' }} />
        <span className="text-[9px] tracking-[0.45em] uppercase font-medium"
          style={{ color: 'rgba(255,255,255,0.35)', writingMode: 'vertical-rl' }}>
          Digital Society
        </span>
        <div className="w-px h-16" style={{ background: 'linear-gradient(to top, transparent, rgba(255,255,255,0.3))' }} />
      </div>
    </section>
  );
}