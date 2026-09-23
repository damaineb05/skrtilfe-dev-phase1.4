import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Heart, Share2, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Play, Tv, ChevronDown, X, Layers, ExternalLink
} from 'lucide-react';

export default function StreamHubPlayer({ channel, onClose, onToggleFavorite, isFavorite, onChannelChange, allChannels }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showChannelList, setShowChannelList] = useState(false);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const currentIndex = allChannels.findIndex(c => c.id === channel.id);

  const resetTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowControls(false), 3500);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timerRef.current);
  }, [channel.id, resetTimer]);

  useEffect(() => {
    const onFsc = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsc);
    return () => document.removeEventListener('fullscreenchange', onFsc);
  }, []);

  const toggleFs = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const next = () => onChannelChange(allChannels[(currentIndex + 1) % allChannels.length]);
  const prev = () => onChannelChange(allChannels[(currentIndex - 1 + allChannels.length) % allChannels.length]);

  // XUMO Play network URL — loads the channel's live stream in-frame.
  const embedUrl = channel.watchUrl || channel.embed;

  return (
    <div ref={containerRef} className={`flex flex-col bg-black ${isFullscreen ? 'fixed inset-0 z-[200]' : 'flex-1 min-h-0'}`}
      onMouseMove={resetTimer} onClick={resetTimer}>
      
      {/* iframe */}
      <div className="flex-1 relative">
        <iframe
          key={`${channel.id}-${isMuted}`}
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          title={channel.name}
        />

        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 pointer-events-auto px-4 pt-4 pb-8"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={onClose}
                      className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:bg-white/20"
                      style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <ArrowLeft className="w-4 h-4 text-white" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-400 text-[9px] font-black tracking-[0.3em] uppercase">Live</span>
                        <span className="text-white/30 text-[9px]">·</span>
                        <span className="text-white/30 text-[9px] tracking-[0.15em] uppercase">{channel.category}</span>
                      </div>
                      <h3 className="text-white font-black text-base leading-none">{channel.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onToggleFavorite(channel.id)}
                      className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
                      style={{ background: isFavorite ? '#a855f7' : 'rgba(255,255,255,0.1)' }}>
                      <Heart className="w-4 h-4 text-white" style={{ fill: isFavorite ? '#fff' : 'none' }} />
                    </button>
                    <button className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:bg-white/20"
                      style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <Share2 className="w-4 h-4 text-white" />
                    </button>
                    <button onClick={() => window.open(channel.watchUrl, '_blank', 'noopener,noreferrer')}
                      title="Open on XUMO Play"
                      className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:bg-white/20"
                      style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <ExternalLink className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Center controls */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <div className="flex items-center gap-5">
                  <button onClick={prev}
                    className="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:bg-white/20"
                    style={{ background: 'rgba(255,255,255,0.12)' }}>
                    <SkipBack className="w-5 h-5 text-white" />
                  </button>
                  <button onClick={() => window.open(channel.watchUrl, '_blank', 'noopener,noreferrer')}
                    title="Open on XUMO Play"
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105"
                    style={{ background: 'rgba(168,85,247,0.9)', boxShadow: '0 0 30px rgba(168,85,247,0.5)' }}>
                    <Play className="w-6 h-6 text-white ml-1" fill="white" />
                  </button>
                  <button onClick={next}
                    className="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:bg-white/20"
                    style={{ background: 'rgba(255,255,255,0.12)' }}>
                    <SkipForward className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="absolute bottom-0 left-0 right-0 pointer-events-auto px-4 pb-4 pt-8"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsMuted(m => !m)}
                      className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-all"
                      style={{ background: 'rgba(255,255,255,0.1)' }}>
                      {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                    </button>
                    <button onClick={() => setShowChannelList(s => !s)}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-sm transition-all hover:bg-white/20"
                      style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <Layers className="w-3.5 h-3.5 text-white" />
                      <span className="text-white text-[11px] font-semibold">Channels</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform ${showChannelList ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={toggleFs}
                      className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-all"
                      style={{ background: 'rgba(255,255,255,0.1)' }}>
                      {isFullscreen ? <Minimize className="w-4 h-4 text-white" /> : <Maximize className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                </div>

                {/* Channel switcher */}
                <AnimatePresence>
                  {showChannelList && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="mt-3 rounded-xl overflow-hidden max-h-44 overflow-y-auto"
                      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-0">
                        {allChannels.map(ch => (
                          <button key={ch.id}
                            onClick={() => { onChannelChange(ch); setShowChannelList(false); }}
                            className="p-2.5 text-left transition-all hover:bg-white/10"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: ch.id === channel.id ? 'rgba(168,85,247,0.2)' : 'transparent' }}>
                            <p className="text-white text-[10px] font-semibold truncate">{ch.name}</p>
                            <p className="text-[9px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{ch.category}</p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}