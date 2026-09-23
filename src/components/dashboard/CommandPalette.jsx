import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Sparkles, Users, ShoppingBag, Wallet, BarChart3 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { PANEL_TYPES } from './panelRegistry';

const NAV_ACTIONS = [
  { id: 'studio', label: 'Create NFT', href: 'Studio', icon: Sparkles, type: 'navigate' },
  { id: 'dripsync', label: 'Open DripSync', href: 'DripSync', icon: Users, type: 'navigate' },
  { id: 'shop', label: 'Browse Shop', href: 'Shop', icon: ShoppingBag, type: 'navigate' },
  { id: 'portfolio', label: 'View Portfolio', href: 'Portfolio', icon: Wallet, type: 'navigate' },
  { id: 'analytics', label: 'Analytics', href: 'Analytics', icon: BarChart3, type: 'navigate' },
  { id: 'community', label: 'Community', href: 'Community', icon: Users, type: 'navigate' },
];

export default function CommandPalette({ isOpen, onClose, onNavigate, onOpenPanel }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const allActions = [
    ...NAV_ACTIONS,
    ...Object.values(PANEL_TYPES).map(panel => ({
      id: `panel-${panel.id}`,
      label: `Open ${panel.title} Panel`,
      icon: panel.icon,
      type: 'panel',
      panelId: panel.id,
    })),
  ];

  const filteredActions = allActions.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
    setQuery('');
    setSelectedIndex(0);
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredActions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredActions[selectedIndex]) {
      e.preventDefault();
      const action = filteredActions[selectedIndex];
      if (action.type === 'navigate') onNavigate(action.href);
      else if (action.type === 'panel') onOpenPanel(action.panelId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-32"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'rgba(12,12,18,0.98)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Search className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search actions, panels, navigate…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          />
          <button onClick={onClose}>
            <X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {filteredActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  if (action.type === 'navigate') onNavigate(action.href);
                  else if (action.type === 'panel') onOpenPanel(action.panelId);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-4 py-3 transition-all"
                style={{
                  background: index === selectedIndex ? 'rgba(255,255,255,0.06)' : 'transparent',
                  borderLeft: index === selectedIndex ? '2px solid rgba(255,255,255,0.4)' : '2px solid transparent',
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                  <span className="text-sm text-white">{action.label}</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest px-2 py-0.5"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>
                  {action.type === 'panel' ? 'Panel' : 'Page'}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}