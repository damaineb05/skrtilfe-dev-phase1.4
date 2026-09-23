import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Armchair, Trash2, Copy, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Furniture catalog
export const FURNITURE_CATALOG = [
  {
    id: 'couch-modern-1',
    name: 'Modern Couch',
    category: 'seating',
    style: 'modern',
    glbUrl: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/ABeautifulGame/glTF-Binary/ABeautifulGame.glb',
    thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    dimensions: { w: 2.2, h: 0.8, d: 0.9 },
    snapPoints: [{ position: [0, 0.45, 0], rotation: [0, 0, 0] }]
  },
  {
    id: 'chair-modern-1',
    name: 'Lounge Chair',
    category: 'seating',
    style: 'modern',
    glbUrl: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/BarramundiFish/glTF-Binary/BarramundiFish.glb',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    dimensions: { w: 0.8, h: 1.0, d: 0.9 },
    snapPoints: [{ position: [0, 0.5, 0], rotation: [0, 0, 0] }]
  },
  {
    id: 'table-coffee-1',
    name: 'Coffee Table',
    category: 'table',
    style: 'modern',
    glbUrl: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Box/glTF-Binary/Box.glb',
    thumbnail: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=400',
    dimensions: { w: 1.2, h: 0.4, d: 0.6 }
  }
];

export default function FurnitureManager({ furniture, onAdd, onUpdate, onRemove, selectedId, onSelect }) {
  const [showCatalog, setShowCatalog] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', 'seating', 'table', 'decor'];
  
  const filteredCatalog = FURNITURE_CATALOG.filter(
    item => activeCategory === 'all' || item.category === activeCategory
  );

  const handleAddFromCatalog = (catalogItem) => {
    const newItem = {
      id: `${catalogItem.id}-${Date.now()}`,
      name: catalogItem.name,
      glbUrl: catalogItem.glbUrl,
      position: [Math.random() * 4 - 2, 0, Math.random() * 4 - 2],
      rotation: [0, 0, 0],
      scale: 1,
      category: catalogItem.category,
      snapPoints: catalogItem.snapPoints || [],
      metadata: catalogItem
    };
    
    onAdd(newItem);
    setShowCatalog(false);
  };

  const handleDuplicate = (item) => {
    const duplicated = {
      ...item,
      id: `${item.id}-copy-${Date.now()}`,
      position: [item.position[0] + 0.5, item.position[1], item.position[2] + 0.5]
    };
    onAdd(duplicated);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Armchair className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white uppercase tracking-wider">Furniture</h3>
        </div>
        <Button
          onClick={() => setShowCatalog(!showCatalog)}
          size="sm"
          className="bg-purple-500 hover:bg-purple-600 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Catalog Modal */}
      <AnimatePresence>
        {showCatalog && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-zinc-900 border border-purple-500/30 rounded-xl p-4 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-purple-400 uppercase text-sm">Catalog</h4>
              <button onClick={() => setShowCatalog(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Category filters */}
            <div className="flex gap-2 mb-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    activeCategory === cat
                      ? 'bg-purple-500 text-white'
                      : 'bg-zinc-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Catalog grid */}
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              {filteredCatalog.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleAddFromCatalog(item)}
                  className="group text-left border-2 border-zinc-700 hover:border-purple-400 rounded-lg overflow-hidden transition-all"
                >
                  <div className="aspect-video bg-zinc-800 relative">
                    {item.thumbnail && (
                      <img 
                        src={item.thumbnail} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus className="w-8 h-8 text-purple-400" />
                    </div>
                  </div>
                  <div className="p-2 bg-zinc-900">
                    <div className="font-medium text-sm text-white">{item.name}</div>
                    <div className="text-[10px] text-gray-500">{item.category}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Furniture List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {furniture.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No furniture added yet
          </div>
        ) : (
          furniture.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedId === item.id
                  ? 'border-purple-400 bg-purple-500/20'
                  : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => onSelect(item.id)}
                  className="flex-1 text-left"
                >
                  <div className="font-medium text-sm text-white">{item.name}</div>
                  <div className="text-[10px] text-gray-500">
                    {item.category} • ({item.position[0].toFixed(1)}, {item.position[2].toFixed(1)})
                  </div>
                </button>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => handleDuplicate(item)}
                    className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-400"
                    title="Duplicate"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-1.5 rounded bg-zinc-800 hover:bg-red-600 text-red-400 hover:text-white"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}