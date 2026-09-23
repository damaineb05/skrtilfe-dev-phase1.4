import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, Users, Calendar, Clock, ChevronRight, Sparkles, Flame, Star } from 'lucide-react';

const S = {
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' },
  cardHeader: { borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 },
  label: { color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 700 },
  row: { borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px', cursor: 'pointer', transition: 'background 0.15s' },
};

const InfoCard = ({ title, icon: Icon, children, onShowMore }) => (
  <div style={S.card}>
    <div style={S.cardHeader}>
      {Icon && <Icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />}
      <p style={S.label}>{title}</p>
    </div>
    {children}
    {onShowMore && (
      <button onClick={onShowMore}
        className="w-full flex items-center justify-between px-4 py-3 transition-all hover:bg-white/5 text-[10px] font-semibold uppercase tracking-[0.15em]"
        style={{ color: 'rgba(255,255,255,0.3)' }}>
        Show more <ChevronRight className="w-3 h-3" />
      </button>
    )}
  </div>
);

export default function RightSidebar({ onSearch, onViewTrend, onViewGroup, onViewEvent }) {
  const [searchQuery, setSearchQuery] = useState('');

  const trends = [
    { id: 1, category: 'Web3', topic: '#GenesisPass', posts: '2,456', change: '+12%' },
    { id: 2, category: 'Fashion', topic: '#QuantumTee', posts: '1,892', change: '+8%' },
    { id: 3, category: 'DripSync', topic: 'DripSync', posts: '3,109', change: '+24%' },
    { id: 4, category: 'Tech', topic: '#NFCWearables', posts: '987', change: '+5%' },
  ];

  const suggestedGroups = [
    { id: 1, name: 'Digital Fashion Collective', members: '12.4K', category: 'Fashion' },
    { id: 2, name: 'NFT Traders', members: '8.2K', category: 'Web3' },
    { id: 3, name: 'Avatar Creators', members: '5.6K', category: 'Creative' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Genesis Drop Party', date: 'Apr 15', time: '8PM EST', attendees: 234, type: 'Virtual' },
    { id: 2, title: 'Creator Meetup NYC', date: 'Apr 20', time: '7PM EST', attendees: 89, type: 'In-Person' },
  ];

  const whoToFollow = [
    { id: 1, name: 'CryptoArtist', handle: '@cryptoart_0x', verified: true, followers: '45.2K' },
    { id: 2, name: 'FashionDAO', handle: '@fashion_dao', verified: true, followers: '32.1K' },
    { id: 3, name: 'MetaBuilder', handle: '@meta_builder', verified: false, followers: '18.9K' },
  ];

  return (
    <div className="space-y-3">
      {/* Search */}
      <form onSubmit={e => { e.preventDefault(); onSearch?.(searchQuery); }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.25)' }} />
        <input
          type="text"
          placeholder="Search community…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-transparent pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none"
          style={{ border: '1px solid rgba(255,255,255,0.1)', letterSpacing: '0.02em' }}
        />
      </form>

      {/* Trending */}
      <InfoCard title="Trending" icon={Flame} onShowMore={() => onViewTrend?.('all')}>
        {trends.map(trend => (
          <button key={trend.id} onClick={() => onViewTrend?.(trend.topic)}
            className="w-full text-left px-4 py-3 transition-all hover:bg-white/[0.03]"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em' }} className="mb-0.5">{trend.category}</p>
            <p className="text-sm font-bold text-white">{trend.topic}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{trend.posts} posts</span>
              <span className="text-[10px] font-bold" style={{ color: '#4ade80' }}>{trend.change}</span>
            </div>
          </button>
        ))}
      </InfoCard>

      {/* Groups */}
      <InfoCard title="Groups for you" icon={Users} onShowMore={() => onViewGroup?.('all')}>
        {suggestedGroups.map(group => (
          <button key={group.id} onClick={() => onViewGroup?.(group.id)}
            className="w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/[0.03]"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-8 h-8 flex items-center justify-center text-xs font-black text-white shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {group.name.charAt(0)}
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-bold text-white">{group.name}</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{group.members} members · {group.category}</p>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-1"
              style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
              Join
            </span>
          </button>
        ))}
      </InfoCard>

      {/* Events */}
      <InfoCard title="Upcoming Events" icon={Calendar} onShowMore={() => onViewEvent?.('all')}>
        {upcomingEvents.map(event => (
          <button key={event.id} onClick={() => onViewEvent?.(event.id)}
            className="w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-white/[0.03]"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-10 h-12 flex flex-col items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{event.date.split(' ')[0]}</span>
              <span className="text-base font-black text-white">{event.date.split(' ')[1]}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">{event.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{event.time}</span>
                <span className="text-[9px] px-1.5 py-0.5 font-bold uppercase"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                  {event.type}
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, marginTop: 2 }}>{event.attendees} attending</p>
            </div>
          </button>
        ))}
      </InfoCard>

      {/* Who to Follow */}
      <InfoCard title="Who to follow" icon={Sparkles}>
        {whoToFollow.map(user => (
          <div key={user.id} className="flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/[0.03]"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-8 h-8 flex items-center justify-center text-xs font-black text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF3366, #00D4FF)' }}>
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                {user.verified && <Star className="w-3 h-3 shrink-0" style={{ color: '#00D4FF' }} fill="#00D4FF" />}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{user.handle} · {user.followers}</p>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-1"
              style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
              Follow
            </span>
          </div>
        ))}
      </InfoCard>

      {/* Footer */}
      <div className="px-1 pb-2 flex flex-wrap gap-x-3 gap-y-1">
        {[['TermsOfService', 'Terms'], ['PrivacyPolicy', 'Privacy'], ['FAQ', 'Help']].map(([page, label]) => (
          <Link key={page} to={createPageUrl(page)}
            className="text-[10px] transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.2)' }}>
            {label}
          </Link>
        ))}
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>© 2026 SKRTLIFE</span>
      </div>
    </div>
  );
}