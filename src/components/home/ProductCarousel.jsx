import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ProductCarousel({ products, autoPlayInterval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const slidesPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  };
  
  const [visibleCount, setVisibleCount] = useState(3);
  
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width < 768) setVisibleCount(slidesPerView.mobile);
      else if (width < 1024) setVisibleCount(slidesPerView.tablet);
      else setVisibleCount(slidesPerView.desktop);
    };
    
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  useEffect(() => {
    if (isPaused || !autoPlayInterval) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, autoPlayInterval);
    
    return () => clearInterval(interval);
  }, [currentIndex, isPaused, autoPlayInterval]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const threshold = 50;
    
    if (distance > threshold) handleNext();
    if (distance < -threshold) handlePrev();
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const getVisibleProducts = () => {
    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % products.length;
      visible.push(products[index]);
    }
    return visible;
  };

  const visibleProducts = getVisibleProducts();

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full bg-slate-100/10 backdrop-blur-md border border-slate-400/20 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-slate-100/20 hover:border-slate-300/30 transition-all duration-300"
        aria-label="Previous"
      >
        <ChevronLeft className="w-6 h-6 text-slate-200" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full bg-slate-100/10 backdrop-blur-md border border-slate-400/20 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-slate-100/20 hover:border-slate-300/30 transition-all duration-300"
        aria-label="Next"
      >
        <ChevronRight className="w-6 h-6 text-slate-200" />
      </button>

      {/* Carousel Content */}
      <div className="overflow-hidden group">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleProducts.map((product, idx) => {
              const image = product.media?.find(m => m.is_primary)?.url || product.media?.[0]?.url;
              
              return (
                <motion.div
                  key={`${product.id}-${currentIndex}-${idx}`}
                  initial={{ opacity: 0, x: direction > 0 ? 100 : -100, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: direction > 0 ? -100 : 100, scale: 0.95 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.32, 0.72, 0, 1],
                    opacity: { duration: 0.4 }
                  }}
                  className="group/card"
                >
                  <Link to={createPageUrl(`ProductDetail?id=${product.id}`)}>
                    <div className="relative">
                      {/* Product Image */}
                      <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-900/50 border border-slate-500/10 hover:border-slate-400/25 transition-all mb-4 relative">
                        {image && (
                          <motion.img
                            src={image}
                            alt={product.title}
                            className="w-full h-full object-cover opacity-85"
                            whileHover={{ scale: 1.05, opacity: 1 }}
                            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                          />
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                        
                        {/* Badges */}
                        {product.tags?.includes('Limited') && (
                          <Badge className="absolute top-4 left-4 bg-slate-100/90 text-slate-900 border-0">
                            LIMITED
                          </Badge>
                        )}
                        
                        {/* Quick Actions on Hover */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-all duration-300"
                        >
                          <Button size="sm" className="flex-1 bg-slate-100 hover:bg-white text-slate-900 font-medium rounded-full">
                            Quick View
                          </Button>
                          <Button size="sm" variant="outline" className="border-slate-300/50 text-slate-100 hover:bg-slate-100/10 rounded-full">
                            <ShoppingBag className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </div>
                      
                      {/* Product Info */}
                      <motion.div
                        initial={{ opacity: 0.8 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-slate-100 font-semibold text-lg mb-1 line-clamp-1">{product.title}</h3>
                        <p className="text-slate-400/60 text-sm mb-3 line-clamp-1">{product.collection}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-slate-200">${product.price}</span>
                          <Button size="sm" className="bg-slate-100 hover:bg-white text-slate-900 font-medium rounded-full opacity-0 group-hover/card:opacity-100 transition-all">
                            View
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {products.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-8 h-2 bg-slate-300'
                : 'w-2 h-2 bg-slate-500/30 hover:bg-slate-400/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}