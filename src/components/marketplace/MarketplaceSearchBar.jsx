import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Wearables', 'Avatars', 'Art', 'Collectibles', 'Accessories'];
const SORT_OPTIONS = [
  { value: 'popular',    label: 'Most Popular' },
  { value: 'price_low',  label: 'Price: Low → High' },
  { value: 'price_high', label: 'Price: High → Low' },
  { value: 'recent',     label: 'Recently Listed' },
  { value: 'rarity',     label: 'Rarity' },
];
const PRICE_RANGES = [
  { label: 'Any',     min: null, max: null },
  { label: '< 0.5',   min: null, max: 0.5 },
  { label: '0.5–1',   min: 0.5,  max: 1 },
  { label: '1–3 ETH', min: 1,    max: 3 },
  { label: '3+ ETH',  min: 3,    max: null },
];

export default function MarketplaceSearchBar({ filters, setFilters, resultCount }) {
  const activeFilterCount = [
    filters.category !== 'All',
    filters.priceRange !== 0,
    filters.sortBy !== 'popular',
  ].filter(Boolean).length;

  return (
    <div className="sticky top-[88px] z-30 border-b border-white/8"
      style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(20px)' }}>

      {/* Search row */}
      <div className="px-6 md:px-12 py-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={filters.query}
            onChange={e => setFilters(f => ({ ...f, query: e.target.value }))}
            placeholder="Search items, collections…"
            className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/30 bg-white/5 border border-white/10 focus:border-white/25 focus:outline-none transition-colors"
          />
          {filters.query && (
            <button onClick={() => setFilters(f => ({ ...f, query: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}
          className="hidden sm:block py-2.5 px-4 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-white/25 cursor-pointer"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-[#0A0A0F]">{o.label}</option>)}
        </select>

        <p className="text-white/30 text-xs hidden md:block whitespace-nowrap">{resultCount} items</p>
      </div>

      {/* Category + price pills */}
      <div className="px-6 md:px-12 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {/* Category */}
        {CATEGORIES.map(cat => (
          <button key={cat}
            onClick={() => setFilters(f => ({ ...f, category: cat }))}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filters.category === cat
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}>
            {cat}
          </button>
        ))}

        <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />

        {/* Price */}
        {PRICE_RANGES.map((pr, i) => (
          <button key={i}
            onClick={() => setFilters(f => ({ ...f, priceRange: i }))}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filters.priceRange === i
                ? 'bg-[#00D4FF] text-black'
                : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}>
            {pr.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export { PRICE_RANGES, CATEGORIES };