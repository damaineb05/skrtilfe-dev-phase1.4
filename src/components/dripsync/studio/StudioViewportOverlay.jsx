/**
 * StudioViewportOverlay — Hints + glowing platform indicator
 */
import React from 'react';
import { motion } from 'framer-motion';

export default function StudioViewportOverlay({ livePreviewMode }) {
  return (
    <>
      {/* Top-left rotate hint */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 text-xs"
        style={{ color: 'rgba(0,212,255,0.6)' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-4 h-4 rounded-full border border-cyan-400/50"
        />
        <span className="font-mono uppercase tracking-widest">Drag to Rotate</span>
      </motion.div>

      {/* Mode indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 right-8 z-20 text-xs font-bold uppercase tracking-widest"
        style={{
          color: '#00D4FF',
          background: 'rgba(0,212,255,0.08)',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(0,212,255,0.2)',
        }}
      >
        {livePreviewMode} mode
      </motion.div>

      {/* Glowing platform indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10"
        style={{
          width: '200px',
          height: '12px',
          borderRadius: '6px',
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)',
          boxShadow: '0 0 32px rgba(0,212,255,0.2), inset 0 0 16px rgba(0,212,255,0.1)',
          pointerEvents: 'none',
        }}
      >
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '6px',
            background: 'rgba(0,212,255,0.2)',
          }}
        />
      </motion.div>

      {/* Studio hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 right-8 z-20 text-[11px] text-gray-400 font-mono max-w-48 text-right"
      >
        <p>✨ Real-time preview</p>
        <p>No engine reload</p>
      </motion.div>
    </>
  );
}