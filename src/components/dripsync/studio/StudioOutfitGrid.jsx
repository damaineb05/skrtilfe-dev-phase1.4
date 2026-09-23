/**
 * StudioOutfitGrid — Bottom modal for browsing saved outfits
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

export default function StudioOutfitGrid({
  savedOutfits, onLoadOutfit, onClose, onCreateNew,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'rgba(10,10,16,0.95)',
          border: '1px solid rgba(0,212,255,0.2)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-2xl font-harvest font-bold text-white">Saved Outfits</h2>
          <motion.button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            whileHover={{ scale: 1.1 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {savedOutfits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-400 mb-4">No saved outfits yet</p>
              <motion.button
                onClick={onCreateNew}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold"
                style={{
                  background: 'rgba(0,212,255,0.12)',
                  color: '#00D4FF',
                  border: '1px solid rgba(0,212,255,0.25)',
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Plus className="w-4 h-4" />
                Create First Outfit
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Create New Button */}
              <motion.button
                onClick={onCreateNew}
                className="aspect-square rounded-lg flex items-center justify-center flex-col gap-2 border-2 border-dashed transition-all"
                style={{
                  borderColor: 'rgba(0,212,255,0.3)',
                  background: 'rgba(0,212,255,0.06)',
                }}
                whileHover={{
                  borderColor: 'rgba(0,212,255,0.6)',
                  background: 'rgba(0,212,255,0.12)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-8 h-8 text-cyan-400" />
                <span className="text-xs font-bold uppercase">New</span>
              </motion.button>

              {/* Outfit Cards */}
              {savedOutfits.map(outfit => (
                <motion.button
                  key={outfit.id}
                  onClick={() => onLoadOutfit(outfit)}
                  className="aspect-square rounded-lg p-3 flex flex-col justify-between transition-all border overflow-hidden"
                  style={{
                    background: 'rgba(0,212,255,0.06)',
                    border: '1px solid rgba(0,212,255,0.15)',
                  }}
                  whileHover={{
                    scale: 1.05,
                    borderColor: 'rgba(0,212,255,0.4)',
                    background: 'rgba(0,212,255,0.12)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Placeholder avatar preview */}
                  <div
                    className="flex-1 rounded-lg mb-2 flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    👤
                  </div>

                  {/* Outfit Info */}
                  <div className="text-left">
                    <p className="text-xs font-bold text-white truncate mb-1">
                      {outfit.name}
                    </p>
                    <p className="text-[9px] text-gray-400">
                      {outfit.wearables.length} items
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}