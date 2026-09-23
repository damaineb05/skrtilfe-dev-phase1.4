import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PostCard from './PostCard';
import PostCreator from './PostCreator';
import { Loader2, AlertCircle, Users, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import EmptyState from '@/components/ui/EmptyState';
import { createPageUrl } from '@/utils';

export default function CommunityFeed() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    loadPosts();
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
      console.log('User not authenticated for community feed:', error.message);
      setCurrentUser(null);
    }
  };

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allPosts = await base44.entities.Post.list('-created_date', 50);
      setPosts(allPosts);
    } catch (err) {
      console.error('Failed to load community posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostCreated = () => {
    loadPosts();
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-blue)]" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle size={22} />}
        eyebrow="Connection Error"
        title="Couldn't load the feed"
        description="There was a problem fetching posts. Check your connection and try again."
        cta={{ label: 'Retry', onClick: loadPosts }}
        accentColor="#FF3366"
      />
    );
  }

  return (
    <div className="space-y-6">
      {currentUser && <PostCreator onPostCreated={handlePostCreated} />}
      
      {posts.length === 0 ? (
        <EmptyState
          icon={<Users size={22} />}
          eyebrow="Community Feed"
          title="The feed is empty"
          description="Be the first to drop a post. Share a look, a thought, or a flex."
          cta={currentUser
            ? { label: 'Create a Post', onClick: () => document.querySelector('[data-post-creator]')?.focus?.() }
            : { label: 'Join the Community', href: createPageUrl('Community') }
          }
          accentColor="#00D4FF"
        />
      ) : (
        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <PostCard 
                post={post} 
                currentUser={currentUser}
                onUpdate={loadPosts}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}