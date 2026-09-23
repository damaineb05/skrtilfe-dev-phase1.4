import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Trash2, Star, Share2, Eye, Check } from 'lucide-react';
import MiniAvatarPreview from './MiniAvatarPreview';
import { format } from 'date-fns';
import { normalizeAsset } from '@/hooks/useAvatarSaveLoad';

const OVERLAY_FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export default function DripSyncAssetPreviewModal({
  isOpen,
  onClose,
  asset,
  onLoad,
  onDelete,
  onSetStarter,
  onShare,
  isMobile = false,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const normalized = useMemo(() => asset ? normalizeAsset(asset) : null, [asset]);

  if (!asset || !normalized) return null;

  const thumb = normalized.thumbnailUrl || null;
  const wearableCount = normalized.wearables?.length || 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(asset);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLoad = async () => {
    setJustSaved(true);
    await onLoad(asset);
    setTimeout(() => {
      setJustSaved(false);
      onClose();
    }, 800);
  };

  const handleSetStarter = async () => {
    await onSetStarter(asset);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`glass-panel-drip border border-white/10 p-0 overflow-hidden ${
          isMobile ? 'max-w-full h-screen rounded-none' : 'max-w-2xl max-h-[85vh]'
        }`}
      >
        <motion.div
          {...OVERLAY_FADE}
          className="flex flex-col h-full"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-white">{asset.name}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs uppercase tracking-wider text-white/40">
                    {asset.type === 'avatar' ? '👤 Avatar' : asset.type === 'look' ? '✨ Look' : asset.type}
                  </span>
                  {normalized.gender && (
                    <span className="text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-bold"
                      style={{
                        background: normalized.gender === 'feminine' ? 'rgba(236,72,153,0.2)' : 'rgba(6,182,212,0.2)',
                        color: normalized.gender === 'feminine' ? '#ec4899' : '#00D4FF',
                      }}>
                      {normalized.gender === 'feminine' ? '♀ Female' : '♂ Male'}
                    </span>
                  )}
                  {asset.isStarter && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 uppercase tracking-wider">
                      ⭐ Starter
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Content */}
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'flex flex-col' : 'flex'}`}>
            {/* Preview */}
            <div className={`${isMobile ? 'w-full h-64' : 'w-2/3'} relative overflow-hidden`}
              style={{ background: 'rgba(0,0,0,0.4)' }}>
              {thumb ? (
                <img src={thumb} alt={asset.name} className="w-full h-full object-cover" />
              ) : normalized.avatarUrl ? (
                <div className="w-full h-full" style={{ background: 'rgba(10,10,20,0.8)' }}>
                  <MiniAvatarPreview
                    avatarUrl={normalized.avatarUrl}
                    wearables={normalized.wearables}
                    customization={normalized.customization}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl">{asset.type === 'look' ? '✨' : '👤'}</span>
                    <p className="text-white/30 text-xs mt-2 uppercase tracking-wider">No preview</p>
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className={`${isMobile ? 'w-full p-4' : 'w-1/3 p-4 border-l border-white/10'} space-y-4`}>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Type</p>
                <p className="text-sm text-white font-medium capitalize">{asset.type}</p>
              </div>

              {normalized.gender && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Gender</p>
                  <p className="text-sm text-white/70 capitalize">{normalized.gender}</p>
                </div>
              )}

              {normalized.source && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Source</p>
                  <p className="text-sm text-white/70 uppercase">{normalized.source}</p>
                </div>
              )}

              {asset.created_date && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Created</p>
                  <p className="text-sm text-white/70">
                    {format(new Date(asset.created_date), 'MMM d, yyyy')}
                  </p>
                </div>
              )}

              {wearableCount > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Wearables</p>
                  <p className="text-sm text-white/70">{wearableCount} item{wearableCount !== 1 ? 's' : ''}</p>
                </div>
              )}

              {normalized.customization?.eyeColor && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Eye Color</p>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-white/20"
                      style={{ background: normalized.customization.eyeColor }} />
                    <span className="text-xs text-white/50">{normalized.customization.eyeColor}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className={`border-t border-white/10 p-4 gap-2 flex ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <motion.div
              className="flex-1"
              animate={justSaved ? { scale: 1.02 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={handleLoad}
                className={`w-full font-bold text-sm uppercase tracking-wider transition-all ${
                  justSaved
                    ? 'bg-green-500 hover:bg-green-600 text-black'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-black'
                }`}
              >
                {justSaved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Load
                  </>
                )}
              </Button>
            </motion.div>

            {asset.type === 'avatar' && !asset.isStarter && (
              <Button
                onClick={handleSetStarter}
                variant="outline"
                className="flex-1 border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm uppercase tracking-wider"
              >
                <Star className="w-4 h-4 mr-2" />
                Set Starter
              </Button>
            )}

            {onShare && (
              <Button
                onClick={() => onShare(asset)}
                variant="outline"
                className="flex-1 border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm uppercase tracking-wider"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}

            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
              className="flex-1 text-sm uppercase tracking-wider"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}