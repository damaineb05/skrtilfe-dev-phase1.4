import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, ChevronRight, ChevronLeft } from 'lucide-react';

export default function DraggableMessengerButton({ isOpen, onToggle }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isOffScreen, setIsOffScreen] = useState(false);
  const [offScreenSide, setOffScreenSide] = useState(null);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);

  // Check if button is off-screen and which side
  useEffect(() => {
    if (!buttonRef.current || !containerRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const container = containerRef.current.getBoundingClientRect();

    // Check if button is outside viewport bounds
    if (rect.right < 0) {
      setIsOffScreen(true);
      setOffScreenSide('left');
    } else if (rect.left > window.innerWidth) {
      setIsOffScreen(true);
      setOffScreenSide('right');
    } else if (rect.bottom < 0) {
      setIsOffScreen(true);
      setOffScreenSide('top');
    } else if (rect.top > window.innerHeight) {
      setIsOffScreen(true);
      setOffScreenSide('bottom');
    } else {
      setIsOffScreen(false);
      setOffScreenSide(null);
    }
  }, [position]);

  const handleMouseDown = (e) => {
    if (!buttonRef.current) return;
    setIsDragging(true);
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x - 24, // center the button (w-16 = 64px, /2 = 32, but adjusting for container)
      y: e.clientY - dragOffset.y - 24,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleEdgeClick = () => {
    // Bring button back to visible area
    setPosition({ x: 16, y: window.innerHeight - 120 });
  };

  // Add global mouse listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 40,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <button
          ref={buttonRef}
          onMouseDown={handleMouseDown}
          onClick={() => !isDragging && onToggle()}
          className="w-16 h-16 rounded-full text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: isOpen ? 'var(--brand-red)' : 'var(--skrt-cyan)',
            boxShadow: '0 8px 32px rgba(0,212,255,0.3)',
            userSelect: 'none',
          }}
          aria-label={isOpen ? 'Close messenger' : 'Open messenger'}
        >
          {isOpen ? <X className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
        </button>
      </div>

      {/* Edge indicator when off-screen */}
      {isOffScreen && offScreenSide && (
        <div
          onClick={handleEdgeClick}
          className="fixed cursor-pointer z-39 transition-all duration-200 hover:scale-125"
          style={{
            left: offScreenSide === 'left' ? '8px' : offScreenSide === 'right' ? 'auto' : '50%',
            right: offScreenSide === 'right' ? '8px' : 'auto',
            top: offScreenSide === 'top' ? '8px' : offScreenSide === 'bottom' ? 'auto' : '50%',
            bottom: offScreenSide === 'bottom' ? '8px' : 'auto',
            transform: offScreenSide === 'left' || offScreenSide === 'right' ? (offScreenSide === 'left' ? 'translateY(-50%)' : 'translateY(-50%)') : 'translateX(-50%)',
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--skrt-cyan)',
              boxShadow: '0 4px 16px rgba(0,212,255,0.4)',
            }}
          >
            {offScreenSide === 'left' && <ChevronRight className="w-5 h-5 text-white" />}
            {offScreenSide === 'right' && <ChevronLeft className="w-5 h-5 text-white" />}
            {offScreenSide === 'top' && <ChevronRight className="w-5 h-5 text-white rotate-90" />}
            {offScreenSide === 'bottom' && <ChevronRight className="w-5 h-5 text-white -rotate-90" />}
          </div>
        </div>
      )}
    </>
  );
}