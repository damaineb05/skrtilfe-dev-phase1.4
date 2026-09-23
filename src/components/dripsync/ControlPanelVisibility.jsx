/**
 * ControlPanelVisibility — Asset-aware control panel for DripSync
 * Unified controls for avatar, wearable, prop, environment, and future media assets
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Unlock, Copy, Trash2, RotateCcw, Grid3x3, AlertCircle } from 'lucide-react';
import { getControlsForAsset, getAssetTypeLabel, ASSET_TYPES } from './AssetSelector';
import ColorControlPanel from './ColorControlPanel';

export default function ControlPanelVisibility({
  selectedAsset,
  selectedAssetType,
  onClose,
  onDuplicate,
  onDelete,
  onReset,
  onToggleLock,
  isLocked,
  gizmoEnabled,
  onToggleGizmo,
  transformMode,
  onTransformModeChange,
  onColorChange,
  currentColors = {},
  isMobile = false,
}) {
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!selectedAsset || !selectedAssetType) {
    return null;
  }

  const controls = getControlsForAsset(selectedAssetType);
  const assetLabel = getAssetTypeLabel(selectedAssetType);
  const isDestructiveRisk = selectedAssetType === ASSET_TYPES.WEARABLE || selectedAssetType === ASSET_TYPES.PROP;

  const handleDeleteClick = () => {
    if (isDestructiveRisk && !showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  const panelContent = (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background:
                selectedAssetType === ASSET_TYPES.AVATAR
                  ? '#00D4FF'
                  : selectedAssetType === ASSET_TYPES.WEARABLE
                    ? '#FF3366'
                    : selectedAssetType === ASSET_TYPES.ENVIRONMENT
                      ? '#9D4EDD'
                      : [ASSET_TYPES.MEDIA_SURFACE, ASSET_TYPES.VIDEO_SCREEN, ASSET_TYPES.AUDIO_OBJECT, ASSET_TYPES.LIVESTREAM_PANEL].includes(selectedAssetType)
                        ? '#FFD700'
                        : '#FFD700',
            }}
          ></div>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-60)' }}>
            {assetLabel}
          </span>
          {selectedAsset?.name && (
            <span className="text-xs truncate" style={{ color: 'var(--text-40)' }}>
              • {selectedAsset.name}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded transition-colors flex-shrink-0"
          title="Close"
        >
          <X className="w-4 h-4" style={{ color: 'var(--text-60)' }} />
        </button>
      </div>

      {/* Color Controls */}
      {controls.colorPanel && (
        <ColorControlPanel
          assetType={selectedAssetType}
          selectedAssetId={selectedAsset?.id}
          onColorChange={onColorChange}
          currentColors={currentColors}
          isMobile={isMobile}
        />
      )}

      {/* Transform Controls */}
      {controls.transform && (
        <div className="border-t border-white/8 pt-3 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-40)' }}>
            Transform
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2">
            {['translate', 'rotate', 'scale'].map((mode) => (
              <button
                key={mode}
                onClick={() => onTransformModeChange?.(mode)}
                disabled={isLocked}
                className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  transformMode === mode
                    ? 'bg-blue-500/30 border border-blue-400/50'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 disabled:hover:bg-white/5'
                }`}
                style={{
                  color: transformMode === mode ? 'var(--skrt-cyan)' : 'var(--text-60)',
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Gizmo Toggle */}
          {controls.gizmo && (
            <button
              onClick={() => onToggleGizmo?.()}
              disabled={isLocked}
              className={`w-full px-3 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                gizmoEnabled
                  ? 'bg-cyan-500/30 border border-cyan-400/50'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 disabled:hover:bg-white/5'
              }`}
              style={{
                color: gizmoEnabled ? 'var(--skrt-cyan)' : 'var(--text-60)',
              }}
              title={isLocked ? 'Locked assets cannot use gizmo' : 'Toggle manipulation gizmo'}
            >
              <Grid3x3 className="w-3.5 h-3.5" />
              Gizmo {gizmoEnabled ? 'On' : 'Off'}
            </button>
          )}
        </div>
      )}

      {/* Lock Control */}
      {controls.lock && (
        <button
          onClick={() => onToggleLock?.()}
          className="w-full px-3 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-2 transition-all border"
          style={{
            background: isLocked ? 'rgba(255,51,102,0.15)' : 'rgba(255,255,255,0.05)',
            borderColor: isLocked ? 'rgba(255,51,102,0.3)' : 'rgba(255,255,255,0.1)',
            color: isLocked ? '#FF3366' : 'var(--text-60)',
          }}
        >
          {isLocked ? (
            <>
              <Lock className="w-3.5 h-3.5" />
              Locked
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5" />
              Unlocked
            </>
          )}
        </button>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {controls.duplicate && (
          <button
            onClick={() => onDuplicate?.()}
            disabled={isLocked}
            className="flex-1 px-2 py-1.5 rounded text-xs font-medium bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5 transition-colors flex items-center justify-center gap-1"
            style={{ color: 'var(--text-60)' }}
            title={isLocked ? 'Locked assets cannot duplicate' : 'Duplicate'}
          >
            <Copy className="w-3.5 h-3.5" />
            Dup
          </button>
        )}

        {controls.reset && (
          <button
            onClick={() => onReset?.()}
            disabled={isLocked}
            className="flex-1 px-2 py-1.5 rounded text-xs font-medium bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5 transition-colors flex items-center justify-center gap-1"
            style={{ color: 'var(--text-60)' }}
            title={isLocked ? 'Locked assets cannot reset' : 'Reset transform'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}

        {controls.delete && (
          <button
            onClick={handleDeleteClick}
            className={`flex-1 px-2 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 transition-all border ${
              showDeleteConfirm
                ? 'bg-red-600/40 border-red-500/50 hover:bg-red-600/50'
                : 'bg-red-500/20 border-red-400/30 hover:bg-red-500/30'
            }`}
            style={{ color: '#FF3366' }}
            title="Delete this asset"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {showDeleteConfirm ? 'Confirm?' : 'Del'}
          </button>
        )}
      </div>

      {/* Delete Confirmation Help Text */}
      {showDeleteConfirm && (
        <div className="flex gap-2 items-start px-2 py-1.5 rounded text-xs" style={{ background: 'rgba(255,51,102,0.1)', borderLeft: '2px solid #FF3366' }}>
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#FF3366' }} />
          <span style={{ color: 'var(--text-60)' }}>Click again to confirm deletion.</span>
        </div>
      )}
    </div>
  );

  // Desktop: Fixed panel
  if (!isMobile) {
    return (
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-card p-4 max-w-xs"
            style={{
              background: 'rgba(13, 13, 22, 0.85)',
              backdropFilter: 'blur(16px)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {panelContent}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Mobile: Bottom sheet (doesn't cover joystick)
  return (
    <AnimatePresence>
      {selectedAsset && (
        <>
          {/* Backdrop */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/50 z-40"
              style={{ top: 'calc(100vh - 360px)' }}
            />
          )}

          {/* Bottom Sheet — positioned to not cover mobile joystick */}
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: isExpanded ? 0 : 'calc(100% - 52px)' }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass-panel rounded-t-2xl"
            style={{
              background: 'rgba(12, 12, 20, 0.95)',
              maxHeight: 'calc(100vh - 120px)',
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Handle */}
            <div
              className="flex justify-center py-2 cursor-pointer hover:opacity-75"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="sheet-handle" />
            </div>

            {/* Content */}
            {isExpanded && (
              <div className="px-4 pb-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                {panelContent}
              </div>
            )}

            {/* Collapsed Preview */}
            {!isExpanded && (
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-60)' }}>
                  {assetLabel} • {selectedAsset?.name || 'Selected'}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-40)' }}>
                  Tap to expand
                </span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}