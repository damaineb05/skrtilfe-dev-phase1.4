import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'headwear', label: 'Headwear' },
  { id: 'top', label: 'Tops' },
  { id: 'bottom', label: 'Bottoms' },
  { id: 'full_body', label: 'Full Fits' },
  { id: 'accessory', label: 'Accessories' },
];

export default function ClosetModule({ onEquip, currentlyWearing = [] }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const products = await base44.entities.Product.filter({
        product_type: 'wearable',
        status: 'active'
      }, '-created_date', 50);
      setItems(products || []);
    } catch (error) {
      console.error('Failed to load closet items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.wearable_slot === selectedCategory);

  const getMoodColor = (mood) => {
    const colors = {
      Calm: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      Bold: 'bg-red-500/20 text-red-300 border-red-500/30',
      Playful: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      Focused: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      Expressive: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      Mysterious: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    };
    return colors[mood] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                : 'bg-zinc-800/50 text-gray-400 border border-zinc-700 hover:bg-zinc-700/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No items in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item, idx) => {
              const isWearing = currentlyWearing.includes(item.id);
              const image = item.media?.find(m => m.is_primary)?.url || item.media?.[0]?.url;
              const metadata = item.item_metadata || {};

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => !isWearing && onEquip(item)}
                  className={`group cursor-pointer ${isWearing ? 'opacity-50' : ''}`}
                >
                  <div className={`relative aspect-square rounded-lg overflow-hidden bg-zinc-800/50 border transition-all ${
                    isWearing 
                      ? 'border-green-500/50' 
                      : 'border-zinc-700 group-hover:border-cyan-500/50'
                  }`}>
                    {image && (
                      <img
                        src={image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {isWearing && (
                      <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                        <Badge className="bg-green-500/80 text-black border-0">WEARING</Badge>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-bold text-white truncate">{item.title}</p>
                    {metadata.mood && (
                      <Badge className={`text-[10px] ${getMoodColor(metadata.mood)}`}>
                        {metadata.mood}
                      </Badge>
                    )}
                    {metadata.social_tone && (
                      <p className="text-[10px] text-gray-500">Tone: {metadata.social_tone}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}