import React, { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, Tv } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

import StreamHubSidebar from './StreamHubSidebar';
import StreamHubHome from './StreamHubHome';
import StreamHubPlayer from './StreamHubPlayer';
import StreamHubChannelGrid from './StreamHubChannelGrid';
import StreamHubMiniPlayer from './StreamHubMiniPlayer';
import { XUMO_CHANNELS } from './xumoChannels';

// ─────────────────────────────────────────────
// CHANNEL DATA
// ─────────────────────────────────────────────
// XUMO Play powers the live catalog — see ./xumoChannels.js
const LIVE_TV_CHANNELS = XUMO_CHANNELS;

// ─────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────
function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sh_fav2') || '[]'); } catch { return []; }
  });
  const toggle = useCallback((id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('sh_fav2', JSON.stringify(next));
      return next;
    });
  }, []);
  const isFav = useCallback((id) => favorites.includes(id), [favorites]);
  return { favorites, toggle, isFav };
}

function useHistory() {
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sh_hist2') || '[]'); } catch { return []; }
  });
  const add = useCallback((ch) => {
    setHistory(prev => {
      const next = [{ id: ch.id, name: ch.name, category: ch.category, at: Date.now() }, ...prev.filter(h => h.id !== ch.id)].slice(0, 40);
      localStorage.setItem('sh_hist2', JSON.stringify(next));
      return next;
    });
  }, []);
  const clear = useCallback(() => { setHistory([]); localStorage.removeItem('sh_hist2'); }, []);
  return { history, add, clear };
}

function useRecommendations(history, favorites) {
  return React.useMemo(() => {
    const scores = {};
    history.forEach((h, i) => {
      const cat = h.category?.toLowerCase();
      if (cat) scores[cat] = (scores[cat] || 0) + Math.max(0.1, 1 - i * 0.08);
    });
    favorites.forEach(id => {
      const ch = LIVE_TV_CHANNELS.find(c => c.id === id);
      if (ch) scores[ch.category?.toLowerCase()] = (scores[ch.category?.toLowerCase()] || 0) + 2;
    });
    const favSet = new Set(favorites);
    return LIVE_TV_CHANNELS
      .filter(c => !favSet.has(c.id))
      .map(c => ({ ...c, _score: (scores[c.category?.toLowerCase()] || 0) + Math.random() * 0.3 }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 12);
  }, [history.length, favorites.length]);
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function StreamingHub() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [miniPlayer, setMiniPlayer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const { favorites, toggle: toggleFav, isFav } = useFavorites();
  const { history, add: addHistory, clear: clearHistory } = useHistory();
  const recommendations = useRecommendations(history, favorites);

  // Channel counts per category
  const channelCounts = useMemo(() => {
    const counts = {};
    LIVE_TV_CHANNELS.forEach(ch => {
      const cat = ch.category?.toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered channels for live tab
  const filteredChannels = useMemo(() => {
    return LIVE_TV_CHANNELS.filter(ch => {
      const matchesSearch = !searchQuery || ch.name.toLowerCase().includes(searchQuery.toLowerCase()) || ch.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'all' || ch.category.toLowerCase() === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const handlePlay = useCallback((channel) => {
    // Put current in mini player
    if (selectedChannel && selectedChannel.id !== channel.id) {
      setMiniPlayer(selectedChannel);
    }
    setSelectedChannel(channel);
    addHistory(channel);
  }, [selectedChannel, addHistory]);

  const handleClosePlayer = useCallback(() => {
    if (selectedChannel) setMiniPlayer(selectedChannel);
    setSelectedChannel(null);
  }, [selectedChannel]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    if (tab !== 'live') setSelectedCategory('all');
  }, []);

  const handleCategoryChange = useCallback((cat) => {
    setSelectedCategory(cat);
  }, []);

  // Favorites list
  const favChannels = LIVE_TV_CHANNELS.filter(c => isFav(c.id));

  // History channels
  const historyChannels = history.map(h => LIVE_TV_CHANNELS.find(c => c.id === h.id)).filter(Boolean);

  // Category display label
  const categoryLabel = selectedCategory === 'all' ? 'All Channels' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: '#0A0A0F' }}>
      <style>{`
        .sh-scroll::-webkit-scrollbar{display:none}
        .sh-scroll{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      {/* === TOP BAR === */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(8,8,14,0.97)', backdropFilter: 'blur(20px)' }}>
        
        {/* Left: brand + active channel */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)' }}>
              <Tv className="w-3 h-3 text-white" />
            </div>
            <span className="text-[10px] font-black tracking-[0.25em] uppercase text-white">Stream Hub</span>
          </div>
          {selectedChannel && (
            <>
              <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse flex-shrink-0" />
                <span className="text-[10px] font-semibold text-white/60 truncate">{selectedChannel.name}</span>
              </div>
            </>
          )}
        </div>

        {/* Right: search + close */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {selectedChannel && (
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={handleClosePlayer}
              className="px-3 py-1 text-[9px] font-bold tracking-[0.2em] uppercase transition-all mr-2"
              style={{ border: '1px solid rgba(168,85,247,0.4)', color: '#a855f7', borderRadius: 4 }}>
              ← Back
            </motion.button>
          )}
          <button onClick={() => setSearchOpen(s => !s)}
            className="w-8 h-8 flex items-center justify-center rounded transition-all hover:bg-white/5">
            <Search className="w-3.5 h-3.5" style={{ color: searchOpen ? '#a855f7' : 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-hidden"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setActiveTab('live'); }}
                placeholder="Search channels, categories…"
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === BODY: sidebar + content === */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar — hidden on mobile */}
        <div className="hidden md:flex">
          <StreamHubSidebar
            activeTab={activeTab}
            selectedCategory={selectedCategory}
            onTab={handleTabChange}
            onCategory={handleCategoryChange}
            channelCounts={channelCounts}
            favCount={favorites.length}
            historyCount={history.length}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          {selectedChannel ? (
            // ── PLAYER MODE ──
            <StreamHubPlayer
              channel={selectedChannel}
              onClose={handleClosePlayer}
              onToggleFavorite={toggleFav}
              isFavorite={isFav(selectedChannel.id)}
              onChannelChange={(ch) => { setSelectedChannel(ch); addHistory(ch); }}
              allChannels={LIVE_TV_CHANNELS}
            />
          ) : (
            // ── BROWSE MODE ──
            <>
              {/* Mobile tab bar */}
              <div className="md:hidden flex items-center px-3 py-2 sh-scroll overflow-x-auto flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['home','live','favorites','history'].map(t => (
                  <button key={t} onClick={() => handleTabChange(t)}
                    className="px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] uppercase whitespace-nowrap transition-all flex-shrink-0"
                    style={{ color: activeTab === t ? '#fff' : 'rgba(255,255,255,0.3)', borderBottom: activeTab === t ? '1px solid #a855f7' : '1px solid transparent' }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <ScrollArea className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab + selectedCategory}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>

                    {activeTab === 'home' && (
                      <StreamHubHome
                        channels={LIVE_TV_CHANNELS}
                        onPlay={handlePlay}
                        selectedId={selectedChannel?.id}
                        favorites={favorites}
                        toggleFavorite={toggleFav}
                        isFavorite={isFav}
                        recommendations={recommendations}
                        history={history}
                        onTabChange={handleTabChange}
                        onCategoryChange={handleCategoryChange}
                      />
                    )}

                    {activeTab === 'live' && (
                      <StreamHubChannelGrid
                        channels={filteredChannels}
                        onPlay={handlePlay}
                        selectedId={selectedChannel?.id}
                        isFavorite={isFav}
                        toggleFavorite={toggleFav}
                        label={selectedCategory === 'all' ? 'All Channels' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                        title={`${filteredChannels.length} Live Now`}
                      />
                    )}

                    {activeTab === 'favorites' && (
                      favChannels.length === 0 ? (
                        <EmptyState title="No Favorites Yet" desc="Tap the heart icon on any channel to save it here." />
                      ) : (
                        <StreamHubChannelGrid
                          channels={favChannels}
                          onPlay={handlePlay}
                          selectedId={selectedChannel?.id}
                          isFavorite={isFav}
                          toggleFavorite={toggleFav}
                          label="Your Collection"
                          title={`${favChannels.length} Saved`}
                        />
                      )
                    )}

                    {activeTab === 'history' && (
                      historyChannels.length === 0 ? (
                        <EmptyState title="No Watch History" desc="Channels you watch will appear here." />
                      ) : (
                        <div className="p-5">
                          <div className="flex items-end justify-between mb-4">
                            <div>
                              <p className="text-[9px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>Recent</p>
                              <h3 className="text-sm font-black text-white">Watch History</h3>
                            </div>
                            <button onClick={clearHistory} className="text-[9px] font-bold tracking-[0.2em] uppercase transition-opacity hover:opacity-60" style={{ color: 'rgba(255,255,255,0.3)' }}>Clear All</button>
                          </div>
                          <StreamHubChannelGrid
                            channels={historyChannels}
                            onPlay={handlePlay}
                            selectedId={selectedChannel?.id}
                            isFavorite={isFav}
                            toggleFavorite={toggleFav}
                          />
                        </div>
                      )
                    )}

                  </motion.div>
                </AnimatePresence>
              </ScrollArea>
            </>
          )}
        </div>
      </div>

      {/* Mini Player */}
      <AnimatePresence>
        {miniPlayer && !selectedChannel && (
          <StreamHubMiniPlayer
            channel={miniPlayer}
            onExpand={() => { setSelectedChannel(miniPlayer); addHistory(miniPlayer); setMiniPlayer(null); }}
            onClose={() => setMiniPlayer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center px-8">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <Tv className="w-5 h-5" style={{ color: 'rgba(168,85,247,0.7)' }} />
      </div>
      <p className="text-[9px] font-bold tracking-[0.35em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.2)' }}>Empty</p>
      <h3 className="text-sm font-black text-white mb-2">{title}</h3>
      <p className="text-xs font-light max-w-xs" style={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}