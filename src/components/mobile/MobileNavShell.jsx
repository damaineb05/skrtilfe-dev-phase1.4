import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ShoppingBag,
  Users,
  Layers,
  MessageCircle,
  Plus,
  Wallet,
  X } from
'lucide-react';
import { base44 } from '@/api/base44Client';

const TABS = [
{ id: 'home', label: 'Home', icon: Home, path: 'Home' },
{ id: 'shop', label: 'Shop', icon: ShoppingBag, path: 'Shop' },
{ id: 'dripsync', label: 'DripSync', icon: Users, path: 'DripSync' },
{ id: 'market', label: 'Market', icon: Layers, path: 'Portfolio' },
{ id: 'community', label: 'Community', icon: MessageCircle, path: 'Community' }];


export default function MobileNavShell({ children, currentPage }) {
  const [user, setUser] = useState(null);
  const [showFAB, setShowFAB] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const location = useLocation();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Check cache first
      const cached = sessionStorage.getItem('current_user');
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch (e) {}
      }
      
      const currentUser = await Promise.race([
        base44.auth.me(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      setUser(currentUser);
      sessionStorage.setItem('current_user', JSON.stringify(currentUser));
      // Check wallet connection status (mock for now)
      setWalletConnected(false);
    } catch (error) {
      // Silently handle - user might not be authenticated or network issue
      console.log('User fetch handled:', error.message);
    }
  };

  const activeTab = TABS.find((tab) => tab.path === currentPage)?.id || 'home';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-0">
      {/* Mobile Header - Glass */}
      <div className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-slate-950 text-xl font-black tracking-tighter">SKRTLIFE</div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Wallet Status */}
            <button className="relative">
              <Wallet className="w-5 h-5 text-gray-700" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              walletConnected ? 'bg-green-400' : 'bg-gray-400'}`
              } />
            </button>
            
            {/* User Avatar */}
            {user &&
            <Link to={createPageUrl('Profile')}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-black">
                    {user.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
              </Link>
            }
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative md:-mt-[44px]">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-gray-200 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;

            return (
              <Link
                key={tab.id}
                to={createPageUrl(tab.path)}
                className="flex-1 flex flex-col items-center justify-center py-2 relative">

                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center gap-1 ${
                  isActive ? 'text-black' : 'text-gray-500'}`
                  }>

                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium tracking-wide">
                    {tab.label}
                  </span>
                </motion.div>
                
                {isActive &&
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-b-full" />

                }
              </Link>);

          })}
        </div>
      </div>

      {/* FAB - Floating Action Button */}
      <AnimatePresence>
        {showFAB &&
        <>
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setShowFAB(false)} />

            
            <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl md:hidden">

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Quick Actions</h3>
                  <button onClick={() => setShowFAB(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <Link to={createPageUrl('Studio')} onClick={() => setShowFAB(false)}>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 hover:border-purple-400 transition-all">
                    <Layers className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Create NFT</p>
                      <p className="text-xs text-gray-600">Upload and mint new asset</p>
                    </div>
                  </div>
                </Link>

                <Link to={createPageUrl('DripSync')} onClick={() => setShowFAB(false)}>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-50 to-purple-50 rounded-xl border border-cyan-200 hover:border-cyan-400 transition-all">
                    <Users className="w-6 h-6 text-cyan-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Create Look</p>
                      <p className="text-xs text-gray-600">Save new avatar outfit</p>
                    </div>
                  </div>
                </Link>

                <Link to={createPageUrl('Shop')} onClick={() => setShowFAB(false)}>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border border-orange-200 hover:border-orange-400 transition-all">
                    <ShoppingBag className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Upload Wearable</p>
                      <p className="text-xs text-gray-600">Add custom asset</p>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>

      {/* FAB Button */}
      {(activeTab === 'dripsync' || activeTab === 'market') &&
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowFAB(!showFAB)}
        className="md:hidden fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-2xl flex items-center justify-center">

          {showFAB ?
        <X className="w-6 h-6 text-white" /> :

        <Plus className="w-6 h-6 text-white" />
        }
        </motion.button>
      }

      <style>{`
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .safe-area-pb {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </div>);

}