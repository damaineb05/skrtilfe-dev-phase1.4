import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';

export default function GenesisLockModal({ isOpen, onClose, onEmailCapture }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9000]"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
            onClick={onClose}
          />

          {/* Sheet — slides up from bottom */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[9001] rounded-t-[28px] overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0E0E14 0%, #080810 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderBottom: 'none',
              maxHeight: '85vh',
            }}
          >
            {/* Pull handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="px-8 pb-12 pt-4 flex flex-col items-center text-center">
              {/* Lock icon */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 mt-4"
                style={{
                  background: 'rgba(180,150,80,0.1)',
                  border: '1px solid rgba(180,150,80,0.25)',
                  boxShadow: '0 0 30px rgba(180,150,80,0.1)',
                }}
              >
                <Lock className="w-7 h-7" style={{ color: '#B8960C' }} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="font-black mb-3"
                style={{ fontSize: 'clamp(26px, 7vw, 36px)', letterSpacing: '-0.03em', color: '#fff' }}
              >
                This is a preview.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-sm mb-10 leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 260 }}
              >
                Your identity begins when you unlock it.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="w-full space-y-3"
              >
                <button
                  className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-[0.14em] transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(180,150,80,0.9), rgba(140,110,50,0.9))',
                    color: '#000',
                    boxShadow: '0 0 30px rgba(180,150,80,0.2)',
                  }}
                  onClick={onEmailCapture}
                >
                  Unlock Identity
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 text-xs uppercase tracking-[0.2em] transition-all"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                >
                  Maybe Later
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}