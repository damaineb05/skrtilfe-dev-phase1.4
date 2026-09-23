import React, { useState } from 'react';
import { getRpmAnimations, getRpmCategories, getRpmAnimationCount } from '../utils/rpmAnimationLibrary';
import { Play, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RpmAnimationPicker({ gender = 'masculine', onSelect, selectedAnimationId }) {
  const [activeCategory, setActiveCategory] = useState('idle');
  const [loadingAnimations, setLoadingAnimations] = useState(new Set());

  const categories = getRpmCategories();
  const clips = getRpmAnimations(gender, activeCategory);

  const handleSelect = (clip) => {
    setLoadingAnimations(prev => new Set(prev).add(clip.id));
    onSelect(clip);
    // Remove loading state after a delay
    setTimeout(() => {
      setLoadingAnimations(prev => {
        const next = new Set(prev);
        next.delete(clip.id);
        return next;
      });
    }, 2000);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'idle': return '🧍';
      case 'locomotion': return '🏃';
      case 'dance': return '💃';
      case 'expression': return '👋';
      default: return '✨';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Animation Library</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Ready Player Me • {gender === 'feminine' ? 'Female' : 'Male'} Animations
          </p>
        </div>
        <div className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/30">
          <span className="text-xs font-semibold text-cyan-400">
            {clips.length} {activeCategory}
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-4 gap-2">
        {categories.map((category) => {
          const count = getRpmAnimationCount(gender, category);
          const isActive = activeCategory === category;
          
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`relative p-3 rounded-lg border-2 transition-all text-center ${
                isActive
                  ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_20px_rgba(0,255,255,0.3)]'
                  : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
              }`}
            >
              <div className="text-2xl mb-1">{getCategoryIcon(category)}</div>
              <div className={`text-xs font-semibold capitalize ${
                isActive ? 'text-cyan-400' : 'text-gray-400'
              }`}>
                {category}
              </div>
              <div className={`text-[10px] ${
                isActive ? 'text-cyan-300' : 'text-gray-500'
              }`}>
                {count}
              </div>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-cyan-400/10 rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Animation Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {clips.map((clip, index) => {
          const isSelected = selectedAnimationId === clip.id;
          const isLoading = loadingAnimations.has(clip.id);
          
          return (
            <motion.button
              key={clip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => handleSelect(clip)}
              className={`group relative text-left border-2 rounded-xl overflow-hidden transition-all ${
                isSelected
                  ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                  : 'border-zinc-700 hover:border-cyan-400/50'
              }`}
            >
              {/* Preview Image */}
              <div className="relative aspect-video bg-zinc-900">
                {clip.previewUrl ? (
                  <img
                    src={clip.previewUrl}
                    alt={clip.label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {getCategoryIcon(clip.category)}
                  </div>
                )}
                
                {/* Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${
                  isSelected ? 'opacity-100' : ''
                }`}>
                  {isLoading ? (
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  ) : (
                    <Play className="w-8 h-8 text-cyan-400" />
                  )}
                </div>

                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-cyan-400 text-black text-[10px] font-bold">
                    ACTIVE
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2 bg-zinc-900/80 backdrop-blur-sm">
                <div className="font-medium text-sm text-white truncate">
                  {clip.label}
                </div>
                <div className="text-[10px] text-gray-500 truncate">
                  {clip.id}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(39, 39, 42, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.8);
        }
      `}</style>
    </div>
  );
}