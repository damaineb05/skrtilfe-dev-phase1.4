import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function MobilePanelSheet({
  isOpen,
  onClose,
  title,
  children,
  height = '72vh',
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 500) onClose();
            }}
            className="fixed left-0 right-0 z-50 flex flex-col rounded-t-3xl overflow-hidden"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)',
              height,
              maxHeight: 'calc(86vh - 72px)',
              background: 'rgba(10,10,16,0.96)',
              backdropFilter: 'blur(32px)',
              borderTop: '1px solid rgba(212,175,55,0.2)',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 -8px 60px rgba(0,0,0,0.7), 0 -1px 0 rgba(212,175,55,0.12)',
              willChange: 'transform',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: 'rgba(212,175,55,0.3)' }}
              />
            </div>

            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h2
                className="text-sm font-bold uppercase tracking-[0.18em]"
                style={{ color: 'rgba(255,255,255,0.85)' }}
              >
                {title}
              </h2>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.08, backgroundColor: 'rgba(255,255,255,0.10)' }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Scrollable content */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}