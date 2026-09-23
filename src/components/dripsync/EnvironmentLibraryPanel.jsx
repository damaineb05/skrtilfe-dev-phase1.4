/**
 * EnvironmentLibraryPanel — Browse and select 3D environments
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ENVIRONMENT_LIBRARY, ENVIRONMENT_CATEGORIES } from './EnvironmentLibrary';
import { X } from 'lucide-react';

export default function EnvironmentLibraryPanel({ onSelectEnvironment, onClose, currentEnvironmentId }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredEnvironments = selectedCategory === 'all'
    ? ENVIRONMENT_LIBRARY
    : ENVIRONMENT_LIBRARY.filter(env => env.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass-panel-drip rounded-2xl overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Environment Library</h3>
          <p className="text-[10px] text-gray-400 mt-1">Select a 3D environment for your avatar</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="px-4 py-3 border-b border-white/10 overflow-x-auto custom-scrollbar">
        <div className="flex gap-2 min-w-min">
          {ENVIRONMENT_CATEGORIES.map(cat => (
            <motion.button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all"
              style={{
                background: selectedCategory === cat.id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                color: selectedCategory === cat.id ? '#00D4FF' : 'rgba(255,255,255,0.5)',
                border: selectedCategory === cat.id ? '1px solid rgba(0,212,255,0.25)' : '1px solid rgba(255,255,255,0.1)',
              }}
              whileHover={{ scale: 1.05 }}
            >
              {cat.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Environment Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {filteredEnvironments.map((env, idx) => (
              <motion.button
                key={env.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectEnvironment(env)}
                className="group relative overflow-hidden rounded-lg transition-all"
                style={{
                  border: currentEnvironmentId === env.id
                    ? '2px solid rgba(0,212,255,0.5)'
                    : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {/* Thumbnail */}
                <img
                  src={env.thumbnail}
                  alt={env.name}
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs font-bold text-white">{env.name}</p>
                  <p className="text-[10px] text-gray-300">{env.description}</p>
                </div>

                {/* Selected Badge */}
                {currentEnvironmentId === env.id && (
                  <div className="absolute top-1 right-1 bg-cyan-500 rounded-full w-2 h-2 shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}