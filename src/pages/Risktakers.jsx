import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RisktakersEntry from '../components/risktakers/RisktakersEntry';
import RisktakersProductReveal from '../components/risktakers/RisktakersProductReveal';
import RisktakersLuxuryScene from '../components/risktakers/RisktakersLuxuryScene';
import RisktakersStickerBreak from '../components/risktakers/RisktakersStickerBreak';
import RisktakersDripSyncEntry from '../components/risktakers/RisktakersDripSyncEntry';
import RisktakersMobileDock from '../components/risktakers/RisktakersMobileDock';
import GenesisLockModal from '../components/risktakers/GenesisLockModal';
import EmailCaptureSheet from '../components/risktakers/EmailCaptureSheet';
import CreatorEmailCaptureModal from '../components/risktakers/CreatorEmailCaptureModal';
import MobileHamburgerMenu from '../components/risktakers/MobileHamburgerMenu';
import { base44 } from '@/api/base44Client';
import { Menu } from 'lucide-react';

export default function Risktakers() {
  const [entered, setEntered] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showGenesisLock, setShowGenesisLock] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [dockVisible, setDockVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
  }, []);

  const handleEnter = () => {
    setTransitioning(true);
    setTimeout(() => {
      setEntered(true);
      setTransitioning(false);
    }, 800);
  };

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setDockVisible(current < lastScrollY.current || current < 80);
      lastScrollY.current = current;
      setScrollY(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#050505', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <AnimatePresence>
        {transitioning && (
          <motion.div
            key="fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999]"
            style={{ background: '#000' }}
          />
        )}
      </AnimatePresence>

      {!entered ? (
        <RisktakersEntry onEnter={handleEnter} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Hamburger trigger — top right */}
          <button
            onClick={() => setShowMenu(true)}
            className="fixed top-5 right-5 z-[900] w-11 h-11 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          <RisktakersProductReveal onTryOn={() => setShowGenesisLock(true)} />
          <RisktakersLuxuryScene />
          <RisktakersStickerBreak />
          <RisktakersDripSyncEntry onTryOn={() => setShowGenesisLock(true)} />

          {/* Bottom floating dock */}
          <RisktakersMobileDock visible={dockVisible} />
        </motion.div>
      )}

      <MobileHamburgerMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />

      <GenesisLockModal
        isOpen={showGenesisLock}
        onClose={() => setShowGenesisLock(false)}
        onEmailCapture={() => { setShowGenesisLock(false); setShowEmailCapture(true); }}
      />

      <EmailCaptureSheet
        isOpen={showEmailCapture}
        onClose={() => setShowEmailCapture(false)}
      />

      <CreatorEmailCaptureModal
        isOpen={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
        currentUser={currentUser}
      />
    </div>
  );
}