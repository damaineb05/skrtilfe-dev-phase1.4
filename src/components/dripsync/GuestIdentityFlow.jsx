/**
 * GuestIdentityFlow — premium full-screen overlay for the guest → auth → canonical
 * avatar migration. Four modes, all on-brand (Harvest headline, tri-dot mark,
 * cyan/red/yellow, glass):
 *
 *   gate     pre-auth: "SAVE YOUR DIGITAL SELF" → Create Account / Sign In
 *   syncing  post-auth: "SYNCING YOUR DRIP" (spinner, no controls)
 *   conflict existing avatar_config detected: "USE THIS LOOK" / "KEEP MY SAVED AVATAR"
 *   success  "IDENTITY SAVED" → ENTER THE WORLD / KEEP CUSTOMIZING
 *
 * DripSync owns the state machine; this component is presentational only.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Globe, Sparkles, Check } from 'lucide-react';

function TriDot() {
  return (
    <div className="flex items-center gap-3 mb-10">
      <motion.span className="w-2 h-2 rounded-full" style={{ background: '#FF3366' }}
        animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.span className="w-2 h-2 rounded-full" style={{ background: '#00D4FF' }}
        animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 0.6 }} />
      <motion.span className="w-2 h-2 rounded-full" style={{ background: '#FFD700' }}
        animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 1.2 }} />
    </div>
  );
}

function Shell({ children }) {
  return (
    <motion.div
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center px-6"
      style={{ background: 'rgba(7,7,9,0.94)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        {children}
      </div>
    </motion.div>
  );
}

function PrimaryButton({ children, onClick, icon: Icon }) {
  return (
    <motion.button
      onClick={onClick} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
      className="w-full flex items-center justify-center gap-2 text-[11px] font-bold tracking-[0.28em] uppercase text-[#070709] transition-colors"
      style={{ minHeight: 54, background: '#fff', borderRadius: 4 }}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  );
}

function GhostButton({ children, onClick, icon: Icon }) {
  return (
    <motion.button
      onClick={onClick} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
      className="w-full flex items-center justify-center gap-2 text-[11px] font-bold tracking-[0.28em] uppercase transition-colors"
      style={{ minHeight: 54, border: '1px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.04)', borderRadius: 4 }}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  );
}

export default function GuestIdentityFlow({
  mode,             // 'gate' | 'syncing' | 'conflict' | 'success'
  onAuth,           // begin platform authentication
  onCancel,         // gate: dismiss the save gate, keep the guest draft in the editor
  onUseThisLook,    // CASE B: persist pending over existing
  onKeepSaved,      // CASE B: discard pending, keep existing
  onEnterWorld,
  onKeepCustomizing,
}) {
  return (
    <AnimatePresence>
      {!mode ? null : (
        <Shell key={mode}>
          {mode === 'gate' && (
            <>
              <TriDot />
              <motion.h1
                className="font-harvest text-white leading-none mb-4"
                style={{ fontSize: 'clamp(2.4rem, 6vw, 3.6rem)', letterSpacing: '-0.03em' }}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              >
                Save Your<br />Digital Self
              </motion.h1>
              <motion.p
                className="text-[11px] tracking-[0.18em] uppercase font-light mb-12"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.25 }}
              >
                Create an account to keep your avatar, wardrobe, and World identity.
              </motion.p>
              <motion.div className="w-full maxw-xs flex flex-col gap-3"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
                style={{ maxWidth: 320 }}
              >
                <PrimaryButton onClick={onAuth} icon={Sparkles}>Create Account / Sign In</PrimaryButton>
                <GhostButton onClick={onCancel}>Keep Customizing</GhostButton>
              </motion.div>
            </>
          )}

          {mode === 'syncing' && (
            <>
              <motion.div
                className="mb-10"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#00D4FF,#FF3366)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(0,212,255,0.3)' }}
              >
                <span style={{ fontFamily: 'Harvest, sans-serif', fontWeight: 900, fontSize: 24, color: '#070709' }}>S</span>
              </motion.div>
              <motion.h2
                className="font-harvest text-white leading-none mb-4"
                style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', letterSpacing: '-0.03em' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              >
                Syncing Your Drip
              </motion.h2>
              <motion.p
                className="text-[11px] tracking-[0.18em] uppercase font-light"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
              >
                Connecting your digital identity.
              </motion.p>
              <div className="flex gap-2 mt-8">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="rounded-full" style={{ width: 6, height: 6, background: '#00D4FF' }}
                    animate={{ opacity: [0.25, 1, 0.25] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }} />
                ))}
              </div>
            </>
          )}

          {mode === 'conflict' && (
            <>
              <TriDot />
              <motion.h2
                className="font-harvest text-white leading-none mb-4"
                style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', letterSpacing: '-0.03em' }}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              >
                You Already Have<br />a Digital Self
              </motion.h2>
              <motion.p
                className="text-[11px] tracking-[0.18em] uppercase font-light mb-12"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.25 }}
              >
                Keep your new look, or your saved avatar.
              </motion.p>
              <motion.div className="w-full flex flex-col gap-3"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
                style={{ maxWidth: 320 }}
              >
                <PrimaryButton onClick={onUseThisLook} icon={Sparkles}>Use This Look</PrimaryButton>
                <GhostButton onClick={onKeepSaved}>Keep My Saved Avatar</GhostButton>
              </motion.div>
            </>
          )}

          {mode === 'success' && (
            <>
              <motion.div
                className="mb-8 flex items-center justify-center"
                style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)' }}
                initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <Check className="w-7 h-7" style={{ color: '#00D4FF' }} />
              </motion.div>
              <motion.h2
                className="font-harvest text-white leading-none mb-4"
                style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.2rem)', letterSpacing: '-0.03em' }}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
              >
                Identity Saved
              </motion.h2>
              <motion.p
                className="text-[11px] tracking-[0.18em] uppercase font-light mb-12"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.28 }}
              >
                Your digital self is permanent.
              </motion.p>
              <motion.div className="w-full flex flex-col gap-3"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
                style={{ maxWidth: 320 }}
              >
                <PrimaryButton onClick={onEnterWorld} icon={Globe}>Enter the World</PrimaryButton>
                <GhostButton onClick={onKeepCustomizing}>Keep Customizing</GhostButton>
              </motion.div>
            </>
          )}
        </Shell>
      )}
    </AnimatePresence>
  );
}