import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileImage, 
  FileVideo, 
  FileAudio, 
  Cuboid, 
  File,
  MapPin,
  ExternalLink,
  Download,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import ImagePreview from './previews/ImagePreview';
import GifPreview from './previews/GifPreview';
import VideoPreview from './previews/VideoPreview';
import AudioPreview from './previews/AudioPreview';
import ModelPreview from './previews/ModelPreview';

const TYPE_ICONS = {
  image: FileImage,
  gif: FileImage,
  video: FileVideo,
  audio: FileAudio,
  model: Cuboid,
  unknown: File
};

const TYPE_LABELS = {
  image: 'Image',
  gif: 'Animated GIF',
  video: 'Video',
  audio: 'Audio',
  model: '3D Model',
  unknown: 'Unknown'
};

export default function UnifiedAssetPreview({
  asset,
  hotspots = [],
  onHotspotClick,
  onAddHotspot,
  onRemoveAsset,
  onDownload,
  showInfo = true,
  showActions = true,
  enableHotspots = true,
  enableAR = true,
  className = ''
}) {
  const [showHotspotDialog, setShowHotspotDialog] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [isAddingHotspot, setIsAddingHotspot] = useState(false);

  const handleHotspotClick = useCallback((hotspot) => {
    setSelectedHotspot(hotspot);
    setShowHotspotDialog(true);
    onHotspotClick?.(hotspot);
  }, [onHotspotClick]);

  const handlePreviewClick = useCallback((e) => {
    if (!isAddingHotspot || !enableHotspots) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newHotspot = {
      id: `hotspot_${Date.now()}`,
      x: Math.round(x),
      y: Math.round(y),
      label: `Hotspot ${hotspots.length + 1}`,
      description: ''
    };

    onAddHotspot?.(newHotspot);
    setIsAddingHotspot(false);
  }, [isAddingHotspot, enableHotspots, hotspots.length, onAddHotspot]);

  const renderPreview = () => {
    if (!asset) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No asset loaded</p>
          </div>
        </div>
      );
    }

    const previewProps = {
      asset,
      hotspots: enableHotspots ? hotspots : [],
      onHotspotClick: handleHotspotClick,
      showControls: true,
      className: 'flex-1'
    };

    switch (asset.type) {
      case 'image':
        return <ImagePreview {...previewProps} />;
      case 'gif':
        return <GifPreview {...previewProps} />;
      case 'video':
        return <VideoPreview {...previewProps} />;
      case 'audio':
        return <AudioPreview {...previewProps} showVisualizer />;
      case 'model':
        return <ModelPreview {...previewProps} enableAR={enableAR} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Unsupported asset type</p>
              <p className="text-sm mt-2">Type: {asset.type || 'unknown'}</p>
            </div>
          </div>
        );
    }
  };

  const Icon = TYPE_ICONS[asset?.type] || File;
  const typeLabel = TYPE_LABELS[asset?.type] || 'Unknown';

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={`flex flex-col bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      {showInfo && asset && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-medium truncate">{asset.name || 'Unnamed Asset'}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Badge variant="outline" className="border-gray-700 text-gray-400">
                  {typeLabel}
                </Badge>
                <span>{formatFileSize(asset.size)}</span>
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center gap-1">
              {enableHotspots && ['image', 'gif', 'video'].includes(asset.type) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAddingHotspot(!isAddingHotspot)}
                  className={`w-8 h-8 p-0 ${isAddingHotspot ? 'text-cyan-400 bg-cyan-400/10' : 'text-gray-400'}`}
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              )}
              
              {onDownload && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDownload(asset)}
                  className="w-8 h-8 p-0 text-gray-400 hover:text-white"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}

              {onRemoveAsset && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveAsset(asset)}
                  className="w-8 h-8 p-0 text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hotspot Adding Mode Indicator */}
      <AnimatePresence>
        {isAddingHotspot && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-cyan-500/10 border-b border-cyan-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 text-sm">
                <MapPin className="w-4 h-4" />
                Click on the preview to add a hotspot
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAddingHotspot(false)}
                className="h-6 px-2 text-cyan-400"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Area */}
      <div 
        className={`flex-1 min-h-[300px] ${isAddingHotspot ? 'cursor-crosshair' : ''}`}
        onClick={handlePreviewClick}
      >
        {renderPreview()}
      </div>

      {/* Hotspots List */}
      {enableHotspots && hotspots.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white text-sm font-medium">Hotspots ({hotspots.length})</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {hotspots.map((hotspot, index) => (
              <button
                key={hotspot.id || index}
                onClick={() => handleHotspotClick(hotspot)}
                className="flex items-center gap-1.5 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-white transition-colors"
              >
                <span className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] font-bold">
                  {index + 1}
                </span>
                {hotspot.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Metadata Display */}
      {asset?.metadata && (
        <div className="px-4 py-3 border-t border-gray-800">
          <h4 className="text-white text-sm font-medium mb-2">Metadata</h4>
          <div className="space-y-1 text-xs">
            {asset.metadata.name && (
              <div className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="text-white">{asset.metadata.name}</span>
              </div>
            )}
            {asset.metadata.description && (
              <div>
                <span className="text-gray-400">Description:</span>
                <p className="text-white mt-1">{asset.metadata.description}</p>
              </div>
            )}
            {asset.metadata.attributes?.length > 0 && (
              <div className="mt-2">
                <span className="text-gray-400">Attributes:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {asset.metadata.attributes.map((attr, i) => (
                    <Badge key={i} variant="outline" className="border-gray-700 text-xs">
                      {attr.trait_type}: {attr.value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hotspot Detail Dialog */}
      <Dialog open={showHotspotDialog} onOpenChange={setShowHotspotDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              {selectedHotspot?.label || 'Hotspot'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-400">
              Position: {selectedHotspot?.x}%, {selectedHotspot?.y}%
            </div>
            {selectedHotspot?.description && (
              <p className="text-gray-300">{selectedHotspot.description}</p>
            )}
            {selectedHotspot?.link && (
              <a 
                href={selectedHotspot.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cyan-400 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Open Link
              </a>
            )}
            {selectedHotspot?.action && (
              <Button 
                onClick={() => selectedHotspot.action()}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black"
              >
                {selectedHotspot.actionLabel || 'Perform Action'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}