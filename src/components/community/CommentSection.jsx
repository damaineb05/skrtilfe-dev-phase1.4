import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Heart, User } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

function CommentItem({ comment, currentUser, onLikeComment }) {
  const [author, setAuthor] = useState(null);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(true);

  useEffect(() => {
    loadAuthor();
  }, [comment.user_email]);

  const loadAuthor = async () => {
    try {
      const [user] = await base44.entities.User.filter({ email: comment.user_email }, '-created_date', 1);
      setAuthor(user || { full_name: comment.user_email.split('@')[0], email: comment.user_email });
    } catch (error) {
      setAuthor({ full_name: comment.user_email.split('@')[0], email: comment.user_email });
    } finally {
      setIsLoadingAuthor(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 py-3"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
        {author?.profile_image_url ? (
          <img src={author.profile_image_url} alt="" className="w-full h-full object-cover rounded-full" />
        ) : (
          <User className="w-4 h-4 text-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="font-semibold text-sm">
            {isLoadingAuthor ? 'Loading...' : author?.full_name}
          </p>
          <p className="text-sm text-gray-700 break-words">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <button
            onClick={() => onLikeComment(comment)}
            disabled={!currentUser}
            className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
          >
            <Heart className="w-3 h-3" />
            {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
          </button>
          <span className="text-xs text-gray-400">
            {format(new Date(comment.created_date), 'MMM d, h:mm a')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommentSection({ post, currentUser, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [post.id]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const allComments = await base44.entities.Comment.filter({ post_id: post.id }, '-created_date', 50);
      setComments(allComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !currentUser) return;

    setIsPosting(true);
    try {
      await base44.entities.Comment.create({
        post_id: post.id,
        user_email: currentUser.email,
        content: newComment.trim(),
        likes_count: 0
      });

      // Update post comment count
      await base44.entities.Post.update(post.id, {
        comments_count: (post.comments_count || 0) + 1
      });

      setNewComment('');
      await loadComments();
      onCommentAdded?.();
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikeComment = async (comment) => {
    if (!currentUser) return;

    try {
      await base44.entities.Comment.update(comment.id, {
        likes_count: (comment.likes_count || 0) + 1
      });
      await loadComments();
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  return (
    <div className="border-t border-gray-200 pt-3">
      {/* Comment Input */}
      {currentUser ? (
        <div className="flex gap-2 mb-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handlePostComment();
              }
            }}
          />
          <Button
            onClick={handlePostComment}
            disabled={!newComment.trim() || isPosting}
            size="icon"
            className="bg-blue-500 hover:bg-blue-600 h-[60px]"
          >
            {isPosting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">Sign in to comment</p>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={currentUser}
                onLikeComment={handleLikeComment}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}