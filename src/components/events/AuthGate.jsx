import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Lock, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AuthGate({ isOpen, onClose, action = 'continue' }) {
  const handleSignIn = () => {
    base44.auth.redirectToLogin(window.location.pathname);
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-center mb-3">
                Sign in to {action}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                Join the Skrtlife Digital Society to access exclusive events, drops, and community features.
              </p>

              {/* Benefits */}
              <div className="space-y-3 mb-8">
                {[
                  'Buy event tickets',
                  'Join exclusive drops',
                  'Engage with community',
                  'Build your portfolio'
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleSignIn}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-6 text-base"
                >
                  Sign In
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full"
                >
                  Continue Browsing
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}