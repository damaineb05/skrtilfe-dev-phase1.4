import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Plus,
  Send,
  Image as ImageIcon,
  X,
  Check,
  RefreshCw,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  Users,
  Eye,
  Link2,
  Sparkles,
  Zap,
  Globe,
  Bookmark,
  BarChart3
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

// Platform configurations
const PLATFORMS = {
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    color: '#000000',
    bgColor: 'bg-black',
    maxLength: 280,
    features: ['text', 'image', 'video', 'poll', 'thread']
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    color: '#E4405F',
    bgColor: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    maxLength: 2200,
    features: ['image', 'video', 'carousel', 'story', 'reel']
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ),
    color: '#000000',
    bgColor: 'bg-black',
    maxLength: 2200,
    features: ['video', 'duet', 'stitch']
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    color: '#FF0000',
    bgColor: 'bg-red-600',
    maxLength: 5000,
    features: ['video', 'shorts', 'live', 'community']
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
      </svg>
    ),
    color: '#5865F2',
    bgColor: 'bg-indigo-600',
    maxLength: 2000,
    features: ['text', 'image', 'video', 'embed']
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    color: '#0A66C2',
    bgColor: 'bg-blue-700',
    maxLength: 3000,
    features: ['text', 'image', 'video', 'article', 'poll']
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.88-.73 2.108-1.146 3.456-1.17 1.273-.02 2.378.254 3.31.765.026-.503.01-1.005-.048-1.499-.132-1.107-.477-1.963-1.027-2.545-.588-.623-1.497-.975-2.702-1.046l-.142.92c.858.05 1.487.29 1.871.713.404.446.64 1.108.7 1.968a7.7 7.7 0 0 1-.015 1.143c-.596-.199-1.244-.31-1.92-.322-1.694.03-3.197.568-4.231 1.514-1.074.982-1.623 2.324-1.545 3.78.078 1.456.786 2.724 1.994 3.569 1.093.765 2.5 1.112 3.96 1.034 1.254-.065 2.32-.51 3.17-1.32.63-.6 1.09-1.364 1.384-2.287.357.158.695.353 1.012.585 1.381 1.012 1.723 2.467 1.295 3.756-.49 1.48-1.834 2.714-3.884 3.434-1.105.388-2.345.6-3.73.633zM8.81 14.77c-.05.868.342 1.56 1.102 1.95.648.332 1.482.468 2.35.385 1.166-.112 2.06-.537 2.66-1.266.524-.636.86-1.48 1.012-2.514-.728-.39-1.587-.598-2.545-.58-1.077.017-1.972.339-2.593.932-.64.612-.943 1.355-.986 2.093z"/>
      </svg>
    ),
    color: '#000000',
    bgColor: 'bg-black',
    maxLength: 500,
    features: ['text', 'image', 'video']
  }
};

// Connected Account Card
function ConnectedAccountCard({ platform, isConnected, stats, onConnect, onDisconnect }) {
  const config = PLATFORMS[platform];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border transition-all ${
        isConnected 
          ? 'bg-zinc-800/50 border-green-500/30' 
          : 'bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${config.bgColor} p-2 text-white`}>
            <Icon />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">{config.name}</h4>
            {isConnected && stats?.username && (
              <p className="text-xs text-gray-400">@{stats.username}</p>
            )}
          </div>
        </div>
        
        {isConnected ? (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Check className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        ) : (
          <Button 
            size="sm" 
            onClick={onConnect}
            className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs"
          >
            <Link2 className="w-3 h-3 mr-1" />
            Connect
          </Button>
        )}
      </div>

      {isConnected && stats && (
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-700/50">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{stats.followers || 0}</p>
            <p className="text-[10px] text-gray-500 uppercase">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{stats.posts || 0}</p>
            <p className="text-[10px] text-gray-500 uppercase">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{stats.engagement || '0%'}</p>
            <p className="text-[10px] text-gray-500 uppercase">Engage</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Unified Post Composer
function UnifiedComposer({ connectedPlatforms, onPost }) {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [media, setMedia] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const fileInputRef = useRef(null);

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMedia(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: e.target.result,
          type: file.type.startsWith('video') ? 'video' : 'image',
          file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (id) => {
    setMedia(prev => prev.filter(m => m.id !== id));
  };

  const handlePost = async () => {
    if (!content.trim() && media.length === 0) return;
    if (selectedPlatforms.length === 0) return;

    setIsPosting(true);
    try {
      // Create internal post
      await base44.entities.Post.create({
        content,
        media_files: media.map(m => ({ url: m.url, type: m.type })),
        platforms: selectedPlatforms,
        scheduled_at: isScheduled ? scheduleDate : null
      });

      onPost?.();
      setContent('');
      setMedia([]);
      setSelectedPlatforms([]);
      setIsScheduled(false);
      setScheduleDate('');
    } catch (error) {
      console.error('Failed to post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const minMaxLength = selectedPlatforms.length > 0
    ? Math.min(...selectedPlatforms.map(p => PLATFORMS[p]?.maxLength || 280))
    : 280;

  return (
    <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden">
      {/* Platform Selector */}
      <div className="p-3 border-b border-zinc-700/50">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Post to:</p>
        <div className="flex flex-wrap gap-2">
          {connectedPlatforms.map(platformId => {
            const config = PLATFORMS[platformId];
            if (!config) return null;
            const Icon = config.icon;
            const isSelected = selectedPlatforms.includes(platformId);
            
            return (
              <button
                key={platformId}
                onClick={() => togglePlatform(platformId)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-orange-400/20 border border-orange-400/50 text-orange-400'
                    : 'bg-zinc-700/50 border border-zinc-600 text-gray-400 hover:text-white'
                }`}
              >
                <div className="w-4 h-4">
                  <Icon />
                </div>
                <span className="text-xs font-medium">{config.name}</span>
                {isSelected && <Check className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Input */}
      <div className="p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Share across all your platforms..."
          className="bg-transparent border-0 text-white placeholder-gray-500 resize-none min-h-[120px] focus:ring-0"
        />

        {/* Media Preview */}
        {media.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {media.map(m => (
              <div key={m.id} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                {m.type === 'video' ? (
                  <video src={m.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                )}
                <button
                  onClick={() => removeMedia(m.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Character Count */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700/50">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*"
              multiple
              className="hidden"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-white"
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              Media
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsScheduled(!isScheduled)}
              className={isScheduled ? 'text-orange-400' : 'text-gray-400 hover:text-white'}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Schedule
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs ${content.length > minMaxLength ? 'text-red-400' : 'text-gray-500'}`}>
              {content.length}/{minMaxLength}
            </span>
            <Button
              onClick={handlePost}
              disabled={isPosting || (!content.trim() && media.length === 0) || selectedPlatforms.length === 0}
              className="bg-orange-400 hover:bg-orange-500 text-black font-bold"
            >
              {isPosting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  {isScheduled ? 'Schedule' : 'Post'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Schedule Picker */}
        <AnimatePresence>
          {isScheduled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t border-zinc-700/50"
            >
              <Input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="bg-zinc-700/50 border-zinc-600 text-white"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Platform Timeline
function PlatformTimeline({ platform, posts }) {
  const config = PLATFORMS[platform];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-lg ${config.bgColor} p-1.5 text-white`}>
          <Icon />
        </div>
        <h3 className="font-bold text-white">{config.name} Timeline</h3>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-8 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
          <Globe className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50"
            >
              <p className="text-white text-sm mb-3">{post.content}</p>
              
              {post.media_files?.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {post.media_files.slice(0, 4).map((m, i) => (
                    <div key={i} className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-700">
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-gray-500 text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {post.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> {post.comments_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" /> {post.reposts_count || 0}
                  </span>
                </div>
                <span>{new Date(post.created_date).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Unified Timeline - All Platforms
function UnifiedTimeline({ posts, onRefresh, isLoading }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-orange-400" />
          Unified Feed
        </h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRefresh}
          disabled={isLoading}
          className="text-gray-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No posts yet</p>
          <p className="text-gray-500 text-sm mt-1">Create your first post above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => {
            const platforms = post.platforms || [];
            
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-all"
              >
                {/* Platform Badges */}
                <div className="flex items-center gap-2 mb-3">
                  {platforms.map(p => {
                    const config = PLATFORMS[p];
                    if (!config) return null;
                    const Icon = config.icon;
                    return (
                      <div key={p} className={`w-5 h-5 rounded ${config.bgColor} p-0.5 text-white`}>
                        <Icon />
                      </div>
                    );
                  })}
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(post.created_date).toLocaleString()}
                  </span>
                </div>

                <p className="text-white text-sm mb-3">{post.content}</p>

                {post.media_files?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {post.media_files.slice(0, 4).map((m, i) => (
                      <div key={i} className="aspect-video rounded-lg overflow-hidden bg-zinc-700">
                        {m.type === 'video' ? (
                          <video src={m.url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={m.url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-zinc-700/50">
                  <div className="flex items-center gap-4 text-gray-500">
                    <button className="flex items-center gap-1 hover:text-pink-400 transition-colors">
                      <Heart className="w-4 h-4" /> 
                      <span className="text-xs">{post.likes_count || 0}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">{post.comments_count || 0}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-green-400 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs">{post.reposts_count || 0}</span>
                    </button>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-gray-500 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-zinc-900 border-zinc-700">
                      <DropdownMenuItem className="text-gray-300 hover:text-white">
                        <Eye className="w-4 h-4 mr-2" /> View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:text-white">
                        <Bookmark className="w-4 h-4 mr-2" /> Save
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-zinc-700" />
                      <DropdownMenuItem className="text-red-400 hover:text-red-300">
                        <X className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Analytics Overview
function AnalyticsOverview({ connectedPlatforms, stats }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-white flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-orange-400" />
        Performance Overview
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-500 uppercase">Total Followers</span>
          </div>
          <p className="text-2xl font-black text-white">{stats.totalFollowers || 0}</p>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +2.4%
          </p>
        </div>

        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-500 uppercase">Impressions</span>
          </div>
          <p className="text-2xl font-black text-white">{stats.impressions || '0'}</p>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12.1%
          </p>
        </div>

        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-xs text-gray-500 uppercase">Engagement</span>
          </div>
          <p className="text-2xl font-black text-white">{stats.engagementRate || '0%'}</p>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +5.7%
          </p>
        </div>

        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-500 uppercase">Posts This Week</span>
          </div>
          <p className="text-2xl font-black text-white">{stats.postsThisWeek || 0}</p>
          <p className="text-xs text-gray-400">across {connectedPlatforms.length} platforms</p>
        </div>
      </div>
    </div>
  );
}

// Main Social Hub Component
export default function SocialHub({ onPostCreated }) {
  const [activeTab, setActiveTab] = useState('compose');
  const [connectedPlatforms, setConnectedPlatforms] = useState(['twitter', 'instagram']);
  const [platformStats, setPlatformStats] = useState({});
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [selectedTimelinePlatform, setSelectedTimelinePlatform] = useState('all');

  useEffect(() => {
    loadPosts();
    // Simulate connected platforms stats
    setPlatformStats({
      twitter: { username: 'skrtlife', followers: 12400, posts: 847, engagement: '4.2%' },
      instagram: { username: 'skrtlife.io', followers: 8900, posts: 234, engagement: '6.1%' }
    });
  }, []);

  const loadPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const data = await base44.entities.Post.list('-created_date', 20);
      setPosts(data || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleConnect = (platformId) => {
    // In real app, this would trigger OAuth flow
    setConnectedPlatforms(prev => [...prev, platformId]);
    setPlatformStats(prev => ({
      ...prev,
      [platformId]: { username: 'demo', followers: 0, posts: 0, engagement: '0%' }
    }));
  };

  const handleDisconnect = (platformId) => {
    setConnectedPlatforms(prev => prev.filter(id => id !== platformId));
    setPlatformStats(prev => {
      const { [platformId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handlePostCreated = () => {
    loadPosts();
    onPostCreated?.();
  };

  const totalStats = {
    totalFollowers: Object.values(platformStats).reduce((sum, s) => sum + (s.followers || 0), 0),
    impressions: '45.2K',
    engagementRate: '5.2%',
    postsThisWeek: posts.filter(p => {
      const postDate = new Date(p.created_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return postDate > weekAgo;
    }).length
  };

  const filteredPosts = selectedTimelinePlatform === 'all'
    ? posts
    : posts.filter(p => p.platforms?.includes(selectedTimelinePlatform));

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="bg-zinc-800/50 border-b border-zinc-700 rounded-none p-1 gap-1 flex-shrink-0">
          <TabsTrigger value="compose" className="data-[state=active]:bg-orange-400/20 data-[state=active]:text-orange-400 text-xs">
            <Plus className="w-3 h-3 mr-1" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-orange-400/20 data-[state=active]:text-orange-400 text-xs">
            <Globe className="w-3 h-3 mr-1" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="accounts" className="data-[state=active]:bg-orange-400/20 data-[state=active]:text-orange-400 text-xs">
            <Link2 className="w-3 h-3 mr-1" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-400/20 data-[state=active]:text-orange-400 text-xs">
            <BarChart3 className="w-3 h-3 mr-1" />
            Stats
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="compose" className="p-4 space-y-4 m-0">
            <UnifiedComposer 
              connectedPlatforms={connectedPlatforms}
              onPost={handlePostCreated}
            />
            <UnifiedTimeline 
              posts={posts.slice(0, 5)} 
              onRefresh={loadPosts}
              isLoading={isLoadingPosts}
            />
          </TabsContent>

          <TabsContent value="timeline" className="p-4 m-0">
            {/* Platform Filter */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedTimelinePlatform('all')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
                  selectedTimelinePlatform === 'all'
                    ? 'bg-orange-400/20 border border-orange-400/50 text-orange-400'
                    : 'bg-zinc-800/50 border border-zinc-700 text-gray-400 hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium">All</span>
              </button>
              
              {connectedPlatforms.map(platformId => {
                const config = PLATFORMS[platformId];
                if (!config) return null;
                const Icon = config.icon;
                const isSelected = selectedTimelinePlatform === platformId;
                
                return (
                  <button
                    key={platformId}
                    onClick={() => setSelectedTimelinePlatform(platformId)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
                      isSelected
                        ? 'bg-orange-400/20 border border-orange-400/50 text-orange-400'
                        : 'bg-zinc-800/50 border border-zinc-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="w-4 h-4">
                      <Icon />
                    </div>
                    <span className="text-xs font-medium">{config.name}</span>
                  </button>
                );
              })}
            </div>

            {selectedTimelinePlatform === 'all' ? (
              <UnifiedTimeline 
                posts={filteredPosts} 
                onRefresh={loadPosts}
                isLoading={isLoadingPosts}
              />
            ) : (
              <PlatformTimeline 
                platform={selectedTimelinePlatform}
                posts={filteredPosts}
              />
            )}
          </TabsContent>

          <TabsContent value="accounts" className="p-4 space-y-3 m-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Connected Accounts</h3>
              <Badge className="bg-zinc-700 text-gray-300">
                {connectedPlatforms.length} / {Object.keys(PLATFORMS).length}
              </Badge>
            </div>

            <div className="space-y-3">
              {Object.keys(PLATFORMS).map(platformId => (
                <ConnectedAccountCard
                  key={platformId}
                  platform={platformId}
                  isConnected={connectedPlatforms.includes(platformId)}
                  stats={platformStats[platformId]}
                  onConnect={() => handleConnect(platformId)}
                  onDisconnect={() => handleDisconnect(platformId)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="p-4 m-0">
            <AnalyticsOverview 
              connectedPlatforms={connectedPlatforms}
              stats={totalStats}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}