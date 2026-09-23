/**
 * DripSyncOSApps — District-to-App Router
 *
 * Maps each district ID to its app content.
 * stream   → StreamingHub (full)
 * closet   → Wearables micro-browser
 * marketplace → Listings micro-browser
 * social   → Community feed
 * vault    → NFT collection viewer
 * studio   → Creator tools launcher
 */
import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import StreamingHub from '@/components/streaming/StreamingHub';
import { ChevronRight, ExternalLink, Loader2 } from 'lucide-react';

// ── Shared primitives ────────────────────────────────────────────────────────
function AppLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgba(255,255,255,0.2)' }} />
    </div>
  );
}

function EmptyHint({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
      <span className="text-3xl opacity-30">{icon}</span>
      <p className="text-[10px] text-white/25 tracking-wider">{text}</p>
    </div>
  );
}

// ── CLOSET ───────────────────────────────────────────────────────────────────
function ClosetApp() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Wearable.list('-created_date', 24)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLoader />;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <p className="text-[8px] font-black tracking-[0.3em] uppercase" style={{ color: '#a855f7' }}>
          {items.length} Wearables
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none">
        {items.length === 0
          ? <EmptyHint icon="👗" text="No wearables in your closet yet" />
          : (
            <div className="grid grid-cols-3 gap-2">
              {items.map(item => (
                <div
                  key={item.id}
                  className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105 hover:brightness-110"
                  style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.18)' }}
                >
                  {item.thumbnail_url
                    ? <img src={item.thumbnail_url} alt={item.name} className="w-full aspect-square object-cover" />
                    : <div className="w-full aspect-square flex items-center justify-center text-3xl">👗</div>
                  }
                  <div className="p-1.5">
                    <p className="text-[9px] font-bold text-white/70 truncate">{item.name || 'Item'}</p>
                    {item.category && (
                      <p className="text-[8px] text-white/30 truncate">{item.category}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

// ── MARKETPLACE ──────────────────────────────────────────────────────────────
function MarketplaceApp() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Listing.list('-created_date', 16)
      .then(setListings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLoader />;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 flex-shrink-0 flex items-center justify-between">
        <p className="text-[8px] font-black tracking-[0.3em] uppercase" style={{ color: '#06b6d4' }}>
          {listings.length} Listings Live
        </p>
        <a href="/NFTMarketplace" className="flex items-center gap-1 text-[8px] font-bold tracking-wider uppercase hover:opacity-70 transition-opacity" style={{ color: '#06b6d4' }}>
          Full Market <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none space-y-2">
        {listings.length === 0
          ? <EmptyHint icon="🛍️" text="No active listings right now" />
          : listings.map(l => (
            <div key={l.id}
              className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all hover:bg-white/5"
              style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.14)' }}>
              {l.thumbnail_url
                ? <img src={l.thumbnail_url} alt={l.name} className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
                : <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(6,182,212,0.15)' }}>🛍️</div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{l.name || 'Item'}</p>
                <p className="text-[10px] font-semibold" style={{ color: '#06b6d4' }}>
                  {l.price ? `${l.price} ${l.currency || 'ETH'}` : 'Make Offer'}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.18)' }} />
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── SOCIAL ───────────────────────────────────────────────────────────────────
function SocialApp() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Post.list('-created_date', 12)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLoader />;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 flex-shrink-0 flex items-center justify-between">
        <p className="text-[8px] font-black tracking-[0.3em] uppercase" style={{ color: '#ec4899' }}>Community Feed</p>
        <a href="/Feed" className="flex items-center gap-1 text-[8px] font-bold tracking-wider uppercase hover:opacity-70 transition-opacity" style={{ color: '#ec4899' }}>
          Open Feed <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none space-y-2.5">
        {posts.length === 0
          ? <EmptyHint icon="👥" text="No posts in the community yet" />
          : posts.map(p => (
            <div key={p.id} className="p-3 rounded-xl" style={{ background: 'rgba(236,72,153,0.07)', border: '1px solid rgba(236,72,153,0.13)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ background: 'rgba(236,72,153,0.2)' }}>
                  {(p.author_name || p.user_email || '?').charAt(0).toUpperCase()}
                </div>
                <p className="text-[9px] font-bold text-white/40 truncate">{p.author_name || p.user_email || 'Community'}</p>
              </div>
              <p className="text-xs text-white/75 line-clamp-3 leading-relaxed">{p.content || p.caption || p.text || 'No content'}</p>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── VAULT ────────────────────────────────────────────────────────────────────
function VaultApp() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.NFT.list('-created_date', 15)
      .then(setNfts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLoader />;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 flex-shrink-0 flex items-center justify-between">
        <p className="text-[8px] font-black tracking-[0.3em] uppercase" style={{ color: '#f59e0b' }}>
          {nfts.length} Items
        </p>
        <a href="/NFTMarketplace" className="flex items-center gap-1 text-[8px] font-bold tracking-wider uppercase hover:opacity-70 transition-opacity" style={{ color: '#f59e0b' }}>
          Full Vault <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none">
        {nfts.length === 0
          ? <EmptyHint icon="🏆" text="Your vault is empty — mint your first item" />
          : (
            <div className="grid grid-cols-3 gap-2">
              {nfts.map(n => (
                <div key={n.id}
                  className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105"
                  style={{ border: '1px solid rgba(245,158,11,0.2)' }}>
                  {n.image_url || n.thumbnail_url
                    ? <img src={n.image_url || n.thumbnail_url} alt={n.name} className="w-full aspect-square object-cover" />
                    : <div className="w-full aspect-square flex items-center justify-center text-2xl" style={{ background: 'rgba(245,158,11,0.08)' }}>🏆</div>
                  }
                  <div className="p-1.5" style={{ background: 'rgba(245,158,11,0.06)' }}>
                    <p className="text-[9px] font-bold text-white/70 truncate">{n.name || 'NFT'}</p>
                    {n.price && <p className="text-[8px]" style={{ color: '#f59e0b' }}>{n.price} ETH</p>}
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

// ── STUDIO ───────────────────────────────────────────────────────────────────
function StudioApp() {
  const tools = [
    { label: 'Avatar Studio',   sub: 'Edit your look',       icon: '🎭', path: '/DripSync' },
    { label: 'Drop Creator',    sub: 'Launch a collection',  icon: '🚀', path: '/AdminWearables' },
    { label: 'NFT Minter',      sub: 'Mint on-chain',        icon: '⛏️', path: '/NFTMarketplace' },
    { label: 'Scene Builder',   sub: 'Design your world',    icon: '🌐', path: '/DripSync' },
    { label: 'Analytics',       sub: 'Track performance',    icon: '📊', path: '/Analytics' },
    { label: 'Blog Studio',     sub: 'Publish content',      icon: '✍️', path: '/Blog' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <p className="text-[8px] font-black tracking-[0.3em] uppercase" style={{ color: '#10b981' }}>Creator Tools</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none">
        <div className="grid grid-cols-2 gap-2">
          {tools.map(t => (
            <a
              key={t.label}
              href={t.path}
              className="flex flex-col p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] hover:brightness-110"
              style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)' }}
            >
              <span className="text-2xl mb-2">{t.icon}</span>
              <p className="text-xs font-black text-white">{t.label}</p>
              <p className="text-[9px] text-white/35 mt-0.5">{t.sub}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ROUTER ───────────────────────────────────────────────────────────────────
export default function DripSyncOSApps({ districtId }) {
  switch (districtId) {
    case 'stream':       return <StreamingHub />;
    case 'closet':       return <ClosetApp />;
    case 'marketplace':  return <MarketplaceApp />;
    case 'social':       return <SocialApp />;
    case 'vault':        return <VaultApp />;
    case 'studio':       return <StudioApp />;
    default:             return null;
  }
}