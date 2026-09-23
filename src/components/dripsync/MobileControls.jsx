import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronUp, Activity } from 'lucide-react';

export default function MobileControls({ 
  onMove, 
  onRun, 
  onJump, 
  onCrouch,
  isRunning = false,
  isCrouching = false 
}) {
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const joystickRef = useRef(null);
  const touchIdRef = useRef(null);

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchIdRef.current = touch.identifier;
    setJoystickActive(true);
    updateJoystickPosition(touch);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
    if (touch) {
      updateJoystickPosition(touch);
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (touchIdRef.current !== null) {
      setJoystickActive(false);
      setJoystickPosition({ x: 0, y: 0 });
      touchIdRef.current = null;
      onMove({ x: 0, y: 0 }, 0);
    }
  };

  const updateJoystickPosition = (touch) => {
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;
    
    const maxDistance = 50;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > maxDistance) {
      const angle = Math.atan2(deltaY, deltaX);
      deltaX = Math.cos(angle) * maxDistance;
      deltaY = Math.sin(angle) * maxDistance;
    }
    
    setJoystickPosition({ x: deltaX, y: deltaY });
    
    const magnitude = Math.min(distance / maxDistance, 1);
    onMove({ x: deltaX / maxDistance, y: deltaY / maxDistance }, magnitude);
  };

  return (
    <>
      {/* Joystick - Bottom Left */}
      <div className="fixed bottom-24 left-6 z-50 select-none touch-none">
        <div
          ref={joystickRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-32 h-32 rounded-full bg-black/40 backdrop-blur-xl border-2 border-white/20 shadow-2xl flex items-center justify-center"
        >
          {/* Outer Ring */}
          <div className="absolute inset-4 rounded-full border-2 border-white/10" />
          
          {/* Stick */}
          <motion.div
            animate={{
              x: joystickPosition.x,
              y: joystickPosition.y
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 border-2 border-white/40 shadow-lg"
          >
            <div className="absolute inset-2 rounded-full border-2 border-white/30" />
          </motion.div>

          {/* Center Dot */}
          {!joystickActive && (
            <div className="absolute w-3 h-3 rounded-full bg-white/50" />
          )}

          {/* Directional Indicators */}
          <div className="absolute inset-0 pointer-events-none">
            <ChevronUp className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 text-white/30" />
            <ChevronUp className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 text-white/30 rotate-180" />
            <ChevronUp className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 -rotate-90" />
            <ChevronUp className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 rotate-90" />
          </div>
        </div>

        {/* Label */}
        <div className="text-center mt-2">
          <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
            Move
          </span>
        </div>
      </div>

      {/* Action Buttons - Bottom Right */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-3 select-none">
        {/* Jump Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onTouchStart={(e) => {
            e.preventDefault();
            onJump();
          }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white/40 shadow-2xl flex items-center justify-center backdrop-blur-xl"
        >
          <Zap className="w-8 h-8 text-black" strokeWidth={2.5} />
        </motion.button>

        {/* Sprint Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onTouchStart={(e) => {
            e.preventDefault();
            onRun(!isRunning);
          }}
          className={`w-16 h-16 rounded-full border-2 border-white/40 shadow-2xl flex items-center justify-center backdrop-blur-xl transition-all ${
            isRunning 
              ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
              : 'bg-black/60'
          }`}
        >
          <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
        </motion.button>

        {/* Crouch Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onTouchStart={(e) => {
            e.preventDefault();
            onCrouch(!isCrouching);
          }}
          className={`w-16 h-16 rounded-full border-2 border-white/40 shadow-2xl flex items-center justify-center backdrop-blur-xl transition-all ${
            isCrouching 
              ? 'bg-gradient-to-br from-blue-400 to-indigo-500' 
              : 'bg-black/60'
          }`}
        >
          <ChevronUp className="w-8 h-8 text-white rotate-180" strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* Status Indicators */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-2">
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-xl border border-white/20 flex items-center gap-1.5"
          >
            <Activity className="w-3 h-3 text-white" />
            <span className="text-xs font-bold text-white uppercase">Sprint</span>
          </motion.div>
        )}
        {isCrouching && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="px-3 py-1.5 rounded-full bg-blue-500/90 backdrop-blur-xl border border-white/20 flex items-center gap-1.5"
          >
            <ChevronUp className="w-3 h-3 text-white rotate-180" />
            <span className="text-xs font-bold text-white uppercase">Crouch</span>
          </motion.div>
        )}
      </div>
    </>
  );
}