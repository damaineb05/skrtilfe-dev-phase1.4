import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { X, ArrowRight, User, Zap, ShoppingBag, Sparkles, ChevronRight } from 'lucide-react';

const BRAND_IMAGES = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/ca9d3b1ed_IMG_9553.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/97eeca7ce_IMG_9508.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/9d6eea39f_IMG_9556.jpg',
];

const STEPS = [
  {
    id: 'avatar',
    icon: User,
    label: '01 — Avatar',
    title: 'BUILD YOUR\nDIGITAL SELF',
    body: 'Create a 3D avatar that looks like you — or whoever you want to be. Dress it in SKRTLIFE pieces.',
    cta: 'Create Avatar',
    href: 'DripSync',
    accent: '#00D4FF',
  },
  {
    id: 'dripsync',
    icon: Zap,
    label: '02 — DripSync',
    title: 'WEAR IT IN\nBOTH WORLDS',
    body: 'Try on drops before you buy. Style your avatar with real product wearables. Save and share your looks.',
    cta: 'Open DripSync',
    href: 'DripSync',
    accent: '#FF3366',
  },
  {
    id: 'marketplace',
    icon: ShoppingBag,
    label: '03 — Marketplace',
    title: 'SHOP THE\nCOLLECTION',
    body: 'Limited drops. Physical pieces with digital twins. Genesis Pass unlocks exclusive access.',
    cta: 'View Shop',
    href: 'Shop',
    accent: '#FFD700',
  },
];

// ── Step indicator ───────────────────────────────────────────
function StepDots({ total, current, onDotClick }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button key={i} onClick={() => onDotClick(i)}
          className="transition-all duration-300"
          style={{
            width: i === current ? 24 : 6,
            height: 6,
            borderRadius: 3,
            background: i === current ? '#fff' : 'rgba(255,255,255,0.2)',
          }}
        />
      ))}
    </div>
  );
}

// ── Main onboarding gate ─────────────────────────────────────
export default function OnboardingGate({ children }) {
  const [phase, setPhase] = useState('checking'); // checking | landing | tour | done
  const [heroImg, setHeroImg] = useState(0);
  const [step, setStep] = useState(0);

  // Cycle hero images on landing
  useEffect(() => {
    if (phase !== 'landing') return;
    const iv = setInterval(() => setHeroImg(i => (i + 1) % BRAND_IMAGES.length), 4000);
    return () => clearInterval(iv);
  }, [phase]);

  // Check if already completed
  useEffect(() => {
    const done = localStorage.getItem('skrt_landing_seen');
    if (done) {
      setPhase('done');
    } else {
      // Small delay so page behind loads
      setTimeout(() => setPhase('landing'), 300);
    }
  }, []);

  const completeTour = () => {
    localStorage.setItem('skrt_landing_seen', '1');
    setPhase('done');
  };

  // Skip the static slideshow — the interactive DripSyncGuide owns the tutorial.
  const enterAsGuest = () => {
    completeTour();
  };

  const connectIdentity = () => {
    localStorage.setItem('skrt_landing_seen', '1');
    base44.auth.redirectToLogin(window.location.href);
  };

  if (phase === 'checking') return null;
  if (phase === 'done') return children;

  // Guard against step going out of bounds
  const safeStep = Math.max(0, Math.min(step, STEPS.length - 1));
  const current = STEPS[safeStep] || STEPS[0];

  return (
    <>
      {/* Render children behind (so DripSync loads) */}
      <div style={{ visibility: 'hidden', pointerEvents: 'none', position: 'absolute', inset: 0 }}>
        {children}
      </div>

      <AnimatePresence mode="wait">
        {/* ── LANDING GATE ─────────────────────────────────────── */}
        {phase === 'landing' && (
          <motion.div key="landing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-black"
          >
            {/* Hero BG */}
            <AnimatePresence mode="wait">
              <motion.div key={heroImg} className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}>
                <img src={BRAND_IMAGES[heroImg]} alt="" className="w-full h-full object-cover object-top" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/65" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.9) 100%)' }} />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-sm">
              <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3 }}>
                {/* Tri-dot */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FF3366' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#00D4FF' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FFD700' }} />
                </div>

                <h1 className="font-harvest font-black text-white mb-3 leading-none"
                  style={{ fontSize: 'clamp(3.5rem, 18vw, 7rem)', letterSpacing: '-0.03em' }}>
                  SKRTLIFE
                </h1>
                <p className="text-[10px] tracking-[0.35em] uppercase mb-12 font-light" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Digital Society · SS 2026
                </p>

                {/* Action buttons */}
                <div className="flex flex-col gap-3 w-full">
                  <motion.button onClick={enterAsGuest}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-4 text-xs font-bold uppercase tracking-[0.28em] text-black bg-white transition-all">
                    Enter as Guest
                  </motion.button>
                  <motion.button onClick={connectIdentity}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-4 text-xs font-bold uppercase tracking-[0.28em] transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.04)' }}>
                    Connect Identity
                  </motion.button>
                </div>

                <p className="mt-8 text-[9px] tracking-[0.25em] uppercase" style={{ color: 'rgba(255,255,255,0.18)' }}>
                  High-end Streetwear × Digital Identity
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── TOUR FLOW ────────────────────────────────────────── */}
        {phase === 'tour' && (
          <motion.div key="tour"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[9999] flex flex-col bg-black"
            style={{ background: '#070709' }}
          >
            {/* Background accent glow for current step */}
            <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
              className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse 60% 50% at 50% 80%, ${current.accent}18 0%, transparent 70%)` }}
            />

            {/* Skip button */}
            <div className="relative z-10 flex justify-end p-5">
              <button onClick={completeTour}
                className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase font-medium transition-opacity hover:opacity-60"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                Skip <X className="w-3 h-3" />
              </button>
            </div>

            {/* Step content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pb-8">
              <AnimatePresence mode="wait">
                <motion.div key={step}
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center max-w-xs w-full"
                >
                  {/* Icon circle */}
                  {React.createElement(current.icon, {
                    className: 'w-10 h-10 mb-8',
                    style: { color: current.accent }
                  })}

                  <p className="text-[9px] tracking-[0.4em] uppercase mb-4 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {current.label}
                  </p>

                  <h2 className="font-harvest font-black text-white mb-6 leading-none"
                    style={{ fontSize: 'clamp(2.2rem, 10vw, 3.5rem)', letterSpacing: '-0.025em', whiteSpace: 'pre-line' }}>
                    {current.title}
                  </h2>

                  <div className="w-8 h-px mb-6" style={{ background: current.accent, opacity: 0.5 }} />

                  <p className="text-sm font-light leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {current.body}
                  </p>

                  {/* CTA */}
                  {safeStep < STEPS.length - 1 ? (
                    <button onClick={() => setStep(s => s + 1)}
                      className="flex items-center gap-2 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-black bg-white transition-all hover:bg-white/90">
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link to={createPageUrl(current.href)} onClick={completeTour}
                      className="flex items-center gap-2 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-black bg-white transition-all hover:bg-white/90">
                      {current.cta} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom nav */}
            <div className="relative z-10 flex items-center justify-between px-8 pb-10">
              <StepDots total={STEPS.length} current={safeStep} onDotClick={setStep} />

              <div className="flex items-center gap-4">
                {safeStep > 0 && (
                  <button onClick={() => setStep(s => s - 1)}
                    className="text-[10px] tracking-[0.2em] uppercase font-medium transition-opacity hover:opacity-60"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Back
                  </button>
                )}
                <button onClick={completeTour}
                  className="text-[10px] tracking-[0.2em] uppercase font-medium transition-opacity hover:opacity-60"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Enter App
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}