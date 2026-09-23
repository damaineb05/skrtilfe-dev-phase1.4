import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, TrendingUp, TrendingDown, Users, Layers, ChevronLeft, Heart, Eye, Zap, Tag, DollarSign, ArrowUpRight, Activity, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence } from 'framer-motion';

// ── Helpers ──────────────────────────────────────────────────────────────────
const IMAGES = [
  'https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=500',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
  'https://images.unsplash.com/photo-1617791160588-241658c0f566?w=500',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500',
];

const genItems = (collection) =>
  Array.from({ length: 24 }, (_, i) => ({
    id: `${collection.id}_${i}`,
    name: `${collection.name} #${String(i + 1).padStart(4, '0')}`,
    price: parseFloat((Math.random() * 4 + 0.2).toFixed(3)),
    likes: Math.floor(Math.random() * 300),
    views: Math.floor(Math.random() * 1500),
    rarityScore: Math.floor(Math.random() * 100),
    img: IMAGES[i % IMAGES.length],
  }));

const genActivity = () => {
  const types = ['sale', 'listing', 'offer', 'transfer'];
  const TYPE_CONFIG = {
    sale:     { icon: DollarSign, label: 'Sold',     color: '#00D4FF' },
    listing:  { icon: Tag,        label: 'Listed',   color: '#4ADE80' },
    offer:    { icon: Zap,        label: 'Offer',    color: '#A855F7' },
    transfer: { icon: ArrowUpRight, label: 'Transfer', color: '#94A3B8' },
  };
  return Array.from({ length: 20 }, (_, i) => {
    const type = types[i % types.length];
    return {
      id: i,
      type,
      item: `Item #${Math.floor(Math.random() * 9999)}`,
      price: parseFloat((Math.random() * 3 + 0.1).toFixed(3)),
      from: `0x${Math.random().toString(16).slice(2, 8)}`,
      to: `0x${Math.random().toString(16).slice(2, 8)}`,
      ago: `${Math.floor(Math.random() * 59) + 1}m ago`,
      cfg: TYPE_CONFIG[type],
    };
  });
};

// ── Sub-components ────────────────────────────────────────────────────────────
function ItemsTab({ items }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {items.map((item, i) => (
        <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          className="group cursor-pointer">
          <div className="rounded-xl overflow-hidden border border-white/8 hover:border-white/20 transition-all"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="aspect-square overflow-hidden">
              <img src={item.img} alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-3">
              <p className="text-white text-xs font-bold truncate mb-1">{item.name}</p>
              <p className="text-white font-black text-sm">{item.price} <span className="text-[10px] text-[#00D4FF]">ETH</span></p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ActivityTab({ activities }) {
  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
      {activities.map((a) => {
        const Icon = a.cfg.icon;
        return (
          <div key={a.id} className="flex items-center gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/3 transition-colors">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${a.cfg.color}15` }}>
              <Icon className="w-4 h-4" style={{ color: a.cfg.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{a.item}</p>
              <p className="text-white/40 text-xs">{a.cfg.label} · {a.from} → {a.to}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-sm">{a.price} ETH</p>
              <p className="text-white/30 text-xs">{a.ago}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AboutTab({ collection }) {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h3 className="text-lg font-bold text-white mb-3">About this Collection</h3>
        <p className="text-white/50 leading-relaxed">
          {collection.name} is a curated collection of {collection.items?.toLocaleString()} unique digital assets
          living on the Ethereum blockchain. Each piece is algorithmically generated with verifiable on-chain provenance,
          blending digital fashion with cultural identity in the SKRTLIFE universe.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Creator',  value: 'SKRTLIFE Studio' },
          { label: 'Chain',    value: 'Ethereum' },
          { label: 'Standard', value: 'ERC-721' },
          { label: 'Royalties', value: '7.5%' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-white/40 text-xs mb-1">{s.label}</p>
            <p className="text-white font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CollectionDetail() {
  const { state } = useLocation();
  const collection = state?.collection || {
    id: 'genesis-origins',
    name: 'Genesis Origins',
    floor: 2.45,
    volume: 1234,
    change: 12.5,
    items: 10000,
    image: 'https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=800',
    verified: true,
    accent: '#00D4FF',
  };

  const [tab, setTab] = useState('items');
  const [items] = useState(() => genItems(collection));
  const [activities] = useState(() => genActivity());

  const TABS = [
    { id: 'items',    label: 'Items',    count: items.length },
    { id: 'activity', label: 'Activity', count: activities.length },
    { id: 'about',    label: 'About' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      <style>{`.custom-scrollbar::-webkit-scrollbar{width:3px}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:2px}`}</style>

      {/* Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={collection.image} alt={collection.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/40 to-transparent" />

        {/* Back button */}
        <div className="absolute top-6 left-6 md:left-12">
          <Link to="/NFTMarketplace"
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
            <ChevronLeft className="w-4 h-4" />
            Marketplace
          </Link>
        </div>
      </div>

      {/* Collection info */}
      <div className="px-6 md:px-12 -mt-12 relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl md:text-5xl font-black text-white">{collection.name}</h1>
              {collection.verified && (
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
              collection.change >= 0 ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
            }`}>
              {collection.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(collection.change)}% (24h)
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 md:gap-10">
            {[
              { label: 'Floor',   value: `${collection.floor} ETH` },
              { label: 'Volume',  value: `${collection.volume} ETH` },
              { label: 'Items',   value: collection.items?.toLocaleString() },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xl md:text-2xl font-black text-white">{s.value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl border border-white/8 w-fit mb-10"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-white text-black' : 'text-white/50 hover:text-white'
              }`}>
              {t.label}
              {t.count !== undefined && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-black/10 text-black' : 'bg-white/10 text-white/40'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="pb-24">
          {tab === 'items'    && <ItemsTab items={items} />}
          {tab === 'activity' && <ActivityTab activities={activities} />}
          {tab === 'about'    && <AboutTab collection={collection} />}
        </div>
      </div>
    </div>
  );
}