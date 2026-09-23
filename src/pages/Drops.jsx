import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Clock, Bell, Crown, Calendar, ArrowRight, Zap, Package } from 'lucide-react';
import { createPageUrl } from '@/utils';

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    if (!targetDate) return;
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return setTimeLeft({ expired: true });
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

export default function Drops() {
  const [products, setProducts] = useState([]);
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifyIds, setNotifyIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('drop_notify') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    Promise.all([
      base44.entities.Product.filter({ status: 'active' }, '-created_date', 12).catch(() => []),
      base44.entities.Drop.list('-start_at', 8).catch(() => []),
    ]).then(([p, d]) => {
      setProducts(p || []);
      setDrops(d || []);
      setLoading(false);
    });
  }, []);

  const toggleNotify = (id) => {
    const updated = notifyIds.includes(id) ? notifyIds.filter(x => x !== id) : [...notifyIds, id];
    setNotifyIds(updated);
    localStorage.setItem('drop_notify', JSON.stringify(updated));
    base44.analytics.track({ eventName: 'drop_notify_toggle', properties: { drop_id: id, enabled: !notifyIds.includes(id) } });
  };

  // Segment products by collection
  const limitedProducts = products.filter(p => p.tags?.includes('Limited') || p.collection === 'Limited/Collab');
  const genesisProducts = products.filter(p => p.collection === 'Genesis');
  const upcomingDrops = drops.filter(d => d.status === 'upcoming' || !d.status);
  const liveDrops = drops.filter(d => d.status === 'live');

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="text-[9px] tracking-[0.45em] uppercase mb-3 font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Limited Releases
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3" style={{ letterSpacing: '-0.04em' }}>
            DROPS
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            Exclusive releases, countdowns, and limited-edition pieces.
          </p>
        </motion.div>

        {/* Live Drops Banner */}
        {liveDrops.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mb-10 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,51,102,0.15), rgba(0,212,255,0.08))', border: '1px solid rgba(255,51,102,0.3)' }}>
            <div className="flex items-center gap-2 mb-3">
              <motion.div className="w-2 h-2 rounded-full bg-red-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">Live Now</span>
            </div>
            {liveDrops.map(drop => (
              <div key={drop.id}>
                <h2 className="text-xl font-black text-white">{drop.title}</h2>
                {drop.description && <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{drop.description}</p>}
              </div>
            ))}
          </motion.div>
        )}

        {/* Upcoming Drops with Countdown */}
        {upcomingDrops.length > 0 && (
          <section className="mb-16">
            <SectionHeader title="Upcoming Drops" icon={Clock} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingDrops.map(drop => (
                <DropCountdownCard key={drop.id} drop={drop} onNotify={() => toggleNotify(drop.id)} notified={notifyIds.includes(drop.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Limited Edition Products */}
        {limitedProducts.length > 0 && (
          <section className="mb-16">
            <SectionHeader title="Limited Edition" icon={Zap} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {limitedProducts.map(p => <DropProductCard key={p.id} product={p} onNotify={() => toggleNotify(p.id)} notified={notifyIds.includes(p.id)} />)}
            </div>
          </section>
        )}

        {/* Genesis Exclusive */}
        {genesisProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" style={{ color: '#FFD700' }} />
                <h2 className="font-black text-white text-xl" style={{ letterSpacing: '-0.02em' }}>Genesis Exclusive</h2>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700' }}>Members Only</span>
              </div>
              <Link to={createPageUrl('Genesis')} className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: '#FFD700' }}>
                Get Genesis <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {genesisProducts.map(p => <DropProductCard key={p.id} product={p} genesis onNotify={() => toggleNotify(p.id)} notified={notifyIds.includes(p.id)} />)}
            </div>
          </section>
        )}

        {/* All Recent Products */}
        <section>
          <SectionHeader title="Recent Releases" icon={Package} href={createPageUrl('Shop')} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(0, 8).map(p => <DropProductCard key={p.id} product={p} onNotify={() => toggleNotify(p.id)} notified={notifyIds.includes(p.id)} />)}
          </div>
        </section>

        {!loading && products.length === 0 && drops.length === 0 && (
          <div className="text-center py-24" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No drops yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, icon: Icon, href }) {
  return (
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
  );
}

function DropCountdownCard({ drop, onNotify, notified }) {
  const countdown = useCountdown(drop.start_at);
  return (
    <motion.div whileHover={{ y: -2 }} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {drop.hero_image_url && (
        <div className="w-full h-40 rounded-xl overflow-hidden mb-4">
          <img src={drop.hero_image_url} alt={drop.title} className="w-full h-full object-cover" />
        </div>
      )}
      <h3 className="text-white font-black text-lg mb-1">{drop.title}</h3>
      {drop.description && <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{drop.description}</p>}

      {/* Countdown */}
      {!countdown.expired && countdown.days !== undefined && (
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[['Days', countdown.days], ['Hrs', countdown.hours], ['Min', countdown.mins], ['Sec', countdown.secs]].map(([label, val]) => (
            <div key={label} className="text-center p-2 rounded-xl" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
              <p className="text-xl font-black" style={{ color: '#00D4FF' }}>{String(val).padStart(2, '0')}</p>
              <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onNotify}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          style={{
            background: notified ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: '1px solid',
            borderColor: notified ? '#00D4FF' : 'rgba(255,255,255,0.1)',
            color: notified ? '#00D4FF' : 'rgba(255,255,255,0.6)',
          }}
        >
          <Bell className="w-3.5 h-3.5" />
          {notified ? 'Notified' : 'Notify Me'}
        </button>
        <button
          onClick={() => {
            const cal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(drop.title)}&dates=${new Date(drop.start_at).toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(new Date(drop.start_at).getTime() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
            window.open(cal, '_blank');
          }}
          className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
        >
          <Calendar className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function DropProductCard({ product, genesis, onNotify, notified }) {
  const img = product.media?.[0]?.url || 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400&q=80';
  return (
    <motion.div whileHover={{ y: -3 }} className="group rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${genesis ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.08)'}` }}>
      <Link to={`${createPageUrl('ProductDetail')}?id=${product.id}`}>
        <div className="aspect-square overflow-hidden relative">
          <img src={img} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {genesis && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ background: 'rgba(0,0,0,0.7)', color: '#FFD700' }}>
              <Crown className="w-2.5 h-2.5" /> Genesis
            </div>
          )}
          {product.inventory_qty <= (product.low_stock_threshold || 5) && product.inventory_qty > 0 && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: '#FF3366', color: '#fff' }}>
              Low Stock
            </div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <p className="text-white font-semibold text-sm truncate">{product.title}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="font-bold text-sm" style={{ color: '#00D4FF' }}>${product.price}</p>
          <button
            onClick={onNotify}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ background: notified ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)', color: notified ? '#00D4FF' : 'rgba(255,255,255,0.3)' }}
          >
            <Bell className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}