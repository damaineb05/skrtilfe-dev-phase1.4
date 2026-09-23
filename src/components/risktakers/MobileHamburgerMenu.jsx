import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { X, Home, ShoppingBag, Sparkles, Info, User, LogIn } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const MENU_LINKS = [
  { label: 'Home', href: createPageUrl('Home'), icon: Home },
  { label: 'Shop', href: createPageUrl('Shop'), icon: ShoppingBag },
  { label: 'DripSync', href: createPageUrl('DripSync'), icon: Sparkles },
  { label: 'About', href: createPageUrl('About'), icon: Info },
  { label: 'Profile', href: createPageUrl('MyAccount'), icon: User },
];

export default function MobileHamburgerMenu({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9800]"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)' }}
            onClick={onClose}
          />

          {/* Panel — right slide */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed top-0 right-0 bottom-0 z-[9801] w-4/5 max-w-xs flex flex-col"
            style={{
              background: 'rgba(8,8,14,0.97)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(40px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                {['#B8960C', '#B8960C', '#B8960C'].map((c, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: c, opacity: 1 - i * 0.25 }} />
                ))}
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
              {MENU_LINKS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold text-base tracking-tight">{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Bottom actions */}
            <div className="px-6 pb-10 pt-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                className="w-full py-3.5 rounded-2xl text-sm font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-2"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <p className="text-center text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.15)' }}>
                SKRTLIFE Digital Society
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}