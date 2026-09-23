import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Wallet, Zap, HelpCircle, X, ShoppingBag, Radio, User, GripHorizontal, GripVertical as GripV, Globe } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

const DOCK_ITEMS = [
  { icon: Home,        label: 'Home',      href: createPageUrl('Home') },
  { icon: ShoppingBag, label: 'Shop',      href: createPageUrl('Shop') },
  { icon: User,        label: 'Profile',   href: createPageUrl('Dashboard') },
  { icon: Zap,         label: 'DripSync',  href: createPageUrl('DripSync') },
  { icon: Globe,       label: 'World',     href: createPageUrl('World') },
  { icon: Radio,       label: 'Streaming', href: createPageUrl('Dashboard') },
  { icon: Wallet,      label: 'Wallet',    href: createPageUrl('Wallet') },
  { icon: HelpCircle,  label: 'Help',      isHelp: true },
];

const EDGE_THRESHOLD = 90;
const SNAP_MARGIN = 12;

function DockIcon({ item, onHelp, orientation, index, isAnimating }) {
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;
  const isVertical = orientation === 'vertical';

  const tooltipSide = isVertical ? 'right' : 'top';

  const tooltipVariants = {
    hidden: { opacity: 0, x: tooltipSide === 'right' ? -6 : 0, y: tooltipSide === 'top' ? 4 : 0 },
    visible: { opacity: 1, x: 0, y: 0 },
  };

  const inner = (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.18, ...(isVertical ? { x: 4 } : { y: -4 }) }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className="relative flex items-center justify-center"
    >
      <AnimatePresence>
        {hovered && (
          <motion.span
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.12 }}
            className={`absolute whitespace-nowrap text-[10px] font-semibold tracking-wide px-2 py-1 rounded pointer-events-none z-20
              ${isVertical ? 'left-full ml-3' : 'bottom-full mb-2 left-1/2 -translate-x-1/2'}`}
            style={{ background: 'rgba(0,212,255,0.15)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)' }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      <div
        className="w-11 h-11 flex items-center justify-center transition-colors duration-150"
        style={{
          borderRadius: '12px',
          background: hovered ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.07)',
          border: hovered ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(255,255,255,0.09)',
        }}
      >
        <Icon className="w-[18px] h-[18px]" style={{ color: hovered ? '#00D4FF' : 'rgba(255,255,255,0.75)' }} />
      </div>
    </motion.div>
  );

  if (item.href) return <Link to={item.href}>{inner}</Link>;
  return <button onClick={item.isHelp ? onHelp : undefined}>{inner}</button>;
}

// Ripple burst that plays on edge collision
function EdgeBurst({ side }) {
  const colors = ['#00D4FF', '#FF3366', '#FFD700'];
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {colors.map((c, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 6, height: 6,
            background: c,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: side === 'left' ? [0, 20 + i * 10] : side === 'right' ? [0, -(20 + i * 10)] : [(-20 + i * 20), (-20 + i * 20)],
            y: side === 'bottom' ? [0, -(20 + i * 10)] : [(-15 + i * 15), (-30 + i * 15)],
            opacity: [1, 0],
            scale: [1, 0.4],
          }}
          transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
        />
      ))}
    </motion.div>
  );
}

export default function FloatingDock() {
  const [showHelp, setShowHelp] = useState(false);
  const [position, setPosition] = useState({ x: null, y: null });
  const [orientation, setOrientation] = useState('horizontal'); // 'horizontal' | 'vertical'
  const [snappedEdge, setSnappedEdge] = useState(null); // 'left' | 'right' | 'bottom' | null
  const [isDragging, setIsDragging] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const dockRef = useRef(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  const handleHelp = useCallback(() => setShowHelp(p => !p), []);
  const isFloating = position.x !== null;

  // After drag ends, check proximity to edges and snap
  const checkEdgeSnap = useCallback((x, y) => {
    const rect = dockRef.current?.getBoundingClientRect();
    const dockW = rect?.width ?? 360;
    const dockH = rect?.height ?? 70;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const nearLeft = x <= EDGE_THRESHOLD;
    const nearRight = x + dockW >= vw - EDGE_THRESHOLD;
    const nearBottom = y + dockH >= vh - EDGE_THRESHOLD;

    if (nearLeft) return 'left';
    if (nearRight) return 'right';
    if (nearBottom) return 'bottom';
    return null;
  }, []);

  const triggerEdgeSnap = useCallback((edge, currentX, currentY) => {
    const rect = dockRef.current?.getBoundingClientRect();
    const dockW = rect?.width ?? 360;
    const dockH = rect?.height ?? 70;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    setIsTransitioning(true);
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 700);

    const willBeVertical = edge === 'left' || edge === 'right';
    const newOrientation = willBeVertical ? 'vertical' : 'horizontal';

    // Compute snap position
    let snapX = currentX;
    let snapY = currentY;

    if (edge === 'left') {
      snapX = SNAP_MARGIN;
      snapY = Math.min(currentY, vh - (DOCK_ITEMS.length * 52 + 60));
      snapY = Math.max(snapY, 80);
    } else if (edge === 'right') {
      // vertical dock width ~60px
      snapX = vw - 60 - SNAP_MARGIN;
      snapY = Math.min(currentY, vh - (DOCK_ITEMS.length * 52 + 60));
      snapY = Math.max(snapY, 80);
    } else if (edge === 'bottom') {
      snapX = Math.max(SNAP_MARGIN, Math.min(currentX, vw - dockW - SNAP_MARGIN));
      snapY = vh - dockH - SNAP_MARGIN;
    }

    setOrientation(newOrientation);
    setSnappedEdge(edge);
    setPosition({ x: snapX, y: snapY });
    setTimeout(() => setIsTransitioning(false), 600);
  }, []);

  const handleGripMouseDown = useCallback((e) => {
    e.preventDefault();
    const rect = dockRef.current?.getBoundingClientRect();
    const currentX = rect?.left ?? 0;
    const currentY = rect?.top ?? 0;

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: currentX,
      posY: currentY,
    };
    setIsDragging(true);

    const onMove = (moveE) => {
      const dx = moveE.clientX - dragStartRef.current.mouseX;
      const dy = moveE.clientY - dragStartRef.current.mouseY;
      const r = dockRef.current?.getBoundingClientRect();
      const w = r?.width ?? 300;
      const h = r?.height ?? 70;
      const newX = Math.max(0, Math.min(dragStartRef.current.posX + dx, window.innerWidth - w));
      const newY = Math.max(0, Math.min(dragStartRef.current.posY + dy, window.innerHeight - h));
      setPosition({ x: newX, y: newY });
    };

    const onUp = (upE) => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);

      const r = dockRef.current?.getBoundingClientRect();
      const finalX = r?.left ?? 0;
      const finalY = r?.top ?? 0;
      const edge = checkEdgeSnap(finalX, finalY);

      if (edge) {
        triggerEdgeSnap(edge, finalX, finalY);
      } else {
        // Leaving an edge - reset to horizontal
        if (snappedEdge) {
          setIsTransitioning(true);
          setOrientation('horizontal');
          setSnappedEdge(null);
          setTimeout(() => setIsTransitioning(false), 500);
        }
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [checkEdgeSnap, triggerEdgeSnap, snappedEdge]);

  const handleReset = useCallback((e) => {
    e.stopPropagation();
    setIsTransitioning(true);
    setOrientation('horizontal');
    setSnappedEdge(null);
    setPosition({ x: null, y: null });
    setTimeout(() => setIsTransitioning(false), 500);
  }, []);

  const isVertical = orientation === 'vertical';

  const itemVariants = {
    hidden: (i) => ({
      opacity: 0,
      x: snappedEdge === 'left' ? -30 : snappedEdge === 'right' ? 30 : 0,
      y: snappedEdge === 'bottom' ? 30 : isVertical ? -20 : 0,
      scale: 0.6,
    }),
    visible: (i) => ({
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 26,
        delay: i * 0.055,
      },
    }),
    exit: (i) => ({
      opacity: 0,
      scale: 0.5,
      transition: { duration: 0.15, delay: (DOCK_ITEMS.length - i - 1) * 0.03 },
    }),
  };

  const gripEl = (
    <div
      onMouseDown={handleGripMouseDown}
      className={`flex items-center justify-center ${isVertical ? 'w-full mb-1 py-1' : 'flex-col mr-1'}`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      title="Drag to reposition"
    >
      <div
        className={`flex items-center gap-1 transition-all ${isVertical ? 'px-2 py-0.5 rounded-full flex-row' : 'px-1 py-2 rounded-full flex-col'}`}
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {isVertical
          ? <GripHorizontal className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
          : <GripV className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
        }
        {isFloating && (
          <button
            onClick={handleReset}
            onMouseDown={(e) => e.stopPropagation()}
            className="text-[9px] font-bold uppercase tracking-wider"
            style={{ color: 'rgba(0,212,255,0.7)' }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );

  const pillStyle = {
    borderRadius: isVertical ? '16px' : '20px',
    background: 'rgba(10,10,15,0.92)',
    backdropFilter: 'blur(28px) saturate(160%)',
    WebkitBackdropFilter: 'blur(28px) saturate(160%)',
    border: snappedEdge
      ? `1px solid rgba(0,212,255,0.25)`
      : '1px solid rgba(0,212,255,0.15)',
    boxShadow: isDragging
      ? '0 12px 60px rgba(0,212,255,0.2), 0 1px 0 rgba(255,255,255,0.06) inset'
      : snappedEdge
      ? '0 0 40px rgba(0,212,255,0.12), 0 8px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset'
      : '0 8px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset',
    position: 'relative',
    overflow: 'visible',
  };

  return (
    <>
      <motion.div
        ref={dockRef}
        className="fixed z-50 hidden lg:block"
        animate={isFloating
          ? { left: position.x, top: position.y, bottom: 'auto', x: 0, y: 0 }
          : { bottom: 20, left: '50%', x: '-50%', top: 'auto' }
        }
        transition={isTransitioning
          ? { type: 'spring', stiffness: 280, damping: 30 }
          : { type: 'tween', duration: 0 }
        }
        style={{ userSelect: 'none' }}
      >
        {/* Vertical layout */}
        <AnimatePresence mode="wait">
          {isVertical ? (
            <motion.div
              key="vertical"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="flex flex-col items-center gap-1.5 px-2.5 py-3"
              style={pillStyle}
            >
              {showBurst && <EdgeBurst side={snappedEdge} />}
              {gripEl}
              <div className="w-px h-3" style={{ background: 'rgba(0,212,255,0.2)' }} />
              {DOCK_ITEMS.map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <DockIcon item={item} onHelp={handleHelp} orientation="vertical" index={i} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="horizontal"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="flex flex-col items-center"
            >
              {/* Grip bar above pill */}
              <div
                onMouseDown={handleGripMouseDown}
                className="flex justify-center mb-1"
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <div
                  className="flex items-center gap-1.5 px-3 py-0.5 rounded-full transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <GripHorizontal className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  {isFloating && (
                    <button
                      onClick={handleReset}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: 'rgba(0,212,255,0.7)' }}
                    >
                      reset
                    </button>
                  )}
                </div>
              </div>

              {/* Horizontal pill */}
              <motion.div
                className="flex items-center gap-1.5 px-3 py-2.5"
                style={pillStyle}
              >
                {showBurst && <EdgeBurst side={snappedEdge} />}
                {DOCK_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.label}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <DockIcon item={item} onHelp={handleHelp} orientation="horizontal" index={i} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Edge indicator glow when near snap zone */}
      <AnimatePresence>
        {isDragging && (
          <>
            {/* Left edge glow */}
            <motion.div
              className="fixed top-0 left-0 bottom-0 pointer-events-none z-40"
              style={{ width: 3, background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.4), transparent)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
            {/* Right edge glow */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 pointer-events-none z-40"
              style={{ width: 3, background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.4), transparent)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
            {/* Bottom edge glow */}
            <motion.div
              className="fixed left-0 right-0 bottom-0 pointer-events-none z-40"
              style={{ height: 3, background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.4), transparent)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="p-6 max-w-sm w-full"
              style={{ background: '#0A0A0F', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '16px' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-white font-bold text-sm tracking-wide">Quick Nav</h3>
                <button onClick={() => setShowHelp(false)}>
                  <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ['🏠', 'Home', 'Return to the main homepage'],
                  ['🛍️', 'Shop', 'Browse the full product collection'],
                  ['👤', 'Profile', 'Your dashboard and profile'],
                  ['⚡', 'DripSync', 'Customize your avatar'],
                  ['📡', 'Streaming', 'Live TV & streaming hub'],
                  ['💳', 'Wallet', 'Manage digital assets & NFTs'],
                ].map(([emoji, title, desc]) => (
                  <div key={title} className="flex gap-3 items-start">
                    <span>{emoji}</span>
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-1 text-[10px] text-center" style={{ color: 'rgba(0,212,255,0.5)' }}>
                Drag the dock to any edge — it auto-tiles vertically
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}