import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function RecommendationCard({ product, onAddToCart }) {
  const imageUrl = product.media?.[0]?.url || 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group flex-shrink-0 w-48 sm:w-56"
    >
      <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
        <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800 mb-3">
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Quick Add Button */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart?.(product);
              }}
              size="sm"
              className="w-full bg-white text-black hover:bg-gray-100 font-bold text-xs"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              ADD
            </Button>
          </div>
        </div>
      </Link>
      
      <div>
        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">
          {product.collection}
        </p>
        <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
          {product.title}
        </h3>
        <p className="text-cyan-400 font-bold">${product.price}</p>
      </div>
    </motion.div>
  );
}

export default function ProductRecommendations({ 
  currentProductId, 
  collection, 
  tags = [],
  title = "You May Also Like",
  onAddToCart,
  limit = 6
}) {
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations', currentProductId, collection],
    queryFn: async () => {
      // Fetch products from the same collection
      let products = await base44.entities.Product.filter(
        { status: 'active' },
        '-created_date',
        20
      );

      // Filter out current product
      products = products.filter(p => p.id !== currentProductId);

      // Score and sort products based on relevance
      const scoredProducts = products.map(product => {
        let score = 0;
        
        // Same collection = high score
        if (product.collection === collection) score += 10;
        
        // Matching tags = medium score
        if (tags.length > 0 && product.tags) {
          const matchingTags = product.tags.filter(t => tags.includes(t));
          score += matchingTags.length * 3;
        }
        
        // Featured products get bonus
        if (product.is_featured) score += 2;
        
        // Similar price range
        // (could add more sophisticated price matching)
        
        return { ...product, score };
      });

      // Sort by score and return top recommendations
      return scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    },
    enabled: !!currentProductId,
  });

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-black text-white">{title}</h2>
        </div>
        <Link 
          to={createPageUrl('Shop')}
          className="text-sm font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
        >
          VIEW ALL
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {recommendations.map((product, index) => (
          <RecommendationCard 
            key={product.id} 
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}

// Recently Viewed Products Component
export function RecentlyViewedProducts({ onAddToCart, limit = 6 }) {
  const [viewedProducts, setViewedProducts] = React.useState([]);

  React.useEffect(() => {
    // Get recently viewed from localStorage
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setViewedProducts(viewed.slice(0, limit));
  }, [limit]);

  if (viewedProducts.length === 0) return null;

  return (
    <section className="py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl sm:text-2xl font-black text-white">Recently Viewed</h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {viewedProducts.map((product, index) => (
          <RecommendationCard 
            key={product.id || index} 
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}

// Helper function to track viewed products
export function trackProductView(product) {
  if (!product?.id) return;
  
  const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  
  // Remove if already exists
  const filtered = viewed.filter(p => p.id !== product.id);
  
  // Add to beginning
  filtered.unshift({
    id: product.id,
    title: product.title,
    price: product.price,
    collection: product.collection,
    media: product.media?.slice(0, 1)
  });
  
  // Keep only last 20
  localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 20)));
}