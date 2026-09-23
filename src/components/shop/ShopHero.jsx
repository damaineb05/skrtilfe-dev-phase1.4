import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight } from 'lucide-react';

export default function ShopHero({ products = [], onAddToCart }) {
  const [index, setIndex] = useState(0);

  const slides = products.length > 0 ? products.slice(0, 5) : [
    {
      id: 'placeholder',
      title: 'SKRTLIFE',
      collection: 'Genesis',
      price: 299,
      media: [{ url: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=1200&q=80' }],
      tags: ['Limited'],
    }
  ];

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const current = slides[index];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 'min(90vh, 700px)' }}>
      {/* Background layers */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <img
            src={current.media?.[0]?.url}
            alt={current.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F]/95 via-[#0A0A0F]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${index}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="max-w-xl"
            >
              <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4 font-medium">
                {current.collection || 'Collection'}
              </p>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[0.95] tracking-tighter mb-6">
                {current.title}
              </h1>
              {current.tags?.includes('Limited') && (
                <p className="text-[#FF3366] text-sm font-semibold uppercase tracking-widest mb-4">
                  — Limited Edition
                </p>
              )}
              <p className="text-white/50 text-base mb-8 leading-relaxed max-w-sm">
                {current.description || 'Exclusive pieces for those who live in full effect.'}
              </p>
              <div className="flex items-center gap-4">
                <Link
                  to={createPageUrl('ProductDetail') + `?id=${current.id}`}
                  className="group flex items-center gap-2.5 bg-white text-black px-7 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-gray-100 transition-all duration-300"
                >
                  Shop Now
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                {current.price && (
                  <span className="text-white/50 text-sm font-medium">
                    From <span className="text-white font-bold text-lg">${current.price}</span>
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)}
            className={`transition-all duration-300 rounded-full ${i === index ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'}`}
          />
        ))}
      </div>

      {/* Right thumbnails on desktop */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
        {slides.map((slide, i) => (
          <button key={i} onClick={() => setIndex(i)}
            className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${i === index ? 'border-white scale-110 opacity-100' : 'border-transparent opacity-40 hover:opacity-70'}`}>
            <img src={slide.media?.[0]?.url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}