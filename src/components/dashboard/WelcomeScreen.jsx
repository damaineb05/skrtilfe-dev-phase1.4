import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShoppingBag, Users, ChevronRight, Sparkles, Check } from 'lucide-react';

const STARTER_LAYOUTS = [
  {
    id: 'creator',
    label: 'Creator Mode',
    description: 'Build your digital identity — avatar, studio, assets',
    icon: Sparkles,
    accent: '#A855F7',
    panels: ['dripsync', 'studio', 'assets'],
    panelLabels: ['DripSync', 'Creator Studio', 'My Assets'],
  },
  {
    id: 'market',
    label: 'Market Mode',
    description: 'Browse drops, manage your wallet, shop the collection',
    icon: ShoppingBag,
    accent: '#F59E0B',
    panels: ['shop', 'drops', 'wallet'],
    panelLabels: ['Shop', 'Featured Drops', 'Wallet'],
  },
  {
    id: 'community',
    label: 'Community Mode',
    description: 'Stay connected — social feed, live activity, member matches',
    icon: Users,
    accent: '#00D4FF',
    panels: ['feed', 'activity', 'matches'],
    panelLabels: ['Social Hub', 'Live Activity', 'Member Matches'],
  },
];

export default function WelcomeScreen({ user, onApplyLayout }) {
  const [selected, setSelected] = useState(null);
  const [applied, setApplied] = useState(false);

  const handleApply = (layout) => {
    setSelected(layout.id);
    setTimeout(() => {
      setApplied(true);
      setTimeout(() => onApplyLayout(layout.panels), 600);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6"
      style={{ background: 'rgba(7,7,9,0.97)', backdropFilter: 'blur(40px)' }}>

      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[200px]"
          style={{ background: 'rgba(168,85,247,0.04)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[200px]"
          style={{ background: 'rgba(0,212,255,0.04)' }} />
      </div>

      <AnimatePresence mode="wait">
        {!applied ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
            className="relative w-full max-w-2xl"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center font-black text-xl text-white"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {user?.full_name?.charAt(0) || 'S'}
              </div>
              <p className="text-[10px] uppercase tracking-[0.4em] mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Skrtlife Personal OS
              </p>
              <h1 className="text-3xl font-black text-white tracking-tight mb-3">
                Welcome{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}.
              </h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Choose a starting layout. You can customize everything after.
              </p>
            </div>

            {/* Layout cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {STARTER_LAYOUTS.map((layout, i) => {
                const Icon = layout.icon;
                const isSelected = selected === layout.id;
                return (
                  <motion.button
                    key={layout.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    onClick={() => handleApply(layout)}
                    className="relative text-left p-5 transition-all group"
                    style={{
                      borderRadius: '16px',
                      background: isSelected
                        ? `${layout.accent}14`
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? layout.accent + '40' : 'rgba(255,255,255,0.08)'}`,
                      boxShadow: isSelected ? `0 0 32px ${layout.accent}18` : 'none',
                    }}
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center"
                      style={{ background: `${layout.accent}18`, border: `1px solid ${layout.accent}30` }}>
                      <Icon className="w-5 h-5" style={{ color: layout.accent }} />
                    </div>

                    <p className="text-sm font-bold text-white mb-1">{layout.label}</p>
                    <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {layout.description}
                    </p>

                    {/* Panel chips */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {layout.panelLabels.map(l => (
                        <span key={l} className="text-[9px] font-bold uppercase tracking-wider px-2 py-1"
                          style={{
                            borderRadius: '5px',
                            background: `${layout.accent}12`,
                            border: `1px solid ${layout.accent}25`,
                            color: layout.accent,
                          }}>
                          {l}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: isSelected ? layout.accent : 'rgba(255,255,255,0.3)' }}>
                      {isSelected
                        ? <><Check className="w-3.5 h-3.5" /> Applied</>
                        : <><ChevronRight className="w-3.5 h-3.5" /> Apply Layout</>}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <p className="text-center text-[10px] mt-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Your workspace is saved automatically. Reset anytime from the dashboard menu.
            </p>

            <div className="text-center mt-4">
              <button
                onClick={() => onApplyLayout(['feed', 'dripsync', 'analytics'])}
                className="text-[10px] underline underline-offset-2 transition-opacity hover:opacity-70"
                style={{ color: 'rgba(255,255,255,0.2)' }}
              >
                Skip — use default layout
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="applied"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Check className="w-7 h-7 text-white" />
            </div>
            <p className="text-white font-bold text-lg">Layout applied.</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading your workspace…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}