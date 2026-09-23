import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Bell, Package, Crown, MessageCircle, UserPlus, Zap, Calendar, ShoppingBag, Check } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';

const NOTIF_ICONS = {
  order: { icon: ShoppingBag, color: '#00D4FF' },
  genesis: { icon: Crown, color: '#FFD700' },
  drop: { icon: Package, color: '#FF3366' },
  message: { icon: MessageCircle, color: '#a78bfa' },
  follow: { icon: UserPlus, color: '#34d399' },
  dripsync: { icon: Zap, color: '#00D4FF' },
  event: { icon: Calendar, color: '#f59e0b' },
  system: { icon: Bell, color: 'rgba(255,255,255,0.5)' },
};

function buildNotifications(orders) {
  const notifs = [];

  // Order notifications
  orders.forEach(o => {
    notifs.push({
      id: `order-${o.id}`,
      type: 'order',
      title: o.payment_status === 'paid' ? 'Order Confirmed' : o.payment_status === 'failed' ? 'Payment Failed' : 'Order Pending',
      message: `Your order #${o.id?.slice(0, 8)} — $${o.total_amount?.toFixed(2)}`,
      time: o.created_date,
      read: false,
      href: createPageUrl('MyAccount'),
    });
  });

  // Platform welcome
  notifs.push({
    id: 'welcome-1',
    type: 'system',
    title: 'Welcome to Skrtlife Digital Society',
    message: 'Explore DripSync, shop exclusive drops, and join the community.',
    time: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    href: '/',
  });

  notifs.push({
    id: 'drop-new',
    type: 'drop',
    title: 'New Drop Alert',
    message: 'The latest collection just dropped. Limited pieces available.',
    time: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    href: '/Drops',
  });

  notifs.push({
    id: 'genesis-update',
    type: 'genesis',
    title: 'Genesis Update',
    message: 'New exclusive wearables are available for Genesis members.',
    time: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    href: createPageUrl('Genesis'),
  });

  return notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
}

export default function Notifications() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('read_notifs') || '[]'); } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    base44.entities.Order.filter({ user_email: user.email }, '-created_date', 20)
      .then(o => { setOrders(o || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user?.email]);

  const notifications = buildNotifications(orders).map(n => ({ ...n, read: readIds.includes(n.id) }));
  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id) => {
    const updated = [...new Set([...readIds, id])];
    setReadIds(updated);
    localStorage.setItem('read_notifs', JSON.stringify(updated));
  };

  const markAllRead = () => {
    const all = notifications.map(n => n.id);
    setReadIds(all);
    localStorage.setItem('read_notifs', JSON.stringify(all));
  };

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6" style={{ color: '#00D4FF' }} />
              <h1 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#FF3366', color: '#fff' }}>
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Filter */}
          <div className="flex gap-2 mt-5">
            {['all', 'unread'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
                style={{ background: filter === f ? '#00D4FF' : 'rgba(255,255,255,0.05)', color: filter === f ? '#000' : 'rgba(255,255,255,0.5)', border: '1px solid', borderColor: filter === f ? '#00D4FF' : 'rgba(255,255,255,0.08)' }}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notif, idx) => {
              const cfg = NOTIF_ICONS[notif.type] || NOTIF_ICONS.system;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Link
                    to={notif.href || '#'}
                    onClick={() => markRead(notif.id)}
                    className="flex items-start gap-4 p-4 rounded-2xl transition-all hover:bg-white/5"
                    style={{
                      background: !notif.read ? 'rgba(0,212,255,0.04)' : 'rgba(255,255,255,0.02)',
                      border: '1px solid',
                      borderColor: !notif.read ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${cfg.color}18` }}>
                      <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-sm text-white">{notif.title}</p>
                        <p className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {formatTime(notif.time)}
                        </p>
                      </div>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{notif.message}</p>
                    </div>

                    {/* Unread dot */}
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: '#00D4FF' }} />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return Math.floor(hrs / 24) + 'd ago';
}