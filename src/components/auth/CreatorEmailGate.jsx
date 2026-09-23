import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Check } from 'lucide-react';

export default function CreatorEmailGate({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error | duplicate
  const [errorMsg, setErrorMsg] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (!validateEmail(email)) {
      setStatus('error');
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      // Check for existing subscriber
      const existing = await base44.entities.CreatorSubscriber.filter({ email });
      
      if (existing.length > 0) {
        setStatus('duplicate');
        setEmail('');
        return;
      }

      // Get current user if authenticated
      let userId = null;
      try {
        const user = await base44.auth.me();
        userId = user?.id;
      } catch (_) {
        // Not authenticated, that's ok
      }

      // Create subscriber record
      await base44.entities.CreatorSubscriber.create({
        email,
        source: 'creator_toggle',
        status: 'subscribed',
        user_id: userId,
        interests: ['creator_updates', 'product_drops', 'dripsync_updates', 'genesis_updates'],
        subscribed_at: new Date().toISOString(),
      });

      setStatus('success');
      setTimeout(() => {
        setEmail('');
        setStatus('idle');
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Creator email gate error:', err);
      setStatus('error');
      setErrorMsg('Failed to save email. Please try again.');
    }
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9995]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[9996] p-4"
          >
            <div
              className="w-full max-w-md rounded-2xl p-8"
              style={{
                background: 'rgba(10,10,15,0.95)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              {/* Content */}
              {status !== 'success' && status !== 'duplicate' && (
                <>
                  <div className="text-center mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(0,212,255,0.12)' }}
                    >
                      <Mail className="w-6 h-6" style={{ color: '#00D4FF' }} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Creator access is opening soon.
                    </h2>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Join the Skrtlife creator list for early drops, DripSync updates, creator tools, and product releases.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setStatus('idle');
                        setErrorMsg('');
                      }}
                      disabled={status === 'loading'}
                      className="bg-white/5 border-white/10 text-white h-11 text-sm"
                    />

                    {status === 'error' && (
                      <p className="text-red-400 text-xs">{errorMsg}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={status === 'loading' || !email.trim()}
                      className="w-full h-11 font-bold text-sm"
                      style={{
                        background: '#00D4FF',
                        color: '#000',
                      }}
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Reserving...
                        </>
                      ) : (
                        'Reserve Creator Access'
                      )}
                    </Button>
                  </form>

                  <p className="text-white/40 text-xs text-center mt-4">
                    We'll send updates before the next drop. No spam, ever.
                  </p>
                </>
              )}

              {/* Success State */}
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(34,197,94,0.12)' }}
                  >
                    <Check className="w-6 h-6" style={{ color: '#22C55E' }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    You're on the creator list.
                  </h3>
                  <p className="text-white/60 text-sm">
                    We'll send updates before the next drop.
                  </p>
                </motion.div>
              )}

              {/* Duplicate State */}
              {status === 'duplicate' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(0,212,255,0.12)' }}
                  >
                    <Check className="w-6 h-6" style={{ color: '#00D4FF' }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    You're already on the creator list.
                  </h3>
                  <p className="text-white/60 text-sm mb-6">
                    We'll send updates to your email before the next drop.
                  </p>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full h-11 font-bold text-sm"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    Got it
                  </Button>
                </motion.div>
              )}

              {/* Close button */}
              {(status === 'idle' || status === 'error') && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <span className="text-white/50 text-lg">×</span>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}