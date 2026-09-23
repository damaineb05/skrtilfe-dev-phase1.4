import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Menu, ShoppingCart, Home, ShoppingBag, Layers, Users,
  BarChart2, Zap, Image, Crown, Newspaper, Compass, Package, Rss,
} from 'lucide-react';
import NavTicker from './NavTicker';
import NavDrawer from './NavDrawer';
import CreatorEmailGate from '@/components/auth/CreatorEmailGate';
import NotificationBell from './NotificationBell';

// Pages that auto-switch to advanced mode
const ADVANCED_PAGES = ['Dashboard', 'DripSync', 'Wallet', 'Portfolio', 'Analytics'];

const STANDARD_NAV = [
  { name: 'Home',       href: createPageUrl('Home'),       icon: Home },
  { name: 'Discover',   href: '/Discover',                 icon: Compass },
  { name: 'Drops',      href: '/Drops',                    icon: Package },
  { name: 'Shop',       href: createPageUrl('Shop'),       icon: ShoppingBag },
  { name: 'Genesis',    href: createPageUrl('Genesis'),    icon: Crown },
  { name: 'Community',  href: createPageUrl('Community'),  icon: Users },
];

const ADVANCED_NAV = [
  { name: 'Dashboard',  href: createPageUrl('Dashboard'),  icon: Layers },
  { name: 'DripSync',   href: createPageUrl('DripSync'),   icon: Zap },
  { name: 'Feed',       href: '/Feed',                     icon: Rss },
  { name: 'Shop',       href: createPageUrl('Shop'),       icon: ShoppingBag },
  { name: 'Membership', href: '/Membership',               icon: Crown },
  { name: 'Community',  href: createPageUrl('Community'),  icon: Users },
];

function BrandDots({ size = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {['#FF0000', '#0000FF', '#FFFF00'].map((color, i) => (
        <span key={i} style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'inline-block' }} />
      ))}
    </div>
  );
}

export default function DualModeNav({ currentUser, isScrolled, cartCount }) {
  const location = useLocation();
  const [navMode, setNavMode] = useState(() => localStorage.getItem('nav_mode') || 'standard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showCreatorGate, setShowCreatorGate] = useState(false);

  // Auto-switch mode based on current page
  useEffect(() => {
    const pageName = location.pathname.replace('/', '') || 'Home';
    if (ADVANCED_PAGES.some(p => location.pathname.includes(p))) {
      setNavMode('advanced');
    }
  }, [location.pathname]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleModeChange = useCallback((mode) => {
    setNavMode(mode);
    localStorage.setItem('nav_mode', mode);
  }, []);

  const currentNav = navMode === 'advanced' ? ADVANCED_NAV : STANDARD_NAV;

  const isLinkActive = useCallback((href) => {
    if (href === '/' || href === createPageUrl('Home')) return location.pathname === '/';
    return location.pathname.startsWith(href);
  }, [location.pathname]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[9990]"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          background: isScrolled
            ? 'rgba(7,7,9,0.97)'
            : 'rgba(10,10,15,0.92)',
          backdropFilter: 'blur(24px) saturate(150%)',
          WebkitBackdropFilter: 'blur(24px) saturate(150%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: isScrolled ? '0 4px 32px rgba(0,0,0,0.5)' : 'none',
          transition: 'background 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Ticker */}
        <NavTicker />

        {/* Main bar */}
        <div className="flex items-center justify-between px-4 md:px-8" style={{ height: 60 }}>
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center gap-2.5 flex-shrink-0">
            <img
              src="https://media.base44.com/images/public/68bc2773ba0ba8d2da222a27/d210c1fef_WHITELOGO.png"
              alt="SKRTLIFE"
              style={{ height: 28, width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0">
            {currentNav.map((item) => {
              const isActive = isLinkActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="relative px-4 py-5 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-200 whitespace-nowrap"
                  style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}
                >
                  {item.name}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3"
                      style={{ height: 1, background: '#fff' }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Mode toggle (desktop only) */}
            <div className="hidden lg:flex items-center gap-1 p-1 rounded-lg mr-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {['standard', 'advanced'].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    if (m === 'advanced' && !currentUser) {
                      setShowCreatorGate(true);
                      return;
                    }
                    handleModeChange(m);
                  }}
                  className="px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                  style={{
                    background: navMode === m
                      ? (m === 'advanced' ? 'rgba(0,212,255,0.18)' : 'rgba(255,255,255,0.1)')
                      : 'transparent',
                    color: navMode === m ? (m === 'advanced' ? '#00D4FF' : '#fff') : 'rgba(255,255,255,0.3)',
                    cursor: m === 'advanced' && !currentUser ? 'pointer' : 'pointer',
                  }}
                >
                  {m === 'advanced' && <Zap className="w-2.5 h-2.5" />}
                  {m === 'advanced' ? 'Creator' : 'Standard'}
                </button>
              ))}
            </div>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Cart */}
            <Link
              to={createPageUrl('Cart')}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              aria-label="Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: '#FF3366', color: '#fff' }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth (desktop) */}
            {currentUser ? (
              <Link
                to={createPageUrl('MyAccount')}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
              >
                <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                  style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.4), rgba(255,51,102,0.3))' }}>
                  {currentUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-[10px] font-semibold">{currentUser.full_name?.split(' ')[0] || 'Account'}</span>
              </Link>
            ) : (
              <button
                onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.18), rgba(0,212,255,0.08))',
                  border: '1px solid rgba(0,212,255,0.25)',
                  color: '#00D4FF',
                }}
              >
                Sign In
              </button>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.7)' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <NavDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            currentUser={currentUser}
            cartCount={cartCount}
            currentNav={currentNav}
            navMode={navMode}
            onModeChange={(m) => {
              if (m === 'advanced' && !currentUser) {
                setShowCreatorGate(true);
                return;
              }
              handleModeChange(m);
            }}
            isLinkActive={isLinkActive}
          />
        )}
      </AnimatePresence>

      {/* Creator Email Gate */}
      <CreatorEmailGate isOpen={showCreatorGate} onClose={() => setShowCreatorGate(false)} />
    </>
  );
}