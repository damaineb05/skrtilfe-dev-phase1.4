/**
 * CreatorToggleButton
 * Premium floating button to trigger Creator email capture modal
 * Positioned fixed, minimal, elegant
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function CreatorToggleButton({ onClick, isMobile = false }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-[1000] rounded-full flex items-center gap-2 font-bold text-sm uppercase tracking-[0.12em] px-6 py-3.5 transition-all"
      style={{
        background: 'linear-gradient(135deg, rgba(0,212,255,0.9), rgba(0,180,220,0.9))',
        color: '#000',
        boxShadow: '0 8px 32px rgba(0,212,255,0.3), 0 0 0 1px rgba(0,212,255,0.2)',
        backdropFilter: 'blur(12px)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(0,212,255,0.4), 0 0 0 1px rgba(0,212,255,0.3)' }}
      whileTap={{ scale: 0.97 }}
    >
      <Sparkles className="w-4 h-4" />
      Creator
    </motion.button>
  );
}