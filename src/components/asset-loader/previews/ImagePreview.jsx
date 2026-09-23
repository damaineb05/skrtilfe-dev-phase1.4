import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Move,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImagePreview({ 
  asset, 
  hotspots = [],
  onHotspotClick,
  showControls = true,
  className = ''
}) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = useCallback((e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [zoom, position]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.25, Math.min(5, prev + delta)));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  if (!asset?.src) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 rounded-xl ${className}`}>
        <p className="text-gray-500">No image to display</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-900 rounded-xl ${className}`}
    >
      {/* Image Container */}
      <div 
        className={`w-full h-full flex items-center justify-center ${zoom > 1 ? 'cursor-grab' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
      >
        <motion.img
          src={asset.src}
          alt={asset.name || 'Image preview'}
          className="max-w-full max-h-full object-contain select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center center'
          }}
          draggable={false}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Hotspots */}
        {hotspots.map((hotspot, index) => (
          <motion.button
            key={hotspot.id || index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.2 }}
            onClick={() => onHotspotClick?.(hotspot)}
            className="absolute w-8 h-8 rounded-full bg-cyan-500 border-2 border-white shadow-lg flex items-center justify-center cursor-pointer"
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <span className="text-white text-xs font-bold">{index + 1}</span>
            {/* Pulse effect */}
            <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-50" />
          </motion.button>
        ))}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black/60 backdrop-blur-sm rounded-xl">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleZoomOut}
            className="w-8 h-8 p-0 text-white hover:bg-white/20"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <span className="text-white text-xs font-mono w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleZoomIn}
            className="w-8 h-8 p-0 text-white hover:bg-white/20"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-white/20" />
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleRotate}
            className="w-8 h-8 p-0 text-white hover:bg-white/20"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleReset}
            className="w-8 h-8 p-0 text-white hover:bg-white/20"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-white/20" />
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={toggleFullscreen}
            className="w-8 h-8 p-0 text-white hover:bg-white/20"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Zoom indicator */}
      {zoom > 1 && (
        <div className="absolute top-4 left-4 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg flex items-center gap-1">
          <Move className="w-3 h-3 text-gray-400" />
          <span className="text-gray-400 text-xs">Drag to pan</span>
        </div>
      )}
    </div>
  );
}