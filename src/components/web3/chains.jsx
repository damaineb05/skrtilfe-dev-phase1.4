/**
 * Chain Configuration
 * Multi-chain support with RPC fallback for production reliability
 */

export const CHAINS = {
  // Ethereum Mainnet
  ETHEREUM: {
    id: 1,
    name: 'Ethereum',
    network: 'ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://eth.llamarpc.com'] },
      fallback: { http: ['https://rpc.ankr.com/eth', 'https://ethereum.publicnode.com'] }
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://etherscan.io' }
    },
    contracts: {
      usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      marketplace: null,
    }
  },
  
  BASE: {
    id: 8453,
    name: 'Base',
    network: 'base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://mainnet.base.org'] },
      fallback: { http: ['https://base.llamarpc.com', 'https://base.publicnode.com'] }
    },
    blockExplorers: {
      default: { name: 'BaseScan', url: 'https://basescan.org' }
    },
    contracts: {
      usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      marketplace: null,
    }
  },
  
  POLYGON: {
    id: 137,
    name: 'Polygon',
    network: 'polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://polygon-rpc.com'] },
      fallback: { http: ['https://rpc.ankr.com/polygon', 'https://polygon.llamarpc.com'] }
    },
    blockExplorers: {
      default: { name: 'PolygonScan', url: 'https://polygonscan.com' }
    },
    contracts: {
      usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      marketplace: null,
    }
  },

  SEPOLIA: {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    testnet: true,
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://rpc.sepolia.org'] },
      fallback: { http: ['https://ethereum-sepolia.publicnode.com'] }
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' }
    },
    contracts: {
      usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      marketplace: null,
    }
  },

  BASE_SEPOLIA: {
    id: 84532,
    name: 'Base Sepolia',
    network: 'base-sepolia',
    testnet: true,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://sepolia.base.org'] },
      fallback: { http: ['https://base-sepolia.publicnode.com'] }
    },
    blockExplorers: {
      default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' }
    },
    contracts: {
      usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      marketplace: null,
    }
  }
};

export const DEFAULT_CHAIN = CHAINS.BASE;

export const SUPPORTED_CHAINS = [CHAINS.ETHEREUM, CHAINS.BASE, CHAINS.POLYGON];
export const TESTNET_CHAINS = [CHAINS.SEPOLIA, CHAINS.BASE_SEPOLIA];

export const getChainById = (chainId) => Object.values(CHAINS).find(c => c.id === chainId);
export const isChainSupported = (chainId) => SUPPORTED_CHAINS.some(c => c.id === chainId);
export const getRpcUrl = (chainId) => getChainById(chainId)?.rpcUrls.default.http[0];
export const getExplorerUrl = (chainId, type = 'tx', hash = '') => `${getChainById(chainId)?.blockExplorers.default.url}/${type}/${hash}`;