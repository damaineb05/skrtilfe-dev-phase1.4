import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Play, Eye, Check } from 'lucide-react';

const CATEGORY_ICONS = {
  locomotion: '🏃',
  dance: '💃',
  idle: '🧍',
  expression: '😀',
};

const CATEGORY_COLORS = {
  locomotion: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  dance: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  idle: 'bg-green-500/20 text-green-300 border-green-500/30',
  expression: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
};

/**
 * Full animation library for mobile matching desktop
 * All animations with search, categories, preview, and live playback
 */
export default function MobileAnimationLibrary({
  animations = [],
  currentAnimationId = null,
  onAnimationSelect = () => {},
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewingId, setPreviewingId] = useState(null);

  // Combine built-in and custom animations
  const allAnimations = useMemo(() => animations, [animations]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(allAnimations.map(a => a.category || a.gait || 'other'));
    return ['all', ...Array.from(cats).sort()];
  }, [allAnimations]);

  // Filter animations
  const filteredAnimations = useMemo(() => {
    return allAnimations.filter(anim => {
      const matchesSearch = !searchQuery || 
        anim.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        anim.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        anim.id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
        (anim.category === selectedCategory) || 
        (anim.gait === selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [allAnimations, searchQuery, selectedCategory]);

  const handlePreview = useCallback((anim) => {
    setPreviewingId(anim.id);
    onAnimationSelect(anim.id, anim);
  }, [onAnimationSelect]);

  const handleApply = useCallback((anim) => {
    setPreviewingId(null);
    onAnimationSelect(anim.id, anim);
  }, [onAnimationSelect]);

  const getCategoryLabel = (category) => {
    const labels = {
      locomotion: 'Locomotion',
      dance: 'Dance',
      idle: 'Idle',
      expression: 'Expression',
      walk: 'Walk',
      run: 'Run',
      jog: 'Jog',
      jump: 'Jump',
      crouch_walk: 'Crouch Walk',
      crouch_strafe: 'Crouch Strafe',
      falling_idle: 'Falling',
    };
    return labels[category] || (category?.charAt(0).toUpperCase() + category?.slice(1)) || 'Animation';
  };

  return (
    <div className="h-full flex flex-col bg-black/40">
      {/* Header with search */}
      <div className="sticky top-0 z-20 px-4 pt-4 pb-3 bg-gradient-to-b from-black/80 to-black/40">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search animations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-xs bg-white/8 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 transition-colors"
          />
        </div>

        {/* Category filters */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-2 whitespace-nowrap">
            {categories.map(cat => (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  selectedCategory === cat
                    ? 'bg-purple-500/30 border-purple-400/60 text-purple-300'
                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                }`}
              >
                {cat === 'all' ? 'All' : getCategoryLabel(cat)}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Animations grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-6">
        {filteredAnimations.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-white/40">
            <span className="text-sm">No animations found</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 pt-4 pb-safe">
            {filteredAnimations.map((anim) => {
              const isActive = currentAnimationId === anim.id;
              const isPreviewing = previewingId === anim.id;
              
              return (
                <motion.div
                  key={`${anim.id}-${anim.source || 'built-in'}`}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className={`relative rounded-xl p-3 border cursor-pointer overflow-hidden transition-colors ${
                    isActive
                      ? 'bg-purple-500/20 border-purple-400/60'
                      : 'bg-white/5 border-white/10 active:bg-white/10'
                  }`}
                  style={{ willChange: 'transform' }}
                >
                  {/* Category badge */}
                  {anim.category && (
                    <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold border mb-2 ${
                      CATEGORY_COLORS[anim.category] || 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    }`}>
                      {CATEGORY_ICONS[anim.category] || '✨'} {anim.category}
                    </div>
                  )}

                  {/* Animation name */}
                  <p className="text-xs font-bold text-white mb-1 line-clamp-2 leading-tight">
                    {anim.name || anim.title || anim.id}
                  </p>

                  {/* Gender or type */}
                  {anim.gender && (
                    <p className="text-[9px] text-white/60 mb-2">
                      {anim.gender === 'M' ? '♂ Masculine' : '♀ Feminine'}
                    </p>
                  )}

                  {/* Action buttons — thumb-friendly 40px min height */}
                  <div className="flex gap-2 mt-2.5">
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); handlePreview(anim); }}
                      whileTap={{ scale: 0.90 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/10 active:bg-white/20 text-white/70 text-[10px] font-bold border border-white/10 transition-colors"
                      style={{ minHeight: 40 }}
                    >
                      <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Preview</span>
                    </motion.button>
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); handleApply(anim); }}
                      whileTap={{ scale: 0.90 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-purple-500/30 active:bg-purple-500/50 text-purple-300 text-[10px] font-bold border border-purple-500/40 transition-colors"
                      style={{ minHeight: 40 }}
                    >
                      <Play className="w-3.5 h-3.5 fill-current flex-shrink-0" />
                      <span>Play</span>
                    </motion.button>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  )}

                  {/* Preview indicator */}
                  {isPreviewing && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="sticky bottom-0 px-4 py-2 bg-gradient-to-t from-black/80 to-black/0 text-center text-[10px] text-white/40 border-t border-white/5">
        {filteredAnimations.length} of {allAnimations.length} animations
      </div>
    </div>
  );
}