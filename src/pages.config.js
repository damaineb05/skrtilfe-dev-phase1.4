/**
 * pages.config.js - Page routing configuration
 */
import About from './pages/About';
// Account removed — superseded by MyAccount (/MyAccount route in App.jsx)
import AdminAnalytics from './pages/AdminAnalytics';
import AdminAssetUpload from './pages/AdminAssetUpload.jsx';
import AdminAssets from './pages/AdminAssets';
import AdminAssistant from './pages/AdminAssistant';
import AdminCollectionEdit from './pages/AdminCollectionEdit';
import AdminContent from './pages/AdminContent.jsx';
import AdminCustomers from './pages/AdminCustomers';
import AdminDashboard from './pages/AdminDashboard';
import AdminInventory from './pages/AdminInventory';
import AdminMarketplace from './pages/AdminMarketplace';
import AdminProductEdit from './pages/AdminProductEdit.jsx';
import AdminSettings from './pages/AdminSettings';
import AdminStockAdjust from './pages/AdminStockAdjust';
import Analytics from './pages/Analytics';
import Blog from './pages/Blog';
import BlogPostDetail from './pages/BlogPostDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutCancel from './pages/CheckoutCancel';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Community from './pages/Community.jsx';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import DripSync from './pages/DripSync';
// Events import removed — BACKEND-LOCKED SHELL (createEventCheckout required)
import FAQ from './pages/FAQ';
import Genesis from './pages/Genesis';
import GenesisCheckoutSuccess from './pages/GenesisCheckoutSuccess';
import Home from './pages/Home';
import MyOrders from './pages/MyOrders';
import NFTMarketplace from './pages/NFTMarketplace.jsx';
// Portfolio import removed — registered manually in App.jsx
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProductDetail from './pages/ProductDetail';
// Profile — LEGACY: overlaps with Portfolio. Kept as file but removed from routing.
// Wallet — BACKEND-LOCKED SHELL: all data simulated; disabled until Builder+ upgrade.
// Events — BACKEND-LOCKED SHELL: requires createEventCheckout backend fn; disabled until Builder+ upgrade.
import ReturnsPolicy from './pages/ReturnsPolicy';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import SizeGuide from './pages/SizeGuide';
import TermsOfService from './pages/TermsOfService';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminAnalytics": AdminAnalytics,
    "AdminAssetUpload": AdminAssetUpload,
    "AdminAssets": AdminAssets,
    "AdminAssistant": AdminAssistant,
    "AdminCollectionEdit": AdminCollectionEdit,
    "AdminContent": AdminContent,
    "AdminCustomers": AdminCustomers,
    "AdminDashboard": AdminDashboard,
    "AdminInventory": AdminInventory,
    "AdminMarketplace": AdminMarketplace,
    "AdminProductEdit": AdminProductEdit,
    "AdminSettings": AdminSettings,
    "AdminStockAdjust": AdminStockAdjust,
    "Analytics": Analytics,
    "Blog": Blog,
    "BlogPostDetail": BlogPostDetail,
    "Cart": Cart,
    "Checkout": Checkout,
    "CheckoutCancel": CheckoutCancel,
    "CheckoutSuccess": CheckoutSuccess,
    "Community": Community,
    "Contact": Contact,
    "Dashboard": Dashboard,
    "DripSync": DripSync,
    // Events — disabled until backend upgrade (createEventCheckout fn required)
    "FAQ": FAQ,
    "Genesis": Genesis,
    "GenesisCheckoutSuccess": GenesisCheckoutSuccess,
    "Home": Home,
    "MyOrders": MyOrders,
    "NFTMarketplace": NFTMarketplace,
    // Portfolio — route registered manually in App.jsx (/Portfolio), removed here to avoid duplicate
    "PrivacyPolicy": PrivacyPolicy,
    "ProductDetail": ProductDetail,
    // Profile — legacy, removed from routing (superseded by Portfolio)
    // Wallet — disabled until backend upgrade
    "ReturnsPolicy": ReturnsPolicy,
    "Settings": Settings,
    "Shop": Shop,
    "SizeGuide": SizeGuide,
    "TermsOfService": TermsOfService,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};