import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
    const staticNotifIds = ['drop-new', 'genesis-update', 'welcome-1'];
    const unreadStatic = staticNotifIds.filter(id => !readIds.includes(id)).length;

    base44.auth.isAuthenticated().then(async authed => {
      if (!authed) { setUnreadCount(unreadStatic); return; }
      const me = await base44.auth.me().catch(() => null);
      if (!me?.email) { setUnreadCount(unreadStatic); return; }
      base44.entities.Order.filter({ user_email: me.email }, '-created_date', 20)
        .then(orders => {
          const orderNotifIds = (orders || []).map(o => `order-${o.id}`);
          const unreadOrders = orderNotifIds.filter(id => !readIds.includes(id)).length;
          setUnreadCount(Math.min(unreadOrders + unreadStatic, 99));
        })
        .catch(() => setUnreadCount(unreadStatic));
    }).catch(() => setUnreadCount(unreadStatic));
  }, []);

  return (
    <Link
      to="/Notifications"
      className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all"
      style={{ color: 'rgba(255,255,255,0.5)' }}
      aria-label="Notifications"
    >
      <Bell className="w-4 h-4" />
      {unreadCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
          style={{ background: '#FF3366', color: '#fff' }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}