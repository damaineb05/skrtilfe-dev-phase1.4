import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, ChevronDown, Power, Copy, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { walletService } from '../web3/walletService';
import { getChainById, getExplorerUrl } from '../web3/chains';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

export default function WalletConnectButton({ onConnect, onDisconnect }) {
  const { toast } = useToast();
  const [walletState, setWalletState] = useState({
    connected: false,
    account: null,
    chainId: null,
    chain: null
  });
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Subscribe to wallet changes
    const unsubscribe = walletService.subscribe((event) => {
      console.log('Wallet event:', event);
      
      if (event.type === 'connected' || event.type === 'accountChanged') {
        setWalletState({
          connected: true,
          account: event.account,
          chainId: event.chainId,
          chain: getChainById(event.chainId)
        });
        loadBalance();
        onConnect?.(event);
      } else if (event.type === 'disconnected') {
        setWalletState({
          connected: false,
          account: null,
          chainId: null,
          chain: null
        });
        setBalance('0');
        onDisconnect?.();
      } else if (event.type === 'chainChanged') {
        setWalletState(prev => ({
          ...prev,
          chainId: event.chainId,
          chain: getChainById(event.chainId)
        }));
      }
    });

    // Check if already connected
    const state = walletService.getState();
    if (state.connected) {
      setWalletState(state);
      loadBalance();
    }

    return unsubscribe;
  }, []);

  const loadBalance = async () => {
    try {
      const bal = await walletService.getBalance();
      setBalance(parseFloat(bal).toFixed(4));
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      await walletService.connect();
      toast({
        title: 'Wallet Connected',
        description: 'Successfully connected to your wallet',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    walletService.disconnect();
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
    });
  };

  const copyAddress = () => {
    if (walletState.account) {
      navigator.clipboard.writeText(walletState.account);
      toast({
        title: 'Copied',
        description: 'Address copied to clipboard',
      });
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!walletState.connected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={loading}
        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-cyan-500/30 text-white hover:bg-cyan-500/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="font-mono text-sm">{formatAddress(walletState.account)}</span>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-0 text-xs">
              {walletState.chain?.name || 'Unknown'}
            </Badge>
            <ChevronDown className="w-4 h-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 bg-zinc-900 border-zinc-800">
        <div className="p-3 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-mono">CONNECTED</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <p className="font-mono text-sm text-white mb-1">{formatAddress(walletState.account)}</p>
          <p className="text-xs text-gray-400">{balance} {walletState.chain?.nativeCurrency?.symbol || 'ETH'}</p>
        </div>

        <DropdownMenuItem onClick={copyAddress} className="text-white">
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => window.open(getExplorerUrl(walletState.chainId, 'address', walletState.account), '_blank')}
          className="text-white"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-zinc-800" />

        <DropdownMenuItem onClick={handleDisconnect} className="text-red-400 focus:text-red-400">
          <Power className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}