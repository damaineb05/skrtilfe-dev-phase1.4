import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

/**
 * Floating action button for mobile animations
 * Provides quick access to animation picker wheel
 */
export default function FloatingAnimationButton({ onClick, isOpen = false }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center border"
      style={{
        bottom: 100,
        right: 20,
        background: isOpen
          ? 'rgba(0,212,255,0.25)'
          : 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,212,255,0.05))',
        backdropFilter: 'blur(16px)',
        borderColor: isOpen ? 'rgba(0,212,255,0.8)' : 'rgba(0,212,255,0.5)',
        boxShadow: isOpen ? '0 0 20px rgba(0,212,255,0.4)' : 'none',
        willChange: 'transform',
      }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        <Play className="w-6 h-6 text-cyan-400 fill-cyan-400" />
      </motion.div>
    </motion.button>
  );
}