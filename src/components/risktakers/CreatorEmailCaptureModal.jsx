/**
 * CreatorEmailCaptureModal
 * Lightweight email capture gate for Creator Mode interest
 * Collects emails for creator updates, product drops, DripSync, Genesis
 * No full account required
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CreatorEmailCaptureModal({ isOpen, onClose, currentUser = null }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);

  const validateEmail = (e) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    
    if (!validateEmail(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setIsDuplicate(false);

    try {
      // Check for duplicate
      const existing = await base44.entities.CreatorSubscriber.filter({
        email: email.trim().toLowerCase(),
      });

      if (existing && existing.length > 0) {
        setIsDuplicate(true);
        setError('');
        setLoading(false);
        return;
      }

      // Create new subscriber
      await base44.entities.CreatorSubscriber.create({
        email: email.trim().toLowerCase(),
        source: 'creator_toggle',
        status: 'subscribed',
        subscribed_to: {
          creator_updates: true,
          product_drops: true,
          dripsync_updates: true,
          genesis_updates: true,
        },
        user_id: currentUser?.id || null,
      });

      setDone(true);
    } catch (err) {
      console.error('Creator subscriber error:', err);
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setEmail('');
    setError('');
    setDone(false);
    setIsDuplicate(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[5000]"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[5001] w-[92vw] max-w-[450px] rounded-3xl"
            style={{
              background: 'rgba(12,12,20,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
              style={{ background: 'rgba(255,255,255,0.07)' }}
              aria-label="Close modal"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="p-8 md:p-10">
              {!done && !isDuplicate ? (
                // Input state
                <>
                  {/* Icon */}
                  <motion.div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Mail className="w-6 h-6" style={{ color: '#00D4FF' }} />
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    className="font-black mb-2 leading-tight"
                    style={{ fontSize: 'clamp(24px, 6vw, 32px)', color: '#fff', letterSpacing: '-0.03em' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                  >
                    Creator access is opening soon.
                  </motion.h2>

                  {/* Subtitle */}
                  <motion.p
                    className="text-sm mb-8 leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                  >
                    Join the Skrtlife creator list for early drops, DripSync updates, creator tools, and product releases.
                  </motion.p>

                  {/* Form */}
                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.16 }}
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-5 py-3.5 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        caretColor: '#00D4FF',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(0,212,255,0.3)')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      disabled={loading}
                    />

                    {error && (
                      <motion.p
                        className="text-xs font-medium"
                        style={{ color: '#FF3366' }}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {error}
                      </motion.p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: loading ? 'rgba(0,212,255,0.4)' : 'linear-gradient(135deg, rgba(0,212,255,0.9), rgba(0,180,220,0.9))',
                        color: '#000',
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {loading ? 'Saving...' : 'Reserve Creator Access'}
                    </button>
                  </motion.form>

                  {/* Legal note */}
                  <p className="text-[10px] text-center mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    We respect your privacy. You'll only hear about creator updates and launches.
                  </p>
                </>
              ) : isDuplicate ? (
                // Duplicate state
                <motion.div
                  className="py-8 flex flex-col items-center text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                    style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)' }}
                  >
                    <Check className="w-6 h-6" style={{ color: '#00D4FF' }} />
                  </div>
                  <h3 className="font-black text-2xl mb-2" style={{ letterSpacing: '-0.03em', color: '#fff' }}>
                    You're already on the list.
                  </h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    We'll send updates before the next drop.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-8 text-xs uppercase tracking-[0.2em] transition-colors"
                    style={{ color: 'rgba(0,212,255,0.6)' }}
                    onMouseEnter={(e) => (e.target.style.color = 'rgba(0,212,255,1)')}
                    onMouseLeave={(e) => (e.target.style.color = 'rgba(0,212,255,0.6)')}
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                // Success state
                <motion.div
                  className="py-8 flex flex-col items-center text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                    style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
                  >
                    <Check className="w-6 h-6" style={{ color: '#00D4FF' }} />
                  </motion.div>
                  <h3 className="font-black text-2xl mb-2" style={{ letterSpacing: '-0.03em', color: '#fff' }}>
                    You're on the creator list.
                  </h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    We'll send updates before the next drop.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-8 text-xs uppercase tracking-[0.2em] transition-colors"
                    style={{ color: 'rgba(0,212,255,0.6)' }}
                    onMouseEnter={(e) => (e.target.style.color = 'rgba(0,212,255,1)')}
                    onMouseLeave={(e) => (e.target.style.color = 'rgba(0,212,255,0.6)')}
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}