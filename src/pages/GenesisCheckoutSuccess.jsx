import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle2, Sparkles, ArrowRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GenesisCheckoutSuccess() {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer);
          window.location.href = createPageUrl('DripSync');
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-green-400/20 rounded-full blur-2xl" />
          <CheckCircle2 className="w-24 h-24 text-green-400 relative z-10" />
        </div>

        <div className="inline-flex items-center gap-2 bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-full px-4 py-2 text-sm font-semibold text-[#00D4FF] mb-6">
          <Sparkles className="w-4 h-4" />
          Welcome to the Genesis
        </div>

        <h1 className="text-4xl md:text-5xl font-black mb-4">
          You're In. 🎉
        </h1>
        <p className="text-white/60 text-lg mb-2 leading-relaxed">
          Your Genesis Pass is confirmed. You now have lifetime access to the full SKRTLIFE Digital Society.
        </p>
        <p className="text-white/40 text-sm mb-10">
          Check your email for your order confirmation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {[
            { label: 'Full DripSync Studio', desc: 'Unlimited avatar & wearables' },
            { label: 'Exclusive Drops', desc: '24hr early access always' },
            { label: 'Virtual Realms', desc: 'All spaces, all access' },
            { label: 'Physical × Digital', desc: 'Every purchase includes a twin' },
          ].map((b, i) => (
            <div key={i} className="text-left p-4 rounded-xl bg-white/5 border border-white/8">
              <p className="font-bold text-sm mb-1">{b.label}</p>
              <p className="text-white/50 text-xs">{b.desc}</p>
            </div>
          ))}
        </div>

        <Link to={createPageUrl('DripSync')}>
          <Button className="px-8 py-5 text-base font-bold rounded-xl mb-4 w-full" style={{ background: '#00D4FF', color: '#000' }}>
            Open DripSync Studio
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>

        <p className="text-white/30 text-sm">
          Redirecting to DripSync in {countdown}s…
        </p>
      </motion.div>
    </div>
  );
}