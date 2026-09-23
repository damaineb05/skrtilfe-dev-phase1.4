import React, { useState } from 'react';
import { Ruler } from 'lucide-react';
import SizeGuideModal from './SizeGuideModal';

export default function VariantSelector({
  product, selectedColor, setSelectedColor,
  selectedSize, setSelectedSize, quantity, setQuantity
}) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const showColors = product.available_colors?.length > 0;
  const showSizes = product.available_sizes?.length > 0;

  return (
    <div className="space-y-5">
      {/* Colors */}
      {showColors && (
        <div>
          <p className="text-xs text-black/50 mb-2.5 uppercase tracking-widest font-medium">
            Colour — <span className="text-black font-semibold">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {product.available_colors.map(color => (
              <button
                key={color.name}
                title={color.name}
                onClick={() => setSelectedColor(color.name)}
                className="w-7 h-7 rounded-full transition-all"
                style={{
                  backgroundColor: color.hex,
                  outline: selectedColor === color.name ? '2px solid #000' : '2px solid transparent',
                  outlineOffset: '2px',
                  border: '1px solid rgba(0,0,0,0.15)'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {showSizes && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs text-black/50 uppercase tracking-widest font-medium">Size</p>
            <button
              onClick={() => setShowSizeGuide(true)}
              className="text-xs text-black underline underline-offset-2 flex items-center gap-1"
            >
              <Ruler className="w-3 h-3" />
              Size guide
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {product.available_sizes.map(size => {
              const active = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className="min-w-[52px] h-10 px-3 text-xs font-medium border transition-all"
                  style={{
                    background: active ? '#000' : '#fff',
                    borderColor: active ? '#000' : '#d4d4d4',
                    color: active ? '#fff' : '#000',
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Qty — minimal, inline */}
      <div>
        <p className="text-xs text-black/50 mb-2.5 uppercase tracking-widest font-medium">Qty</p>
        <div className="inline-flex items-center border border-[#d4d4d4]">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center text-black hover:bg-black/5 transition-colors text-base"
          >−</button>
          <span className="w-8 text-center text-sm font-medium text-black">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="w-9 h-9 flex items-center justify-center text-black hover:bg-black/5 transition-colors text-base"
          >+</button>
        </div>
      </div>

      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </div>
  );
}