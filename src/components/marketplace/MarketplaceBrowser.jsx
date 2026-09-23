import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Coins,
  ShoppingBag,
  Loader2,
  Package,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { useWallet, WalletDisplay, ListingCard, MarketplaceFilters, RARITY_COLORS } from './MarketplaceCore';

const CATEGORIES = ['headwear', 'top', 'bottom', 'footwear', 'accessory', 'full_outfit', 'environment', 'animation', 'effect'];

export default function MarketplaceBrowser({ currentUser, onEquipItem, onClose }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    assetType: 'all',
    category: 'all',
    rarity: 'all',
    sort: 'newest'
  });
  const [selectedListing, setSelectedListing] = useState(null);
  const [buyingId, setBuyingId] = useState(null);

  const { wallet, isLoading: walletLoading, updateBalance } = useWallet(currentUser?.email);

  // Fetch listings
  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['marketplace-listings', filters],
    queryFn: async () => {
      let results = await base44.entities.MarketplaceListing.filter({ status: 'active' }, '-created_date', 100);
      
      // Apply filters
      if (filters.search) {
        const search = filters.search.toLowerCase();
        results = results.filter(l => 
          l.title.toLowerCase().includes(search) ||
          l.description?.toLowerCase().includes(search) ||
          l.tags?.some(t => t.toLowerCase().includes(search))
        );
      }
      if (filters.assetType !== 'all') {
        results = results.filter(l => l.asset_type === filters.assetType);
      }
      if (filters.category !== 'all') {
        results = results.filter(l => l.category === filters.category);
      }
      if (filters.rarity !== 'all') {
        results = results.filter(l => l.rarity === filters.rarity);
      }

      // Sort
      switch (filters.sort) {
        case 'price_low':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price_high':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'popular':
          results.sort((a, b) => (b.views + b.favorites * 2) - (a.views + a.favorites * 2));
          break;
        default:
          // newest - already sorted by -created_date
          break;
      }

      return results;
    }
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (listing) => {
      if (!wallet || wallet.balance < listing.price) {
        throw new Error('Insufficient balance');
      }

      // Deduct from buyer
      await base44.entities.VirtualCurrency.update(wallet.id, {
        balance: wallet.balance - listing.price,
        lifetime_spent: wallet.lifetime_spent + listing.price
      });

      // Add to seller (if not system listing)
      if (listing.seller_email && listing.seller_email !== 'system@dripsync.io') {
        const sellerWallets = await base44.entities.VirtualCurrency.filter({ user_email: listing.seller_email });
        if (sellerWallets.length > 0) {
          const sellerWallet = sellerWallets[0];
          await base44.entities.VirtualCurrency.update(sellerWallet.id, {
            balance: sellerWallet.balance + listing.price,
            lifetime_earned: sellerWallet.lifetime_earned + listing.price
          });
        }
      }

      // Create transaction record
      await base44.entities.Transaction.create({
        buyer_email: currentUser.email,
        seller_email: listing.seller_email,
        listing_id: listing.id,
        amount: listing.price,
        transaction_type: 'purchase',
        status: 'completed',
        asset_snapshot: {
          title: listing.title,
          asset_type: listing.asset_type,
          asset_url: listing.asset_url,
          thumbnail_url: listing.thumbnail_url,
          category: listing.category,
          rarity: listing.rarity
        }
      });

      // Add to buyer's inventory
      await base44.entities.UserInventory.create({
        user_email: currentUser.email,
        asset_type: listing.asset_type,
        asset_url: listing.asset_url,
        asset_name: listing.title,
        thumbnail_url: listing.thumbnail_url,
        category: listing.category,
        acquired_from: 'purchase',
        listing_id: listing.id,
        is_equipped: false,
        is_tradeable: true,
        asset_metadata: listing.asset_metadata,
        rarity: listing.rarity
      });

      // Mark listing as sold (optional - could allow multiple sales)
      // await base44.entities.MarketplaceListing.update(listing.id, { status: 'sold' });

      return listing;
    },
    onSuccess: (listing) => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['user-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      
      toast({
        title: "Purchase Complete!",
        description: `${listing.title} has been added to your inventory.`,
      });
      setSelectedListing(null);
      setBuyingId(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: error.message || "Something went wrong",
      });
      setBuyingId(null);
    }
  });

  const handleBuy = (listing) => {
    setSelectedListing(listing);
  };

  const confirmPurchase = () => {
    if (!selectedListing) return;
    setBuyingId(selectedListing.id);
    purchaseMutation.mutate(selectedListing);
  };

  const handleView = async (listing) => {
    // Increment view count
    await base44.entities.MarketplaceListing.update(listing.id, { views: (listing.views || 0) + 1 });
    setSelectedListing(listing);
  };

  const handleFavorite = async (listing) => {
    await base44.entities.MarketplaceListing.update(listing.id, { favorites: (listing.favorites || 0) + 1 });
    queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
    toast({ title: "Added to favorites" });
  };

  const canAfford = selectedListing && wallet && wallet.balance >= selectedListing.price;

  return (
    <div className="h-full flex flex-col bg-black/90">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">DripSync Marketplace</h2>
            <p className="text-xs text-gray-400">{listings.length} items available</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <WalletDisplay wallet={wallet} isLoading={walletLoading} />
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-700/30">
        <MarketplaceFilters 
          filters={filters} 
          onFilterChange={setFilters}
          categories={CATEGORIES}
        />
      </div>

      {/* Listings Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {listingsLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Package className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No listings found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onBuy={handleBuy}
                onView={handleView}
                onFavorite={handleFavorite}
                currentUserEmail={currentUser?.email}
                isBuying={buyingId === listing.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
          </DialogHeader>
          
          {selectedListing && (
            <div className="space-y-4">
              {/* Item Preview */}
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-gray-800 overflow-hidden flex-shrink-0">
                  {selectedListing.thumbnail_url ? (
                    <img src={selectedListing.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{selectedListing.title}</h3>
                  <p className="text-sm text-gray-400 capitalize">{selectedListing.rarity} {selectedListing.asset_type}</p>
                  <Badge className={`${RARITY_COLORS[selectedListing.rarity]} text-white mt-2`}>
                    {selectedListing.category}
                  </Badge>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Item Price</span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Coins className="w-4 h-4" />
                    {selectedListing.price}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-2 flex justify-between">
                  <span className="text-gray-400">Your Balance</span>
                  <span className={`flex items-center gap-1 ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                    <Coins className="w-4 h-4" />
                    {wallet?.balance || 0}
                  </span>
                </div>
                {!canAfford && (
                  <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Insufficient balance</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300"
                  onClick={() => setSelectedListing(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold"
                  onClick={confirmPurchase}
                  disabled={!canAfford || purchaseMutation.isPending}
                >
                  {purchaseMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Confirm Purchase
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}