import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Link2,
  AlertCircle,
  Loader2,
  Image,
  Video,
  Music,
  Box as Cube
} from 'lucide-react';
import { UploadFile } from '@/integrations/Core';
import { trackUploadedAsset } from '../utils/assetTracker';

const SUPPORTED_FORMATS = {
  '3d': {
    extensions: ['.glb', '.gltf', '.fbx', '.obj'],
    maxSize: 150 * 1024 * 1024, // 150MB
    icon: Cube,
    label: '3D Models'
  },
  image: {
    extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    maxSize: 25 * 1024 * 1024, // 25MB
    icon: Image,
    label: 'Images'
  },
  video: {
    extensions: ['.mp4', '.webm', '.mov'],
    maxSize: 250 * 1024 * 1024, // 250MB
    icon: Video,
    label: 'Videos'
  },
  audio: {
    extensions: ['.mp3', '.wav', '.ogg'],
    maxSize: 100 * 1024 * 1024, // 100MB
    icon: Music,
    label: 'Audio'
  }
};

export default function AssetInput({ onAssetSubmit, loading = false }) {
  const [activeTab, setActiveTab] = useState('rpm');
  const [rpmUrl, setRpmUrl] = useState('');
  const [validating, setValidating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Validate RPM URL
  const validateRPMUrl = useCallback((url) => {
    if (!url) return false;

    const validPatterns = [
      /^https:\/\/readyplayer\.me\/avatar\//,
      /^https:\/\/models\.readyplayer\.me\/.+\.glb/,
      /^https:\/\/models\.readyplayer\.me\/.+\.vrm/
    ];

    return validPatterns.some(pattern => pattern.test(url));
  }, []);

  // Handle RPM URL submission
  const handleRPMSubmit = async () => {
    if (!rpmUrl.trim()) {
      setError('Please enter a Ready Player Me URL');
      return;
    }

    if (!validateRPMUrl(rpmUrl)) {
      setError('Invalid Ready Player Me URL format');
      return;
    }

    setValidating(true);
    setError(null);

    try {
      // Normalize RPM URL to .glb format
      let finalUrl = rpmUrl.trim();

      if (finalUrl.includes('/avatar/') && !finalUrl.endsWith('.glb')) {
        const avatarId = finalUrl.split('/avatar/')[1].split('?')[0];
        finalUrl = `https://models.readyplayer.me/${avatarId}.glb`;
      }

      // Test if URL is accessible
      const response = await fetch(finalUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('Avatar not accessible');
      }

      onAssetSubmit({
        url: finalUrl,
        type: '3d',
        source: 'rpm',
        title: 'Ready Player Me Avatar'
      });

    } catch (error) {
      setError('Unable to access avatar. Please check the URL.');
    } finally {
      setValidating(false);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);
    setUploadProgress(0);

    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
    const fileType = Object.keys(SUPPORTED_FORMATS).find(key =>
      SUPPORTED_FORMATS[key].extensions.includes(fileExtension)
    );

    if (!fileType) {
      setError(`Unsupported file type: ${fileExtension}. Please check supported formats below.`);
      return;
    }

    const typeConfig = SUPPORTED_FORMATS[fileType];
    if (file.size > typeConfig.maxSize) {
      setError(`File is too large. Max size for ${typeConfig.label} is ${Math.round(typeConfig.maxSize / 1024 / 1024)}MB.`);
      return;
    }

    // Simulate upload progress for better UX
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 95) progress = 95;
        setUploadProgress(progress);
    }, 200);

    try {
      const { file_url } = await UploadFile({ file });
      clearInterval(interval);
      setUploadProgress(100);

      // Track asset in Asset library
      await trackUploadedAsset(file_url, {
        name: file.name,
        type: fileType === '3d' ? '3d_model' : fileType,
        source: 'upload',
        fileSize: file.size,
        mimeType: file.type,
        folder: 'Studio'
      });

      onAssetSubmit({
        url: file_url,
        type: fileType,
        source: 'upload',
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        fileSize: file.size,
        fileName: file.name
      });

    } catch (err) {
      clearInterval(interval);
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
      e.target.value = ''; // Clear input to allow re-uploading same file
    }
  };

  const openFileDialog = () => {
    if (uploadProgress === 0) { // Only allow opening if not currently uploading
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="glass-card neon-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Upload className="w-5 h-5 text-cyan-400" />
          Asset Input
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="rpm" className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Ready Player Me
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              File Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rpm" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Avatar URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={rpmUrl}
                  onChange={(e) => setRpmUrl(e.target.value)}
                  placeholder="https://readyplayer.me/avatar/..."
                  className="bg-black/50 border-gray-600 text-white flex-1"
                  disabled={validating || loading}
                />
                <Button
                  onClick={handleRPMSubmit}
                  disabled={!rpmUrl.trim() || validating || loading}
                  className="btn-neon-primary min-w-[80px]"
                >
                  {validating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Paste your Ready Player Me avatar URL or direct .glb link
              </p>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={openFileDialog}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragActive
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-gray-600 hover:border-gray-500'
              } ${uploadProgress === 0 ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept={Object.values(SUPPORTED_FORMATS).flatMap(f => f.extensions).join(',')}
                disabled={uploadProgress > 0 || loading}
              />
              {uploadProgress > 0 ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
                  <div>
                    <div className="text-sm text-white mb-2">Uploading... {Math.round(uploadProgress)}%</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-white font-medium mb-2">
                    {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                  </div>
                  <div className="text-sm text-gray-400 mb-4">
                    or click to browse files
                  </div>
                  <Button variant="outline" className="neon-border text-cyan-400" disabled={loading}>
                    Choose File
                  </Button>
                </div>
              )}
            </div>

            {/* Supported Formats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {Object.values(SUPPORTED_FORMATS).map(format => {
                const Icon = format.icon;
                return (
                  <div key={format.label} className="bg-black/30 rounded-lg p-3 text-center">
                    <Icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <div className="text-xs font-medium text-white mb-1">
                      {format.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {format.extensions.join(', ')}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      Max {Math.round(format.maxSize / 1024 / 1024)}MB
                    </Badge>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-sm">{error}</span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}