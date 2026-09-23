/**
 * StudioOutfitTab — Wearable grid + colorway selector
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const SAMPLE_WEARABLES = [
  { id: 1, name: 'Cyberpunk Jacket', category: 'tops', colorways: ['black', 'cyan', 'red'] },
  { id: 2, name: 'Neon Pants', category: 'bottoms', colorways: ['black', 'purple', 'yellow'] },
  { id: 3, name: 'Combat Boots', category: 'shoes', colorways: ['black', 'white', 'red'] },
  { id: 4, name: 'Leather Vest', category: 'vests', colorways: ['black', 'brown'] },
];

export default function StudioOutfitTab({
  wearables, onAddWearable, onRemoveWearable,
}) {
  const [selectedColorway, setSelectedColorway] = useState({});

  const handleSelectColorway = (wearableId, colorway) => {
    setSelectedColorway(prev => ({ ...prev, [wearableId]: colorway }));
  };

  const handleEquip = wearable => {
    const colorway = selectedColorway[wearable.id] || wearable.colorways[0];
    onAddWearable({
      id: wearable.id,
      name: wearable.name,
      colorway,
      category: wearable.category,
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4 text-gray-400">
          Available Wearables
        </p>

        {/* Wearable Grid */}
        <div className="space-y-3">
          {SAMPLE_WEARABLES.map(wearable => (
            <motion.div
              key={wearable.id}
              className="p-3 rounded-lg"
              style={{
                background: 'rgba(0,212,255,0.06)',
                border: '1px solid rgba(0,212,255,0.15)',
              }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Name */}
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">{wearable.name}</h4>
                <span className="text-[9px] font-mono text-cyan-400 uppercase">
                  {wearable.category}
                </span>
              </div>

              {/* Colorways */}
              <div className="flex items-center gap-2 mb-3">
                {wearable.colorways.map(color => (
                  <motion.button
                    key={color}
                    onClick={() => handleSelectColorway(wearable.id, color)}
                    className="w-8 h-8 rounded-lg border-2 transition-all"
                    style={{
                      background: color === 'black' ? '#1a1a1a' : 
                                 color === 'cyan' ? '#00D4FF' :
                                 color === 'red' ? '#FF3366' :
                                 color === 'purple' ? '#9933ff' :
                                 color === 'yellow' ? '#FFD700' :
                                 color === 'white' ? '#ffffff' :
                                 color === 'brown' ? '#654321' : color,
                      borderColor: selectedColorway[wearable.id] === color ? '#00D4FF' : 'rgba(255,255,255,0.2)',
                      boxShadow: selectedColorway[wearable.id] === color ? '0 0 12px rgba(0,212,255,0.6)' : 'none',
                    }}
                    whileHover={{ scale: 1.15 }}
                    title={color}
                  />
                ))}
              </div>

              {/* Equip Button */}
              <motion.button
                onClick={() => handleEquip(wearable)}
                className="w-full py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                style={{
                  background: 'rgba(0,212,255,0.15)',
                  color: '#00D4FF',
                  border: '1px solid rgba(0,212,255,0.25)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-3.5 h-3.5" />
                Equip
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Equipped Items */}
      {wearables.length > 0 && (
        <div
          className="p-3 rounded-lg border"
          style={{
            background: 'rgba(255,51,102,0.06)',
            border: '1px solid rgba(255,51,102,0.15)',
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 text-red-400">
            Equipped ({wearables.length})
          </p>
          <div className="space-y-1">
            {wearables.map(w => (
              <div key={w.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{w.name}</span>
                <motion.button
                  onClick={() => onRemoveWearable(w.id)}
                  className="p-1 rounded"
                  style={{ color: '#FF3366' }}
                  whileHover={{ scale: 1.2 }}
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}