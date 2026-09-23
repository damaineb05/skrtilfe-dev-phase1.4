import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CreditCard, Package, ExternalLink, Loader2, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BillingTab({ user, profile, onProfileSaved }) {
  const [billingForm, setBillingForm] = useState({
    use_shipping: profile?.billing_address?.use_shipping ?? true,
    full_name: profile?.billing_address?.full_name || '',
    line1: profile?.billing_address?.line1 || '',
    line2: profile?.billing_address?.line2 || '',
    city: profile?.billing_address?.city || '',
    state: profile?.billing_address?.state || '',
    zip: profile?.billing_address?.zip || '',
    country: profile?.billing_address?.country || 'US',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: orders = [] } = useQuery({
    queryKey: ['billing-orders', user?.email],
    queryFn: () => base44.entities.Order.filter({ user_email: user.email, payment_status: 'paid' }, '-created_date', 20),
    enabled: !!user?.email,
  });

  const set = (k, v) => setBillingForm(p => ({ ...p, [k]: v }));

  const saveBilling = async () => {
    setSaving(true);
    await base44.entities.Profile.update(profile.id, { billing_address: billingForm });
    onProfileSaved?.();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const totalSpend = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <div className="space-y-10 max-w-xl">

      {/* Subscription status */}
      <div className="border border-[#e8e8e8] p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 mb-4">Membership & Subscription</p>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                profile?.membership_tier === 'genesis'
                  ? 'bg-black text-white'
                  : 'bg-[#f5f5f3] text-black/60'
              }`}>
                {profile?.membership_tier === 'genesis' ? '⬡ Genesis Member' : '○ Basic Member'}
              </span>
            </div>
            <p className="text-xs text-black/40">
              {profile?.membership_tier === 'genesis'
                ? 'You have early access, exclusive drops, priority support & more.'
                : 'Upgrade to Genesis for early access, exclusive drops & perks.'}
            </p>
          </div>
          {profile?.membership_tier !== 'genesis' && (
            <Link to={createPageUrl('Genesis')}
              className="shrink-0 px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black/80 transition-colors">
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Purchase stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-[#e8e8e8] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-1">Total Orders</p>
          <p className="text-2xl font-semibold text-black">{orders.length}</p>
        </div>
        <div className="border border-[#e8e8e8] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-1">Total Spend</p>
          <p className="text-2xl font-semibold text-black">${totalSpend.toFixed(2)}</p>
        </div>
      </div>

      {/* Recent purchases */}
      {orders.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 mb-4">Recent Purchases</p>
          <div className="divide-y divide-[#e8e8e8]">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs font-mono text-black/40">{order.id?.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-black/30">{new Date(order.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-black">${order.total_amount?.toFixed(2)}</p>
                  <p className="text-[10px] uppercase tracking-wider text-green-600 font-semibold">Paid</p>
                </div>
              </div>
            ))}
          </div>
          <Link to={createPageUrl('MyOrders')} className="inline-flex items-center gap-1 mt-4 text-[10px] font-bold uppercase tracking-widest text-black underline underline-offset-2 hover:opacity-50 transition-opacity">
            View All Orders <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Billing address */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 mb-4">Billing Address</p>
        <label className="flex items-center gap-2 cursor-pointer mb-5">
          <input type="checkbox" checked={billingForm.use_shipping} onChange={e => set('use_shipping', e.target.checked)} className="w-3.5 h-3.5 accent-black" />
          <span className="text-xs text-black/50">Same as default shipping address</span>
        </label>

        {!billingForm.use_shipping && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { k: 'full_name', ph: 'Full Name', span: 2 },
              { k: 'line1', ph: 'Address Line 1', span: 2 },
              { k: 'line2', ph: 'Address Line 2 (optional)', span: 2 },
              { k: 'city', ph: 'City' },
              { k: 'state', ph: 'State' },
              { k: 'zip', ph: 'ZIP Code' },
              { k: 'country', ph: 'Country' },
            ].map(f => (
              <input
                key={f.k}
                placeholder={f.ph}
                value={billingForm[f.k]}
                onChange={e => set(f.k, e.target.value)}
                className={`border-b border-[#d4d4d4] py-2.5 text-sm placeholder:text-black/25 focus:outline-none focus:border-black transition-colors bg-transparent ${f.span === 2 ? 'col-span-2' : ''}`}
              />
            ))}
          </div>
        )}

        <button
          onClick={saveBilling}
          disabled={saving}
          className="flex items-center gap-2 mt-5 px-7 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.12em] hover:bg-black/80 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : null}
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Billing Info'}
        </button>
      </div>
    </div>
  );
}