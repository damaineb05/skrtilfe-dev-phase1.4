import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Save, 
  Sparkles, 
  ShoppingCart, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy
} from 'lucide-react';
// NotificationSystem removed — Studio is no longer active
const useNotifications = () => ({
  success: (msg) => console.log('[Studio]', msg),
  error: (msg) => console.error('[Studio]', msg),
});

export default function StudioActions({ 
  canSave, 
  canMint, 
  onSaveDraft, 
  onMint, 
  onAddToCart,
  isSaving = false,
  isMinting = false,
  mintResult = null,
  className = ""
}) {
  const { success, error } = useNotifications();

  const handleSaveDraft = async () => {
    try {
      await onSaveDraft?.();
      success('Draft saved successfully');
    } catch (err) {
      error('Failed to save draft');
    }
  };

  const handleMint = async () => {
    try {
      await onMint?.();
    } catch (err) {
      error('Minting failed. Please try again.');
    }
  };

  const handleAddToCart = async () => {
    try {
      await onAddToCart?.();
      success('NFT added to cart');
    } catch (err) {
      error('Failed to add to cart');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    success(`${label} copied to clipboard`);
  };

  // Show mint success result
  if (mintResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`space-y-6 ${className}`}
      >
        <div className="glass-card neon-border p-6 rounded-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">NFT Minted Successfully!</h3>
            <p className="text-gray-400">Your NFT has been created on the blockchain</p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <span className="text-gray-400">Contract:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono">
                  {mintResult.contract?.slice(0, 6)}...{mintResult.contract?.slice(-4)}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(mintResult.contract, 'Contract address')}
                  className="w-6 h-6 text-gray-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <span className="text-gray-400">Token ID:</span>
              <span className="text-white font-semibold">#{mintResult.tokenId}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <span className="text-gray-400">Transaction:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono">
                  {mintResult.txHash?.slice(0, 6)}...{mintResult.txHash?.slice(-4)}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => window.open(`https://etherscan.io/tx/${mintResult.txHash}`, '_blank')}
                  className="w-6 h-6 text-gray-400 hover:text-cyan-400"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <span className="text-gray-400">Metadata:</span>
              <div className="flex items-center gap-2">
                <Badge className="bg-cyan-500/20 text-cyan-400">IPFS</Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(mintResult.metadataCid, 'Metadata CID')}
                  className="w-6 h-6 text-gray-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button
              onClick={handleAddToCart}
              className="btn-neon-primary"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            
            <Button
              onClick={() => window.open(`https://opensea.io/assets/ethereum/${mintResult.contract}/${mintResult.tokenId}`, '_blank')}
              variant="outline"
              className="neon-border text-cyan-400 hover:bg-cyan-400/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on OpenSea
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          onClick={handleSaveDraft}
          disabled={!canSave || isSaving}
          variant="outline"
          className="neon-border text-gray-300 hover:bg-gray-700/50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Draft
        </Button>

        <Button
          onClick={handleMint}
          disabled={!canMint || isMinting}
          className="btn-neon-primary col-span-1 sm:col-span-2"
        >
          {isMinting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          {isMinting ? 'Minting...' : 'Mint NFT'}
        </Button>
      </div>

      {!canMint && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-400 text-sm">
            Complete all fields and submit an asset to enable minting
          </p>
        </div>
      )}
    </div>
  );
}