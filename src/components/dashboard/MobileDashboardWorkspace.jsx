import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronRight, X, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { PANEL_TYPES } from './panelRegistry';
import DynamicPanel from './DynamicPanel';

// Mobile-first panel switcher — personal control center feel
export default function MobileDashboardWorkspace({ user, activePanels, onTogglePanel, onPostCreated, onReset }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const panels = activePanels.map(id => PANEL_TYPES[id]).filter(Boolean);
  const safeIndex = Math.min(activeIndex, Math.max(0, panels.length - 1));
  const activePanel = panels[safeIndex];

  const initial = user?.full_name?.charAt(0)?.toUpperCase() || 'S';
  const displayName = user?.full_name?.split(' ')[0] || 'Member';

  // Empty state
  if (panels.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
        style={{ background: '#0A0A0F' }}>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center font-black text-2xl text-white"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {initial}
        </div>
        <p className="text-[9px] uppercase tracking-[0.35em] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Skrtlife Personal OS</p>
        <h2 className="text-xl font-bold text-white mb-2">Your workspace is empty</h2>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>Add panels to get started</p>
        {onReset && (
          <button onClick={onReset}
            className="flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider"
            style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)' }}>
            <RotateCcw className="w-3.5 h-3.5" /> Choose a Layout
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0F' }}>

      {/* Mobile Identity Header */}
      <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.6), rgba(0,212,255,0.4))' }}>
            {initial}
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">{displayName}</p>
            <p className="text-[9px] uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.25)' }}>Personal OS</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={createPageUrl('DripSync')}>
            <button className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider"
              style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.4)' }}>
              DripSync
            </button>
          </Link>
        </div>
      </div>

      {/* Active Panel Label */}
      {activePanel && (
        <div className="flex-shrink-0 px-4 pt-3 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <activePanel.icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-white">{activePanel.title}</p>
              {activePanel.subtitle && (
                <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{activePanel.subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[9px] tabular-nums" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {safeIndex + 1} / {panels.length}
            </p>
            <button onClick={() => onTogglePanel(activePanel.id)}
              className="w-6 h-6 flex items-center justify-center"
              style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'rgba(255,255,255,0.3)' }}>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Panel Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePanel?.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
          className="flex-1 overflow-y-auto"
          style={{ background: 'rgba(255,255,255,0.005)', paddingBottom: '80px' }}
        >
          {activePanel && (
            <DynamicPanel
              panelId={activePanel.id}
              user={user}
              onPostCreated={onPostCreated}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Tab Bar — thumb-friendly */}
      <div
        className="fixed bottom-0 left-0 right-0 flex-shrink-0"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(8,8,12,0.97)',
          backdropFilter: 'blur(28px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Section label */}
        <div className="px-4 pt-2 pb-1">
          <p className="text-[8px] uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Your Panels
          </p>
        </div>
        <div className="flex gap-1.5 px-3 pb-3 overflow-x-auto scrollbar-hide">
          {panels.map((panel, idx) => {
            const isActive = idx === safeIndex;
            return (
              <motion.button
                key={panel.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => setActiveIndex(idx)}
                className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0 transition-all"
                style={{
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: isActive ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)',
                  background: isActive ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.02)',
                  minHeight: '44px',
                }}
              >
                <panel.icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.35)' }}
                />
                <span className="text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)' }}>
                  {panel.title}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.6)' }} />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}