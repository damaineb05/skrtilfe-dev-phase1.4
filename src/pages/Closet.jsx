/**
 * Avatar Closet — uses existing Wearable, UserInventory, AssetOwnership entities.
 * Connects directly to DripSync via URL params.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Zap, Package, Heart, ShoppingBag, ArrowRight, Search } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';

const CATEGORIES = ['All', 'Top', 'Bottom', 'Shoes', 'Headwear', 'Accessory', 'Full Body'];
const SORT_OPTIONS = ['Newest', 'Oldest', 'Name A-Z'];

export default function Closet() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [wearables, setWearables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Newest');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('closet_favs') || '[]'); } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState('owned');

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    Promise.all([
      base44.entities.UserInventory.filter({ user_id: user.id }, '-created_date', 100).catch(() => []),
      base44.entities.Wearable.list('-created_date', 50).catch(() => []),
    ]).then(([inv, wear]) => {
      setInventory(inv || []);
      setWearables(wear || []);
      setLoading(false);
    });
  }, [user?.id]);

  const toggleFav = (id) => {
    const updated = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('closet_favs', JSON.stringify(updated));
  };

  // Map inventory items to displayable wearable-like objects
  const ownedItems = inventory.map(item => ({
    id: item.id,
    name: item.asset_name || item.name || 'Unknown Item',
    category: item.category || item.asset_type || 'accessory',
    url: item.asset_url || item.url,
    thumbnail: item.thumbnail_url || item.asset_thumbnail,
    slot: item.slot || item.category,
    created_date: item.created_date,
    source: 'inventory',
    metadata: item.asset_metadata || {},
  }));

  // Also show wearables from user's avatar config
  const avatarWearables = (user?.avatar_config?.wearables || []).map(w => ({
    id: w.id || Math.random().toString(36).slice(2),
    name: w.name || 'Equipped Item',
    category: w.slot || 'accessory',
    url: w.url,
    thumbnail: null,
    slot: w.slot,
    created_date: new Date().toISOString(),
    source: 'equipped',
    metadata: w,
    isEquipped: true,
  }));

  const allItems = activeTab === 'owned'
    ? ownedItems
    : activeTab === 'equipped'
    ? avatarWearables
    : activeTab === 'favorites'
    ? [...ownedItems, ...avatarWearables].filter(i => favorites.includes(i.id))
    : ownedItems;

  // Filter + sort
  const filtered = allItems
    .filter(item => {
      if (category !== 'All' && item.category?.toLowerCase() !== category.toLowerCase()) return false;
      if (search && !item.name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'Newest') return new Date(b.created_date) - new Date(a.created_date);
      if (sort === 'Oldest') return new Date(a.created_date) - new Date(b.created_date);
      if (sort === 'Name A-Z') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0A0A0F' }}>
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30 text-white" />
          <h2 className="text-2xl font-black text-white mb-3">Sign in to view your closet</h2>
          <button onClick={() => base44.auth.redirectToLogin('/Closet')}
            className="px-8 py-3 rounded-xl font-bold text-sm" style={{ background: '#00D4FF', color: '#000' }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-[9px] tracking-[0.45em] uppercase mb-3 font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>Avatar</p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-4xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>MY CLOSET</h1>
            <Link to={createPageUrl('DripSync')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)', color: '#00D4FF' }}>
              <Zap className="w-4 h-4" /> Open DripSync
            </Link>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {[
            { id: 'owned', label: `Owned (${ownedItems.length})` },
            { id: 'equipped', label: `Equipped (${avatarWearables.length})` },
            { id: 'favorites', label: `Favorites (${favorites.length})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              style={{
                background: activeTab === tab.id ? '#00D4FF' : 'transparent',
                color: activeTab === tab.id ? '#000' : 'rgba(255,255,255,0.4)',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className="px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all"
                style={{
                  background: category === cat ? '#00D4FF' : 'rgba(255,255,255,0.05)',
                  color: category === cat ? '#000' : 'rgba(255,255,255,0.5)',
                  border: '1px solid',
                  borderColor: category === cat ? '#00D4FF' : 'rgba(255,255,255,0.08)',
                }}>
                {cat}
              </button>
            ))}
          </div>

          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {SORT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square rounded-2xl shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold mb-2">
              {activeTab === 'owned' ? 'No owned items yet' : activeTab === 'equipped' ? 'Nothing equipped' : 'No favorites yet'}
            </p>
            {activeTab === 'owned' && (
              <Link to={createPageUrl('Shop')} className="inline-flex items-center gap-2 mt-4 text-sm font-semibold" style={{ color: '#00D4FF' }}>
                <ShoppingBag className="w-4 h-4" /> Shop Products
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map(item => (
              <motion.div key={item.id} whileHover={{ y: -2 }} className="group rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${item.isEquipped ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                {/* Thumbnail */}
                <div className="aspect-square relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(255,51,102,0.06))' }}>
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 opacity-20 text-white" />
                    </div>
                  )}

                  {item.isEquipped && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase" style={{ background: '#00D4FF', color: '#000' }}>On</div>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Link to={`${createPageUrl('DripSync')}?tryOn=${encodeURIComponent(JSON.stringify({ name: item.name, url: item.url, slot: item.slot || 'accessory', bone: item.metadata?.bone || 'Hips', position: [0,0,0], rotation: [0,0,0], scale: 1 }))}`}
                      className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#00D4FF', color: '#000' }}
                      title="Try On in DripSync">
                      <Zap className="w-4 h-4" />
                    </Link>
                    <button onClick={() => toggleFav(item.id)} className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.15)', color: favorites.includes(item.id) ? '#FF3366' : '#fff' }}>
                      <Heart className={`w-4 h-4 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="p-2.5">
                  <p className="text-white font-semibold text-xs truncate">{item.name}</p>
                  <p className="text-[10px] mt-0.5 capitalize" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Shop CTA if empty */}
        {!loading && ownedItems.length === 0 && activeTab === 'owned' && (
          <div className="mt-8 p-8 rounded-2xl text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30 text-white" />
            <p className="text-white font-bold mb-1">Your closet is empty</p>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>Shop products to build your digital wardrobe</p>
            <Link to={createPageUrl('Shop')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              style={{ background: '#00D4FF', color: '#000' }}>
              Browse Shop <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}