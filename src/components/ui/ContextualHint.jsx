/**
 * ContextualHint — one-time, non-blocking post-onboarding coachmark.
 *
 * Visibility = trigger && eligible && !seen && !primaryGuidance
 *             && (exclusive ? claimedSlot : true)
 *
 *   - Coachmark (default): dismissible, exclusive (uses the single-hint slot),
 *     marks seen on dismiss/CTA/auto-dismiss.
 *   - Confirm (dismissible=false, markSeenOnShow, exclusive=false): transient
 *     toast-like confirmation (e.g. "DRIP SYNCED"); marks seen on show, bypasses
 *     the exclusivity slot so it never blocks the next coachmark.
 *
 * Non-blocking: the wrapper passes pointer events through to the app; only the
 * small card body captures them. Mobile positions as a bottom sheet by default.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import {
  isHintSeen, markHintSeen,
  isPrimaryGuidanceActive, subscribeGuidance,
  claimHint, releaseHint, subscribeClaims,
} from '@/lib/contextualHints';

export default function ContextualHint({
  hintId, userId, title, body, ctaLabel, onCta,
  trigger = false, eligible = true, z = 60, position = 'bottom',
  dismissible = true, autoMs = 0, markSeenOnShow = false, exclusive = true,
}) {
  const [dismissed, setDismissed] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [, bump] = useState(0);
  const autoTimer = useRef(null);

  // Re-render when primary-guidance or claim-slot state changes elsewhere.
  useEffect(() => {
    const u1 = subscribeGuidance(() => bump((n) => n + 1));
    const u2 = subscribeClaims(() => bump((n) => n + 1));
    return () => { u1(); u2(); };
  }, []);

  const seen = isHintSeen(userId, hintId) || dismissed;
  const blocked = isPrimaryGuidanceActive();
  const wantShow = trigger && eligible && !seen && !blocked;

  // Claim / release the exclusivity slot (no side effects in render).
  useEffect(() => {
    if (wantShow && exclusive && !claimed) {
      if (claimHint(hintId)) setClaimed(true);
    } else if ((!wantShow || !exclusive) && claimed) {
      releaseHint(hintId);
      setClaimed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantShow, claimed, exclusive, hintId]);

  // Release the slot on unmount.
  useEffect(() => {
    return () => { if (claimed) releaseHint(hintId); };
  }, [claimed, hintId]);

  const doDismiss = () => {
    markHintSeen(userId, hintId);
    setDismissed(true);
    if (claimed) { releaseHint(hintId); setClaimed(false); }
  };
  const handleCta = () => { doDismiss(); onCta?.(); };

  const visible = wantShow && (exclusive ? claimed : true);

  // Mark seen on show (confirm variant) + schedule auto-dismiss.
  useEffect(() => {
    if (!visible) return;
    if (markSeenOnShow) markHintSeen(userId, hintId);
    if (autoMs) autoTimer.current = setTimeout(() => doDismiss(), autoMs);
    return () => { if (autoTimer.current) { clearTimeout(autoTimer.current); autoTimer.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, autoMs, markSeenOnShow, userId, hintId]);

  const posStyle = position === 'top'
    ? { top: 18, left: '50%', transform: 'translateX(-50%)' }
    : position === 'center'
    ? { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }
    : { bottom: 26, left: '50%', transform: 'translateX(-50%)' };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={hintId}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'absolute', ...posStyle, zIndex: z, pointerEvents: 'none', width: 'min(380px, 92vw)' }}
        >
          <div style={{ pointerEvents: 'auto', background: 'rgba(13,13,20,0.94)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', border: '1px solid rgba(0,212,255,0.22)', borderRadius: 14, boxShadow: '0 12px 48px rgba(0,0,0,0.6)', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#00D4FF', marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.62)', lineHeight: 1.55 }}>{body}</div>
              </div>
              {dismissible && (
                <button onClick={doDismiss} aria-label="Dismiss" style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={13} />
                </button>
              )}
            </div>
            {ctaLabel && (
              <button onClick={handleCta} style={{ marginTop: 12, width: '100%', padding: '9px 12px', borderRadius: 8, background: '#fff', color: '#070709', fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {ctaLabel} <ArrowRight size={12} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}