import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function AuthGateModal({ isOpen, reason, onClose, onAfterAuth }) {
  const handleSignIn = async () => {
    onClose();
    await base44.auth.redirectToLogin(window.location.pathname);
  };

  const handleCreateAccount = async () => {
    onClose();
    // Redirect to signup flow (same as sign in for now)
    await base44.auth.redirectToLogin(window.location.pathname);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div
              className="bg-gradient-to-br from-[#1A1A28] to-[#0D0D14] border border-[#00D4FF]/30 rounded-2xl p-8 shadow-2xl"
              style={{
                boxShadow: '0 0 40px rgba(0, 212, 255, 0.1)',
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>

              {/* Header */}
              <h2 className="text-2xl font-bold text-white mb-2">Sign in to continue</h2>
              <div className="h-1 w-12 bg-gradient-to-r from-[#00D4FF] to-[#FF3366] rounded-full mb-6" />

              {/* Reason */}
              <p className="text-white/70 mb-8 leading-relaxed">
                {reason || 'You need to be signed in to perform this action.'}
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleSignIn}
                  className="w-full bg-gradient-to-r from-[#00D4FF] to-[#00B8FF] hover:from-[#00E5FF] hover:to-[#00D4FF] text-black font-bold py-2 rounded-lg transition-all"
                >
                  Sign In
                </Button>
                <Button
                  onClick={handleCreateAccount}
                  variant="outline"
                  className="w-full border-[#00D4FF]/50 text-[#00D4FF] hover:bg-[#00D4FF]/10 py-2 rounded-lg transition-all"
                >
                  Create Account
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full text-white/60 hover:text-white hover:bg-white/10 py-2 rounded-lg transition-all"
                >
                  Cancel
                </Button>
              </div>

              {/* Footer */}
              <p className="text-xs text-white/40 text-center mt-6">
                Sign in once and unlock full access to the platform
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}