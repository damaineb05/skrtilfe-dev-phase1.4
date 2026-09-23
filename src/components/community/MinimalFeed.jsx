import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EmbedCard from './EmbedCard';

const PAGE_SIZE = 6;

function EmptyFeed() {
  return (
    <div className="text-center py-20">
      <p className="text-[9px] tracking-[0.35em] uppercase mb-3 font-medium" style={{ color: 'rgba(255,255,255,0.2)' }}>
        No posts yet
      </p>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Be the first to share something with the community.
      </p>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="rounded-xl p-4 space-y-3 animate-pulse" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-3 w-24 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
      <div className="h-3 w-full rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="h-3 w-3/4 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  );
}

export default function MinimalFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    base44.entities.Post.list('-created_date', PAGE_SIZE * 10)
      .then(all => {
        setTotal(all.length);
        setPosts(all);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const pagePosts = posts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Feed */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
        </div>
      ) : pagePosts.length === 0 ? (
        <EmptyFeed />
      ) : (
        <div className="space-y-4">
          {pagePosts.map(post => (
            <EmbedCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-opacity disabled:opacity-25 hover:opacity-70"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}
          >
            <ChevronLeft className="w-3 h-3" /> Prev
          </button>
          <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-opacity disabled:opacity-25 hover:opacity-70"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}
          >
            Next <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}