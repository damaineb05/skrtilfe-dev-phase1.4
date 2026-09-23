/**
 * Crypto Payment Service - USDC/ETH payment handling
 */

import { parseUnits, formatUnits } from 'viem';
import { walletService } from '../web3/walletService';
import { CHAINS } from '../web3/chains';

class CryptoPaymentService {
  async estimatePaymentGas(amount, currency = 'USDC', chainId) {
    const chain = Object.values(CHAINS).find(c => c.id === chainId);
    if (!chain) throw new Error('Unsupported chain');

    const isNative = currency === 'ETH' || currency === 'MATIC';
    const gasEstimate = isNative ? 21000n : 65000n;
    
    return {
      gasLimit: gasEstimate,
      estimatedCost: formatUnits(gasEstimate * 30000000000n, 18)
    };
  }

  async payWithUSDC(recipientAddress, amountUSD, chainId) {
    const chain = Object.values(CHAINS).find(c => c.id === chainId);
    if (!chain?.contracts?.usdc) throw new Error('USDC not supported on this chain');

    const walletState = walletService.getState();
    if (!walletState.connected) throw new Error('Wallet not connected');
    if (walletState.chainId !== chainId) throw new Error(`Please switch to ${chain.name}`);

    const balance = await walletService.getBalance(chain.contracts.usdc);
    if (parseFloat(balance) < amountUSD) throw new Error(`Insufficient USDC balance. You have ${balance} USDC`);

    const txHash = await walletService.transferToken(chain.contracts.usdc, recipientAddress, amountUSD, 6);
    const receipt = await walletService.waitForTransaction(txHash);

    return {
      success: receipt.status === 'success',
      txHash,
      blockNumber: receipt.blockNumber,
      gasUsed: formatUnits(receipt.gasUsed, 0)
    };
  }

  async payWithNative(recipientAddress, amountETH, chainId) {
    const walletState = walletService.getState();
    if (!walletState.connected) throw new Error('Wallet not connected');
    if (walletState.chainId !== chainId) throw new Error('Wrong network');

    const valueWei = parseUnits(amountETH.toString(), 18);
    const txHash = await walletService.sendTransaction({ to: recipientAddress, value: valueWei });
    const receipt = await walletService.waitForTransaction(txHash);

    return { success: receipt.status === 'success', txHash, blockNumber: receipt.blockNumber, gasUsed: formatUnits(receipt.gasUsed, 0) };
  }

  async getUSDCBalance(chainId) {
    const chain = Object.values(CHAINS).find(c => c.id === chainId);
    if (!chain?.contracts?.usdc) return '0';
    try { return await walletService.getBalance(chain.contracts.usdc); } 
    catch (error) { return '0'; }
  }

  async simulatePayment(recipientAddress, amount, currency, chainId) {
    const gasEstimate = await this.estimatePaymentGas(amount, currency, chainId);
    const balance = currency === 'USDC' ? await this.getUSDCBalance(chainId) : await walletService.getBalance();
    return { canPay: parseFloat(balance) >= amount, balance, gasEstimate, totalCost: amount + parseFloat(gasEstimate.estimatedCost) };
  }
}

export const cryptoPaymentService = new CryptoPaymentService();