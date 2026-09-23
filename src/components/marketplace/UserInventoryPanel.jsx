import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Package,
  Shirt,
  Sparkles,
  Zap,
  Search,
  Check,
  Tag,
  Loader2,
  Grid3X3,
  List,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { RARITY_COLORS, RARITY_GLOW, CATEGORY_ICONS } from './MarketplaceCore';

export default function UserInventoryPanel({ currentUser, onEquipItem, onSellItem }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  // Fetch user's inventory
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['user-inventory', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      return base44.entities.UserInventory.filter({ user_email: currentUser.email }, '-created_date');
    },
    enabled: !!currentUser?.email
  });

  // Equip mutation
  const equipMutation = useMutation({
    mutationFn: async (item) => {
      // Unequip other items of same category
      const sameCategory = inventory.filter(i => i.category === item.category && i.is_equipped);
      for (const other of sameCategory) {
        await base44.entities.UserInventory.update(other.id, { is_equipped: false });
      }
      // Equip this item
      await base44.entities.UserInventory.update(item.id, { is_equipped: true });
      return item;
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['user-inventory'] });
      onEquipItem?.(item);
      toast({ title: `${item.asset_name} equipped!` });
    }
  });

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesTab = activeTab === 'all' || item.asset_type === activeTab;
    const matchesSearch = !searchQuery || 
      item.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Group by type for stats
  const stats = {
    all: inventory.length,
    wearable: inventory.filter(i => i.asset_type === 'wearable').length,
    environment: inventory.filter(i => i.asset_type === 'environment').length,
    emote: inventory.filter(i => i.asset_type === 'emote').length,
  };

  const handleEquip = (item) => {
    equipMutation.mutate(item);
  };

  return (
    <div className="h-full flex flex-col bg-black/60 backdrop-blur-xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white">My Inventory</h3>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {inventory.length} items
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`w-8 h-8 ${viewMode === 'grid' ? 'text-cyan-400' : 'text-gray-400'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`w-8 h-8 ${viewMode === 'list' ? 'text-cyan-400' : 'text-gray-400'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-4 mx-4 mt-2 bg-gray-900/50 border border-gray-700/50">
          <TabsTrigger value="all" className="text-xs data-[state=active]:bg-purple-500/20">
            All ({stats.all})
          </TabsTrigger>
          <TabsTrigger value="wearable" className="text-xs data-[state=active]:bg-cyan-500/20">
            <Shirt className="w-3 h-3 mr-1" />
            {stats.wearable}
          </TabsTrigger>
          <TabsTrigger value="environment" className="text-xs data-[state=active]:bg-green-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            {stats.environment}
          </TabsTrigger>
          <TabsTrigger value="emote" className="text-xs data-[state=active]:bg-pink-500/20">
            <Zap className="w-3 h-3 mr-1" />
            {stats.emote}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="flex-1 overflow-y-auto p-4 mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Package className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">No items found</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-purple-500/50 text-purple-400"
                onClick={() => {/* Navigate to marketplace */}}
              >
                Browse Marketplace
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredInventory.map((item) => (
                <InventoryItemCard
                  key={item.id}
                  item={item}
                  onEquip={handleEquip}
                  onSelect={() => setSelectedItem(item)}
                  isEquipping={equipMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredInventory.map((item) => (
                <InventoryItemRow
                  key={item.id}
                  item={item}
                  onEquip={handleEquip}
                  onSelect={() => setSelectedItem(item)}
                  isEquipping={equipMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-32 h-32 rounded-xl bg-gray-800 overflow-hidden">
                  {selectedItem.thumbnail_url ? (
                    <img src={selectedItem.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{selectedItem.asset_name}</h3>
                  <p className="text-sm text-gray-400 capitalize">{selectedItem.rarity} {selectedItem.asset_type}</p>
                  <Badge className={`${RARITY_COLORS[selectedItem.rarity]} text-white mt-2`}>
                    {selectedItem.category}
                  </Badge>
                  {selectedItem.is_equipped && (
                    <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                      Equipped
                    </Badge>
                  )}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Acquired</span>
                  <span className="text-white capitalize">{selectedItem.acquired_from}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tradeable</span>
                  <span className={selectedItem.is_tradeable ? 'text-green-400' : 'text-red-400'}>
                    {selectedItem.is_tradeable ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold"
                  onClick={() => {
                    handleEquip(selectedItem);
                    setSelectedItem(null);
                  }}
                  disabled={selectedItem.is_equipped}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {selectedItem.is_equipped ? 'Equipped' : 'Equip Now'}
                </Button>
                {selectedItem.is_tradeable && onSellItem && (
                  <Button
                    variant="outline"
                    className="border-yellow-500/50 text-yellow-400"
                    onClick={() => {
                      onSellItem(selectedItem);
                      setSelectedItem(null);
                    }}
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Sell
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InventoryItemCard({ item, onEquip, onSelect, isEquipping }) {
  const CategoryIcon = CATEGORY_ICONS[item.category] || Package;

  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
      <Card 
        className={`relative overflow-hidden cursor-pointer bg-gray-900/80 border-gray-700/50 hover:border-purple-500/50 transition-all ${RARITY_GLOW[item.rarity]}`}
        onClick={onSelect}
      >
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${RARITY_COLORS[item.rarity]}`} />
        
        <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900">
          {item.thumbnail_url ? (
            <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CategoryIcon className="w-8 h-8 text-gray-600" />
            </div>
          )}
          
          {item.is_equipped && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="p-2">
          <h4 className="text-xs font-bold text-white truncate">{item.asset_name}</h4>
          <div className="flex items-center justify-between mt-1">
            <Badge className={`${RARITY_COLORS[item.rarity]} text-white text-[9px] px-1`}>
              {item.rarity}
            </Badge>
            {!item.is_equipped && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[10px] text-cyan-400 hover:bg-cyan-500/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onEquip(item);
                }}
                disabled={isEquipping}
              >
                Equip
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function InventoryItemRow({ item, onEquip, onSelect, isEquipping }) {
  const CategoryIcon = CATEGORY_ICONS[item.category] || Package;

  return (
    <Card 
      className={`flex items-center gap-3 p-2 cursor-pointer bg-gray-900/80 border-gray-700/50 hover:border-purple-500/50 ${RARITY_GLOW[item.rarity]}`}
      onClick={onSelect}
    >
      <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-l-2 ${RARITY_COLORS[item.rarity]}`}>
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <CategoryIcon className="w-5 h-5 text-gray-600" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white truncate">{item.asset_name}</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 capitalize">{item.rarity}</span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-400 capitalize">{item.category}</span>
        </div>
      </div>

      {item.is_equipped ? (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <Check className="w-3 h-3 mr-1" />
          Equipped
        </Badge>
      ) : (
        <Button
          size="sm"
          className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
          onClick={(e) => {
            e.stopPropagation();
            onEquip(item);
          }}
          disabled={isEquipping}
        >
          Equip
        </Button>
      )}

      <ChevronRight className="w-4 h-4 text-gray-500" />
    </Card>
  );
}