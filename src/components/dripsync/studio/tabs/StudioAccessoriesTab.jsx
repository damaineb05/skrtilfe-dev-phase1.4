/**
 * StudioAccessoriesTab — Glasses, chains, hats, etc.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const ACCESSORIES = [
  { id: 1, name: 'Cyber Sunglasses', slot: 'eyes', icon: '🕶️' },
  { id: 2, name: 'Gold Chain', slot: 'neck', icon: '⛓️' },
  { id: 3, name: 'Hacker Hat', slot: 'head', icon: '🎩' },
  { id: 4, name: 'Wrist Band', slot: 'wrist', icon: '⌚' },
  { id: 5, name: 'Neck Scarf', slot: 'neck', icon: '🧣' },
  { id: 6, name: 'Glowing Rings', slot: 'hands', icon: '💍' },
];

export default function StudioAccessoriesTab({
  wearables, onAddWearable, onRemoveWearable,
}) {
  const equippedAccessories = wearables.filter(w => 
    ['eyes', 'neck', 'head', 'wrist', 'hands'].includes(w.slot)
  );

  const handleEquipAccessory = accessory => {
    onAddWearable({
      id: accessory.id,
      name: accessory.name,
      slot: accessory.slot,
      icon: accessory.icon,
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4 text-gray-400">
          Accessories
        </p>

        {/* Accessory Grid */}
        <div className="grid grid-cols-2 gap-3">
          {ACCESSORIES.map(acc => (
            <motion.button
              key={acc.id}
              onClick={() => handleEquipAccessory(acc)}
              className="p-3 rounded-lg text-center transition-all border"
              style={{
                background: 'rgba(0,212,255,0.06)',
                border: '1px solid rgba(0,212,255,0.15)',
              }}
              whileHover={{ 
                scale: 1.05,
                background: 'rgba(0,212,255,0.12)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-2xl mb-2">{acc.icon}</div>
              <p className="text-xs font-semibold text-white mb-1">{acc.name}</p>
              <p className="text-[9px] text-cyan-400 uppercase tracking-wider">{acc.slot}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Equipped Accessories */}
      {equippedAccessories.length > 0 && (
        <div
          className="p-3 rounded-lg border"
          style={{
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.15)',
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 text-cyan-400">
            Equipped Accessories
          </p>
          <div className="space-y-2">
            {equippedAccessories.map(acc => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-2 rounded"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{acc.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{acc.name}</p>
                    <p className="text-[9px] text-gray-400">{acc.slot}</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => onRemoveWearable(acc.id)}
                  className="p-1 rounded hover:scale-110"
                  style={{ color: '#FF3366' }}
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}