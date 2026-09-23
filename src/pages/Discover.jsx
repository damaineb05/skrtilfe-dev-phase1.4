import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Users, Package, Zap, Calendar, Globe, Star, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

const SEARCH_CATEGORIES = ['All', 'Products', 'Collections', 'Events', 'Creators'];

export default function Discover() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Product.filter({ status: 'active' }, '-created_date', 8).catch(() => []),
      base44.entities.Event.list('-created_date', 4).catch(() => []),
      base44.entities.Creator.filter({ status: 'active' }, '-total_sales', 6).catch(() => []),
    ]).then(([p, e, c]) => {
      setProducts(p || []);
      setEvents(e || []);
      setCreators(c || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!query.trim()) { setSearchResults(null); return; }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      const cat = activeCategory;
      const q = query.toLowerCase();
      const [prods, evts, crts] = await Promise.all([
        (cat === 'All' || cat === 'Products') ? base44.entities.Product.list('-created_date', 50).catch(() => []) : Promise.resolve([]),
        (cat === 'All' || cat === 'Events') ? base44.entities.Event.list('-created_date', 20).catch(() => []) : Promise.resolve([]),
        (cat === 'All' || cat === 'Creators') ? base44.entities.Creator.list('-total_sales', 20).catch(() => []) : Promise.resolve([]),
      ]);
      setSearchResults({
        products: prods.filter(p => p.title?.toLowerCase().includes(q) || p.collection?.toLowerCase().includes(q)),
        events: evts.filter(e => e.title?.toLowerCase().includes(q)),
        creators: crts.filter(c => c.name?.toLowerCase().includes(q) || c.handle?.toLowerCase().includes(q)),
      });
      setSearchLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-[9px] tracking-[0.45em] uppercase mb-3 font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Explore
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2" style={{ letterSpacing: '-0.03em' }}>
            DISCOVER
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Find products, creators, events, and collections</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, creators, events..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl text-white text-base placeholder-white/30 focus:outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: 15,
              }}
              onFocus={e => e.target.style.borderColor = '#00D4FF'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          {/* Category pills */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {SEARCH_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
                style={{
                  background: activeCategory === cat ? '#00D4FF' : 'rgba(255,255,255,0.05)',
                  color: activeCategory === cat ? '#000' : 'rgba(255,255,255,0.5)',
                  border: '1px solid',
                  borderColor: activeCategory === cat ? '#00D4FF' : 'rgba(255,255,255,0.08)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search Results */}
        {query.trim() && (
          <div className="mb-12">
            {searchLoading ? (
              <SearchSkeleton />
            ) : searchResults ? (
              <div className="space-y-8">
                {searchResults.products.length > 0 && (
                  <SearchSection title="Products" icon={Package}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {searchResults.products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                  </SearchSection>
                )}
                {searchResults.creators.length > 0 && (
                  <SearchSection title="Creators" icon={Users}>
                    <div className="flex gap-4 flex-wrap">
                      {searchResults.creators.slice(0, 4).map(c => <CreatorChip key={c.id} creator={c} />)}
                    </div>
                  </SearchSection>
                )}
                {searchResults.events.length > 0 && (
                  <SearchSection title="Events" icon={Calendar}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.events.slice(0, 2).map(e => <EventCard key={e.id} event={e} />)}
                    </div>
                  </SearchSection>
                )}
                {!searchResults.products.length && !searchResults.creators.length && !searchResults.events.length && (
                  <div className="py-16 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    No results found for "{query}"
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Main Discovery Content (shown when not searching) */}
        {!query.trim() && !loading && (
          <div className="space-y-16">
            {/* Featured Products */}
            <Section title="Trending Products" icon={TrendingUp} href={createPageUrl('Shop')}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </Section>

            {/* Featured Creators */}
            {creators.length > 0 && (
              <Section title="Featured Creators" icon={Star}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {creators.map(c => <CreatorCard key={c.id} creator={c} />)}
                </div>
              </Section>
            )}

            {/* Upcoming Events */}
            {events.length > 0 && (
              <Section title="Upcoming Events" icon={Calendar} href={createPageUrl('Events')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.slice(0, 4).map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </Section>
            )}

            {/* Explore Sections */}
            <Section title="Explore Platform" icon={Globe}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { title: 'DripSync Studio', desc: 'Build your avatar look', href: createPageUrl('DripSync'), color: '#00D4FF', icon: Zap },
                  { title: 'Genesis Membership', desc: 'Access exclusive drops', href: createPageUrl('Genesis'), color: '#FFD700', icon: Star },
                  { title: 'Product Drops', desc: 'Limited releases & waitlists', href: '/Drops', color: '#FF3366', icon: Package },
                  { title: 'Community', desc: 'Connect with the society', href: createPageUrl('Community'), color: '#a78bfa', icon: Users },
                  { title: 'Events', desc: 'IRL & virtual experiences', href: createPageUrl('Events'), color: '#f59e0b', icon: Calendar },
                  { title: 'NFT Marketplace', desc: 'Digital collectibles', href: createPageUrl('NFTMarketplace'), color: '#34d399', icon: Globe },
                ].map(item => (
                  <Link key={item.title} to={item.href}>
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="p-5 rounded-2xl h-full"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <item.icon className="w-5 h-5 mb-3" style={{ color: item.color }} />
                      <p className="font-bold text-white text-sm mb-1">{item.title}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.desc}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </Section>
          </div>
        )}

        {loading && !query && <DiscoverSkeleton />}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, href, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: '#00D4FF' }} />
          <h2 className="font-black text-white text-xl" style={{ letterSpacing: '-0.02em' }}>{title}</h2>
        </div>
        {href && (
          <Link to={href} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
            See All <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      {children}
    </motion.div>
  );
}

function SearchSection({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4" style={{ color: '#00D4FF' }} />
        <h3 className="font-bold text-white text-sm uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ProductCard({ product }) {
  const img = product.media?.[0]?.url || 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400&q=80';
  return (
    <Link to={`${createPageUrl('ProductDetail')}?id=${product.id}`}>
      <motion.div whileHover={{ y: -2 }} className="group rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="aspect-square overflow-hidden">
          <img src={img} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="p-3">
          <p className="text-white font-semibold text-sm truncate">{product.title}</p>
          <p className="font-bold text-sm mt-0.5" style={{ color: '#00D4FF' }}>${product.price}</p>
        </div>
      </motion.div>
    </Link>
  );
}

function CreatorCard({ creator }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="text-center p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="w-14 h-14 rounded-full mx-auto mb-3 overflow-hidden flex items-center justify-center text-xl font-black text-white" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(255,51,102,0.3))' }}>
        {creator.avatar_url ? <img src={creator.avatar_url} alt={creator.name} className="w-full h-full object-cover" /> : creator.name?.charAt(0)}
      </div>
      <p className="text-white font-bold text-xs truncate">{creator.name}</p>
      {creator.is_verified && <span className="text-[9px]" style={{ color: '#00D4FF' }}>✓ Verified</span>}
    </motion.div>
  );
}

function CreatorChip({ creator }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.4), rgba(255,51,102,0.3))' }}>
        {creator.name?.charAt(0)}
      </div>
      <span className="text-sm text-white font-medium">{creator.name}</span>
    </div>
  );
}

function EventCard({ event }) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-[9px] uppercase tracking-wider mb-2 font-semibold" style={{ color: '#FFD700' }}>Upcoming</p>
      <p className="text-white font-bold">{event.title}</p>
      {event.start_date && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{new Date(event.start_date).toLocaleDateString()}</p>}
    </div>
  );
}

function DiscoverSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-48 rounded-2xl shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />
      ))}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="aspect-square rounded-xl shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />
      ))}
    </div>
  );
}