import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Pin, PinOff, Minimize2, Maximize2, Copy, X } from 'lucide-react';

const GRID_SIZE = 32;
const MIN_W = 300;
const MIN_H = 250;

export default function FloatingPanel({
  panel,
  instanceKey,
  position,
  size: externalSize,
  isFocused,
  isMinimized,
  onUpdatePosition,
  onUpdateSize,
  onFocus,
  onClose,
  onTogglePin,
  onToggleMaximize,
  onToggleMinimize,
  onDuplicate,
  isPinned,
  isMaximized,
  onInteractionStart,
  onInteractionEnd,
  children,
}) {
  // Use externally persisted size, fall back to panel default
  const [size, setSize] = useState(externalSize || panel.defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Stable refs — avoid stale closures inside mousemove
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const positionRef = useRef(position);
  const sizeRef = useRef(size);

  // Keep refs in sync
  useEffect(() => { positionRef.current = position; }, [position]);
  useEffect(() => { sizeRef.current = size; }, [size]);

  // Sync external size changes (e.g. on restore from saved state)
  useEffect(() => {
    if (externalSize && !isResizing) {
      setSize(externalSize);
    }
  }, [externalSize?.w, externalSize?.h]); // eslint-disable-line

  const Icon = panel.icon;

  // ── Drag ──────────────────────────────────────────────────────
  const handleDragMouseDown = useCallback((e) => {
    if (isPinned || isMaximized) return;
    e.preventDefault();
    setIsDragging(true);
    onInteractionStart?.();
    dragOffset.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    };
    onFocus();
  }, [isPinned, isMaximized, onInteractionStart, onFocus]);

  // ── Resize ─────────────────────────────────────────────────────
  const handleResizeMouseDown = useCallback((e) => {
    if (isMaximized) return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    onInteractionStart?.();
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: sizeRef.current.w,
      h: sizeRef.current.h,
    };
    onFocus();
  }, [isMaximized, onInteractionStart, onFocus]);

  // ── Unified mousemove/mouseup via stable refs ─────────────────
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const onMove = (e) => {
      if (isDragging && !isPinned && !isMaximized) {
        const rawX = e.clientX - dragOffset.current.x;
        const rawY = e.clientY - dragOffset.current.y;
        onUpdatePosition({
          x: Math.round(rawX / GRID_SIZE) * GRID_SIZE,
          y: Math.max(0, Math.round(rawY / GRID_SIZE) * GRID_SIZE),
        });
      }
      if (isResizing) {
        const newW = Math.max(MIN_W, resizeStart.current.w + (e.clientX - resizeStart.current.x));
        const newH = Math.max(MIN_H, resizeStart.current.h + (e.clientY - resizeStart.current.y));
        setSize({ w: newW, h: newH });
      }
    };

    const onUp = () => {
      if (isResizing) {
        // Persist final size on mouseup only
        onUpdateSize?.(sizeRef.current);
      }
      setIsDragging(false);
      setIsResizing(false);
      onInteractionEnd?.();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, isResizing, isPinned, isMaximized, onUpdatePosition, onUpdateSize, onInteractionEnd]);

  if (isMinimized) return null;

  const panelW = isMaximized ? '100vw' : `${size.w}px`;
  const panelH = isMaximized ? 'calc(100vh - 44px - 100px)' : `${size.h}px`;

  return (
    <motion.div
      key={instanceKey}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={
        isMaximized
          ? { x: 0, y: 44, opacity: 1, scale: 1 }
          : { x: position.x, y: position.y, opacity: 1, scale: isFocused ? 1 : 0.985 }
      }
      style={{
        position: 'fixed',
        top: isMaximized ? 0 : undefined,
        left: isMaximized ? 0 : undefined,
        width: panelW,
        height: panelH,
        zIndex: isFocused ? 100 : 20,
        pointerEvents: 'auto',
        willChange: isDragging ? 'transform' : 'auto',
      }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      onClick={onFocus}
      className="select-none"
    >
      <div
        className="w-full h-full overflow-hidden shadow-2xl flex flex-col"
        style={{
          background: 'rgba(10,10,15,0.92)',
          backdropFilter: 'blur(40px) saturate(160%)',
          border: isFocused ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          transition: 'border-color 0.15s ease',
        }}
      >
        {/* Header / drag handle */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-move flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          onMouseDown={handleDragMouseDown}
        >
          <div className="flex items-center gap-2.5">
            <GripVertical className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.18)' }} />
            <Icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white leading-tight">{panel.title}</h3>
              {panel.subtitle && (
                <p className="text-[9px] leading-tight mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{panel.subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-0.5" onMouseDown={e => e.stopPropagation()}>
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="w-6 h-6 flex items-center justify-center transition-all hover:bg-white/10 rounded" title="Duplicate">
              <Copy className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.35)' }} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
              className="w-6 h-6 flex items-center justify-center transition-all hover:bg-white/10 rounded" title={isPinned ? 'Unpin' : 'Pin'}>
              {isPinned
                ? <PinOff className="w-3 h-3 text-white" />
                : <Pin className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.35)' }} />}
            </button>
            {panel.canMinimize && (
              <button onClick={(e) => { e.stopPropagation(); onToggleMinimize(); }}
                className="w-6 h-6 flex items-center justify-center transition-all hover:bg-white/10 rounded" title="Minimize">
                <Minimize2 className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.35)' }} />
              </button>
            )}
            {panel.canMaximize && (
              <button onClick={(e) => { e.stopPropagation(); onToggleMaximize(); }}
                className="w-6 h-6 flex items-center justify-center transition-all hover:bg-white/10 rounded" title={isMaximized ? 'Restore' : 'Maximize'}>
                {isMaximized
                  ? <Minimize2 className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.35)' }} />
                  : <Maximize2 className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.35)' }} />}
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="w-6 h-6 flex items-center justify-center transition-all hover:bg-white/10 rounded ml-1" title="Close">
              <X className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.35)' }} />
            </button>
          </div>
        </div>

        {/* Content — lazy: only render children when not minimized */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>

        {/* Resize handle */}
        {!isMaximized && (
          <div
            className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-10"
            onMouseDown={handleResizeMouseDown}
          >
            <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-r border-b"
              style={{ borderColor: 'rgba(255,255,255,0.18)' }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}