import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle2, Zap, TrendingUp, ExternalLink } from 'lucide-react';

const getExplorerUrl = (chainId, type, hash) => {
  const explorers = {
    1: 'https://etherscan.io',
    137: 'https://polygonscan.com',
    8453: 'https://basescan.org',
  };
  const base = explorers[chainId] || 'https://etherscan.io';
  return `${base}/${type}/${hash}`;
};
import { cryptoPaymentService } from '../payments/cryptoPaymentService';
import { walletService } from '../web3/walletService';
import { CHAINS } from '../web3/chains';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { auditLogger } from '../utils/auditLogger';

export default function CryptoCheckout({ 
  orderId, 
  totalAmount, 
  recipientAddress, 
  onSuccess, 
  onError 
}) {
  const { toast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState('USDC');
  const [selectedChain, setSelectedChain] = useState(CHAINS.BASE);
  const [walletState, setWalletState] = useState(walletService.getState());
  const [simulation, setSimulation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [txStatus, setTxStatus] = useState(null);

  useEffect(() => {
    const unsubscribe = walletService.subscribe((event) => {
      setWalletState(walletService.getState());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (walletState.connected && totalAmount > 0) {
      simulatePayment();
    }
  }, [walletState.connected, selectedCurrency, selectedChain, totalAmount]);

  const simulatePayment = async () => {
    setIsSimulating(true);
    try {
      const result = await cryptoPaymentService.simulatePayment(
        recipientAddress,
        totalAmount,
        selectedCurrency,
        selectedChain.id
      );
      setSimulation(result);
    } catch (error) {
      console.error('Simulation failed:', error);
      setSimulation({ canPay: false, error: error.message });
    } finally {
      setIsSimulating(false);
    }
  };

  const executePayment = async () => {
    setIsPaying(true);
    setTxHash(null);
    setTxStatus('initiating');

    try {
      // Log payment attempt
      const user = await base44.auth.me();
      await auditLogger.log({
        actor: user,
        action: 'payment',
        entityType: 'Order',
        entityId: orderId,
        metadata: {
          amount: totalAmount,
          currency: selectedCurrency,
          chain_id: selectedChain.id
        }
      });

      let result;
      if (selectedCurrency === 'USDC') {
        result = await cryptoPaymentService.payWithUSDC(
          recipientAddress,
          totalAmount,
          selectedChain.id
        );
      } else {
        result = await cryptoPaymentService.payWithNative(
          recipientAddress,
          totalAmount,
          selectedChain.id
        );
      }

      setTxHash(result.txHash);
      setTxStatus(result.success ? 'confirmed' : 'failed');

      // Create transaction record
      await base44.entities.Transaction.create({
        tx_hash: result.txHash,
        chain_id: selectedChain.id,
        from_address: walletState.account,
        to_address: recipientAddress,
        amount: totalAmount.toString(),
        currency: selectedCurrency,
        tx_type: 'payment',
        status: result.success ? 'confirmed' : 'failed',
        block_number: result.blockNumber,
        gas_used: result.gasUsed,
        order_id: orderId,
        user_email: user.email
      });

      // Update order status
      await base44.entities.Order.update(orderId, {
        payment_status: 'paid',
        transaction_id: result.txHash,
        payment_method: `crypto_${selectedCurrency.toLowerCase()}`,
        events: [
          ...(await base44.entities.Order.get(orderId)).events || [],
          {
            timestamp: new Date().toISOString(),
            message: `Payment confirmed: ${result.txHash}`
          }
        ]
      });

      toast({
        title: 'Payment Successful!',
        description: `Transaction confirmed on ${selectedChain.name}`,
      });

      onSuccess?.(result);
    } catch (error) {
      console.error('Payment failed:', error);
      setTxStatus('failed');
      
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: error.message,
      });

      onError?.(error);
    } finally {
      setIsPaying(false);
    }
  };

  if (!walletState.connected) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-white mb-4">Please connect your wallet to continue</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-cyan-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Crypto Payment
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Currency Selection */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
            Payment Currency
          </label>
          <div className="flex gap-2">
            {['USDC', 'ETH'].map(currency => (
              <Button
                key={currency}
                onClick={() => setSelectedCurrency(currency)}
                variant={selectedCurrency === currency ? 'default' : 'outline'}
                className={selectedCurrency === currency 
                  ? 'bg-cyan-500 text-black' 
                  : 'border-zinc-700 text-white hover:bg-zinc-800'}
              >
                {currency}
              </Button>
            ))}
          </div>
        </div>

        {/* Chain Selection */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
            Network
          </label>
          <div className="flex flex-wrap gap-2">
            {[CHAINS.BASE, CHAINS.ETHEREUM, CHAINS.POLYGON].map(chain => (
              <Button
                key={chain.id}
                onClick={() => setSelectedChain(chain)}
                variant={selectedChain.id === chain.id ? 'default' : 'outline'}
                size="sm"
                className={selectedChain.id === chain.id
                  ? 'bg-purple-500 text-white'
                  : 'border-zinc-700 text-white hover:bg-zinc-800'}
              >
                {chain.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-black/40 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Amount</span>
            <span className="text-white font-bold">{totalAmount} {selectedCurrency}</span>
          </div>
          {simulation && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Gas (est.)</span>
                <span className="text-white">~{simulation.gasEstimate?.estimatedCost} ETH</span>
              </div>
              <div className="flex justify-between text-sm border-t border-zinc-800 pt-2">
                <span className="text-gray-400">Total Cost</span>
                <span className="text-cyan-400 font-bold">
                  {totalAmount} {selectedCurrency} + gas
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-400">Your Balance:</span>
                <span className="text-xs text-white font-mono">{simulation.balance} {selectedCurrency}</span>
                {simulation.canPay ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </>
          )}
        </div>

        {/* Wrong Network Warning */}
        {walletState.chainId !== selectedChain.id && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-semibold text-sm">Wrong Network</p>
              <p className="text-yellow-400/80 text-xs">
                Please switch to {selectedChain.name} in your wallet
              </p>
            </div>
          </div>
        )}

        {/* Insufficient Balance Warning */}
        {simulation && !simulation.canPay && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold text-sm">Insufficient Balance</p>
              <p className="text-red-400/80 text-xs">
                You need {totalAmount} {selectedCurrency} but only have {simulation.balance}
              </p>
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {txHash && (
          <div className={`rounded-lg p-3 ${
            txStatus === 'confirmed' ? 'bg-green-500/10 border border-green-500/30' : 
            txStatus === 'failed' ? 'bg-red-500/10 border border-red-500/30' :
            'bg-blue-500/10 border border-blue-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {txStatus === 'confirmed' ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : txStatus === 'failed' ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : (
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              )}
              <span className="text-sm font-semibold text-white capitalize">{txStatus}</span>
            </div>
            <a
              href={getExplorerUrl(selectedChain.id, 'tx', txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              View on {selectedChain.blockExplorers.default.name}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Pay Button */}
        <Button
          onClick={executePayment}
          disabled={
            isPaying || 
            isSimulating || 
            !simulation?.canPay || 
            walletState.chainId !== selectedChain.id ||
            txStatus === 'confirmed'
          }
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold h-12"
        >
          {isPaying ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : txStatus === 'confirmed' ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Payment Complete
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Pay {totalAmount} {selectedCurrency}
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-500">
          Transaction will be confirmed on {selectedChain.name}
        </p>
      </CardContent>
    </Card>
  );
}