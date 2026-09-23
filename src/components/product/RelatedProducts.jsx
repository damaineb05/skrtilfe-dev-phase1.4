import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

export default function RelatedProducts({ currentProductId, collection, tags = [] }) {
  const scrollContainerRef = React.useRef(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['related-products', collection],
    queryFn: async () => {
      const allProducts = await base44.entities.Product.filter({ 
        status: 'active',
        collection: collection 
      });
      // Filter out current product and limit to 8
      return allProducts
        .filter(p => p.id !== currentProductId)
        .slice(0, 8);
    },
    enabled: !!collection
  });

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="mt-16 py-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-64"
          >
            <Link to={`${createPageUrl('ProductDetail')}?id=${product.id}`}>
              <Card className="group overflow-hidden border-gray-200 hover:shadow-lg transition-all">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {product.media?.[0]?.url ? (
                    <img
                      src={product.media[0].url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  
                  {product.compare_at_price > product.price && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                      Sale
                    </Badge>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate group-hover:text-cyan-600 transition-colors">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compare_at_price > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.compare_at_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.available_colors?.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {product.available_colors.slice(0, 4).map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hex || '#ccc' }}
                          title={color.name}
                        />
                      ))}
                      {product.available_colors.length > 4 && (
                        <span className="text-xs text-gray-500 ml-1">
                          +{product.available_colors.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}