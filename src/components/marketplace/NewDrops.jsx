import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Timer, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DROPS = [
  {
    id: 'd1',
    name: 'Neon Genesis Drop 001',
    collection: 'Genesis Origins',
    edition: '888 pieces',
    price: '0.888 ETH',
    endsIn: '2h 14m',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600',
    tag: 'LIVE',
    tagColor: '#FF3366',
  },
  {
    id: 'd2',
    name: 'Cyber Chrome Jacket',
    collection: 'Digital Wearables',
    edition: '250 pieces',
    price: '0.45 ETH',
    endsIn: '23h 45m',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
    tag: 'NEW',
    tagColor: '#00D4FF',
  },
  {
    id: 'd3',
    name: 'Astro Helmet Series',
    collection: 'Astro Explorers',
    edition: '500 pieces',
    price: '1.2 ETH',
    endsIn: '6h 30m',
    image: 'https://images.unsplash.com/photo-1617791160588-241658c0f566?w=600',
    tag: 'HOT',
    tagColor: '#FFD700',
  },
];

export default function NewDrops() {
  return (
    <section className="px-6 md:px-12 py-12 border-t border-white/8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#FF3366] font-bold mb-1">Limited Time</p>
            <h2 className="text-2xl font-black text-white">New Drops</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DROPS.map((drop, i) => (
            <motion.div
              key={drop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="rounded-2xl overflow-hidden border border-white/8 hover:border-white/20 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={drop.image} alt={drop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-black tracking-widest px-3 py-1 rounded-full"
                      style={{ background: drop.tagColor, color: '#000' }}>
                      {drop.tag}
                    </span>
                  </div>

                  {/* Timer */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white text-xs bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Timer className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    <span>{drop.endsIn} left</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="text-[11px] text-white/40 uppercase tracking-widest mb-1">{drop.collection}</p>
                  <h3 className="font-bold text-white mb-3 leading-tight">{drop.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/40 mb-0.5">Edition</p>
                      <p className="text-xs text-white/70">{drop.edition}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/40 mb-0.5">Price</p>
                      <p className="font-bold text-white">{drop.price}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}