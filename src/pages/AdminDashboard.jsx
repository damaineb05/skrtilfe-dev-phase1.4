import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Users, DollarSign, Eye, AlertCircle, Star, Activity, MessageCircle, Layers, Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';

function AdminDashboardContent() {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
    lowStockProducts: [],
    topProducts: [],
    recentUsers: [],
    pendingNFTs: [],
    totalPosts: 0,
    totalNFTs: 0,
    totalViews: 0,
    engagement: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [refreshKey]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load all data in parallel
      const [
        products, 
        orders, 
        users,
        nfts,
        posts
      ] = await Promise.all([
        base44.entities.Product.list('-created_date', 100),
        base44.entities.Order.list('-created_date', 50),
        base44.entities.User.list('-created_date', 20),
        base44.entities.NFT.list('-created_date', 20),
        base44.entities.Post.list('-created_date', 100)
      ]);

      // Calculate metrics
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const activeProducts = products.filter(p => p.status === 'active');
      const lowStockProducts = products.filter(p => p.inventory_qty <= (p.low_stock_threshold || 5));
      const pendingNFTs = nfts.filter(nft => nft.status === 'not_listed');

      // Get recent orders (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentOrders = orders
        .filter(order => new Date(order.created_date) >= weekAgo)
        .slice(0, 5);

      // Calculate top products by recent orders
      const productSales = {};
      recentOrders.forEach(order => {
        order.line_items?.forEach(item => {
          productSales[item.product_id] = (productSales[item.product_id] || 0) + item.quantity;
        });
      });

      const topProducts = products
        .filter(p => productSales[p.id])
        .sort((a, b) => (productSales[b.id] || 0) - (productSales[a.id] || 0))
        .slice(0, 5);

      // Platform Analytics
      const totalViews = posts.reduce((sum, post) => sum + (post.likes_count || 0) + (post.comments_count || 0), 0);
      const totalEngagement = posts.length > 0 ? (totalViews / posts.length).toFixed(1) : 0;

      setDashboardData({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: activeProducts.length,
        totalUsers: users.length,
        recentOrders,
        lowStockProducts,
        topProducts,
        recentUsers: users.slice(0, 5),
        pendingNFTs,
        totalPosts: posts.length,
        totalNFTs: nfts.length,
        totalViews,
        engagement: totalEngagement
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const S = {
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 },
    cardSecondary: { background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '12px 14px' },
    label: { color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600 },
    value: { color: '#fff', fontSize: 28, fontWeight: 800, lineHeight: 1 },
    sub: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 4 },
    sectionTitle: { color: '#fff', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' },
    btnOutline: { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', borderRadius: 6, padding: '6px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer' },
  };

  const kpis = [
    { label: 'Total Revenue', value: `$${dashboardData.totalRevenue.toFixed(2)}`, sub: `From ${dashboardData.totalOrders} orders`, accent: '#00D4FF', icon: DollarSign },
    { label: 'Active Products', value: dashboardData.totalProducts, sub: `${dashboardData.lowStockProducts.length} low stock`, accent: '#FFD700', icon: Package },
    { label: 'Total Users', value: dashboardData.totalUsers, sub: `${dashboardData.recentUsers.length} recent signups`, accent: '#FF3366', icon: Users },
    { label: 'Pending NFTs', value: dashboardData.pendingNFTs.length, sub: 'Awaiting moderation', accent: 'rgba(255,255,255,0.5)', icon: Star },
  ];

  const analytics = [
    { label: 'Community Posts', value: dashboardData.totalPosts, sub: 'Total created', icon: MessageCircle, accent: '#00D4FF' },
    { label: 'NFTs Created', value: dashboardData.totalNFTs, sub: 'Minted on platform', icon: Layers, accent: '#FF3366' },
    { label: 'Total Views', value: dashboardData.totalViews, sub: 'Likes & comments', icon: Eye, accent: '#FFD700' },
    { label: 'Avg Engagement', value: dashboardData.engagement, sub: 'Per post', icon: Heart, accent: 'rgba(255,255,255,0.5)' },
  ];

  if (isLoading) {
    return (
      <AdminLayout currentPage="dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#00D4FF' }} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="dashboard">
      <div className="space-y-6" style={{ color: '#fff' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Overview</p>
            <h1 className="text-2xl font-black uppercase tracking-tight" style={{ letterSpacing: '-0.02em' }}>Dashboard</h1>
          </div>
          <button onClick={handleRefresh} style={S.btnOutline} className="flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={S.card} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <p style={S.label}>{kpi.label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${kpi.accent}15` }}>
                  <kpi.icon className="w-3.5 h-3.5" style={{ color: kpi.accent }} />
                </div>
              </div>
              <div style={S.value}>{kpi.value}</div>
              <p style={S.sub}>{kpi.sub}</p>
              <div className="mt-3 h-px" style={{ background: `linear-gradient(to right, ${kpi.accent}40, transparent)` }} />
            </motion.div>
          ))}
        </div>

        {/* Analytics strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics.map((a, i) => (
            <div key={i} style={S.card} className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.accent}15` }}>
                <a.icon className="w-4 h-4" style={{ color: a.accent }} />
              </div>
              <div>
                <div className="text-lg font-black" style={{ color: '#fff' }}>{a.value}</div>
                <p style={S.label}>{a.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent Orders */}
          <div style={S.card} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p style={S.sectionTitle}>Recent Orders</p>
              <Link to={createPageUrl("AdminOrders")}><button style={S.btnOutline}>View All</button></Link>
            </div>
            <div className="space-y-2">
              {dashboardData.recentOrders.length > 0 ? dashboardData.recentOrders.map(order => (
                <div key={order.id} style={S.cardSecondary} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">#{order.id.slice(-8)}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{order.user_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">${order.total_amount?.toFixed(2)}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                      style={{
                        background: order.payment_status === 'paid' ? 'rgba(34,197,94,0.15)' : order.payment_status === 'pending' ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
                        color: order.payment_status === 'paid' ? '#4ade80' : order.payment_status === 'pending' ? '#fbbf24' : '#f87171'
                      }}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              )) : <p className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No recent orders</p>}
            </div>
          </div>

          {/* Low Stock */}
          <div style={S.card} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" style={{ color: '#FF3366' }} />
                <p style={S.sectionTitle}>Low Stock Alert</p>
              </div>
              <Link to={createPageUrl("AdminInventory")}><button style={S.btnOutline}>Manage</button></Link>
            </div>
            <div className="space-y-2">
              {dashboardData.lowStockProducts.length > 0 ? dashboardData.lowStockProducts.slice(0, 5).map(product => (
                <div key={product.id} style={{ ...S.cardSecondary, background: 'rgba(255,51,102,0.07)' }} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{product.title}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: '#FF3366' }}>{product.inventory_qty} left</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Min: {product.low_stock_threshold || 5}</p>
                  </div>
                </div>
              )) : <p className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>All products well stocked!</p>}
            </div>
          </div>

          {/* Top Products */}
          <div style={S.card} className="p-5">
            <p style={S.sectionTitle} className="mb-4">Top Selling Products</p>
            <div className="space-y-2">
              {dashboardData.topProducts.length > 0 ? dashboardData.topProducts.map((product, index) => (
                <div key={product.id} style={S.cardSecondary} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF' }}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{product.title}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>${product.price}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
                    {product.collection}
                  </span>
                </div>
              )) : <p className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No sales data</p>}
            </div>
          </div>

          {/* Recent Users */}
          <div style={S.card} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p style={S.sectionTitle}>Recent Users</p>
              <Link to={createPageUrl("AdminCustomers")}><button style={S.btnOutline}>View All</button></Link>
            </div>
            <div className="space-y-2">
              {dashboardData.recentUsers.length > 0 ? dashboardData.recentUsers.map(user => (
                <div key={user.id} style={S.cardSecondary} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #FF3366, #00D4FF)' }}>
                    {(user.full_name?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user.full_name || 'Anonymous'}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.email}</p>
                  </div>
                </div>
              )) : <p className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No recent users</p>}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={S.card} className="p-5">
          <p style={S.sectionTitle} className="mb-4">Quick Actions</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Add Product', href: 'AdminProductEdit', icon: Package },
              { label: 'New Collection', href: 'AdminCollectionEdit', icon: Star },
              { label: 'Add Creator', href: 'AdminContent', icon: Users },
              { label: 'Site Settings', href: 'AdminSettings', icon: Eye },
            ].map((action, i) => (
              <Link key={i} to={createPageUrl(action.href)}>
                <button className="w-full flex items-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminDashboard() {
  return (
    <AdminProtectedRoute>
      <AdminDashboardContent />
    </AdminProtectedRoute>
  );
}