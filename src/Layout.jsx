import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import AccountModal from "./components/account/AccountModal";
import FloatingMessenger from "./components/messaging/FloatingMessenger";
import AvatarOnboarding from "./components/avatar/AvatarOnboarding";
import DraggableMessengerButton from "./components/layout/DraggableMessengerButton";
import { useAuth } from '@/lib/AuthContext';

import DualModeNav from './components/layout/DualModeNav';
import FloatingDock from './components/layout/FloatingDock';
import PageTransition from './components/ui/PageTransition';

// Error Boundary Component
class LayoutErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Layout Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
              <p className="text-gray-600 mb-6">
                The app encountered an error. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
                
                Refresh Page
              </button>
            </div>
          </div>
        </div>);

    }

    return this.props.children;
  }
}

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const { user: currentUser, isLoadingAuth: loadingUser } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAvatarOnboarding, setShowAvatarOnboarding] = useState(false);

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      event.preventDefault();
      console.warn('Unhandled promise rejection caught:', event.reason);
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Avatar onboarding — trigger once when user resolves without avatar
  useEffect(() => {
    if (!currentUser) return;
    const hasAvatar = currentUser?.avatar_config?.avatar || currentUser?.avatar_config?.defaultAvatarId || currentUser?.avatar_config?.avatarUrl;
    const onboardingDismissed = sessionStorage.getItem('avatar_onboarding_dismissed');
    if (!hasAvatar && !onboardingDismissed) {
      const t = setTimeout(() => setShowAvatarOnboarding(true), 1500);
      return () => clearTimeout(t);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(count);
      } catch (e) {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  const handleUploadClick = React.useCallback(() => {}, []);

  return (
    <div className="apple-site">
      <style>{`
        /* Legacy compatibility aliases — consumed by older components */
        :root {
          --color-primary: var(--skrt-cyan);
          --color-secondary: var(--skrt-red);
          --color-accent: var(--skrt-yellow);
          --bg-primary: var(--bg-1);
          --bg-secondary: var(--bg-2);
          --text-primary: var(--text-100);
          --text-secondary: var(--text-80);
          --text-muted: var(--text-40);
          --brand-black: var(--bg-1);
          --brand-blue: var(--skrt-cyan);
          --brand-blue-hover: #00E5FF;
          --brand-red: var(--skrt-red);
          --brand-yellow: var(--skrt-yellow);
          --glass-light: rgba(255,255,255,0.04);
          --glass-medium: rgba(255,255,255,0.07);
        }
        .apple-container { max-width: 1240px; margin: 0 auto; padding: 0 clamp(16px,4vw,48px); }
      `}</style>

      <DualModeNav
        currentUser={currentUser}
        isScrolled={isScrolled}
        cartCount={cartCount}
        loadingUser={loadingUser} />
      

      {/* Add padding to account for fixed nav: 28px ticker + 60px bar = 88px + safe-area-top for notched iPhones */}
      <div style={{ paddingTop: 'calc(88px + env(safe-area-inset-top, 0px))' }} />

      {currentUser && (
        <DraggableMessengerButton 
          isOpen={isMessengerOpen} 
          onToggle={() => setIsMessengerOpen(o => !o)} 
        />
      )}

      {currentUser && !['Home', 'About', 'Contact', 'Dashboard', 'AdminDashboard'].includes(currentPageName) &&
      <FloatingDock onUploadClick={handleUploadClick} />
      }

      <main className="min-h-screen">
        <PageTransition>
        {children}
        {isAccountModalOpen &&
          <AccountModal
            isOpen={isAccountModalOpen}
            onClose={() => setIsAccountModalOpen(false)} />

          }
        <FloatingMessenger
            isOpen={isMessengerOpen}
            onClose={() => setIsMessengerOpen(false)} />
          
        <AvatarOnboarding
            isOpen={showAvatarOnboarding}
            onClose={() => {
              setShowAvatarOnboarding(false);
              sessionStorage.setItem('avatar_onboarding_dismissed', '1');
            }}
            onComplete={(avatarId) => {
              setShowAvatarOnboarding(false);
              sessionStorage.setItem('avatar_onboarding_dismissed', '1');
            }} />
          
        </PageTransition>
      </main>
      
      <footer className="py-16 mt-20" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--glass-border)' }} role="contentinfo">
        <div className="apple-container" itemScope itemType="http://schema.org/Organization">
          <meta itemProp="name" content="SKRTLIFE" />
          <meta itemProp="url" content="https://skrtlife.com" />
          {/* Brand tagline */}
          <div className="mb-12 text-center">
            <h3 className="text-2xl md:text-4xl font-black mb-2 font-harvest" style={{ color: 'var(--text-primary)' }}>
              LIVE IN FULL EFFECT
            </h3>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="w-3 h-3 rounded-full" style={{ background: '#FF0000' }}></span>
              <span className="w-3 h-3 rounded-full" style={{ background: '#0000FF' }}></span>
              <span className="w-3 h-3 rounded-full" style={{ background: '#FFFF00' }}></span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-xs mb-4 uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Shop</h4>
              <ul className="space-y-3">
                <li><Link to={createPageUrl("Shop")} className="text-sm hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--text-muted)' }}>All Products</Link></li>
                <li><Link to={createPageUrl("Shop")} className="text-sm hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--text-muted)' }}>Collections</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs mb-4 uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Platform</h4>
              <ul className="space-y-3">
                <li><Link to={createPageUrl("DripSync")} className="text-sm hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--text-muted)' }}>DripSync</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs mb-4 uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Company</h4>
              <ul className="space-y-3">
                <li><Link to={createPageUrl("About")} className="text-sm hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--text-muted)' }}>About</Link></li>
                <li><Link to={createPageUrl("Contact")} className="text-sm hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--text-muted)' }}>Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs mb-4 uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Support</h4>
              <ul className="space-y-3">
                <li><Link to={createPageUrl("FAQ")} className="text-sm hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--text-muted)' }}>FAQ</Link></li>
                <li><Link to={createPageUrl("SizeGuide")} className="text-sm hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--text-muted)' }}>Size Guide</Link></li>
                <li><Link to={createPageUrl("ReturnsPolicy")} className="text-sm hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--text-muted)' }}>Returns</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs mb-4 uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Legal</h4>
              <ul className="space-y-3">
                <li><Link to={createPageUrl("PrivacyPolicy")} className="text-sm hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--text-muted)' }}>Privacy</Link></li>
                <li><Link to={createPageUrl("TermsOfService")} className="text-sm hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--text-muted)' }}>Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} <span className="font-harvest">Skrtlife</span> Digital Society. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>);

}

export default function Layout(props) {
  return (
    <LayoutErrorBoundary>
      <LayoutContent {...props} />
    </LayoutErrorBoundary>);

}