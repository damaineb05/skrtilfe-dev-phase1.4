import React from 'react';
import { motion } from 'framer-motion';
import { Maximize, X } from 'lucide-react';

export default function StreamHubMiniPlayer({ channel, onExpand, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      drag
      dragConstraints={{ left: -300, right: 0, top: -300, bottom: 0 }}
      className="fixed bottom-6 right-6 w-72 overflow-hidden shadow-2xl z-50 cursor-grab active:cursor-grabbing"
      style={{
        background: '#0D0D14',
        border: '1px solid rgba(168,85,247,0.35)',
        borderRadius: 10,
        boxShadow: '0 0 40px rgba(168,85,247,0.15), 0 20px 60px rgba(0,0,0,0.7)',
      }}
    >
      {/* Purple accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #a855f7, #3b82f6)' }} />
      
      <div className="relative aspect-video">
        <iframe
          src={channel.watchUrl || channel.embed}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay"
          title={channel.name}
        />
        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', borderRadius: 3 }}>
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          <span className="text-purple-300 text-[8px] font-black tracking-[0.2em] uppercase">Live</span>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex-1 min-w-0">
          <p className="text-white text-[11px] font-semibold truncate">{channel.name}</p>
          <p className="text-[9px] tracking-[0.1em] uppercase truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{channel.category}</p>
        </div>
        <button onClick={onExpand}
          className="w-7 h-7 flex items-center justify-center rounded transition-all hover:bg-white/10">
          <Maximize className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.5)' }} />
        </button>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded transition-all hover:bg-white/10">
          <X className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.5)' }} />
        </button>
      </div>
    </motion.div>
  );
}