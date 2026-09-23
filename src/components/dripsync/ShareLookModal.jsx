import React, { useState } from 'react';
import { X, Copy, Check, Share2, Twitter, Facebook, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function ShareLookModal({ isOpen, onClose, look }) {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen || !look) return null;

  const shareUrl = look.slug
    ? `${window.location.origin}${window.location.pathname}?look=${look.slug}`
    : `${window.location.origin}${window.location.pathname}?look=${look.id}`;
  const shareText = `Check out my DripSync look: ${look.name}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const downloadLook = () => {
    const data = JSON.stringify(look, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${look.slug || look.id}-look.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 rounded-2xl border-2 border-cyan-500/30 shadow-2xl max-w-lg w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Share2 className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Share Your Look</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-400">{look.name}</p>
        </div>

        <div className="p-6 space-y-6">
          {look.thumbnail_url && (
            <div className="aspect-video rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700">
              <img
                src={look.thumbnail_url}
                alt={look.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">Share Link</label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 bg-zinc-800 border-zinc-700 text-white font-mono text-sm"
              />
              <Button
                onClick={copyToClipboard}
                className="bg-cyan-500 hover:bg-cyan-600 text-black"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-400 mt-2">✓ Link copied to clipboard!</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-3 block">Share On</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={shareToTwitter}
                variant="outline"
                className="border-zinc-700 hover:bg-zinc-800"
              >
                <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                Twitter
              </Button>
              <Button
                onClick={shareToFacebook}
                variant="outline"
                className="border-zinc-700 hover:bg-zinc-800"
              >
                <Facebook className="w-4 h-4 mr-2 text-blue-500" />
                Facebook
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <Button
              onClick={downloadLook}
              variant="outline"
              className="w-full border-zinc-700 text-white hover:bg-zinc-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Look Data
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}