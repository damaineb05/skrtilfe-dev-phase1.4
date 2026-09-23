import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AvatarIdentityHUD from './AvatarIdentityHUD';
import AvatarActionDock from './AvatarActionDock';

/**
 * AvatarOSShell
 * ─────────────────────────────────────────────────────────────
 * Full-screen avatar-first OS wrapper.
 *
 * Modes:
 *  focus — full avatar, small panel overlay
 *  split — 50/50 avatar + panel
 *  app   — large panel, mini avatar docked
 *
 * Children[0] = 3D Viewport
 * Children[1] = Panel/App content
 */
export default function AvatarOSShell({
  user,
  viewportSlot,       // the 3D viewport React element
  panelSlot,          // the right-side panel content
  activePanel,
  onDockSelect,
  initialMode = 'split',
  xp = 0,
  level = 1,
  currency = 0,
  notifications = 0,
}) {
  const [viewMode, setViewMode] = useState(initialMode);
  const [dockItem, setDockItem] = useState(activePanel || 'closet');
  const [showPanel, setShowPanel] = useState(true);

  const handleDockSelect = useCallback((id) => {
    if (id === dockItem && showPanel) {
      setShowPanel(false);
    } else {
      setDockItem(id);
      setShowPanel(true);
      if (onDockSelect) onDockSelect(id);
    }
  }, [dockItem, showPanel, onDockSelect]);

  const panelVisible = showPanel && panelSlot;

  // Layout fractions based on mode
  const viewportW = {
    focus: panelVisible ? '65%' : '100%',
    split: panelVisible ? '50%' : '100%',
    app:   panelVisible ? '30%'  : '100%',
  }[viewMode] ?? '60%';

  const panelW = {
    focus: '35%',
    split: '50%',
    app:   '70%',
  }[viewMode] ?? '40%';

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: '#05050C', fontFamily: 'var(--font-body)' }}
    >
      {/* ── Ambient glow backgrounds ─────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(60px)' }} />
        {/* Vignette */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
      </div>

      {/* ── Main layout ───────────────────────────────────────────── */}
      <div className="relative z-10 flex h-full w-full">
        {/* Viewport pane */}
        <motion.div
          className="relative h-full flex-shrink-0"
          animate={{ width: viewportW }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: 'hidden' }}
        >
          {/* Platform glow beneath avatar */}
          <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to top, rgba(168,85,247,0.06), transparent)' }} />
          
          {viewportSlot}

          {/* App mode: mini avatar label */}
          {viewMode === 'app' && panelVisible && (
            <div className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none z-20">
              <div className="px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                Avatar Preview
              </div>
            </div>
          )}
        </motion.div>

        {/* Panel pane */}
        <AnimatePresence>
          {panelVisible && (
            <motion.div
              key="panel"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full overflow-hidden flex-shrink-0"
              style={{
                width: panelW,
                background: 'rgba(7,7,14,0.92)',
                backdropFilter: 'blur(32px) saturate(200%)',
                borderLeft: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '-20px 0 80px rgba(0,0,0,0.4)',
              }}
            >
              {/* Panel top accent */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5), rgba(6,182,212,0.5), transparent)' }} />

              <div className="h-full overflow-y-auto scrollbar-none">
                {panelSlot}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── HUD Layer (always on top) ──────────────────────────────── */}
      <AvatarIdentityHUD
        user={user}
        xp={xp}
        level={level}
        currency={currency}
        notifications={notifications}
        status="online"
      />

      {/* ── Action Dock ───────────────────────────────────────────── */}
      <AvatarActionDock
        activeItem={showPanel ? dockItem : null}
        onSelect={handleDockSelect}
        viewMode={viewMode}
        onViewMode={setViewMode}
      />

      {/* ── Top-right OS controls ──────────────────────────────────── */}
      <div className="absolute top-5 right-5 z-40 flex items-center gap-2">
        {/* Panel toggle hint */}
        {!panelVisible && dockItem && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setShowPanel(true)}
            className="px-3 py-1.5 text-[9px] font-black tracking-widest uppercase rounded-full transition-all hover:opacity-80"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc', backdropFilter: 'blur(12px)' }}
          >
            Open Panel
          </motion.button>
        )}
      </div>
    </div>
  );
}