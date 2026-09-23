/**
 * StyleTabPanel
 * ─────────────────────────────────────────────────────────────
 * The unified Style Tab — single source of truth for:
 *   • Avatar type (male / female) — drives animation filtering
 *   • Appearance (skin, hair, eyes)
 *   • Wearables (categorized, skin-isolated)
 *   • Animations (gender-locked)
 *   • Saved looks
 *
 * Replaces the old CustomizationPanel + GenderSelector combo
 * as the primary style interface.
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Palette, Shirt, Zap, BookOpen, Save, Loader2, RotateCcw, Trash2, Copy } from 'lucide-react';

import StyleAvatarTab    from './StyleAvatarTab';
import StyleAppearanceTab from './StyleAppearanceTab';
import StyleWearablesTab  from './StyleWearablesTab';
import StyleAnimationsTab from './StyleAnimationsTab';
import { normalizeAvatarType, createDefaultAvatarState, remapAnimationForGender } from '../../../dripsync/core/DripSyncAvatarState';

// ── Tab config ────────────────────────────────────────────────
const TABS = [
  { id: 'avatar',     label: 'Avatar',    icon: User,    accent: '#06b6d4' },
  { id: 'appearance', label: 'Looks',     icon: Palette, accent: '#ec4899' },
  { id: 'wearables',  label: 'Drip',      icon: Shirt,   accent: '#a855f7' },
  { id: 'animations', label: 'Motion',    icon: Zap,     accent: '#f59e0b' },
  { id: 'looks',      label: 'Saved',     icon: BookOpen, accent: '#10b981' },
];

export default function StyleTabPanel({
  // Avatar state
  avatarType,
  onAvatarTypeChange,
  customization,
  onCustomizationChange,
  wearables = [],
  onRemoveWearable,
  onSelectWearable,
  selectedWearableId,
  defaultAvatars = [],
  onLoadDefault,
  onCreateStreamoji,
  // Animations
  onPreviewAnimation,
  onApplyAnimation,
  activeAnimationSlug,
  // Looks
  savedLooks = [],
  onSaveLook,
  onLoadLook,
  onDeleteLook,
  onDuplicateLook,
  // Save avatar
  onSaveAvatar,
  isSavingAvatar = false,
  onActiveTabChange,
}) {
  const [activeTab, setActiveTab] = useState('avatar');

  const handleTabChange = useCallback((id) => {
    setActiveTab(id);
    onActiveTabChange?.(id);
  }, [onActiveTabChange]);

  // Normalize avatarType for the whole panel
  const gender = normalizeAvatarType(avatarType);

  // When avatar type changes: remap active animation + call parent
  const handleAvatarTypeChange = useCallback((newType) => {
    const normalized = normalizeAvatarType(newType);
    onAvatarTypeChange?.(normalized);
    // Parent should clear / remap animation in DripSync.jsx
  }, [onAvatarTypeChange]);

  const handleApplyAnimation = useCallback((anim) => {
    onApplyAnimation?.(anim);
  }, [onApplyAnimation]);

  return (
    <div className="h-full flex flex-col" style={{ background: 'transparent' }}>
      {/* ── Tab bar ──────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-3 pt-3 pb-0">
        <div className="flex gap-0.5 p-1 rounded-2xl" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                whileTap={{ scale: 0.96 }}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl relative transition-colors"
                style={{
                  background: isActive ? `${tab.accent}14` : 'transparent',
                  border: `1px solid ${isActive ? tab.accent + '40' : 'transparent'}`,
                }}
              >
                <Icon className="w-4 h-4 transition-colors" style={{ color: isActive ? tab.accent : 'rgba(255,255,255,0.3)' }} />
                <span className="text-[8px] font-black tracking-wider uppercase leading-none transition-colors"
                  style={{ color: isActive ? tab.accent : 'rgba(255,255,255,0.25)' }}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div layoutId="styleTabIndicator"
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full"
                    style={{ background: tab.accent }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden min-h-0">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="h-full flex flex-col">

            {activeTab === 'avatar' && (
              <StyleAvatarTab
                avatarType={gender}
                onAvatarTypeChange={handleAvatarTypeChange}
                defaultAvatars={defaultAvatars}
                onLoadDefault={onLoadDefault}
                onCreateStreamoji={onCreateStreamoji}
              />
            )}

            {activeTab === 'appearance' && (
              <StyleAppearanceTab
                customization={customization}
                onChange={onCustomizationChange}
              />
            )}

            {activeTab === 'wearables' && (
              <StyleWearablesTab
                wearables={wearables}
                onRemove={onRemoveWearable}
                onSelect={onSelectWearable}
                selectedId={selectedWearableId}
              />
            )}

            {activeTab === 'animations' && (
              <StyleAnimationsTab
                avatarType={gender}
                onPreview={onPreviewAnimation}
                onApply={handleApplyAnimation}
                activeSlug={activeAnimationSlug}
              />
            )}

            {activeTab === 'looks' && (
              <SavedLooksTab
                savedLooks={savedLooks}
                onSave={onSaveLook}
                onLoad={onLoadLook}
                onDelete={onDeleteLook}
                onDuplicate={onDuplicateLook}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Footer: Save avatar ───────────────────────────────── */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={onSaveAvatar}
          disabled={isSavingAvatar}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.25) 0%, rgba(6,182,212,0.2) 100%)',
            border: '1px solid rgba(168,85,247,0.35)',
            color: '#c084fc',
            boxShadow: '0 4px 20px rgba(168,85,247,0.15)',
          }}
        >
          {isSavingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSavingAvatar ? 'Saving…' : 'Save Avatar'}
        </button>
      </div>
    </div>
  );
}

// ── Saved Looks sub-tab ───────────────────────────────────────
function SavedLooksTab({ savedLooks = [], onSave, onLoad, onDelete, onDuplicate }) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-4 space-y-3">
      {/* Save current */}
      <button onClick={onSave}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all"
        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
        <Save className="w-4 h-4" />
        Save Current Look
      </button>

      {savedLooks.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-white/20 text-sm">No saved looks yet</p>
          <p className="text-white/12 text-xs mt-1">Save your current outfit to build a collection</p>
        </div>
      ) : (
        <div className="space-y-2">
          {savedLooks.map(look => (
            <motion.div key={look.id || look.slug}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.3)' }}>
                {look.thumbnail_url ? (
                  <img src={look.thumbnail_url} alt={look.name} className="w-full h-full object-cover" />
                ) : <span className="text-xl">👗</span>}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{look.name}</p>
                <p className="text-[10px] text-white/30">
                  {look.avatarType || 'Unknown'} · {look.equippedItems ? Object.values(look.equippedItems).filter(Boolean).length : 0} items
                </p>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => onLoad?.(look)} title="Load"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all hover:opacity-80"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>▶</button>
                <button onClick={() => onDuplicate?.(look)} title="Duplicate"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                  <Copy className="w-3 h-3" />
                </button>
                <button onClick={() => onDelete?.(look.id || look.slug)} title="Delete"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}