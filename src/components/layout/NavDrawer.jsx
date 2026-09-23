import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { X, LogIn, LogOut, ShoppingCart, ShoppingBag, User, Layers, Crown, Zap, Bell, Bookmark, Compass, Package, Rss, Archive, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import GenesisBadge from '@/components/genesis/GenesisBadge';
import { hasGenesisAccess } from '@/lib/useCanonicalGenesisAccess';

function BrandDots({ size = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {['#FF0000', '#0000FF', '#FFFF00'].map((color, i) => (
        <span key={i} style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'inline-block' }} />
      ))}
    </div>
  );
}

export default function NavDrawer({
  isOpen, onClose, currentUser, cartCount,
  currentNav, navMode, onModeChange, isLinkActive,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9997] lg:hidden"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed top-0 right-0 bottom-0 z-[9998] lg:hidden flex flex-col"
        style={{
          width: 'min(100vw, 360px)',
          background: '#0A0A0F',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Link to={createPageUrl('Home')} onClick={onClose}>
            <img
              src="https://media.base44.com/images/public/68bc2773ba0ba8d2da222a27/d210c1fef_WHITELOGO.png"
              alt="SKRTLIFE"
              style={{ height: 32, width: 'auto', objectFit: 'contain' }}
            />
          </Link>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label="Close menu"
          >
            <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.7)' }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-5">

            {/* User block */}
            <div className="rounded-2xl p-3.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-black text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(255,51,102,0.3))', border: '1px solid rgba(255,255,255,0.12)' }}>
                    {currentUser.full_name?.charAt(0)?.toUpperCase() || currentUser.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                   <div className="flex items-center gap-1.5">
                     <p className="font-bold text-white text-sm truncate">{currentUser.full_name || 'Member'}</p>
                     {hasGenesisAccess(currentUser) && (
                       <GenesisBadge size="sm" variant="icon" />
                     )}
                    </div>
                    <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,212,255,0.12)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)' }}>
                      {currentUser.role || 'Member'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>Join the society</p>
                  <button
                    onClick={() => { base44.auth.redirectToLogin(window.location.pathname); onClose(); }}
                    className="w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl text-black flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #00D4FF, #0099cc)' }}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Genesis CTA */}
            <Link
              to={createPageUrl('Genesis')}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,170,0,0.08))',
                border: '1px solid rgba(255,215,0,0.2)',
                color: '#FFD700',
              }}
            >
              <Crown className="w-4 h-4 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">Genesis Pass</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,215,0,0.6)' }}>Lifetime access — limited supply</p>
              </div>
            </Link>

            {/* Mode switch */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Mode</p>
              <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {['standard', 'advanced'].map((m) => (
                  <button
                    key={m}
                    onClick={() => onModeChange(m)}
                    className="flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                    style={{
                      background: navMode === m
                        ? (m === 'advanced' ? 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(255,51,102,0.15))' : 'rgba(255,255,255,0.1)')
                        : 'transparent',
                      color: navMode === m ? (m === 'advanced' ? '#00D4FF' : '#fff') : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {m === 'advanced' && <Zap className="w-3 h-3" />}
                    {m === 'advanced' ? 'Creator' : 'Standard'}
                  </button>
                ))}
              </div>
            </div>

            {/* Nav links */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Navigate</p>
              <div className="space-y-1">
                {currentNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = isLinkActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all"
                      style={{
                        background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                        color: isActive ? '#00D4FF' : 'rgba(255,255,255,0.55)',
                        border: `1px solid ${isActive ? 'rgba(0,212,255,0.18)' : 'transparent'}`,
                      }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold text-sm">{item.name}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#00D4FF' }} />}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Shopping */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Shopping</p>
              <div className="space-y-1">
                <Link
                  to={createPageUrl('Cart')}
                  onClick={onClose}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="font-semibold text-sm">Cart</span>
                  </div>
                  {cartCount > 0
                    ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#FF3366', color: '#fff' }}>{cartCount}</span>
                    : <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Empty</span>
                  }
                </Link>
                <Link
                  to={createPageUrl('Shop')}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="font-semibold text-sm">Shop All</span>
                </Link>
              </div>
            </div>

            {/* Discover Section */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Explore</p>
              <div className="space-y-1">
                {[
                  { label: 'Enter World', href: '/World', icon: Globe },
                  { label: 'Discover', href: '/Discover', icon: Compass },
                  { label: 'Drops', href: '/Drops', icon: Package },
                  { label: 'Notifications', href: '/Notifications', icon: Bell },
                ].map(({ label, href, icon: Icon }) => (
                  <Link key={label} to={href} onClick={onClose}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}>
                    <Icon className="w-4 h-4" />
                    <span className="font-semibold text-sm">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Account */}
            {currentUser && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Account</p>
                <div className="space-y-1">
                  {[
                    { label: 'My Account', href: createPageUrl('MyAccount'), icon: User },
                    { label: 'My Orders', href: createPageUrl('MyOrders'), icon: ShoppingBag },
                    { label: 'My Portfolio', href: '/Portfolio', icon: Layers },
                    { label: 'Saved Looks', href: '/SavedLooks', icon: Bookmark },
                    { label: 'My Closet', href: '/Closet', icon: Archive },
                    { label: 'Feed', href: '/Feed', icon: Rss },
                    { label: 'Membership', href: '/Membership', icon: Crown },
                  ].map(({ label, href, icon: Icon }) => (
                    <Link key={label} to={href} onClick={onClose}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}>
                      <Icon className="w-4 h-4" />
                      <span className="font-semibold text-sm">{label}</span>
                    </Link>
                  ))}
                  <button
                    onClick={() => base44.auth.logout()}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all"
                    style={{ background: 'rgba(255,51,102,0.05)', border: '1px solid rgba(255,51,102,0.15)', color: '#FF3366' }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-semibold text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Bottom brand mark */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <BrandDots />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              SKRTLIFE Digital Society
            </span>
          </div>
        </div>
      </motion.div>
    </>
  );
}