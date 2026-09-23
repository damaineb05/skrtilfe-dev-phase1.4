import React from 'react';
import { motion } from 'framer-motion';
import {
  Home, Radio, Heart, Clock, Layers, Music, Newspaper, TrendingUp,
  Tv, Gamepad2, Globe, Zap, Sparkles, Star, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',        label: 'Home',          icon: Home },
  { id: 'live',        label: 'Live TV',        icon: Radio },
  { id: 'favorites',   label: 'My Favorites',   icon: Heart },
  { id: 'history',     label: 'Watch History',  icon: Clock },
];

// XUMO Play categories — only groups that actually have channels appear here.
const CATEGORIES = [
  { id: 'news',                label: 'News',                icon: Newspaper, color: '#06b6d4' },
  { id: 'movies',              label: 'Movies',              icon: Tv,        color: '#a855f7' },
  { id: 'sports',              label: 'Sports',              icon: Radio,     color: '#3b82f6' },
  { id: 'classic tv',          label: 'Classic TV',          icon: Sparkles,  color: '#f59e0b' },
  { id: 'westerns & country',  label: 'Westerns & Country',  icon: Star,      color: '#fb923c' },
];

export default function StreamHubSidebar({ activeTab, selectedCategory, onTab, onCategory, channelCounts, favCount, historyCount }) {
  return (
    <div className="w-52 flex-shrink-0 flex flex-col h-full overflow-y-auto" style={{ borderRight: '1px solid rgba(255,255,255,0.07)', background: 'rgba(8,8,14,0.9)', scrollbarWidth: 'none' }}>
      <style>{`.sidebar-scroll::-webkit-scrollbar{display:none}`}</style>

      {/* Brand */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)' }}>
            <Tv className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] text-white uppercase">Stream Hub</p>
            <p className="text-[8px] tracking-[0.25em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Powered by XUMO Play</p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = activeTab === item.id;
          const count = item.id === 'favorites' ? favCount : item.id === 'history' ? historyCount : null;
          return (
            <SidebarItem key={item.id} {...item} active={active} count={count} onClick={() => onTab(item.id)} />
          );
        })}
      </div>

      <div className="px-4 pt-2 pb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-[8px] font-black tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Categories</p>
      </div>

      {/* Category nav */}
      <div className="px-2 pb-4 space-y-0.5">
        {CATEGORIES.map(cat => {
          const active = activeTab === 'live' && selectedCategory === cat.id;
          const count = channelCounts?.[cat.id] || 0;
          return (
            <SidebarItem key={cat.id} {...cat} active={active} count={count} onClick={() => { onTab('live'); onCategory(cat.id); }} />
          );
        })}
      </div>
    </div>
  );
}

function SidebarItem({ label, icon: Icon, active, count, color, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all rounded-md"
      style={{
        background: active ? 'rgba(168,85,247,0.12)' : 'transparent',
        border: active ? '1px solid rgba(168,85,247,0.25)' : '1px solid transparent',
      }}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: active ? '#a855f7' : color || 'rgba(255,255,255,0.35)' }} />
      <span className="text-[11px] font-semibold flex-1 text-left truncate" style={{ color: active ? '#fff' : 'rgba(255,255,255,0.5)' }}>{label}</span>
      {count > 0 && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>{count}</span>
      )}
    </motion.button>
  );
}