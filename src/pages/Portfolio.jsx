import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { hasGenesisAccess } from '@/lib/useCanonicalGenesisAccess';
import GenesisBadge from '@/components/genesis/GenesisBadge';
import {
  Crown, Shirt, Image as ImageIcon, ShoppingBag, Package,
  Sparkles, Search, Loader2, ExternalLink, ArrowRight, Star,
  CheckCircle, Lock, Calendar, Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/AuthContext';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      <p className="text-white/50 text-xs uppercase tracking-wider">{label}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </motion.div>
  );
}

function GenesisPassCard({ pass, isAdmin }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-2xl p-6 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(0,212,255,0.03) 100%)',
        border: '1px solid rgba(0,212,255,0.3)',
        boxShadow: '0 0 40px rgba(0,212,255,0.1)',
      }}
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'rgba(0,212,255,0.05)', filter: 'blur(40px)', transform: 'translate(30%,-30%)' }} />

      <div className="relative flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)' }}>
          <Crown className="w-7 h-7 text-[#00D4FF]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-white text-lg">Genesis Pass</h3>
            {isAdmin
              ? <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">Admin Grant</Badge>
              : pass?.pass_number
                ? <Badge className="bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30 text-xs">#{pass.pass_number} of 888</Badge>
                : null
            }
          </div>
          <p className="text-white/50 text-sm mb-3">Lifetime access · Genesis 888 Founding Tier</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Exclusive Drops',
              'Full DripSync',
              'Physical × Digital',
              'All Realms',
              '20% Discount',
            ].map(perk => (
              <span key={perk} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(0,212,255,0.08)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.15)' }}>
                <CheckCircle className="w-3 h-3" />
                {perk}
              </span>
            ))}
          </div>
        </div>
      </div>

      {pass?.mint_date && (
        <div className="mt-4 pt-4 flex items-center gap-2 text-xs text-white/30"
          style={{ borderTop: '1px solid rgba(0,212,255,0.1)' }}>
          <Calendar className="w-3 h-3" />
          Member since {format(new Date(pass.mint_date), 'MMMM d, yyyy')}
        </div>
      )}
    </motion.div>
  );
}

function OrderCard({ order }) {
  const statusColors = {
    paid: { bg: 'rgba(52,199,89,0.12)', text: '#34C759', border: 'rgba(52,199,89,0.25)' },
    pending: { bg: 'rgba(255,214,0,0.12)', text: '#FFD600', border: 'rgba(255,214,0,0.25)' },
    failed: { bg: 'rgba(255,59,48,0.12)', text: '#FF3B30', border: 'rgba(255,59,48,0.25)' },
  };
  const s = statusColors[order.payment_status] || statusColors.pending;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 flex items-center gap-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(0,212,255,0.08)' }}>
        <ShoppingBag className="w-5 h-5 text-[#00D4FF]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">
          Order · {order.line_items?.length || 0} item{order.line_items?.length !== 1 ? 's' : ''}
        </p>
        <p className="text-white/40 text-xs">
          {order.created_date ? format(new Date(order.created_date), 'MMM d, yyyy') : '—'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-white font-bold text-sm">${order.total_amount?.toFixed(2)}</span>
        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
          {order.payment_status}
        </span>
      </div>
    </motion.div>
  );
}

function NFTCard({ nft }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden group"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="aspect-square relative overflow-hidden bg-white/5">
        <img
          src={nft.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop'}
          alt={nft.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {nft.is_featured && (
          <div className="absolute top-2 right-2">
            <Star className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-white font-semibold text-sm truncate">{nft.name || 'Untitled'}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-white/40 text-xs">{nft.category || 'NFT'}</span>
          {nft.price && (
            <span className="text-[#00D4FF] text-xs font-bold">{nft.price} {nft.currency || 'ETH'}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'nfts', label: 'NFTs', icon: ImageIcon },
  { id: 'looks', label: 'My Looks', icon: Shirt },
];

export default function Portfolio() {
  const { user, isLoadingAuth: loadingUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Check Genesis access using canonical utility
  const hasGenesis = hasGenesisAccess(user);
  const genesisLoading = false;

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['portfolio-orders', user?.email],
    queryFn: () => base44.entities.Order.filter({ user_email: user.email }, '-created_date', 20),
    enabled: !!user,
  });

  const { data: nfts = [], isLoading: nftsLoading } = useQuery({
    queryKey: ['portfolio-nfts', user?.email],
    queryFn: () => base44.entities.NFT.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: looks = [], isLoading: looksLoading } = useQuery({
    queryKey: ['portfolio-looks', user?.email],
    queryFn: () => base44.entities.Look.filter({ created_by: user.email }, '-created_date', 20),
    enabled: !!user,
  });

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Lock className="w-12 h-12 mx-auto mb-4 text-[#00D4FF]" />
          <h2 className="text-2xl font-black text-white mb-3">Sign In to View Portfolio</h2>
          <p className="text-white/50 text-sm mb-6">Your NFTs, orders, and assets all in one place.</p>
          <Button
            onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
            style={{ background: '#00D4FF', color: '#000' }}
            className="font-bold"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const isLoading = ordersLoading || nftsLoading || looksLoading || genesisLoading;
  const totalAssets = nfts.length + looks.length + (hasGenesis ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <style>{`
        .portfolio-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; }
      `}</style>

      {/* ── Header ── */}
      <div className="pt-10 pb-6 px-4 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: '#00D4FF' }}>
              {user.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{user.full_name || user.email}</h1>
                {hasGenesis && <GenesisBadge size="sm" variant="pill" />}
              </div>
              <p className="text-white/40 text-sm">{user.email}</p>
            </div>
          </div>
          <Link to={createPageUrl('DripSync')}>
            <Button className="font-bold" style={{ background: '#00D4FF', color: '#000' }}>
              <Zap className="w-4 h-4 mr-2" />
              Open DripSync
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl h-24 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Assets" value={totalAssets} icon={Package} color="#00D4FF" />
            <StatCard label="Orders" value={orders.length} icon={ShoppingBag} color="#FF3366"
              sub={orders.filter(o => o.payment_status === 'paid').length + ' paid'} />
            <StatCard label="NFTs" value={nfts.length} icon={ImageIcon} color="#A855F7" />
            <StatCard label="Saved Looks" value={looks.length} icon={Shirt} color="#FFD700" />
          </div>
        )}

        {/* Genesis pass card — always show if holder */}
        {hasGenesis && (
          <div className="mb-8">
            <GenesisPassCard pass={null} isAdmin={user?.role === 'admin'} />
          </div>
        )}

        {/* Genesis CTA — non-holders */}
        {!hasGenesis && (
          <Link to={createPageUrl('Genesis')}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 rounded-2xl p-5 flex items-center justify-between gap-4 cursor-pointer hover:border-[#00D4FF]/40 transition-all"
              style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)' }}
            >
              <div className="flex items-center gap-3">
                <Crown className="w-7 h-7 text-[#00D4FF] shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">Upgrade to Genesis Pass</p>
                  <p className="text-white/45 text-xs">Unlock exclusive drops, full DripSync, and more — $299 lifetime.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#00D4FF] shrink-0" />
            </motion.div>
          </Link>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === id ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
              style={activeTab === id ? { background: 'rgba(0,212,255,0.12)', color: '#00D4FF' } : {}}
            >
              <Icon className="w-3.5 h-3.5 hidden sm:block" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Section title="Recent Orders" count={orders.length} link={createPageUrl('MyOrders')} linkLabel="All Orders">
              {ordersLoading
                ? <Skeleton rows={3} />
                : orders.length === 0
                  ? <Empty icon={ShoppingBag} message="No orders yet" cta="Shop Now" ctaLink={createPageUrl('Shop')} />
                  : orders.slice(0, 4).map(o => <OrderCard key={o.id} order={o} />)
              }
            </Section>

            <Section title="NFTs" count={nfts.length}>
              {nftsLoading
                ? <Skeleton grid />
                : nfts.length === 0
                  ? <Empty icon={ImageIcon} message="No NFTs yet" cta="Browse NFTs" ctaLink={createPageUrl('NFTMarketplace')} />
                  : <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {nfts.slice(0, 4).map(n => <NFTCard key={n.id} nft={n} />)}
                    </div>
              }
            </Section>

            <Section title="My Looks" count={looks.length} link={createPageUrl('DripSync')} linkLabel="DripSync Studio">
              {looksLoading
                ? <Skeleton grid />
                : looks.length === 0
                  ? <Empty icon={Shirt} message="No saved looks yet" cta="Open DripSync" ctaLink={createPageUrl('DripSync')} />
                  : <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {looks.slice(0, 4).map(look => <LookCard key={look.id} look={look} />)}
                    </div>
              }
            </Section>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-3">
            {ordersLoading
              ? <Skeleton rows={5} />
              : orders.length === 0
                ? <Empty icon={ShoppingBag} message="No orders yet" cta="Shop Now" ctaLink={createPageUrl('Shop')} />
                : orders.map(o => <OrderCard key={o.id} order={o} />)
            }
          </div>
        )}

        {activeTab === 'nfts' && (
          nftsLoading
            ? <Skeleton grid />
            : nfts.length === 0
              ? <Empty icon={ImageIcon} message="No NFTs yet" cta="Browse NFTs" ctaLink={createPageUrl('NFTMarketplace')} />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {nfts.map(n => <NFTCard key={n.id} nft={n} />)}
                </div>
        )}

        {activeTab === 'looks' && (
          looksLoading
            ? <Skeleton grid />
            : looks.length === 0
              ? <Empty icon={Shirt} message="No saved looks yet" cta="Open DripSync" ctaLink={createPageUrl('DripSync')} />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {looks.map(look => <LookCard key={look.id} look={look} />)}
                </div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Section({ title, count, children, link, linkLabel }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-white font-bold text-base">{title}</h2>
          {count > 0 && (
            <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{count}</span>
          )}
        </div>
        {link && (
          <Link to={link} className="text-[#00D4FF] text-xs font-semibold flex items-center gap-1 hover:underline">
            {linkLabel} <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function LookCard({ look }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden group"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="aspect-square relative bg-white/5 flex items-center justify-center overflow-hidden">
        {look.thumbnail_url
          ? <img src={look.thumbnail_url} alt={look.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <Shirt className="w-10 h-10 text-white/20" />
        }
      </div>
      <div className="p-3">
        <p className="text-white font-semibold text-xs truncate">{look.name}</p>
        {look.created_date && (
          <p className="text-white/35 text-xs mt-0.5">{format(new Date(look.created_date), 'MMM d')}</p>
        )}
      </div>
    </motion.div>
  );
}

function Skeleton({ rows, grid }) {
  if (grid) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-square rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {[...Array(rows || 3)].map((_, i) => (
        <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
      ))}
    </div>
  );
}

function Empty({ icon: Icon, message, cta, ctaLink }) {
  return (
    <div className="rounded-xl p-10 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <Icon className="w-10 h-10 text-white/20 mx-auto mb-3" />
      <p className="text-white/40 text-sm mb-4">{message}</p>
      {cta && (
        <Link to={ctaLink}>
          <Button size="sm" style={{ background: 'rgba(0,212,255,0.12)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.25)' }} className="font-bold">
            {cta}
          </Button>
        </Link>
      )}
    </div>
  );
}