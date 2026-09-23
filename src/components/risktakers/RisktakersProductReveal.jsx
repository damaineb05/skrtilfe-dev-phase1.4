import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PRODUCTS = [
  {
    id: 1,
    title: 'Risktakers Hoodie',
    sub: 'Built for movement. Made for decision.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=90',
    accent: 'rgba(180,150,80,0.15)',
  },
  {
    id: 2,
    title: 'Risktakers Tee',
    sub: 'Stripped back. Stepped forward.',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=90',
    accent: 'rgba(255,255,255,0.05)',
  },
];

export default function RisktakersProductReveal({ onTryOn }) {
  const [current, setCurrent] = useState(0);
  const product = PRODUCTS[current];

  return (
    <section className="relative min-h-screen flex flex-col" style={{ background: '#080808' }}>
      {/* Hero image — full bleed */}
      <div className="absolute inset-0">
        <motion.img
          key={product.id}
          src={product.image}
          alt={product.title}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.45)' }}
        />
        {/* Bottom gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #080808 30%, transparent 70%)' }} />
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to bottom, #080808 0%, transparent 100%)' }} />
        {/* Accent glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: product.accent }} />
      </div>

      {/* Product dots nav */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {PRODUCTS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all"
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              background: i === current ? '#B8960C' : 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mt-auto pb-12 px-6">
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: 'rgba(180,150,80,0.8)' }}>
            Season Drop
          </p>
          <h2
            className="font-black mb-2"
            style={{ fontSize: 'clamp(32px, 8vw, 52px)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
          >
            {product.title}
          </h2>
          <p className="mb-8 text-sm" style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.01em' }}>
            {product.sub}
          </p>

          <div className="flex gap-3">
            <Link
              to={createPageUrl('Shop')}
              className="flex-1 py-3.5 text-center rounded-xl text-sm font-bold uppercase tracking-[0.12em] transition-all"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: '#fff',
                backdropFilter: 'blur(16px)',
              }}
            >
              View Piece
            </Link>
            <button
              onClick={onTryOn}
              className="flex-1 py-3.5 rounded-xl text-sm font-bold uppercase tracking-[0.12em] transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(180,150,80,0.9), rgba(140,110,50,0.9))',
                border: '1px solid rgba(180,150,80,0.4)',
                color: '#000',
              }}
            >
              Try On
            </button>
          </div>
        </motion.div>
      </div>

      {/* Swipe hint */}
      <div className="relative z-10 pb-6 flex justify-center">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-[10px] uppercase tracking-[0.25em] flex flex-col items-center gap-2"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <span>Scroll</span>
          <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }} />
        </motion.div>
      </div>
    </section>
  );
}