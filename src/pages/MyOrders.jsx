import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Package, Truck, CheckCircle2, Clock, ArrowRight, Search, XCircle } from 'lucide-react';

const statusConfig = {
  unfulfilled: { icon: Clock, label: 'Processing', color: 'bg-yellow-500/10 border-yellow-500/30' },
  fulfilled: { icon: CheckCircle2, label: 'Delivered', color: 'bg-green-500/10 border-green-500/30' },
  partially_fulfilled: { icon: Truck, label: 'In Transit', color: 'bg-blue-500/10 border-blue-500/30' }
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestSearch, setGuestSearch] = useState('');
  const [guestSearched, setGuestSearched] = useState(false);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSending, setCancelSending] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      const userOrders = await base44.entities.Order.filter({ user_email: user.email }, '-created_date', 100);
      setOrders(userOrders);
    } catch (error) {
      // Guest — no user session
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = (order) => {
    setCancelOrder(order);
    setCancelReason('');
    setCancelSuccess(false);
  };

  const submitCancelRequest = async () => {
    if (!cancelOrder) return;
    setCancelSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: 'support@skrtlife.com',
        subject: `Cancellation Request — Order #${cancelOrder.id.slice(-8)}`,
        body: `Customer ${cancelOrder.user_email} has requested cancellation for order #${cancelOrder.id}.\n\nReason: ${cancelReason || 'No reason provided'}\n\nOrder total: $${cancelOrder.total_amount}`
      });
      setCancelSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setCancelSending(false);
    }
  };

  const handleGuestSearch = async (e) => {
    e.preventDefault();
    if (!guestEmail.trim()) return;
    setIsLoading(true);
    try {
      const results = await base44.entities.Order.filter({ user_email: guestEmail.trim().toLowerCase() }, '-created_date', 100);
      setOrders(results);
      setGuestSearch(guestEmail.trim().toLowerCase());
      setGuestSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#050810] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#050810] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Orders</h1>
          {currentUser ? (
            <p className="text-white/50 text-sm">{orders.length} {orders.length === 1 ? 'order' : 'orders'} found</p>
          ) : (
            <div className="mt-4">
              <p className="text-white/60 text-sm mb-3">Enter your email to look up your orders</p>
              <form onSubmit={handleGuestSearch} className="flex gap-3 max-w-md">
                <Input
                  type="email"
                  placeholder="Email used at checkout"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5">
                  <Search className="w-4 h-4 mr-2" />
                  Look Up
                </Button>
              </form>
              {guestSearched && (
                <p className="text-white/50 text-xs mt-2">{orders.length} {orders.length === 1 ? 'order' : 'orders'} found for {guestSearch}</p>
              )}
            </div>
          )}
        </div>

        {(!currentUser && !guestSearched) ? null : orders.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center soft-glow-blue">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-center">
              <Package className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Orders Yet</h2>
            <p className="text-white/60 mb-6">Start shopping to create your first order</p>
            <Link to={createPageUrl('Shop')}>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 rounded-xl font-semibold">
                Shop Now
              </Button>
            </Link>
          </div>
        ) : null}
        {(currentUser || guestSearched) && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map(order => {
              const config = statusConfig[order.fulfillment_status] || statusConfig.unfulfilled;
              const StatusIcon = config.icon;
              const totalItems = order.line_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

              return (
                <Card key={order.id} className="glass-card p-6 soft-glow-blue hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${config.color} border`}>
                          <StatusIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-white/50">{new Date(order.created_date).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Items</p>
                          <p className="text-sm text-white">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Total</p>
                      <p className="text-2xl font-bold text-blue-400 mb-4">${order.total_amount?.toFixed(2)}</p>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/5 text-xs">
                          View Details
                          <ArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                        {order.fulfillment_status === 'unfulfilled' && order.payment_status === 'paid' && (
                          <Button
                            variant="ghost"
                            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                            onClick={() => handleCancelRequest(order)}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Request Cancellation
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>


      {/* Cancel Request Modal */}
      {cancelOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full">
            {cancelSuccess ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-bold text-lg mb-2">Request Sent</h3>
                <p className="text-white/60 text-sm mb-6">Our team will review your cancellation request and respond within 1 business hour.</p>
                <Button onClick={() => setCancelOrder(null)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Done</Button>
              </div>
            ) : (
              <>
                <h3 className="text-white font-bold text-lg mb-1">Request Cancellation</h3>
                <p className="text-white/50 text-xs mb-4">Order #{cancelOrder.id.slice(-8)} · ${cancelOrder.total_amount?.toFixed(2)}</p>
                <p className="text-white/70 text-sm mb-4">Cancellations are processed within 1 business hour if the order hasn't shipped yet.</p>
                <textarea
                  className="w-full bg-white/5 border border-white/20 rounded-xl text-white text-sm p-3 placeholder:text-white/30 resize-none mb-4"
                  rows={3}
                  placeholder="Reason for cancellation (optional)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/5" onClick={() => setCancelOrder(null)}>
                    Keep Order
                  </Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={submitCancelRequest} disabled={cancelSending}>
                    {cancelSending ? 'Sending...' : 'Submit Request'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .glass-card {
          background: rgba(15,20,35,0.6);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(100,150,255,0.15);
        }
        .soft-glow-blue {
          box-shadow: 0 4px 24px rgba(100,150,255,0.15);
        }
      `}</style>
    </div>
  );
}