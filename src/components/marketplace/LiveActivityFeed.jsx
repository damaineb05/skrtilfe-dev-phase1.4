import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Tag, Zap, Sparkles, ArrowUpRight, Activity } from 'lucide-react';

const SEED_ACTIVITY = [
  { id: 1, type: 'sale',     item: 'Genesis #1234',        price: 2.45,  from: '0x12…78', to: '0xab…gh', ts: Date.now() - 120000 },
  { id: 2, type: 'listing',  item: 'Cyber Avatar #567',    price: 1.20,  from: '0x98…32', ts: Date.now() - 300000 },
  { id: 3, type: 'offer',    item: 'Wearable #890',        price: 0.80,  from: '0xde…34', ts: Date.now() - 480000 },
  { id: 4, type: 'sale',     item: 'Genesis #5678',        price: 3.10,  from: '0xaa…bb', to: '0xcc…dd', ts: Date.now() - 900000 },
  { id: 5, type: 'mint',     item: 'New Drop #001',        price: 0.50,  to: '0x11…22',   ts: Date.now() - 1200000 },
  { id: 6, type: 'listing',  item: 'Astro Helmet #32',     price: 1.80,  from: '0x55…66', ts: Date.now() - 1500000 },
  { id: 7, type: 'sale',     item: 'Cyber Chrome Jacket',  price: 0.65,  from: '0x77…88', to: '0x99…00', ts: Date.now() - 2400000 },
];

const TYPE_CONFIG = {
  sale:    { icon: DollarSign, label: 'Sold',    color: '#00D4FF', bg: 'rgba(0,212,255,0.1)' },
  listing: { icon: Tag,        label: 'Listed',  color: '#4ADE80', bg: 'rgba(74,222,128,0.1)' },
  offer:   { icon: Zap,        label: 'Offer',   color: '#A855F7', bg: 'rgba(168,85,247,0.1)' },
  mint:    { icon: Sparkles,   label: 'Minted',  color: '#FFD700', bg: 'rgba(255,215,0,0.1)' },
  transfer:{ icon: ArrowUpRight, label: 'Transfer', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' },
};

const timeAgo = (ts) => {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
};

export default function LiveActivityFeed() {
  const [items, setItems] = useState(SEED_ACTIVITY);

  // Simulate live events
  useEffect(() => {
    const timer = setInterval(() => {
      const types = ['sale', 'listing', 'offer'];
      const names = ['Genesis #' + Math.floor(Math.random() * 9999), 'Cyber Avatar #' + Math.floor(Math.random() * 999), 'Wearable #' + Math.floor(Math.random() * 999)];
      const newItem = {
        id: Date.now(),
        type: types[Math.floor(Math.random() * types.length)],
        item: names[Math.floor(Math.random() * names.length)],
        price: parseFloat((Math.random() * 3 + 0.1).toFixed(2)),
        from: `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`,
        ts: Date.now(),
      };
      setItems(prev => [newItem, ...prev].slice(0, 20));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FF3366] animate-pulse" />
          <Activity className="w-4 h-4 text-white/50" />
          <span className="text-sm font-bold text-white">Live Activity</span>
        </div>
        <span className="text-[10px] text-white/30 uppercase tracking-widest">Real-time</span>
      </div>

      {/* Feed */}
      <div className="overflow-y-auto max-h-[480px] custom-scrollbar">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.transfer;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 hover:bg-white/3 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: cfg.bg }}>
                  <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.item}</p>
                  <p className="text-white/40 text-xs">{cfg.label}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {item.price && <p className="text-white text-sm font-bold">{item.price} <span className="text-[10px] text-white/40">ETH</span></p>}
                  <p className="text-white/30 text-xs">{timeAgo(item.ts)} ago</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}