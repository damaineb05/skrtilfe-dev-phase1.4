import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield, User as UserIcon, Crown, Command, RotateCcw, ChevronDown, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WalletConnectButton from '../web3/WalletConnectButton';

export default function IdentityHeader({ user, onOpenCommand, onResetWorkspace }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = user?.full_name?.charAt(0)?.toUpperCase() || 'S';
  const displayName = user?.full_name || 'Member';
  const handle = user?.email?.split('@')[0] || '';

  return (
    <div className="relative z-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(32px)' }}>
      <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between">

        {/* Left — identity chip */}
        <div className="flex items-center gap-3">
          {/* Avatar chip + dropdown */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="flex items-center gap-2.5 px-3 py-2 transition-all hover:bg-white/5 group"
              style={{ borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Avatar circle */}
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.6), rgba(0,212,255,0.4))' }}>
                {initial}
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-bold text-white">{displayName}</p>
                {handle && <p className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>@{handle}</p>}
              </div>
              <ChevronDown className="w-3 h-3 transition-transform group-data-open:rotate-180"
                style={{ color: 'rgba(255,255,255,0.3)', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.14 }}
                  className="absolute top-full left-0 mt-2 w-52 py-1.5 z-50"
                  style={{
                    background: 'rgba(12,12,18,0.99)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '12px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
                  }}
                >
                  <div className="px-3 pb-2 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-[9px] uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      Skrtlife Personal OS
                    </p>
                  </div>

                  {[
                    { label: 'Open Profile', icon: UserIcon, href: 'MyAccount' },
                    { label: 'Open DripSync', icon: Zap, href: 'DripSync' },
                    { label: 'Genesis', icon: Crown, href: 'Genesis' },
                    ...(user?.role === 'admin' ? [{ label: 'Admin Panel', icon: Shield, href: 'AdminDashboard' }] : []),
                  ].map(item => (
                    <Link key={item.label} to={createPageUrl(item.href)} onClick={() => setMenuOpen(false)}>
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-all hover:bg-white/5 text-left"
                        style={{ color: 'rgba(255,255,255,0.7)' }}>
                        <item.icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
                        {item.label}
                      </button>
                    </Link>
                  ))}

                  <div className="mx-3 my-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

                  <button
                    onClick={() => { setMenuOpen(false); onResetWorkspace(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-all hover:bg-red-500/10 text-left"
                    style={{ color: 'rgba(239,68,68,0.7)' }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Workspace
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* OS label */}
          <div className="hidden md:block h-5 w-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <p className="hidden md:block text-[9px] uppercase tracking-[0.35em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Personal OS
          </p>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2">
          <WalletConnectButton />
          <button
            onClick={onOpenCommand}
            className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: '8px' }}
          >
            <Command className="w-3 h-3" /> ⌘K
          </button>
        </div>
      </div>
    </div>
  );
}