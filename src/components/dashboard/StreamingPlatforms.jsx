import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, ChevronDown, ExternalLink } from 'lucide-react';

const STREAMING_PLATFORMS = [
  {
    id: 'netflix',
    name: 'Netflix',
    url: 'https://www.netflix.com',
    color: 'from-red-600 to-red-700',
    logo: '🎬'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com',
    color: 'from-red-500 to-red-600',
    logo: '▶️'
  },
  {
    id: 'prime',
    name: 'Prime Video',
    url: 'https://www.amazon.com/Prime-Video/b?ie=UTF8&node=2676882011',
    color: 'from-blue-500 to-blue-600',
    logo: '🎥'
  },
  {
    id: 'appletv',
    name: 'Apple TV+',
    url: 'https://tv.apple.com',
    color: 'from-gray-800 to-gray-900',
    logo: '🍎'
  },
  {
    id: 'roku',
    name: 'Roku',
    url: 'https://www.roku.com',
    color: 'from-purple-600 to-purple-700',
    logo: '📺'
  },
  {
    id: 'hulu',
    name: 'Hulu',
    url: 'https://www.hulu.com',
    color: 'from-green-500 to-green-600',
    logo: '🟢'
  },
  {
    id: 'hbomax',
    name: 'HBO Max',
    url: 'https://www.max.com',
    color: 'from-purple-700 to-blue-800',
    logo: '🎭'
  }
];

export default function StreamingPlatforms() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const handlePlatformClick = (platform) => {
    setSelectedPlatform(platform);
    window.open(platform.url, '_blank', 'noopener,noreferrer');
    setTimeout(() => setIsOpen(false), 300);
  };

  return (
    <div className="relative">
      {/* Trigger Button - TV Remote Style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative bg-gradient-to-br from-zinc-900 to-black border-2 border-zinc-700 hover:border-cyan-500/50 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden"
        style={{ width: '100%', maxWidth: '280px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative p-6">
          {/* TV Screen */}
          <div className="mb-4 bg-zinc-950 rounded-lg p-4 border-2 border-zinc-800 shadow-inner">
            <Tv className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-2">
            <div className="text-center">
              <p className="text-xs font-mono text-gray-500 mb-1">STREAMING HUB</p>
              <p className="text-lg font-black text-white tracking-tight">TV Interface</p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-cyan-400">
              <span className="font-mono">{STREAMING_PLATFORMS.length} Services</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Power Button */}
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-red-500/20 border-2 border-red-500/50 mx-auto flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-red-500" />
            </div>
          </div>
        </div>
      </button>

      {/* Dropdown Menu - Fire Stick Style Grid */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute top-full mt-4 left-0 right-0 z-50"
          >
            <div className="bg-black/95 backdrop-blur-2xl border-2 border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 px-6 py-4 border-b border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Tv className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white font-mono tracking-wider">STREAMING APPS</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                  >
                    <span className="text-gray-400">×</span>
                  </button>
                </div>
              </div>

              {/* Grid of Platforms - Fire Stick Layout */}
              <div className="p-6 grid grid-cols-2 gap-4">
                {STREAMING_PLATFORMS.map((platform, index) => (
                  <motion.button
                    key={platform.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handlePlatformClick(platform)}
                    className="group relative"
                  >
                    {/* Platform Tile */}
                    <div className={`relative bg-gradient-to-br ${platform.color} rounded-xl p-6 border-2 border-white/10 hover:border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                      {/* Glow Effect */}
                      <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
                      
                      {/* Content */}
                      <div className="relative text-center">
                        <div className="text-4xl mb-2">{platform.logo}</div>
                        <p className="text-xs font-bold text-white mb-1 tracking-wide">{platform.name}</p>
                        <ExternalLink className="w-3 h-3 text-white/60 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Shine Effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Selection Indicator */}
                    {selectedPlatform?.id === platform.id && (
                      <motion.div
                        layoutId="selection"
                        className="absolute inset-0 rounded-xl border-4 border-cyan-400 pointer-events-none"
                        initial={false}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Footer Info */}
              <div className="px-6 py-4 bg-zinc-900/50 border-t border-cyan-500/20">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs text-gray-400 font-mono">Click any service to stream in new tab</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}