import React from 'react';
import { motion } from 'framer-motion';

export default function RisktakersLuxuryScene() {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden" style={{ background: '#060606' }}>
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=80"
          alt="Urban scene"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.3) saturate(0.7)' }}
          loading="lazy"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, #060606 40%, rgba(6,6,6,0.2) 70%, transparent 100%)'
        }} />
        {/* Gold tint */}
        <div className="absolute inset-0" style={{ background: 'rgba(100,80,20,0.08)' }} />
      </div>

      {/* Horizontal rule accent */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-1/3 left-0 right-0 h-px origin-left"
        style={{ background: 'linear-gradient(to right, transparent, rgba(180,150,80,0.4), transparent)' }}
      />

      {/* Content */}
      <div className="relative z-10 px-6 pb-20 pt-32 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 max-w-[40px]" style={{ background: 'rgba(180,150,80,0.5)' }} />
            <p className="text-[10px] uppercase tracking-[0.35em]" style={{ color: 'rgba(180,150,80,0.7)' }}>
              Risktakers Drop
            </p>
          </div>

          <h2
            className="font-black mb-6"
            style={{
              fontSize: 'clamp(28px, 7.5vw, 48px)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: '#fff',
            }}
          >
            Not where you start.<br />
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>
              Where you decide<br />to go.
            </span>
          </h2>

          <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.01em' }}>
            Crafted for those who move with purpose. Worn in cities that never stop.
          </p>

          {/* Stats row */}
          <div className="flex gap-8 mt-10">
            {[
              { value: '01', label: 'Collection' },
              { value: 'Ltd', label: 'Edition' },
              { value: '∞', label: 'Identity' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-black text-2xl mb-0.5" style={{ color: '#B8960C', letterSpacing: '-0.03em' }}>{s.value}</div>
                <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}