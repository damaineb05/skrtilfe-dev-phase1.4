import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Sliders, Trash2 } from 'lucide-react';

export default function ClipInspector({ clip, onUpdate }) {
  if (!clip) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Settings className="w-12 h-12 text-white/20 mb-2" />
        <p className="text-sm text-white/40 text-center font-mono">
          Select a clip to edit properties
        </p>
      </div>
    );
  }
  
  const isVideo = clip.type === 'video' || clip.type === 'image';
  const isAudio = clip.type === 'audio' || clip.type === 'video';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#FF3366]/20">
        <h3 className="font-bold text-white font-mono text-sm flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#FF3366]" />
          <span className="text-[#FF3366]">// </span>CLIP_INSPECTOR
        </h3>
        <p className="text-xs text-white/40 mt-1 font-mono truncate">{clip.name}</p>
      </div>
      
      {/* Properties */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Timing */}
          <div className="space-y-3">
            <h4 className="text-xs text-[#00D4FF] uppercase tracking-wider font-mono">// Timing</h4>
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-white/60 font-mono">Start Time</Label>
                <Input
                  type="number"
                  value={clip.startTime.toFixed(2)}
                  onChange={(e) => onUpdate({ startTime: parseFloat(e.target.value) })}
                  className="bg-[#0A0A0F] border-[#00D4FF]/30 h-8 text-xs"
                  step="0.1"
                />
              </div>
              <div>
                <Label className="text-xs text-white/60 font-mono">Duration</Label>
                <Input
                  type="number"
                  value={clip.duration.toFixed(2)}
                  onChange={(e) => onUpdate({ duration: parseFloat(e.target.value) })}
                  className="bg-[#0A0A0F] border-[#00D4FF]/30 h-8 text-xs"
                  step="0.1"
                />
              </div>
            </div>
          </div>
          
          {/* Audio Properties */}
          {isAudio && (
            <div className="space-y-3">
              <h4 className="text-xs text-[#FFD700] uppercase tracking-wider font-mono">// Audio</h4>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-white/60 font-mono flex items-center justify-between">
                    Volume
                    <span className="text-[#FFD700]">{Math.round(clip.volume * 100)}%</span>
                  </Label>
                  <Slider
                    value={[clip.volume]}
                    onValueChange={([v]) => onUpdate({ volume: v })}
                    max={2}
                    step={0.01}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-white/60 font-mono">Fade In (s)</Label>
                  <Input
                    type="number"
                    defaultValue="0"
                    className="bg-[#0A0A0F] border-[#FFD700]/30 h-8 text-xs"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-white/60 font-mono">Fade Out (s)</Label>
                  <Input
                    type="number"
                    defaultValue="0"
                    className="bg-[#0A0A0F] border-[#FFD700]/30 h-8 text-xs"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Video Properties */}
          {isVideo && (
            <div className="space-y-3">
              <h4 className="text-xs text-[#FF3366] uppercase tracking-wider font-mono">// Video</h4>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-white/60 font-mono flex items-center justify-between">
                    Opacity
                    <span className="text-[#FF3366]">{Math.round(clip.opacity * 100)}%</span>
                  </Label>
                  <Slider
                    value={[clip.opacity]}
                    onValueChange={([v]) => onUpdate({ opacity: v })}
                    max={1}
                    step={0.01}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-white/60 font-mono">Scale</Label>
                  <Input
                    type="number"
                    defaultValue="1"
                    className="bg-[#0A0A0F] border-[#FF3366]/30 h-8 text-xs"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-white/60 font-mono">Rotation (deg)</Label>
                  <Input
                    type="number"
                    defaultValue="0"
                    className="bg-[#0A0A0F] border-[#FF3366]/30 h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Effects */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs text-[#00FF88] uppercase tracking-wider font-mono">// Effects</h4>
              <Button size="sm" variant="ghost" className="h-6 text-xs text-[#00FF88]">
                + Add
              </Button>
            </div>
            <div className="text-xs text-white/40 text-center py-4">
              No effects applied
            </div>
          </div>
          
          {/* Actions */}
          <div className="pt-4 border-t border-[#FF3366]/20">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                // Handle delete
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Clip
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}