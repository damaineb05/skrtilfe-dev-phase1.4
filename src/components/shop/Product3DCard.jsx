import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Product3DCard({ product, onAddToCart }) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateXValue = (mouseY / (rect.height / 2)) * -15;
    const rotateYValue = (mouseX / (rect.width / 2)) * 15;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const primaryImage = product.media?.find(m => m.is_primary)?.url || product.media?.[0]?.url;

  return (
    <motion.div
      ref={cardRef}
      className="relative group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
      }}
    >
      <motion.div
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-white/10"
        animate={{
          rotateX: rotateX,
          rotateY: rotateY,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glow effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${50 + rotateY * 2}% ${50 - rotateX * 2}%, rgba(0, 212, 255, 0.3) 0%, transparent 60%)`,
          }}
        />

        {/* Product Image Container */}
        <div className="relative aspect-square overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
          
          {/* Main image with 3D float effect */}
          <motion.img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-contain p-6"
            style={{
              transformStyle: 'preserve-3d',
            }}
            animate={{
              translateZ: isHovered ? 50 : 0,
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 25,
            }}
          />

          {/* Reflection/shadow underneath */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 blur-xl"
            style={{
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
            }}
            animate={{
              scaleX: isHovered ? 1.2 : 1,
              opacity: isHovered ? 0.8 : 0.4,
            }}
          />

          {/* Floating particles */}
          {isHovered && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-cyan-400"
                  initial={{ 
                    x: Math.random() * 100 + '%', 
                    y: '100%',
                    opacity: 0 
                  }}
                  animate={{ 
                    y: '-20%',
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                  style={{
                    boxShadow: '0 0 10px rgba(0, 212, 255, 0.8)',
                  }}
                />
              ))}
            </>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="absolute top-4 left-4 flex gap-2" style={{ transform: 'translateZ(60px)' }}>
              {product.tags.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-full backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <motion.div
            className="absolute bottom-4 right-4 flex gap-2"
            style={{ transform: 'translateZ(60px)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          >
            <Link
              to={createPageUrl(`ProductDetail?id=${product.id}`)}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-cyan-500/30 hover:border-cyan-400 transition-all"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.(product);
              }}
              className="w-10 h-10 rounded-full bg-cyan-500/20 backdrop-blur-xl border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/40 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Product Info */}
        <div 
          className="p-4 relative"
          style={{ transform: 'translateZ(30px)' }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-white text-sm line-clamp-1">{product.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{product.collection}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-cyan-400">${product.price}</p>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <p className="text-xs text-gray-500 line-through">${product.compare_at_price}</p>
              )}
            </div>
          </div>

          {/* Color swatches */}
          {product.available_colors?.length > 0 && (
            <div className="flex gap-1 mt-3">
              {product.available_colors.slice(0, 4).map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              {product.available_colors.length > 4 && (
                <span className="text-xs text-gray-500 ml-1">+{product.available_colors.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* 3D border glow */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: `
              inset 0 0 30px rgba(0, 212, 255, 0.1),
              0 0 30px rgba(0, 212, 255, 0.2),
              0 10px 40px rgba(0, 0, 0, 0.5)
            `,
          }}
        />
      </motion.div>

      {/* 3D Featured badge */}
      {product.is_featured && (
        <motion.div
          className="absolute -top-2 -right-2 z-10"
          style={{ transform: 'translateZ(80px)' }}
          animate={{
            rotateZ: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}