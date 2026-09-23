import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shirt,
  ShoppingBag,
  Search,
  Check,
  Package,
  Star,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock inventory with free RPM assets and placeholder wearables
const MOCK_INVENTORY = [
  // Headwear
  {
    id: 'hat_beanie_1',
    name: 'Cyber Beanie',
    category: 'headwear',
    bone: 'Head',
    thumbnail: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=200&h=200&fit=crop',
    url: 'https://models.readyplayer.me/64bfa97f0e72c63d7c3934f7.glb', // Example RPM asset
    rarity: 'common',
    tags: ['casual', 'streetwear'],
    price: 0,
    owned: true
  },
  {
    id: 'hat_cap_1',
    name: 'Snapback Cap',
    category: 'headwear',
    bone: 'Head',
    thumbnail: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200&h=200&fit=crop',
    url: null,
    rarity: 'common',
    tags: ['casual', 'sports'],
    price: 0,
    owned: true
  },
  {
    id: 'hat_fedora_1',
    name: 'Neo Fedora',
    category: 'headwear',
    bone: 'Head',
    thumbnail: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=200&h=200&fit=crop',
    url: null,
    rarity: 'rare',
    tags: ['formal', 'classic'],
    price: 0,
    owned: true
  },
  
  // Eyewear
  {
    id: 'glasses_aviator_1',
    name: 'Aviator Shades',
    category: 'eyewear',
    bone: 'Head',
    thumbnail: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop',
    url: null,
    rarity: 'common',
    tags: ['cool', 'classic'],
    price: 0,
    owned: true
  },
  {
    id: 'glasses_cyber_1',
    name: 'Cyber Visor',
    category: 'eyewear',
    bone: 'Head',
    thumbnail: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=200&h=200&fit=crop',
    url: null,
    rarity: 'epic',
    tags: ['futuristic', 'tech'],
    price: 0,
    owned: true
  },

  // Tops
  {
    id: 'top_hoodie_1',
    name: 'Tech Hoodie',
    category: 'top',
    bone: 'Spine1',
    thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop',
    url: null,
    rarity: 'rare',
    tags: ['streetwear', 'casual'],
    price: 0,
    owned: true
  },
  {
    id: 'top_jacket_1',
    name: 'Leather Jacket',
    category: 'top',
    bone: 'Spine1',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop',
    url: null,
    rarity: 'epic',
    tags: ['cool', 'classic'],
    price: 0,
    owned: true
  },
  {
    id: 'top_tshirt_1',
    name: 'Genesis Tee',
    category: 'top',
    bone: 'Spine1',
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
    url: null,
    rarity: 'common',
    tags: ['casual', 'basic'],
    price: 0,
    owned: true
  },

  // Bottoms
  {
    id: 'bottom_jeans_1',
    name: 'Distressed Jeans',
    category: 'bottom',
    bone: 'Hips',
    thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop',
    url: null,
    rarity: 'common',
    tags: ['casual', 'streetwear'],
    price: 0,
    owned: true
  },
  {
    id: 'bottom_cargo_1',
    name: 'Cargo Pants',
    category: 'bottom',
    bone: 'Hips',
    thumbnail: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=200&h=200&fit=crop',
    url: null,
    rarity: 'rare',
    tags: ['utility', 'streetwear'],
    price: 0,
    owned: true
  },

  // Footwear
  {
    id: 'shoes_sneakers_1',
    name: 'Quantum Sneakers',
    category: 'footwear',
    bone: 'LeftFoot',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
    url: null,
    rarity: 'epic',
    tags: ['sneakers', 'sports'],
    price: 0,
    owned: true
  },
  {
    id: 'shoes_boots_1',
    name: 'Combat Boots',
    category: 'footwear',
    bone: 'LeftFoot',
    thumbnail: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=200&h=200&fit=crop',
    url: null,
    rarity: 'rare',
    tags: ['boots', 'tactical'],
    price: 0,
    owned: true
  },

  // Accessories
  {
    id: 'accessory_watch_1',
    name: 'Smart Watch',
    category: 'accessory',
    bone: 'LeftHand',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
    url: null,
    rarity: 'rare',
    tags: ['tech', 'accessory'],
    price: 0,
    owned: true
  },
  {
    id: 'accessory_chain_1',
    name: 'Chain Necklace',
    category: 'accessory',
    bone: 'Neck',
    thumbnail: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop',
    url: null,
    rarity: 'epic',
    tags: ['jewelry', 'streetwear'],
    price: 0,
    owned: true
  },
  {
    id: 'accessory_backpack_1',
    name: 'Tech Backpack',
    category: 'accessory',
    bone: 'Spine',
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
    url: null,
    rarity: 'rare',
    tags: ['utility', 'bag'],
    price: 0,
    owned: true
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Package },
  { id: 'headwear', label: 'Headwear', icon: null },
  { id: 'eyewear', label: 'Eyewear', icon: null },
  { id: 'top', label: 'Tops', icon: Shirt },
  { id: 'bottom', label: 'Bottoms', icon: null },
  { id: 'footwear', label: 'Footwear', icon: null },
  { id: 'accessory', label: 'Accessories', icon: Star }
];

const RARITY_COLORS = {
  common: 'bg-gray-100 text-gray-700 border-gray-300',
  rare: 'bg-blue-100 text-blue-700 border-blue-300',
  epic: 'bg-purple-100 text-purple-700 border-purple-300',
  legendary: 'bg-yellow-100 text-yellow-700 border-yellow-300'
};

export default function InventoryPanel({ onEquipItem }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');

  const filteredItems = MOCK_INVENTORY.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || item.rarity === selectedRarity;
    return matchesSearch && matchesCategory && matchesRarity;
  });

  const handleEquip = (item) => {
    const wearable = {
      id: Date.now(),
      name: item.name,
      url: item.url || `https://via.placeholder.com/200?text=${encodeURIComponent(item.name)}`,
      bone: item.bone,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
      category: item.category,
      metadata: {
        rarity: item.rarity,
        tags: item.tags
      }
    };
    onEquipItem(wearable);
  };

  return (
    <div className="h-full flex flex-col bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider">Inventory</h3>
          <Badge variant="outline" className="text-xs">
            {filteredItems.length} Items
          </Badge>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.icon && <cat.icon className="w-3 h-3" />}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Rarity Filter */}
        <div className="flex gap-2">
          {['all', 'common', 'rare', 'epic', 'legendary'].map(rarity => (
            <button
              key={rarity}
              onClick={() => setSelectedRarity(rarity)}
              className={`flex-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                selectedRarity === rarity
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {rarity}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onEquip={handleEquip}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="outline"
          className="w-full"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Import Assets
        </Button>
      </div>
    </div>
  );
}

function InventoryItemCard({ item, onEquip }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative group cursor-pointer"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all">
        <img
          src={item.thumbnail}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        
        {/* Rarity Badge */}
        <div className="absolute top-2 left-2">
          <Badge className={`text-[10px] border ${RARITY_COLORS[item.rarity]}`}>
            {item.rarity}
          </Badge>
        </div>

        {/* Owned Indicator */}
        {item.owned && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={() => onEquip(item)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Shirt className="w-3 h-3 mr-1" />
            Equip
          </Button>
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <p className="text-white text-xs font-medium truncate">
            {item.name}
          </p>
          <p className="text-white/70 text-[10px]">
            {item.category}
          </p>
        </div>
      </div>
    </motion.div>
  );
}