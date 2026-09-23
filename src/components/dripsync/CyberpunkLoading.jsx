import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export function CyberpunkLoader({ size = 'md', text = 'Loading...' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer spinning ring */}
        <motion.div
          className={`${sizes[size]} rounded-full border-4 border-cyan-500/20 border-t-cyan-400`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner spinning ring (opposite direction) */}
        <motion.div
          className={`absolute inset-0 ${sizes[size]} rounded-full border-4 border-purple-500/20 border-b-purple-400`}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Center glow */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1, 0.8]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className={`${size === 'xl' ? 'w-8 h-8' : 'w-4 h-4'} rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.8)]`} />
        </motion.div>
      </div>

      {text && (
        <motion.div
          className="text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <p className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
            {text}
          </p>
        </motion.div>
      )}
    </div>
  );
}

export function CyberpunkProgress({ progress = 0, label = '' }) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="uppercase tracking-wider">{label}</span>
        <span className="font-bold text-cyan-400">{Math.round(progress)}%</span>
      </div>
      
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
        {/* Background scan line */}
        <motion.div
          className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Progress bar */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

export function CyberpunkSpinner({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Zap className="w-6 h-6 text-cyan-400" />
      </motion.div>
      <motion.div
        className="absolute inset-0"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Zap className="w-6 h-6 text-cyan-400" />
      </motion.div>
    </div>
  );
}