import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Code, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const BRAND_IMAGES = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/ca9d3b1ed_IMG_9553.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/97eeca7ce_IMG_9508.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/9d6eea39f_IMG_9556.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/b06595e26_IMG_9493.jpg',
];

const VALUES = [
  { icon: Users, title: 'Community First', description: 'Built by and for the culture. Every decision serves the community that moves us forward.' },
  { icon: Code, title: 'Interoperability', description: 'Open standards, digital ownership, and assets that travel with you across every world.' },
  { icon: ShoppingBag, title: 'Quality Craft', description: 'From fabric weight to pixel depth — we obsess over every detail in every medium.' },
];

const TEAM = [
  { name: "Alex 'Skrt'", role: 'Founder & Visionary', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=880&auto=format&fit=crop' },
  { name: "Jane 'Pixel'", role: 'Lead 3D Artist', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=761&auto=format&fit=crop' },
  { name: "Mike 'Chain'", role: 'Blockchain Dev', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=687&auto=format&fit=crop' },
  { name: "Sarah 'Connect'", role: 'Community Manager', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=687&auto=format&fit=crop' },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }
});

export default function About() {
  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden flex flex-col justify-end pb-24 pt-32" style={{ minHeight: '70vh' }}>
        {/* Bg image */}
        <div className="absolute inset-0">
          <img src={BRAND_IMAGES[0]} alt="" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(10,10,15,1) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
        </div>

        <div className="relative z-10 px-8 lg:px-16 max-w-screen-xl mx-auto w-full">
          <motion.div {...fade(0.1)}>
            <p className="text-[9px] tracking-[0.4em] uppercase mb-5 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
              About the Society
            </p>
            <h1 className="font-black text-white leading-none tracking-tight mb-6"
              style={{ fontSize: 'clamp(3rem, 9vw, 6rem)', letterSpacing: '-0.025em' }}>
              BUILDING THE<br />FUTURE OF<br />DIGITAL IDENTITY
            </h1>
            <div className="w-10 h-px mb-6" style={{ background: 'rgba(255,255,255,0.35)' }} />
            <p className="text-sm font-light max-w-md" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>
              Skrtlife is a digital society where streetwear, culture, and self-expression converge across physical and virtual worlds.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="py-28 px-8 lg:px-16 max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fade(0)} className="overflow-hidden" style={{ aspectRatio: '4/5' }}>
            <img src={BRAND_IMAGES[1]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </motion.div>
          <motion.div {...fade(0.1)}>
            <p className="text-[9px] tracking-[0.4em] uppercase mb-6 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Our Mission</p>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-none mb-8 tracking-tight" style={{ letterSpacing: '-0.025em' }}>
              BRIDGING<br />REALITIES
            </h2>
            <div className="w-10 h-px mb-8" style={{ background: 'rgba(255,255,255,0.25)' }} />
            <p className="text-sm font-light leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
              We bridge the gap between physical and digital ownership. High-quality apparel and interoperable digital assets — giving you true ownership and a persistent identity across every world.
            </p>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Your style is not confined to one reality. Your assets, your identity, your control.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-24 px-8 lg:px-16" style={{ background: '#0D0D14' }}>
        <div className="max-w-screen-xl mx-auto">
          <motion.div {...fade()} className="mb-16">
            <p className="text-[9px] tracking-[0.4em] uppercase mb-4 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Core Values</p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight" style={{ letterSpacing: '-0.025em' }}>What Drives Us</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {VALUES.map((v, i) => (
              <motion.div key={i} {...fade(i * 0.1)} className="p-10" style={{ background: '#0D0D14' }}>
                <v.icon className="w-6 h-6 mb-8" style={{ color: 'rgba(255,255,255,0.4)' }} />
                <h3 className="text-lg font-bold text-white mb-4 tracking-tight">{v.title}</h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTO STRIP ── */}
      <section className="py-24">
        <div className="max-w-screen-xl mx-auto px-8 lg:px-16 mb-16">
          <p className="text-[9px] tracking-[0.4em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>The Look</p>
          <h2 className="text-4xl font-black text-white tracking-tight" style={{ letterSpacing: '-0.025em' }}>Campaign Images</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {BRAND_IMAGES.map((img, i) => (
            <motion.div key={i} {...fade(i * 0.05)} className="overflow-hidden" style={{ aspectRatio: '2/3' }}>
              <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-24 px-8 lg:px-16" style={{ background: '#0D0D14' }}>
        <div className="max-w-screen-xl mx-auto">
          <motion.div {...fade()} className="mb-16">
            <p className="text-[9px] tracking-[0.4em] uppercase mb-4 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>The Team</p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight" style={{ letterSpacing: '-0.025em' }}>Meet the Architects</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TEAM.map((member, i) => (
              <motion.div key={i} {...fade(i * 0.08)} className="group">
                <div className="overflow-hidden mb-5" style={{ aspectRatio: '3/4' }}>
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{member.name}</h4>
                <p className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-8 lg:px-16">
        <div className="max-w-screen-xl mx-auto text-center">
          <motion.div {...fade()}>
            <p className="text-[9px] tracking-[0.4em] uppercase mb-6 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Join Us</p>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-none mb-10 tracking-tight" style={{ letterSpacing: '-0.03em' }}>
              THE MOVEMENT
            </h2>
            <p className="text-sm font-light mb-14 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>
              Become part of a society shaping the future of digital culture. First to know. First to move.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://discord.gg/skrtlife" target="_blank" rel="noopener noreferrer"
                className="px-10 py-4 text-xs font-bold tracking-[0.25em] uppercase text-black bg-white hover:bg-white/90 transition-all">
                Join Discord
              </a>
              <Link to={createPageUrl('Shop')}
                className="px-10 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-all inline-flex items-center gap-2"
                style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}>
                Shop Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}