import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Loader2, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DropsPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    base44.entities.Product.filter({ is_featured: true, status: 'active' }, '-created_date', 10)
      .then(data => setProducts(data || []))
      .finally(() => setLoading(false));
  }, []);

  const scrollTo = (index) => {
    setCurrentIndex(index);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: index * 320, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} /></div>;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No featured drops</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.4)' }}>Featured Drops</p>
        <div className="flex items-center gap-2">
          <button onClick={() => scrollTo(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}
            className="w-7 h-7 flex items-center justify-center disabled:opacity-20 transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}>
            <ChevronLeft className="w-3.5 h-3.5 text-white" />
          </button>
          <span className="text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>{currentIndex + 1}/{products.length}</span>
          <button onClick={() => scrollTo(Math.min(products.length - 1, currentIndex + 1))} disabled={currentIndex === products.length - 1}
            className="w-7 h-7 flex items-center justify-center disabled:opacity-20 transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}>
            <ChevronRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      <div ref={carouselRef} className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        {products.map((product, idx) => {
          const image = product.media?.find(m => m.is_primary)?.url || product.media?.[0]?.url;
          return (
            <Link key={product.id} to={createPageUrl(`ProductDetail?id=${product.id}`)} className="flex-shrink-0 w-[280px] snap-center">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                className="overflow-hidden group cursor-pointer transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
                {image && (
                  <div className="aspect-square relative overflow-hidden bg-[#111]">
                    <img src={image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {product.tags?.includes('Limited') && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-white text-black">Limited</span>
                    )}
                  </div>
                )}
                <div className="p-3.5">
                  <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{product.collection}</p>
                  <h3 className="text-sm font-semibold text-white truncate mb-2">{product.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-white">${product.price}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 bg-white text-black">View</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="flex justify-center gap-1.5">
        {products.map((_, idx) => (
          <button key={idx} onClick={() => scrollTo(idx)} className="h-px transition-all"
            style={{ width: idx === currentIndex ? '24px' : '8px', background: idx === currentIndex ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>
    </div>
  );
}