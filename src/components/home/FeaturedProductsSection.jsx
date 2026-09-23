import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCarousel from './ProductCarousel';

export default function FeaturedProductsSection({ products }) {
  const [hoveredId, setHoveredId] = useState(null);

  // Split products into carousel and grid
  const carouselProducts = products.slice(0, 6);
  const gridProducts = products.slice(6, 12);

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2"
                style={{ 
                  background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
              New Drops
            </h2>
            <p className="text-slate-400/60">Latest releases from the collective</p>
          </motion.div>
          
          <Link to={createPageUrl('Shop')}>
            <Button variant="outline" className="border-slate-500/20 text-slate-300 hover:bg-slate-100/5 hover:border-slate-400/30 rounded-full">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Featured Carousel */}
        {carouselProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <ProductCarousel products={carouselProducts} />
          </motion.div>
        )}

        {/* Additional Grid (if more products) */}
        {gridProducts.length > 0 && (
          <>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-400/20 to-transparent" />
              <span className="text-xs text-slate-400/50 uppercase tracking-wider">More Drops</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-400/20 to-transparent" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {gridProducts.map((product, idx) => {
                const image = product.media?.find(m => m.is_primary)?.url || product.media?.[0]?.url;
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    onMouseEnter={() => setHoveredId(product.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <Link to={createPageUrl(`ProductDetail?id=${product.id}`)}>
                      <div className="group cursor-pointer">
                        <div className="aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-zinc-900/50 border border-slate-500/10 hover:border-slate-400/25 transition-all mb-3 relative">
                          {image && (
                            <motion.img
                              src={image}
                              alt={product.title}
                              className="w-full h-full object-cover opacity-85"
                              animate={{ 
                                scale: hoveredId === product.id ? 1.08 : 1,
                                opacity: hoveredId === product.id ? 1 : 0.85
                              }}
                              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                            />
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          
                          {product.tags?.includes('Limited') && (
                            <Badge className="absolute top-2 left-2 bg-slate-100/90 text-slate-900 border-0 text-[10px] md:text-xs">
                              <Zap className="w-3 h-3 mr-1" />
                              LIMITED
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-slate-100 font-semibold text-sm md:text-base mb-1 line-clamp-1">{product.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg md:text-xl font-bold text-slate-200">${product.price}</span>
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ 
                              opacity: hoveredId === product.id ? 1 : 0,
                              x: hoveredId === product.id ? 0 : -10
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <ArrowRight className="w-4 h-4 text-slate-300" />
                          </motion.div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}