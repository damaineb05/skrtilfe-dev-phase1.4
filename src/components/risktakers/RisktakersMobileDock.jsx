import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, ShoppingBag, Sparkles, User } from 'lucide-react';

const DOCK_ITEMS = [
  { label: 'Home', icon: Home, href: createPageUrl('Home') },
  { label: 'Shop', icon: ShoppingBag, href: createPageUrl('Shop') },
  { label: 'DripSync', icon: Sparkles, href: createPageUrl('DripSync') },
  { label: 'Profile', icon: User, href: createPageUrl('MyAccount') },
];

export default function RisktakersMobileDock({ visible }) {
  const location = useLocation();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="dock"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[800] lg:hidden"
        >
          <div
            className="flex items-center gap-1 px-4 py-2.5 rounded-[28px]"
            style={{
              background: 'rgba(12,12,16,0.82)',
              backdropFilter: 'blur(32px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
            }}
          >
            {DOCK_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || location.pathname.includes(item.href.split('/').pop());
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className="relative flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  }}
                >
                  <Icon
                    className="w-5 h-5 transition-all"
                    style={{
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                      filter: isActive ? '0 0 12px rgba(255,255,255,0.5)' : 'none',
                    }}
                  />
                  {/* Active glow dot */}
                  {isActive && (
                    <motion.div
                      layoutId="dockDot"
                      className="absolute bottom-1.5 w-1 h-1 rounded-full"
                      style={{ background: '#B8960C' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}