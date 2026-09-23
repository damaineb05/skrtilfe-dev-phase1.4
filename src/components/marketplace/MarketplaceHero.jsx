import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Layers } from 'lucide-react';

const STATS = [
  { label: 'Total Volume', value: '12,456 ETH', icon: TrendingUp, color: '#00D4FF' },
  { label: 'Items Listed',  value: '8,234',      icon: Layers,     color: '#FF3366' },
  { label: 'Live Sales',    value: '1,234',       icon: Zap,        color: '#FFD700' },
];

export default function MarketplaceHero() {
  return (
    <div className="relative overflow-hidden py-16 px-6 md:px-12 border-b border-white/8"
      style={{ background: 'linear-gradient(135deg, #0A0A0F 0%, #0D0D20 60%, #0A0A0F 100%)' }}>
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#00D4FF] font-bold mb-3">SKRTLIFE</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4 leading-none">
            Digital<br />Marketplace
          </h1>
          <p className="text-white/40 text-lg mb-10 max-w-lg">
            Curated digital fashion, collectibles, and wearables from the SKRTLIFE universe.
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-6 md:gap-12">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
              <p className="text-2xl md:text-3xl font-black text-white">{s.value}</p>
              <p className="text-[11px] text-white/40 mt-1 uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}