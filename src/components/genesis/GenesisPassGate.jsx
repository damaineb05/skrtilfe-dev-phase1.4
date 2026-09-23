/**
 * GenesisPassGate — Wraps content that requires a Genesis Pass.
 *
 * Props:
 *   user         — current user object (required)
 *   children     — content to show when access is granted
 *   fallback     — optional custom fallback JSX
 *   featureName  — string describing the locked feature (shown in gate UI)
 *   soft         — if true, shows blurred preview instead of hard block
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Crown, Lock, Sparkles, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useGenesisPass } from '@/lib/useGenesisPass';

export default function GenesisPassGate({ user, children, fallback, featureName, soft = false }) {
  const { hasGenesis, isLoading } = useGenesisPass(user);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-7 h-7 animate-spin text-[#00D4FF]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-2xl p-8 text-center"
          style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,212,255,0.2)' }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }}>
            <Lock className="w-8 h-8 text-[#00D4FF]" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Sign In Required</h2>
          <p className="text-white/55 text-sm mb-6">
            {featureName ? `"${featureName}" is` : 'This feature is'} for Genesis Pass holders. Sign in to check your access.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="font-bold"
            style={{ background: '#00D4FF', color: '#000' }}
          >
            Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  if (hasGenesis) return children;

  // Soft mode: blurred overlay on top of children
  if (soft && children) {
    return (
      <div className="relative">
        <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] rounded-2xl">
          <GenesisGateContent featureName={featureName} />
        </div>
      </div>
    );
  }

  if (fallback) return fallback;

  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <GenesisGateContent featureName={featureName} />
    </div>
  );
}

function GenesisGateContent({ featureName }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full rounded-2xl p-8 text-center"
      style={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(0,212,255,0.25)', boxShadow: '0 0 60px rgba(0,212,255,0.1)' }}
    >
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: 'rgba(0,212,255,0.08)', border: '2px solid rgba(0,212,255,0.3)' }}>
        <Crown className="w-10 h-10 text-[#00D4FF]" />
      </div>

      <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
        Genesis Pass Required
      </h2>

      {featureName && (
        <p className="text-[#00D4FF] text-sm font-semibold mb-3">"{featureName}"</p>
      )}

      <p className="text-white/55 text-sm leading-relaxed mb-6">
        This is exclusive to Genesis Pass holders — one-time lifetime access to every premium feature, drop, and realm.
      </p>

      <div className="space-y-2 mb-6">
        {[
          { icon: Sparkles, text: 'Exclusive drops — 24hr early access' },
          { icon: Zap, text: 'Full DripSync Studio + all wearable slots' },
          { icon: Crown, text: 'Physical × Digital bundles — free twins' },
        ].map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg text-left"
            style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)' }}>
            <Icon className="w-4 h-4 text-[#00D4FF] shrink-0" />
            <span className="text-white/70 text-xs">{text}</span>
          </div>
        ))}
      </div>

      <Link to={createPageUrl('Genesis')}>
        <Button className="w-full font-bold py-5 rounded-xl" style={{ background: '#00D4FF', color: '#000' }}>
          Get Genesis Pass — $299
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </motion.div>
  );
}