import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Check } from 'lucide-react';

const EXPORT_PRESETS = {
  youtube: { name: 'YouTube', width: 1920, height: 1080, bitrate: 8000 },
  tiktok: { name: 'TikTok', width: 1080, height: 1920, bitrate: 6000 },
  instagram: { name: 'Instagram Reel', width: 1080, height: 1920, bitrate: 5000 },
  '4k': { name: '4K Ultra HD', width: 3840, height: 2160, bitrate: 20000 },
  '1080p': { name: 'Full HD 1080p', width: 1920, height: 1080, bitrate: 8000 },
  custom: { name: 'Custom', width: 1920, height: 1080, bitrate: 8000 },
};

export default function ExportModal({ tracks, duration, onClose }) {
  const [preset, setPreset] = useState('1080p');
  const [format, setFormat] = useState('mp4');
  const [fileName, setFileName] = useState('Export');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  
  const selectedPreset = EXPORT_PRESETS[preset];
  
  const handleExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    
    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setExportComplete(true);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0A0A0F] border-[#FFD700]/30">
        <DialogHeader>
          <DialogTitle className="font-mono text-[#FFD700]">
            // EXPORT_PROJECT
          </DialogTitle>
        </DialogHeader>
        
        {!exportComplete ? (
          <div className="space-y-6 py-4">
            {/* File Name */}
            <div>
              <Label className="text-xs text-white/60 font-mono mb-2 block">File Name</Label>
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="bg-[#0D0D14] border-[#00D4FF]/30"
                disabled={isExporting}
              />
            </div>
            
            {/* Preset Selection */}
            <div>
              <Label className="text-xs text-white/60 font-mono mb-2 block">Export Preset</Label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(EXPORT_PRESETS).map(([key, { name }]) => (
                  <button
                    key={key}
                    onClick={() => setPreset(key)}
                    disabled={isExporting}
                    className={`px-4 py-3 rounded-lg text-sm font-mono transition-all ${
                      preset === key
                        ? 'bg-[#00D4FF]/20 border-2 border-[#00D4FF] text-[#00D4FF]'
                        : 'bg-[#0D0D14] border border-[#00D4FF]/20 text-white/60 hover:bg-[#00D4FF]/10'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-white/60 font-mono mb-2 block">Format</Label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  disabled={isExporting}
                  className="w-full bg-[#0D0D14] border border-[#00D4FF]/30 text-white rounded-lg px-3 py-2 text-sm"
                >
                  <option value="mp4">MP4 (H.264)</option>
                  <option value="webm">WebM (VP9)</option>
                  <option value="wav">WAV Audio</option>
                </select>
              </div>
              
              <div>
                <Label className="text-xs text-white/60 font-mono mb-2 block">Quality</Label>
                <Input
                  value={`${selectedPreset.width} × ${selectedPreset.height}`}
                  disabled
                  className="bg-[#0D0D14] border-[#00D4FF]/30"
                />
              </div>
            </div>
            
            {/* Project Info */}
            <div className="p-4 bg-[#0D0D14] rounded-xl border border-[#FFD700]/20">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-white/40 font-mono mb-1">DURATION</p>
                  <p className="text-sm text-[#FFD700] font-bold font-mono">
                    {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 font-mono mb-1">BITRATE</p>
                  <p className="text-sm text-[#00D4FF] font-bold font-mono">
                    {selectedPreset.bitrate} kbps
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 font-mono mb-1">EST. SIZE</p>
                  <p className="text-sm text-[#FF3366] font-bold font-mono">
                    ~{Math.round(duration * selectedPreset.bitrate / 8000)} MB
                  </p>
                </div>
              </div>
            </div>
            
            {/* Progress */}
            {isExporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white/60">Rendering...</span>
                  <span className="text-[#00D4FF]">{exportProgress}%</span>
                </div>
                <div className="h-2 bg-[#0D0D14] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00D4FF] to-[#FF3366] transition-all"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Export Button */}
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isExporting}
                className="border-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="cyber-btn text-black font-bold"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Video
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Export Complete */
          <div className="py-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#00FF88]/20 border-2 border-[#00FF88] flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-[#00FF88]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Export Complete!</h3>
              <p className="text-white/60 text-sm font-mono">
                {fileName}.{format} • {selectedPreset.name}
              </p>
            </div>
            <Button
              onClick={onClose}
              className="cyber-btn text-black font-bold"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}