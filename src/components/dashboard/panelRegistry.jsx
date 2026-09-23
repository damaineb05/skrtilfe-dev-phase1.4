import {
  Activity, User, Radio, Plus, Briefcase, Zap, Sparkles,
  Users, Bell, BarChart3, ShoppingBag, Wallet, Tv,
} from 'lucide-react';

/**
 * Single source of truth for all dashboard panel definitions.
 *
 * Naming clarity:
 *  - "assets"    = Your NFTs + digital assets (merged from old nfts + portfolio)
 *  - "wallet"    = On-chain wallet / balance
 *  - "studio"    = Creator Studio (mint NFTs, upload 3D)
 *  - "streaming" = Streaming platform launcher (lazy-loaded)
 */
export const PANEL_TYPES = {
  state:         { id: 'state',         title: 'Daily State',        subtitle: 'How are you showing up today?',      icon: Activity,    defaultSize: { w: 420, h: 650 }, canMaximize: true,  canMinimize: true },
  dripsync:      { id: 'dripsync',      title: 'DripSync',           subtitle: 'Your current identity space',        icon: User,        defaultSize: { w: 600, h: 700 }, canMaximize: true,  canMinimize: true },
  feed:          { id: 'feed',          title: 'Social Hub',         subtitle: 'Your network, your voice',           icon: Radio,       defaultSize: { w: 480, h: 700 }, canMaximize: true,  canMinimize: true },
  studio:        { id: 'studio',        title: 'Creator Studio',     subtitle: 'Create from your world',             icon: Plus,        defaultSize: { w: 500, h: 600 }, canMaximize: true,  canMinimize: true },
  assets:        { id: 'assets',        title: 'My Assets',          subtitle: 'Your saved digital inventory',       icon: Briefcase,   defaultSize: { w: 520, h: 620 }, canMaximize: true,  canMinimize: true },
  drops:         { id: 'drops',         title: 'Featured Drops',     subtitle: 'Latest from the collection',         icon: Zap,         defaultSize: { w: 420, h: 580 }, canMaximize: true,  canMinimize: true },
  curated:       { id: 'curated',       title: 'Curated for You',    subtitle: 'Handpicked, just for you',           icon: Sparkles,    defaultSize: { w: 450, h: 600 }, canMaximize: true,  canMinimize: true },
  matches:       { id: 'matches',       title: 'Member Matches',     subtitle: 'People in your frequency',           icon: Users,       defaultSize: { w: 450, h: 550 }, canMaximize: true,  canMinimize: true },
  notifications: { id: 'notifications', title: 'Notifications',      subtitle: 'Stay in the loop',                   icon: Bell,        defaultSize: { w: 420, h: 650 }, canMaximize: true,  canMinimize: true },
  analytics:     { id: 'analytics',     title: 'Analytics',          subtitle: 'Your numbers at a glance',           icon: BarChart3,   defaultSize: { w: 350, h: 400 }, canMaximize: false, canMinimize: true },
  activity:      { id: 'activity',      title: 'Live Activity',      subtitle: 'What\'s happening right now',        icon: Activity,    defaultSize: { w: 350, h: 450 }, canMaximize: false, canMinimize: true },
  shop:          { id: 'shop',          title: 'Shop',               subtitle: 'The full collection',                icon: ShoppingBag, defaultSize: { w: 500, h: 600 }, canMaximize: true,  canMinimize: true },
  wallet:        { id: 'wallet',        title: 'Wallet',             subtitle: 'Your on-chain balance',              icon: Wallet,      defaultSize: { w: 450, h: 550 }, canMaximize: true,  canMinimize: true },
  streaming:     { id: 'streaming',     title: 'Streaming',          subtitle: 'Go live, connect platforms',         icon: Tv,          defaultSize: { w: 550, h: 650 }, canMaximize: true,  canMinimize: true },
};

// Panels removed in C.3:
//   nfts      → merged into "assets"
//   portfolio → merged into "assets"
//
// Migration: any saved workspace with 'nfts' or 'portfolio' panel IDs
// will be remapped to 'assets' by migrateWorkspace() in Dashboard.

export function migrateWorkspace(saved) {
  if (!saved) return saved;
  const remap = { nfts: 'assets', portfolio: 'assets' };

  const panels = (saved.panels || []).map(id => remap[id] || id);
  // Deduplicate after remap
  const seen = new Set();
  const deduped = panels.filter(id => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const positions = {};
  Object.entries(saved.positions || {}).forEach(([id, pos]) => {
    positions[remap[id] || id] = pos;
  });

  return {
    ...saved,
    panels: deduped,
    positions,
    pinned: (saved.pinned || []).map(id => remap[id] || id),
    minimized: (saved.minimized || []).map(id => remap[id] || id),
    maximized: (saved.maximized || []).map(id => remap[id] || id),
    focusOrder: (saved.focusOrder || []).map(id => remap[id] || id),
    sizes: Object.fromEntries(
      Object.entries(saved.sizes || {}).map(([id, s]) => [remap[id] || id, s])
    ),
  };
}