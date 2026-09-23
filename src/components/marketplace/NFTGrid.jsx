import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, Zap, Tag, Crown, Diamond, Star, Shield, Layers } from 'lucide-react';

const RARITY_TIERS = {
  legendary: { label: 'Legendary', bg: 'from-yellow-400 to-orange-500', icon: Crown },
  epic:      { label: 'Epic',      bg: 'from-purple-500 to-pink-500',   icon: Diamond },
  rare:      { label: 'Rare',      bg: 'from-blue-500 to-cyan-500',     icon: Star },
  uncommon:  { label: 'Uncommon',  bg: 'from-green-500 to-emerald-500', icon: Shield },
  common:    { label: 'Common',    bg: 'from-gray-500 to-gray-600',     icon: Layers },
};

const getRarity = (score) => {
  if (score >= 95) return 'legendary';
  if (score >= 85) return 'epic';
  if (score >= 70) return 'rare';
  if (score >= 50) return 'uncommon';
  return 'common';
};

const IMAGES = [
  'https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=500',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
  'https://images.unsplash.com/photo-1617791160588-241658c0f566?w=500',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500',
];

function NFTCard({ nft, onOffer }) {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const tier = RARITY_TIERS[getRarity(nft.rarityScore)];
  const TierIcon = tier.icon;
  const img = IMAGES[parseInt(nft.id.replace('nft_', '')) % IMAGES.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group cursor-pointer"
    >
      <div className="rounded-2xl overflow-hidden border border-white/8 hover:border-white/20 transition-all duration-300"
        style={{ background: 'rgba(255,255,255,0.03)' }}>

        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <img src={img} alt={nft.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Rarity */}
          <div className={`absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${tier.bg}`}>
            <TierIcon className="w-3 h-3 text-white" />
            <span className="text-[10px] font-bold text-white">{tier.label}</span>
          </div>

          {/* Rank */}
          <div className="absolute top-3 right-3 text-[10px] font-mono text-white/60 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            #{nft.rank}
          </div>

          {/* Hover actions */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 backdrop-blur-sm"
              >
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-colors">
                  <Zap className="w-3.5 h-3.5" /> Buy Now
                </button>
                <button onClick={(e) => { e.stopPropagation(); onOffer(nft); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/30 text-white text-xs font-bold hover:bg-white/10 transition-colors">
                  <Tag className="w-3.5 h-3.5" /> Offer
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[10px] text-[#00D4FF] uppercase tracking-widest truncate mb-1">{nft.collection}</p>
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-white text-sm truncate flex-1">{nft.name}</h3>
            <button onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }}
              className={`ml-2 flex-shrink-0 transition-colors ${liked ? 'text-[#FF3366]' : 'text-white/30 hover:text-white/60'}`}>
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="flex items-end justify-between mt-3 pt-3 border-t border-white/8">
            <div>
              <p className="text-[10px] text-white/40 mb-0.5">Price</p>
              <p className="font-black text-white">{nft.price.toFixed(3)} <span className="text-[#00D4FF] text-xs">ETH</span></p>
            </div>
            <div className="flex items-center gap-3 text-white/30 text-xs">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{nft.views}</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{nft.likes}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function NFTGrid({ nfts, onOffer }) {
  if (!nfts.length) {
    return (
      <div className="text-center py-24">
        <Layers className="w-12 h-12 text-white/15 mx-auto mb-4" />
        <p className="text-white/40 text-sm">No items match your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {nfts.map(nft => <NFTCard key={nft.id} nft={nft} onOffer={onOffer} />)}
    </div>
  );
}