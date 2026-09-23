import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

// Auth gate for individual routes. The app-level AuthenticatedApp (App.jsx) is
// the primary gate; this is a defense-in-depth wrapper for pages that opt into
// it (e.g. Dashboard). Uses the real AuthContext API — the previous version
// referenced `authChecked` / `checkUserAuth`, which do not exist on the
// context, so `!authChecked` was always true and the route rendered a
// permanent spinner fallback.
export default function ProtectedRoute({ fallback = <DefaultFallback />, unauthenticatedElement, children }) {
  const { isAuthenticated, isLoadingAuth, authError, navigateToLogin } = useAuth();

  // If an unauthenticated user reaches this route and no fallback element was
  // provided, redirect to the platform login. The app-level gate normally
  // prevents this, so this is a safety net (no infinite loop: login redirects
  // away from this route entirely).
  useEffect(() => {
    if (!isLoadingAuth && !authError && !isAuthenticated && !unauthenticatedElement) {
      navigateToLogin();
    }
  }, [isLoadingAuth, authError, isAuthenticated, unauthenticatedElement, navigateToLogin]);

  if (isLoadingAuth) return fallback;
  if (authError?.type === 'user_not_registered') return <UserNotRegisteredError />;
  if (authError || !isAuthenticated) return unauthenticatedElement || fallback;
  // Render children when used as a wrapper component (e.g. <ProtectedRoute><Page/></ProtectedRoute>),
  // or the matched child route when used as a layout <Route element={<ProtectedRoute/>}>.
  return children ?? <Outlet />;
}