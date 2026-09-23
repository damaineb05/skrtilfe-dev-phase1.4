/**
 * AssetPreviewModal
 * Premium preview modal for saved DripSync assets (avatars, outfits, scenes).
 * Shows metadata, actions, confirmation on delete.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, Star, Trash2, Loader2, User,
  Shirt, Layers, Calendar, CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TYPE_META = {
  avatar:  { label: 'Avatar',  icon: User,   color: '#00D4FF' },
  outfit:  { label: 'Outfit',  icon: Shirt,  color: '#FF3366' },
  scene:   { label: 'Scene',   icon: Layers, color: '#FFD700' },
};

function ThumbnailArea({ asset }) {
  const [imgFailed, setImgFailed] = useState(false);
  const meta = TYPE_META[asset.type] || TYPE_META.avatar;
  const Icon = meta.icon;

  return (
    <div className="relative w-full" style={{ aspectRatio: '3/4', background: '#0D0D16' }}>
      {asset.thumbnailUrl && !imgFailed ? (
        <img
          src={asset.thumbnailUrl}
          alt={asset.name}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        /* Premium fallback */
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${meta.color}22 0%, ${meta.color}08 100%)`,
              border: `1px solid ${meta.color}33`,
            }}
          >
            <Icon className="w-10 h-10" style={{ color: `${meta.color}99` }} />
          </div>
          <div className="text-center">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">No preview</p>
            <p className="text-white/20 text-[10px] mt-1">Screenshot unavailable</p>
          </div>
        </div>
      )}

      {/* Bottom gradient */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(7,7,9,0.95) 0%, transparent 100%)' }}
      />

      {/* Starter badge */}
      {asset.isStarter && (
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
          style={{ background: 'rgba(255,215,0,0.18)', border: '1px solid rgba(255,215,0,0.4)', color: '#FFD700' }}
        >
          <Star className="w-3 h-3 fill-current" />
          Starter
        </div>
      )}

      {/* Type badge */}
      <div
        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
        style={{
          background: `${meta.color}18`,
          border: `1px solid ${meta.color}33`,
          color: meta.color,
        }}
      >
        <Icon className="w-3 h-3" />
        {meta.label}
      </div>

      {/* Name overlay */}
      <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
        <h3 className="text-white font-black text-lg leading-tight truncate">{asset.name}</h3>
        {asset.created_date && (
          <p className="text-white/40 text-[11px] mt-1 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {format(new Date(asset.created_date), 'MMM d, yyyy')}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AssetPreviewModal({
  asset,
  isOpen,
  onClose,
  onLoad,
  onSetStarter,
  onDelete,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSettingStarter, setIsSettingStarter] = useState(false);
  const [justLoaded, setJustLoaded] = useState(false);

  if (!asset) return null;

  const handleLoad = () => {
    onLoad(asset);
    setJustLoaded(true);
    setTimeout(() => {
      setJustLoaded(false);
      onClose();
    }, 700);
  };

  const handleSetStarter = async () => {
    setIsSettingStarter(true);
    try {
      await onSetStarter(asset.id);
    } finally {
      setIsSettingStarter(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    try {
      await onDelete(asset.id);
      toast(`"${asset.name}" deleted`);
      onClose();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="fixed z-[61] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs overflow-hidden"
            style={{
              borderRadius: 20,
              background: 'rgba(10,10,15,0.97)',
              backdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Thumbnail */}
            <ThumbnailArea asset={asset} />

            {/* Actions */}
            <div className="p-4 space-y-2">

              {/* Load */}
              <motion.button
                onClick={handleLoad}
                whileTap={{ scale: 0.97 }}
                className="w-full h-12 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-sm"
                style={{
                  background: justLoaded
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'linear-gradient(135deg, #00D4FF, #0099BB)',
                  color: '#0A0A0F',
                  transition: 'background 0.3s ease',
                }}
              >
                {justLoaded ? (
                  <><CheckCircle2 className="w-4 h-4" /> Loaded!</>
                ) : (
                  <><Download className="w-4 h-4" /> Load {TYPE_META[asset.type]?.label || 'Asset'}</>
                )}
              </motion.button>

              {/* Set Starter + Delete row */}
              <div className="flex gap-2">
                <motion.button
                  onClick={handleSetStarter}
                  disabled={isSettingStarter || asset.isStarter}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold"
                  style={{
                    background: asset.isStarter
                      ? 'rgba(255,215,0,0.15)'
                      : 'rgba(255,255,255,0.06)',
                    border: asset.isStarter
                      ? '1px solid rgba(255,215,0,0.4)'
                      : '1px solid rgba(255,255,255,0.1)',
                    color: asset.isStarter ? '#FFD700' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {isSettingStarter
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Star className={`w-3.5 h-3.5 ${asset.isStarter ? 'fill-current' : ''}`} />
                  }
                  {asset.isStarter ? 'Starter' : 'Set Starter'}
                </motion.button>

                <motion.button
                  onClick={() => setShowDeleteConfirm(true)}
                  whileTap={{ scale: 0.95 }}
                  className="h-11 w-11 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(255,51,102,0.10)',
                    border: '1px solid rgba(255,51,102,0.25)',
                    color: '#FF3366',
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Delete Confirmation overlay */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 rounded-[20px]"
                  style={{ background: 'rgba(7,7,9,0.96)', backdropFilter: 'blur(4px)' }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,51,102,0.15)', border: '1px solid rgba(255,51,102,0.3)' }}
                  >
                    <Trash2 className="w-6 h-6" style={{ color: '#FF3366' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-base">Delete "{asset.name}"?</p>
                    <p className="text-white/40 text-sm mt-1">This cannot be undone.</p>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 h-11 rounded-2xl text-sm font-bold"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirmed}
                      disabled={isDeleting}
                      className="flex-1 h-11 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
                      style={{ background: '#FF3366', color: '#fff' }}
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Delete</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}