import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, Grid, List, ChevronRight, Tv } from 'lucide-react';

export default function StreamHubChannelGrid({ channels, onPlay, selectedId, isFavorite, toggleFavorite, title, label }) {
  const [viewMode, setViewMode] = useState('grid');

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>{label || 'Channels'}</p>
          <h3 className="text-sm font-black text-white">{title || `${channels.length} Live Now`}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setViewMode('grid')}
            className="w-7 h-7 flex items-center justify-center rounded transition-all"
            style={{ background: viewMode === 'grid' ? 'rgba(168,85,247,0.2)' : 'transparent', border: `1px solid ${viewMode === 'grid' ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.1)'}` }}>
            <Grid className="w-3 h-3" style={{ color: viewMode === 'grid' ? '#a855f7' : 'rgba(255,255,255,0.3)' }} />
          </button>
          <button onClick={() => setViewMode('list')}
            className="w-7 h-7 flex items-center justify-center rounded transition-all"
            style={{ background: viewMode === 'list' ? 'rgba(168,85,247,0.2)' : 'transparent', border: `1px solid ${viewMode === 'list' ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.1)'}` }}>
            <List className="w-3 h-3" style={{ color: viewMode === 'list' ? '#a855f7' : 'rgba(255,255,255,0.3)' }} />
          </button>
        </div>
      </div>

      {channels.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-[9px] tracking-[0.35em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>Empty</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>No channels here yet</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {channels.map((ch, i) => (
            <motion.div key={ch.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <GridCard channel={ch} onPlay={onPlay} isPlaying={selectedId === ch.id} isFav={isFavorite(ch.id)} onFav={toggleFavorite} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          {channels.map((ch, i) => (
            <motion.div key={ch.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              onClick={() => onPlay(ch)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
              style={{ borderBottom: i < channels.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: selectedId === ch.id ? 'rgba(168,85,247,0.08)' : 'transparent' }}
            >
              <div className="w-12 h-9 flex items-center justify-center flex-shrink-0 rounded overflow-hidden" style={{ background: '#0D0D14' }}>
                {ch.logo?.startsWith('http') ? (
                  <img src={ch.logo} alt="" className="w-full h-full object-cover opacity-40" onError={e => e.target.style.display='none'} />
                ) : (
                  <Tv className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{ch.name}</p>
                <p className="text-[9px] tracking-[0.12em] uppercase truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{ch.category}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-white" />
                  <span className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Live</span>
                </div>
                <button onClick={e => { e.stopPropagation(); toggleFavorite(ch.id); }}
                  className="w-7 h-7 flex items-center justify-center rounded transition-all hover:bg-white/10">
                  <Heart className="w-3.5 h-3.5" style={{ color: isFavorite(ch.id) ? '#a855f7' : 'rgba(255,255,255,0.25)', fill: isFavorite(ch.id) ? '#a855f7' : 'none' }} />
                </button>
                <ChevronRight className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.2)' }} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function GridCard({ channel, onPlay, isPlaying, isFav, onFav }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onPlay(channel)}
      className="cursor-pointer overflow-hidden"
      style={{
        border: '1px solid',
        borderColor: isPlaying ? '#a855f7' : hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)',
        background: '#111118',
        borderRadius: 6,
        boxShadow: isPlaying ? '0 0 18px rgba(168,85,247,0.25)' : 'none',
      }}
    >
      <div className="aspect-video relative overflow-hidden flex items-center justify-center" style={{ background: '#0D0D14' }}>
        {channel.logo?.startsWith('http') && (
          <img src={channel.logo} alt="" className="w-full h-full object-cover opacity-30" onError={e => e.target.style.display='none'} />
        )}
        <motion.div animate={{ opacity: hovered ? 1 : 0 }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#a855f7' }}>
            <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />
          </div>
        </motion.div>
        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: 3 }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-white" />
          <span className="text-[8px] font-black tracking-[0.2em] text-white uppercase">Live</span>
        </div>
        <button onClick={e => { e.stopPropagation(); onFav(channel.id); }}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full transition-all"
          style={{ background: isFav ? '#a855f7' : 'rgba(0,0,0,0.65)', opacity: isFav || hovered ? 1 : 0 }}>
          <Heart className="w-3 h-3 text-white" style={{ fill: isFav ? '#fff' : 'none' }} />
        </button>
        {isPlaying && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
      </div>
      <div className="px-2.5 py-2">
        <p className="text-white text-[11px] font-semibold truncate">{channel.name}</p>
        <p className="text-[9px] tracking-[0.12em] uppercase truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{channel.category}</p>
      </div>
    </motion.div>
  );
}