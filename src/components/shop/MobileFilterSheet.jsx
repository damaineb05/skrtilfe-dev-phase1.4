import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

const priceRanges = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under50', label: 'Under $50', min: 0, max: 50 },
  { id: '50-100', label: '$50 – $100', min: 50, max: 100 },
  { id: '100-200', label: '$100 – $200', min: 100, max: 200 },
  { id: 'over200', label: '$200+', min: 200, max: Infinity },
];

const sortOptions = [
  { id: 'newest', label: 'Newest First' },
  { id: 'price-low', label: 'Price: Low → High' },
  { id: 'price-high', label: 'Price: High → Low' },
];

export default function MobileFilterSheet({
  isOpen, onClose,
  sizes, selectedSize, setSelectedSize,
  priceRange, setPriceRange,
  sortBy, setSortBy,
  selectedTags, setSelectedTags,
  availableTags = [],
}) {
  const handlePriceChange = (range) => setPriceRange(range.id === 'all' ? null : { ...range });
  const toggleTag = (tag) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  const clearAll = () => { setSelectedSize(null); setPriceRange(null); setSelectedTags([]); setSortBy('newest'); };
  const tags = availableTags.length > 0 ? availableTags : ['Limited', 'Preorder', 'New', 'Sale'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} />

          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden"
            style={{ background: '#0D0D14', borderTop: '1px solid rgba(255,255,255,0.08)', maxHeight: '88vh' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3.5 pb-1">
              <div className="w-8 h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">Refine</h3>
              <div className="flex items-center gap-5">
                <button onClick={clearAll} className="text-[9px] tracking-[0.25em] uppercase font-medium transition-opacity hover:opacity-60"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Clear All
                </button>
                <button onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center transition-opacity hover:opacity-60"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(88vh - 110px)' }}>

              {/* Sort */}
              <FilterSection title="Sort By">
                {sortOptions.map(opt => (
                  <OptionRow key={opt.id} label={opt.label} selected={sortBy === opt.id} onSelect={() => setSortBy(opt.id)} />
                ))}
              </FilterSection>

              {/* Size */}
              <FilterSection title="Size">
                <div className="grid grid-cols-4 gap-1.5 px-6 pb-5">
                  {sizes.map(s => (
                    <button key={s}
                      onClick={() => setSelectedSize(selectedSize === s ? null : s)}
                      className="py-3 text-[10px] font-semibold uppercase tracking-wider transition-all duration-200"
                      style={{
                        background: selectedSize === s ? '#fff' : 'transparent',
                        border: '1px solid',
                        borderColor: selectedSize === s ? '#fff' : 'rgba(255,255,255,0.1)',
                        color: selectedSize === s ? '#000' : 'rgba(255,255,255,0.5)',
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Price */}
              <FilterSection title="Price">
                {priceRanges.map(range => (
                  <OptionRow key={range.id} label={range.label}
                    selected={(!priceRange && range.id === 'all') || priceRange?.id === range.id}
                    onSelect={() => handlePriceChange(range)} />
                ))}
              </FilterSection>

              {/* Tags */}
              {tags.length > 0 && (
                <FilterSection title="Tags">
                  <div className="flex flex-wrap gap-2 px-6 pb-5">
                    {tags.map(tag => (
                      <button key={tag}
                        onClick={() => toggleTag(tag)}
                        className="px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-200"
                        style={{
                          border: '1px solid',
                          borderColor: selectedTags.includes(tag) ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
                          background: selectedTags.includes(tag) ? 'rgba(255,255,255,0.08)' : 'transparent',
                          color: selectedTags.includes(tag) ? '#fff' : 'rgba(255,255,255,0.4)',
                        }}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </FilterSection>
              )}

              {/* Apply */}
              <div className="px-6 py-6">
                <button onClick={onClose}
                  className="w-full py-4 text-xs font-bold uppercase tracking-[0.25em] text-black bg-white hover:bg-white/90 transition-all">
                  View Results
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FilterSection({ title, children }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="px-6 pt-6 pb-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.3)' }}>{title}</p>
      </div>
      {children}
    </div>
  );
}

function OptionRow({ label, selected, onSelect }) {
  return (
    <button onClick={onSelect}
      className="w-full flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-white/[0.03]">
      <span className="text-sm font-light" style={{ color: selected ? '#fff' : 'rgba(255,255,255,0.45)' }}>{label}</span>
      {selected && <Check className="w-3.5 h-3.5 text-white" />}
    </button>
  );
}