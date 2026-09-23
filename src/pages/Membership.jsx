/**
 * Membership Hub — uses existing GenesisPass, User, Order, Product, Drop entities.
 * Does not replace/break the existing Genesis page (which handles checkout).
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Crown, Check, Lock, Zap, Star, Package, Calendar, ArrowRight, ShoppingBag } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { hasGenesisAccess } from '@/lib/useCanonicalGenesisAccess';

const GENESIS_BENEFITS = [
  { icon: Crown, label: 'Founding Member Status', desc: 'Permanent Genesis badge across the platform' },
  { icon: Zap, label: 'Exclusive DripSync Wearables', desc: 'Member-only 3D avatar items and drops' },
  { icon: Package, label: 'Priority Drops Access', desc: 'Early access before public release' },
  { icon: Star, label: 'Genesis-Only Events', desc: 'IRL and virtual member experiences' },
  { icon: ShoppingBag, label: 'Member Discounts', desc: 'Exclusive pricing on all collections' },
  { icon: Calendar, label: 'Creator Access', desc: 'Connect with Skrtlife creators directly' },
];

export default function Membership() {
  const { user } = useAuth();
  const [genesisPass, setGenesisPass] = useState(null);
  const [orders, setOrders] = useState([]);
  const [genesisProducts, setGenesisProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isGenesis = hasGenesisAccess(user);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    Promise.all([
      base44.entities.GenesisPass.filter({ user_id: user.id }).catch(() => []),
      base44.entities.Order.filter({ user_email: user.email, payment_status: 'paid' }, '-created_date', 5).catch(() => []),
      base44.entities.Product.filter({ collection: 'Genesis', status: 'active' }, '-created_date', 6).catch(() => []),
    ]).then(([passes, ords, prods]) => {
      setGenesisPass(passes?.[0] || null);
      setOrders(ords || []);
      setGenesisProducts(prods || []);
      setLoading(false);
    });
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0A0A0F' }}>
        <div className="text-center max-w-sm">
          <Crown className="w-12 h-12 mx-auto mb-4" style={{ color: '#FFD700' }} />
          <h2 className="text-2xl font-black text-white mb-3">Sign in to view membership</h2>
          <button onClick={() => base44.auth.redirectToLogin('/Membership')}
            className="px-8 py-3 rounded-xl font-bold text-sm" style={{ background: '#FFD700', color: '#000' }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-[9px] tracking-[0.45em] uppercase mb-3 font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Your Access
          </p>
          <h1 className="text-4xl font-black text-white mb-2" style={{ letterSpacing: '-0.03em' }}>MEMBERSHIP HUB</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Manage your Genesis status and member benefits</p>
        </motion.div>

        {/* Status Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl mb-8"
          style={{
            background: isGenesis
              ? 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,170,0,0.06))'
              : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isGenesis ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.08)'}`,
          }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: isGenesis ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.06)' }}>
              <Crown className="w-7 h-7" style={{ color: isGenesis ? '#FFD700' : 'rgba(255,255,255,0.3)' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-black text-lg text-white">{isGenesis ? 'Genesis Member' : 'Standard Member'}</p>
                {isGenesis && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{ background: 'rgba(255,215,0,0.2)', color: '#FFD700' }}>Active</span>
                )}
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {isGenesis ? `Member since ${genesisPass?.created_date ? new Date(genesisPass.created_date).toLocaleDateString() : 'Day one'}` : 'Upgrade to Genesis for exclusive access'}
              </p>
            </div>
            {!isGenesis && (
              <Link to={createPageUrl('Genesis')}
                className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 flex-shrink-0"
                style={{ background: '#FFD700', color: '#000' }}>
                Upgrade <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </motion.div>

        {/* Benefits */}
        <section className="mb-10">
          <h2 className="font-black text-white text-xl mb-5" style={{ letterSpacing: '-0.02em' }}>
            {isGenesis ? 'Your Benefits' : 'Genesis Benefits'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GENESIS_BENEFITS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: isGenesis ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.05)' }}>
                  {isGenesis
                    ? <Icon className="w-4 h-4" style={{ color: '#FFD700' }} />
                    : <Lock className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  }
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
                </div>
                {isGenesis && <Check className="w-4 h-4 ml-auto flex-shrink-0 mt-0.5" style={{ color: '#FFD700' }} />}
              </div>
            ))}
          </div>
        </section>

        {/* Genesis Exclusive Products */}
        {isGenesis && genesisProducts.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-white text-xl" style={{ letterSpacing: '-0.02em' }}>Exclusive Products</h2>
              <Link to={createPageUrl('Shop')} className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Shop <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {genesisProducts.map(p => {
                const img = p.media?.[0]?.url || 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400&q=80';
                return (
                  <Link key={p.id} to={`${createPageUrl('ProductDetail')}?id=${p.id}`}>
                    <motion.div whileHover={{ y: -2 }} className="rounded-2xl overflow-hidden group"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,215,0,0.1)' }}>
                      <div className="aspect-square overflow-hidden">
                        <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-3">
                        <p className="text-white font-semibold text-sm truncate">{p.title}</p>
                        <p className="font-bold text-sm mt-0.5" style={{ color: '#FFD700' }}>${p.price}</p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Order History */}
        {orders.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-white text-xl" style={{ letterSpacing: '-0.02em' }}>Recent Orders</h2>
              <Link to={createPageUrl('MyOrders')} className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                All Orders <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {orders.slice(0, 3).map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div>
                    <p className="text-white font-semibold text-sm">Order #{order.id?.slice(0, 8)}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(order.created_date).toLocaleDateString()} · {(order.line_items || []).length} item(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">${order.total_amount?.toFixed(2)}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,255,0,0.1)', color: '#00ff88' }}>Paid</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upgrade CTA for non-members */}
        {!isGenesis && (
          <div className="p-8 rounded-2xl text-center"
            style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,170,0,0.04))', border: '1px solid rgba(255,215,0,0.15)' }}>
            <Crown className="w-12 h-12 mx-auto mb-4" style={{ color: '#FFD700' }} />
            <h3 className="text-2xl font-black text-white mb-2">Unlock Genesis Access</h3>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Join the founding members and get lifetime access to exclusive drops, wearables, and events.
            </p>
            <Link to={createPageUrl('Genesis')}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wider"
              style={{ background: '#FFD700', color: '#000' }}>
              Get Genesis Pass <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}