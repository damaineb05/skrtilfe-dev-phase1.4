import React from 'react';
import { motion } from 'framer-motion';
import { Music, Box, HelpCircle } from 'lucide-react';

export default function StudioViewport({ asset, className = "" }) {

  const renderAsset = () => {
    if (!asset || !asset.url) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Box className="w-16 h-16 mb-4" />
          <h3 className="text-lg font-semibold text-white">Asset Preview</h3>
          <p className="text-sm">Upload an asset to see it here</p>
        </div>
      );
    }

    switch (asset.type) {
      case '3d':
        return (
          <model-viewer
            src={asset.url}
            alt={asset.title || '3D Model'}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            shadow-intensity="1"
            style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
          ></model-viewer>
        );
      case 'image':
        return (
          <img
            src={asset.url}
            alt={asset.title || 'Image preview'}
            className="w-full h-full object-contain"
          />
        );
      case 'video':
        return (
          <video
            src={asset.url}
            controls
            autoPlay
            loop
            muted
            className="w-full h-full object-contain"
          ></video>
        );
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <Music className="w-24 h-24 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{asset.title || 'Audio Track'}</h3>
            <audio src={asset.url} controls className="w-full max-w-sm"></audio>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <HelpCircle className="w-16 h-16 mb-4" />
            <h3 className="text-lg font-semibold text-white">Unsupported Format</h3>
            <p className="text-sm">Cannot preview this asset type.</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`aspect-square sm:aspect-[4/3] w-full rounded-2xl glass-card neon-border overflow-hidden flex items-center justify-center ${className}`}
    >
      {renderAsset()}
    </motion.div>
  );
}