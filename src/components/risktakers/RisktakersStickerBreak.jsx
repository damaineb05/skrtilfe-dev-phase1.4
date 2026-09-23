import React from 'react';
import { motion } from 'framer-motion';

export default function RisktakersStickerBreak() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#030303' }}
    >
      {/* Full bleed grain */}
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '180px'
        }}
      />

      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t border-l" style={{ borderColor: 'rgba(180,150,80,0.3)' }} />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r" style={{ borderColor: 'rgba(180,150,80,0.3)' }} />

      {/* Sticker/Brand badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
        whileInView={{ opacity: 1, scale: 1, rotate: -2 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-14"
      >
        {/* Outer ring */}
        <div
          className="w-56 h-56 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(180,150,80,0.25)',
            boxShadow: '0 0 60px rgba(180,150,80,0.08), inset 0 0 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Inner badge */}
          <div
            className="w-44 h-44 rounded-full flex flex-col items-center justify-center text-center"
            style={{
              background: 'rgba(180,150,80,0.06)',
              border: '1px solid rgba(180,150,80,0.2)',
            }}
          >
            <span className="text-[9px] uppercase tracking-[0.35em] mb-2" style={{ color: 'rgba(180,150,80,0.6)' }}>SKRTLIFE</span>
            <span className="font-black text-3xl tracking-tight" style={{ color: '#fff', letterSpacing: '-0.03em' }}>RISK</span>
            <span className="font-black text-3xl tracking-tight" style={{ color: '#B8960C', letterSpacing: '-0.03em' }}>TAKERS</span>
            <span className="text-[9px] uppercase tracking-[0.25em] mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>EST. 2025</span>
          </div>
        </div>

        {/* Rotation ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            border: '1px dashed rgba(180,150,80,0.15)',
            borderRadius: '50%',
          }}
        />
      </motion.div>

      {/* Copy */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="font-black text-center mb-4"
        style={{
          fontSize: 'clamp(40px, 11vw, 72px)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: '#fff',
        }}
      >
        You ready?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-xs uppercase tracking-[0.3em] text-center"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        Scroll to find out
      </motion.p>

      {/* Animated scroll line */}
      <motion.div
        className="absolute bottom-10 w-px h-16"
        style={{ background: 'linear-gradient(to bottom, rgba(180,150,80,0.5), transparent)' }}
        animate={{ scaleY: [1, 0.3, 1], opacity: [1, 0.3, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </section>
  );
}