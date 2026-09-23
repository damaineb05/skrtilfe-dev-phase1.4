import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shirt, Package, Palette, Layers, Upload } from 'lucide-react';
import MobileUploadModal from './MobileUploadModal';

const tabs = [
  { id: 'closet',        label: 'Closet',  icon: Shirt   },
  { id: 'inventory',     label: 'Items',   icon: Package },
  { id: 'customization', label: 'Style',   icon: Palette },
  { id: 'scene',         label: 'Scene',   icon: Layers  },
];

const BOTTOM_NAV_HEIGHT = 72; // px — used for panel offset
export { BOTTOM_NAV_HEIGHT };

export default function MobileBottomNav({
  activePanel,
  onPanelChange,
  hasSceneObjects,
  onUploadClick,
  inputValue,
  setInputValue,
  onLoadFromInput,
  onFileClick,
  onSketchfab,
  onCreateAvatar,
  onCreateStreamoji,
}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const midpoint = Math.ceil(tabs.length / 2);

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(8,8,12,0.94)',
          backdropFilter: 'blur(28px) saturate(150%)',
          WebkitBackdropFilter: 'blur(28px) saturate(150%)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-stretch justify-around px-2 pt-1.5 pb-2">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activePanel === tab.id;
            const showDot = tab.id === 'scene' && hasSceneObjects;

            return (
              <React.Fragment key={tab.id}>
                {/* Upload CTA — centered */}
                {idx === midpoint && (
                  <motion.button
                    onClick={() => setIsUploadModalOpen(true)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                    className="flex flex-col items-center gap-1 flex-1 py-2.5 mx-1 rounded-2xl"
                    style={{
                      background: 'rgba(0,212,255,0.1)',
                      border: '1px solid rgba(0,212,255,0.28)',
                      minHeight: 52,
                    }}
                    aria-label="Upload assets"
                  >
                    <Upload className="w-5 h-5" style={{ color: '#00D4FF' }} />
                    <span className="text-[9px] font-black uppercase tracking-[0.12em]" style={{ color: '#00D4FF' }}>
                      Upload
                    </span>
                  </motion.button>
                )}

                {/* Tab button */}
                <motion.button
                  onClick={() => onPanelChange(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.90 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                  className="relative flex flex-col items-center gap-1 flex-1 py-2.5 rounded-2xl transition-all"
                  style={{
                    background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(0,212,255,0.22)' : '1px solid transparent',
                    minHeight: 52,
                  }}
                >
                  <div className="relative">
                    <Icon
                      className="w-5 h-5"
                      style={{ color: isActive ? '#00D4FF' : 'rgba(255,255,255,0.35)' }}
                    />
                    {showDot && (
                      <span
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
                        style={{ background: '#00D4FF' }}
                      />
                    )}
                  </div>
                  <span
                    className="text-[9px] font-black uppercase tracking-[0.12em]"
                    style={{ color: isActive ? '#00D4FF' : 'rgba(255,255,255,0.3)' }}
                  >
                    {tab.label}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="mobileNavActive"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full"
                      style={{ background: '#00D4FF' }}
                    />
                  )}
                </motion.button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <MobileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onLoadFromInput={onLoadFromInput}
        onFileClick={onFileClick}
        onSketchfab={onSketchfab}
        onCreateAvatar={onCreateAvatar}
        onCreateStreamoji={onCreateStreamoji}
      />
    </>
  );
}