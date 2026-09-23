/**
 * StudioRightPanel — Dynamic tabs for Face, Hair, Outfit, Accessories, Animations
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

import StudioFaceTab from './tabs/StudioFaceTab';
import StudioHairTab from './tabs/StudioHairTab';
import StudioOutfitTab from './tabs/StudioOutfitTab';
import StudioAccessoriesTab from './tabs/StudioAccessoriesTab';
import StudioAnimationsTab from './tabs/StudioAnimationsTab';

const TABS = [
  { id: 'face', label: 'Face', icon: '👤' },
  { id: 'hair', label: 'Hair', icon: '💇' },
  { id: 'outfit', label: 'Outfit', icon: '👕' },
  { id: 'accessories', label: 'Accessories', icon: '✨' },
  { id: 'animations', label: 'Animations', icon: '🎬' },
];

export default function StudioRightPanel({
  activeTab, onTabChange, wearables, customization,
  customAnimations, onCustomizationChange, onAddWearable,
  onRemoveWearable, onAddAnimation,
}) {
  return (
    <div
      className="w-72 flex flex-col border-l overflow-hidden"
      style={{
        background: 'rgba(10,10,16,0.6)',
        borderColor: 'rgba(0,212,255,0.08)',
      }}
    >
      {/* Tab Navigation */}
      <div
        className="flex items-center gap-1 p-2 border-b overflow-x-auto"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {TABS.map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all"
            style={{
              background: activeTab === tab.id ? 'rgba(0,212,255,0.12)' : 'transparent',
              color: activeTab === tab.id ? '#00D4FF' : 'rgba(255,255,255,0.4)',
              border: activeTab === tab.id ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
            }}
            whileHover={{ scale: 1.05 }}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'face' && (
            <motion.div
              key="face"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <StudioFaceTab
                customization={customization}
                onCustomizationChange={onCustomizationChange}
              />
            </motion.div>
          )}

          {activeTab === 'hair' && (
            <motion.div
              key="hair"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <StudioHairTab
                customization={customization}
                onCustomizationChange={onCustomizationChange}
              />
            </motion.div>
          )}

          {activeTab === 'outfit' && (
            <motion.div
              key="outfit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <StudioOutfitTab
                wearables={wearables}
                onAddWearable={onAddWearable}
                onRemoveWearable={onRemoveWearable}
              />
            </motion.div>
          )}

          {activeTab === 'accessories' && (
            <motion.div
              key="accessories"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <StudioAccessoriesTab
                wearables={wearables}
                onAddWearable={onAddWearable}
                onRemoveWearable={onRemoveWearable}
              />
            </motion.div>
          )}

          {activeTab === 'animations' && (
            <motion.div
              key="animations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <StudioAnimationsTab
                customAnimations={customAnimations}
                onAddAnimation={onAddAnimation}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}