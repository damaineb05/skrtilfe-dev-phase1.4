/**
 * MembershipOffer — the post-identity-created conversion surface.
 *
 *   SAVE → IDENTITY CREATED → MEMBERSHIP OFFER → ENTER WORLD
 *
 * Concise (per spec): three tiers, each with price + a few meaningful benefits
 * + one CTA. CONTINUE FREE is always available (no dark pattern). Deeper
 * comparison lives on /Membership. This is presentational; DripSync owns the
 * state (open/onContinueFree/onCheckoutStarted) and the authoritative save.
 *
 * Paid CTAs reuse the existing Stripe checkout infrastructure:
 *   DripSync+ → membershipCheckout  (metadata.product_type='dripsync_plus')
 *   Genesis   → genesisCheckout      (metadata.product_type='genesis_pass')
 * Both return to /MembershipSuccess, which re-fetches auth.me() so membership
 * is recognized ONLY from the server-set flag — never from the redirect itself.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { MEMBERSHIP_PLANS, PLAN_ORDER } from '@/lib/membershipPlans';
import { getMembershipTier, MEMBERSHIP_TIERS } from '@/lib/membershipAccess';

function TriDot() {
  return (
    <div className="flex items-center gap-3 mb-8">
      <motion.span className="w-2 h-2 rounded-full" style={{ background: '#FF3366' }}
        animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.span className="w-2 h-2 rounded-full" style={{ background: '#00D4FF' }}
        animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 0.6 }} />
      <motion.span className="w-2 h-2 rounded-full" style={{ background: '#FFD700' }}
        animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 1.2 }} />
    </div>
  );
}

export default function MembershipOffer({ open, user, onContinueFree, onCheckoutStarted }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null); // 'dripsync_plus' | 'genesis' | null
  const currentTier = getMembershipTier(user);

  const startCheckout = async (tier) => {
    if (window.self !== window.top) {
      alert('Checkout only works from the published app, not the preview.');
      return;
    }
    setBusy(tier);
    onCheckoutStarted?.(tier);
    const origin = window.location.origin;
    const successUrl = `${origin}/MembershipSuccess`;
    const cancelUrl = `${origin}/DripSync`;
    const fnName = tier === MEMBERSHIP_TIERS.GENESIS ? 'genesisCheckout' : 'membershipCheckout';
    const payload = tier === MEMBERSHIP_TIERS.GENESIS
      ? { successUrl, cancelUrl, plan: 'onetime' }
      : { successUrl, cancelUrl };
    try {
      const res = await base44.functions.invoke(fnName, payload);
      const url = res?.data?.url || res?.url;
      if (url) {
        window.location.href = url;
      } else {
        alert('Could not start checkout. Please try again.');
        setBusy(null);
      }
    } catch (e) {
      alert('Could not start checkout. Please try again.');
      setBusy(null);
    }
  };

  const choose = (id) => (id === 'free' ? onContinueFree() : startCheckout(id));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex flex-col items-center px-4 py-10 overflow-y-auto"
          style={{ background: 'rgba(7,7,9,0.96)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center my-auto">
            <TriDot />
            <motion.h1
              className="font-harvest text-white leading-none mb-3"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', letterSpacing: '-0.03em' }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            >
              Your Identity is Live
            </motion.h1>
            <motion.p
              className="text-[11px] tracking-[0.18em] uppercase font-light mb-10"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.25 }}
            >
              Choose how deep you want to go.
            </motion.p>

            {/* Tier cards — concise: price + a few benefits + CTA */}
            <div className="w-full grid gap-3 sm:grid-cols-3 mb-8">
              {PLAN_ORDER.map((id, i) => {
                const plan = MEMBERSHIP_PLANS[id];
                const isFree = id === 'free';
                const isCurrent = currentTier === id;
                const highlight = id === 'dripsync_plus';
                const checkColor = isFree ? '#fff' : plan.accent;
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                    className="relative text-left p-5 flex flex-col"
                    style={{
                      borderRadius: 14,
                      border: `1px solid ${highlight ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      background: highlight ? 'rgba(0,212,255,0.05)' : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    {highlight && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[9px] font-bold tracking-widest uppercase text-[#070709]" style={{ background: '#00D4FF' }}>
                        Most Popular
                      </span>
                    )}
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: isFree ? 'rgba(255,255,255,0.55)' : plan.accent }}>{plan.name}</p>
                    <p className="text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{plan.tagline}</p>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl font-black text-white">{plan.price}</span>
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{plan.priceSuffix}</span>
                    </div>
                    <ul className="space-y-1.5 mb-4 flex-1">
                      {plan.available.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          <Check className="w-3 h-3 mt-0.5 shrink-0" style={{ color: checkColor }} />{b}
                        </li>
                      ))}
                      {plan.comingSoon.length > 0 && (
                        <li className="pt-2 mt-2 border-t border-white/5 space-y-1.5">
                          {plan.comingSoon.map((b) => (
                            <span key={b} className="flex items-start gap-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              <span className="text-[8px] mt-1 shrink-0 tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>SOON</span>{b}
                            </span>
                          ))}
                        </li>
                      )}
                    </ul>
                    <button
                      onClick={() => choose(id)}
                      disabled={busy !== null || (isCurrent && !isFree)}
                      className="w-full py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors disabled:opacity-50"
                      style={{
                        borderRadius: 6,
                        background: isFree ? 'rgba(255,255,255,0.06)' : (highlight ? '#00D4FF' : 'rgba(255,255,255,0.1)'),
                        color: isFree ? 'rgba(255,255,255,0.85)' : (highlight ? '#070709' : '#fff'),
                        border: isFree ? '1px solid rgba(255,255,255,0.15)' : 'none',
                      }}
                    >
                      {busy === id ? 'Redirecting…' : (isCurrent && !isFree ? 'Current' : plan.cta)}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Always-available free path (no dark pattern) */}
            <motion.button
              onClick={onContinueFree}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex items-center gap-1.5 text-[10px] tracking-[0.22em] uppercase font-medium hover:opacity-60 transition-opacity"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Continue Free <ArrowRight className="w-3 h-3" /> Enter the World
            </motion.button>
            <button
              onClick={() => navigate('/Membership')}
              className="mt-3 text-[9px] tracking-[0.18em] uppercase hover:opacity-60 transition-opacity"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              Compare all benefits
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}