import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronUp } from 'lucide-react';
import AnimationPickerWheel from './AnimationPickerWheel';
import CameraControlPanel from './CameraControlPanel';

const SHEET_STATES = {
  COLLAPSED: 0,
  PEEK: 1,
  EXPANDED: 2,
};

const SNAP_POINTS = {
  [SHEET_STATES.COLLAPSED]: 'calc(100vh - 100px)',
  [SHEET_STATES.PEEK]: 'calc(100vh - 400px)',
  [SHEET_STATES.EXPANDED]: '0px',
};

/**
 * Draggable bottom sheet with 3 states:
 * - Collapsed: Shows [A] [C] buttons only
 * - Peek: Shows animation wheel
 * - Expanded: Full controls with tabs
 */
export default function AvatarControlSheet({
  animations,
  currentAnimationId,
  onAnimationSelect,
  onCameraChange,
}) {
  const [state, setState] = useState(SHEET_STATES.COLLAPSED);
  const [dragOffset, setDragOffset] = useState(0);
  const [isOrbitEnabled, setIsOrbitEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('animations');
  const sheetRef = useRef(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  const handleDragStart = (e) => {
    startYRef.current = e.touches?.[0]?.clientY || e.clientY;
    currentYRef.current = startYRef.current;
  };

  const handleDragMove = (e) => {
    const currentY = e.touches?.[0]?.clientY || e.clientY;
    const delta = currentY - startYRef.current;

    // Only allow dragging when we're not at extremes
    if (state === SHEET_STATES.EXPANDED && delta > 0) {
      setDragOffset(delta);
    } else if (state === SHEET_STATES.COLLAPSED && delta < 0) {
      setDragOffset(delta);
    } else if (state === SHEET_STATES.PEEK && delta !== 0) {
      setDragOffset(delta);
    }
  };

  const handleDragEnd = (e) => {
    const finalY = e.changedTouches?.[0]?.clientY || e.clientY;
    const totalDelta = finalY - startYRef.current;
    const threshold = 50;

    if (state === SHEET_STATES.COLLAPSED) {
      // Swipe up → expand
      if (totalDelta < -threshold) {
        setState(SHEET_STATES.PEEK);
      }
    } else if (state === SHEET_STATES.PEEK) {
      if (totalDelta < -threshold) {
        setState(SHEET_STATES.EXPANDED);
      } else if (totalDelta > threshold) {
        setState(SHEET_STATES.COLLAPSED);
      }
    } else if (state === SHEET_STATES.EXPANDED) {
      // Swipe down → collapse
      if (totalDelta > threshold) {
        setState(SHEET_STATES.PEEK);
      }
    }

    setDragOffset(0);
  };

  const handleQuickToggle = (newState) => {
    setState(newState);
    setDragOffset(0);
  };

  const getBottomPosition = () => {
    const basePoints = {
      [SHEET_STATES.COLLAPSED]: 0,
      [SHEET_STATES.PEEK]: 300,
      [SHEET_STATES.EXPANDED]: 600,
    };
    return basePoints[state] + dragOffset;
  };

  return (
    <motion.div
      ref={sheetRef}
      drag="y"
      dragElastic={0.2}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDrag={handleDragMove}
      onDragEnd={handleDragEnd}
      initial={{ y: 0 }}
      animate={{ y: getBottomPosition() }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/95 via-black/80 to-black/60 backdrop-blur-xl border-t border-cyan-500/20 rounded-t-3xl"
      style={{
        height: '100vh',
        touchAction: 'none',
      }}
    >
      {/* Drag Handle */}
      <div
        className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div className="w-12 h-1 bg-white/20 rounded-full" />
      </div>

      {/* Collapsed State - Button Row */}
      <AnimatePresence>
        {state === SHEET_STATES.COLLAPSED && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-4 flex gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickToggle(SHEET_STATES.PEEK)}
              className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 text-cyan-300 hover:border-cyan-400 hover:from-cyan-500/40 hover:to-blue-500/40"
            >
              [A] Animations
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickToggle(SHEET_STATES.EXPANDED)}
              className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/50 text-purple-300 hover:border-purple-400 hover:from-purple-500/40 hover:to-pink-500/40"
            >
              [C] Camera
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Peek State - Animation Wheel Only */}
      <AnimatePresence>
        {state === SHEET_STATES.PEEK && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="flex-1 flex flex-col items-center justify-center px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full"
            >
              <AnimationPickerWheel
                animations={animations}
                onAnimationSelect={onAnimationSelect}
                currentAnimationId={currentAnimationId}
              />
            </motion.div>
            <motion.button
              onClick={() => handleQuickToggle(SHEET_STATES.EXPANDED)}
              className="mt-4 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              <ChevronUp className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">More Controls</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded State - Full Tabs */}
      <AnimatePresence>
        {state === SHEET_STATES.EXPANDED && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-2 bg-white/5 border border-white/10 grid w-auto grid-cols-2">
                <TabsTrigger value="animations" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                  Animations
                </TabsTrigger>
                <TabsTrigger value="camera" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                  Camera
                </TabsTrigger>
              </TabsList>

              <TabsContent value="animations" className="flex-1 overflow-y-auto mt-0">
                <div className="h-80">
                  <AnimationPickerWheel
                    animations={animations}
                    onAnimationSelect={onAnimationSelect}
                    currentAnimationId={currentAnimationId}
                  />
                </div>
              </TabsContent>

              <TabsContent value="camera" className="flex-1 overflow-y-auto mt-0">
                <CameraControlPanel
                  onCameraChange={onCameraChange}
                  isOrbitEnabled={isOrbitEnabled}
                  onOrbitToggle={setIsOrbitEnabled}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}