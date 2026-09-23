import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Eye, ExternalLink } from 'lucide-react';

export default function StoriesReels() {
  const [stories, setStories] = useState([]);
  const [users, setUsers] = useState({});
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadStories();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await Promise.race([
        base44.auth.me(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);
      setCurrentUser(user);
    } catch (error) {
      // Silent failure - stories will work without current user context
      console.log('User context not available for stories:', error.message);
      setCurrentUser(null);
    }
  };

  const loadStories = async () => {
    try {
      // Load all non-archived, non-expired stories
      const allStories = await base44.entities.Story.list('-created_date', 100);
      const now = new Date();
      const activeStories = allStories.filter(story => {
        const expiresAt = new Date(story.expires_at);
        return !story.is_archived && expiresAt > now;
      });

      // Group by user
      const grouped = {};
      for (const story of activeStories) {
        if (!grouped[story.created_by]) {
          grouped[story.created_by] = [];
        }
        grouped[story.created_by].push(story);
      }

      // Load user data
      const userEmails = Object.keys(grouped);
      const userData = {};
      for (const email of userEmails) {
        try {
          const [user] = await base44.entities.User.filter({ email }, '-created_date', 1);
          if (user) userData[email] = user;
        } catch (e) {
          userData[email] = { full_name: email.split('@')[0], email };
        }
      }

      setUsers(userData);
      setStories(grouped);
    } catch (error) {
      console.error('Failed to load stories:', error);
    }
  };

  const markStoryAsViewed = async (story) => {
    if (!currentUser) return;
    
    try {
      // Check if already viewed
      if (story.viewers && story.viewers.includes(currentUser.email)) return;

      // Update story views
      const updatedViewers = [...(story.viewers || []), currentUser.email];
      await base44.entities.Story.update(story.id, {
        views_count: (story.views_count || 0) + 1,
        viewers: updatedViewers
      });

      // Create view record
      await base44.entities.StoryView.create({
        story_id: story.id,
        viewer_email: currentUser.email,
        viewed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to mark story as viewed:', error);
    }
  };

  const openStoryViewer = (userEmail, index = 0) => {
    const userStories = stories[userEmail];
    if (userStories && userStories[index]) {
      setSelectedStory({ userEmail, stories: userStories });
      setCurrentIndex(index);
      setProgress(0);
      markStoryAsViewed(userStories[index]);
    }
  };

  const closeStoryViewer = () => {
    setSelectedStory(null);
    setCurrentIndex(0);
    setProgress(0);
  };

  const nextStory = () => {
    if (!selectedStory) return;
    const userStories = selectedStory.stories;
    
    if (currentIndex < userStories.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setProgress(0);
      markStoryAsViewed(userStories[nextIndex]);
    } else {
      // Move to next user's stories
      const userEmails = Object.keys(stories);
      const currentUserIndex = userEmails.indexOf(selectedStory.userEmail);
      if (currentUserIndex < userEmails.length - 1) {
        const nextUser = userEmails[currentUserIndex + 1];
        openStoryViewer(nextUser, 0);
      } else {
        closeStoryViewer();
      }
    }
  };

  const previousStory = () => {
    if (!selectedStory) return;
    
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setProgress(0);
      markStoryAsViewed(selectedStory.stories[prevIndex]);
    } else {
      // Move to previous user's stories
      const userEmails = Object.keys(stories);
      const currentUserIndex = userEmails.indexOf(selectedStory.userEmail);
      if (currentUserIndex > 0) {
        const prevUser = userEmails[currentUserIndex - 1];
        const prevUserStories = stories[prevUser];
        openStoryViewer(prevUser, prevUserStories.length - 1);
      }
    }
  };

  // Auto-advance story progress
  useEffect(() => {
    if (!selectedStory) return;

    const currentStory = selectedStory.stories[currentIndex];
    const duration = currentStory.duration || 5;
    const interval = 50;
    const increment = (interval / (duration * 1000)) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [selectedStory, currentIndex]);

  return (
    <>
      <div className="theme-bg-card theme-border rounded-xl p-4">
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* User Stories */}
          {Object.entries(stories).map(([userEmail, userStories]) => {
            const user = users[userEmail] || { full_name: userEmail.split('@')[0], email: userEmail };
            const hasViewed = userStories.every(story => story.viewers && story.viewers.includes(currentUser?.email));

            return (
              <motion.div
                key={userEmail}
                className="flex-shrink-0 w-20 text-center cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openStoryViewer(userEmail)}
              >
                <div className={`w-16 h-16 mx-auto rounded-full p-1 transition-transform group-hover:scale-110 ${
                  hasViewed 
                    ? 'bg-gray-600' 
                    : 'bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500'
                }`}>
                  <div className="w-full h-full bg-[var(--bg-primary)] rounded-full overflow-hidden flex items-center justify-center">
                    {user.profile_image_url ? (
                      <img src={user.profile_image_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs theme-text truncate mt-2">{user.full_name}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {selectedStory && (
          <Dialog open={!!selectedStory} onOpenChange={closeStoryViewer}>
            <DialogContent className="max-w-md h-[90vh] p-0 bg-black border-none">
              <div className="relative w-full h-full">
                {/* Progress Bars */}
                <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-20">
                  {selectedStory.stories.map((_, idx) => (
                    <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-100"
                        style={{ 
                          width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%'
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Header */}
                <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {users[selectedStory.userEmail]?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-white font-medium text-sm">
                      {users[selectedStory.userEmail]?.full_name || 'User'}
                    </span>
                    <span className="text-white/70 text-xs">
                      {new Date(selectedStory.stories[currentIndex].created_date).toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeStoryViewer}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Story Content */}
                <div className="w-full h-full flex items-center justify-center bg-black">
                  {selectedStory.stories[currentIndex].media_type === 'image' ? (
                    <img 
                      src={selectedStory.stories[currentIndex].media_url} 
                      alt="Story" 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <video 
                      src={selectedStory.stories[currentIndex].media_url} 
                      className="max-w-full max-h-full object-contain"
                      autoPlay
                      muted
                    />
                  )}
                </div>

                {/* Caption */}
                {selectedStory.stories[currentIndex].caption && (
                  <div className="absolute bottom-20 left-0 right-0 px-6">
                    <p className="text-white text-center drop-shadow-lg">
                      {selectedStory.stories[currentIndex].caption}
                    </p>
                  </div>
                )}

                {/* Swipe Up Link */}
                {selectedStory.stories[currentIndex].link_url && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                    <Button
                      onClick={() => window.open(selectedStory.stories[currentIndex].link_url, '_blank')}
                      className="bg-white/90 text-black hover:bg-white px-6"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {selectedStory.stories[currentIndex].link_text || 'Swipe Up'}
                    </Button>
                  </div>
                )}

                {/* Navigation Areas */}
                <div className="absolute inset-0 flex">
                  <div className="w-1/3 h-full cursor-pointer" onClick={previousStory} />
                  <div className="w-1/3 h-full" />
                  <div className="w-1/3 h-full cursor-pointer" onClick={nextStory} />
                </div>

                {/* Navigation Buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={previousStory}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                  disabled={currentIndex === 0 && Object.keys(stories).indexOf(selectedStory.userEmail) === 0}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextStory}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>

                {/* View Count */}
                <div className="absolute bottom-2 right-4 flex items-center gap-1 text-white/80 text-sm z-20">
                  <Eye className="w-4 h-4" />
                  <span>{selectedStory.stories[currentIndex].views_count || 0}</span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}