import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  Home, Hash, Bell, Mail, Bookmark, User, MoreHorizontal,
  Users, Calendar, Shield, Sparkles, MessageCircle, Heart
} from 'lucide-react';

export default function LeftSidebar({ activeTab, onTabChange, unreadCounts = {} }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  const navItems = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'explore', name: 'Explore', icon: Hash },
    { id: 'notifications', name: 'Notifications', icon: Bell, badge: unreadCounts.notifications },
    { id: 'messages', name: 'Messages', icon: Mail, badge: unreadCounts.messages },
    { id: 'groups', name: 'Groups', icon: Users },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'bookmarks', name: 'Bookmarks', icon: Bookmark },
    { id: 'profile', name: 'Profile', icon: User },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', padding: '16px' }}>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map(item => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 transition-all relative"
              style={{
                background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.4)',
                borderLeft: active ? '1px solid rgba(255,255,255,0.5)' : '1px solid transparent',
              }}
            >
              <div className="relative">
                <item.icon className="w-4 h-4" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] hidden lg:inline">{item.name}</span>
            </button>
          );
        })}

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => onTabChange?.('moderation')}
            className="w-full flex items-center gap-3 px-3 py-2.5 transition-all"
            style={{ color: activeTab === 'moderation' ? '#fff' : 'rgba(255,255,255,0.3)' }}
          >
            <Shield className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em] hidden lg:inline">Moderation</span>
          </button>
        )}
      </nav>

      {/* Post Button */}
      <div className="my-4">
        <button
          onClick={() => onTabChange?.('create-post')}
          className="hidden lg:flex w-full items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black bg-white transition-opacity hover:opacity-80"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Create Post
        </button>
        <button
          onClick={() => onTabChange?.('create-post')}
          className="lg:hidden w-10 h-10 flex items-center justify-center bg-white text-black"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* User */}
      <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {currentUser ? (
          <button
            onClick={() => onTabChange?.('profile')}
            className="w-full flex items-center gap-3 px-2 py-2 transition-opacity hover:opacity-70"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF3366, #00D4FF)' }}>
              {(currentUser.full_name?.charAt(0) || currentUser.email?.charAt(0) || 'U').toUpperCase()}
            </div>
            <div className="hidden lg:block text-left flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.full_name || 'User'}</p>
              <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>@{currentUser.email?.split('@')[0]}</p>
            </div>
            <MoreHorizontal className="w-4 h-4 shrink-0 hidden lg:block" style={{ color: 'rgba(255,255,255,0.3)' }} />
          </button>
        ) : (
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="w-full py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-70"
            style={{ border: '1px solid rgba(255,255,255,0.15)' }}
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}