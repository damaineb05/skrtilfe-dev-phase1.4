
import React, { useState, useEffect, useRef } from 'react';
import { Post } from '@/entities/Post';
import { User as UserEntity } from '@/entities/User';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share,
  User,
  Clock,
  Video,
  Twitter,
  Instagram,
  Youtube,
  Music,
  Linkedin,
  MessageSquare,
  Github,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const platformIcons = {
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music,
  linkedin: Linkedin,
  discord: MessageSquare,
  github: Github
};

const platformColors = {
  twitter: 'text-blue-400',
  instagram: 'text-pink-500',
  youtube: 'text-red-500',
  tiktok: 'text-white',
  linkedin: 'text-blue-600',
  discord: 'text-indigo-400',
  github: 'text-gray-300'
};

export default function Timeline() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const savedLoadTimeline = useRef(); // Declare ref for stable function

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const [timelinePosts, loggedInUser] = await Promise.all([
        Post.list('-created_date', 50),
        UserEntity.me().catch(() => null) // Attempt to fetch current user, handle if not logged in
      ]);
      
      setCurrentUser(loggedInUser);
      setPosts(timelinePosts);
      
      // Load user data for all post creators
      const userEmails = [...new Set(timelinePosts.map(post => post.created_by))];
      const userData = {};
      
      for (const email of userEmails) {
        if (users[email]) { // Avoid re-fetching if user data already exists
          userData[email] = users[email];
          continue;
        }
        try {
          const user = await UserEntity.filter({ email }, '-created_date', 1);
          if (user[0]) {
            userData[email] = user[0];
          }
        } catch (e) {
          // If we can't load user data, create a fallback
          userData[email] = { 
            full_name: email.split('@')[0], 
            email,
            profile_image_url: null 
          };
        }
      }
      
      setUsers(prev => ({...prev, ...userData})); // Merge new user data with existing
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  // To fix the dependency issue, we store the latest `loadTimeline` function in a ref.
  // This ensures the interval callback is always up-to-date without needing to be in the dependency array.
  useEffect(() => {
    savedLoadTimeline.current = loadTimeline;
  });

  useEffect(() => {
    // This effect runs only once on mount to set up the interval.
    const tick = () => {
      savedLoadTimeline.current();
    }
    tick(); // Run on mount
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures this runs only once.

  const handleLike = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      try {
        await Post.update(postId, { 
          likes_count: (post.likes_count || 0) + 1 
        });
        // Optimistic update
        setPosts(posts.map(p => p.id === postId ? {...p, likes_count: (p.likes_count || 0) + 1} : p));
      } catch (error) {
        console.error('Failed to like post:', error);
      }
    }
  };

  const handleRepost = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      try {
        await Post.update(postId, { 
          reposts_count: (post.reposts_count || 0) + 1 
        });
        // Optimistic update
        setPosts(posts.map(p => p.id === postId ? {...p, reposts_count: (p.reposts_count || 0) + 1} : p));
      } catch (error) {
        console.error('Failed to repost:', error);
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await Post.delete(postId);
        setPosts(posts => posts.filter(p => p.id !== postId)); // Optimistic update: remove the post from the list
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert("There was an error deleting the post. Please try again.");
      }
    }
  };

  if (loading && posts.length === 0) { // Only show skeleton if loading AND no posts are loaded yet
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-[var(--bg-secondary)] border-[var(--border)] animate-pulse">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="w-10 h-10 bg-gray-700 rounded-full mr-3"></div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-700 rounded w-24"></div>
                <div className="h-3 bg-gray-700 rounded w-16"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="display text-2xl text-[var(--text-primary)]">Community Timeline</h2>
        <Badge variant="outline" className="text-accent-cyan border-accent-cyan">
          Live Updates
        </Badge>
      </div>

      {posts.length === 0 && !loading ? ( // Show "No posts yet" only if no posts AND not loading
        <Card className="bg-[var(--bg-secondary)] border-[var(--border)] text-center py-12">
          <CardContent>
            <MessageCircle className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No posts yet</h3>
            <p className="text-[var(--text-secondary)]">Be the first to share something with the community!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => {
            const user = users[post.created_by] || { 
              full_name: post.created_by.split('@')[0], 
              email: post.created_by,
              profile_image_url: null 
            };
            // Check if the current user is the author of the post
            const canDelete = currentUser && currentUser.email === post.created_by;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="bg-[var(--bg-secondary)] border-[var(--border)] hover:border-cyan-400/30 transition-colors">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan to-accent-magenta flex items-center justify-center shrink-0 overflow-hidden mr-3">
                      {user.profile_image_url ? (
                        <img src={user.profile_image_url} alt={user.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-black" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {user.full_name || 'Anonymous User'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(post.created_date), 'MMM d, h:mm a')}</span>
                        {post.platforms && post.platforms.length > 1 && (
                          <div className="flex gap-1 ml-2">
                            {post.platforms.filter(p => p !== 'skrtlife').map(platform => {
                              const Icon = platformIcons[platform];
                              return Icon ? (
                                <Icon key={platform} className={`w-3 h-3 ${platformColors[platform]}`} />
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    {canDelete && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-[var(--text-secondary)] w-8 h-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-graphite border-gray-700 text-white">
                          <DropdownMenuItem 
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-400 hover:!text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-[var(--text-primary)] mb-4 whitespace-pre-wrap">{post.content}</p>

                    {/* Media Display */}
                    {post.media_files && post.media_files.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {post.media_files.slice(0, 4).map((media, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-800">
                            {media.type === 'image' ? (
                              <img 
                                src={media.url} 
                                alt={media.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => window.open(media.url, '_blank')}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                <Video className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            {post.media_files.length > 4 && idx === 3 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                                +{post.media_files.length - 4} more
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Engagement Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                      <div className="flex items-center gap-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className="text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10 p-2"
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          <span className="text-sm">{post.likes_count || 0}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[var(--text-secondary)] hover:text-blue-400 hover:bg-blue-400/10 p-2"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">{post.comments_count || 0}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRepost(post.id)}
                          className="text-[var(--text-secondary)] hover:text-green-400 hover:bg-green-400/10 p-2"
                        >
                          <Repeat2 className="w-4 h-4 mr-1" />
                          <span className="text-sm">{post.reposts_count || 0}</span>
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--text-secondary)] hover:text-accent-cyan hover:bg-accent-cyan/10 p-2"
                      >
                        <Share className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
