import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Box,
  Grid,
  Sun,
  RefreshCw,
  Smartphone,
  Loader2,
  Move3D
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

// Check for AR support
const checkARSupport = () => {
  return 'xr' in navigator || 
    document.createElement('a').relAttributeSupported?.('ar') ||
    /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export default function ModelPreview({ 
  asset,
  hotspots = [],
  onHotspotClick,
  showControls = true,
  enableAR = true,
  className = ''
}) {
  const containerRef = useRef(null);
  const modelViewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWireframe, setShowWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraOrbit, setCameraOrbit] = useState('0deg 75deg 105%');
  const [exposure, setExposure] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [arSupported, setArSupported] = useState(false);

  useEffect(() => {
    setArSupported(checkARSupport());
    
    // Load model-viewer if not already loaded
    if (!customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer) return;

    const handleLoad = () => setIsLoading(false);
    const handleError = (e) => {
      setIsLoading(false);
      setError('Failed to load 3D model');
      console.error('Model loading error:', e);
    };

    modelViewer.addEventListener('load', handleLoad);
    modelViewer.addEventListener('error', handleError);

    return () => {
      modelViewer.removeEventListener('load', handleLoad);
      modelViewer.removeEventListener('error', handleError);
    };
  }, [asset?.src]);

  const handleZoomIn = () => {
    const modelViewer = modelViewerRef.current;
    if (modelViewer) {
      const orbit = modelViewer.getCameraOrbit();
      orbit.radius = Math.max(orbit.radius * 0.8, 0.5);
      modelViewer.cameraOrbit = `${orbit.theta}rad ${orbit.phi}rad ${orbit.radius}m`;
    }
  };

  const handleZoomOut = () => {
    const modelViewer = modelViewerRef.current;
    if (modelViewer) {
      const orbit = modelViewer.getCameraOrbit();
      orbit.radius = Math.min(orbit.radius * 1.2, 10);
      modelViewer.cameraOrbit = `${orbit.theta}rad ${orbit.phi}rad ${orbit.radius}m`;
    }
  };

  const handleReset = () => {
    const modelViewer = modelViewerRef.current;
    if (modelViewer) {
      modelViewer.cameraOrbit = '0deg 75deg 105%';
      modelViewer.cameraTarget = 'auto auto auto';
      modelViewer.fieldOfView = 'auto';
    }
    setExposure(1);
    setAutoRotate(true);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleARClick = () => {
    const modelViewer = modelViewerRef.current;
    if (modelViewer?.canActivateAR) {
      modelViewer.activateAR();
    }
  };

  if (!asset?.src) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 rounded-xl ${className}`}>
        <p className="text-gray-500">No model to display</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl ${className}`}
    >
      {/* Model Viewer */}
      <model-viewer
        ref={modelViewerRef}
        src={asset.src}
        alt={asset.name || '3D Model'}
        camera-controls
        auto-rotate={autoRotate}
        exposure={exposure}
        shadow-intensity="1"
        shadow-softness="1"
        environment-image="neutral"
        ar={enableAR}
        ar-modes="webxr scene-viewer quick-look"
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'transparent',
          '--poster-color': 'transparent'
        }}
      >
        {/* AR Button */}
        {enableAR && arSupported && (
          <button 
            slot="ar-button"
            className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-full flex items-center gap-2 shadow-lg"
          >
            <Smartphone className="w-4 h-4" />
            View in AR
          </button>
        )}

        {/* Hotspots */}
        {hotspots.map((hotspot, index) => (
          <button
            key={hotspot.id || index}
            slot={`hotspot-${index}`}
            data-position={hotspot.position || '0m 0.5m 0m'}
            data-normal={hotspot.normal || '0m 1m 0m'}
            onClick={() => onHotspotClick?.(hotspot)}
            className="w-8 h-8 rounded-full bg-cyan-500 border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
          >
            <span className="text-white text-xs font-bold">{index + 1}</span>
          </button>
        ))}
      </model-viewer>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">Loading 3D Model...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
          <div className="text-center">
            <Box className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      {showControls && !isLoading && !error && (
        <>
          {/* Top Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Badge className="bg-black/60 text-white border-0">
              <Box className="w-3 h-3 mr-1" />
              3D Model
            </Badge>
            
            {enableAR && arSupported && (
              <Badge className="bg-cyan-500/80 text-black border-0">
                AR Ready
              </Badge>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black/60 backdrop-blur-sm rounded-xl">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleZoomOut}
              className="w-8 h-8 p-0 text-white hover:bg-white/20"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
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
              onClick={() => setAutoRotate(!autoRotate)}
              className={`w-8 h-8 p-0 ${autoRotate ? 'text-cyan-400' : 'text-white'} hover:bg-white/20`}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowWireframe(!showWireframe)}
              className={`w-8 h-8 p-0 ${showWireframe ? 'text-cyan-400' : 'text-white'} hover:bg-white/20`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-white/20" />
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleReset}
              className="w-8 h-8 p-0 text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={toggleFullscreen}
              className="w-8 h-8 p-0 text-white hover:bg-white/20"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Exposure Slider */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 p-2 bg-black/60 backdrop-blur-sm rounded-xl">
            <Sun className="w-4 h-4 text-white" />
            <Slider
              value={[exposure]}
              min={0.1}
              max={2}
              step={0.1}
              onValueChange={([v]) => setExposure(v)}
              className="w-20"
            />
          </div>

          {/* Controls Help */}
          <div className="absolute top-4 left-4 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <Move3D className="w-3 h-3" />
              <span>Drag to rotate • Scroll to zoom</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}