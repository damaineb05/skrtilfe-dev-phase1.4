import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Check } from 'lucide-react';
import { WEARABLE_SLOT_LABELS, classifyWearableSlot } from '../../../dripsync/core/DripSyncAvatarState';

const SLOT_ORDER = ['top', 'bottom', 'shoes', 'jacket', 'hat', 'accessory', 'jewellery'];

/**
 * StyleWearablesTab
 * Category-filtered wearable display with equipped state,
 * remove buttons, and skin-isolation indicators for shoes.
 */
export default function StyleWearablesTab({ wearables = [], onRemove, onSelect, selectedId }) {
  const [activeSlot, setActiveSlot] = useState('all');

  // Group wearables by slot
  const grouped = useMemo(() => {
    const g = {};
    wearables.forEach(w => {
      const slot = w.slot || classifyWearableSlot(w.category || w.slot || '');
      if (!g[slot]) g[slot] = [];
      g[slot].push({ ...w, _slot: slot });
    });
    return g;
  }, [wearables]);

  const slotCounts = useMemo(() => {
    const counts = { all: wearables.length };
    Object.entries(grouped).forEach(([s, items]) => { counts[s] = items.length; });
    return counts;
  }, [grouped, wearables.length]);

  const displayed = useMemo(() => {
    if (activeSlot === 'all') return wearables.map(w => ({ ...w, _slot: w.slot || classifyWearableSlot(w.category || w.slot || '') }));
    return (grouped[activeSlot] || []);
  }, [activeSlot, grouped, wearables]);

  const slots = [{ id: 'all', label: 'All', emoji: '✦', skinIsolated: false }, ...SLOT_ORDER.map(s => ({ id: s, ...WEARABLE_SLOT_LABELS[s] }))].filter(s => s.id === 'all' || (slotCounts[s.id] ?? 0) > 0 || true);

  return (
    <div className="h-full flex flex-col">
      {/* Slot filter */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {slots.map(s => {
            const count = slotCounts[s.id] ?? 0;
            const isActive = activeSlot === s.id;
            return (
              <button key={s.id} onClick={() => setActiveSlot(s.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all"
                style={{
                  background: isActive ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isActive ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <span className="text-sm">{s.emoji}</span>
                <span className="text-[9px] font-black tracking-wider uppercase"
                  style={{ color: isActive ? '#c084fc' : 'rgba(255,255,255,0.4)' }}>
                  {s.label ?? s.id}
                </span>
                {count > 0 && (
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: isActive ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.08)', color: isActive ? '#c084fc' : 'rgba(255,255,255,0.35)' }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Wearable grid */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-4">
        {displayed.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <ShoppingBag className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/25 text-sm font-semibold mb-1">Nothing equipped</p>
            <p className="text-white/15 text-xs">Load from the Closet to dress your avatar</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <AnimatePresence>
              {displayed.map(w => {
                const isSelected = selectedId === w.id;
                const slotMeta = WEARABLE_SLOT_LABELS[w._slot] || { label: w._slot, emoji: '📦', skinIsolated: false };
                return (
                  <motion.div key={w.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.18 }}
                    className="relative rounded-xl overflow-hidden cursor-pointer"
                    style={{
                      background: isSelected ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSelected ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    }}
                    onClick={() => onSelect?.(w.id)}>

                    {/* Thumbnail */}
                    <div className="w-full aspect-square flex items-center justify-center overflow-hidden"
                      style={{ background: 'rgba(0,0,0,0.2)' }}>
                      {w.thumbnailUrl ? (
                        <img src={w.thumbnailUrl} alt={w.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{slotMeta.emoji}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2.5">
                      <p className="text-xs font-bold text-white truncate leading-tight">{w.name}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-md"
                          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
                          {slotMeta.label}
                        </span>
                        {slotMeta.skinIsolated && (
                          <span className="text-[8px] font-black tracking-wider text-yellow-400/60" title="Skin-isolated: won't inherit skin color">
                            🔒
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Selected check */}
                    {isSelected && (
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: '#a855f7' }}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove?.(w.id); }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(239,68,68,0.8)' }}>
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}