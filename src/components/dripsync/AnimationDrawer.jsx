import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronDown, Play, Check, Eye } from 'lucide-react';

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

function AnimationDrawer({
  isOpen,
  onClose,
  availableAnimations = [],
  customAnimations = [],
  onPreview,
  onApply,
  isPreviewing = false,
  onCancel,
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [previewingSlug, setPreviewingSlug] = useState(null);

  const allAnimations = useMemo(() => [
    ...availableAnimations.map(a => ({ ...a, source: 'built-in' })),
    ...customAnimations.map(a => ({ ...a, source: 'custom' })),
  ], [availableAnimations, customAnimations]);

  const filtered = useMemo(() => allAnimations.filter(anim => {
    const matchSearch = !search || anim.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filter === 'all' || anim.category === filter || (filter === 'custom' && anim.source === 'custom');
    const matchGender = genderFilter === 'all' || anim.gender === genderFilter || anim.source === 'custom';
    return matchSearch && matchCat && matchGender;
  }), [allAnimations, search, filter, genderFilter]);

  const handlePreview = useCallback((anim) => {
    setPreviewingSlug(anim.slug || anim.name);
    onPreview?.(anim);
  }, [onPreview]);

  const handleApply = useCallback((anim) => {
    setPreviewingSlug(null);
    onApply?.(anim);
  }, [onApply]);

  const handleCancel = useCallback(() => {
    setPreviewingSlug(null);
    onCancel?.();
  }, [onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="fixed top-[180px] left-0 right-0 z-40 mx-auto max-w-6xl px-4"
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(8, 10, 20, 0.97)',
              border: '1px solid rgba(0,212,255,0.25)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-pink-300">Animation Library</span>
                <span className="text-xs text-white/30 ml-1">— {filtered.length} animations</span>
              </div>

              {/* Filters inline */}
              <div className="flex items-center gap-2 flex-1 mx-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-7 pr-3 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400/50"
                  />
                </div>

                {/* Category pills */}
                <div className="flex gap-1">
                  {['all', 'locomotion', 'dance', 'idle', 'expression', 'custom'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        filter === cat
                          ? 'bg-purple-500/30 border-purple-400/60 text-purple-300'
                          : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                      }`}
                    >
                      {cat === 'all' ? 'All' : CATEGORY_ICONS[cat] || '✨'} {cat}
                    </button>
                  ))}
                </div>

                {/* Gender pills */}
                <div className="flex gap-1">
                  {[['all', 'All'], ['M', '♂'], ['F', '♀']].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setGenderFilter(val)}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-all ${
                        genderFilter === val
                          ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Preview banner */}
            <AnimatePresence>
              {isPreviewing && previewingSlug && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex items-center gap-3 px-4 py-2 bg-blue-500/20 border-b border-blue-500/30"
                >
                  <Eye className="w-4 h-4 text-blue-300 animate-pulse shrink-0" />
                  <span className="text-xs text-blue-200 flex-1">Previewing: <strong>{previewingSlug}</strong></span>
                  <button onClick={handleCancel} className="text-xs text-white/50 hover:text-white border border-white/20 px-2 py-0.5 rounded-full">Cancel</button>
                  <button
                    onClick={() => { 
                      const anim = filtered.find(a => (a.slug || a.name) === previewingSlug);
                      if (anim) onApply?.(anim);
                      setPreviewingSlug(null); 
                    }}
                    className="text-xs text-black font-bold bg-blue-400 hover:bg-blue-300 px-3 py-0.5 rounded-full flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Apply
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animation grid - horizontal scroll */}
            <div className="overflow-x-auto px-4 py-3 scrollbar-hide">
              {filtered.length === 0 ? (
                <div className="text-center py-6 text-white/30 text-sm">No animations found</div>
              ) : (
                <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
                  {filtered.map((anim, idx) => {
                    const isActive = previewingSlug === (anim.slug || anim.name);
                    return (
                      <motion.div
                        key={`${anim.slug || anim.name}-${idx}`}
                        className={`flex-shrink-0 w-36 rounded-xl border p-2.5 cursor-pointer group ${
                          isActive
                            ? 'bg-purple-500/20 border-purple-400/60'
                            : 'border-white/10'
                        }`}
                        style={{ background: isActive ? undefined : 'rgba(255,255,255,0.02)' }}
                        whileHover={{ scale: 1.04, y: -2, borderColor: isActive ? undefined : 'rgba(168,85,247,0.4)', boxShadow: '0 4px 20px rgba(168,85,247,0.15)' }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                      >
                        {/* Category badge */}
                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border mb-2 ${CATEGORY_COLORS[anim.category] || 'bg-purple-500/20 text-purple-300 border-purple-500/30'}`}>
                          {CATEGORY_ICONS[anim.category] || '✨'} {anim.category}
                        </div>

                        <p className="text-white text-xs font-semibold leading-tight mb-2 line-clamp-2">{anim.name}</p>

                        {anim.gender && (
                          <span className={`text-[9px] font-bold ${anim.gender === 'M' ? 'text-cyan-400' : 'text-rose-400'}`}>
                            {anim.gender === 'M' ? '♂ Masc' : '♀ Fem'}
                          </span>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => handlePreview(anim)}
                            className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] font-bold border border-white/10 hover:border-white/20 transition-all"
                          >
                            <Eye className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={() => handleApply(anim)}
                            className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-purple-500/30 hover:bg-purple-500/50 text-purple-300 text-[10px] font-bold border border-purple-500/40 hover:border-purple-400 transition-all"
                          >
                            <Play className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <style>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default React.memo(AnimationDrawer);