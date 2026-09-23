import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Heart, Plus } from 'lucide-react';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80';

export default function CyberpunkProductCard({ product, onAddToCart, onQuickView, index = 0 }) {
  const [isLiked, setIsLiked] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const images = product.media?.filter((m) => m.type !== 'video').map((m) => m.url) || [];
  const imageUrl = (!imgError && (images[imgIdx] || images[0])) ? (images[imgIdx] || images[0]) : FALLBACK_IMG;
  const isSoldOut = (product.inventory_qty ?? 0) === 0;
  const isOnSale = product.compare_at_price > product.price;
  const discount = isOnSale ? Math.round((1 - product.price / product.compare_at_price) * 100) : 0;
  const isLimited = product.tags?.some((t) => t.toLowerCase().includes('limited'));

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="group relative">
      <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`} className="block">

        {/* Image container */}
        <div
          className="relative overflow-hidden bg-[#111116]"
          style={{ aspectRatio: '3/4' }}
          onMouseEnter={() => images[1] && setImgIdx(1)}
          onMouseLeave={() => setImgIdx(0)}>
          
          {/* Shimmer while loading */}
          {!imgLoaded && (
            <div className="absolute inset-0 shimmer" />
          )}

          {/* Product image */}
          <img
            src={imageUrl}
            alt={product.title}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
            loading="lazy"
          />

          {/* Subtle overlay on hover */}


          {/* Badges — top left, editorial style */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isSoldOut &&
            <span className="px-2.5 py-1 bg-black/80 backdrop-blur text-white/70 text-[9px] font-semibold uppercase tracking-[0.2em]">
                Sold Out
              </span>
            }
            {!isSoldOut && isLimited &&
            <span className="px-2.5 py-1 bg-white text-black text-[9px] font-bold uppercase tracking-[0.2em]">
                Limited
              </span>
            }
            {!isSoldOut && isOnSale &&
            <span className="px-2.5 py-1 bg-black/80 backdrop-blur text-white text-[9px] font-bold uppercase tracking-[0.2em]">
                −{discount}%
              </span>
            }
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => {e.preventDefault();e.stopPropagation();setIsLiked((l) => !l);}}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300"
            aria-label="Wishlist">
            
            <Heart
              className="w-4 h-4 transition-all"
              style={{
                fill: isLiked ? '#FF3366' : 'none',
                color: isLiked ? '#FF3366' : 'rgba(255,255,255,0.9)',
                filter: isLiked ? 'drop-shadow(0 0 4px rgba(255,51,102,0.7))' : 'none'
              }} />
            
          </button>

          {/* Add to bag — always visible on mobile, slides up on desktop hover */}
          {!isSoldOut &&
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 py-3.5 text-[10px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 ease-out"
            style={{
              background: added ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.88)',
              backdropFilter: 'blur(16px)',
              color: added ? '#000' : '#fff'
            }}>
              {added ? 'Added' : <><Plus className="w-3 h-3" />Add to Bag</>}
            </button>
          }
        </div>

        {/* Product info — editorial minimal */}
        <div className="pt-4 pb-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] uppercase tracking-[0.3em] font-medium mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {product.collection || 'SKRTLIFE'}
              </p>
              <h3 className="text-sm font-medium leading-snug line-clamp-2" style={{ color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.01em' }}>
                {product.title}
              </h3>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-sm font-semibold text-white">${product.price}</span>
            {isOnSale &&
            <span className="text-xs line-through" style={{ color: 'rgba(255,255,255,0.28)' }}>
                ${product.compare_at_price}
              </span>
            }
          </div>

          {/* Sizes — compact dots */}
          {product.available_sizes?.length > 0 &&
          <div className="flex gap-1.5 mt-2.5 flex-wrap">
              {product.available_sizes.slice(0, 6).map((s) =>
            <span key={s} className="text-[8px] uppercase tracking-wider px-1.5 py-0.5"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.1em'
            }}>
                  {s}
                </span>
            )}
            </div>
          }
        </div>
      </Link>
    </div>);

}