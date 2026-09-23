import React, { useRef, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Film, Music, Mic, Video, Lock, Eye, EyeOff } from 'lucide-react';

const TRACK_CONFIG = {
  video1: { label: 'Video 1', icon: Video, color: '#00D4FF' },
  video2: { label: 'Video 2', icon: Film, color: '#FF3366' },
  audio1: { label: 'Audio 1', icon: Mic, color: '#FFD700' },
  audio2: { label: 'Audio 2', icon: Mic, color: '#00FF88' },
  music: { label: 'Music', icon: Music, color: '#FF3366' },
};

const PIXELS_PER_SECOND = 50; // Base scale

export default function TimelineEditor({
  tracks,
  selectedClip,
  playheadPosition,
  zoom,
  snapToGrid,
  onSelectClip,
  onUpdateClip,
  onRemoveClip,
  onAddClip,
  onPlayheadChange
}) {
  const timelineRef = useRef(null);
  const [draggingClip, setDraggingClip] = useState(null);
  const [trackVisibility, setTrackVisibility] = useState({
    video1: true,
    video2: true,
    audio1: true,
    audio2: true,
    music: true
  });
  
  const scale = PIXELS_PER_SECOND * zoom;
  
  // Calculate total duration
  const totalDuration = Object.values(tracks).reduce((max, trackClips) => {
    return Math.max(max, ...trackClips.map(clip => clip.startTime + clip.duration));
  }, 60);
  
  const handleDrop = (e, trackId) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('asset');
    if (data) {
      try {
        const asset = JSON.parse(data);
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
        const startTime = Math.max(0, x / scale);
        
        onAddClip(asset, trackId);
      } catch (err) {
        console.error('Failed to parse asset data:', err);
      }
    }
  };
  
  const handleClipDragStart = (e, trackId, clip) => {
    setDraggingClip({ trackId, clipId: clip.id });
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleTimelineClick = (e) => {
    if (timelineRef.current && !draggingClip) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
      const time = Math.max(0, x / scale);
      onPlayheadChange(time);
    }
  };
  
  const toggleTrackVisibility = (trackId) => {
    setTrackVisibility(prev => ({
      ...prev,
      [trackId]: !prev[trackId]
    }));
  };

  return (
    <div className="h-full flex flex-col bg-[#0D0D14]">
      {/* Timeline Header */}
      <div className="h-8 border-b border-[#00D4FF]/20 bg-[#0A0A0F] flex">
        <div className="w-40 border-r border-[#00D4FF]/20 flex items-center justify-center">
          <span className="text-[10px] text-[#00D4FF] font-mono uppercase">Track</span>
        </div>
        <div className="flex-1 relative overflow-hidden">
          {/* Time Markers */}
          <div className="absolute inset-0 flex items-center">
            {Array.from({ length: Math.ceil(totalDuration / 5) }).map((_, i) => (
              <div
                key={i}
                className="absolute flex flex-col items-center"
                style={{ left: `${i * 5 * scale}px` }}
              >
                <span className="text-[10px] text-[#00D4FF]/60 font-mono">
                  {Math.floor(i * 5 / 60)}:{String((i * 5) % 60).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tracks */}
      <ScrollArea className="flex-1">
        <div 
          ref={timelineRef}
          className="relative"
          onClick={handleTimelineClick}
        >
          {Object.entries(TRACK_CONFIG).map(([trackId, config]) => {
            const Icon = config.icon;
            const trackClips = tracks[trackId] || [];
            
            return (
              <div
                key={trackId}
                className="h-20 border-b border-[#00D4FF]/10 flex"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, trackId)}
              >
                {/* Track Label */}
                <div 
                  className="w-40 border-r border-[#00D4FF]/20 bg-[#0A0A0F] flex items-center justify-between px-3"
                  style={{ borderLeftColor: config.color, borderLeftWidth: '3px' }}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                    <span className="text-xs text-white font-mono">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0"
                      onClick={() => toggleTrackVisibility(trackId)}
                    >
                      {trackVisibility[trackId] ? (
                        <Eye className="w-3 h-3 text-white/60" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-white/30" />
                      )}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                      <Lock className="w-3 h-3 text-white/40" />
                    </Button>
                  </div>
                </div>
                
                {/* Track Content */}
                <div className="flex-1 relative bg-[#0A0A0F]/30">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: Math.ceil(totalDuration) }).map((_, i) => (
                      <div
                        key={i}
                        className="border-r border-[#00D4FF]/5"
                        style={{ width: `${scale}px` }}
                      />
                    ))}
                  </div>
                  
                  {/* Clips */}
                  {trackVisibility[trackId] && trackClips.map(clip => (
                    <div
                      key={clip.id}
                      draggable
                      onDragStart={(e) => handleClipDragStart(e, trackId, clip)}
                      onClick={() => onSelectClip(clip.id)}
                      className={`absolute top-2 bottom-2 rounded-lg cursor-move overflow-hidden ${
                        selectedClip === clip.id
                          ? 'ring-2 ring-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,0.5)]'
                          : 'ring-1 ring-white/20'
                      }`}
                      style={{
                        left: `${clip.startTime * scale}px`,
                        width: `${clip.duration * scale}px`,
                        background: `linear-gradient(135deg, ${config.color}40 0%, ${config.color}20 100%)`
                      }}
                    >
                      {/* Clip Thumbnail/Waveform */}
                      {clip.thumbnail && (
                        <img 
                          src={clip.thumbnail} 
                          alt="" 
                          className="absolute inset-0 w-full h-full object-cover opacity-50"
                        />
                      )}
                      
                      {/* Clip Label */}
                      <div className="absolute inset-0 flex items-center px-2">
                        <span className="text-xs text-white font-mono truncate">
                          {clip.name}
                        </span>
                      </div>
                      
                      {/* Resize Handles */}
                      <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/20 hover:bg-[#00D4FF]/50" />
                      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/20 hover:bg-[#00D4FF]/50" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-px bg-[#FF3366] pointer-events-none z-10 shadow-[0_0_10px_rgba(255,51,102,0.8)]"
            style={{ left: `${40 * 4 + playheadPosition * scale}px` }}
          >
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#FF3366] rounded-full shadow-[0_0_15px_rgba(255,51,102,0.8)]" />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}