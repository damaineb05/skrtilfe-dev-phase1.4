import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Globe, Users, Zap, Lock, Play, Star, Plus } from 'lucide-react';

const TYPE_COLORS = {
  indoor: '#00D4FF',
  outdoor: '#4ade80',
  abstract: '#a78bfa',
  studio: '#FFD700',
};

const TYPE_LABELS = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  abstract: 'Abstract',
  studio: 'Studio',
};

function RealmCard({ realm, index }) {
  const typeColor = TYPE_COLORS[realm.environment_type] || '#00D4FF';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {realm.thumbnail_url ? (
          <img
            src={realm.thumbnail_url}
            alt={realm.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${typeColor}15, rgba(10,10,15,0.9))` }}
          >
            <Globe className="w-12 h-12 opacity-30" style={{ color: typeColor }} />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <Link
            to={`${createPageUrl('DripSync')}?realmId=${realm.id}`}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider text-black transition-all hover:scale-105"
            style={{ background: typeColor }}
          >
            <Play className="w-4 h-4 fill-current" />
            Enter World
          </Link>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {realm.is_featured && (
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,215,0,0.2)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)' }}>
              <Star className="w-2.5 h-2.5" />
              Featured
            </span>
          )}
          {!realm.is_public && (
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,51,102,0.2)', color: '#FF3366', border: '1px solid rgba(255,51,102,0.3)' }}>
              <Lock className="w-2.5 h-2.5" />
              Private
            </span>
          )}
        </div>

        {/* Type badge */}
        <div className="absolute top-3 right-3">
          <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ background: `${typeColor}20`, color: typeColor, border: `1px solid ${typeColor}40` }}>
            {TYPE_LABELS[realm.environment_type] || 'World'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-white text-base mb-1 truncate">{realm.name}</h3>
        {realm.description && (
          <p className="text-xs mb-3 line-clamp-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {realm.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {(realm.tags || []).slice(0, 3).map(tag => (
              <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Users className="w-3 h-3" />
            <span>{realm.max_avatars || 50}</span>
          </div>
        </div>
      </div>

      {/* Enter button always visible at bottom */}
      <div className="px-4 pb-4">
        <Link
          to={`${createPageUrl('DripSync')}?realmId=${realm.id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:brightness-110"
          style={{
            background: `linear-gradient(135deg, ${typeColor}25, ${typeColor}10)`,
            color: typeColor,
            border: `1px solid ${typeColor}30`,
          }}
        >
          <Zap className="w-3 h-3" />
          Enter World
        </Link>
      </div>
    </motion.div>
  );
}

export default function Realms() {
  const [filter, setFilter] = useState('all');

  const { data: realms = [], isLoading } = useQuery({
    queryKey: ['realms'],
    queryFn: () => base44.entities.Realm.list('-created_date', 50),
  });

  const filtered = filter === 'all'
    ? realms
    : filter === 'featured'
    ? realms.filter(r => r.is_featured)
    : realms.filter(r => r.environment_type === filter);

  const FILTERS = [
    { id: 'all', label: 'All Worlds' },
    { id: 'featured', label: 'Featured' },
    { id: 'indoor', label: 'Indoor' },
    { id: 'outdoor', label: 'Outdoor' },
    { id: 'abstract', label: 'Abstract' },
    { id: 'studio', label: 'Studio' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      {/* Hero */}
      <div className="relative pt-16 pb-12 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #00D4FF, transparent)' }} />
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #FF3366, transparent)' }} />
        </div>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: '#00D4FF' }}>
            SKRTLIFE
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
            Virtual Worlds
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Explore immersive 3D environments with your avatar. Click any world to enter and move around freely.
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="px-6 max-w-7xl mx-auto mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: filter === f.id ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                color: filter === f.id ? '#00D4FF' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${filter === f.id ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-6 max-w-7xl mx-auto pb-24">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: '#0D0D1A' }}>
                <div className="aspect-video bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Globe className="w-12 h-12 mb-4 opacity-20" style={{ color: '#00D4FF' }} />
            <p className="font-bold text-white text-lg mb-2">No worlds yet</p>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {filter === 'all' ? 'Worlds will appear here once created.' : 'No worlds match this filter.'}
            </p>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')}
                className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{ background: 'rgba(0,212,255,0.15)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)' }}>
                Show All
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((realm, i) => (
              <RealmCard key={realm.id} realm={realm} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}