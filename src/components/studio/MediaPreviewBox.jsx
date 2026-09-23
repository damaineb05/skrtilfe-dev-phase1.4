import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Maximize2, Grid3x3, Monitor } from 'lucide-react';

export default function MediaPreviewBox({ 
  clip, 
  playheadPosition, 
  isPlaying,
  duration 
}) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (videoRef.current && clip?.type === 'video') {
      videoRef.current.currentTime = playheadPosition;
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
    
    if (audioRef.current && clip?.type === 'audio') {
      audioRef.current.currentTime = playheadPosition;
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [clip, playheadPosition, isPlaying]);
  
  const renderPreview = () => {
    if (!clip) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <Monitor className="w-16 h-16 text-white/20" />
          <div className="text-center">
            <p className="text-white/60 font-mono text-sm">PREVIEW_WINDOW</p>
            <p className="text-white/40 text-xs mt-1">Select a clip to preview</p>
          </div>
        </div>
      );
    }
    
    switch (clip.type) {
      case 'video':
        return (
          <video
            ref={videoRef}
            src={clip.url}
            className="max-w-full max-h-full object-contain"
            muted
          />
        );
      
      case 'image':
        return (
          <img
            src={clip.url}
            alt={clip.name}
            className="max-w-full max-h-full object-contain"
          />
        );
      
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center gap-6 p-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#FF3366] flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-[#0A0A0F] flex items-center justify-center">
                <div className={`w-12 h-12 rounded-full bg-[#00D4FF] ${isPlaying ? 'animate-pulse' : ''}`} />
              </div>
            </div>
            <p className="text-white font-bold text-lg font-mono">{clip.name}</p>
            <audio ref={audioRef} src={clip.url} />
            
            {/* Waveform Visualizer */}
            <canvas
              ref={canvasRef}
              className="w-full max-w-2xl h-24 bg-[#0A0A0F]/50 rounded-xl"
            />
          </div>
        );
      
      default:
        return (
          <div className="text-white/40 text-sm">
            Unsupported media type
          </div>
        );
    }
  };

  return (
    <div className="h-full relative bg-[#0A0A0F] flex items-center justify-center">
      {/* Safe Margins Grid (optional) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-[5%] border border-[#FFD700]/20 border-dashed" />
        <div className="absolute inset-[10%] border border-[#00D4FF]/10 border-dashed" />
      </div>
      
      {/* Preview Content */}
      <div className="relative z-10 max-w-full max-h-full flex items-center justify-center">
        {renderPreview()}
      </div>
      
      {/* Preview Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Button size="sm" variant="outline" className="border-white/20 bg-black/40 backdrop-blur-sm">
          <Grid3x3 className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" className="border-white/20 bg-black/40 backdrop-blur-sm">
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Preview Info */}
      {clip && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/60 backdrop-blur-xl rounded-lg px-4 py-2 border border-[#00D4FF]/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60 font-mono">{clip.name}</span>
              <span className="text-xs text-[#00D4FF] font-mono">
                {Math.floor(playheadPosition)}s / {Math.floor(clip.duration)}s
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}