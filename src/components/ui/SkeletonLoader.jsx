import React from 'react';
import { motion } from 'framer-motion';

export function ProductCardSkeleton() {
  return (
    <div className="group relative">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10 mb-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded-full w-1/3" />
        <div className="h-4 bg-white/10 rounded-full w-3/4" />
        <div className="h-5 bg-white/10 rounded-full w-1/2" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[70vh] min-h-[600px] bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
      />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-white/5">
      {[1, 2, 3, 4, 5].map(i => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-white/5 rounded-full" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function ContentSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-white/5 rounded-full w-full" />
          <div className="h-4 bg-white/5 rounded-full w-5/6" />
          <div className="h-4 bg-white/5 rounded-full w-4/6" />
        </div>
      ))}
    </div>
  );
}