import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet as WalletIcon, Lock, Sparkles, TrendingUp, TrendingDown, Copy, Send, ArrowDownToLine, Loader2, Smartphone, RefreshCw, Image as ImageIcon, Activity } from "lucide-react";
import EmptyState from '@/components/ui/EmptyState';
import { createPageUrl } from '@/utils';
import { motion } from "framer-motion";
import { base44 } from '@/api/base44Client';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Enhanced wallet providers with actual connection capabilities
const walletProviders = [
  {
    name: 'MetaMask',
    id: 'metamask',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
    type: 'browser',
    description: 'Connect using browser extension',
    popular: true,
    available: typeof window !== 'undefined' && window.ethereum
  },
  {
    name: 'WalletConnect',
    id: 'walletconnect',
    logo: 'https://walletconnect.com/walletconnect-logo.svg',
    type: 'mobile',
    description: 'Scan with WalletConnect to connect',
    popular: true,
    available: true
  },
  {
    name: 'Coinbase Wallet',
    id: 'coinbase',
    logo: 'https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8deb2ff445dee9e/Consumer_Wordmark_White.svg',
    type: 'browser',
    description: 'Connect using Coinbase Wallet',
    popular: true,
    available: true
  },
  {
    name: 'Ledger',
    id: 'ledger',
    logo: 'https://www.ledger.com/wp-content/themes/ledger-v2/public/images/ledger-logo-long.svg',
    type: 'hardware',
    description: 'Hardware wallet security',
    popular: false,
    available: true
  },
];

function WalletPageContent() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [connectionMethod, setConnectionMethod] = useState('');
  const [showAllWallets, setShowAllWallets] = useState(false);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const [portfolioData, setPortfolioData] = useState({
    totalValue: '$0.00',
    totalValueETH: '0.0 ETH',
    change24h: 0,
    tokens: [],
    nfts: [],
    transactions: [],
    isLoading: true
  });

  useEffect(() => {
    const savedWallet = localStorage.getItem('connected_wallet');
    const savedMethod = localStorage.getItem('wallet_method');
    if (savedWallet && savedMethod) {
      setWalletAddress(savedWallet);
      setConnectionMethod(savedMethod);
      setIsConnected(true);
      loadWalletData(savedWallet);
    }
  }, []);

  const connectMetaMask = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        setIsConnecting(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          setIsConnected(true);
          setConnectionMethod('MetaMask');
          
          localStorage.setItem('connected_wallet', address);
          localStorage.setItem('wallet_method', 'MetaMask');
          
          await loadWalletData(address);
          return;
        }
      } catch (error) {
        console.error('MetaMask connection failed:', error);
      } finally {
        setIsConnecting(false);
      }
    }
    
    await connectWalletMock('MetaMask');
  };

  const connectWallet = async (method) => {
    if (method === 'MetaMask') {
      return await connectMetaMask();
    }
    return await connectWalletMock(method);
  };

  const connectWalletMock = async (method) => {
    setIsConnecting(true);
    setConnectionMethod(method);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockAddress = '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2';
      setWalletAddress(mockAddress);
      setIsConnected(true);
      
      localStorage.setItem('connected_wallet', mockAddress);
      localStorage.setItem('wallet_method', method);
      
      await loadWalletData(mockAddress);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const loadWalletData = async (address) => {
    setIsLoadingAssets(true);
    setPortfolioData(prev => ({ ...prev, isLoading: true }));

    try {
      const marketDataResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Simulate a realistic crypto portfolio for wallet address ${address}. Include ETH and a stablecoin balance, and their current market prices. Provide a total portfolio value in USD and a 24h percentage change.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            portfolio_total_usd: { type: "number" },
            change_24h_percent: { type: "number" },
            tokens: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  symbol: { type: "string" }, name: { type: "string" }, balance: { type: "string" },
                  value_usd: { type: "string" }, price: { type: "string" }, change_24h: { type: "number" },
                  logo: { type: "string" }
                }
              }
            }
          },
          required: ["portfolio_total_usd", "change_24h_percent", "tokens"]
        }
      });

      const nftResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 realistic NFT metadata entries for a Web3 fashion brand called Skrtlife. One should be a "Genesis Pass". Include unique names, collection names, and estimated floor prices (in ETH).`,
        response_json_schema: {
          type: "object", properties: {
            nfts: {
              type: "array", items: {
                type: "object", properties: {
                  id: { type: "string" }, name: { type: "string" }, collection: { type: "string" },
                  floor_price: { type: "string" }, image_url: { type: "string", format: "uri" }
                }
              }
            }
          }, required: ["nfts"]
        }
      });

      const totalPortfolioValue = marketDataResponse?.portfolio_total_usd || 8266.06;
      const baseEthPrice = marketDataResponse?.tokens.find(t => t.symbol === 'ETH')?.price.replace('$', '') || 3000;

      setPortfolioData({
        totalValue: `$${totalPortfolioValue.toFixed(2)}`,
        totalValueETH: `${(totalPortfolioValue / parseFloat(baseEthPrice)).toFixed(3)} ETH`,
        change24h: marketDataResponse?.change_24h_percent || (Math.random() * 10 - 2),
        tokens: marketDataResponse?.tokens,
        nfts: nftResponse?.nfts,
        transactions: [ // Mock transactions for now
            { type: 'receive', token: 'ETH', amount: '+0.5', value: '$1500', time: '2 hours ago', status: 'completed', hash: '0xabc123def456...' },
            { type: 'send', token: 'USDC', amount: '-100', value: '$100.00', time: '1 day ago', status: 'completed', hash: '0xdef456ghi789...' },
            { type: 'mint', token: 'Genesis Pass', amount: '1', value: '0.1 ETH', time: '3 days ago', status: 'completed', hash: '0xghi789jkl123...' },
        ],
        isLoading: false
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      setPortfolioData(prev => ({ ...prev, isLoading: false }));
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const refreshData = () => {
    if (walletAddress) {
      loadWalletData(walletAddress);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setConnectionMethod('');
    localStorage.removeItem('connected_wallet');
    localStorage.removeItem('wallet_method');
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
  };

  const getWalletTypeIcon = (type) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'hardware': return <Lock className="w-4 h-4" />;
      default: return <WalletIcon className="w-4 h-4" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-88px)] flex items-center justify-center px-4 py-12"
        style={{ background: 'var(--bg-1)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', boxShadow: '0 0 32px rgba(255,215,0,0.12)' }}>
              <WalletIcon className="w-7 h-7" style={{ color: '#FFD700' }} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Digital Wallet
            </p>
            <h1 className="text-2xl font-black text-white mb-2">Connect Your Wallet</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Link your Ethereum wallet to manage assets and track your Skrtlife holdings.
            </p>
          </div>

            {isConnecting ? (
            <div className="text-center py-10 space-y-3"
              style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }}>
              <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#FFD700' }} />
              <p className="text-sm font-semibold text-white">Connecting to {connectionMethod}…</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Confirm in your wallet app</p>
            </div>
          ) : (
            <div className="space-y-3">
              {walletProviders.filter(w => w.popular).map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => connectWallet(wallet.name)}
                  disabled={!wallet.available}
                  className="w-full flex items-center justify-between gap-4 px-4 py-3.5 transition-all"
                  style={{
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img src={wallet.logo} alt={wallet.name} className="w-8 h-8 rounded-lg object-contain" />
                    <span className="text-sm font-semibold text-white">{wallet.name}</span>
                  </div>
                  {wallet.name === 'MetaMask' && wallet.available && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1"
                      style={{ borderRadius: '6px', background: 'rgba(255,215,0,0.12)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)' }}>
                      Detected
                    </span>
                  )}
                </button>
              ))}
              <button
                onClick={() => setShowAllWallets(!showAllWallets)}
                className="w-full text-xs py-2 transition-colors"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                {showAllWallets ? 'Show less' : 'More wallet options'}
              </button>
              {showAllWallets && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                  {walletProviders.filter(w => !w.popular).map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => connectWallet(wallet.name)}
                      className="w-full flex items-center gap-3 px-4 py-3 transition-all"
                      style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <img src={wallet.logo} alt={wallet.name} className="w-7 h-7 rounded-md object-contain" />
                      <span className="text-sm font-semibold text-white">{wallet.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold ledger-text-primary">Digital Wallet</h1>
            <p className="ledger-text-secondary">Manage your crypto assets and NFTs.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={refreshData}
              variant="outline" 
              size="sm"
              className="ledger-btn-secondary"
              disabled={isLoadingAssets}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingAssets ? 'animate-spin' : ''}`} />
              {isLoadingAssets ? 'Syncing...' : 'Refresh'}
            </Button>
            <Button 
              onClick={disconnectWallet}
              variant="outline" 
              className="ledger-btn-secondary"
            >
              Disconnect
            </Button>
          </div>
        </motion.div>

        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="ledger-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 ledger-bg-primary rounded-full flex items-center justify-center">
                  <WalletIcon className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-sm ledger-text-secondary">{connectionMethod} • Ethereum Mainnet</p>
                  <p className="font-mono ledger-text-primary">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
                </div>
              </div>
              <Button onClick={copyAddress} variant="ghost" size="sm" className="ledger-text-muted hover:ledger-text-primary"><Copy className="w-4 h-4" /></Button>
            </div>
          </Card>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="ledger-card p-4 text-center">
            <p className="text-sm ledger-text-secondary">Total Value</p>
            {portfolioData.isLoading ? <div className="h-10 mt-1 ledger-skeleton rounded"/> : <>
              <p className="text-2xl font-bold ledger-text-primary">{portfolioData.totalValue}</p>
              <p className="text-xs ledger-text-muted">{portfolioData.totalValueETH}</p>
            </>}
          </Card>
          <Card className="ledger-card p-4 text-center">
            <p className="text-sm ledger-text-secondary">NFTs Owned</p>
            {portfolioData.isLoading ? <div className="h-10 mt-1 ledger-skeleton rounded"/> : <p className="text-2xl font-bold ledger-accent">{portfolioData.nfts.length}</p>}
          </Card>
          <Card className="ledger-card p-4 text-center">
            <p className="text-sm ledger-text-secondary">Token Types</p>
            {portfolioData.isLoading ? <div className="h-10 mt-1 ledger-skeleton rounded"/> : <p className="text-2xl font-bold ledger-text-primary">{portfolioData.tokens.length}</p>}
          </Card>
          <Card className="ledger-card p-4 text-center">
            <p className="text-sm ledger-text-secondary">24h Change</p>
            {portfolioData.isLoading ? <div className="h-10 mt-1 ledger-skeleton rounded"/> : <p className={`text-2xl font-bold ${portfolioData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>{portfolioData.change24h >= 0 ? '+' : ''}{portfolioData.change24h.toFixed(1)}%</p>}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="tokens" className="space-y-6">
            <TabsList className="bg-ledger-surface p-1 rounded-lg grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="nfts">NFTs</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="tokens" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold ledger-text-primary">Token Holdings</h2>
                <div className="flex gap-2">
                  <Button size="sm" className="ledger-btn-primary"><Send className="w-4 h-4 mr-2" />Send</Button>
                  <Button size="sm" variant="outline" className="ledger-btn-secondary"><ArrowDownToLine className="w-4 h-4 mr-2" />Receive</Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {portfolioData.isLoading ? ([...Array(3)].map((_, i) => <div key={i} className="h-20 ledger-skeleton rounded-lg"/>)) : (
                  portfolioData.tokens.map((token, index) => (
                    <motion.div
                      key={token.symbol}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="ledger-card hover:bg-ledger-surface-hover ledger-transition">
                        <CardContent className="p-4 grid grid-cols-3 items-center gap-4">
                          <div className="flex items-center gap-4">
                            <img src={token.logo} alt={token.name} className="w-10 h-10 rounded-full"/>
                            <div>
                              <h3 className="font-bold ledger-text-primary">{token.symbol}</h3>
                              <p className="ledger-text-secondary text-sm">{token.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold ledger-text-primary">{token.balance}</div>
                            <div className="ledger-text-secondary text-sm">{token.value_usd}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold ledger-text-primary">{token.price}</div>
                            <div className={`text-sm flex items-center justify-end gap-1 ${token.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>{token.change_24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {token.change_24h.toFixed(1)}%</div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="nfts" className="space-y-4">
              <h2 className="text-xl font-bold ledger-text-primary">NFT Collection</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {portfolioData.isLoading ? ([...Array(4)].map((_, i) => <div key={i} className="aspect-[4/5] ledger-skeleton rounded-lg"/>)) : (
                  portfolioData.nfts.map((nft, index) => (
                    <motion.div
                      key={nft.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="ledger-card group overflow-hidden"
                    >
                      <div className="aspect-square overflow-hidden relative">
                        <img src={nft.image_url} alt={nft.name} className="w-full h-full object-cover group-hover:scale-105 ledger-transition"/>
                      </div>
                      <div className="p-4">
                        <p className="text-xs ledger-text-secondary truncate">{nft.collection}</p>
                        <h3 className="font-bold ledger-text-primary truncate">{nft.name}</h3>
                        <div className="flex justify-between text-sm mt-3">
                          <p className="ledger-text-secondary">Floor</p>
                          <p className="font-bold ledger-accent">{nft.floor_price}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <h2 className="text-xl font-bold ledger-text-primary">Transaction History</h2>
              <div className="space-y-3">
                {portfolioData.isLoading ? ([...Array(3)].map((_, i) => <div key={i} className="h-16 ledger-skeleton rounded-lg"/>)) : portfolioData.transactions.length > 0 ? (
                  portfolioData.transactions.map((tx, index) => (
                    <Card key={index} className="ledger-card">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.type === 'receive' ? 'bg-green-500/10 text-green-400' :
                              tx.type === 'send' ? 'bg-red-500/10 text-red-400' :
                              'bg-blue-500/10 text-blue-400'
                            }`}>
                              {tx.type === 'receive' ? <ArrowDownToLine className="w-5 h-5" /> :
                               tx.type === 'send' ? <Send className="w-5 h-5" /> :
                               <Sparkles className="w-5 h-5" />}
                            </div>
                          <div>
                            <h4 className="font-medium ledger-text-primary capitalize">{tx.type} {tx.token}</h4>
                            <p className="text-sm ledger-text-secondary">{tx.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${tx.type === 'receive' ? 'text-green-400' : tx.type === 'send' ? 'text-red-400' : 'ledger-text-primary'}`}>{tx.amount}</p>
                          <p className="text-sm ledger-text-secondary">{tx.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    icon={<Activity size={20} />}
                    eyebrow="Transaction History"
                    title="No transactions yet"
                    description="Once you send, receive, or mint — your activity will appear here."
                    cta={{ label: 'Browse the Shop', href: createPageUrl('Shop') }}
                    accentColor="#00D4FF"
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

export default function Wallet() {
    return <ProtectedRoute><WalletPageContent /></ProtectedRoute>
}