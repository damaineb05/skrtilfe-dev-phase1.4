/**
 * DripSyncTeaser — Phase D
 * Cinematic DripSync preview — avatar viewport + atmospheric copy.
 * Replaces the old "Digital Identity" split section.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';
import StudioViewport from './StudioViewport';

export default function DripSyncTeaser({ currentUser }) {
  const [hovered, setHovered] = useState(false);

  return (
    <section className="py-24 md:py-32 px-6 md:px-14 lg:px-20" style={{ background: '#0D0D16' }}>
      <div className="max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* Viewport side */}
          <motion.div
            className="relative overflow-hidden order-2 md:order-1"
            style={{ aspectRatio: '1/1', border: '1px solid rgba(255,255,255,0.06)', background: '#0A0A0F' }}
            initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Live badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5"
              style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <motion.div className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
              <span className="text-[8px] tracking-[0.25em] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Studio Viewport</span>
            </div>

            {/* Corner accent on hover */}
            <motion.div className="absolute top-0 left-0 w-8 h-px"
              animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
              style={{ background: '#00D4FF', transformOrigin: 'left' }}
              transition={{ duration: 0.3 }} />
            <motion.div className="absolute top-0 left-0 h-8 w-px"
              animate={{ scaleY: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
              style={{ background: '#00D4FF', transformOrigin: 'top' }}
              transition={{ duration: 0.3 }} />

            <StudioViewport avatarUrl="https://models.readyplayer.me/6994652bd60f01e88f29f6f5.glb" />
          </motion.div>

          {/* Copy side */}
          <motion.div
            className="order-1 md:order-2"
            initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[9px] tracking-[0.45em] uppercase mb-5 font-medium"
              style={{ color: 'rgba(0,212,255,0.7)' }}>
              DripSync Studio
            </p>
            <h2 className="font-black text-white leading-tight mb-6"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', letterSpacing: '-0.025em' }}>
              CREATE YOUR<br />DIGITAL SELF
            </h2>
            <div className="mb-7 h-px w-10" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <p className="text-sm font-light leading-loose mb-10 max-w-sm"
              style={{ color: 'rgba(255,255,255,0.42)', lineHeight: 1.85 }}>
              Build your identity. Wear the collection. Enter the World.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={createPageUrl('DripSync')}
                className="w-full sm:w-auto px-8 text-[10px] font-bold tracking-[0.25em] uppercase text-black bg-white hover:bg-white/90 transition-all inline-flex items-center justify-center"
                style={{ minHeight: 52 }}>
                ENTER DRIPSYNC
              </Link>
              <Link to={createPageUrl('Shop')}
                className="w-full sm:w-auto px-8 text-[10px] font-bold tracking-[0.25em] uppercase transition-all inline-flex items-center justify-center"
                style={{ minHeight: 52, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.03)' }}>
                Shop Collection
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}