import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Check, ChevronRight } from 'lucide-react';

const COLLECTIONS = [
  { id: 'genesis-origins',   name: 'Genesis Origins',    floor: 2.45, volume: 1234, change: 12.5,  items: 10000, image: 'https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=400', verified: true,  accent: '#00D4FF' },
  { id: 'cyber-avatars',     name: 'Cyber Avatars',      floor: 0.89, volume: 567,  change: -3.2,  items: 5000,  image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', verified: true,  accent: '#FF3366' },
  { id: 'digital-wearables', name: 'Digital Wearables',  floor: 0.45, volume: 234,  change: 8.7,   items: 8500,  image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', verified: false, accent: '#FFD700' },
  { id: 'astro-explorers',   name: 'Astro Explorers',    floor: 1.23, volume: 890,  change: 15.3,  items: 3000,  image: 'https://images.unsplash.com/photo-1617791160588-241658c0f566?w=400', verified: true,  accent: '#A855F7' },
];

export default function TrendingCollections({ onSelectCollection }) {
  return (
    <section className="px-6 md:px-12 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#00D4FF] font-bold mb-1">On Fire</p>
            <h2 className="text-2xl font-black text-white">Trending Collections</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLLECTIONS.map((col, i) => (
            <motion.button
              key={col.id}
              onClick={() => onSelectCollection(col)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4 }}
              className="text-left group"
            >
              <div className="rounded-2xl overflow-hidden border border-white/8 hover:border-white/20 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                {/* Banner */}
                <div className="relative h-32 overflow-hidden">
                  <img src={col.image} alt={col.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  {/* Change badge */}
                  <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                    col.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {col.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(col.change)}%
                  </div>
                  {/* Rank */}
                  <div className="absolute bottom-3 left-3 text-white/80 text-xs font-mono">#{i + 1}</div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-bold text-white text-sm truncate">{col.name}</h3>
                    {col.verified && (
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-white/40 mb-0.5">Floor</p>
                      <p className="text-white font-bold">{col.floor} ETH</p>
                    </div>
                    <div>
                      <p className="text-white/40 mb-0.5">Volume</p>
                      <p className="text-white font-bold">{col.volume} ETH</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

export { COLLECTIONS };