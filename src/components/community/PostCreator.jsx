import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { 
  Image, 
  Video, 
  BarChart2, 
  Smile, 
  Calendar,
  X,
  Loader2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const EMOJI_LIST = ['😀', '😂', '🔥', '❤️', '👍', '🎉', '💯', '✨', '🚀', '💎', '👀', '🙌', '💪', '🤝', '⚡', '🎨', '🎮', '💰', '🌟', '😎'];

export default function PostCreator({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [scheduledDate, setScheduledDate] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (e) {
      setCurrentUser(null);
    }
  };

  // If not logged in, don't show post creator
  if (!currentUser) {
    return null;
  }

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      if (mediaFiles.length >= 4) break;
      
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setMediaFiles(prev => [...prev, { 
          url: file_url, 
          type: 'image', 
          name: file.name 
        }]);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    e.target.value = '';
  };

  const handleVideoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setMediaFiles(prev => [...prev, { 
        url: file_url, 
        type: 'video', 
        name: file.name 
      }]);
    } catch (err) {
      console.error('Video upload failed:', err);
    }
    e.target.value = '';
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addEmoji = (emoji) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions(prev => [...prev, '']);
    }
  };

  const updatePollOption = (index, value) => {
    setPollOptions(prev => prev.map((opt, i) => i === index ? value : opt));
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handlePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;

    setIsPosting(true);
    try {
      const postData = {
        content: content.trim(),
        media_files: mediaFiles,
        platforms: ['skrtlife'],
        likes_count: 0,
        comments_count: 0,
        reposts_count: 0
      };

      if (showPoll && pollOptions.filter(o => o.trim()).length >= 2) {
        postData.poll = {
          options: pollOptions.filter(o => o.trim()),
          votes: {}
        };
      }

      if (scheduledDate) {
        postData.scheduled_at = scheduledDate.toISOString();
      }

      await base44.entities.Post.create(postData);
      
      // Reset form
      setContent('');
      setMediaFiles([]);
      setShowPoll(false);
      setPollOptions(['', '']);
      setScheduledDate(null);
      
      onPostCreated?.();
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsPosting(false);
    }
  };

  const userAvatar = currentUser?.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.full_name || 'U')}&background=06b6d4&color=000`;

  return (
    <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-black font-bold flex-shrink-0 overflow-hidden">
          {currentUser?.avatar_url ? (
            <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            currentUser?.full_name?.charAt(0) || 'U'
          )}
        </div>
        
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full bg-transparent text-lg text-white placeholder-gray-500 focus:outline-none resize-none min-h-[60px]"
            rows={2}
          />

          {/* Media Preview */}
          <AnimatePresence>
            {mediaFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 grid gap-2"
                style={{ 
                  gridTemplateColumns: mediaFiles.length === 1 ? '1fr' : 'repeat(2, 1fr)' 
                }}
              >
                {mediaFiles.map((media, index) => (
                  <div key={index} className="relative rounded-xl overflow-hidden bg-zinc-800">
                    {media.type === 'image' ? (
                      <img 
                        src={media.url} 
                        alt="" 
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <video 
                        src={media.url} 
                        className="w-full h-40 object-cover"
                        controls
                      />
                    )}
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center hover:bg-black transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Poll Creator */}
          <AnimatePresence>
            {showPoll && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 border border-zinc-700 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Poll</span>
                  <button 
                    onClick={() => setShowPoll(false)}
                    className="text-gray-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        onClick={() => removePollOption(index)}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <button
                    onClick={addPollOption}
                    className="flex items-center gap-1 text-cyan-400 text-sm hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    Add option
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scheduled Date Display */}
          {scheduledDate && (
            <div className="mt-3 flex items-center gap-2 text-sm text-cyan-400 bg-cyan-500/10 px-3 py-2 rounded-lg">
              <Calendar className="w-4 h-4" />
              <span>Scheduled for {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString()}</span>
              <button onClick={() => setScheduledDate(null)} className="ml-auto hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-1">
              {/* Image Upload */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <button 
                onClick={() => imageInputRef.current?.click()}
                disabled={mediaFiles.length >= 4}
                className="p-2 text-cyan-400 rounded-full hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Add images"
              >
                <Image className="w-5 h-5" />
              </button>

              {/* Video Upload */}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
              <button 
                onClick={() => videoInputRef.current?.click()}
                disabled={mediaFiles.length >= 4}
                className="p-2 text-cyan-400 rounded-full hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Add video"
              >
                <Video className="w-5 h-5" />
              </button>

              {/* Poll Toggle */}
              <button 
                onClick={() => setShowPoll(!showPoll)}
                className={`p-2 rounded-full hover:bg-cyan-500/10 transition-colors ${showPoll ? 'text-cyan-400 bg-cyan-500/10' : 'text-cyan-400'}`}
                title="Create poll"
              >
                <BarChart2 className="w-5 h-5" />
              </button>

              {/* Emoji Picker */}
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <button 
                    className="p-2 text-cyan-400 rounded-full hover:bg-cyan-500/10 transition-colors"
                    title="Add emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 bg-zinc-900 border-zinc-700">
                  <div className="grid grid-cols-5 gap-1">
                    {EMOJI_LIST.map((emoji, i) => (
                      <button
                        key={i}
                        onClick={() => addEmoji(emoji)}
                        className="text-2xl p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Schedule */}
              <Popover open={showScheduler} onOpenChange={setShowScheduler}>
                <PopoverTrigger asChild>
                  <button 
                    className={`p-2 rounded-full hover:bg-cyan-500/10 transition-colors ${scheduledDate ? 'text-cyan-400 bg-cyan-500/10' : 'text-cyan-400'}`}
                    title="Schedule post"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700">
                  <CalendarComponent
                    mode="single"
                    selected={scheduledDate}
                    onSelect={(date) => {
                      setScheduledDate(date);
                      setShowScheduler(false);
                    }}
                    disabled={(date) => date < new Date()}
                    className="bg-zinc-900 text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button 
              onClick={handlePost}
              disabled={(!content.trim() && mediaFiles.length === 0) || isPosting}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-full px-5 disabled:opacity-50"
            >
              {isPosting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : scheduledDate ? (
                'Schedule'
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}