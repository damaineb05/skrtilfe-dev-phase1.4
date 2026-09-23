import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingBag,
  Package,
  Coins,
  History,
  Plus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MarketplaceBrowser from './MarketplaceBrowser';
import UserInventoryPanel from './UserInventoryPanel';
import TransactionHistory from './TransactionHistory';
import CreateListingModal from './CreateListingModal';
import { useWallet, WalletDisplay } from './MarketplaceCore';

export default function MobileMarketplace({ currentUser, onEquipItem, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('browse');
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [sellItem, setSellItem] = useState(null);
  
  const { wallet, isLoading: walletLoading } = useWallet(currentUser?.email);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        {/* Header */}
        <div className="safe-area-top bg-gradient-to-b from-gray-900 to-transparent">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Marketplace</h1>
                <p className="text-xs text-gray-400">Buy, sell & trade</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <WalletDisplay wallet={wallet} isLoading={walletLoading} compact />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-[calc(100vh-140px)]">
          <TabsList className="grid grid-cols-4 mx-4 bg-gray-900/80 border border-gray-700/50">
            <TabsTrigger value="browse" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <ShoppingBag className="w-4 h-4 mr-1" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Package className="w-4 h-4 mr-1" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <History className="w-4 h-4 mr-1" />
              History
            </TabsTrigger>
            <TabsTrigger value="sell" className="text-xs data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
              <Coins className="w-4 h-4 mr-1" />
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="flex-1 overflow-hidden mt-0">
            <MarketplaceBrowser 
              currentUser={currentUser} 
              onEquipItem={onEquipItem}
            />
          </TabsContent>

          <TabsContent value="inventory" className="flex-1 overflow-hidden mt-0">
            <UserInventoryPanel 
              currentUser={currentUser}
              onEquipItem={onEquipItem}
              onSellItem={(item) => {
                setSellItem(item);
                setShowCreateListing(true);
              }}
            />
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-hidden mt-0 p-4">
            <TransactionHistory currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="sell" className="flex-1 overflow-hidden mt-0 p-4">
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mb-4">
                <Coins className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sell Your Assets</h3>
              <p className="text-gray-400 text-sm mb-6 max-w-xs">
                List your wearables, environments, and emotes on the marketplace to earn DripCoins
              </p>
              <Button
                className="bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-bold px-8"
                onClick={() => setShowCreateListing(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Listing
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* FAB for quick actions */}
        <div className="fixed bottom-20 right-4 z-50">
          <Button
            size="lg"
            className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/30"
            onClick={() => setShowCreateListing(true)}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        {/* Create Listing Modal */}
        <CreateListingModal
          isOpen={showCreateListing}
          onClose={() => {
            setShowCreateListing(false);
            setSellItem(null);
          }}
          currentUser={currentUser}
          inventoryItem={sellItem}
        />
      </motion.div>
    </AnimatePresence>
  );
}