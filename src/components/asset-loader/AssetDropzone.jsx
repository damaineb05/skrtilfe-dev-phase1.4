import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Link as LinkIcon, 
  X, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  Cuboid, 
  File,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { loadAsset, detectAssetType } from './assetLoader';

const ACCEPTED_TYPES = {
  image: '.jpg,.jpeg,.png,.gif,.webp,.svg',
  video: '.mp4,.webm,.mov,.avi',
  audio: '.mp3,.wav,.ogg,.flac,.aac',
  model: '.glb,.gltf'
};

const ALL_ACCEPTED = Object.values(ACCEPTED_TYPES).join(',');

const TYPE_ICONS = {
  image: FileImage,
  gif: FileImage,
  video: FileVideo,
  audio: FileAudio,
  model: Cuboid,
  unknown: File
};

export default function AssetDropzone({ 
  onAssetLoaded, 
  onError, 
  acceptedTypes = 'all',
  maxSize = 500 * 1024 * 1024, // 500MB default
  multiple = false,
  className = ''
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const acceptString = acceptedTypes === 'all' 
    ? ALL_ACCEPTED 
    : ACCEPTED_TYPES[acceptedTypes] || ALL_ACCEPTED;

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFile = async (file) => {
    // Validate file size
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // Validate file type if restricted
    if (acceptedTypes !== 'all') {
      const type = detectAssetType(file);
      if (type !== acceptedTypes && type !== 'unknown') {
        throw new Error(`Invalid file type. Expected ${acceptedTypes}`);
      }
    }

    const asset = await loadAsset(file, (p) => {
      setProgress(p.percent);
    });

    return asset;
  };

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);
    setSuccess(null);

    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length === 0) return;

    const filesToProcess = multiple ? files : [files[0]];

    setIsLoading(true);
    setProgress(0);

    try {
      for (const file of filesToProcess) {
        const asset = await processFile(file);
        onAssetLoaded?.(asset);
      }
      setSuccess(`${filesToProcess.length} asset(s) loaded successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      onError?.(err);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [multiple, maxSize, acceptedTypes, onAssetLoaded, onError]);

  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError(null);
    setSuccess(null);
    setIsLoading(true);
    setProgress(0);

    try {
      for (const file of files) {
        const asset = await processFile(file);
        onAssetLoaded?.(asset);
      }
      setSuccess(`${files.length} asset(s) loaded successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      onError?.(err);
    } finally {
      setIsLoading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [maxSize, acceptedTypes, onAssetLoaded, onError]);

  const handleUrlSubmit = useCallback(async () => {
    if (!urlInput.trim()) return;

    setError(null);
    setSuccess(null);
    setIsLoading(true);
    setProgress(0);

    try {
      const asset = await loadAsset(urlInput.trim(), (p) => {
        setProgress(p.percent);
      });
      onAssetLoaded?.(asset);
      setSuccess('Asset loaded from URL');
      setUrlInput('');
      setShowUrlInput(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      onError?.(err);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [urlInput, onAssetLoaded, onError]);

  return (
    <div className={`relative ${className}`}>
      {/* Main Dropzone */}
      <motion.div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? 'rgb(6, 182, 212)' : 'rgba(255, 255, 255, 0.1)'
        }}
        className={`
          relative border-2 border-dashed rounded-2xl p-8
          bg-gradient-to-br from-gray-900/50 to-gray-800/50
          backdrop-blur-sm transition-all cursor-pointer
          hover:border-cyan-500/50 hover:bg-gray-800/50
          ${isDragging ? 'border-cyan-400 bg-cyan-500/10' : ''}
          ${isLoading ? 'pointer-events-none opacity-70' : ''}
        `}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          {isLoading ? (
            <>
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
              <p className="text-white font-medium mb-2">Loading asset...</p>
              <div className="w-48">
                <Progress value={progress} className="h-2" />
              </div>
              <p className="text-gray-400 text-sm mt-2">{progress}%</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">
                {isDragging ? 'Drop your files here' : 'Upload Assets'}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Drag & drop files or click to browse
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {Object.entries(TYPE_ICONS).slice(0, -1).map(([type, Icon]) => (
                  <div key={type} className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-full">
                    <Icon className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400 capitalize">{type}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs">
                Max size: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </>
          )}
        </div>

        {/* Drag overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-cyan-500/10 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <div className="text-center">
                <Upload className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-bounce" />
                <p className="text-cyan-400 font-bold text-lg">Drop to upload</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* URL Input Toggle */}
      <div className="mt-4 flex items-center justify-center">
        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
        >
          <LinkIcon className="w-4 h-4" />
          {showUrlInput ? 'Hide URL input' : 'Or load from URL / IPFS'}
        </button>
      </div>

      {/* URL Input */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https:// or ipfs://..."
                className="flex-1 bg-gray-800/50 border-gray-700 text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <Button
                onClick={handleUrlSubmit}
                disabled={isLoading || !urlInput.trim()}
                className="bg-cyan-500 hover:bg-cyan-600 text-black"
              >
                Load
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4 text-red-400" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}