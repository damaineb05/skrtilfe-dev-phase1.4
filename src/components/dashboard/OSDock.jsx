import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Search, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PANEL_TYPES } from './panelRegistry';

function DockItem({ icon: Icon, label, onClick, isActive, isMinimized }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6, scale: 1.18 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      onClick={onClick}
      className="relative flex flex-col items-center"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.92 }}
            transition={{ duration: 0.13 }}
            className="absolute bottom-full mb-3 pointer-events-none z-50"
          >
            <div
              className="px-2.5 py-1.5 text-[11px] font-semibold text-white whitespace-nowrap"
              style={{
                background: 'rgba(18,18,28,0.96)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {label}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
              style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid rgba(18,18,28,0.96)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="w-11 h-11 flex items-center justify-center relative transition-all duration-150"
        style={{
          borderRadius: '13px',
          background: isActive
            ? 'linear-gradient(145deg, rgba(59,130,246,0.5) 0%, rgba(37,99,235,0.35) 100%)'
            : isMinimized
            ? 'linear-gradient(145deg, rgba(234,179,8,0.3) 0%, rgba(202,138,4,0.2) 100%)'
            : 'linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)',
          border: isActive
            ? '1px solid rgba(96,165,250,0.4)'
            : isMinimized
            ? '1px solid rgba(234,179,8,0.3)'
            : '1px solid rgba(255,255,255,0.08)',
          boxShadow: isActive
            ? '0 0 12px rgba(59,130,246,0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
            : 'inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        <Icon
          className="w-[18px] h-[18px] transition-colors"
          style={{
            color: isActive ? 'rgba(147,197,253,1)' : isMinimized ? 'rgba(253,224,71,0.9)' : 'rgba(255,255,255,0.65)',
            strokeWidth: 1.6,
          }}
        />
      </div>

      {(isActive || isMinimized) && (
        <motion.div
          layoutId={isActive ? `dot-active-${label}` : undefined}
          className="absolute -bottom-2 w-1 h-1 rounded-full"
          style={{ background: isActive ? 'rgba(147,197,253,0.9)' : 'rgba(253,224,71,0.8)' }}
        />
      )}
    </motion.button>
  );
}

export default function OSDock({ onOpenCommand, activePanels, minimizedPanels, onTogglePanel, onRestorePanel }) {
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.2 }}
        className="flex flex-col items-center"
      >
        <div
          className="flex items-center gap-1.5 px-3 py-2.5 max-w-[95vw] overflow-x-auto scrollbar-hide"
          style={{
            borderRadius: '20px',
            background: 'rgba(14,14,22,0.78)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset, 0 -1px 0 rgba(0,0,0,0.4) inset',
          }}
        >
          <DockItem icon={Command} label="Command (⌘K)" onClick={onOpenCommand} />
          <DockItem icon={Search} label="Search" onClick={onOpenCommand} />
          <div className="w-px self-stretch mx-0.5" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {Object.values(PANEL_TYPES).map(panel => (
            <DockItem
              key={panel.id}
              icon={panel.icon}
              label={panel.title}
              isActive={activePanels.includes(panel.id)}
              isMinimized={minimizedPanels.includes(panel.id)}
              onClick={() => {
                if (minimizedPanels.includes(panel.id)) {
                  onRestorePanel(panel.id);
                } else {
                  onTogglePanel(panel.id);
                }
              }}
            />
          ))}
          <div className="w-px self-stretch mx-0.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <DockItem icon={Globe} label="Enter World" onClick={() => navigate('/World')} />
        </div>
        <div className="mt-1.5 w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
      </motion.div>
    </div>
  );
}