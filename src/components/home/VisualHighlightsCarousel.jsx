import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

export default function VisualHighlightsCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
  };

  return (
    <>
      <div className="relative group">
        {/* Main Featured Image */}
        <div className="aspect-[16/10] md:aspect-[21/9] rounded-3xl overflow-hidden border border-slate-400/15 mb-6 relative">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Visual ${currentIndex + 1}`}
              className="w-full h-full object-cover object-top"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            />
          </AnimatePresence>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100/10 backdrop-blur-md border border-slate-400/20 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-slate-100/20 transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-slate-200" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100/10 backdrop-blur-md border border-slate-400/20 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-slate-100/20 transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-slate-200" />
          </button>
          
          {/* Expand Button */}
          <button
            onClick={() => setSelectedImage(images[currentIndex])}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100/10 backdrop-blur-md border border-slate-400/20 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-slate-100/20 transition-all duration-300"
          >
            <Maximize2 className="w-4 h-4 text-slate-200" />
          </button>
          
          {/* Progress Indicator */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-1">
              {images.map((_, idx) => (
                <div key={idx} className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-slate-100"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: idx === currentIndex ? '100%' : '0%'
                    }}
                    transition={{ 
                      duration: idx === currentIndex ? 4 : 0,
                      ease: 'linear'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setIsAutoPlaying(false);
              }}
              className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? 'border-slate-300 shadow-[0_0_20px_rgba(226,232,240,0.3)]'
                  : 'border-slate-500/10 hover:border-slate-400/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === currentIndex && (
                <div className="absolute inset-0 bg-gradient-to-t from-slate-100/20 to-transparent" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.img
              src={selectedImage}
              alt="Expanded view"
              className="max-w-full max-h-full object-contain rounded-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              onClick={(e) => e.stopPropagation()}
            />
            
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white text-sm uppercase tracking-wider"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}