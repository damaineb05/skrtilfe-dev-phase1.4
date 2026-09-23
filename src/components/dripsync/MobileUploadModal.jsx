import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ChevronDown, Upload as UploadIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export default function MobileUploadModal({
  isOpen,
  onClose,
  inputValue,
  setInputValue,
  onLoadFromInput,
  onFileClick,
  onSketchfab,
  onCreateAvatar,
  onCreateStreamoji,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-upload-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full bg-gradient-to-t from-[#0A0A0F] to-[#12121E] rounded-t-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle & Close */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex-1" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Upload Assets</h3>
              <button
                onClick={onClose}
                className="flex-1 flex justify-end hover:opacity-70 transition-opacity"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto pb-20">
              {/* URL Input */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block mb-2">
                  Paste URL
                </label>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Paste RPM URL or ID..."
                  className="bg-white/[0.05] border-white/[0.10] text-white placeholder:text-white/30 focus:border-cyan-400/50 text-sm"
                />
              </div>

              {/* Load Options */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block mb-2">
                  Load Asset
                </label>
                <div className="space-y-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onLoadFromInput}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/30 rounded-lg text-white text-sm font-bold transition-all"
                  >
                    Load GLB URL
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onFileClick}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-400/30 rounded-lg text-white text-sm font-bold transition-all"
                  >
                    Upload GLB File
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onSketchfab}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-400/30 rounded-lg text-white text-sm font-bold transition-all"
                  >
                    Load from Sketchfab
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onCreateAvatar}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-400/30 rounded-lg text-white text-sm font-bold transition-all"
                  >
                    Create New Avatar
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onCreateStreamoji}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 hover:from-yellow-500/30 hover:to-amber-500/30 border border-yellow-400/30 rounded-lg text-white text-sm font-bold transition-all"
                  >
                    Create on Streamoji
                  </motion.button>
                </div>
              </div>

              {/* Help text */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 mt-4">
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Upload avatars, wearable .glb files, Ready Player Me assets, or Streamoji creations directly to your DripSync.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}