import React, { useState } from 'react';
import { Star, ThumbsUp, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const MOCK_REVIEWS = [
  { id: 1, author: 'Alex M.', rating: 5, date: '2024-11-15', title: 'Amazing quality!', content: 'The fabric quality is incredible. Fits perfectly and looks exactly like the photos. Highly recommend!', helpful: 24, verified: true },
  { id: 2, author: 'Jordan K.', rating: 4, date: '2024-11-10', title: 'Great design, runs slightly large', content: 'Love the design and the material feels premium. Only reason for 4 stars is it runs a bit large, so consider sizing down.', helpful: 18, verified: true },
  { id: 3, author: 'Sam T.', rating: 5, date: '2024-11-05', title: 'Perfect streetwear piece', content: 'This is exactly what I was looking for. The attention to detail is impressive and it pairs well with everything.', helpful: 12, verified: false },
];

function Stars({ rating, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} style={{ width: size, height: size }}
          className={s <= rating ? 'fill-black text-black' : 'fill-transparent text-black/20'} />
      ))}
    </div>
  );
}

function InteractiveStars({ rating, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
        >
          <Star className="w-5 h-5 transition-colors"
            style={{ fill: s <= (hover || rating) ? '#000' : 'none', color: s <= (hover || rating) ? '#000' : '#ccc' }} />
        </button>
      ))}
    </div>
  );
}

export default function CustomerReviews({ productId }) {
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, name: '', title: '', content: '' });
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const reviews = MOCK_REVIEWS;

  const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  const ratingCounts = [5,4,3,2,1].map(r => ({
    r, count: reviews.filter(x => x.rating === r).length,
    pct: (reviews.filter(x => x.rating === r).length / reviews.length) * 100
  }));

  const handleHelpful = (id) => {
    if (!helpfulVotes[id]) setHelpfulVotes(v => ({ ...v, [id]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowForm(false);
    setNewReview({ rating: 0, name: '', title: '', content: '' });
  };

  return (
    <div className="border-t border-[#e8e8e8] mt-0">
      {/* Header */}
      <div className="px-5 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-black mb-1">Customer Reviews</h2>
            <div className="flex items-center gap-3">
              <Stars rating={Math.round(avg)} size={13} />
              <span className="text-xs text-black/40">{avg.toFixed(1)} · {reviews.length} reviews</span>
            </div>
          </div>
          <button
            onClick={() => setShowForm(s => !s)}
            className="text-xs font-semibold uppercase tracking-[0.1em] border border-black px-4 py-2.5 hover:bg-black hover:text-white transition-all"
          >
            Write a Review
          </button>
        </div>

        {/* Rating breakdown — minimal bars */}
        <div className="space-y-1.5 mb-8 max-w-xs">
          {ratingCounts.map(({ r, count, pct }) => (
            <div key={r} className="flex items-center gap-3">
              <span className="text-xs text-black/40 w-4 shrink-0">{r}</span>
              <div className="flex-1 h-[3px] bg-black/10">
                <div className="h-full bg-black transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-black/30 w-4 text-right">{count}</span>
            </div>
          ))}
        </div>

        {/* Write review form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="overflow-hidden border border-[#e8e8e8] p-6 mb-8 space-y-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black mb-4">Your Review</p>
              <div>
                <p className="text-xs text-black/50 mb-2">Rating</p>
                <InteractiveStars rating={newReview.rating} onChange={r => setNewReview(p => ({ ...p, rating: r }))} />
              </div>
              <div>
                <input
                  value={newReview.name}
                  onChange={e => setNewReview(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                  required
                  className="w-full border-b border-[#d4d4d4] py-2.5 text-sm placeholder:text-black/25 focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <input
                  value={newReview.title}
                  onChange={e => setNewReview(p => ({ ...p, title: e.target.value }))}
                  placeholder="Review title"
                  required
                  className="w-full border-b border-[#d4d4d4] py-2.5 text-sm placeholder:text-black/25 focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <textarea
                  value={newReview.content}
                  onChange={e => setNewReview(p => ({ ...p, content: e.target.value }))}
                  placeholder="Share your experience…"
                  rows={3}
                  required
                  className="w-full border-b border-[#d4d4d4] py-2.5 text-sm placeholder:text-black/25 focus:outline-none focus:border-black transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-6 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black/80 transition-colors">
                  Submit
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-[#d4d4d4] text-xs font-semibold uppercase tracking-[0.1em] text-black/50 hover:text-black transition-colors">
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Reviews list */}
        <div className="divide-y divide-[#e8e8e8]">
          {reviews.map(review => {
            const voted = helpfulVotes[review.id];
            const count = (review.helpful || 0) + (voted ? 1 : 0);
            return (
              <div key={review.id} className="py-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-black/8 flex items-center justify-center text-xs font-semibold text-black/50">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-black">{review.author}</span>
                      {review.verified && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-black/30">Verified</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-black/30">
                    {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <Stars rating={review.rating} size={12} />
                {review.title && <p className="text-sm font-semibold text-black mt-2 mb-1">{review.title}</p>}
                <p className="text-sm text-black/60 leading-relaxed">{review.content}</p>
                <button
                  onClick={() => handleHelpful(review.id)}
                  disabled={voted}
                  className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${voted ? 'text-black/40' : 'text-black/30 hover:text-black'}`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  Helpful ({count})
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}