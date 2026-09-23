import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function WalletConnectModal({ isOpen, onClose }) {
  const [showWhyWallet, setShowWhyWallet] = useState(false);

  const handleConnect = () => {
    base44.auth.redirectToLogin(window.location.pathname);
  };

  if (showWhyWallet) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#0A0A0F] border border-[#00D4FF]/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-black">Why Wallets?</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-white/80 text-sm leading-relaxed">
              Skrtlife uses wallets to unlock access — not to collect personal data.
            </p>

            <div className="space-y-2 text-sm text-white/60">
              <p className="font-bold text-white">No emails.</p>
              <p className="font-bold text-white">No passwords.</p>
              <p className="font-bold text-white">You stay in control.</p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/40 leading-relaxed">
                Your wallet acts as your identity. We never access your private keys or control your assets.
              </p>
            </div>

            <Button
              onClick={() => setShowWhyWallet(false)}
              variant="outline"
              className="w-full border-[#00D4FF]/50 text-[#00D4FF] hover:bg-[#00D4FF]/10"
            >
              Back to Connect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0A0A0F] border border-[#00D4FF]/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-black">Enter Skrtlife Digital Society</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0088CC] flex items-center justify-center">
              <Wallet className="w-8 h-8 text-black" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-white/80 text-sm leading-relaxed">
              Connecting your wallet verifies access and membership.
            </p>
            <p className="text-white/60 text-xs">
              We never access your private keys.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleConnect}
              className="w-full bg-gradient-to-r from-[#00D4FF] to-[#0088CC] hover:from-[#00E5FF] hover:to-[#0099DD] text-black font-bold py-6"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </Button>

            <button
              onClick={() => setShowWhyWallet(true)}
              className="w-full text-[#00D4FF] hover:text-white text-sm flex items-center justify-center gap-1 transition-colors py-2"
            >
              Learn Why Wallets Are Used
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/40 bg-white/5 rounded-lg p-3 border border-white/10">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Secure connection protected by Base44</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}