import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Grid3X3, LayoutGrid, SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function CyberpunkFilterBar({
  collections,
  selectedCollection,
  setSelectedCollection,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  sizes,
  selectedSize,
  setSelectedSize,
  priceRange,
  setPriceRange,
  selectedTags,
  setSelectedTags,
  availableTags = [],
  selectedColors,
  setSelectedColors,
  availableColors = []
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const priceRanges = [
    { id: 'all', label: 'ALL', min: 0, max: Infinity },
    { id: 'under50', label: '<$50', min: 0, max: 50 },
    { id: '50-100', label: '$50-100', min: 50, max: 100 },
    { id: '100-200', label: '$100-200', min: 100, max: 200 },
    { id: 'over200', label: '$200+', min: 200, max: Infinity },
  ];

  const handlePriceRangeChange = (rangeId) => {
    if (setPriceRange) {
      const range = priceRanges.find(r => r.id === rangeId);
      setPriceRange(range ? { min: range.min, max: range.max, id: rangeId } : null);
    }
  };

  const handleTagToggle = (tag) => {
    if (setSelectedTags) {
      setSelectedTags(prev => 
        prev.includes(tag) 
          ? prev.filter(t => t !== tag)
          : [...prev, tag]
      );
    }
  };

  const handleColorToggle = (color) => {
    if (setSelectedColors) {
      setSelectedColors(prev =>
        prev.includes(color)
          ? prev.filter(c => c !== color)
          : [...prev, color]
      );
    }
  };

  const activeFilterCount = [
    selectedSize,
    priceRange?.id && priceRange.id !== 'all',
    selectedTags?.length > 0,
    selectedColors?.length > 0
  ].filter(Boolean).length;

  return (
    <section className="sticky top-0 z-40">
      {/* Main Bar */}
      <div className="relative bg-[#0A0F1E]/95 backdrop-blur-2xl border-b border-white/10">
        {/* Subtle border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Collection Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setSelectedCollection(col.id)}
                  className={`relative px-4 py-2 text-xs uppercase tracking-wider whitespace-nowrap transition-all rounded-lg ${
                    selectedCollection === col.id
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {selectedCollection === col.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10 border border-white/20 rounded-lg"
                    />
                  )}
                  <span className="relative">
                    {col.label} <span className="text-white/30">({col.count})</span>
                  </span>
                </button>
              ))}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.input
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 200, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="absolute right-11 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-400 placeholder:text-white/30"
                    />
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${
                    isSearchOpen 
                      ? 'border-blue-400 bg-blue-400/10 text-blue-400' 
                      : 'border-white/10 text-white/50 hover:text-white hover:border-white/20'
                  }`}
                >
                  {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                </button>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-white text-xs uppercase tracking-wide focus:outline-none focus:border-blue-400 cursor-pointer hover:border-white/20"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="hidden md:flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white text-black' 
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white text-black' 
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all relative ${
                  showFilters 
                    ? 'border-blue-400 bg-blue-400/10 text-blue-400' 
                    : 'border-white/10 text-white/50 hover:text-white hover:border-white/20'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-white/10"
              >
                <div className="py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Size Filter */}
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-3">Size</p>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                          className={`px-4 py-2 rounded-lg text-xs transition-all border ${
                            selectedSize === size
                              ? 'border-blue-400 bg-blue-400/10 text-blue-400'
                              : 'border-white/20 text-white/50 hover:text-white hover:border-white/30'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-3">Price</p>
                    <div className="flex flex-wrap gap-2">
                      {priceRanges.map((range) => (
                        <button
                          key={range.id}
                          onClick={() => handlePriceRangeChange(range.id)}
                          className={`px-3 py-2 rounded-lg text-xs transition-all border ${
                            priceRange?.id === range.id
                              ? 'border-purple-400 bg-purple-400/10 text-purple-400'
                              : 'border-white/20 text-white/50 hover:text-white hover:border-white/30'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags Filter */}
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-3">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {(availableTags.length > 0 ? availableTags : ['Limited', 'Preorder', 'New', 'Sale']).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-2 rounded-lg text-xs transition-all border ${
                            selectedTags?.includes(tag)
                              ? 'border-blue-400 bg-blue-400/10 text-blue-400'
                              : 'border-white/20 text-white/50 hover:text-white hover:border-white/30'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Filter */}
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-3">Color</p>
                    <div className="flex flex-wrap gap-2">
                      {(availableColors.length > 0 ? availableColors : [
                        { name: 'Black', hex: '#000000' },
                        { name: 'White', hex: '#FFFFFF' },
                        { name: 'Red', hex: '#EF4444' },
                        { name: 'Blue', hex: '#3B82F6' },
                        { name: 'Green', hex: '#22C55E' },
                      ]).map((color) => (
                        <button
                          key={color.name}
                          onClick={() => handleColorToggle(color.name)}
                          className={`w-9 h-9 rounded-lg transition-all border-2 flex items-center justify-center ${
                            selectedColors?.includes(color.name)
                              ? 'border-blue-400 scale-110'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {selectedColors?.includes(color.name) && (
                            <span className={`text-xs font-bold ${color.hex === '#FFFFFF' || color.hex === '#ffffff' ? 'text-black' : 'text-white'}`}>✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFilterCount > 0 && (
                  <div className="pb-4 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedSize?.(null);
                        setPriceRange?.(null);
                        setSelectedTags?.([]);
                        setSelectedColors?.([]);
                      }}
                      className="text-xs text-white/50 hover:text-white transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}