import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import MyAccount from './pages/MyAccount';
import Realms from './pages/Realms';
import AdminModeration from './pages/AdminModeration';
import AdminWearables from './pages/AdminWearables';
import AdminAvatars from './pages/AdminAvatars';
import AdminOrders from './pages/AdminOrders';
import Discover from './pages/Discover';
import Drops from './pages/Drops';
import Notifications from './pages/Notifications';
import SavedLooks from './pages/SavedLooks';
import Onboarding from './pages/Onboarding';
import Feed from './pages/Feed';
import Membership from './pages/Membership';
import Closet from './pages/Closet';
import Risktakers from './pages/Risktakers';
import DebugReportButton from '@/components/dev/DebugReportButton';
import PortfolioPage from './pages/Portfolio';
import CollectionDetail from './pages/CollectionDetail';
import Auth from './pages/Auth';
import MembershipSuccess from './pages/MembershipSuccess';
import AvatarOS from './pages/AvatarOS';
import OAuthConsent from './pages/OAuthConsent';
const World = lazy(() => import('./pages/World'));


const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/MyAccount" element={<LayoutWrapper currentPageName="MyAccount"><MyAccount /></LayoutWrapper>} />
      <Route path="/AdminModeration" element={<AdminModeration />} />
      <Route path="/AdminWearables" element={<AdminWearables />} />
      <Route path="/AdminAvatars" element={<LayoutWrapper currentPageName="AdminAvatars"><AdminAvatars /></LayoutWrapper>} />
      <Route path="/AdminOrders" element={<LayoutWrapper currentPageName="AdminOrders"><AdminOrders /></LayoutWrapper>} />
      <Route path="/Realms" element={<LayoutWrapper currentPageName="Realms"><Realms /></LayoutWrapper>} />
      <Route path="/Risktakers" element={<Risktakers />} />
      <Route path="/Portfolio" element={<LayoutWrapper currentPageName="Portfolio"><PortfolioPage /></LayoutWrapper>} />
      <Route path="/CollectionDetail" element={<LayoutWrapper currentPageName="CollectionDetail"><CollectionDetail /></LayoutWrapper>} />
      <Route path="/Auth" element={<Auth />} />
      <Route path="/Discover" element={<LayoutWrapper currentPageName="Discover"><Discover /></LayoutWrapper>} />
      <Route path="/Drops" element={<LayoutWrapper currentPageName="Drops"><Drops /></LayoutWrapper>} />
      <Route path="/Notifications" element={<LayoutWrapper currentPageName="Notifications"><Notifications /></LayoutWrapper>} />
      <Route path="/SavedLooks" element={<LayoutWrapper currentPageName="SavedLooks"><SavedLooks /></LayoutWrapper>} />
      <Route path="/Onboarding" element={<Onboarding />} />
      <Route path="/Feed" element={<LayoutWrapper currentPageName="Feed"><Feed /></LayoutWrapper>} />
      <Route path="/Membership" element={<LayoutWrapper currentPageName="Membership"><Membership /></LayoutWrapper>} />
      <Route path="/Closet" element={<LayoutWrapper currentPageName="Closet"><Closet /></LayoutWrapper>} />
      <Route path="/AvatarOS" element={<AvatarOS />} />
      <Route path="/World" element={<Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: '#070709' }} />}><World /></Suspense>} />
      <Route path="/MembershipSuccess" element={<MembershipSuccess />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            <Route path="/oauth/consent" element={<OAuthConsent />} />
            <Route path="/*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
        <Toaster />
        <DebugReportButton />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App