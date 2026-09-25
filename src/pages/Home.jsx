/**
 * Home — Phase D Cinematic Entry Experience
 * Architecture:
 *   1. CinematicEntry  → full-screen immersive gate (new/returning users)
 *   2. CinematicHero   → full-viewport hero with layered depth
 *   3. IdentityManifesto → atmospheric brand statement
 *   4. EcosystemPreview → cinematic node grid
 *   5. DripSyncTeaser  → avatar studio preview
 *   6. FeaturedProducts → physical collection
 *   7. GenesisBar      → founding access + community
 */
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { normalizeAvatarConfig } from '@/lib/avatarConfig';
import { buildCanonicalConfig, persistAvatarProfile } from '@/lib/avatarPersistence';
import { createPageUrl } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import CinematicEntry from '../components/home/CinematicEntry';
import CinematicHero from '../components/home/CinematicHero';
import IdentityManifesto from '../components/home/IdentityManifesto';
import EcosystemPreview from '../components/home/EcosystemPreview';
import DripSyncTeaser from '../components/home/DripSyncTeaser';
import GenesisBar from '../components/home/GenesisBar';
import WalletConnectModal from '../components/auth/WalletConnectModal';
import StreamojiCreator from '../components/dripsync/StreamojiCreator';
import CreatorToggleButton from '../components/home/CreatorToggleButton';
import CreatorEmailCaptureModal from '../components/risktakers/CreatorEmailCaptureModal';
import { DemoPresenceCards } from '../components/avatar/DemoPresence';

const FeaturedProductsSection = lazy(() => import('../components/home/FeaturedProductsSection'));
const VisualHighlightsCarousel = lazy(() => import('../components/home/VisualHighlightsCarousel'));

const BRAND_IMAGES = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/ca9d3b1ed_IMG_9553.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/97eeca7ce_IMG_9508.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/9d6eea39f_IMG_9556.jpg',
];

// Entry gate dismissed key (per-session)
const GATE_KEY = 'skrt_gate_dismissed';

export default function Home() {
  const { updateUser } = useAuth();
  const { toast } = useToast();
  const [showGate, setShowGate]         = useState(false);
  const [gateReady, setGateReady]       = useState(false);
  const [currentUser, setCurrentUser]   = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [showWalletModal, setShowWalletModal]   = useState(false);
  const [showStreamoji, setShowStreamoji]       = useState(false);
  const [showCreatorModal, setShowCreatorModal] = useState(false);

  // Determine gate visibility once auth resolves
  useEffect(() => {
    base44.auth.me()
      .then(u => setCurrentUser(u))
      .catch(() => {})
      .finally(() => {
        const dismissed = sessionStorage.getItem(GATE_KEY);
        setShowGate(!dismissed);
        setGateReady(true);
      });
  }, []);

  useEffect(() => {
    base44.entities.Product
      .filter({ is_featured: true, status: 'active' }, '-created_date', 6)
      .then(p => setFeaturedProducts(p || [])).catch(() => {});
  }, []);

  const handleEnter = (mode) => {
    sessionStorage.setItem(GATE_KEY, '1');
    setShowGate(false);
    if (mode === 'connect' && !currentUser) {
      base44.auth.redirectToLogin(window.location.pathname);
    }
  };

  // Don't flash anything until we know gate state
  if (!gateReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#030305' }}>
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF3366' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00D4FF' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFD700' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* ── CINEMATIC ENTRY GATE ── */}
      <AnimatePresence>
        {showGate && (
          <CinematicEntry
            currentUser={currentUser}
            onEnter={handleEnter}
          />
        )}
      </AnimatePresence>

      {/* ── MAIN EXPERIENCE (rendered beneath gate, revealed on enter) ── */}
      <motion.div
        className="min-h-screen"
        style={{ background: '#0A0A0F' }}
        initial={false}
        animate={showGate ? { opacity: 0, pointerEvents: 'none' } : { opacity: 1, pointerEvents: 'auto' }}
        transition={{ duration: 0.5, delay: showGate ? 0 : 0.3 }}
      >

        {/* 1. Cinematic Hero */}
        <CinematicHero currentUser={currentUser} />

        {/* 2. Identity Manifesto */}
        <IdentityManifesto />

        {/* 3. Ecosystem Preview */}
        <EcosystemPreview />

        {/* 4. DripSync Teaser */}
        <DripSyncTeaser currentUser={currentUser} />

        {/* 5. Featured Collection */}
        <section className="py-24 md:py-32 px-6 md:px-14 lg:px-20" style={{ background: '#0A0A0F' }}>
          <div className="max-w-screen-xl mx-auto">
            <motion.div
              className="flex items-end justify-between mb-14 flex-wrap gap-4"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div>
                <p className="text-[9px] tracking-[0.45em] uppercase mb-3 font-medium"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Physical Collection
                </p>
                <h2 className="font-black text-white leading-none tracking-tight"
                  style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.025em' }}>
                  FEATURED PIECES
                </h2>
              </div>
            </motion.div>
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'rgba(255,255,255,0.2)' }} />
              </div>
            }>
              <FeaturedProductsSection products={featuredProducts} />
            </Suspense>
          </div>
        </section>

        {/* 6. Campaign visual strip */}
        <section className="py-0 pb-4">
          <Suspense fallback={null}>
            <VisualHighlightsCarousel images={BRAND_IMAGES} />
          </Suspense>
        </section>

        {/* 7. Active Members */}
        <section className="py-24 px-6 md:px-14 lg:px-20" style={{ background: '#07070C' }}>
          <div className="max-w-screen-xl mx-auto">
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <p className="text-[9px] tracking-[0.45em] uppercase mb-4 font-medium"
                style={{ color: 'rgba(255,255,255,0.2)' }}>
                Digital Society
              </p>
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <h2 className="font-black text-white leading-none tracking-tight"
                  style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', letterSpacing: '-0.025em' }}>
                  ACTIVE MEMBERS
                </h2>
                <div className="flex items-center gap-2 pb-1">
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-green-400"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
                  <span className="text-[10px] font-medium uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>Live Now</span>
                </div>
              </div>
            </motion.div>
            <DemoPresenceCards />
          </div>
        </section>

        {/* 8. Genesis + Community bar */}
        <GenesisBar />

      </motion.div>

      {/* Modals */}
      <StreamojiCreator
        isOpen={showStreamoji}
        onClose={() => setShowStreamoji(false)}
        currentUser={currentUser}
        onAvatarExported={async (url) => {
          setShowStreamoji(false);
          if (!currentUser) {
            base44.auth.redirectToLogin(createPageUrl('DripSync'));
            return;
          }
          const config = normalizeAvatarConfig(currentUser.avatar_config) || buildCanonicalConfig({ avatarSource: url });
          config.avatar = { ...config.avatar, id: null, model_url: url, source: 'streamoji' };
          const result = await persistAvatarProfile(config, {
            expectedRevision: currentUser.avatar_config?.revision ?? 0,
            onUserUpdate: (saved) => {
              setCurrentUser((user) => ({ ...user, avatar_config: saved }));
              updateUser((user) => ({ ...user, avatar_config: saved }));
            },
          });
          if (!result.success) toast({ variant: 'destructive', title: 'Avatar not saved', description: result.error });
        }}
      />
      <WalletConnectModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />

      {/* Creator Email Capture Modal */}
      <CreatorEmailCaptureModal
        isOpen={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
        currentUser={currentUser}
      />

      {/* Creator Toggle Button */}
      <CreatorToggleButton onClick={() => setShowCreatorModal(true)} />
    </>
  );
}