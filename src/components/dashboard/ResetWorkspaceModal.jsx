import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';

export default function ResetWorkspaceModal({ isOpen, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-[300]"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="fixed z-[301] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm p-8 text-center"
            style={{
              background: 'rgba(10,10,15,0.98)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '20px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
            }}
          >
            <button onClick={onCancel}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center"
              style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'rgba(255,255,255,0.35)' }}>
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="w-12 h-12 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} />
            </div>

            <h3 className="text-base font-bold text-white mb-2">Reset Workspace?</h3>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
              This clears your saved panel layout, positions, and sizes. You'll see the starter layout selector again.
            </p>

            <div className="flex gap-3">
              <button onClick={onCancel}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)' }}>
                Cancel
              </button>
              <button onClick={onConfirm}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                style={{ background: '#EF4444', borderRadius: '10px', color: '#fff' }}>
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}