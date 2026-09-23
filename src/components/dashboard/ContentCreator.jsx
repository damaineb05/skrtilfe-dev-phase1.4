
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Send,
  Image as ImageIcon,
  Video,
  X,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ContentCreator({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState(null);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadedFiles = [];
    let hasErrors = false;

    try {
      for (const file of files) {
        try {
          // Check file size (limit to 50MB)
          const maxSize = 50 * 1024 * 1024; // 50MB
          if (file.size > maxSize) {
            throw new Error(`${file.name} exceeds 50MB limit`);
          }

          // Upload with timeout and retry
          let retries = 0;
          const maxRetries = 2;
          let uploaded = false;

          while (retries <= maxRetries && !uploaded) {
            try {
              const uploadPromise = base44.integrations.Core.UploadFile({ file });
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Upload timeout')), 120000) // 2 minute timeout
              );

              const { file_url } = await Promise.race([uploadPromise, timeoutPromise]);
              
              uploadedFiles.push({
                url: file_url,
                name: file.name,
                type: file.type.startsWith('image/') ? 'image' : 'video',
                size: file.size
              });
              
              uploaded = true;
            } catch (retryError) {
              retries++;
              if (retries > maxRetries) {
                throw retryError;
              }
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
          }
        } catch (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError);
          hasErrors = true;
        }
      }

      if (uploadedFiles.length > 0) {
        setMediaFiles(prev => [...prev, ...uploadedFiles]);
        setPostStatus({ 
          type: hasErrors ? 'warning' : 'success', 
          message: hasErrors ? 'SOME FILES FAILED' : 'FILES UPLOADED' 
        });
      } else {
        setPostStatus({ type: 'error', message: 'ALL UPLOADS FAILED' });
      }
      
      setTimeout(() => setPostStatus(null), 5000);
    } catch (error) {
      console.error('File upload failed:', error);
      setPostStatus({ 
        type: 'error', 
        message: error.message?.includes('timeout') ? 'UPLOAD TIMEOUT' : 'UPLOAD FAILED' 
      });
      setTimeout(() => setPostStatus(null), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const removeMediaFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      setPostStatus({ type: 'error', message: 'NO CONTENT' });
      setTimeout(() => setPostStatus(null), 3000);
      return;
    }

    setIsPosting(true);
    setPostStatus(null);

    try {
      await base44.entities.Post.create({
        content,
        media_files: mediaFiles,
        platforms: ['skrtlife']
      });

      setPostStatus({
        type: 'success',
        message: 'POST TRANSMITTED'
      });

      setContent('');
      setMediaFiles([]);

      if (onPostCreated) {
        onPostCreated();
      }

    } catch (error) {
      console.error('Posting failed:', error);
      setPostStatus({ type: 'error', message: 'TRANSMISSION FAILED' });
    } finally {
      setIsPosting(false);
      setTimeout(() => {
        setPostStatus(null);
      }, 5000);
    }
  };

  const getStatusIcon = () => {
    switch (postStatus?.type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default: return null;
    }
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono text-gray-500 tracking-wider">"BROADCAST SYSTEM"</p>
          <div className="flex items-center gap-2">
            {postStatus && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700">
                {getStatusIcon()}
                <span className="text-xs font-mono text-white">{postStatus.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 lg:p-6 space-y-4">
        {/* Textarea */}
        <Textarea
          placeholder="What's your status?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 min-h-[100px] md:min-h-[120px] resize-none focus:border-cyan-400/50 focus:ring-cyan-400/20 font-mono text-sm"
          maxLength={280}
        />

        {/* Character Count */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${content.length > 250 ? 'text-red-400' : 'text-gray-500'}`}>
              {content.length}/280
            </span>
            {mediaFiles.length > 0 && (
              <Badge className="bg-cyan-400/20 text-cyan-400 border-cyan-400/30 font-mono text-[10px]">
                {mediaFiles.length} MEDIA
              </Badge>
            )}
          </div>
        </div>

        {/* Media Preview */}
        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {mediaFiles.map((file, index) => (
              <div key={index} className="relative bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  {file.type === 'image' ? (
                    <ImageIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  ) : (
                    <Video className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  )}
                  <span className="text-xs font-mono text-gray-400 truncate flex-1">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMediaFile(index)}
                  className="absolute top-2 right-2 w-6 h-6 p-0 bg-red-400/20 hover:bg-red-400/30 text-red-400 rounded"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-zinc-800">
          <Input
            type="file"
            id="media-upload"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <label htmlFor="media-upload" className="flex-1 sm:flex-initial">
            <Button
              variant="outline"
              className="w-full bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-800 hover:border-cyan-400/50 font-mono text-xs h-10"
              disabled={isUploading}
              asChild
            >
              <span>
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                ATTACH MEDIA
              </span>
            </Button>
          </label>

          <Button
            onClick={handlePost}
            disabled={isPosting || (!content.trim() && mediaFiles.length === 0)}
            className="flex-1 sm:flex-initial bg-cyan-400 hover:bg-cyan-500 text-black font-bold font-mono text-xs h-10"
          >
            {isPosting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                TRANSMITTING...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                BROADCAST
              </>
            )}
          </Button>
        </div>

        {/* Info Note */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] font-mono text-blue-400 mb-1">CROSS-PLATFORM SYNC</p>
                <p className="text-xs text-gray-400">
                  Enable external platforms in{' '}
                  <Link to={createPageUrl("SocialIntegrations")} className="text-cyan-400 hover:text-cyan-300 underline font-bold">
                    Settings
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
