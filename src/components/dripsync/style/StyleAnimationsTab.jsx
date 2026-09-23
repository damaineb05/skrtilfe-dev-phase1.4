import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Search, Zap } from 'lucide-react';
import { getAllAnimations, ANIMATION_CATEGORIES } from '../RPMAnimationLibrary';
import { normalizeAvatarType, GENDER_PREFIX } from '../../../dripsync/core/DripSyncAvatarState';

/**
 * StyleAnimationsTab
 * Filters animations strictly by avatarType (masculine/feminine).
 * Male avatars never see female animations, and vice versa.
 */
export default function StyleAnimationsTab({ avatarType = 'masculine', onPreview, onApply, activeSlug }) {
  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState('all');

  const genderKey = normalizeAvatarType(avatarType) === 'feminine' ? 'F' : 'M';

  const filtered = useMemo(() => {
    const all = getAllAnimations().filter(a => a.gender === genderKey);
    return all.filter(a => {
      const matchCat  = category === 'all' || a.category === category;
      const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [genderKey, category, search]);

  const cats = [{ id: 'all', name: 'All', icon: '🎬' }, ...ANIMATION_CATEGORIES];

  return (
    <div className="h-full flex flex-col">
      {/* Gender badge */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
          style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <Zap className="w-3.5 h-3.5" style={{ color: '#c084fc' }} />
          <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#c084fc' }}>
            {genderKey === 'M' ? 'Masculine' : 'Feminine'} Animations Only
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search animations…"
            className="w-full h-9 pl-8 pr-3 rounded-xl text-xs text-white placeholder:text-white/20 bg-transparent focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {cats.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase transition-all"
              style={{
                background: category === c.id ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${category === c.id ? 'rgba(168,85,247,0.45)' : 'rgba(255,255,255,0.08)'}`,
                color: category === c.id ? '#c084fc' : 'rgba(255,255,255,0.4)',
              }}>
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Animation grid */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-white/25 text-sm">No animations found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(anim => {
              const isActive = activeSlug === anim.slug;
              return (
                <motion.div key={anim.slug}
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  className="rounded-xl overflow-hidden cursor-pointer"
                  style={{
                    background: isActive ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: isActive ? '0 0 16px rgba(168,85,247,0.2)' : 'none',
                  }}>
                  <div className="p-3">
                    <p className="text-xs font-bold text-white leading-tight mb-2 truncate">{anim.name}</p>
                    <div className="flex gap-1.5">
                      <button onClick={() => onPreview?.(anim.url)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-black tracking-wider uppercase transition-all"
                        style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', color: '#67e8f9' }}>
                        <Play className="w-2.5 h-2.5" />
                        Preview
                      </button>
                      <button onClick={() => onApply?.(anim)}
                        className="flex-1 py-1.5 rounded-lg text-[9px] font-black tracking-wider uppercase transition-all"
                        style={{ background: isActive ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.06)', border: `1px solid ${isActive ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)'}`, color: isActive ? '#c084fc' : 'rgba(255,255,255,0.5)' }}>
                        {isActive ? '✓ Set' : 'Apply'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}