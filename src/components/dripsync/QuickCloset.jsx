/**
 * QuickCloset — Slot-based visual closet for equip/unequip.
 * Shows equipped items per slot with one-click unequip, and "+" to add.
 */
import React, { useMemo } from 'react';
import { Shirt, X, Plus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const SLOT_CONFIG = [
  { slot: 'headwear',  label: 'Head',       icon: '🎩' },
  { slot: 'eyewear',   label: 'Eyewear',    icon: '🕶️' },
  { slot: 'top',       label: 'Top',        icon: '👕' },
  { slot: 'outerwear', label: 'Outerwear',  icon: '🧥' },
  { slot: 'bottom',    label: 'Bottom',     icon: '👖' },
  { slot: 'footwear',  label: 'Shoes',      icon: '👟' },
  { slot: 'gloves',    label: 'Gloves',     icon: '🧤' },
  { slot: 'accessory', label: 'Accessory',  icon: '💍' },
  { slot: 'bag',       label: 'Bag',        icon: '👜' },
];

export default function QuickCloset({
  wearables = [],
  onRemoveWearable,
  onOpenStore,          // open marketplace/shop tab
  ownedProductIds = [],
}) {
  // Build a slot → wearable map (last item per slot wins for display)
  const slotMap = useMemo(() => {
    const map = {};
    wearables.forEach(w => {
      const slot = w.slot || w.category || 'accessory';
      if (!map[slot]) map[slot] = [];
      map[slot].push(w);
    });
    return map;
  }, [wearables]);

  const totalEquipped = wearables.length;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Equipped Slots</p>
        {totalEquipped > 0 && (
          <span className="text-[10px] text-cyan-400 font-mono">{totalEquipped} items</span>
        )}
      </div>

      {/* Slot grid */}
      <div className="space-y-1.5">
        {SLOT_CONFIG.map(({ slot, label, icon }) => {
          const items = slotMap[slot] || [];
          const primary = items[0];

          return (
            <motion.div key={slot}
              layout
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                primary
                  ? 'bg-white/6 border-cyan-500/25 hover:border-cyan-500/50'
                  : 'bg-white/[0.02] border-white/6'
              }`}>
              {/* Slot icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${
                primary ? 'bg-cyan-600/20' : 'bg-white/5'
              }`}>
                {icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider leading-none">{label}</p>
                {primary ? (
                  <p className="text-xs text-white font-medium truncate mt-0.5">{primary.name}</p>
                ) : (
                  <p className="text-xs text-white/25 mt-0.5">Empty</p>
                )}
                {items.length > 1 && (
                  <p className="text-[10px] text-cyan-400">+{items.length - 1} more</p>
                )}
              </div>

              {/* Actions */}
              {primary ? (
                <button onClick={() => onRemoveWearable(primary.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                  title="Unequip">
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button onClick={onOpenStore}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors flex-shrink-0"
                  title="Browse store">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Empty state CTA */}
      {totalEquipped === 0 && (
        <div className="mt-4 text-center">
          <button onClick={onOpenStore}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/15 border border-cyan-500/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-600/25 transition-colors">
            <ShoppingBag className="w-3.5 h-3.5" />
            Browse Store
          </button>
        </div>
      )}

      {/* Remove all */}
      {totalEquipped > 0 && (
        <button onClick={() => wearables.forEach(w => onRemoveWearable(w.id))}
          className="w-full mt-2 py-1.5 rounded-lg text-[10px] text-white/25 hover:text-red-400 hover:bg-red-500/5 transition-colors border border-transparent hover:border-red-500/10">
          Remove all wearables
        </button>
      )}
    </div>
  );
}