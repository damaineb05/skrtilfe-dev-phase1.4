import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles } from 'lucide-react';

export default function RisktakersDripSyncEntry({ onTryOn }) {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6"
      style={{ background: '#070710' }}
    >
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,180,255,0.06) 0%, transparent 70%)' }}
      />

      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Avatar silhouette */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-12 w-48 h-64 flex items-center justify-center"
      >
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,180,255,0.12) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        {/* Avatar silhouette SVG */}
        <svg viewBox="0 0 120 200" className="w-full h-full opacity-20" fill="rgba(0,180,255,0.8)">
          <ellipse cx="60" cy="32" rx="22" ry="22" />
          <path d="M20 90 Q60 70 100 90 L95 160 Q60 175 25 160 Z" />
          <rect x="10" y="90" width="20" height="70" rx="10" />
          <rect x="90" y="90" width="20" height="70" rx="10" />
          <rect x="30" y="155" width="20" height="50" rx="8" />
          <rect x="70" y="155" width="20" height="50" rx="8" />
        </svg>

        {/* Scanning line */}
        <motion.div
          className="absolute left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(0,180,255,0.6), transparent)' }}
          animate={{ top: ['10%', '90%', '10%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Text content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <p className="text-[10px] uppercase tracking-[0.35em] mb-4" style={{ color: 'rgba(0,180,255,0.7)' }}>
          DripSync Studio
        </p>

        <h2
          className="font-black mb-3"
          style={{
            fontSize: 'clamp(44px, 12vw, 72px)',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: '#fff',
          }}
        >
          Try it on.
        </h2>

        <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.01em' }}>
          Before you become it.
        </p>

        <div className="flex flex-col gap-3 items-center">
          <Link
            to={createPageUrl('DripSync')}
            className="w-full max-w-xs py-4 rounded-2xl text-sm font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(0,180,255,0.2), rgba(0,100,200,0.3))',
              border: '1px solid rgba(0,180,255,0.3)',
              color: '#fff',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 0 40px rgba(0,180,255,0.12)',
            }}
          >
            <Sparkles className="w-4 h-4" />
            Enter DripSync
          </Link>

          <button
            onClick={onTryOn}
            className="text-xs uppercase tracking-[0.2em] py-2 transition-all"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Quick Try On →
          </button>
        </div>
      </motion.div>

      {/* Bottom decorative line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,180,255,0.2), transparent)' }}
      />
    </section>
  );
}