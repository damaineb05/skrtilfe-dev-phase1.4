import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

import ProtectedRoute from '../components/auth/ProtectedRoute';
import StoriesReels from '../components/dashboard/StoriesReels';

import { PANEL_TYPES, migrateWorkspace } from '../components/dashboard/panelRegistry';
import FloatingPanel from '../components/dashboard/FloatingPanel';
import OSDock from '../components/dashboard/OSDock';
import CommandPalette from '../components/dashboard/CommandPalette';
import DynamicPanel from '../components/dashboard/DynamicPanel';
import MobileDashboardWorkspace from '../components/dashboard/MobileDashboardWorkspace';
import IdentityHeader from '../components/dashboard/IdentityHeader';
import WelcomeScreen from '../components/dashboard/WelcomeScreen';
import ResetWorkspaceModal from '../components/dashboard/ResetWorkspaceModal';

// ─── Persistence ──────────────────────────────────────────────────────────────
const GRID_SIZE = 32;
const SAVE_DEBOUNCE_MS = 200;
const DEFAULT_PANELS = ['feed', 'dripsync', 'analytics'];

function storageKey(userId) { return `ds_workspace_v2_${userId}`; }

function loadWorkspace(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Validate structure to prevent corrupted layouts from breaking dashboard
    if (!parsed || typeof parsed !== 'object') return null;
    return migrateWorkspace(parsed);
  } catch (e) { 
    console.warn('Failed to load workspace:', e);
    return null; 
  }
}

function persistWorkspace(userId, state) {
  if (!userId) return;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(state));
  } catch {}
}

function getDefaultPosition(index) {
  const cols = Math.max(1, Math.floor((window.innerWidth - 200) / 440));
  return {
    x: (index % cols) * 440 + 80,
    y: Math.floor(index / cols) * 500 + 130,
  };
}

// Prevent duplicate IDs in the panels array while preserving order
function dedup(arr) {
  const seen = new Set();
  return arr.filter(id => { if (seen.has(id)) return false; seen.add(id); return true; });
}

// ─── Dashboard Content ────────────────────────────────────────────────────────
function DashboardContent() {
  const { user: contextUser, isLoadingAuth } = useAuth();
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // ── Full workspace state ──────────────────────────────────────
  const [activePanels,    setActivePanels]    = useState(DEFAULT_PANELS);
  const [minimizedPanels, setMinimizedPanels] = useState([]);
  const [maximizedPanels, setMaximizedPanels] = useState([]);
  const [pinnedPanels,    setPinnedPanels]    = useState([]);
  const [panelPositions,  setPanelPositions]  = useState({});
  const [panelSizes,      setPanelSizes]      = useState({});
  const [focusOrder,      setFocusOrder]      = useState([]); // z-order stack
  const [focusedPanel,    setFocusedPanel]    = useState(null);
  const [isAnyPanelInteracting, setIsAnyPanelInteracting] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [timelineKey, setTimelineKey] = useState(Date.now());

  // Stable refs used in debounced saves — always mirrors latest state
  const workspaceRef = useRef({});
  const saveTimer    = useRef(null);
  const userIdRef    = useRef(null);

  const scheduleSave = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persistWorkspace(userIdRef.current, workspaceRef.current);
    }, SAVE_DEBOUNCE_MS);
  }, []);

  // Keep workspaceRef in sync with all state
  useEffect(() => {
    workspaceRef.current = {
      panels:    activePanels,
      positions: panelPositions,
      sizes:     panelSizes,
      pinned:    pinnedPanels,
      minimized: minimizedPanels,
      maximized: maximizedPanels,
      focusOrder,
    };
  }, [activePanels, panelPositions, panelSizes, pinnedPanels, minimizedPanels, maximizedPanels, focusOrder]);

  // ── Bootstrap ─────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Bootstrap workspace from persisted storage once AuthContext resolves
  useEffect(() => {
    if (isLoadingAuth) return; // wait for auth to finish
    if (contextUser) {
      setUser(contextUser);
      userIdRef.current = contextUser.id;
      const saved = loadWorkspace(contextUser.id);
      // Validate loaded panels exist in PANEL_TYPES registry
      const validPanels = (saved?.panels || []).filter(id => PANEL_TYPES[id]);
      if (saved && validPanels.length) {
        setActivePanels(dedup(validPanels));
        setPanelPositions(saved.positions || {});
        setPanelSizes(saved.sizes || {});
        setPinnedPanels((saved.pinned || []).filter(id => PANEL_TYPES[id]));
        setMinimizedPanels((saved.minimized || []).filter(id => PANEL_TYPES[id]));
        setMaximizedPanels((saved.maximized || []).filter(id => PANEL_TYPES[id]));
        const validFocusOrder = (saved.focusOrder || []).filter(id => PANEL_TYPES[id]);
        setFocusOrder(validFocusOrder);
        if (validFocusOrder?.length) setFocusedPanel(validFocusOrder[validFocusOrder.length - 1]);
      } else {
        setShowWelcome(true);
      }
    }
    setLoading(false);
  }, [isLoadingAuth, contextUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard shortcuts ─────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowCommandPalette(true); }
      if (e.key === 'Escape') setShowCommandPalette(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Focus / z-order ────────────────────────────────────────────
  const focusPanel = useCallback((panelId) => {
    setFocusedPanel(panelId);
    setFocusOrder(prev => {
      const next = [...prev.filter(id => id !== panelId), panelId];
      workspaceRef.current = { ...workspaceRef.current, focusOrder: next };
      scheduleSave();
      return next;
    });
  }, [scheduleSave]);

  // ── Panel open/close ───────────────────────────────────────────
  const togglePanel = useCallback((panelId) => {
    setActivePanels(prev => {
      const isOpen = prev.includes(panelId);
      const next = isOpen ? prev.filter(id => id !== panelId) : dedup([...prev, panelId]);
      workspaceRef.current = { ...workspaceRef.current, panels: next };
      scheduleSave();
      return next;
    });
    if (!activePanels.includes(panelId)) {
      // Opening: remove from minimized
      setMinimizedPanels(prev => prev.filter(id => id !== panelId));
    }
  }, [activePanels, scheduleSave]);

  const duplicatePanel = useCallback((panelId) => {
    setActivePanels(prev => {
      const next = [...prev, panelId];
      workspaceRef.current = { ...workspaceRef.current, panels: next };
      scheduleSave();
      return next;
    });
    setPanelPositions(prev => {
      const next = { ...prev, [`${panelId}_dup_${Date.now()}`]: getDefaultPosition(activePanels.length) };
      workspaceRef.current = { ...workspaceRef.current, positions: next };
      return next;
    });
  }, [activePanels, scheduleSave]);

  // ── Position — saved on drag end via FloatingPanel's onUpdateSize ─
  // Position updates during drag are NOT debounced; we rely on FloatingPanel
  // to call onUpdatePosition only on mouseup via the new stable-ref approach.
  const updatePanelPosition = useCallback((panelId, position) => {
    setPanelPositions(prev => {
      const next = { ...prev, [panelId]: position };
      workspaceRef.current = { ...workspaceRef.current, positions: next };
      scheduleSave();
      return next;
    });
  }, [scheduleSave]);

  // ── Size — saved on resize end ─────────────────────────────────
  const updatePanelSize = useCallback((panelId, size) => {
    setPanelSizes(prev => {
      const next = { ...prev, [panelId]: size };
      workspaceRef.current = { ...workspaceRef.current, sizes: next };
      scheduleSave();
      return next;
    });
  }, [scheduleSave]);

  // ── Pin ────────────────────────────────────────────────────────
  const togglePin = useCallback((panelId) => {
    setPinnedPanels(prev => {
      const next = prev.includes(panelId) ? prev.filter(id => id !== panelId) : [...prev, panelId];
      workspaceRef.current = { ...workspaceRef.current, pinned: next };
      scheduleSave();
      return next;
    });
  }, [scheduleSave]);

  // ── Maximize ───────────────────────────────────────────────────
  const toggleMaximize = useCallback((panelId) => {
    setMaximizedPanels(prev => {
      const next = prev.includes(panelId) ? prev.filter(id => id !== panelId) : [...prev, panelId];
      workspaceRef.current = { ...workspaceRef.current, maximized: next };
      scheduleSave();
      return next;
    });
  }, [scheduleSave]);

  // ── Minimize ───────────────────────────────────────────────────
  const toggleMinimize = useCallback((panelId) => {
    setMinimizedPanels(prev => {
      const next = prev.includes(panelId) ? prev.filter(id => id !== panelId) : [...prev, panelId];
      workspaceRef.current = { ...workspaceRef.current, minimized: next };
      scheduleSave();
      return next;
    });
  }, [scheduleSave]);

  // ── Welcome / Reset ───────────────────────────────────────────
  const applyStarterLayout = useCallback((panels) => {
    const deduped = dedup(panels);
    setActivePanels(deduped);
    setMinimizedPanels([]);
    setMaximizedPanels([]);
    setPinnedPanels([]);
    setPanelPositions({});
    setPanelSizes({});
    setFocusOrder([]);
    setShowWelcome(false);
    workspaceRef.current = { panels: deduped, positions: {}, sizes: {}, pinned: [], minimized: [], maximized: [], focusOrder: [] };
    persistWorkspace(userIdRef.current, workspaceRef.current);
  }, []);

  const handleResetWorkspace = useCallback(() => setShowResetModal(true), []);

  const confirmReset = useCallback(() => {
    if (userIdRef.current) {
      try { localStorage.removeItem(storageKey(userIdRef.current)); } catch {}
    }
    setActivePanels(DEFAULT_PANELS);
    setMinimizedPanels([]);
    setMaximizedPanels([]);
    setPinnedPanels([]);
    setPanelPositions({});
    setPanelSizes({});
    setFocusOrder([]);
    setFocusedPanel(null);
    workspaceRef.current = {};
    setShowResetModal(false);
    setShowWelcome(true);
  }, []);

  const restorePanel = useCallback((panelId) => {
    setMinimizedPanels(prev => {
      const next = prev.filter(id => id !== panelId);
      workspaceRef.current = { ...workspaceRef.current, minimized: next };
      scheduleSave();
      return next;
    });
    focusPanel(panelId);
  }, [scheduleSave, focusPanel]);

  // ── Z-index from focus order ───────────────────────────────────
  const getZIndex = useCallback((panelId) => {
    const idx = focusOrder.indexOf(panelId);
    return idx === -1 ? 20 : 20 + idx;
  }, [focusOrder]);

  // ── Loading / auth ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.25)' }}>Restoring workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0A0A0F' }}>
        <div className="max-w-sm w-full p-8 text-center" style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-[10px] uppercase tracking-[0.3em] mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>Sign in to continue</p>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
            className="w-full py-3 text-xs font-bold uppercase tracking-[0.15em] text-black bg-white hover:bg-white/90 transition-all"
            style={{ borderRadius: '8px' }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // ── Mobile ─────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <MobileDashboardWorkspace
          user={user}
          activePanels={activePanels}
          onTogglePanel={togglePanel}
          onPostCreated={() => setTimelineKey(Date.now())}
          onReset={handleResetWorkspace}
        />
        {showWelcome && <WelcomeScreen user={user} onApplyLayout={applyStarterLayout} />}
        <ResetWorkspaceModal isOpen={showResetModal} onConfirm={confirmReset} onCancel={() => setShowResetModal(false)} />
      </>
    );
  }

  // ── Desktop OS Workspace ───────────────────────────────────────
  return (
    <div className="min-h-screen text-white overflow-hidden" style={{ background: 'var(--bg-1, #0A0A0F)' }}>
      {/* Subtle grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[160px]" style={{ background: 'rgba(255,51,102,0.03)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: 'rgba(0,212,255,0.03)' }} />
      </div>

      {/* Identity Header */}
      <IdentityHeader
        user={user}
        onOpenCommand={() => setShowCommandPalette(true)}
        onResetWorkspace={handleResetWorkspace}
      />

      {/* Stories */}
      <div className="relative z-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,10,15,0.5)' }}>
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <StoriesReels />
        </div>
      </div>

      {/* Floating Panels */}
      <div className="fixed inset-0 z-10 pointer-events-none" style={{ paddingTop: '140px' }}>
        {activePanels.map((panelId, index) => {
          const panel = PANEL_TYPES[panelId];
          if (!panel) return null;
          return (
            <FloatingPanel
              key={panelId}
              instanceKey={panelId}
              panel={panel}
              position={panelPositions[panelId] || getDefaultPosition(index)}
              size={panelSizes[panelId] || panel.defaultSize}
              isFocused={focusedPanel === panelId}
              isPinned={pinnedPanels.includes(panelId)}
              isMaximized={maximizedPanels.includes(panelId)}
              isMinimized={minimizedPanels.includes(panelId)}
              onUpdatePosition={(pos) => updatePanelPosition(panelId, pos)}
              onUpdateSize={(sz) => updatePanelSize(panelId, sz)}
              onFocus={() => focusPanel(panelId)}
              onClose={() => togglePanel(panelId)}
              onTogglePin={() => togglePin(panelId)}
              onToggleMaximize={() => toggleMaximize(panelId)}
              onToggleMinimize={() => toggleMinimize(panelId)}
              onDuplicate={() => duplicatePanel(panelId)}
              onInteractionStart={() => setIsAnyPanelInteracting(true)}
              onInteractionEnd={() => setIsAnyPanelInteracting(false)}
            >
              <DynamicPanel
                panelId={panelId}
                user={user}
                onPostCreated={() => setTimelineKey(Date.now())}
              />
            </FloatingPanel>
          );
        })}
      </div>

      {/* Drag dimmer */}
      <AnimatePresence>
        {isAnyPanelInteracting && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(1px)' }}
          />
        )}
      </AnimatePresence>

      <OSDock
        onOpenCommand={() => setShowCommandPalette(true)}
        activePanels={activePanels}
        minimizedPanels={minimizedPanels}
        onTogglePanel={togglePanel}
        onRestorePanel={restorePanel}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={(href) => { window.location.href = createPageUrl(href); }}
        onOpenPanel={(panelId) => {
          if (!activePanels.includes(panelId)) togglePanel(panelId);
          else if (minimizedPanels.includes(panelId)) restorePanel(panelId);
          else focusPanel(panelId);
        }}
      />

      {/* Welcome screen — shown for new users */}
      {showWelcome && <WelcomeScreen user={user} onApplyLayout={applyStarterLayout} />}

      {/* Reset confirmation modal */}
      <ResetWorkspaceModal isOpen={showResetModal} onConfirm={confirmReset} onCancel={() => setShowResetModal(false)} />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}