/**
 * StudioAnimationsTab — Idle, Walk, Dance, Pose animations
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

const ANIMATION_CATEGORIES = {
  idle: {
    label: 'Idle',
    icon: '🧍',
    animations: [
      { id: 1, name: 'Default Stance', url: '/animations/idle_default.glb' },
      { id: 2, name: 'Confident Pose', url: '/animations/idle_confident.glb' },
      { id: 3, name: 'Relaxed', url: '/animations/idle_relaxed.glb' },
    ],
  },
  walk: {
    label: 'Walk',
    icon: '🚶',
    animations: [
      { id: 4, name: 'Casual Walk', url: '/animations/walk_casual.glb' },
      { id: 5, name: 'Strut', url: '/animations/walk_strut.glb' },
      { id: 6, name: 'Hurried', url: '/animations/walk_hurried.glb' },
    ],
  },
  dance: {
    label: 'Dance',
    icon: '💃',
    animations: [
      { id: 7, name: 'Hip Hop', url: '/animations/dance_hiphop.glb' },
      { id: 8, name: 'Smooth Groove', url: '/animations/dance_groove.glb' },
      { id: 9, name: 'Techno', url: '/animations/dance_techno.glb' },
    ],
  },
  pose: {
    label: 'Pose',
    icon: '🤸',
    animations: [
      { id: 10, name: 'Cool Lean', url: '/animations/pose_lean.glb' },
      { id: 11, name: 'Power Stance', url: '/animations/pose_power.glb' },
      { id: 12, name: 'Thinking', url: '/animations/pose_thinking.glb' },
    ],
  },
};

export default function StudioAnimationsTab({
  customAnimations, onAddAnimation,
}) {
  const [playingId, setPlayingId] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState('idle');

  const handlePlayAnimation = animation => {
    setPlayingId(animation.id);
    onAddAnimation(animation);
    // Auto-stop after 3 seconds
    setTimeout(() => setPlayingId(null), 3000);
  };

  return (
    <div className="p-4 space-y-4">
      {Object.entries(ANIMATION_CATEGORIES).map(([categoryId, category]) => (
        <div key={categoryId}>
          {/* Category Header */}
          <motion.button
            onClick={() => setExpandedCategory(
              expandedCategory === categoryId ? null : categoryId
            )}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-2 transition-all"
            style={{
              background: expandedCategory === categoryId ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
              border: expandedCategory === categoryId ? '1px solid rgba(0,212,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
            }}
            whileHover={{ x: 2 }}
          >
            <span className="text-xl">{category.icon}</span>
            <span className="text-sm font-bold flex-1 text-left">
              {category.label}
            </span>
            <span className="text-xs text-gray-400">
              {category.animations.length}
            </span>
          </motion.button>

          {/* Category Animations */}
          {expandedCategory === categoryId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 mb-4"
            >
              {category.animations.map(anim => (
                <motion.button
                  key={anim.id}
                  onClick={() => handlePlayAnimation(anim)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all border"
                  style={{
                    background: playingId === anim.id ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                    border: playingId === anim.id ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    animate={playingId === anim.id ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="flex-shrink-0"
                  >
                    {playingId === anim.id ? (
                      <Pause className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Play className="w-4 h-4 text-gray-400" />
                    )}
                  </motion.div>
                  <span className="text-xs font-semibold text-white flex-1 text-left">
                    {anim.name}
                  </span>
                  {playingId === anim.id && (
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{ background: '#00D4FF' }}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      ))}

      {/* Info */}
      <div
        className="p-3 rounded-lg text-xs text-gray-400"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        💡 Click an animation to preview it on your avatar. No engine reload.
      </div>
    </div>
  );
}