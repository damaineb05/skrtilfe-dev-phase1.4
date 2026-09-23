/**
 * DripSyncGuide — first-time interactive guided experience.
 *
 * Teaches a new user what SKRTLIFE's digital identity system is by having them
 * USE it, not by showing a slideshow. The editor stays interactive behind a
 * non-blocking dim so the user can customize while reading each coachmark.
 *
 *   0  MEET YOUR DIGITAL SELF  → BUILD MY AVATAR
 *   1  BUILD YOUR DRIP          → (equip pieces in the closet)
 *   2  ONE IDENTITY. EVERYWHERE. → DripSync ↓ World ↓ SKRTLIFE
 *   3  MAKE IT YOURS            → SAVE MY IDENTITY (existing Save flow)
 *
 * After an authenticated save, a blocking "IDENTITY CREATED" reveal offers
 * ENTER THE WORLD / KEEP CUSTOMIZING. For guests, step 3 hands off to the
 * existing GuestIdentityFlow, which owns the auth → migration → reveal moment.
 *
 * DripSync owns the state machine; this component is presentational.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, X, Check, Globe } from 'lucide-react';

const STEPS = [
  {
    label: '01 — SELF',
    title: 'MEET YOUR\nDIGITAL SELF',
    body: 'This is your identity across the SKRTLIFE Digital Society.',
    cta: 'BUILD MY AVATAR',
  },
  {
    label: '02 — DRIP',
    title: 'BUILD YOUR\nDRIP',
    body: 'Try on pieces and create a look that moves with you across SKRTLIFE. Open the closet and equip something.',
    cta: 'NEXT',
  },
  {
    label: '03 — IDENTITY',
    title: 'ONE IDENTITY.\nEVERYWHERE.',
    body: 'Your DripSync identity follows you into the World, your profile, your wardrobe, and SKRTLIFE experiences.',
    cta: 'NEXT',
    visual: true,
  },
  {
    label: '04 — ENTER',
    title: 'MAKE IT\nYOURS',
    body: 'Save your identity to keep your avatar, wardrobe, looks, and World presence connected.',
    cta: 'SAVE MY IDENTITY',
  },
];

function Progress({ current }) {
  return (
    <div className="flex items-center gap-4">
      {STEPS.map((s, i) => (
        <span key={i}
          className="text-[9px] tracking-[0.25em] uppercase font-semibold transition-colors"
          style={{ color: i === current ? '#00D4FF' : 'rgba(255,255,255,0.18)' }}>
          {s.label}
        </span>
      ))}
    </div>
  );
}

function IdentityVisual() {
  const nodes = [
    { t: 'DRIPSYNC', c: '#00D4FF' },
    { t: 'WORLD', c: '#FF3366' },
    { t: 'SKRTLIFE', c: '#FFD700' },
  ];
  return (
    <div className="flex flex-col items-center gap-1.5 my-6">
      {nodes.map((n, i) => (
        <React.Fragment key={n.t}>
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i }}
            className="px-5 py-2 text-[10px] font-bold tracking-[0.28em] uppercase"
            style={{ color: n.c, border: `1px solid ${n.c}55`, background: `${n.c}10`, borderRadius: 4 }}>
            {n.t}
          </motion.div>
          {i < nodes.length - 1 && <span className="text-base leading-none" style={{ color: 'rgba(255,255,255,0.25)' }}>↓</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function DripSyncGuide({
  step, reveal, onNext, onBack, onSkip, onSaveIdentity, onEnterWorld, onKeepCustomizing,
}) {
  const showStep = step !== null && step !== undefined;
  const current = STEPS[step] || STEPS[0];
  const isLast = step === 3;

  return (
    <>
      {/* ── Interactive coachmark steps (editor stays usable) ── */}
      <AnimatePresence>
        {showStep && !reveal && (
          <motion.div
            key="guide-dim"
            className="fixed inset-0 z-[110]"
            style={{ background: 'rgba(7,7,9,0.55)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', pointerEvents: 'none' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          >
            {/* spotlight ring drawn around the lower-center where the avatar sits */}
            <div style={{
              position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%,-50%)',
              width: 'min(70vw,520px)', height: 'min(70vw,520px)', borderRadius: '9999px',
              boxShadow: '0 0 0 9999px rgba(7,7,9,0.55), 0 0 80px rgba(0,212,255,0.08) inset',
              border: '1px solid rgba(0,212,255,0.12)',
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStep && !reveal && (
          <motion.div
            key={`guide-card-${step}`}
            className="fixed inset-x-0 bottom-0 z-[111] flex justify-center px-4 pb-5 sm:pb-8 sm:items-center sm:bottom-0"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="w-full sm:max-w-md pointer-events-auto"
              style={{
                background: 'rgba(13,13,20,0.92)', backdropFilter: 'blur(24px) saturate(150%)', WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
              }}
            >
              {/* Top row: progress + skip */}
              <div className="flex items-center justify-between px-6 pt-5">
                <Progress current={step} />
                <button onClick={onSkip} className="flex items-center gap-1 text-[10px] tracking-[0.2em] uppercase font-medium hover:opacity-60 transition-opacity" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Skip <X className="w-3 h-3" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pt-4 pb-6 text-center">
                <h2 className="font-harvest text-white leading-none mb-3"
                  style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)', letterSpacing: '-0.03em', whiteSpace: 'pre-line' }}>
                  {current.title}
                </h2>
                <div className="w-7 h-px mx-auto mb-4" style={{ background: '#00D4FF', opacity: 0.6 }} />
                <p className="text-[12.5px] font-light leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {current.body}
                </p>
                {current.visual && <IdentityVisual />}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-3 px-6 pb-6">
                {step > 0 ? (
                  <button onClick={onBack} className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase font-medium hover:opacity-60 transition-opacity" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                ) : <span />}

                <motion.button
                  onClick={isLast ? onSaveIdentity : onNext}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-3 text-[10px] font-bold tracking-[0.25em] uppercase text-[#070709] transition-colors"
                  style={{ background: '#fff', borderRadius: 6 }}
                >
                  {current.cta} <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Post-save reveal (authenticated path) ── */}
      <AnimatePresence>
        {reveal && (
          <motion.div
            key="guide-reveal"
            className="fixed inset-0 z-[115] flex flex-col items-center justify-center px-6"
            style={{ background: 'rgba(7,7,9,0.96)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
          >
            <motion.div
              className="mb-8 flex items-center justify-center"
              style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)' }}
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Check className="w-7 h-7" style={{ color: '#00D4FF' }} />
            </motion.div>
            <motion.h2 className="font-harvest text-white leading-none mb-4 text-center"
              style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.2rem)', letterSpacing: '-0.03em' }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
              Identity Created
            </motion.h2>
            <motion.p className="text-[11px] tracking-[0.18em] uppercase font-light mb-12 text-center"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.28 }}>
              You're ready to enter the SKRTLIFE Digital Society.
            </motion.p>
            <motion.div className="w-full flex flex-col gap-3" style={{ maxWidth: 320 }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
              <motion.button onClick={onEnterWorld} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 text-[11px] font-bold tracking-[0.28em] uppercase text-[#070709]"
                style={{ minHeight: 54, background: '#fff', borderRadius: 4 }}>
                <Globe className="w-4 h-4" /> Enter the World
              </motion.button>
              <motion.button onClick={onKeepCustomizing} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 text-[11px] font-bold tracking-[0.28em] uppercase"
                style={{ minHeight: 54, border: '1px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.04)', borderRadius: 4 }}>
                Keep Customizing
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}