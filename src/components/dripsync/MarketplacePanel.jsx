import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  ShoppingBag,
  Heart,
  Eye,
  Star,
  ExternalLink,
  Loader2,
  Check,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Simulated marketplace data - In production, this would come from an API
const MARKETPLACE_ITEMS = [
  {
    id: 'mp-1',
    name: 'Cyber Punk Jacket',
    description: 'Neon-lit leather jacket with animated RGB strips',
    price: 49.99,
    currency: 'USD',
    category: 'top',
    slot: 'top',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop',
    model_url: 'https://cdn.jsdelivr.net/gh/AsoboStudio/glTF-Sample-Models@master/2.0/RiggedSimple/glTF-Binary/RiggedSimple.glb',
    bone: 'Spine',
    creator: 'CyberWear Co',
    rating: 4.8,
    reviews: 124,
    featured: true,
    tags: ['cyberpunk', 'neon', 'jacket'],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1
  },
  {
    id: 'mp-2',
    name: 'Holographic Sneakers',
    description: 'Limited edition iridescent sneakers with glow effect',
    price: 35.00,
    currency: 'USD',
    category: 'footwear',
    slot: 'shoes',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
    model_url: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Box/glTF-Binary/Box.glb',
    bone: 'LeftFoot',
    creator: 'HoloKicks',
    rating: 4.9,
    reviews: 89,
    featured: true,
    tags: ['holographic', 'sneakers', 'limited'],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 0.1
  },
  {
    id: 'mp-3',
    name: 'Tech Visor',
    description: 'Futuristic AR visor with HUD display animations',
    price: 25.00,
    currency: 'USD',
    category: 'headwear',
    slot: 'eyewear',
    thumbnail: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=300&h=300&fit=crop',
    model_url: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Box/glTF-Binary/Box.glb',
    bone: 'Head',
    creator: 'TechVision',
    rating: 4.7,
    reviews: 56,
    featured: false,
    tags: ['visor', 'tech', 'AR'],
    position: [0, 0.1, 0.1],
    rotation: [0, 0, 0],
    scale: 0.05
  },
  {
    id: 'mp-4',
    name: 'Neon Wings',
    description: 'Animated LED wings with customizable colors',
    price: 75.00,
    currency: 'USD',
    category: 'accessory',
    slot: 'accessory',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop',
    model_url: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Box/glTF-Binary/Box.glb',
    bone: 'Spine',
    creator: 'AuraFX',
    rating: 5.0,
    reviews: 203,
    featured: true,
    tags: ['wings', 'neon', 'animated'],
    position: [0, 0.2, -0.2],
    rotation: [0, 0, 0],
    scale: 0.3
  },
  {
    id: 'mp-5',
    name: 'Street Hoodie',
    description: 'Urban streetwear hoodie with graffiti patterns',
    price: 29.99,
    currency: 'USD',
    category: 'top',
    slot: 'top',
    thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop',
    model_url: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Box/glTF-Binary/Box.glb',
    bone: 'Spine',
    creator: 'StreetStyle',
    rating: 4.6,
    reviews: 78,
    featured: false,
    tags: ['streetwear', 'hoodie', 'urban'],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1
  },
  {
    id: 'mp-6',
    name: 'Crystal Crown',
    description: 'Ethereal crown with floating crystal shards',
    price: 55.00,
    currency: 'USD',
    category: 'headwear',
    slot: 'headwear',
    thumbnail: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=300&h=300&fit=crop',
    model_url: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Box/glTF-Binary/Box.glb',
    bone: 'Head',
    creator: 'CrystalWorks',
    rating: 4.9,
    reviews: 145,
    featured: true,
    tags: ['crown', 'crystal', 'royalty'],
    position: [0, 0.15, 0],
    rotation: [0, 0, 0],
    scale: 0.08
  },
  {
    id: 'mp-7',
    name: 'Cargo Pants',
    description: 'Tactical cargo pants with utility pockets',
    price: 32.00,
    currency: 'USD',
    category: 'bottom',
    slot: 'bottom',
    thumbnail: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&h=300&fit=crop',
    model_url: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Box/glTF-Binary/Box.glb',
    bone: 'Hips',
    creator: 'TactiWear',
    rating: 4.5,
    reviews: 67,
    featured: false,
    tags: ['cargo', 'pants', 'tactical'],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1
  },
  {
    id: 'mp-8',
    name: 'Flame Gauntlets',
    description: 'Animated fire effect gloves',
    price: 42.00,
    currency: 'USD',
    category: 'accessory',
    slot: 'gloves',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    model_url: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Box/glTF-Binary/Box.glb',
    bone: 'LeftHand',
    creator: 'PyroGear',
    rating: 4.8,
    reviews: 92,
    featured: false,
    tags: ['gloves', 'fire', 'animated'],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 0.05
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'top', label: 'Tops' },
  { id: 'bottom', label: 'Bottoms' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'headwear', label: 'Headwear' },
  { id: 'accessory', label: 'Accessories' }
];

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'newest', label: 'Newest' }
];

export default function MarketplacePanel({ onTryOn, onAddToInventory, equippedItems = [] }) {
  const [items, setItems] = useState(MARKETPLACE_ITEMS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [favorites, setFavorites] = useState([]);
  const [tryingOn, setTryingOn] = useState(null);
  const [addingToInventory, setAddingToInventory] = useState(null);

  // Simulate API fetch
  useEffect(() => {
    const fetchMarketplace = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setItems(MARKETPLACE_ITEMS);
      setLoading(false);
    };
    fetchMarketplace();
  }, []);

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'newest': return b.id.localeCompare(a.id);
        case 'featured':
        default:
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
      }
    });

  const toggleFavorite = (itemId) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleTryOn = async (item) => {
    setTryingOn(item.id);
    
    // Create wearable object for the viewport
    const wearable = {
      id: Date.now(),
      name: item.name,
      url: item.model_url,
      bone: item.bone,
      position: item.position,
      rotation: item.rotation,
      scale: item.scale,
      slot: item.slot,
      fromMarketplace: true,
      marketplaceId: item.id,
      metadata: {
        price: item.price,
        creator: item.creator,
        thumbnail: item.thumbnail
      }
    };

    if (onTryOn) {
      await onTryOn(wearable);
    }
    
    setTimeout(() => setTryingOn(null), 1000);
  };

  const handleAddToInventory = async (item) => {
    setAddingToInventory(item.id);
    
    const inventoryItem = {
      id: `inv-${Date.now()}`,
      name: item.name,
      url: item.model_url,
      bone: item.bone,
      position: item.position,
      rotation: item.rotation,
      scale: item.scale,
      slot: item.slot,
      thumbnail: item.thumbnail,
      marketplaceId: item.id,
      purchasedAt: new Date().toISOString(),
      metadata: {
        price: item.price,
        creator: item.creator,
        category: item.category
      }
    };

    if (onAddToInventory) {
      await onAddToInventory(inventoryItem);
    }
    
    setTimeout(() => setAddingToInventory(null), 1000);
  };

  const isEquipped = (itemId) => {
    return equippedItems.some(w => w.marketplaceId === itemId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Marketplace</h3>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
            {filteredItems.length} Items
          </Badge>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search wearables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 items-center">
          {/* Category Pills */}
          <div className="flex-1 flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-[10px] bg-gray-900/50 border-gray-700 text-gray-400">
                <Filter className="w-3 h-3 mr-1" />
                Sort
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-700">
              {SORT_OPTIONS.map(opt => (
                <DropdownMenuItem
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={sortBy === opt.id ? 'text-cyan-400' : 'text-gray-300'}
                >
                  {opt.label}
                  {sortBy === opt.id && <Check className="w-3 h-3 ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <MarketplaceItemCard
                  key={item.id}
                  item={item}
                  isFavorite={favorites.includes(item.id)}
                  isEquipped={isEquipped(item.id)}
                  isTryingOn={tryingOn === item.id}
                  isAddingToInventory={addingToInventory === item.id}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                  onTryOn={() => handleTryOn(item)}
                  onAddToInventory={() => handleAddToInventory(item)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-cyan-500/30 bg-gray-900/50">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>Powered by SKRTLIFE Marketplace</span>
          <a href="#" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            View Full Store <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function MarketplaceItemCard({ 
  item, 
  isFavorite, 
  isEquipped,
  isTryingOn,
  isAddingToInventory,
  onToggleFavorite, 
  onTryOn,
  onAddToInventory 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`relative overflow-hidden bg-gray-900/50 border transition-all ${
        isEquipped 
          ? 'border-green-500/50 ring-1 ring-green-500/30' 
          : 'border-gray-700 hover:border-cyan-500/50'
      }`}>
        {/* Thumbnail */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={item.thumbnail}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {item.featured && (
              <Badge className="text-[8px] bg-yellow-500/80 text-black border-0">
                <Star className="w-2 h-2 mr-0.5" />
                Featured
              </Badge>
            )}
            {isEquipped && (
              <Badge className="text-[8px] bg-green-500/80 text-white border-0">
                <Check className="w-2 h-2 mr-0.5" />
                Equipped
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-black/50 text-white/70 hover:bg-black/70'
            }`}
          >
            <Heart className={`w-3 h-3 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Quick Actions */}
          <div className="absolute bottom-2 left-2 right-2 flex gap-1">
            <Button
              onClick={onTryOn}
              disabled={isTryingOn}
              size="sm"
              className="flex-1 h-7 text-[10px] bg-cyan-500/90 hover:bg-cyan-400 text-black font-bold"
            >
              {isTryingOn ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Try On
                </>
              )}
            </Button>
            <Button
              onClick={onAddToInventory}
              disabled={isAddingToInventory}
              size="sm"
              className="h-7 w-7 p-0 bg-green-500/90 hover:bg-green-400 text-black"
            >
              {isAddingToInventory ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <ShoppingBag className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-2">
          <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
          <p className="text-[10px] text-gray-500 truncate">{item.creator}</p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-bold text-cyan-400">${item.price}</span>
            <div className="flex items-center gap-1 text-[10px] text-yellow-400">
              <Star className="w-3 h-3 fill-current" />
              {item.rating}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}