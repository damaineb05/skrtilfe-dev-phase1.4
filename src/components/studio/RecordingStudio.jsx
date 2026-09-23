import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Mic, Square, Play, Pause, SkipBack, SkipForward, Upload, Download,
  Video, ZoomIn, ZoomOut, Grid3x3, Radio, X
} from 'lucide-react';

import AssetLibrary from './AssetLibrary';
import TimelineEditor from './TimelineEditor';
import ClipInspector from './ClipInspector';
import MediaPreviewBox from './MediaPreviewBox';
import AudioRecorder from './AudioRecorder';
import VideoRecorder from './VideoRecorder';
import ExportModal from './ExportModal';

export default function RecordingStudio() {
  const [isMobile, setIsMobile] = useState(false);
  
  // Asset Library State
  const [assets, setAssets] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  
  // Timeline State
  const [tracks, setTracks] = useState({
    video1: [],
    video2: [],
    audio1: [],
    audio2: [],
    music: []
  });
  const [selectedClip, setSelectedClip] = useState(null);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  
  // Recording State
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  
  // Export State
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Preview State
  const [previewClip, setPreviewClip] = useState(null);
  const [previewDuration, setPreviewDuration] = useState(0);
  
  // Mobile State
  const [showMobileAssets, setShowMobileAssets] = useState(false);
  const [showMobileInspector, setShowMobileInspector] = useState(false);

  // Check if mobile
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Add asset to library
  const handleAddAsset = (asset) => {
    setAssets(prev => [...prev, { ...asset, id: Date.now() }]);
  };
  
  // Add clip to timeline
  const handleAddClipToTimeline = (asset, trackId) => {
    const newClip = {
      id: Date.now(),
      assetId: asset.id,
      name: asset.name,
      type: asset.type,
      url: asset.url,
      thumbnail: asset.thumbnail,
      duration: asset.duration || 5,
      startTime: playheadPosition,
      volume: 1,
      opacity: 1,
      effects: []
    };
    
    setTracks(prev => ({
      ...prev,
      [trackId]: [...prev[trackId], newClip]
    }));
  };
  
  // Update clip properties
  const handleUpdateClip = (trackId, clipId, updates) => {
    setTracks(prev => ({
      ...prev,
      [trackId]: prev[trackId].map(clip => 
        clip.id === clipId ? { ...clip, ...updates } : clip
      )
    }));
  };
  
  // Remove clip from timeline
  const handleRemoveClip = (trackId, clipId) => {
    setTracks(prev => ({
      ...prev,
      [trackId]: prev[trackId].filter(clip => clip.id !== clipId)
    }));
  };
  
  // Playback controls
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleStop = () => {
    setIsPlaying(false);
    setPlayheadPosition(0);
  };
  
  // File import
  const fileInputRef = useRef(null);
  const handleFileImport = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const type = file.type.startsWith('video/') ? 'video' :
                   file.type.startsWith('audio/') ? 'audio' :
                   file.type.startsWith('image/') ? 'image' : 'other';
      
      const url = URL.createObjectURL(file);
      
      handleAddAsset({
        name: file.name,
        type,
        url,
        thumbnail: type === 'image' ? url : null,
        duration: 0, // Will be calculated on load
        size: file.size
      });
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0A0A0F] overflow-hidden">
      {/* Top Toolbar */}
      <div className={`${isMobile ? 'h-12' : 'h-14'} flex-shrink-0 border-b border-[#00D4FF]/20 bg-[#0A0A0F]/80 backdrop-blur-xl flex items-center justify-between ${isMobile ? 'px-2' : 'px-4'}`}>
        <div className="flex items-center gap-2">
          {!isMobile && (
            <>
              <Radio className="w-5 h-5 text-[#FF3366]" />
              <span className="font-bold text-white text-lg font-mono hidden md:block">RECORDING_STUDIO</span>
              <div className="h-6 w-px bg-[#00D4FF]/20 mx-2" />
            </>
          )}
          {isMobile ? (
            <Button
              size="sm"
              variant="outline"
              className="border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/10 h-8 px-2"
              onClick={() => setShowMobileAssets(!showMobileAssets)}
            >
              <Upload className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-[#FF3366]/30 text-[#FF3366] hover:bg-[#FF3366]/10"
                onClick={() => setShowAudioRecorder(true)}
              >
                <Mic className="w-4 h-4 mr-2" />
                Record Audio
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/10"
                onClick={() => setShowVideoRecorder(true)}
              >
                <Video className="w-4 h-4 mr-2" />
                Record Video
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            onClick={handlePlayPause}
            className={`${isMobile ? 'h-8 px-2' : ''} ${isPlaying ? 
              'bg-[#FF3366] hover:bg-[#FF3366]/80 text-white' : 
              'bg-[#00D4FF]/20 border border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/30'
            }`}
          >
            {isPlaying ? <Pause className={`w-4 h-4 ${!isMobile && 'mr-2'}`} /> : <Play className={`w-4 h-4 ${!isMobile && 'mr-2'}`} />}
            {!isMobile && (isPlaying ? 'Pause' : 'Play')}
          </Button>
          
          {!isMobile && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
                onClick={handleStop}
              >
                <Square className="w-4 h-4" />
              </Button>
              
              <div className="h-6 w-px bg-[#00D4FF]/20 mx-2" />
            </>
          )}
          
          <Button
            onClick={() => setShowExportModal(true)}
            className={`cyber-btn text-black font-bold ${isMobile ? 'h-8 px-2' : ''}`}
          >
            <Download className={`w-4 h-4 ${!isMobile && 'mr-2'}`} />
            {!isMobile && 'Export'}
          </Button>
        </div>
      </div>
      
      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel - Asset Library */}
        {isMobile ? (
          showMobileAssets && (
            <div className="absolute inset-0 z-40 bg-[#0A0A0F] border-r border-[#00D4FF]/20">
              <div className="h-12 border-b border-[#00D4FF]/20 flex items-center justify-between px-3">
                <span className="text-white font-bold text-sm">ASSET_LIBRARY</span>
                <Button size="sm" variant="ghost" onClick={() => setShowMobileAssets(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <AssetLibrary
                assets={assets}
                selectedFolder={selectedFolder}
                onFolderChange={setSelectedFolder}
                onAddAsset={handleAddAsset}
                onDragStart={(asset) => {}}
              />
            </div>
          )
        ) : (
          <div className="w-80 border-r border-[#00D4FF]/20 cyber-panel flex flex-col">
            <AssetLibrary
              assets={assets}
              selectedFolder={selectedFolder}
              onFolderChange={setSelectedFolder}
              onAddAsset={handleAddAsset}
              onDragStart={(asset) => {}}
            />
          </div>
        )}
        
        {/* Center Panel - Preview & Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Media Preview Box */}
          <div className={`${isMobile ? 'h-[40%]' : 'h-[45%]'} border-b border-[#00D4FF]/20`}>
            <MediaPreviewBox
              clip={previewClip || (selectedClip ? tracks[Object.keys(tracks).find(key => 
                tracks[key].some(c => c.id === selectedClip)
              )]?.find(c => c.id === selectedClip) : null)}
              playheadPosition={playheadPosition}
              isPlaying={isPlaying}
              duration={previewDuration}
            />
          </div>
          
          {/* Playback Controls */}
          <div className={`${isMobile ? 'h-10' : 'h-12'} flex-shrink-0 border-b border-[#00D4FF]/20 bg-[#0A0A0F]/60 flex items-center justify-between ${isMobile ? 'px-2' : 'px-4'}`}>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => setPlayheadPosition(Math.max(0, playheadPosition - 1))} className={isMobile ? 'h-8 w-8 p-0' : ''}>
                <SkipBack className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handlePlayPause} className={isMobile ? 'h-8 w-8 p-0' : ''}>
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPlayheadPosition(playheadPosition + 1)} className={isMobile ? 'h-8 w-8 p-0' : ''}>
                <SkipForward className="w-3.5 h-3.5" />
              </Button>
              <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-[#00D4FF] font-mono ml-1`}>
                {Math.floor(playheadPosition / 60)}:{String(Math.floor(playheadPosition % 60)).padStart(2, '0')}
              </div>
            </div>
            
            <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
              {!isMobile && (
                <div className="flex items-center gap-2">
                  <Grid3x3 className="w-4 h-4 text-[#FFD700]" />
                  <Switch
                    checked={snapToGrid}
                    onCheckedChange={setSnapToGrid}
                    className="data-[state=checked]:bg-[#FFD700]"
                  />
                  <span className="text-xs text-white/60 font-mono">SNAP</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => setTimelineZoom(Math.max(0.5, timelineZoom - 0.25))} className={isMobile ? 'h-8 w-8 p-0' : ''}>
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                {!isMobile && <span className="text-xs text-[#00D4FF] font-mono w-12 text-center">{Math.round(timelineZoom * 100)}%</span>}
                <Button size="sm" variant="ghost" onClick={() => setTimelineZoom(Math.min(3, timelineZoom + 0.25))} className={isMobile ? 'h-8 w-8 p-0' : ''}>
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Timeline Editor */}
          <div className="flex-1 overflow-hidden">
            <TimelineEditor
              tracks={tracks}
              selectedClip={selectedClip}
              playheadPosition={playheadPosition}
              zoom={timelineZoom}
              snapToGrid={snapToGrid}
              onSelectClip={setSelectedClip}
              onUpdateClip={handleUpdateClip}
              onRemoveClip={handleRemoveClip}
              onAddClip={handleAddClipToTimeline}
              onPlayheadChange={setPlayheadPosition}
            />
          </div>
        </div>
        
        {/* Right Panel - Clip Inspector */}
        {isMobile ? (
          showMobileInspector && selectedClip && (
            <div className="absolute inset-0 z-40 bg-[#0A0A0F] border-l border-[#FF3366]/20">
              <div className="h-12 border-b border-[#FF3366]/20 flex items-center justify-between px-3">
                <span className="text-white font-bold text-sm">CLIP_INSPECTOR</span>
                <Button size="sm" variant="ghost" onClick={() => setShowMobileInspector(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <ClipInspector
                clip={tracks[Object.keys(tracks).find(key => 
                  tracks[key].some(c => c.id === selectedClip)
                )]?.find(c => c.id === selectedClip)}
                onUpdate={(updates) => {
                  if (selectedClip) {
                    const trackId = Object.keys(tracks).find(key => 
                      tracks[key].some(c => c.id === selectedClip)
                    );
                    if (trackId) {
                      handleUpdateClip(trackId, selectedClip, updates);
                    }
                  }
                }}
              />
            </div>
          )
        ) : (
          <div className="w-80 border-l border-[#00D4FF]/20 cyber-panel-red flex flex-col">
            <ClipInspector
              clip={selectedClip ? tracks[Object.keys(tracks).find(key => 
                tracks[key].some(c => c.id === selectedClip)
              )]?.find(c => c.id === selectedClip) : null}
              onUpdate={(updates) => {
                if (selectedClip) {
                  const trackId = Object.keys(tracks).find(key => 
                    tracks[key].some(c => c.id === selectedClip)
                  );
                  if (trackId) {
                    handleUpdateClip(trackId, selectedClip, updates);
                  }
                }
              }}
            />
          </div>
        )}
      </div>
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        onChange={handleFileImport}
        className="hidden"
      />
      
      {/* Modals */}
      {showAudioRecorder && (
        <AudioRecorder
          onClose={() => setShowAudioRecorder(false)}
          onSave={handleAddAsset}
        />
      )}
      
      {showVideoRecorder && (
        <VideoRecorder
          onClose={() => setShowVideoRecorder(false)}
          onSave={handleAddAsset}
        />
      )}
      
      {showExportModal && (
        <ExportModal
          tracks={tracks}
          duration={previewDuration}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}