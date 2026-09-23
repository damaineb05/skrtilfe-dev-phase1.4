/**
 * Wallet Service - Web3 wallet interaction abstraction
 */

import { CHAINS, getChainById, getRpcUrl } from './chains';

// Lightweight helpers replacing viem
const formatUnits = (value, decimals) => (Number(value) / Math.pow(10, decimals)).toString();
const parseUnits = (value, decimals) => BigInt(Math.round(parseFloat(value) * Math.pow(10, decimals)));

// Minimal wallet/public client stubs using window.ethereum directly
const createWalletClient = ({ account, chain, transport }) => ({
  account, chain,
  sendTransaction: async (params) => window.ethereum.request({ method: 'eth_sendTransaction', params: [params] }),
  writeContract: async () => { throw new Error('writeContract requires viem'); },
  signMessage: async ({ message }) => window.ethereum.request({ method: 'personal_sign', params: [message, account] }),
  signTypedData: async (params) => window.ethereum.request({ method: 'eth_signTypedData_v4', params: [account, JSON.stringify(params)] }),
});

const createPublicClient = ({ chain, transport }) => ({
  getBalance: async ({ address }) => {
    const hex = await window.ethereum.request({ method: 'eth_getBalance', params: [address, 'latest'] });
    return BigInt(hex);
  },
  readContract: async () => { throw new Error('readContract requires viem'); },
  estimateGas: async (params) => {
    const hex = await window.ethereum.request({ method: 'eth_estimateGas', params: [params] });
    return BigInt(hex);
  },
  waitForTransactionReceipt: async ({ hash }) => {
    return new Promise((resolve) => {
      const poll = async () => {
        const receipt = await window.ethereum.request({ method: 'eth_getTransactionReceipt', params: [hash] });
        if (receipt) resolve(receipt); else setTimeout(poll, 2000);
      };
      poll();
    });
  },
});

const custom = (provider) => ({ provider });
const http = (url) => ({ url });

class WalletService {
  constructor() {
    this.walletClient = null;
    this.publicClient = null;
    this.currentAccount = null;
    this.currentChainId = null;
    this.listeners = new Set();
  }

  async connect() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('No Web3 wallet detected. Please install MetaMask.');
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) throw new Error('No accounts found');

    this.currentAccount = accounts[0];
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    this.currentChainId = parseInt(chainId, 16);

    const chain = getChainById(this.currentChainId);
    
    this.walletClient = createWalletClient({
      account: this.currentAccount,
      chain,
      transport: custom(window.ethereum)
    });

    this.publicClient = createPublicClient({
      chain,
      transport: http(getRpcUrl(this.currentChainId))
    });

    this._setupListeners();
    this._notifyListeners({ type: 'connected', account: this.currentAccount, chainId: this.currentChainId });

    return { account: this.currentAccount, chainId: this.currentChainId, chain: chain?.name };
  }

  disconnect() {
    this.walletClient = null;
    this.publicClient = null;
    this.currentAccount = null;
    this.currentChainId = null;
    this._notifyListeners({ type: 'disconnected' });
  }

  async switchChain(chainId) {
    if (!window.ethereum) throw new Error('No wallet connected');
    const chain = getChainById(chainId);
    if (!chain) throw new Error(`Chain ${chainId} not supported`);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) await this._addChainToWallet(chain);
      else throw switchError;
    }
  }

  async _addChainToWallet(chain) {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${chain.id.toString(16)}`,
        chainName: chain.name,
        nativeCurrency: chain.nativeCurrency,
        rpcUrls: chain.rpcUrls.default.http,
        blockExplorerUrls: [chain.blockExplorers.default.url]
      }]
    });
  }

  async getBalance(tokenAddress = null) {
    if (!this.publicClient || !this.currentAccount) throw new Error('Wallet not connected');

    if (!tokenAddress) {
      const balance = await this.publicClient.getBalance({ address: this.currentAccount });
      return formatUnits(balance, 18);
    } else {
      const balance = await this.publicClient.readContract({
        address: tokenAddress,
        abi: [{ name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: 'balance', type: 'uint256' }] }],
        functionName: 'balanceOf',
        args: [this.currentAccount]
      });
      return formatUnits(balance, 6);
    }
  }

  async sendTransaction({ to, value, data = '0x' }) {
    if (!this.walletClient) throw new Error('Wallet not connected');
    
    const gas = await this.publicClient.estimateGas({ account: this.currentAccount, to, value, data });
    const hash = await this.walletClient.sendTransaction({ account: this.currentAccount, to, value, data, gas: gas * 120n / 100n });
    return hash;
  }

  async transferToken(tokenAddress, toAddress, amount, decimals = 6) {
    if (!this.walletClient) throw new Error('Wallet not connected');

    const hash = await this.walletClient.writeContract({
      address: tokenAddress,
      abi: [{ name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: 'success', type: 'bool' }] }],
      functionName: 'transfer',
      args: [toAddress, parseUnits(amount.toString(), decimals)]
    });
    return hash;
  }

  async waitForTransaction(hash) {
    if (!this.publicClient) throw new Error('Wallet not connected');
    return await this.publicClient.waitForTransactionReceipt({ hash, confirmations: 2 });
  }

  async signMessage(message) {
    if (!this.walletClient) throw new Error('Wallet not connected');
    return await this.walletClient.signMessage({ account: this.currentAccount, message });
  }

  async signTypedData(domain, types, message) {
    if (!this.walletClient) throw new Error('Wallet not connected');
    return await this.walletClient.signTypedData({ account: this.currentAccount, domain, types, primaryType: Object.keys(types)[0], message });
  }

  getState() {
    return { connected: !!this.currentAccount, account: this.currentAccount, chainId: this.currentChainId, chain: getChainById(this.currentChainId) };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _setupListeners() {
    if (!window.ethereum) return;
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) this.disconnect();
      else { this.currentAccount = accounts[0]; this._notifyListeners({ type: 'accountChanged', account: accounts[0] }); }
    });
    window.ethereum.on('chainChanged', (chainId) => {
      this.currentChainId = parseInt(chainId, 16);
      this._notifyListeners({ type: 'chainChanged', chainId: this.currentChainId });
      window.location.reload();
    });
  }

  _notifyListeners(event) {
    this.listeners.forEach(listener => listener(event));
  }
}

export const walletService = new WalletService();