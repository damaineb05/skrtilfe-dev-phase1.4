import React, { useState } from 'react';
import { Trash2, Star, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import AssetPreviewModal from './AssetPreviewModal';

export default function DefaultAvatarsSection({
  defaultAvatars = [],
  onLoad = () => {},
  onReplace = () => {},
  onDelete = () => {},
  onSetStarter = () => {},
}) {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const handleCardClick = (avatar) => {
    setSelectedAvatar(avatar);
    setPreviewOpen(true);
  };

  const handleLoad = (avatar) => {
    setLoadingId(avatar.id);
    onLoad(avatar);
    setTimeout(() => setLoadingId(null), 1500);
  };

  const handleSetStarter = async (assetId) => {
    await onSetStarter(assetId);
    toast(`Starter avatar updated`);
  };

  const handleDelete = async (assetId) => {
    const avatar = defaultAvatars.find(a => a.id === assetId);
    onDelete(avatar || { id: assetId });
  };

  const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="border-t border-white/10 p-4">
      <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
        Saved Avatars
      </h4>

      {defaultAvatars.length === 0 ? (
        <div
          className="text-center py-10 px-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
        >
          <div
            className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.15)' }}
          >
            <User className="w-6 h-6" style={{ color: 'rgba(0,212,255,0.4)' }} />
          </div>
          <p className="text-white/40 text-xs font-semibold mb-1">No saved avatars yet</p>
          <p className="text-white/20 text-[10px]">Save your current setup above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {defaultAvatars.map((avatar, i) => {
            const isLoading = loadingId === avatar.id;
            return (
              <motion.div
                key={avatar.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleCardClick(avatar)}
                className="group relative cursor-pointer rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {/* Thumbnail */}
                <div className="relative" style={{ aspectRatio: '1/1', background: '#12121E' }}>
                  {avatar.thumbnailUrl ? (
                    <img
                      src={avatar.thumbnailUrl}
                      alt={avatar.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.2)' }}
                      >
                        <span className="text-sm font-bold" style={{ color: 'rgba(0,212,255,0.7)' }}>
                          {getInitials(avatar.name)}
                        </span>
                      </div>
                      <p className="text-[9px] text-white/30 text-center">No preview</p>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}>
                    <span className="text-white/90 text-[10px] font-bold uppercase tracking-wider bg-black/40 px-3 py-1.5 rounded-full">
                      View
                    </span>
                  </div>

                  {/* Starter badge */}
                  {avatar.isStarter && (
                    <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,215,0,0.9)' }}>
                      <Star className="w-2.5 h-2.5 fill-current text-black" />
                    </div>
                  )}

                  {/* Loading state */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.65)' }}>
                      <Loader2 className="w-5 h-5 animate-spin text-skrt-cyan" />
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="px-2 py-1.5" style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <p className="text-[10px] font-semibold text-white truncate">{avatar.name || 'Saved Avatar'}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <AssetPreviewModal
        asset={selectedAvatar ? {
          ...selectedAvatar,
          type: 'avatar',
          isStarter: selectedAvatar.isStarter || selectedAvatar.isStarterAvatar,
        } : null}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onLoad={(a) => { handleLoad(a); setPreviewOpen(false); }}
        onSetStarter={handleSetStarter}
        onDelete={handleDelete}
      />
    </div>
  );
}