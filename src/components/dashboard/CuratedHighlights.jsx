import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sparkles, Package } from 'lucide-react';

export default function CuratedHighlights({ currentUser }) {
  const [highlights, setHighlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadCuratedContent();
    }
  }, [currentUser]);

  const loadCuratedContent = async () => {
    try {
      // Fetch user's recent activity
      const recentActivity = await base44.entities.UserActivity.filter(
        { user_email: currentUser.email },
        '-created_date',
        20
      );

      // Get user preferences
      const [preferences] = await base44.entities.UserPreferences.filter(
        { user_email: currentUser.email },
        '-created_date',
        1
      );

      // Extract interest tags from activity
      const viewedTags = new Set();
      const viewedCollections = new Set();
      
      recentActivity.forEach(activity => {
        if (activity.metadata?.tags) {
          activity.metadata.tags.forEach(tag => viewedTags.add(tag));
        }
        if (activity.metadata?.collection) {
          viewedCollections.add(activity.metadata.collection);
        }
      });

      // Find 4-6 items max based on interests
      const suggestedProducts = await base44.entities.Product.filter(
        { status: 'active' },
        '-created_date',
        30
      );

      const curated = suggestedProducts
        .filter(p => {
          // Match by tags or collection
          const hasMatchingTag = p.tags?.some(tag => viewedTags.has(tag));
          const hasMatchingCollection = viewedCollections.has(p.collection);
          return hasMatchingTag || hasMatchingCollection;
        })
        .slice(0, 6);

      // If no matches, show new arrivals
      const finalHighlights = curated.length > 0 ? curated : suggestedProducts.slice(0, 6);

      setHighlights(finalHighlights);
    } catch (error) {
      console.error('Failed to load curated content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-square bg-white/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FFD700]" />
          <h2 className="text-white font-black text-lg uppercase tracking-wider">Curated for You</h2>
        </div>
        <p className="text-white/40 text-xs">Based on your activity</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {highlights.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
              <div className="group cursor-pointer">
                <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-black/40 border border-white/10 group-hover:border-[#00D4FF]/50 transition-all">
                  <img
                    src={product.media?.[0]?.url || 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-white text-sm font-medium truncate group-hover:text-[#00D4FF] transition-colors">
                  {product.title}
                </h3>
                <p className="text-[#00D4FF] text-xs font-bold">${product.price}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {highlights.length === 0 && (
        <div className="text-center py-8">
          <Package className="w-12 h-12 mx-auto mb-3 text-white/20" />
          <p className="text-white/40 text-sm">Browse the shop to get personalized recommendations</p>
        </div>
      )}

      <div className="text-center pt-4 border-t border-white/10">
        <p className="text-white/30 text-xs">6 items selected for you</p>
      </div>
    </div>
  );
}