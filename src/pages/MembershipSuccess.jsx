/**
 * MembershipSuccess — checkout return experience.
 *
 * NEVER grants membership from the redirect. It re-fetches auth.me() (with a
 * short retry to let the webhook process) and reflects ONLY the server-set
 * membership flag. If the webhook hasn't processed yet, it says so honestly
 * and still lets the user ENTER THE WORLD — identity is never held hostage.
 *
 * Works for both DripSync+ (membershipCheckout) and Genesis (genesisCheckout)
 * since both return here and the tier is derived from the canonical user flags.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Globe, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { getMembershipTier, MEMBERSHIP_TIERS } from '@/lib/membershipAccess';

export default function MembershipSuccess() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [checking, setChecking] = useState(true);
  const [tier, setTier] = useState(MEMBERSHIP_TIERS.FREE);

  useEffect(() => {
    let cancelled = false;
    const attempt = async (n) => {
      try {
        const u = await base44.auth.me();
        if (cancelled) return;
        updateUser(u);
        const t = getMembershipTier(u);
        if (t !== MEMBERSHIP_TIERS.FREE || n >= 3) {
          setTier(t);
          setChecking(false);
          if (t !== MEMBERSHIP_TIERS.FREE) {
            base44.analytics.track({ eventName: 'membership_confirmed', properties: { tier: t } });
          }
        } else {
          setTimeout(() => attempt(n + 1), 2000);
        }
      } catch (e) {
        if (cancelled) return;
        setChecking(false);
      }
    };
    attempt(0);
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isPaid = tier === MEMBERSHIP_TIERS.GENESIS || tier === MEMBERSHIP_TIERS.DRIPSYNC_PLUS;
  const label = tier === MEMBERSHIP_TIERS.GENESIS ? 'GENESIS MEMBER' : tier === MEMBERSHIP_TIERS.DRIPSYNC_PLUS ? 'DRIPSYNC+ ACTIVE' : '';
  const accent = tier === MEMBERSHIP_TIERS.GENESIS ? '#FFD700' : '#00D4FF';

  const enterWorld = () => {
    base44.analytics.track({ eventName: 'world_entered_after_signup', properties: { after: 'membership_success' } });
    navigate('/World');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#070709' }}>
      <div className="text-center max-w-md w-full">
        {checking ? (
          <>
            <Loader2 className="w-10 h-10 mx-auto mb-6 animate-spin" style={{ color: '#00D4FF' }} />
            <h1 className="font-harvest text-white text-3xl mb-2" style={{ letterSpacing: '-0.03em' }}>Confirming</h1>
            <p className="text-[11px] tracking-[0.18em] uppercase font-light" style={{ color: 'rgba(255,255,255,0.4)' }}>Activating your membership</p>
          </>
        ) : isPaid ? (
          <>
            <motion.div
              className="mx-auto mb-8 flex items-center justify-center"
              style={{ width: 56, height: 56, borderRadius: 14, background: `${accent}1a`, border: `1px solid ${accent}55` }}
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Check className="w-7 h-7" style={{ color: accent }} />
            </motion.div>
            <motion.h1
              className="font-harvest text-white leading-none mb-3"
              style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', letterSpacing: '-0.03em' }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            >
              You're In
            </motion.h1>
            <p className="text-[11px] tracking-[0.22em] uppercase font-bold mb-10" style={{ color: accent }}>{label}</p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
              <button onClick={enterWorld}
                className="w-full flex items-center justify-center gap-2 text-[11px] font-bold tracking-[0.28em] uppercase text-[#070709]"
                style={{ minHeight: 54, background: '#fff', borderRadius: 4 }}>
                <Globe className="w-4 h-4" /> Enter the World
              </button>
              <button onClick={() => navigate('/DripSync')}
                className="mt-3 w-full text-[10px] tracking-[0.2em] uppercase font-medium hover:opacity-60 transition-opacity"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                Back to DripSync
              </button>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              className="mx-auto mb-8 flex items-center justify-center"
              style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
            >
              <Globe className="w-7 h-7" style={{ color: '#00D4FF' }} />
            </motion.div>
            <h1 className="font-harvest text-white text-3xl mb-3" style={{ letterSpacing: '-0.03em' }}>Membership Activating</h1>
            <p className="text-[11px] tracking-[0.18em] uppercase font-light mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Your payment is being confirmed — your access will activate shortly.
            </p>
            <button onClick={enterWorld}
              className="w-full flex items-center justify-center gap-2 text-[11px] font-bold tracking-[0.28em] uppercase text-[#070709]"
              style={{ minHeight: 54, background: '#fff', borderRadius: 4 }}>
              <Globe className="w-4 h-4" /> Enter the World
            </button>
            <button onClick={() => navigate('/DripSync')}
              className="mt-3 w-full text-[10px] tracking-[0.2em] uppercase font-medium hover:opacity-60 transition-opacity"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              Back to DripSync
            </button>
          </>
        )}
      </div>
    </div>
  );
}