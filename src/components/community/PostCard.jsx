import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, MoreVertical, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CommentSection from './CommentSection';
import AuthGate from '../events/AuthGate';

export default function PostCard({ post, currentUser, onUpdate }) {
  const [postAuthor, setPostAuthor] = useState(null);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    loadAuthor();
  }, [post.created_by]);

  const loadAuthor = async () => {
    setIsLoadingAuthor(true);
    try {
      const [author] = await Promise.race([
        base44.entities.User.filter({ email: post.created_by }, '-created_date', 1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);
      
      if (author) {
        setPostAuthor(author);
      } else {
        // Fallback author info
        setPostAuthor({
          full_name: post.created_by.split('@')[0],
          email: post.created_by,
          profile_image_url: null
        });
      }
    } catch (error) {
      console.log('Failed to load post author:', error.message);
      // Fallback author info
      setPostAuthor({
        full_name: post.created_by.split('@')[0],
        email: post.created_by,
        profile_image_url: null
      });
    } finally {
      setIsLoadingAuthor(false);
    }
  };

  // Check if user has liked this post
  useEffect(() => {
    const checkLiked = async () => {
      if (!currentUser) return;
      try {
        const reactions = await base44.entities.Reaction.filter({
          post_id: localPost.id,
          user_email: currentUser.email,
          reaction_type: 'like'
        });
        setHasLiked(reactions.length > 0);
      } catch (error) {
        console.log('Failed to check like status:', error);
      }
    };
    checkLiked();
  }, [localPost.id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) {
      setShowAuthGate(true);
      return;
    }

    try {
      if (hasLiked) {
        // Unlike: remove reaction
        const reactions = await base44.entities.Reaction.filter({
          post_id: localPost.id,
          user_email: currentUser.email,
          reaction_type: 'like'
        });
        if (reactions.length > 0) {
          await base44.entities.Reaction.delete(reactions[0].id);
        }
        setHasLiked(false);
        const newCount = Math.max(0, (localPost.likes_count || 0) - 1);
        await base44.entities.Post.update(localPost.id, { likes_count: newCount });
        setLocalPost(prev => ({ ...prev, likes_count: newCount }));
      } else {
        // Like: add reaction
        await base44.entities.Reaction.create({
          post_id: localPost.id,
          user_email: currentUser.email,
          reaction_type: 'like'
        });
        setHasLiked(true);
        const newCount = (localPost.likes_count || 0) + 1;
        await base44.entities.Post.update(localPost.id, { likes_count: newCount });
        setLocalPost(prev => ({ ...prev, likes_count: newCount }));
      }
      onUpdate?.();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleComment = () => {
    if (!currentUser) {
      setShowAuthGate(true);
      return;
    }
    setShowComments(!showComments);
  };

  const handleCommentAdded = async () => {
    // Refresh post data to get updated comment count
    try {
      const updatedPost = await base44.entities.Post.get(localPost.id);
      setLocalPost(updatedPost);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to refresh post:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await base44.entities.Post.delete(post.id);
        window.location.reload();
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const canDelete = currentUser && currentUser.email === post.created_by;

  return (
    <Card className="apple-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-blue)] to-purple-600 flex items-center justify-center overflow-hidden">
            {postAuthor?.profile_image_url ? (
              <img 
                src={postAuthor.profile_image_url} 
                alt={postAuthor.full_name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <p className="font-semibold text-sm">
              {isLoadingAuthor ? 'Loading...' : (postAuthor?.full_name || 'Unknown User')}
            </p>
            <p className="text-xs text-gray-500">
              {format(new Date(post.created_date), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>
        {canDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent>
        <p className="text-gray-900 mb-4 whitespace-pre-wrap">{post.content}</p>

        {post.media_files && post.media_files.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {post.media_files.slice(0, 4).map((media, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                {media.type === 'image' ? (
                  <img 
                    src={media.url} 
                    alt={media.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => window.open(media.url, '_blank')}
                  />
                ) : (
                  <video 
                    src={media.url} 
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`hover:text-red-500 hover:bg-red-50 transition-colors ${hasLiked ? 'text-red-500' : ''}`}
          >
            <Heart className={`w-4 h-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{localPost.likes_count || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className={`hover:text-blue-500 hover:bg-blue-50 transition-colors ${showComments ? 'text-blue-500' : ''}`}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">{localPost.comments_count || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hover:text-green-500 hover:bg-green-50"
          >
            <Share2 className="w-4 h-4 mr-1" />
            <span className="text-sm">Share</span>
          </Button>
        </div>

        {/* Comment Section */}
        {showComments && (
          <CommentSection
            post={localPost}
            currentUser={currentUser}
            onCommentAdded={handleCommentAdded}
          />
        )}
      </CardContent>

      {/* Auth Gate Modal */}
      <AuthGate 
        isOpen={showAuthGate} 
        onClose={() => setShowAuthGate(false)}
        action="interact with posts"
      />
    </Card>
  );
}