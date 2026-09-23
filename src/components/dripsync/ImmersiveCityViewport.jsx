import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Compass, Map, Volume2, VolumeX } from 'lucide-react';
import DripSyncViewport from './viewport/DripSyncViewport';

/**
 * ImmersiveCityViewport
 * ─────────────────────────────────────────────────────────────
 * Full-screen immersive world experience.
 * Avatar-centric, minimal UI chrome.
 * Feel like you're inside a living city.
 */
export default function ImmersiveCityViewport({
  avatar,
  wearables = [],
  environment,
  avatarConfig = {},
  avatarGender = 'masculine',
  onClose,
  onEnterDistrict,
}) {
  const viewportRef = useRef(null);
  const [osEnabled, setOsEnabled] = useState(true);
  const [showHUD, setShowHUD] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Central Hub');
  const [ambientIntensity, setAmbientIntensity] = useState(0.8);

  // Press ESC to exit
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Ambient audio (mute toggle)
  useEffect(() => {
    // Placeholder for audio system integration
    if (isMuted) {
      // Stop ambient sounds
    } else {
      // Play ambient city sounds
    }
  }, [isMuted]);

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden z-50">
      {/* 3D Viewport */}
      <div ref={viewportRef} className="absolute inset-0 w-full h-full">
        <DripSyncViewport
          avatar={avatar}
          wearables={wearables}
          environment={environment}
          avatarConfig={avatarConfig}
          avatarGender={avatarGender}
          gizmoEnabled={false}
          qualityMode="high"
        />
      </div>

      {/* Immersive HUD Overlay */}
      <AnimatePresence>
        {showHUD && (
          <>
            {/* Top: Location + Time indicator */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
            >
              <div className="flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-xl border border-cyan-500/20"
                style={{ background: 'rgba(0,0,0,0.6)' }}>
                <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest">{currentLocation}</span>
                <div className="w-1 h-1 rounded-full bg-cyan-400/50" />
                <span className="text-xs text-cyan-300/70">{new Date().toLocaleTimeString()}</span>
              </div>
            </motion.div>

            {/* Bottom left: Quick navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute bottom-6 left-6 z-40 space-y-2 pointer-events-auto"
            >
              <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">Navigation</div>
              <button
                onClick={() => setShowHUD(!showHUD)}
                className="w-12 h-12 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 flex items-center justify-center transition-all"
                title="Toggle HUD"
              >
                <Map className="w-5 h-5 text-white/60 hover:text-cyan-400" />
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-12 h-12 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 flex items-center justify-center transition-all"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white/60 hover:text-cyan-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white/60 hover:text-cyan-400" />
                )}
              </button>
            </motion.div>

            {/* Bottom right: Ambient intensity + Exit */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute bottom-6 right-6 z-40 flex items-center gap-4 pointer-events-auto"
            >
              {/* Ambient intensity slider */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10">
                <span className="text-xs font-bold text-white/40 uppercase tracking-wider w-12">Ambient</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ambientIntensity * 100}
                  onChange={(e) => setAmbientIntensity(parseInt(e.target.value) / 100)}
                  className="w-24 h-1 rounded-full bg-white/20 accent-cyan-400 cursor-pointer"
                />
                <span className="text-xs text-white/50 w-6 text-right">{Math.round(ambientIntensity * 100)}%</span>
              </div>

              {/* Exit button */}
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 flex items-center justify-center transition-all"
                title="Exit (ESC)"
              >
                <X className="w-5 h-5 text-red-400" />
              </button>
            </motion.div>

            {/* Center bottom: Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none text-center"
            >
              <p className="text-xs text-white/30 uppercase tracking-wider">
                <span className="text-cyan-400 font-bold">WASD</span> Move • 
                <span className="text-cyan-400 font-bold ml-2">Shift</span> Run • 
                <span className="text-cyan-400 font-bold ml-2">Space</span> Jump • 
                <span className="text-cyan-400 font-bold ml-2">E</span> Interact • 
                <span className="text-cyan-400 font-bold ml-2">ESC</span> Exit
              </p>
            </motion.div>
          </>
        )}

        {/* Minimal fullscreen mode indicator */}
        {!showHUD && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-4 z-40"
          >
            <button
              onClick={() => setShowHUD(true)}
              className="px-3 py-1 text-xs font-bold text-white/40 hover:text-white/80 transition-colors"
              title="Show HUD"
            >
              ⌘ HUD
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vignette effect for cinematic feel */}
      <div className="absolute inset-0 pointer-events-none z-30"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
}