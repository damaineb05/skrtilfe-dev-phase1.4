import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Users, MessageSquare, Heart, Repeat2, Image, Loader2, Plus, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function PostCard({ post, currentUser, onLike }) {
  const isOwnPost = post.created_by === currentUser?.email;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
          style={{ background: 'linear-gradient(135deg, #FF3366, #00D4FF)', color: '#fff' }}>
          {(post.created_by?.[0] || '?').toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{post.created_by || 'Anonymous'}</p>
          <p className="text-white/35 text-xs">
            {post.created_date ? new Date(post.created_date).toLocaleDateString() : ''}
          </p>
        </div>
        {isOwnPost && (
          <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF' }}>You</span>
        )}
      </div>

      <p className="text-white/80 text-sm leading-relaxed mb-4">{post.content}</p>

      {post.media_files?.length > 0 && (
        <div className={`grid gap-2 mb-4 ${post.media_files.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.media_files.slice(0, 4).map((m, i) => (
            <div key={i} className="rounded-xl overflow-hidden aspect-video bg-white/5">
              {m.type === 'video'
                ? <video src={m.url} className="w-full h-full object-cover" muted />
                : <img src={m.url} alt="" className="w-full h-full object-cover" />
              }
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => onLike(post)} className="flex items-center gap-1.5 text-white/40 hover:text-[#FF3366] transition-colors text-xs">
          <Heart className="w-3.5 h-3.5" />
          <span>{post.likes_count || 0}</span>
        </button>
        <div className="flex items-center gap-1.5 text-white/40 text-xs">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{post.comments_count || 0}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/40 text-xs">
          <Repeat2 className="w-3.5 h-3.5" />
          <span>{post.reposts_count || 0}</span>
        </div>
      </div>
    </motion.div>
  );
}

function PostComposer({ currentUser, onPost }) {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsPosting(true);
    await onPost({ content: content.trim(), likes_count: 0, comments_count: 0, reposts_count: 0 });
    setContent('');
    setIsPosting(false);
  };

  if (!currentUser) {
    return (
      <div className="rounded-2xl p-5 text-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-white/50 text-sm mb-3">Sign in to post to the community</p>
        <button onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
          className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black bg-white rounded-lg hover:bg-white/90 transition-all">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
          style={{ background: 'linear-gradient(135deg, #FF3366, #00D4FF)', color: '#fff' }}>
          {(currentUser?.email?.[0] || '?').toUpperCase()}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full bg-transparent text-white text-sm placeholder:text-white/25 resize-none focus:outline-none leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3 pt-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/25">{content.length}/500</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isPosting}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black bg-white rounded-lg hover:bg-white/90 disabled:opacity-40 transition-all"
            >
              {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Community() {
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50),
  });

  const createPost = useMutation({
    mutationFn: (data) => base44.entities.Post.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community-posts'] }),
  });

  const likePost = useMutation({
    mutationFn: (post) => base44.entities.Post.update(post.id, { likes_count: (post.likes_count || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community-posts'] }),
  });

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[9px] tracking-[0.4em] uppercase mb-3 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Digital Society
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight mb-4"
            style={{ letterSpacing: '-0.025em' }}>
            COMMUNITY
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-white/35 uppercase tracking-wider">Live Feed</span>
          </div>
        </div>

        {/* Composer */}
        <div className="mb-6">
          <PostComposer currentUser={currentUser} onPost={(data) => createPost.mutate(data)} />
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl h-32 animate-pulse"
                style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <p className="text-white/40 text-sm">Be the first to post in the community</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onLike={(p) => currentUser && likePost.mutate(p)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}