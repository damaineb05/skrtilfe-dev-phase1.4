import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BrandHeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  const brandImages = [
    {
      url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/ca9d3b1ed_IMG_9553.jpg',
      title: 'LIVE IN FULL EFFECT',
      subtitle: 'The Collection',
      cta: 'Shop Now'
    },
    {
      url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/97eeca7ce_IMG_9508.jpg',
      title: 'DIGITAL SOCIETY',
      subtitle: 'Exclusive Gear',
      cta: 'Explore'
    },
    {
      url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/9d6eea39f_IMG_9556.jpg',
      title: 'STREET CULTURE',
      subtitle: 'New Drops',
      cta: 'Discover'
    },
    {
      url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/e538a17c5_IMG_9542.jpg',
      title: 'CREW LIFESTYLE',
      subtitle: 'Limited Edition',
      cta: 'View Collection'
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % brandImages.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [brandImages.length]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + brandImages.length) % brandImages.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % brandImages.length);
  };

  return (
    <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      {/* Carousel Content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 1000 : -1000 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -1000 : 1000 }}
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 }
          }}
          className="absolute inset-0"
        >
          <img
            src={brandImages[currentIndex].url}
            alt={brandImages[currentIndex].title}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-24 px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center max-w-3xl"
            >
              <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 mb-4">
                {brandImages[currentIndex].subtitle}
              </Badge>
              
              <h1 className="text-4xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight">
                {brandImages[currentIndex].title}
              </h1>
              
              <Link to={createPageUrl('Shop')}>
                <Button className="bg-white text-black hover:bg-slate-100 font-bold px-10 py-6 text-base rounded-full shadow-2xl">
                  {brandImages[currentIndex].cta} <ShoppingBag className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {brandImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className="group relative"
          >
            <div className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-12 h-2 bg-white'
                : 'w-2 h-2 bg-white/30 hover:bg-white/50'
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}