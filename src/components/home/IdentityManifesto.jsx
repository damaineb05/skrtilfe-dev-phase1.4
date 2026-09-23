/**
 * IdentityManifesto — Phase D
 * Cinematic brand statement section.
 * Full-width atmospheric text reveal — slow, intentional, premium.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';

const LINES = [
  { text: 'Your identity is not a profile.', delay: 0 },
  { text: 'It is an environment you inhabit.', delay: 0.12 },
  { text: 'A space you curate.', delay: 0.24 },
  { text: 'A presence you own.', delay: 0.36 },
];

export default function IdentityManifesto() {
  return (
    <section className="relative overflow-hidden py-28 md:py-40 px-6 md:px-14 lg:px-20"
      style={{ background: '#07070C' }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute w-[600px] h-[600px] rounded-full blur-[160px]"
          style={{ background: 'rgba(0,212,255,0.04)', top: '20%', left: '-10%' }}
          animate={{ opacity: [0.03, 0.07, 0.03], x: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'rgba(255,215,0,0.03)', bottom: '10%', right: '5%' }}
          animate={{ opacity: [0.02, 0.06, 0.02] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 5 }} />
      </div>

      <div className="max-w-screen-xl mx-auto">
        <div className="max-w-3xl">
          {/* Label */}
          <motion.p
            className="text-[9px] tracking-[0.5em] uppercase mb-12 font-medium"
            style={{ color: 'rgba(255,255,255,0.2)' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}>
            The Philosophy
          </motion.p>

          {/* Manifesto lines */}
          <div className="space-y-3 md:space-y-4 mb-14">
            {LINES.map((line, i) => (
              <motion.p key={i}
                className="font-black text-white leading-tight"
                style={{ fontSize: 'clamp(1.6rem, 4.5vw, 3.5rem)', letterSpacing: '-0.025em' }}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: line.delay, ease: [0.22, 1, 0.36, 1] }}>
                {line.text}
              </motion.p>
            ))}
          </div>

          {/* Accent line */}
          <motion.div
            className="mb-12"
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.5 }}
            style={{ transformOrigin: 'left', height: 1, width: 48, background: 'rgba(255,255,255,0.2)' }} />

          {/* Sub body */}
          <motion.p
            className="text-sm font-light leading-loose max-w-lg mb-12"
            style={{ color: 'rgba(255,255,255,0.38)', lineHeight: 1.9 }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}>
            SKRTLIFE is not a store. It is a personal operating system for your creative life — physical, digital, and everything between.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.5 }}>
            <Link to={createPageUrl('About')}
              className="inline-flex items-center gap-2.5 text-[10px] tracking-[0.28em] uppercase font-bold text-white hover:opacity-60 transition-opacity">
              Our Story <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}