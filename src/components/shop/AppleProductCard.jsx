import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Zap } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Float } from '@react-three/drei';

// Floating 3D model for digital/NFT products
function FloatingModel({ url }) {
  const { scene } = useGLTF(url);
  useFrame((state) => {
    scene.rotation.y = state.clock.elapsedTime * 0.4;
  });
  return <primitive object={scene} scale={1.4} />;
}

function Digital3DPreview({ modelUrl }) {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 45 }} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, -5, -5]} intensity={0.4} color="#00D4FF" />
      <Suspense fallback={null}>
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
          <FloatingModel url={modelUrl} />
        </Float>
        <Environment preset="studio" />
      </Suspense>
    </Canvas>
  );
}

export default function AppleProductCard({ product, onAddToCart, onQuickView, index = 0, compact = false }) {
  const [isLiked, setIsLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const isDigital = ['nft', '3d_nft', 'wearable'].includes(product.product_type);
  const hasModel = isDigital && product.model_3d_url;
  const imageUrl = product.media?.[0]?.url || 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&q=80';
  const isSoldOut = (product.inventory_qty ?? 1) === 0;
  const isLowStock = !isSoldOut && (product.inventory_qty ?? 99) <= (product.low_stock_threshold ?? 5);
  const discount = product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;
    onAddToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`} className="block">
        {/* Card */}
        <div className={`relative bg-[#111118] rounded-2xl overflow-hidden border border-white/[0.06] group-hover:border-white/[0.14] transition-all duration-500 ${compact ? '' : 'group-hover:-translate-y-1'}`}
          style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>

          {/* Media Container */}
          <div className={`relative overflow-hidden ${compact ? 'aspect-square' : 'aspect-[3/4]'} bg-[#0D0D14]`}>
            {hasModel ? (
              <Digital3DPreview modelUrl={product.model_3d_url} />
            ) : (
              <img
                src={imageUrl}
                alt={product.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${isSoldOut ? 'opacity-50 grayscale' : 'group-hover:scale-[1.04]'}`}
              />
            )}

            {/* Subtle gradient at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-transparent to-transparent opacity-80" />

            {/* Digital product glow pulse */}
            {isDigital && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00D4FF]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF3366]/30 to-transparent" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {isSoldOut && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-black/80 text-white/60 backdrop-blur-sm border border-white/10">Sold Out</span>
              )}
              {!isSoldOut && isLowStock && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-amber-500/90 text-black backdrop-blur-sm">Low Stock</span>
              )}
              {!isSoldOut && product.tags?.includes('Limited') && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-[#FF3366]/90 text-white backdrop-blur-sm">Limited</span>
              )}
              {isDigital && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-[#00D4FF]/20 text-[#00D4FF] backdrop-blur-sm border border-[#00D4FF]/30">
                  <Zap className="w-2.5 h-2.5 inline mr-0.5" />Digital
                </span>
              )}
              {discount && !isSoldOut && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-white/10 text-white backdrop-blur-sm">-{discount}%</span>
              )}
            </div>

            {/* Hover actions */}
            {!compact && (
              <motion.div
                className="absolute inset-0 flex items-end justify-center pb-5 gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AnimatePresence>
                  {!isSoldOut && (
                    <motion.button
                      key="cart"
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 0 }}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-100 flex items-center gap-2 shadow-xl"
                      onClick={handleAddToCart}
                      style={{ transitionDelay: '0.05s' }}
                    >
                      {addedToCart ? (
                        <span className="text-green-600">✓ Added</span>
                      ) : (
                        <><ShoppingBag className="w-3.5 h-3.5" /> Add to Bag</>
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1 font-medium">{product.collection || 'SKRTLIFE'}</p>
            <h3 className="text-white/90 font-semibold text-sm leading-tight mb-3 truncate">{product.title}</h3>

            {/* Size dots */}
            {product.available_sizes?.length > 0 && (
              <div className="flex gap-1 mb-3 flex-wrap">
                {product.available_sizes.slice(0, 5).map(s => (
                  <span key={s} className="text-[9px] font-bold text-white/30 border border-white/10 rounded px-1.5 py-0.5 uppercase">{s}</span>
                ))}
              </div>
            )}

            {/* Color swatches */}
            {product.available_colors?.length > 0 && (
              <div className="flex gap-1.5 mb-3">
                {product.available_colors.slice(0, 5).map((c, i) => (
                  <div key={i} className="w-3.5 h-3.5 rounded-full border border-white/20 ring-1 ring-transparent hover:ring-white/40 transition-all cursor-pointer"
                    style={{ backgroundColor: c.hex || '#888' }} title={c.name} />
                ))}
                {product.available_colors.length > 5 && (
                  <span className="text-[9px] text-white/30 self-center">+{product.available_colors.length - 5}</span>
                )}
              </div>
            )}

            <div className="flex items-baseline justify-between">
              <span className="text-white font-bold text-base">${product.price?.toFixed(2)}</span>
              {product.compare_at_price > product.price && (
                <span className="text-white/25 text-xs line-through">${product.compare_at_price?.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Floating like button */}
      <button
        onClick={(e) => { e.preventDefault(); setIsLiked(l => !l); }}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
          isLiked ? 'bg-[#FF3366] text-white scale-110' : 'bg-black/40 text-white/40 hover:text-white hover:bg-black/60'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
      </button>
    </motion.div>
  );
}