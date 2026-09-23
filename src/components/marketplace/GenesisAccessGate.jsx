/**
 * GenesisAccessGate — Page-level gate for Genesis-only pages/sections.
 * Uses the central useGenesisPass hook for consistent access logic.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Crown, Lock, Sparkles, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useGenesisPass } from '@/lib/useGenesisPass';

export default function GenesisAccessGate({ currentUser, children }) {
  const { hasGenesis, isLoading } = useGenesisPass(currentUser);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0A0A0F] to-[#050810]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0A0A0F] to-[#050810] px-4">
        <GateCard
          icon={<Lock className="w-10 h-10 text-[#00D4FF]" />}
          title="Sign In Required"
          desc="Please sign in to access the Genesis Marketplace."
          cta={
            <Button onClick={() => window.location.href = '/'} className="w-full font-bold" style={{ background: '#00D4FF', color: '#000' }}>
              Sign In
            </Button>
          }
        />
      </div>
    );
  }

  if (!hasGenesis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0A0A0F] to-[#050810] px-4">
        <GateCard
          icon={<Crown className="w-12 h-12 text-[#00D4FF]" />}
          title="Genesis Pass Required"
          desc="The Genesis Marketplace is exclusive to pass holders. Get lifetime access to premium NFTs, early drops, and creator perks."
          perks={[
            { icon: Sparkles, text: 'Premium curated NFTs' },
            { icon: Zap, text: 'Early access to new drops' },
            { icon: Crown, text: 'Exclusive creator benefits' },
          ]}
          cta={
            <div className="space-y-3">
              <Link to={createPageUrl('Genesis')}>
                <Button className="w-full font-bold py-5 text-base rounded-xl" style={{ background: '#00D4FF', color: '#000' }}>
                  <Crown className="w-5 h-5 mr-2" />
                  Get Genesis Pass — $299
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('NFTMarketplace')}>
                <Button variant="outline" className="w-full border-white/15 text-white/60 hover:bg-white/5 font-bold">
                  Visit General Marketplace
                </Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return children;
}

function GateCard({ icon, title, desc, perks, cta }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full rounded-2xl p-8 text-center"
      style={{
        background: 'rgba(0,0,0,0.75)',
        border: '1px solid rgba(0,212,255,0.25)',
        boxShadow: '0 0 60px rgba(0,212,255,0.12)',
      }}
    >
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: 'rgba(0,212,255,0.08)', border: '2px solid rgba(0,212,255,0.25)' }}>
        {icon}
      </div>
      <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">{title}</h2>
      <p className="text-white/55 text-sm leading-relaxed mb-6">{desc}</p>

      {perks && (
        <div className="space-y-2 mb-6 text-left">
          {perks.map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)' }}>
                <Icon className="w-4 h-4 text-[#00D4FF]" />
              </div>
              <span className="text-white/70 text-sm">{text}</span>
            </div>
          ))}
        </div>
      )}

      {cta}
    </motion.div>
  );
}