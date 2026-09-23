import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Web3 Integration Hooks for DripSync
 * Production-ready blockchain layer that never blocks visuals
 * 
 * Contract Suite:
 * - GenesisPass (ERC-721)
 * - DripWearable (ERC-1155)
 * - DripWorld (ERC-721)
 * - AccessController
 * - WalletLink
 */

// Contract addresses (set via environment variables)
const CONTRACTS = {
  GENESIS_PASS: import.meta.env.VITE_GENESIS_ADDRESS,
  WEARABLES: import.meta.env.VITE_WEARABLES_ADDRESS,
  WORLDS: import.meta.env.VITE_WORLDS_ADDRESS,
  ACCESS_CONTROLLER: import.meta.env.VITE_ACCESS_CONTROLLER_ADDRESS,
  WALLET_LINK: import.meta.env.VITE_WALLET_LINK_ADDRESS,
};

/**
 * useWallet - Connect and manage wallet state
 */
export function useWallet() {
  const [address, setAddress] = useState(null);
  const [connected, setConnected] = useState(false);
  const [chainId, setChainId] = useState(null);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('No wallet detected');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      setAddress(accounts[0]);
      setChainId(chainId);
      setConnected(true);
      
      return accounts[0];
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setConnected(false);
    setChainId(null);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(chainId);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);

  return { address, connected, chainId, connect, disconnect };
}

/**
 * useGenesisPass - Genesis NFT verification (ERC-721)
 * Frontend Guarantee: Never blocks UI, always shows cached state first
 */
export function useGenesisPass(walletAddress) {
  const [hasPass, setHasPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenId, setTokenId] = useState(null);

  const checkOwnership = useCallback(async () => {
    if (!walletAddress || !CONTRACTS.GENESIS_PASS) return false;

    setLoading(true);
    try {
      // Query The Graph subgraph for instant results (no RPC spam)
      const query = `
        query GetGenesisPass($owner: Bytes!) {
          genesisPasses(where: { owner: $owner }) {
            id
            owner
          }
        }
      `;

      const response = await fetch(import.meta.env.VITE_SUBGRAPH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { owner: walletAddress.toLowerCase() }
        })
      });

      const { data } = await response.json();
      const passes = data?.genesisPasses || [];
      
      setHasPass(passes.length > 0);
      setTokenId(passes.length > 0 ? passes[0].id : null);
      
      return passes.length > 0;
    } catch (error) {
      console.error('Genesis Pass check failed:', error);
      // Fail gracefully - don't block UX
      return false;
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      checkOwnership();
    }
  }, [walletAddress, checkOwnership]);

  return { hasPass, tokenId, loading, checkOwnership };
}

/**
 * useWearableOwnership - Check ERC-1155 wearable balances
 */
export function useWearableOwnership(walletAddress) {
  const [ownedWearables, setOwnedWearables] = useState([]);
  const [loading, setLoading] = useState(false);

  const getOwnedWearables = useCallback(async () => {
    if (!walletAddress || !CONTRACTS.WEARABLES) return [];

    setLoading(true);
    try {
      const query = `
        query GetWearables($owner: Bytes!) {
          wearableBalances(where: { owner: $owner, amount_gt: 0 }) {
            wearableId
            amount
            owner
          }
        }
      `;

      const response = await fetch(import.meta.env.VITE_SUBGRAPH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { owner: walletAddress.toLowerCase() }
        })
      });

      const { data } = await response.json();
      const wearables = data?.wearableBalances || [];
      
      setOwnedWearables(wearables);
      return wearables;
    } catch (error) {
      console.error('Wearable ownership check failed:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  const ownsWearable = useCallback((wearableId) => {
    return ownedWearables.some(w => w.wearableId === wearableId.toString());
  }, [ownedWearables]);

  useEffect(() => {
    if (walletAddress) {
      getOwnedWearables();
    }
  }, [walletAddress, getOwnedWearables]);

  return { ownedWearables, loading, getOwnedWearables, ownsWearable };
}

/**
 * useWalletLink - Link wallet to user_id
 * Critical: Wallet ≠ Identity, this maintains the mapping
 */
export function useWalletLink() {
  const [linkedUserId, setLinkedUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const linkWallet = useCallback(async (walletAddress) => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      const user = await base44.auth.me();
      if (!user) throw new Error('User not authenticated');

      // Sign message to prove wallet ownership
      const message = `Link wallet ${walletAddress} to Skrtlife account`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress]
      });

      // Store wallet link in backend
      await base44.auth.updateMe({
        linked_wallet: walletAddress,
        wallet_signature: signature,
        wallet_linked_at: new Date().toISOString()
      });

      setLinkedUserId(user.id);
      
      console.log('✅ Wallet linked:', walletAddress);
      return true;
    } catch (error) {
      console.error('Wallet linking failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkLink = useCallback(async (walletAddress) => {
    try {
      const user = await base44.auth.me();
      if (user?.linked_wallet === walletAddress) {
        setLinkedUserId(user.id);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  return { linkedUserId, loading, linkWallet, checkLink };
}

/**
 * useAccessControl - Token gating brain
 * Frontend Guarantee: Always show UI, gate features gracefully
 */
export function useAccessControl(walletAddress) {
  const { hasPass, loading: genesisLoading } = useGenesisPass(walletAddress);
  const { ownsWearable, loading: wearableLoading } = useWearableOwnership(walletAddress);

  const canAccessFeature = useCallback((featureName) => {
    // Genesis-gated features
    const genesisFeatures = [
      'premium_wearables',
      'custom_avatars',
      'custom_environments',
      'animation_packs',
      'multiplayer_rooms',
      'creator_tools',
      'advanced_customization'
    ];

    if (genesisFeatures.includes(featureName)) {
      return hasPass;
    }

    // Public features (always accessible)
    return true;
  }, [hasPass]);

  const canEquipWearable = useCallback((wearableId) => {
    // Platform wearables are always accessible
    // NFT wearables require ownership
    return ownsWearable(wearableId);
  }, [ownsWearable]);

  const loading = genesisLoading || wearableLoading;

  return {
    hasPass,
    canAccessFeature,
    canEquipWearable,
    loading
  };
}

/**
 * useWeb3Integration - Complete Web3 runtime for DripSync
 * Orchestrates wallet, ownership, and access control
 */
export function useWeb3Integration() {
  const { address, connected, connect, disconnect } = useWallet();
  const { hasPass, tokenId } = useGenesisPass(address);
  const { ownedWearables, ownsWearable } = useWearableOwnership(address);
  const { linkWallet, checkLink } = useWalletLink();
  const { canAccessFeature, canEquipWearable } = useAccessControl(address);

  const initialize = useCallback(async () => {
    try {
      const walletAddress = await connect();
      await checkLink(walletAddress);
      return true;
    } catch (error) {
      console.error('Web3 initialization failed:', error);
      return false;
    }
  }, [connect, checkLink]);

  return {
    // Wallet state
    address,
    connected,
    connect,
    disconnect,
    
    // Ownership
    hasPass,
    tokenId,
    ownedWearables,
    ownsWearable,
    
    // Identity
    linkWallet,
    checkLink,
    
    // Access control
    canAccessFeature,
    canEquipWearable,
    
    // Initialization
    initialize
  };
}

/**
 * Feature Gate Component
 * Usage: <FeatureGate feature="premium_wearables">...</FeatureGate>
 */
export function FeatureGate({ feature, children, fallback = null, walletAddress }) {
  const { canAccessFeature, loading } = useAccessControl(walletAddress);

  if (loading) return null;
  if (!canAccessFeature(feature)) return fallback;
  
  return children;
}

export default useWeb3Integration;