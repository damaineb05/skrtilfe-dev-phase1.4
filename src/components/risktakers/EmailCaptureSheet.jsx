import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EmailCaptureSheet({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Enter a valid email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await base44.entities.Newsletter.create({ email: email.trim(), signup_source: 'genesis' });
      setDone(true);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9000]"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)' }}
            onClick={onClose}
          />

          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[9001] rounded-t-[28px]"
            style={{
              background: '#080810',
              border: '1px solid rgba(255,255,255,0.08)',
              borderBottom: 'none',
            }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="px-8 pb-14 pt-6">
              {!done ? (
                <>
                  <p className="text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: 'rgba(180,150,80,0.7)' }}>
                    Exclusive Access
                  </p>
                  <h2
                    className="font-black mb-2"
                    style={{ fontSize: 'clamp(26px, 7vw, 36px)', letterSpacing: '-0.03em', color: '#fff' }}
                  >
                    Not everyone<br />gets in.
                  </h2>
                  <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Enter your email.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-5 py-4 rounded-2xl text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        caretColor: '#B8960C',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(180,150,80,0.4)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    {error && (
                      <p className="text-xs" style={{ color: '#FF3366' }}>{error}</p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: loading ? 'rgba(180,150,80,0.4)' : 'linear-gradient(135deg, rgba(180,150,80,0.9), rgba(140,110,50,0.9))',
                        color: '#000',
                      }}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request Access'}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 flex flex-col items-center text-center"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                    style={{ background: 'rgba(180,150,80,0.15)', border: '1px solid rgba(180,150,80,0.3)' }}
                  >
                    <Check className="w-6 h-6" style={{ color: '#B8960C' }} />
                  </div>
                  <h3 className="font-black text-2xl mb-2" style={{ letterSpacing: '-0.03em', color: '#fff' }}>
                    You're in line.
                  </h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    We'll reach out when access drops.
                  </p>
                  <button onClick={onClose} className="mt-8 text-xs uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
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