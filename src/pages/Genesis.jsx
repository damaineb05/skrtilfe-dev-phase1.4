import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { genesisCheckout } from '@/functions/genesisCheckout';
import {
  Zap, Shirt, Star, Globe, Lock, Check, ArrowRight, ShoppingBag, Sparkles, Users, Shield, Loader2, Mail, Layers
} from 'lucide-react';
import GenesisBadge from '@/components/genesis/GenesisBadge';
import { hasGenesisAccess } from '@/lib/useCanonicalGenesisAccess';

const BENEFITS = [
  {
    icon: Shirt,
    title: 'DripSync Full Access',
    desc: 'Unlock unlimited avatar customization, all wearable slots, and exclusive Genesis-only 3D drops.',
    locked: false,
  },
  {
    icon: Star,
    title: 'Exclusive Drops — First Access',
    desc: 'Genesis holders get 24-hour early access to every new collection and limited collab drop.',
    locked: false,
  },
  {
    icon: Globe,
    title: 'Virtual Realms Access',
    desc: 'Enter exclusive social realms, attend virtual events, and claim your space in the digital society.',
    locked: false,
  },
  {
    icon: Users,
    title: 'Genesis Community',
    desc: 'Private Discord channels, IRL meetup invites, and direct access to the founding team.',
    locked: false,
  },
  {
    icon: Zap,
    title: 'Physical × Digital Bundles',
    desc: 'Every physical purchase automatically unlocks its digital twin for your avatar closet.',
    locked: false,
  },
  {
    icon: Shield,
    title: 'Lifetime Member Status',
    desc: 'Genesis Pass is non-expiring. One-time, permanent access. No subscriptions.',
    locked: false,
  },
];

const LOCKED_FEATURES = [
  { label: 'Custom RPM Avatar Creator', page: 'DripSync' },
  { label: 'Virtual Realm Access', page: 'DripSync' },
  { label: 'Genesis Drop Early Access', page: 'Shop' },
  { label: 'Physical × Digital Bundles', page: 'Shop' },
];

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    color: 'border-white/10',
    badge: null,
    features: [
      'Basic DripSync (demo mode)',
      'Browse all products',
      'Community feed access',
      'Standard drops (public)',
    ],
    cta: 'You\'re on Free',
    ctaDisabled: true,
  },
  {
    name: 'Genesis Pass',
    color: 'border-[#00D4FF]',
    badge: 'Most Popular',
    features: [
      'Everything in Free',
      'Full DripSync Studio',
      'Exclusive Genesis drops',
      'Physical × Digital bundles',
      'All virtual realms',
      'Genesis community access',
    ],
    cta: 'Get Genesis Pass',
    ctaDisabled: false,
    highlight: true,
  },
];

export default function Genesis() {
  const [user, setUser] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [plan, setPlan] = useState('onetime'); // 'onetime' | 'monthly'
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const hasGenesis = hasGenesisAccess(user);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  const handleCheckout = async (selectedPlan) => {
    // Block inside iframes (Base44 preview)
    if (window.self !== window.top) {
      alert('Checkout only works from the published app, not the preview.');
      return;
    }
    // Require an authenticated session — identity is derived server-side.
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname + window.location.search);
      return;
    }
    setCheckingOut(true);
    const res = await genesisCheckout({
      plan: selectedPlan || plan,
      successUrl: window.location.origin + createPageUrl('GenesisCheckoutSuccess'),
      cancelUrl: window.location.origin + createPageUrl('Genesis'),
    });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      alert('Could not start checkout. Please try again.');
      setCheckingOut(false);
    }
  };

  const handleWaitlist = async (e) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setWaitlistLoading(true);
    await base44.entities.Newsletter.create({
      email: waitlistEmail,
      signup_source: 'genesis',
      interests: ['genesis', 'drops'],
      is_genesis_interested: true,
    });
    setWaitlistLoading(false);
    setWaitlistSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <style>{`
        .genesis-glow { box-shadow: 0 0 60px rgba(0,212,255,0.15), 0 0 120px rgba(0,212,255,0.05); }
        .genesis-border { border: 1px solid rgba(0,212,255,0.3); }
        .locked-blur { filter: blur(4px); user-select: none; pointer-events: none; }
        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          transition: all 0.3s;
        }
        .feature-card:hover { background: rgba(0,212,255,0.05); border-color: rgba(0,212,255,0.2); }
      `}</style>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00D4FF]/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-full px-4 py-2 text-sm font-semibold text-[#00D4FF] mb-6">
              <Sparkles className="w-4 h-4" />
              Genesis Pass — Limited Founding Members
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-none">
              <span className="text-white">JOIN THE</span><br />
              <span style={{ color: '#00D4FF' }}>GENESIS</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
              The founding tier of Skrtlife Digital Society. One pass. Lifetime access. Physical, digital, and everything in between.
            </p>
            {hasGenesis ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                <div className="inline-flex items-center gap-3 bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-full px-6 py-3">
                  <Check className="w-5 h-5 text-[#00D4FF]" />
                  <span className="text-[#00D4FF] font-bold">You're a Genesis Member</span>
                  <GenesisBadge size="sm" variant="pill" />
                </div>
                <Link to={createPageUrl('Portfolio')}>
                  <Button variant="outline" className="px-6 py-5 font-bold rounded-xl border-white/20 text-white hover:bg-white/5">
                    <Layers className="w-4 h-4 mr-2" />
                    View My Portfolio
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => handleCheckout('onetime')}
                  disabled={checkingOut}
                  className="px-8 py-6 text-base font-bold rounded-xl"
                  style={{ background: '#00D4FF', color: '#000' }}
                >
                  {checkingOut ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Get Genesis Pass — $299
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Link to={createPageUrl('Shop')}>
                  <Button variant="outline" className="px-8 py-6 text-base font-bold rounded-xl border-white/20 text-white hover:bg-white/5">
                    Browse Shop
                    <ShoppingBag className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#00D4FF] text-sm uppercase tracking-widest mb-3">What You Unlock</p>
          <h2 className="text-4xl font-black">Genesis Benefits</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={i}
              className="feature-card p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,212,255,0.12)' }}>
                <b.icon className="w-5 h-5" style={{ color: '#00D4FF' }} />
              </div>
              <h3 className="font-bold text-lg mb-2">{b.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Soft Gate — Locked Preview */}
      {!hasGenesis && (
        <section className="py-20 px-4 max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Blurred feature list */}
            <div className="p-8">
              <h2 className="text-2xl font-black mb-2 text-center">Genesis-Exclusive Features</h2>
              <p className="text-white/50 text-sm text-center mb-8">These features are unlocked for Genesis Pass holders only.</p>
              <div className="space-y-4">
                {LOCKED_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                    <Lock className="w-4 h-4 text-[#00D4FF] shrink-0" />
                    <span className="text-white/40 locked-blur flex-1">{f.label}</span>
                    <span className="text-xs text-white/30 border border-white/10 rounded-full px-3 py-1">Genesis Only</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
              <div className="text-center p-8">
                <Lock className="w-10 h-10 mx-auto mb-4 text-[#00D4FF]" />
                <h3 className="text-2xl font-black mb-3">Unlock with Genesis Pass</h3>
                <p className="text-white/60 text-sm mb-6 max-w-xs mx-auto">Get lifetime access to every exclusive feature, drop, and realm.</p>
                <Button onClick={() => handleCheckout('onetime')} className="px-8 py-5 text-base font-bold rounded-xl" style={{ background: '#00D4FF', color: '#000' }}>
                  Get Genesis Pass — $299
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Tiers */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#00D4FF] text-sm uppercase tracking-widest mb-3">Membership Tiers</p>
          <h2 className="text-4xl font-black">Choose Your Level</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {TIERS.map((tier, i) => (
            <motion.div
              key={i}
              className={`relative rounded-2xl p-8 border-2 ${tier.color} ${tier.highlight ? 'genesis-glow' : ''}`}
              style={{ background: tier.highlight ? 'rgba(0,212,255,0.04)' : 'rgba(255,255,255,0.02)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-xs font-bold text-black" style={{ background: '#00D4FF' }}>
                    {tier.badge}
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-black mb-3">{tier.name}</h3>
                {tier.highlight ? (
                  <>
                    {/* Plan Toggle */}
                    <div className="flex rounded-xl overflow-hidden border border-white/10 mb-3">
                      <button
                        onClick={() => setPlan('onetime')}
                        className={`flex-1 py-2 text-sm font-bold transition-all ${plan === 'onetime' ? 'text-black' : 'text-white/50 hover:text-white/80'}`}
                        style={plan === 'onetime' ? { background: '#00D4FF' } : { background: 'transparent' }}
                      >
                        One-Time
                      </button>
                      <button
                        onClick={() => setPlan('monthly')}
                        className={`flex-1 py-2 text-sm font-bold transition-all ${plan === 'monthly' ? 'text-black' : 'text-white/50 hover:text-white/80'}`}
                        style={plan === 'monthly' ? { background: '#00D4FF' } : { background: 'transparent' }}
                      >
                        Monthly
                      </button>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black" style={{ color: '#00D4FF' }}>
                        {plan === 'monthly' ? '$24.92' : '$299'}
                      </span>
                      <span className="text-white/40 text-sm">
                        {plan === 'monthly' ? '/mo' : 'one-time'}
                      </span>
                    </div>
                    {plan === 'monthly' && (
                      <p className="text-white/35 text-xs mt-1">$299 ÷ 12 months — cancel anytime</p>
                    )}
                  </>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{tier.price}</span>
                  </div>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-3 text-sm text-white/75">
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: tier.highlight ? '#00D4FF' : 'rgba(255,255,255,0.4)' }} />
                    {f}
                  </li>
                ))}
              </ul>
              {tier.highlight ? (
                <Button
                  onClick={() => handleCheckout(plan)}
                  disabled={checkingOut || hasGenesis}
                  className="w-full py-5 font-bold rounded-xl"
                  style={{ background: '#00D4FF', color: '#000' }}
                >
                  {checkingOut ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {hasGenesis ? 'Already a Member ✓' : plan === 'monthly' ? 'Subscribe — $24.92/mo' : 'Get Genesis Pass — $299'}
                </Button>
              ) : (
                <Button disabled className="w-full py-5 font-bold rounded-xl" variant="outline">
                  {tier.cta}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Waitlist — for people not ready to buy */}
      {!hasGenesis && (
        <section className="py-16 px-4 max-w-2xl mx-auto">
          <div className="feature-card p-8 text-center">
            <Mail className="w-8 h-8 mx-auto mb-4" style={{ color: '#00D4FF' }} />
            <h3 className="text-2xl font-black mb-2">Not ready yet?</h3>
            <p className="text-white/55 text-sm mb-6">
              Join the waitlist to get notified when we open new spots, drop exclusive content, or change pricing.
            </p>
            {waitlistSubmitted ? (
              <div className="flex items-center justify-center gap-2 text-green-400 font-bold">
                <Check className="w-5 h-5" /> You're on the list — we'll be in touch.
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={waitlistEmail}
                  onChange={e => setWaitlistEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-12 flex-1"
                />
                <Button type="submit" disabled={waitlistLoading} className="h-12 px-6 font-bold rounded-xl" style={{ background: '#00D4FF', color: '#000' }}>
                  {waitlistLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Notify Me'}
                </Button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* FAQ Strip */}
      <section className="py-16 px-4 max-w-3xl mx-auto pb-32">
        <h2 className="text-3xl font-black text-center mb-10">Common Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Is the Genesis Pass really lifetime?', a: 'Yes. One payment, permanent access. No annual renewals, no hidden fees.' },
            { q: 'What does "Physical × Digital" mean?', a: 'When you buy a physical product, you automatically receive the digital twin wearable for your DripSync avatar at no extra cost.' },
            { q: 'Can I resell my Genesis Pass?', a: 'Genesis Pass is tied to your account. Transfer options are in development for a future update.' },
            { q: 'How many Genesis passes are available?', a: 'The founding Genesis cohort is limited. Once the cap is hit, pricing and availability will change.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="feature-card p-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <h4 className="font-bold mb-2">{item.q}</h4>
              <p className="text-white/55 text-sm leading-relaxed">{item.a}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}