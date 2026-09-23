/**
 * EcosystemPreview — Phase D
 * Cinematic glimpses of each ecosystem node:
 * DripSync, Dashboard OS, Studio, Assets, Community, Marketplace
 * Displayed as immersive atmospheric cards — not SaaS tiles.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';

const NODES = [
  {
    id: 'dripsync',
    label: 'DripSync Studio',
    headline: 'Dress Your Digital Self',
    sub: 'An immersive 3D avatar environment. Wear your identity. Layer it. Own it.',
    accent: '#00D4FF',
    href: 'DripSync',
    img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/ca9d3b1ed_IMG_9553.jpg',
    span: 'col-span-2 md:col-span-2',
    tall: true,
  },
  {
    id: 'dashboard',
    label: 'Personal OS',
    headline: 'Your Creative HQ',
    sub: 'A floating panel workspace built around your creative rhythm.',
    accent: '#FFD700',
    href: 'Dashboard',
    img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/97eeca7ce_IMG_9508.jpg',
    span: 'col-span-2 md:col-span-1',
  },
  {
    id: 'community',
    label: 'Community',
    headline: 'Curated Interaction',
    sub: 'Culture-first connection. Algorithm-free. Identity-led.',
    accent: '#FF3366',
    href: 'Community',
    img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/9d6eea39f_IMG_9556.jpg',
    span: 'col-span-2 md:col-span-1',
  },
  {
    id: 'shop',
    label: 'Physical Collection',
    headline: 'Limited. Premium. Yours.',
    sub: 'Heavyweight streetwear built to define — not follow — the moment.',
    accent: '#FFFFFF',
    href: 'Shop',
    img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/e538a17c5_IMG_9542.jpg',
    span: 'col-span-2 md:col-span-1',
  },
  {
    id: 'genesis',
    label: 'Genesis Pass',
    headline: 'Founding Access',
    sub: 'Unlock the complete ecosystem. One pass. Lifetime presence.',
    accent: '#FFD700',
    href: 'Genesis',
    img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/beed4a71f_IMG_9557.jpg',
    span: 'col-span-2 md:col-span-1',
  },
];

function NodeCard({ node, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={`relative overflow-hidden ${node.span} group cursor-pointer`}
      style={{
        aspectRatio: node.tall ? '16/10' : '4/3',
        minHeight: node.tall ? 340 : 240,
        background: '#0D0D16',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* BG image */}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: hovered ? 1.06 : 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={node.img} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
      </motion.div>

      {/* Veil */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.58)' }} />
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ background: `radial-gradient(circle at 30% 80%, ${node.accent}18 0%, transparent 65%)` }}
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)' }} />

      {/* Accent top-border */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ background: `linear-gradient(90deg, transparent, ${node.accent}60, transparent)` }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
        <p className="text-[9px] tracking-[0.4em] uppercase mb-2 font-medium"
          style={{ color: `${node.accent}99` }}>
          {node.label}
        </p>
        <h3 className="text-xl md:text-2xl font-black text-white leading-tight mb-2"
          style={{ letterSpacing: '-0.02em' }}>
          {node.headline}
        </h3>
        <motion.p
          className="text-xs font-light leading-relaxed mb-4 max-w-xs"
          style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}
          animate={{ opacity: hovered ? 1 : 0.7, y: hovered ? 0 : 4 }}
          transition={{ duration: 0.35 }}
        >
          {node.sub}
        </motion.p>
        <Link to={createPageUrl(node.href)}
          onClick={e => e.stopPropagation()}
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase font-bold transition-opacity hover:opacity-60"
          style={{ color: node.accent === '#FFFFFF' ? 'rgba(255,255,255,0.8)' : node.accent }}>
          <motion.span animate={{ x: hovered ? 3 : 0 }} transition={{ duration: 0.2 }}>
            Explore
          </motion.span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function EcosystemPreview() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-14 lg:px-20" style={{ background: '#0A0A0F' }}>
      <div className="max-w-screen-xl mx-auto">

        {/* Section header */}
        <motion.div
          className="mb-14 md:mb-16"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <p className="text-[9px] tracking-[0.45em] uppercase mb-4 font-medium"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            The Ecosystem
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight max-w-lg"
            style={{ letterSpacing: '-0.03em' }}>
            ONE SPACE.<br />
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>EVERY DIMENSION.</span>
          </h2>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {NODES.map((node, i) => (
            <NodeCard key={node.id} node={node} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}