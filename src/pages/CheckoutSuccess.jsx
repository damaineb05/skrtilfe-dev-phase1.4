import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, MapPin, Mail, Truck, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(!!sessionId);

  useEffect(() => {
    // Clear cart immediately
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));

    if (!sessionId) { setIsLoading(false); return; }

    // Poll for order created by webhook (up to ~9 seconds)
    const poll = async () => {
      for (let i = 0; i < 6; i++) {
        try {
          let results = await base44.entities.Order.filter({ checkout_session_id: sessionId }, '-created_date', 1);
          if (!results.length) results = await base44.entities.Order.filter({ transaction_id: sessionId }, '-created_date', 1);
          if (results.length > 0) { setOrder(results[0]); setIsLoading(false); return; }
        } catch (_) {}
        if (i < 5) await new Promise(r => setTimeout(r, 1500));
      }
      setIsLoading(false);
    };
    poll();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Success card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-[0_0_60px_rgba(0,212,255,0.08)]">

          {/* Icon */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
            <p className="text-white/50 text-sm">
              {order?.user_email ? `Confirmation sent to ${order.user_email}` : 'Check your email for confirmation'}
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-white/40 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading order details…
            </div>
          )}

          {/* Order details */}
          {!isLoading && order && (
            <div className="space-y-3 mb-8">
              {/* Order number */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Order</p>
                <p className="text-white font-mono font-bold tracking-wider">#{order.id.slice(-10).toUpperCase()}</p>
              </div>

              {/* Items */}
              {order.line_items?.length > 0 && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-cyan-400" />
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Items</p>
                  </div>
                  <div className="space-y-2">
                    {order.line_items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-white/70">{item.title}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</span>
                        <span className="text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/10 pt-2 mt-1 flex justify-between font-bold">
                      <span className="text-white/50 text-sm">Total</span>
                      <span className="text-cyan-400">${order.total_amount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping address */}
              {order.shipping_address && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Ships to</p>
                  </div>
                  <p className="text-sm text-white">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                  <p className="text-sm text-white/50">{order.shipping_address.street_address}</p>
                  <p className="text-sm text-white/50">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
                </div>
              )}
            </div>
          )}

          {/* Fallback when no order found yet */}
          {!isLoading && !order && (
            <div className="space-y-3 mb-8">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3 items-start">
                <Mail className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Confirmation email sent</p>
                  <p className="text-xs text-white/50 mt-1">Check your inbox for order details and tracking information.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3 items-start">
                <Truck className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Fulfillment within 24 hrs</p>
                  <p className="text-xs text-white/50 mt-1">We'll prepare and ship your order promptly.</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link to={createPageUrl('MyOrders')} className="block">
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white h-12 font-semibold rounded-xl flex items-center justify-center gap-2">
                View My Orders <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to={createPageUrl('DripSync')} className="block">
              <Button variant="outline" className="w-full border-white/15 text-white hover:bg-white/5 h-12 font-semibold rounded-xl flex items-center justify-center gap-2 bg-transparent">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Try on in DripSync
              </Button>
            </Link>
            <Link to={createPageUrl('Shop')} className="block text-center text-sm text-white/40 hover:text-white/70 transition-colors pt-1">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}