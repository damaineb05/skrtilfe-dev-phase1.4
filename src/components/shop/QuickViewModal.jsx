import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, ArrowRight, Loader2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80';

export default function QuickViewModal({ product, isOpen, onClose, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(product?.available_colors?.[0]?.name || null);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const imageUrl = (!imgError && product.media?.[0]?.url) ? product.media[0].url : FALLBACK_IMG;
  const isOnSale = product.compare_at_price > product.price;

  const handleAddToCart = async () => {
    if (product.available_sizes?.length > 0 && !selectedSize) return;

    setIsAdding(true);

    const variant = product.variants?.find(
      v => v.color === selectedColor && v.size === selectedSize
    );

    const cartItem = {
      product_id: product.id,
      title: product.title,
      price: variant?.price || product.price,
      image_url: product.media?.[0]?.url,
      quantity: 1,
      color: selectedColor,
      size: selectedSize,
      variant_sku: variant?.sku || product.sku,
    };

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.variant_sku === cartItem.variant_sku);
    if (existingIndex > -1) cart[existingIndex].quantity += 1;
    else cart.push(cartItem);

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    setIsAdding(false);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 900);
  };

  const needsSize = product.available_sizes?.length > 0;
  const canAdd = !needsSize || selectedSize;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[9980]"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9981] w-[95vw] max-w-3xl max-h-[90vh] overflow-hidden"
            style={{
              background: '#0D0D16',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
            }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid md:grid-cols-2 overflow-y-auto max-h-[90vh]">
              {/* Image */}
              <div className="relative bg-[#111116]" style={{ aspectRatio: '3/4', minHeight: 300 }}>
                <img
                  src={imageUrl}
                  alt={product.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
                {/* Sale badge */}
                {isOnSale && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em]"
                    style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                    −{Math.round((1 - product.price / product.compare_at_price) * 100)}%
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col p-6 md:p-8 overflow-y-auto">
                <p className="text-[9px] uppercase tracking-[0.3em] font-medium mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {product.collection || 'SKRTLIFE'}
                </p>
                <h2 className="text-xl font-bold text-white mb-4 leading-tight" style={{ letterSpacing: '-0.02em' }}>
                  {product.title}
                </h2>

                {/* Price */}
                <div className="flex items-baseline gap-2.5 mb-5">
                  <span className="text-2xl font-bold text-white">${product.price}</span>
                  {isOnSale && (
                    <span className="text-sm line-through" style={{ color: 'rgba(255,255,255,0.28)' }}>
                      ${product.compare_at_price}
                    </span>
                  )}
                </div>

                {product.description && (
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {product.description}
                  </p>
                )}

                {/* Color */}
                {product.available_colors?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Color — {selectedColor}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {product.available_colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className="w-8 h-8 rounded-full transition-all"
                          style={{
                            backgroundColor: color.hex,
                            outline: selectedColor === color.name ? '2px solid rgba(255,255,255,0.8)' : '2px solid transparent',
                            outlineOffset: '2px',
                          }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size */}
                {needsSize && (
                  <div className="mb-6">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Size {!selectedSize && <span style={{ color: '#FF3366' }}>— Select one</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.available_sizes.map((size) => {
                        const active = selectedSize === size;
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className="px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all"
                            style={{
                              background: active ? '#fff' : 'transparent',
                              color: active ? '#000' : 'rgba(255,255,255,0.5)',
                              border: `1px solid ${active ? '#fff' : 'rgba(255,255,255,0.15)'}`,
                            }}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto pt-5 space-y-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <button
                    onClick={handleAddToCart}
                    disabled={!canAdd || isAdding}
                    className="w-full py-4 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-200"
                    style={{
                      background: added ? 'rgba(0,212,255,0.15)' : canAdd ? '#fff' : 'rgba(255,255,255,0.08)',
                      color: added ? '#00D4FF' : canAdd ? '#000' : 'rgba(255,255,255,0.25)',
                      border: added ? '1px solid rgba(0,212,255,0.3)' : 'none',
                      cursor: canAdd ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> :
                     added ? <><Check className="w-4 h-4" /> Added to Bag</> :
                     <><ShoppingCart className="w-4 h-4" /> Add to Bag</>}
                  </button>

                  <Link
                    to={createPageUrl('ProductDetail') + `?id=${product.id}`}
                    onClick={onClose}
                    className="w-full py-3.5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-200"
                    style={{
                      background: 'transparent',
                      color: 'rgba(255,255,255,0.45)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    View Full Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}