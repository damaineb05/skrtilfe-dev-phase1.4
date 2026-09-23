/**
 * Feed page — reuses existing Post, Look, Drop, ActivityEvent entities
 * and the community PostCard/PostComposer components.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, RefreshCw, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const PAGE_SIZE = 10;

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl p-5 shimmer" style={{ background: 'rgba(255,255,255,0.04)', height: 160 }} />
      ))}
    </div>
  );
}

function FeedCard({ item, currentUser, onLike, onSave, savedIds }) {
  const isSaved = savedIds.includes(item.id);

  const typeConfig = {
    post: { color: '#00D4FF', label: 'Post' },
    look: { color: '#FF3366', label: 'Look' },
    drop: { color: '#FFD700', label: 'Drop' },
    event: { color: '#a78bfa', label: 'Event' },
  };
  const cfg = typeConfig[item._type] || typeConfig.post;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(255,51,102,0.3))', color: '#fff' }}>
            {(item.created_by?.[0] || item.user_email?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{item.created_by?.split('@')[0] || item.user_email?.split('@')[0] || 'Skrtlife Member'}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {item.created_date ? new Date(item.created_date).toLocaleDateString() : ''}
            </p>
          </div>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: `${cfg.color}18`, color: cfg.color }}>
          {cfg.label}
        </span>
      </div>

      {/* Content */}
      {item.content && <p className="text-sm mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{item.content}</p>}
      {item.title && <p className="text-white font-bold mb-1">{item.title}</p>}
      {item.description && <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.description}</p>}

      {/* Media */}
      {item.media_files?.length > 0 && (
        <div className={`grid gap-2 mb-4 rounded-xl overflow-hidden ${item.media_files.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {item.media_files.slice(0, 4).map((m, i) => (
            <div key={i} className="aspect-video bg-white/5 overflow-hidden rounded-lg">
              {m.type === 'video'
                ? <video src={m.url} className="w-full h-full object-cover" muted />
                : <img src={m.url} alt="" className="w-full h-full object-cover" />
              }
            </div>
          ))}
        </div>
      )}
      {item.thumbnail_url && (
        <div className="rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '16/7' }}>
          <img src={item.thumbnail_url} alt={item.title || ''} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => onLike(item)}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <Heart className="w-3.5 h-3.5" />
          <span>{item.likes_count || 0}</span>
        </button>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{item.comments_count || 0}</span>
        </div>
        <button onClick={() => onSave(item.id)}
          className="flex items-center gap-1.5 text-xs ml-auto transition-colors"
          style={{ color: isSaved ? '#00D4FF' : 'rgba(255,255,255,0.4)' }}>
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
        <button className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export default function Feed() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('feed_saved') || '[]'); } catch { return []; }
  });
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const postLimitRef = useRef(PAGE_SIZE);

  const loadFeed = useCallback(async (limit = PAGE_SIZE) => {
    setLoading(true);
    const [posts, looks, drops] = await Promise.all([
      base44.entities.Post.list('-created_date', limit).catch(() => []),
      base44.entities.Look.filter({ is_public: true }, '-created_date', 6).catch(() => []),
      base44.entities.Drop.list('-start_at', 4).catch(() => []),
    ]);

    const taggedPosts = (posts || []).map(p => ({ ...p, _type: 'post' }));
    const taggedLooks = (looks || []).map(l => ({ ...l, _type: 'look' }));
    const taggedDrops = (drops || []).map(d => ({ ...d, _type: 'drop' }));

    const merged = [...taggedPosts, ...taggedLooks, ...taggedDrops].sort(
      (a, b) => new Date(b.created_date || b.start_at) - new Date(a.created_date || a.start_at)
    );

    setItems(merged);
    setHasMore(taggedPosts.length === limit);
    setLoading(false);
  }, []);

  useEffect(() => { loadFeed(PAGE_SIZE); }, [loadFeed]);

  const handleLike = async (item) => {
    if (!user) { base44.auth.redirectToLogin('/Feed'); return; }
    if (item._type === 'post') {
      await base44.entities.Post.update(item.id, { likes_count: (item.likes_count || 0) + 1 }).catch(() => {});
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, likes_count: (i.likes_count || 0) + 1 } : i));
    }
  };

  const handleSave = (id) => {
    const updated = savedIds.includes(id) ? savedIds.filter(x => x !== id) : [...savedIds, id];
    setSavedIds(updated);
    localStorage.setItem('feed_saved', JSON.stringify(updated));
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setPosting(true);
    await base44.entities.Post.create({ content: newPost.trim(), likes_count: 0, comments_count: 0, reposts_count: 0 }).catch(() => {});
    setNewPost('');
    setPosting(false);
    loadFeed(PAGE_SIZE);
    base44.analytics.track({ eventName: 'post_created' });
  };

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[9px] tracking-[0.45em] uppercase mb-1 font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>Live</p>
            <h1 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>FEED</h1>
          </div>
          <button onClick={() => loadFeed(PAGE_SIZE)} className="w-9 h-9 flex items-center justify-center rounded-xl transition-all" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Composer */}
        {user ? (
          <div className="mb-6 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(255,51,102,0.3))', color: '#fff' }}>
                {(user.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={2}
                  className="w-full bg-transparent text-white text-sm placeholder-white/25 resize-none focus:outline-none"
                />
                <div className="flex justify-end mt-2">
                  <button onClick={handlePost} disabled={!newPost.trim() || posting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                    style={{ background: '#00D4FF', color: '#000' }}>
                    {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Sign in to post</p>
            <button onClick={() => base44.auth.redirectToLogin('/Feed')}
              className="px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
              style={{ background: '#00D4FF', color: '#000' }}>
              Sign In
            </button>
          </div>
        )}

        {/* Feed */}
        {loading && items.length === 0 ? (
          <FeedSkeleton />
        ) : items.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <p className="font-semibold mb-2">Feed is empty</p>
            <p className="text-sm">Be the first to post in the community</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <FeedCard key={`${item._type}-${item.id}`} item={item} currentUser={user} onLike={handleLike} onSave={handleSave} savedIds={savedIds} />
            ))}
            {hasMore && (
              <button onClick={() => {
                const next = postLimitRef.current + PAGE_SIZE;
                postLimitRef.current = next;
                loadFeed(next);
              }}
                className="w-full py-3 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Load More
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}