import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

/**
 * iOS-style picker wheel for animation selection
 * Scroll-based, momentum physics, center-snapping
 */
export default function AnimationPickerWheel({ 
  animations, 
  onAnimationSelect, 
  currentAnimationId 
}) {
  const [scrollY, setScrollY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const wheelRef = useRef(null);
  const lastYRef = useRef(0);
  const velocityRef = useRef(0);
  const animFrameRef = useRef(null);

  // Calculate offset from center
  const getCurrentAnimationIndex = () => {
    const offset = Math.round(-scrollY / ITEM_HEIGHT);
    return ((offset % animations.length) + animations.length) % animations.length;
  };

  const currentIndex = getCurrentAnimationIndex();
  const currentAnim = animations.length > 0 ? animations[currentIndex] : null;

  // Notify parent when animation changes
  useEffect(() => {
    if (currentAnim?.id && currentAnim.id !== currentAnimationId) {
      onAnimationSelect?.(currentAnim.id, currentAnim);
    }
  }, [currentAnim, currentAnimationId, onAnimationSelect]);

  if (animations.length === 0) {
    return null;
  }

  // Momentum scrolling with deceleration
  const applyMomentum = () => {
    const friction = 0.92;
    let current = scrollY;
    let vel = velocityRef.current;

    const tick = () => {
      vel *= friction;

      if (Math.abs(vel) > 0.1) {
        current += vel;
        setScrollY(current);
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        // Snap to nearest item
        const nearest = Math.round(current / ITEM_HEIGHT) * ITEM_HEIGHT;
        snapTo(nearest);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  };

  const snapTo = (target) => {
    let current = scrollY;
    const diff = target - current;

    const animate = () => {
      current += diff * 0.15;
      setScrollY(current);

      if (Math.abs(diff - (current - scrollY)) > 0.5) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setScrollY(target);
        velocityRef.current = 0;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleWheel = (e) => {
    if (!wheelRef.current) return;

    e.preventDefault();
    const delta = e.deltaY * 0.5;
    const newScroll = scrollY + delta;

    setScrollY(newScroll);
    velocityRef.current = delta * 0.1;
  };

  const handleTouchStart = (e) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsDragging(true);
    lastYRef.current = e.touches[0].clientY;
    velocityRef.current = 0;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const delta = lastYRef.current - currentY;

    setScrollY((prev) => prev + delta);
    velocityRef.current = delta * 0.5;
    lastYRef.current = currentY;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    applyMomentum();
  };

  // Render animation item with fade/scale based on position
  const renderItem = (anim, index) => {
    const itemOffset = index * ITEM_HEIGHT - scrollY;
    const distanceFromCenter = Math.abs(itemOffset - WHEEL_HEIGHT / 2 + ITEM_HEIGHT / 2);
    const isCenter = Math.abs(itemOffset - WHEEL_HEIGHT / 2 + ITEM_HEIGHT / 2) < ITEM_HEIGHT / 2;

    // Fade out items farther from center
    const opacity = Math.max(0.2, 1 - distanceFromCenter / (WHEEL_HEIGHT / 2));
    const scale = isCenter ? 1.2 : 0.85;

    return (
      <motion.div
        key={`${index}-${anim.id}`}
        style={{
          height: ITEM_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity,
          scale,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`transition-colors ${
          isCenter
            ? 'text-cyan-300 font-bold'
            : 'text-gray-400 font-medium'
        }`}
      >
        {anim.name}
      </motion.div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Gradient overlay (top) */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" />

      {/* Picker wheel */}
      <div
        ref={wheelRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative overflow-hidden touch-none"
        style={{ height: WHEEL_HEIGHT, width: '100%' }}
      >
        <div
          style={{
            transform: `translateY(${WHEEL_HEIGHT / 2 - ITEM_HEIGHT / 2}px)`,
          }}
          className="flex flex-col"
        >
          {animations.map((anim, idx) => renderItem(anim, idx))}
        </div>
      </div>

      {/* Center indicator line */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-14 border-t-2 border-b-2 border-cyan-400/30 pointer-events-none" />

      {/* Gradient overlay (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
    </div>
  );
}