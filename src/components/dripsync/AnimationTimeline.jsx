import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Plus, Trash2, Copy, Settings, Zap, Clock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AnimationTimeline({ 
  availableAnimations = [],
  sequence = [],
  onSequenceChange,
  onPlay,
  onStop,
  isPlaying = false
}) {
  const [selectedClip, setSelectedClip] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const timelineRef = useRef(null);

  const handleAddClip = (animation) => {
    const newClip = {
      id: Date.now(),
      animation: animation.name,
      animationUrl: animation.url,
      startTime: sequence.length > 0 ? sequence[sequence.length - 1].endTime : 0,
      duration: 2,
      blendIn: 0.2,
      blendOut: 0.2,
      speed: 1,
      loop: false
    };
    newClip.endTime = newClip.startTime + newClip.duration;
    onSequenceChange([...sequence, newClip]);
  };

  const handleRemoveClip = (clipId) => {
    onSequenceChange(sequence.filter(c => c.id !== clipId));
    setSelectedClip(null);
  };

  const handleDuplicateClip = (clip) => {
    const newClip = {
      ...clip,
      id: Date.now(),
      startTime: clip.endTime
    };
    newClip.endTime = newClip.startTime + newClip.duration;
    onSequenceChange([...sequence, newClip]);
  };

  const handleUpdateClip = (clipId, updates) => {
    onSequenceChange(sequence.map(c => {
      if (c.id === clipId) {
        const updated = { ...c, ...updates };
        if ('duration' in updates) {
          updated.endTime = updated.startTime + updated.duration;
        }
        return updated;
      }
      return c;
    }));
  };

  const totalDuration = sequence.reduce((max, clip) => Math.max(max, clip.endTime), 0);

  useEffect(() => {
    if (isPlaying && currentTime < totalDuration) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.016;
          if (next >= totalDuration) {
            onStop();
            return 0;
          }
          return next;
        });
      }, 16);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTime, totalDuration, onStop]);

  return (
    <div className="flex flex-col h-full bg-black/95 backdrop-blur-2xl rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] overflow-hidden">
      <style>{`
        .neon-text {
          text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
        }
        .timeline-grid {
          background-image: linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px);
          background-size: ${50 * zoom}px 100%;
        }
      `}</style>

      {/* Header */}
      <div className="p-4 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400 neon-text" />
            <h3 className="text-lg font-bold text-cyan-400 neon-text uppercase tracking-wider">ANIMATION TIMELINE</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={isPlaying ? onStop : () => onPlay(sequence)}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold border border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.5)]"
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isPlaying ? 'STOP' : 'PLAY'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentTime(0)}
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-cyan-400 font-bold uppercase">ZOOM</Label>
            <Slider
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              min={0.5}
              max={3}
              step={0.1}
              className="w-24"
            />
            <span className="text-xs text-cyan-400 font-mono">{zoom.toFixed(1)}x</span>
          </div>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20">
                <Plus className="w-4 h-4 mr-1" />
                ADD CLIP
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/95 border-purple-500/30">
              {availableAnimations.map(anim => (
                <DropdownMenuItem
                  key={anim.name}
                  onClick={() => handleAddClip(anim)}
                  className="text-purple-400 hover:bg-purple-500/20 cursor-pointer"
                >
                  {anim.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto p-4 timeline-grid relative" ref={timelineRef}>
        {/* Time ruler */}
        <div className="h-8 border-b border-cyan-500/30 mb-2 relative">
          {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full border-l border-cyan-500/20"
              style={{ left: `${i * 50 * zoom}px` }}
            >
              <span className="text-xs text-cyan-400/60 ml-1 font-mono">{i}s</span>
            </div>
          ))}
          {/* Playhead */}
          {isPlaying && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]"
              style={{ left: `${currentTime * 50 * zoom}px` }}
            >
              <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-pink-500 rotate-45 shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
            </div>
          )}
        </div>

        {/* Clips */}
        <div className="space-y-2 min-h-[200px]">
          {sequence.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-cyan-400/30" />
                <p className="text-cyan-400/50 uppercase tracking-wide">ADD CLIPS TO START SEQUENCING</p>
              </div>
            </div>
          ) : (
            sequence.map(clip => (
              <motion.div
                key={clip.id}
                layout
                className={`relative h-16 rounded-lg cursor-pointer transition-all ${
                  selectedClip?.id === clip.id
                    ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                    : 'bg-gray-800/50 border border-cyan-500/20 hover:border-cyan-400/50'
                }`}
                style={{
                  marginLeft: `${clip.startTime * 50 * zoom}px`,
                  width: `${clip.duration * 50 * zoom}px`
                }}
                onClick={() => setSelectedClip(clip)}
              >
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-cyan-400 truncate uppercase">{clip.animation}</p>
                    <p className="text-xs text-gray-400 font-mono">{clip.duration.toFixed(2)}s @ {clip.speed}x</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateClip(clip);
                      }}
                      className="p-1 hover:bg-cyan-500/20 rounded"
                    >
                      <Copy className="w-3 h-3 text-cyan-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveClip(clip.id);
                      }}
                      className="p-1 hover:bg-red-500/20 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Blend indicators */}
                {clip.blendIn > 0 && (
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-400/20 to-transparent"
                    style={{ width: `${(clip.blendIn / clip.duration) * 100}%` }}
                  />
                )}
                {clip.blendOut > 0 && (
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-purple-400/20 to-transparent"
                    style={{ width: `${(clip.blendOut / clip.duration) * 100}%` }}
                  />
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Properties Panel */}
      <AnimatePresence>
        {selectedClip && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-cyan-500/30 bg-gradient-to-b from-gray-900 to-black overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-cyan-400 uppercase">CLIP PROPERTIES</h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-400 mb-1">Duration (s)</Label>
                  <Input
                    type="number"
                    value={selectedClip.duration}
                    onChange={(e) => handleUpdateClip(selectedClip.id, { duration: parseFloat(e.target.value) || 0 })}
                    className="bg-black/50 border-cyan-500/30 text-cyan-400 h-8"
                    step="0.1"
                    min="0.1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-400 mb-1">Speed</Label>
                  <Input
                    type="number"
                    value={selectedClip.speed}
                    onChange={(e) => handleUpdateClip(selectedClip.id, { speed: parseFloat(e.target.value) || 1 })}
                    className="bg-black/50 border-cyan-500/30 text-cyan-400 h-8"
                    step="0.1"
                    min="0.1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-400 mb-1">Blend In (s)</Label>
                  <Input
                    type="number"
                    value={selectedClip.blendIn}
                    onChange={(e) => handleUpdateClip(selectedClip.id, { blendIn: parseFloat(e.target.value) || 0 })}
                    className="bg-black/50 border-cyan-500/30 text-cyan-400 h-8"
                    step="0.05"
                    min="0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-400 mb-1">Blend Out (s)</Label>
                  <Input
                    type="number"
                    value={selectedClip.blendOut}
                    onChange={(e) => handleUpdateClip(selectedClip.id, { blendOut: parseFloat(e.target.value) || 0 })}
                    className="bg-black/50 border-cyan-500/30 text-cyan-400 h-8"
                    step="0.05"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}