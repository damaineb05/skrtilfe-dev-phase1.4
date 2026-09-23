import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Heart, Clock, ChevronRight, Radio, Zap, Star } from 'lucide-react';

// Hero rotation — real XUMO Play networks. The background image is pulled
// from the channel's XUMO tile at render time (see heroChannel below).
const HERO_CHANNELS = [
  { id: '99991299', title: 'Xumo Free Movies', label: 'MOVIES', tag: 'FREE',
    accent: '#a855f7', desc: 'Endless free movies — action, drama, comedy & more, streaming 24/7.' },
  { id: '99951517', title: 'ABC News Live', label: 'NEWS', tag: 'LIVE',
    accent: '#06b6d4', desc: 'Breaking headlines and top stories from ABC News, live.' },
  { id: '99991281', title: 'PGA TOUR', label: 'SPORTS', tag: 'LIVE',
    accent: '#3b82f6', desc: 'Tee off with PGA TOUR coverage and highlights.' },
  { id: '99951576', title: 'In the Heat of the Night', label: 'CLASSIC TV', tag: 'CLASSIC',
    accent: '#f59e0b', desc: 'Timeless crime drama, streaming free on XUMO Play.' },
];

const QUICK_SECTIONS = [
  { id: 'News', label: 'News', icon: TrendingUp, color: '#06b6d4' },
  { id: 'Movies', label: 'Movies', icon: Star, color: '#a855f7' },
  { id: 'Sports', label: 'Sports', icon: Radio, color: '#3b82f6' },
  { id: 'Classic TV', label: 'Classic TV', icon: Zap, color: '#f59e0b' },
];

export default function StreamHubHome({ channels, onPlay, selectedId, favorites, toggleFavorite, isFavorite, recommendations, history, onTabChange, onCategoryChange }) {
  const [heroIdx, setHeroIdx] = useState(0);
  const hero = HERO_CHANNELS[heroIdx];
  const heroChannel = channels.find(c => c.id === hero.id) || channels[0];

  return (
    <div className="space-y-8 pb-8">
      {/* === HERO CAROUSEL === */}
      <div className="relative h-72 md:h-80 overflow-hidden" style={{ borderRadius: 0 }}>
        <motion.img
          key={heroChannel?.id || hero.id}
          src={heroChannel?.logo}
          alt=""
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.22 }}
        />
        {/* gradient overlays */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #0A0A0F 30%, rgba(10,10,15,0.4) 70%, transparent 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0A0A0F 0%, transparent 50%)' }} />
        {/* accent glow */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: `linear-gradient(to bottom, transparent, ${hero.accent}, transparent)` }} />

        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full" style={{ background: `${hero.accent}22`, border: `1px solid ${hero.accent}55` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: hero.accent }} />
              <span className="text-[9px] font-black tracking-[0.3em] uppercase" style={{ color: hero.accent }}>{hero.tag}</span>
            </div>
            <span className="text-[9px] font-bold tracking-[0.25em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{hero.label}</span>
            <span className="text-[9px] font-bold tracking-[0.25em] uppercase ml-auto" style={{ color: 'rgba(255,255,255,0.25)' }}>Powered by XUMO Play</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-none">{hero.title}</h1>
          <p className="text-sm mb-5 max-w-sm" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{hero.desc}</p>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => heroChannel && onPlay(heroChannel)}
              className="flex items-center gap-2.5 px-5 py-2.5 font-bold text-xs tracking-[0.15em] uppercase"
              style={{ background: hero.accent, color: '#fff', borderRadius: 4 }}
            >
              <Play className="w-3.5 h-3.5" fill="white" /> Watch Now
            </motion.button>
            <button
              onClick={() => onTabChange('live')}
              className="flex items-center gap-2 px-5 py-2.5 font-bold text-xs tracking-[0.15em] uppercase transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.6)', borderRadius: 4 }}
            >
              Browse All
            </button>
          </div>
        </div>

        {/* Carousel dots */}
        <div className="absolute bottom-4 right-6 flex items-center gap-2">
          {HERO_CHANNELS.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)}
              className="transition-all duration-300"
              style={{ width: i === heroIdx ? 20 : 6, height: 3, background: i === heroIdx ? hero.accent : 'rgba(255,255,255,0.25)', borderRadius: 99 }}
            />
          ))}
        </div>

        {/* Quick category pills — top right */}
        <div className="absolute top-5 right-5 flex flex-col gap-2">
          {QUICK_SECTIONS.map(s => (
            <button key={s.id} onClick={() => { onTabChange('live'); onCategoryChange(s.id.toLowerCase()); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] uppercase transition-all"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)', borderRadius: 4 }}>
              <s.icon className="w-2.5 h-2.5" style={{ color: s.color }} />
              {s.id}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-8">
        {/* === CONTINUE WATCHING === */}
        {history.length > 0 && (
          <Section
            label="Recently Watched"
            title="Continue Watching"
            channels={history.slice(0, 8).map(h => channels.find(c => c.id === h.id)).filter(Boolean)}
            onPlay={onPlay}
            selectedId={selectedId}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            onMore={() => onTabChange('history')}
          />
        )}

        {/* === FOR YOU === */}
        {recommendations.length > 0 && (
          <Section
            label="AI Picks"
            title="For You"
            channels={recommendations.slice(0, 10)}
            onPlay={onPlay}
            selectedId={selectedId}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            accentColor="#a855f7"
          />
        )}

        {/* === CATEGORIES GRID === */}
        <div>
          <SectionHeader label="Browse" title="Categories" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4">
            {QUICK_SECTIONS.map(s => (
              <motion.button key={s.id}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => { onTabChange('live'); onCategoryChange(s.id.toLowerCase()); }}
                className="p-4 text-left transition-all"
                style={{ background: `${s.color}10`, border: `1px solid ${s.color}25`, borderRadius: 8 }}
              >
                <s.icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
                <p className="text-white text-xs font-bold">{s.id}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {channels.filter(c => c.category === s.id).length} channels
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* === LIVE NOW GRID === */}
        <Section
          label="Streaming Now"
          title="Live Channels"
          channels={channels.slice(0, 12)}
          onPlay={onPlay}
          selectedId={selectedId}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          onMore={() => onTabChange('live')}
          grid
        />
      </div>
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────
function SectionHeader({ label, title, onMore }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <p className="text-[9px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>{label}</p>
        <h3 className="text-sm font-black text-white">{title}</h3>
      </div>
      {onMore && (
        <button onClick={onMore} className="flex items-center gap-1 text-[10px] font-bold tracking-[0.2em] uppercase transition-opacity hover:opacity-60" style={{ color: 'rgba(255,255,255,0.3)' }}>
          All <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function Section({ label, title, channels, onPlay, selectedId, isFavorite, toggleFavorite, accentColor, onMore, grid }) {
  if (!channels.length) return null;
  return (
    <div>
      <SectionHeader label={label} title={title} onMore={onMore} />
      {grid ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-4">
          {channels.map(ch => (
            <MiniCard key={ch.id} channel={ch} onPlay={onPlay} isPlaying={selectedId === ch.id} isFav={isFavorite(ch.id)} onFav={toggleFavorite} accent={accentColor} />
          ))}
        </div>
      ) : (
        <div className="flex gap-2.5 overflow-x-auto pb-1 mt-4" style={{ scrollbarWidth: 'none' }}>
          {channels.map(ch => (
            <div key={ch.id} className="flex-shrink-0 w-40 md:w-44">
              <MiniCard channel={ch} onPlay={onPlay} isPlaying={selectedId === ch.id} isFav={isFavorite(ch.id)} onFav={toggleFavorite} accent={accentColor} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniCard({ channel, onPlay, isPlaying, isFav, onFav, accent }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onPlay(channel)}
      className="group relative cursor-pointer overflow-hidden"
      style={{
        border: '1px solid',
        borderColor: isPlaying ? (accent || '#a855f7') : hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
        background: '#111118',
        borderRadius: 6,
        boxShadow: isPlaying ? `0 0 20px ${accent || '#a855f7'}33` : 'none',
      }}
    >
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden flex items-center justify-center" style={{ background: '#0D0D14' }}>
        {channel.logo?.startsWith('http') ? (
          <img src={channel.logo} alt="" className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" onError={e => { e.target.style.display = 'none'; }} />
        ) : null}
        
        {/* Hover play */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: accent || '#a855f7' }}>
            <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
          </div>
        </motion.div>

        {/* Live dot */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: 3 }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-white" />
          <span className="text-[8px] font-black tracking-[0.2em] text-white uppercase">Live</span>
        </div>

        {/* Fav */}
        <button
          onClick={e => { e.stopPropagation(); onFav(channel.id); }}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full transition-all"
          style={{ background: isFav ? 'rgba(168,85,247,0.9)' : 'rgba(0,0,0,0.6)', opacity: isFav || hovered ? 1 : 0 }}
        >
          <Heart className="w-3 h-3" style={{ color: '#fff', fill: isFav ? '#fff' : 'none' }} />
        </button>

        {/* Now playing bar */}
        {isPlaying && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: accent || '#a855f7' }} />}
      </div>

      <div className="px-2.5 py-2">
        <p className="text-white text-[11px] font-semibold truncate">{channel.name}</p>
        <p className="text-[9px] tracking-[0.12em] uppercase truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{channel.category}</p>
      </div>
    </motion.div>
  );
}