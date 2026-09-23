import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Trash2, Star, User, Sparkles, RefreshCw, Package, Globe, Globe2 } from 'lucide-react';
import DripSyncAssetPreviewModal from './DripSyncAssetPreviewModal';
import { normalizeAsset } from '@/hooks/useAvatarSaveLoad';

const FADE_UP = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2 },
};

// Resolve thumbnail from asset (V1 + V2 compat)
function resolveThumb(asset) {
  return asset.thumbnailUrl || asset.metadata?.thumbnailUrl || null;
}

// Resolve type display info
function getTypeInfo(type) {
  switch (type) {
    case 'avatar': return { icon: '👤', label: 'Avatar', color: '#00D4FF' };
    case 'look':   return { icon: '✨', label: 'Look',   color: '#FF3366' };
    case 'outfit': return { icon: '👕', label: 'Outfit', color: '#FFD700' };
    case 'scene':  return { icon: '🌍', label: 'Scene',  color: '#a78bfa' };
    default:       return { icon: '📦', label: type,     color: '#888' };
  }
}

function AssetCard({ asset, onLoad, onPreview, onDelete, onSetStarter, onToggleTemplate }) {
  const thumb = resolveThumb(asset);
  const typeInfo = getTypeInfo(asset.type);
  const normalized = useMemo(() => normalizeAsset(asset), [asset]);
  const [togglingTpl, setTogglingTpl] = useState(false);
  const isTemplate = !!asset.is_public_template;

  const handleToggleTemplate = async (e) => {
    e.stopPropagation();
    if (!onToggleTemplate || togglingTpl) return;
    setTogglingTpl(true);
    try {
      await onToggleTemplate(asset.id, !isTemplate, asset.name);
    } finally {
      setTogglingTpl(false);
    }
  };

  return (
    <motion.div
      layout
      className="group relative rounded-xl overflow-hidden cursor-pointer transition-all"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      whileHover={{ scale: 1.02, borderColor: 'rgba(0,212,255,0.3)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onPreview(asset)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
        {thumb ? (
          <img
            src={thumb}
            alt={asset.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        {/* Fallback placeholder */}
        <div
          className="w-full h-full flex-col items-center justify-center gap-1"
          style={{ display: thumb ? 'none' : 'flex', background: 'radial-gradient(circle at 50% 40%, rgba(0,212,255,0.08), rgba(0,0,0,0) 70%)' }}
        >
          <span className="text-3xl">{typeInfo.icon}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: typeInfo.color, opacity: 0.7 }}>
            {typeInfo.label}
          </span>
        </div>

        {/* Starter badge */}
        {asset.isStarter && (
          <div
            className="absolute top-1.5 right-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
            style={{ background: '#FFD700', color: '#000' }}
          >
            <Star className="w-2.5 h-2.5" />
            Default
          </div>
        )}

        {/* Gender badge */}
        {normalized?.gender && (
          <div
            className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider"
            style={{
              background: normalized.gender === 'feminine' ? 'rgba(236,72,153,0.8)' : 'rgba(6,182,212,0.8)',
              color: '#fff',
            }}
          >
            {normalized.gender === 'feminine' ? '♀' : '♂'}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
          style={{ background: 'rgba(0,0,0,0.65)' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onLoad(asset); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105"
            style={{ background: '#00D4FF', color: '#000' }}
            title="Load this avatar"
          >
            Load
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(asset); }}
            className="p-2 rounded-lg transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
            title="Preview"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Share-as-template toggle — only for avatar assets. Owner-publishes;
          others can only read a copy. Never mutates anyone else's record. */}
      {asset.type === 'avatar' && onToggleTemplate && (
        <button
          onClick={handleToggleTemplate}
          disabled={togglingTpl}
          className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
          style={{
            background: isTemplate ? 'rgba(0,212,255,0.85)' : 'rgba(255,255,255,0.12)',
            color: isTemplate ? '#001018' : 'rgba(255,255,255,0.7)',
            // place below the gender badge by offsetting to the right of it
            left: normalized?.gender ? '26px' : '6px',
            top: '6px',
          }}
          title={isTemplate ? 'Shared as community template — click to unshare' : 'Share as community template'}
        >
          {isTemplate ? <Globe2 className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
          {isTemplate ? 'Shared' : 'Share'}
        </button>
      )}

      {/* Label row */}
      <div className="px-2.5 py-2">
        <p className="text-[11px] font-bold text-white truncate leading-tight">{asset.name || 'Untitled'}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: typeInfo.color }}>
            {typeInfo.label}
          </span>
          {normalized?.wearables?.length > 0 && (
            <span className="text-[8px] text-white/30">
              · {normalized.wearables.length} item{normalized.wearables.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function DripSyncLibraryPanel({
  assets = [],
  onLoadAsset,
  onDeleteAsset,
  onSetStarter,
  onToggleTemplate,
  onShare,
  isMobile = false,
}) {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedAssetForPreview, setSelectedAssetForPreview] = useState(null);

  const avatars   = useMemo(() => assets.filter(a => a.type === 'avatar'), [assets]);
  const looks     = useMemo(() => assets.filter(a => a.type === 'look'), [assets]);
  const starters  = useMemo(() => assets.filter(a => a.isStarter), [assets]);

  const tabs = [
    { id: 'all',      label: 'All',      count: assets.length },
    { id: 'avatars',  label: 'Avatars',  count: avatars.length },
    { id: 'looks',    label: 'Looks',    count: looks.length },
    { id: 'starters', label: 'Starter',  count: starters.length },
  ];

  const tabData = useMemo(() => {
    switch (selectedTab) {
      case 'avatars':  return avatars;
      case 'looks':    return looks;
      case 'starters': return starters;
      default:         return assets;
    }
  }, [selectedTab, assets, avatars, looks, starters]);

  return (
    <div className="flex flex-col" style={{ minHeight: 0 }}>
      {/* Tabs */}
      <div className="px-3 pt-3 pb-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {tabs.map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
              style={{
                background: selectedTab === id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                color: selectedTab === id ? '#00D4FF' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${selectedTab === id ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {label}
              <span className="ml-1 opacity-60">({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-y-auto p-3 custom-scrollbar" style={{ maxHeight: '420px' }}>
        <AnimatePresence mode="wait">
          {tabData.length === 0 ? (
            <motion.div
              key="empty"
              {...FADE_UP}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <div className="text-4xl mb-3">
                {selectedTab === 'looks' ? '✨' : selectedTab === 'starters' ? '⭐' : '👤'}
              </div>
              <p className="text-xs font-bold text-white/30 uppercase tracking-wider">
                No {selectedTab === 'all' ? 'saved avatars' : selectedTab} yet
              </p>
              <p className="text-[10px] text-white/20 mt-1">
                Save your current avatar to build your library
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedTab}
              {...FADE_UP}
              className="grid grid-cols-2 gap-2"
            >
              {tabData.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onLoad={onLoadAsset}
                  onPreview={(a) => setSelectedAssetForPreview(a)}
                  onDelete={onDeleteAsset}
                  onSetStarter={onSetStarter}
                  onToggleTemplate={onToggleTemplate}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Modal */}
      <DripSyncAssetPreviewModal
        isOpen={!!selectedAssetForPreview}
        onClose={() => setSelectedAssetForPreview(null)}
        asset={selectedAssetForPreview}
        onLoad={onLoadAsset}
        onDelete={onDeleteAsset}
        onSetStarter={onSetStarter}
        onShare={onShare}
        isMobile={isMobile}
      />
    </div>
  );
}