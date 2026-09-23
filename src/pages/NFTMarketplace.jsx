import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, Filter, Loader2, Star, TrendingUp, Grid3X3, LayoutList } from 'lucide-react';

const CATEGORIES = ['all', 'utility', 'fashion', 'art', 'collectible'];
const CURRENCIES = ['all', 'ETH', 'USDC', 'MATIC'];

function NFTCard({ nft, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group rounded-2xl overflow-hidden cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="relative aspect-square overflow-hidden bg-white/5">
        <img
          src={nft.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&h=500&fit=crop'}
          alt={nft.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {nft.is_featured && (
          <div className="absolute top-2.5 left-2.5">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)' }}>
              <Star className="w-2.5 h-2.5 fill-current" /> Featured
            </span>
          </div>
        )}
        {nft.status === 'listed' && (
          <div className="absolute top-2.5 right-2.5">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(0,212,255,0.15)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)' }}>
              Listed
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{nft.name || 'Untitled'}</p>
            {nft.collection_name && (
              <p className="text-white/40 text-xs truncate">{nft.collection_name}</p>
            )}
          </div>
          {nft.rarity_rank && (
            <span className="text-[9px] text-white/40 shrink-0">#{nft.rarity_rank}</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>
            {nft.category || 'NFT'}
          </span>
          {nft.price && (
            <div className="text-right">
              <p className="text-sm font-black" style={{ color: '#00D4FF' }}>
                {nft.price} <span className="text-xs font-normal text-white/40">{nft.currency || 'ETH'}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function NFTMarketplace() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [currency, setCurrency] = useState('all');
  const [view, setView] = useState('grid');
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: nfts = [], isLoading } = useQuery({
    queryKey: ['nft-marketplace'],
    queryFn: () => base44.entities.NFT.list('-created_date', 100),
  });

  const filtered = nfts.filter(n => {
    const matchSearch = !search || n.name?.toLowerCase().includes(search.toLowerCase()) || n.collection_name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || n.category === category;
    const matchCurr = currency === 'all' || n.currency === currency;
    return matchSearch && matchCat && matchCurr;
  });

  const featured = nfts.filter(n => n.is_featured).slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      <style>{`.nft-scrollbar::-webkit-scrollbar{display:none}.nft-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>

      {/* Hero */}
      <div className="relative overflow-hidden pt-16 pb-20 px-4 md:px-12"
        style={{ background: 'linear-gradient(to bottom, rgba(0,212,255,0.04) 0%, transparent 100%)' }}>
        <div className="max-w-screen-xl mx-auto">
          <p className="text-[9px] tracking-[0.4em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Digital Society
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight mb-6"
            style={{ letterSpacing: '-0.025em' }}>
            NFT<br />MARKETPLACE
          </h1>
          <p className="text-sm text-white/45 max-w-md leading-relaxed mb-8">
            Discover, collect, and trade digital assets from the SKRTLIFE universe. Fashion. Art. Utility.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            {[
              { label: 'Items', value: nfts.length },
              { label: 'Listed', value: nfts.filter(n => n.status === 'listed').length },
              { label: 'Featured', value: featured.length },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/35">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-0 z-30 px-4 md:px-12"
        style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-screen-xl mx-auto flex items-center gap-3 py-3 overflow-x-auto nft-scrollbar">
          {/* Search */}
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              placeholder="Search NFTs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/25 w-44 placeholder:text-white/25"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 shrink-0">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap"
                style={{
                  background: category === c ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                  color: category === c ? '#00D4FF' : 'rgba(255,255,255,0.4)',
                  border: `1px solid ${category === c ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* View toggle */}
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-white/10' : 'hover:bg-white/5'}`}>
              <Grid3X3 className="w-3.5 h-3.5" style={{ color: view === 'grid' ? '#fff' : 'rgba(255,255,255,0.4)' }} />
            </button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white/10' : 'hover:bg-white/5'}`}>
              <LayoutList className="w-3.5 h-3.5" style={{ color: view === 'list' ? '#fff' : 'rgba(255,255,255,0.4)' }} />
            </button>
          </div>

          <span className="text-[9px] text-white/25 uppercase tracking-wider shrink-0">
            {filtered.length} items
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-12 py-10 pb-28">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="rounded-2xl aspect-square animate-pulse"
                style={{ background: 'rgba(255,255,255,0.05)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <p className="text-white/40 text-sm">No NFTs match your search</p>
          </div>
        ) : (
          <div className={
            view === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
              : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'
          }>
            {filtered.map((nft, i) => (
              <NFTCard key={nft.id} nft={nft} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}