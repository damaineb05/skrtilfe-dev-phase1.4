/**
 * StudioLeftSidebar — Navigation + Outfit quick actions
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Shirt, Layout, User, Palette, ShoppingBag, Settings, Save, Plus } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'closet', label: 'Closet', icon: Shirt },
  { id: 'outfits', label: 'Outfits', icon: Layout },
  { id: 'avatars', label: 'Avatars', icon: User },
  { id: 'studio', label: 'Studio', icon: Palette, active: true },
  { id: 'collection', label: 'Collection', icon: ShoppingBag },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function StudioLeftSidebar({
  activeTab, onTabChange, currentOutfitName, onOutfitNameChange,
  onSaveOutfit, outfitCount,
}) {
  return (
    <div
      className="w-64 flex flex-col border-r overflow-hidden"
      style={{
        background: 'rgba(10,10,16,0.6)',
        borderColor: 'rgba(0,212,255,0.08)',
      }}
    >
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <h1 className="text-2xl font-harvest font-bold text-white mb-2">STUDIO</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest">Customize Avatar</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = item.active || activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
              style={{
                background: isActive ? 'rgba(0,212,255,0.12)' : 'transparent',
                color: isActive ? '#00D4FF' : 'rgba(255,255,255,0.5)',
                border: isActive ? '1px solid rgba(0,212,255,0.25)' : '1px solid transparent',
              }}
              whileHover={{ x: 4 }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Current Outfit Card */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 text-gray-400">
          Current Outfit
        </p>
        <div
          className="rounded-lg p-4 mb-3"
          style={{
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
          }}
        >
          <input
            type="text"
            value={currentOutfitName}
            onChange={e => onOutfitNameChange(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-white outline-none mb-2"
            placeholder="Outfit name"
          />
          <p className="text-[10px] text-gray-400">
            {outfitCount} saved outfit{outfitCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Outfit Actions */}
        <div className="space-y-2">
          <button
            onClick={onSaveOutfit}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
            style={{
              background: 'rgba(0,212,255,0.15)',
              color: '#00D4FF',
              border: '1px solid rgba(0,212,255,0.25)',
            }}
            onMouseEnter={e => (e.target.style.background = 'rgba(0,212,255,0.25)')}
            onMouseLeave={e => (e.target.style.background = 'rgba(0,212,255,0.15)')}
          >
            <Save className="w-4 h-4" />
            Save Outfit
          </button>
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(255,255,255,0.12)';
              e.target.style.color = 'rgba(255,255,255,0.8)';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'rgba(255,255,255,0.08)';
              e.target.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            <Plus className="w-4 h-4" />
            Save As New
          </button>
        </div>
      </div>
    </div>
  );
}