import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'physical', label: 'Apparel' },
  { id: 'nft', label: 'NFT' },
  { id: '3d_nft', label: '3D NFT' },
  { id: 'wearable', label: 'Wearable' },
  { id: 'physical_and_nft', label: 'Phygital' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'price-low', label: 'Price: Low → High' },
  { id: 'price-high', label: 'Price: High → Low' },
  { id: 'featured', label: 'Featured' },
];

const STOCK_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'in-stock', label: 'In Stock' },
  { id: 'out-of-stock', label: 'Out of Stock' },
];

export default function ShopFilters({
  collections, selectedCollection, setSelectedCollection,
  selectedProductType, setSelectedProductType,
  searchQuery, setSearchQuery,
  sortBy, setSortBy,
  selectedSize, setSelectedSize,
  selectedColors, setSelectedColors,
  availableColors,
  stockFilter, setStockFilter,
  priceRange, setPriceRange,
  totalResults,
  onReset,
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const activeFilterCount = [
    selectedProductType !== 'all',
    selectedSize,
    selectedColors.length > 0,
    stockFilter !== 'all',
    priceRange && priceRange.id !== 'all',
  ].filter(Boolean).length;

  const PRICE_RANGES = [
    { id: 'all', label: 'Any Price', min: 0, max: Infinity },
    { id: 'under50', label: 'Under $50', min: 0, max: 50 },
    { id: '50-150', label: '$50 – $150', min: 50, max: 150 },
    { id: '150-300', label: '$150 – $300', min: 150, max: 300 },
    { id: 'over300', label: '$300+', min: 300, max: Infinity },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(o => !o)}
              className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.08] transition-all whitespace-nowrap"
            >
              {SORT_OPTIONS.find(s => s.id === sortBy)?.label || 'Sort'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-[#17171F] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
                >
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.id} onClick={() => { setSortBy(opt.id); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-white/5 transition-colors ${sortBy === opt.id ? 'text-white' : 'text-white/50'}`}>
                      {opt.label}
                      {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-[#00D4FF]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setPanelOpen(o => !o)}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all border ${
              panelOpen || activeFilterCount > 0
                ? 'bg-white text-black border-transparent'
                : 'bg-white/[0.05] border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-[#FF3366] text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Collection Pills */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {collections.map(col => (
            <button
              key={col.id}
              onClick={() => setSelectedCollection(col.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
                selectedCollection === col.id
                  ? 'bg-white text-black border-transparent'
                  : 'bg-transparent border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
              }`}
            >
              {col.label}
              {col.count > 0 && <span className="ml-1.5 opacity-50">({col.count})</span>}
            </button>
          ))}
        </div>

        {/* Expanded Filter Panel */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden border-t border-white/[0.06]"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {/* Product Type */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2.5 font-semibold">Type</p>
                  <div className="flex flex-col gap-1.5">
                    {CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => setSelectedProductType(cat.id)}
                        className={`text-left text-sm px-3 py-1.5 rounded-lg transition-all ${selectedProductType === cat.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2.5 font-semibold">Size</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SIZES.map(s => (
                      <button key={s} onClick={() => setSelectedSize(selectedSize === s ? null : s)}
                        className={`w-11 h-9 rounded-lg text-xs font-bold transition-all border ${
                          selectedSize === s ? 'bg-white text-black border-transparent' : 'bg-transparent border-white/10 text-white/40 hover:border-white/25 hover:text-white/70'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2.5 font-semibold">Availability</p>
                  <div className="flex flex-col gap-1.5">
                    {STOCK_OPTIONS.map(opt => (
                      <button key={opt.id} onClick={() => setStockFilter(opt.id)}
                        className={`text-left text-sm px-3 py-1.5 rounded-lg transition-all flex items-center justify-between ${stockFilter === opt.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
                        {opt.label}
                        {stockFilter === opt.id && <Check className="w-3 h-3 text-[#00D4FF]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2.5 font-semibold">Price</p>
                  <div className="flex flex-col gap-1.5">
                    {PRICE_RANGES.map(r => (
                      <button key={r.id} onClick={() => setPriceRange(r)}
                        className={`text-left text-sm px-3 py-1.5 rounded-lg transition-all flex items-center justify-between ${priceRange?.id === r.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
                        {r.label}
                        {priceRange?.id === r.id && <Check className="w-3 h-3 text-[#00D4FF]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Colors */}
              {availableColors?.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-5">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2.5 font-semibold">Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color, i) => (
                      <button key={i} onClick={() => {
                        setSelectedColors(prev =>
                          prev.includes(color.name) ? prev.filter(c => c !== color.name) : [...prev, color.name]
                        );
                      }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selectedColors.includes(color.name) ? 'border-white/40 bg-white/10 text-white' : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white/70'
                        }`}>
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" style={{ background: color.hex || '#888' }} />
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeFilterCount > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4 flex items-center justify-between">
                  <p className="text-white/40 text-sm">{totalResults} result{totalResults !== 1 ? 's' : ''}</p>
                  <button onClick={onReset} className="text-sm text-white/40 hover:text-white underline underline-offset-2 transition-colors">Clear all</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}