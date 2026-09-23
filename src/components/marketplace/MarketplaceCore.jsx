import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Search,
  Coins,
  Star,
  Heart,
  Eye,
  Package,
  Sparkles,
  ArrowUpDown,
  Loader2,
  Shirt,
  Footprints,
  Crown,
  Gem,
  Zap
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


import { motion, AnimatePresence } from 'framer-motion';

const RARITY_COLORS = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500'
};

const RARITY_GLOW = {
  common: '',
  uncommon: 'shadow-[0_0_10px_rgba(34,197,94,0.3)]',
  rare: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]',
  epic: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
  legendary: 'shadow-[0_0_25px_rgba(234,179,8,0.6)]'
};

const CATEGORY_ICONS = {
  headwear: Crown,
  top: Shirt,
  bottom: Shirt,
  footwear: Footprints,
  accessory: Gem,
  full_outfit: Package,
  environment: Sparkles,
  animation: Zap,
  effect: Star
};

export function useWallet(userEmail) {
  const queryClient = useQueryClient();
  
  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const wallets = await base44.entities.VirtualCurrency.filter({ user_email: userEmail });
      if (wallets.length === 0) {
        // Create wallet with starting balance
        const newWallet = await base44.entities.VirtualCurrency.create({
          user_email: userEmail,
          balance: 500, // Starting coins
          lifetime_earned: 500,
          lifetime_spent: 0
        });
        return newWallet;
      }
      return wallets[0];
    },
    enabled: !!userEmail
  });

  const updateBalance = useMutation({
    mutationFn: async ({ amount, type }) => {
      if (!wallet) return;
      const newBalance = type === 'add' ? wallet.balance + amount : wallet.balance - amount;
      const updates = {
        balance: newBalance,
        ...(type === 'add' ? { lifetime_earned: wallet.lifetime_earned + amount } : { lifetime_spent: wallet.lifetime_spent + amount })
      };
      return base44.entities.VirtualCurrency.update(wallet.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', userEmail] });
    }
  });

  return { wallet, isLoading, updateBalance };
}

export function WalletDisplay({ wallet, isLoading, compact = false }) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
        <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
      </div>
    );
  }

  if (!wallet) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/40">
        <Coins className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-xs font-bold text-yellow-400">{wallet.balance.toLocaleString()}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
        <Coins className="w-5 h-5 text-black" />
      </div>
      <div>
        <p className="text-xs text-yellow-400/70 uppercase tracking-wider">DripCoins</p>
        <p className="text-xl font-bold text-yellow-400">{wallet.balance.toLocaleString()}</p>
      </div>
    </div>
  );
}

export function ListingCard({ listing, onBuy, onFavorite, onView, currentUserEmail, isBuying, showGenesisIndicators = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const isOwn = listing.seller_email === currentUserEmail;
  const CategoryIcon = CATEGORY_ICONS[listing.category] || Package;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`relative overflow-hidden bg-gray-900/80 border-gray-700/50 hover:border-cyan-500/50 transition-all ${RARITY_GLOW[listing.rarity]}`}>
        {/* Genesis promotion indicator */}
        {showGenesisIndicators && listing.uploaded_by_genesis_holder && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-purple-500 to-yellow-400 animate-pulse" />
        )}
        
        {/* Rarity indicator */}
        {!listing.uploaded_by_genesis_holder && (
          <div className={`absolute top-0 left-0 right-0 h-1 ${RARITY_COLORS[listing.rarity]}`} />
        )}
        
        {/* Thumbnail */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          {listing.thumbnail_url ? (
            <img 
              src={listing.thumbnail_url} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CategoryIcon className="w-12 h-12 text-gray-600" />
            </div>
          )}
          
          {/* Overlay on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2"
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full bg-white/10 hover:bg-white/20"
                  onClick={() => onView?.(listing)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full bg-white/10 hover:bg-white/20"
                  onClick={() => onFavorite?.(listing)}
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Type badge */}
          <Badge className="absolute top-2 left-2 bg-black/60 text-white text-[10px]">
            {listing.asset_type}
          </Badge>

          {/* Genesis Premium Badge */}
          {showGenesisIndicators && listing.uploaded_by_genesis_holder && (
            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-bold flex items-center gap-1 shadow-[0_0_15px_rgba(168,85,247,0.6)]">
              <Crown className="w-2.5 h-2.5" />
              GENESIS
            </Badge>
          )}

          {/* Stats */}
          <div className="absolute bottom-2 right-2 flex gap-1">
            <span className="flex items-center gap-0.5 text-[10px] text-white/70 bg-black/40 px-1.5 py-0.5 rounded">
              <Eye className="w-3 h-3" /> {listing.views || 0}
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-white/70 bg-black/40 px-1.5 py-0.5 rounded">
              <Heart className="w-3 h-3" /> {listing.favorites || 0}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{listing.title}</h4>
              <p className="text-xs text-gray-400 capitalize">{listing.rarity}</p>
            </div>
            <Badge className={`${RARITY_COLORS[listing.rarity]} text-white text-[10px]`}>
              {listing.category}
            </Badge>
          </div>

          {/* Price and Buy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-yellow-400">{listing.price}</span>
            </div>
            
            {isOwn ? (
              <Badge variant="outline" className="text-gray-400 border-gray-600">Your Listing</Badge>
            ) : (
              <Button
                size="sm"
                onClick={() => onBuy?.(listing)}
                disabled={isBuying}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-black font-bold text-xs"
              >
                {isBuying ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Buy Now'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function MarketplaceFilters({ filters, onFilterChange, categories }) {
  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-900/50 rounded-xl border border-gray-700/50">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search assets..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-9 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
          />
        </div>
      </div>

      <Select value={filters.assetType} onValueChange={(v) => onFilterChange({ ...filters, assetType: v })}>
        <SelectTrigger className="w-[130px] bg-gray-800/50 border-gray-700 text-white">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="wearable">Wearables</SelectItem>
          <SelectItem value="environment">Environments</SelectItem>
          <SelectItem value="emote">Emotes</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.category} onValueChange={(v) => onFilterChange({ ...filters, category: v })}>
        <SelectTrigger className="w-[130px] bg-gray-800/50 border-gray-700 text-white">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map(cat => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.rarity} onValueChange={(v) => onFilterChange({ ...filters, rarity: v })}>
        <SelectTrigger className="w-[120px] bg-gray-800/50 border-gray-700 text-white">
          <SelectValue placeholder="Rarity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Rarities</SelectItem>
          <SelectItem value="common">Common</SelectItem>
          <SelectItem value="uncommon">Uncommon</SelectItem>
          <SelectItem value="rare">Rare</SelectItem>
          <SelectItem value="epic">Epic</SelectItem>
          <SelectItem value="legendary">Legendary</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.sort} onValueChange={(v) => onFilterChange({ ...filters, sort: v })}>
        <SelectTrigger className="w-[140px] bg-gray-800/50 border-gray-700 text-white">
          <ArrowUpDown className="w-3 h-3 mr-2" />
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price_low">Price: Low to High</SelectItem>
          <SelectItem value="price_high">Price: High to Low</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export { RARITY_COLORS, RARITY_GLOW, CATEGORY_ICONS };

export default {
  useWallet,
  WalletDisplay,
  ListingCard,
  MarketplaceFilters,
  RARITY_COLORS,
  RARITY_GLOW,
  CATEGORY_ICONS
};