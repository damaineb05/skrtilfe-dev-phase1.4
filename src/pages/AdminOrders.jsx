import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ChevronDown, Search, Filter, Download, AlertCircle } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminOrders() {
  const { user } = useAuth();
  const [searchEmail, setSearchEmail] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Fetch orders
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const result = await base44.entities.Order.list('-created_date', 500);
      return result || [];
    },
    staleTime: 30000,
  });

  // Filter & sort
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(o => {
      const emailMatch = o.user_email?.toLowerCase().includes(searchEmail.toLowerCase());
      const statusMatch = statusFilter === 'all' || o.payment_status === statusFilter;
      return emailMatch && statusMatch;
    });

    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    } else if (sortBy === 'amount_high') {
      filtered.sort((a, b) => b.total_amount - a.total_amount);
    } else if (sortBy === 'amount_low') {
      filtered.sort((a, b) => a.total_amount - b.total_amount);
    }

    return filtered;
  }, [orders, searchEmail, statusFilter, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: orders.length,
    paid: orders.filter(o => o.payment_status === 'paid').length,
    pending: orders.filter(o => o.payment_status === 'pending').length,
    failed: orders.filter(o => o.payment_status === 'failed').length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
  }), [orders]);

  // Check admin
  if (user?.role !== 'admin') {
    return (
      <AdminLayout currentPageName="AdminOrders">
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-500 font-semibold">Admin access required</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPageName="AdminOrders">
      <div className="min-h-screen p-6" style={{ background: '#0A0A0F' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
              Order Management
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              Track all purchases, customer emails, and payment status
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <StatCard label="Total Orders" value={stats.total} color="#00D4FF" />
            <StatCard label="Paid" value={stats.paid} color="#00FF00" />
            <StatCard label="Pending" value={stats.pending} color="#FFD700" />
            <StatCard label="Failed" value={stats.failed} color="#FF3366" />
            <StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} color="#00D4FF" />
          </div>

          {/* Filters & Search */}
          <div className="glass-mid rounded-lg p-4 mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Email Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customer email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface-3 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Payment Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-surface-3 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-surface-3 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="recent">Recent First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_high">Highest Amount</option>
                <option value="amount_low">Lowest Amount</option>
              </select>

              {/* Export Button */}
              <button
                onClick={() => exportToCSV(filteredOrders)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Orders Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-gray-700 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading orders...</p>
            </div>
          ) : error ? (
            <div className="glass-mid rounded-lg p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-500">Failed to load orders. Please try again.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="glass-mid rounded-lg p-12 text-center">
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>No orders found</p>
            </div>
          ) : (
            <div className="glass-mid rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th className="px-6 py-4 text-left font-semibold" style={{ color: '#00D4FF' }}>Order ID</th>
                      <th className="px-6 py-4 text-left font-semibold" style={{ color: '#00D4FF' }}>Customer Email</th>
                      <th className="px-6 py-4 text-left font-semibold" style={{ color: '#00D4FF' }}>Items</th>
                      <th className="px-6 py-4 text-right font-semibold" style={{ color: '#00D4FF' }}>Total</th>
                      <th className="px-6 py-4 text-center font-semibold" style={{ color: '#00D4FF' }}>Payment Status</th>
                      <th className="px-6 py-4 text-center font-semibold" style={{ color: '#00D4FF' }}>Fulfillment</th>
                      <th className="px-6 py-4 text-left font-semibold" style={{ color: '#00D4FF' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <React.Fragment key={order.id}>
                        <tr
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                          className="hover:bg-white/5 cursor-pointer transition-colors"
                          onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        >
                          <td className="px-6 py-4">
                            <code className="text-xs font-mono" style={{ color: '#00D4FF' }}>
                              {order.id?.slice(0, 8)}...
                            </code>
                          </td>
                          <td className="px-6 py-4 text-white">{order.user_email}</td>
                          <td className="px-6 py-4 text-white">{(order.line_items || []).length} item(s)</td>
                          <td className="px-6 py-4 text-right font-semibold text-white">
                            ${(order.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <StatusBadge status={order.payment_status} />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <FulfillmentBadge status={order.fulfillment_status} />
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-xs">
                            {new Date(order.created_date).toLocaleDateString()}
                          </td>
                        </tr>

                        {/* Expanded Detail Row */}
                        {expandedOrderId === order.id && (
                          <tr style={{ backgroundColor: 'rgba(0,212,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <td colSpan="7" className="px-6 py-6">
                              <div className="space-y-4">
                                {/* Order Items */}
                                <div>
                                  <h4 className="font-semibold mb-3" style={{ color: '#00D4FF' }}>
                                    Order Items
                                  </h4>
                                  <div className="space-y-2">
                                    {(order.line_items || []).map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-sm p-2 bg-black/20 rounded">
                                        <div>
                                          <p className="text-white font-medium">{item.title}</p>
                                          <p className="text-gray-400 text-xs">{item.variant_sku ? `SKU: ${item.variant_sku}` : 'No SKU'}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-white">Qty: {item.quantity}</p>
                                          <p className="text-gray-400 text-xs">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Payment Details */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs text-gray-400 uppercase tracking-wider">Payment Method</label>
                                    <p className="text-white font-medium capitalize">{order.payment_method || 'Unknown'}</p>
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-400 uppercase tracking-wider">Transaction ID</label>
                                    <p className="text-white font-mono text-sm">{order.transaction_id || 'N/A'}</p>
                                  </div>
                                  {order.tracking_number && (
                                    <div className="col-span-2">
                                      <label className="text-xs text-gray-400 uppercase tracking-wider">Tracking Number</label>
                                      <p className="text-white font-mono text-sm">{order.tracking_number}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Events/Timeline */}
                                {(order.events || []).length > 0 && (
                                  <div>
                                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Order Events</h4>
                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                      {(order.events || []).map((event, idx) => (
                                        <div key={idx} className="text-xs flex justify-between">
                                          <span className="text-gray-400">
                                            {new Date(event.timestamp).toLocaleString()}
                                          </span>
                                          <span className="text-white">{event.message}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Results Info */}
          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Status Badge Component
function StatusBadge({ status }) {
  const colors = {
    paid: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Paid' },
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
    failed: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Failed' },
    refunded: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Refunded' },
  };
  const color = colors[status] || colors.pending;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color.bg} ${color.text}`}>
      {color.label}
    </span>
  );
}

// Fulfillment Badge Component
function FulfillmentBadge({ status }) {
  const colors = {
    unfulfilled: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Unfulfilled' },
    fulfilled: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Fulfilled' },
    partially_fulfilled: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Partial' },
  };
  const color = colors[status] || colors.unfulfilled;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color.bg} ${color.text}`}>
      {color.label}
    </span>
  );
}

// Stat Card Component
function StatCard({ label, value, color }) {
  return (
    <div className="glass-mid rounded-lg p-4 border border-gray-700">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

// CSV Export Function
function exportToCSV(orders) {
  const headers = ['Order ID', 'Customer Email', 'Items', 'Total Amount', 'Payment Status', 'Fulfillment Status', 'Date'];
  const rows = orders.map(o => [
    o.id,
    o.user_email,
    o.line_items?.length || 0,
    o.total_amount,
    o.payment_status,
    o.fulfillment_status,
    new Date(o.created_date).toLocaleDateString(),
  ]);

  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}