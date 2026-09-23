/**
 * GenesisBar — Phase D
 * Atmospheric full-width Genesis Pass + Community entry bar.
 * Two immersive cards side by side.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Crown, Users } from 'lucide-react';

const CARDS = [
  {
    label: 'Genesis Pass',
    headline: 'FOUNDING\nMEMBER',
    sub: 'Unlock the complete ecosystem — exclusive drops, creator tools, lifetime access.',
    cta: 'Claim Your Pass',
    href: 'Genesis',
    accent: '#FFD700',
    icon: Crown,
    img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/b06595e26_IMG_9493.jpg',
  },
  {
    label: 'Community',
    headline: 'JOIN THE\nSOCIETY',
    sub: 'Connect with creators and collectors. Culture-first. Algorithm-free.',
    cta: 'Enter Community',
    href: 'Community',
    accent: '#FF3366',
    icon: Users,
    img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/beed4a71f_IMG_9557.jpg',
  },
];

export default function GenesisBar() {
  return (
    <section className="py-0 px-6 md:px-14 lg:px-20 pb-24 md:pb-32" style={{ background: '#0A0A0F' }}>
      <div className="max-w-screen-xl mx-auto grid md:grid-cols-2 gap-2 md:gap-3">
        {CARDS.map((card, i) => (
          <motion.div key={card.href}
            className="relative overflow-hidden group"
            style={{
              aspectRatio: '16/8',
              minHeight: 260,
              border: '1px solid rgba(255,255,255,0.06)',
              background: '#0D0D16',
            }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }}>

            {/* BG */}
            <div className="absolute inset-0">
              <img src={card.img} alt="" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]" loading="lazy" />
            </div>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)' }} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(circle at 20% 80%, ${card.accent}14 0%, transparent 60%)` }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 100%)' }} />

            {/* Top accent on hover */}
            <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, transparent, ${card.accent}50, transparent)` }} />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 md:p-10">
              <card.icon className="w-5 h-5 mb-5" style={{ color: `${card.accent}80` }} />
              <p className="text-[9px] tracking-[0.4em] uppercase mb-3 font-medium"
                style={{ color: `${card.accent}80` }}>
                {card.label}
              </p>
              <h3 className="font-black text-white leading-tight mb-3"
                style={{ fontSize: 'clamp(1.4rem, 3vw, 2.5rem)', letterSpacing: '-0.025em', whiteSpace: 'pre-line', overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%' }}>
                {card.headline}
              </h3>
              <p className="text-xs font-light mb-6 max-w-xs"
                style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.75 }}>
                {card.sub}
              </p>
              <Link to={createPageUrl(card.href)}
                className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase font-bold transition-opacity hover:opacity-60"
                style={{ color: card.accent === '#FFFFFF' ? 'rgba(255,255,255,0.8)' : card.accent }}>
                {card.cta} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}