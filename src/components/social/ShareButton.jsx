import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Instagram, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShareButton({ url, text, image }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareText = text || "Check out what I'm building in Skrtlife Digital Society!";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleInstagramShare = () => {
    // Instagram doesn't have a direct URL share, so we copy to clipboard with Instagram hashtags
    const instagramText = `${shareText}\n\n#Skrtlife #DigitalSociety #Web3 #NFT #Metaverse`;
    navigator.clipboard.writeText(instagramText);
    alert('Caption copied! Open Instagram and paste in a new post.');
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="ledger-text-secondary hover:ledger-text-primary"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-10 bg-ledger-surface border ledger-border rounded-lg p-3 z-50 min-w-[200px]"
          >
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTwitterShare}
                className="w-full justify-start text-blue-400 hover:bg-blue-400/10"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Share on X
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleInstagramShare}
                className="w-full justify-start text-pink-400 hover:bg-pink-400/10"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Share on IG
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="w-full justify-start ledger-text-secondary hover:ledger-text-primary hover:bg-white/5"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}