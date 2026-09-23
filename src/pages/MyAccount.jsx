import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, MapPin, Heart, CreditCard, User, Star,
  Loader2, Truck, CheckCircle2, Clock, XCircle, Trash2, Sparkles,
} from "lucide-react";

import ProfileTab from "@/components/account/ProfileTab";
import ShippingTab from "@/components/account/ShippingTab";
import BillingTab from "@/components/account/BillingTab";
import MembershipTab from "@/components/account/MembershipTab";
import { getMembershipTier } from "@/lib/membershipAccess";
import { useAuth } from "@/lib/AuthContext";
import IdentityPanel from "@/components/identity/IdentityPanel";

// ─── Tabs ────────────────────────────────────────────────
const TABS = [
  { id: "identity",   label: "Identity",   icon: Sparkles },
  { id: "profile",    label: "Profile",    icon: User       },
  { id: "membership", label: "Membership", icon: Star       },
  { id: "orders",     label: "Orders",     icon: Package    },
  { id: "shipping",   label: "Shipping",   icon: MapPin     },
  { id: "billing",    label: "Billing",    icon: CreditCard },
  { id: "wishlist",   label: "Wishlist",   icon: Heart      },
];

// ─── Order status helpers ────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: "Pending",  icon: Clock,        color: "text-amber-500" },
  paid:      { label: "Paid",     icon: CheckCircle2, color: "text-green-600" },
  fulfilled: { label: "Shipped",  icon: Truck,        color: "text-blue-600"  },
  refunded:  { label: "Refunded", icon: XCircle,      color: "text-black/40"  },
  failed:    { label: "Failed",   icon: XCircle,      color: "text-red-500"   },
};

function OrderStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-widest ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />{cfg.label}
    </span>
  );
}

// ─── Orders Tab ─────────────────────────────────────────
function OrdersTab({ userEmail }) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", userEmail],
    queryFn: () => base44.entities.Order.filter({ user_email: userEmail }, "-created_date", 50),
    enabled: !!userEmail,
  });

  if (isLoading) return <LoadingSpinner />;
  if (orders.length === 0) return (
    <EmptyState icon={<Package className="w-8 h-8 text-black/20" />} title="No orders yet"
      cta={{ label: "Start shopping", href: createPageUrl("Shop") }} />
  );

  return (
    <div className="divide-y divide-[#e8e8e8]">
      {orders.map(order => (
        <div key={order.id} className="py-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-black/40 uppercase tracking-widest mb-0.5">
                Order · {new Date(order.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <p className="text-xs text-black/30 font-mono">{order.id?.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <OrderStatusBadge status={order.payment_status} />
              {order.fulfillment_status && order.fulfillment_status !== "unfulfilled" && (
                <p className="text-[10px] text-black/30 uppercase tracking-wider mt-1">{order.fulfillment_status}</p>
              )}
            </div>
          </div>
          <div className="space-y-3 mb-4">
            {(order.line_items || []).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-14 h-14 object-cover bg-[#f5f5f3] shrink-0" />
                ) : (
                  <div className="w-14 h-14 bg-[#f5f5f3] shrink-0 flex items-center justify-center">
                    <Package className="w-5 h-5 text-black/15" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">{item.title}</p>
                  {item.variant_sku && <p className="text-xs text-black/40">SKU: {item.variant_sku}</p>}
                  <p className="text-xs text-black/40">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-black shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-[#e8e8e8] pt-3">
            <div>
              {order.tracking_number && (
                <p className="text-xs text-black/40">Tracking: <span className="font-mono text-black/60">{order.tracking_number}</span></p>
              )}
            </div>
            <p className="text-sm font-semibold text-black">Total: ${order.total_amount?.toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Wishlist Tab ────────────────────────────────────────
function WishlistTab() {
  const STORAGE_KEY = "wishlist_product_ids";
  const [wishlistIds, setWishlistIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["wishlist-products", wishlistIds.join(",")],
    queryFn: async () => {
      if (!wishlistIds.length) return [];
      const all = await base44.entities.Product.list("-created_date", 200);
      return all.filter(p => wishlistIds.includes(p.id));
    },
    enabled: wishlistIds.length > 0,
  });

  const remove = (id) => {
    const updated = wishlistIds.filter(i => i !== id);
    setWishlistIds(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = cart.findIndex(i => i.product_id === product.id);
    if (idx > -1) cart[idx].quantity += 1;
    else cart.push({ product_id: product.id, title: product.title, price: product.price, quantity: 1, image_url: product.media?.[0]?.url });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (!wishlistIds.length) return (
    <EmptyState icon={<Heart className="w-8 h-8 text-black/20" />} title="Your wishlist is empty"
      cta={{ label: "Browse products", href: createPageUrl("Shop") }} />
  );
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => {
        const img = product.media?.find(m => m.is_primary) || product.media?.[0];
        const isOnSale = product.compare_at_price > product.price;
        return (
          <div key={product.id} className="group relative">
            <Link to={`${createPageUrl("ProductDetail")}?id=${product.id}`}
              className="block aspect-[3/4] bg-[#f5f5f3] overflow-hidden mb-3">
              {img ? <img src={img.url} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                : <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-black/10" /></div>}
            </Link>
            <button onClick={() => remove(product.id)}
              className="absolute top-2 right-2 w-8 h-8 bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30 mb-0.5">{product.collection}</p>
            <Link to={`${createPageUrl("ProductDetail")}?id=${product.id}`}>
              <p className="text-sm text-black font-medium truncate hover:underline underline-offset-2">{product.title}</p>
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5 mb-3">
              <span className="text-sm font-semibold text-black">${product.price?.toFixed(2)}</span>
              {isOnSale && <span className="text-xs text-black/30 line-through">${product.compare_at_price?.toFixed(2)}</span>}
            </div>
            <button onClick={() => handleAddToCart(product)}
              className="w-full h-9 bg-black text-white text-xs font-bold uppercase tracking-[0.08em] hover:bg-black/80 transition-colors">
              Add To Bag
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Shared helpers ──────────────────────────────────────
function LoadingSpinner() {
  return <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-black/30" /></div>;
}

function EmptyState({ icon, title, cta }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      {icon}
      <p className="text-sm text-black/40">{title}</p>
      {cta && <Link to={cta.href} className="text-xs font-semibold uppercase tracking-widest text-black underline underline-offset-2 hover:opacity-60 transition-opacity">{cta.label}</Link>}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────
export default function MyAccount() {
  const [activeTab, setActiveTab] = useState("identity");
  const { user, isLoadingAuth } = useAuth();
  const [profile, setProfile] = useState(null);

  const loadProfile = useCallback(async (email) => {
    const profiles = await base44.entities.Profile.filter({ user_email: email });
    setProfile(profiles[0] || null);
  }, []);

  useEffect(() => {
    if (user?.email) loadProfile(user.email);
  }, [user?.email, loadProfile]);

  const handleProfileSaved = useCallback(async () => {
    if (user?.email) await loadProfile(user.email);
  }, [user?.email, loadProfile]);

  if (isLoadingAuth) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-black/30" />
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-black/40">Sign in to view your account.</p>
        <button onClick={() => base44.auth.redirectToLogin(window.location.pathname)} className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest">Sign In</button>
      </div>
    );
  }

  const membershipTier = getMembershipTier(user);

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="border-b border-[#e8e8e8] px-5 lg:px-12 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/30 mb-1">My Account</p>
            <h1 className="text-2xl font-semibold text-black tracking-[-0.01em]">
              {profile?.display_name || user?.full_name || "Welcome back"}
            </h1>
            {profile?.username && <p className="text-xs text-black/30 mt-0.5">@{profile.username}</p>}
            {user?.email && <p className="text-xs text-black/40 mt-0.5">{user.email}</p>}
          </div>
          {/* Tier badge — canonical membership identity (FREE / DRIPSYNC+ / GENESIS) */}
          <div className="flex items-center gap-2 px-4 py-2" style={{
            background: membershipTier === 'genesis' ? '#000' : membershipTier === 'dripsync_plus' ? '#0A0A0F' : '#f5f5f3',
            color: membershipTier === 'free' ? 'rgba(0,0,0,0.5)' : '#fff',
            border: membershipTier === 'dripsync_plus' ? '1px solid rgba(0,212,255,0.4)' : 'none',
          }}>
            <Star className="w-3.5 h-3.5" style={{ fill: membershipTier === 'free' ? 'none' : 'currentColor', color: membershipTier === 'dripsync_plus' ? '#00D4FF' : undefined }} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {membershipTier === 'genesis' ? 'Genesis' : membershipTier === 'dripsync_plus' ? 'DripSync+' : 'Citizen'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 lg:px-12 py-8">
        <div className="lg:flex lg:gap-12">

          {/* Sidebar nav */}
          <nav className="lg:w-52 shrink-0 mb-8 lg:mb-0">
            <ul className="flex flex-wrap lg:flex-col gap-1">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all"
                      style={{
                        background: active ? '#000' : 'transparent',
                        color: active ? '#fff' : 'rgba(0,0,0,0.45)',
                      }}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs font-semibold uppercase tracking-[0.12em]">{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Tab content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === "identity"   && <IdentityPanel user={user} profile={profile} />}
                {activeTab === "profile"    && <ProfileTab user={user} profile={profile} onProfileSaved={handleProfileSaved} />}
                {activeTab === "membership" && <MembershipTab user={user} profile={profile} />}
                {activeTab === "orders"     && <OrdersTab userEmail={user?.email} />}
                {activeTab === "shipping"   && profile && <ShippingTab profile={profile} onProfileSaved={handleProfileSaved} />}
                {activeTab === "shipping"   && !profile && (
                  <p className="text-sm text-black/40 py-8">Please save your profile first before adding shipping addresses.</p>
                )}
                {activeTab === "billing"    && <BillingTab user={user} profile={profile} onProfileSaved={handleProfileSaved} />}
                {activeTab === "wishlist"   && <WishlistTab />}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}