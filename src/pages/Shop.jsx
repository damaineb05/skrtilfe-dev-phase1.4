import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, Grid2X2, LayoutList } from 'lucide-react';
import CyberpunkProductCard from '../components/shop/CyberpunkProductCard';
import CyberpunkHero from '../components/shop/CyberpunkHero';
import QuickViewModal from '../components/shop/QuickViewModal';
import MobileFilterSheet from '../components/shop/MobileFilterSheet';
import { ProductCardSkeleton, HeroSkeleton } from '../components/ui/SkeletonLoader';

const COLLECTIONS = [
  { id: 'all', label: 'All' },
  { id: 'Genesis', label: 'Genesis' },
  { id: 'Light', label: 'Light' },
  { id: 'Dark', label: 'Dark' },
  { id: 'Limited/Collab', label: 'Limited' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [priceRange, setPriceRange] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid2'); // grid2 | grid1
  const [filterOpen, setFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const searchRef = useRef(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['shop-products'],
    queryFn: async () => {
      const all = await base44.entities.Product.list('-created_date', 100);
      return all.filter(p => p.status === 'active');
    },
  });

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const filtered = sorted.filter(p => {
    const s = !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const c = selectedCollection === 'all' || p.collection === selectedCollection;
    const sz = !selectedSize || p.available_sizes?.includes(selectedSize);
    const pr = !priceRange || (p.price >= priceRange.min && p.price < priceRange.max);
    const tg = selectedTags.length === 0 || selectedTags.some(t => p.tags?.includes(t));
    return s && c && sz && pr && tg;
  });

  const availableTags = [...new Set(products.flatMap(p => p.tags || []))];
  const featuredProducts = products.filter(p => p.is_featured).slice(0, 6);

  const activeFilterCount = [
    selectedSize,
    priceRange,
    selectedTags.length > 0,
    sortBy !== 'newest',
  ].filter(Boolean).length;

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ id: product.id, title: product.title, price: product.price, quantity: 1, image: product.media?.[0]?.url });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCollection('all');
    setSelectedSize(null);
    setPriceRange(null);
    setSelectedTags([]);
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* HERO */}
      {isLoading ? <HeroSkeleton /> : (
        <CyberpunkHero products={featuredProducts} onAddToCart={handleAddToCart} />
      )}

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-40" style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Search Bar (expanded) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-white/[0.07]"
            >
              <div className="flex items-center gap-4 px-6 lg:px-12 py-4">
                <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search collection…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 focus:outline-none tracking-wide"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                  <X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collection tabs + actions — single row */}
        <div className="flex items-center justify-between px-4 lg:px-12" style={{ minHeight: '52px' }}>
          {/* Tabs */}
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {COLLECTIONS.map(col => {
              const active = selectedCollection === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => setSelectedCollection(col.id)}
                  className="relative shrink-0 px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] whitespace-nowrap transition-colors duration-200"
                  style={{ color: active ? '#fff' : 'rgba(255,255,255,0.3)' }}
                >
                  {col.label}
                  {active && (
                    <motion.div layoutId="catUnderline" className="absolute bottom-0 left-3 right-3 h-[1px]"
                      style={{ background: '#fff' }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setSearchOpen(s => !s)}
              className="w-9 h-9 flex items-center justify-center transition-opacity hover:opacity-70">
              <Search className="w-3.5 h-3.5" style={{ color: searchOpen ? '#fff' : 'rgba(255,255,255,0.45)' }} />
            </button>

            <button onClick={() => setViewMode(v => v === 'grid2' ? 'grid1' : 'grid2')}
              className="w-9 h-9 flex items-center justify-center transition-opacity hover:opacity-70">
              {viewMode === 'grid2'
                ? <LayoutList className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.45)' }} />
                : <Grid2X2 className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.45)' }} />
              }
            </button>

            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.2em] relative transition-all duration-200 ml-1"
              style={{
                border: '1px solid',
                borderColor: activeFilterCount > 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
                color: activeFilterCount > 0 ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center bg-white text-black">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <p className="text-[9px] tracking-[0.2em] uppercase ml-4 hidden sm:block" style={{ color: 'rgba(255,255,255,0.22)' }}>
              {isLoading ? '' : `${filtered.length} pieces`}
            </p>
          </div>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="px-4 md:px-8 lg:px-12 pt-10 pb-28 max-w-screen-xl mx-auto">
        {isLoading ? (
          <div className={`grid gap-x-3 gap-y-10 ${viewMode === 'grid2' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <p className="text-[9px] tracking-[0.35em] uppercase mb-3 font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
              No Results
            </p>
            <p className="text-lg font-semibold text-white mb-1 tracking-tight">Nothing matches your selection</p>
            <p className="text-sm mb-8 font-light" style={{ color: 'rgba(255,255,255,0.35)' }}>Try adjusting your filters</p>
            <button
              onClick={clearFilters}
              className="px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.25em] text-black bg-white transition-opacity hover:opacity-80"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-x-3 gap-y-10 ${viewMode === 'grid2' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {filtered.map((product, i) => (
              <CyberpunkProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onQuickView={setQuickViewProduct}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM FILTER SHEET */}
      <MobileFilterSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        sizes={SIZES}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        availableTags={availableTags}
      />

      {/* QUICK VIEW */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}