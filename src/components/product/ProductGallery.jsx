import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function ProductGallery({ media, title }) {
  const [lightbox, setLightbox] = useState(null);

  const images = (media || []).filter(m => m.type !== 'video');
  if (images.length === 0) {
    return (
      <div className="w-full aspect-[3/4] flex items-center justify-center bg-[#f5f5f3]">
        <span className="text-xs uppercase tracking-widest text-black/20">No image</span>
      </div>
    );
  }

  // Farfetch layout: first two images side by side (hero row), then rest stacked in pairs
  const rows = [];
  for (let i = 0; i < images.length; i += 2) {
    rows.push(images.slice(i, i + 2));
  }

  return (
    <>
      <div className="flex flex-col gap-0.5">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className={`flex gap-0.5 ${row.length === 1 ? '' : ''}`}>
            {row.map((img, colIdx) => {
              const globalIdx = rowIdx * 2 + colIdx;
              return (
                <div
                  key={globalIdx}
                  className="relative overflow-hidden cursor-zoom-in group bg-[#f5f5f3] flex-1"
                  style={{ aspectRatio: '3/4' }}
                  onClick={() => setLightbox(globalIdx)}
                >
                  <img
                    src={img.url}
                    alt={img.alt_text || `${title} ${globalIdx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
              onClick={() => setLightbox(null)}
            >
              <X className="w-5 h-5 text-white" />
            </button>
            {lightbox > 0 && (
              <button
                className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl font-light"
                onClick={e => { e.stopPropagation(); setLightbox(l => l - 1); }}
              >‹</button>
            )}
            {lightbox < images.length - 1 && (
              <button
                className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl font-light"
                onClick={e => { e.stopPropagation(); setLightbox(l => l + 1); }}
              >›</button>
            )}
            <motion.img
              key={lightbox}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={images[lightbox].url}
              alt={title}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={e => e.stopPropagation()}
            />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest">
              {lightbox + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}