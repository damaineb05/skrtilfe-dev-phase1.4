import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  DollarSign, Users, ShoppingCart, TrendingUp, TrendingDown, RefreshCw,
  Shirt, Zap, Repeat, Heart, Eye, Layers, Crown, BarChart3, Activity,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────────────────────

function bucketByDay(items, dateField, days) {
  const now = Date.now();
  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    buckets[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
  }
  const cutoff = now - days * 86400000;
  items.forEach(item => {
    const t = new Date(item[dateField]).getTime();
    if (t < cutoff) return;
    const key = new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (key in buckets) buckets[key]++;
  });
  return Object.entries(buckets).map(([date, count]) => ({ date, count }));
}

function bucketRevByDay(orders, days) {
  const now = Date.now();
  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    buckets[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
  }
  const cutoff = now - days * 86400000;
  orders.forEach(o => {
    const t = new Date(o.created_date).getTime();
    if (t < cutoff) return;
    const key = new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (key in buckets) buckets[key] += o.total_amount || 0;
  });
  return Object.entries(buckets).map(([date, revenue]) => ({ date, revenue: +revenue.toFixed(2) }));
}

const COLORS = ['#00D4FF', '#FF3366', '#FFD700', '#a855f7', '#22c55e', '#f97316'];

function KpiCard({ title, value, sub, change, icon: Icon, color = 'text-cyan-400' }) {
  const up = change >= 0;
  return (
    <Card className="theme-bg-card theme-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs theme-text-secondary uppercase tracking-wider mb-1">{title}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            {sub && <p className="text-xs theme-text-secondary mt-1">{sub}</p>}
          </div>
          <div className="p-2 rounded-xl" style={{ background: 'rgba(0,212,255,0.1)' }}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${up ? 'text-green-400' : 'text-red-400'}`}>
            {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}% vs prev period
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const CHART_STYLE = {
  background: 'transparent',
  fontFamily: 'Inter, sans-serif',
  fontSize: 11,
};

// ── main ───────────────────────────────────────────────────────────────────────

function AdminAnalyticsContent() {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);

  const load = async (d) => {
    setLoading(true);
    const cutoff = new Date(Date.now() - d * 86400000).toISOString();
    const prevCutoff = new Date(Date.now() - d * 2 * 86400000).toISOString();

    const [orders, users, posts, wearables, looks, txs, ownerships] = await Promise.all([
      base44.entities.Order.list('-created_date', 500),
      base44.entities.User.list('-created_date', 500),
      base44.entities.Post.list('-created_date', 500),
      base44.entities.Wearable.list('-wear_count', 50),
      base44.entities.Look.list('-created_date', 200),
      base44.entities.DigitalTransaction.list('-created_date', 200),
      base44.entities.AssetOwnership.list('-created_date', 200),
    ]);

    // Period slicing
    const curOrders = orders.filter(o => o.created_date >= cutoff);
    const prevOrders = orders.filter(o => o.created_date >= prevCutoff && o.created_date < cutoff);
    const curUsers = users.filter(u => u.created_date >= cutoff);
    const prevUsers = users.filter(u => u.created_date >= prevCutoff && u.created_date < cutoff);
    const curPosts = posts.filter(p => p.created_date >= cutoff);
    const curLooks = looks.filter(l => l.created_date >= cutoff);
    const prevLooks = looks.filter(l => l.created_date >= prevCutoff && l.created_date < cutoff);
    const curTxs = txs.filter(t => t.created_date >= cutoff && t.status === 'completed');
    const prevTxs = txs.filter(t => t.created_date >= prevCutoff && t.created_date < cutoff && t.status === 'completed');

    // Revenue
    const revenue = curOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const prevRevenue = prevOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const revenueChange = prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

    const aov = curOrders.length ? revenue / curOrders.length : 0;
    const prevAov = prevOrders.length ? prevRevenue / prevOrders.length : 0;
    const aovChange = prevAov ? ((aov - prevAov) / prevAov) * 100 : 0;

    const paidOrders = curOrders.filter(o => o.payment_status === 'paid').length;
    const orderChange = prevOrders.length ? ((curOrders.length - prevOrders.length) / prevOrders.length) * 100 : 0;

    const userChange = prevUsers.length ? ((curUsers.length - prevUsers.length) / prevUsers.length) * 100 : 0;

    // Digital marketplace
    const digitalVolume = curTxs.reduce((s, t) => s + (t.price || 0), 0);
    const prevDigitalVolume = prevTxs.reduce((s, t) => s + (t.price || 0), 0);
    const digitalChange = prevDigitalVolume ? ((digitalVolume - prevDigitalVolume) / prevDigitalVolume) * 100 : 0;
    const platformFees = curTxs.reduce((s, t) => s + (t.platform_fee || 0), 0);

    // Addiction loop signals
    const totalWearCount = wearables.reduce((s, w) => s + (w.wear_count || 0), 0);
    const equippedCount = ownerships.filter(o => o.is_equipped).length;
    const totalEngagement = posts.reduce((s, p) => s + (p.likes_count || 0) + (p.comments_count || 0), 0);
    const avgEngagement = posts.length ? (totalEngagement / posts.length).toFixed(1) : 0;

    // Look save rate (looks / users)
    const lookSaveRate = curUsers.length ? ((curLooks.length / Math.max(curUsers.length, 1)) * 100).toFixed(1) : 0;
    const lookChange = prevLooks.length ? ((curLooks.length - prevLooks.length) / prevLooks.length) * 100 : 0;

    // Charts
    const revenueChart = bucketRevByDay(orders, d);
    const userChart = bucketByDay(users, 'created_date', d);
    const ordersChart = bucketByDay(orders, 'created_date', d);
    const looksChart = bucketByDay(looks, 'created_date', d);

    // Top wearables
    const topWearables = [...wearables].sort((a, b) => (b.wear_count || 0) - (a.wear_count || 0)).slice(0, 6);

    // Category breakdown (wearables)
    const catMap = {};
    wearables.forEach(w => { catMap[w.category] = (catMap[w.category] || 0) + 1; });
    const categoryBreakdown = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    // Rarity breakdown (ownerships)
    const rarityMap = {};
    ownerships.forEach(o => {
      const w = wearables.find(w => w.id === o.wearable_id);
      const r = w?.rarity || 'common';
      rarityMap[r] = (rarityMap[r] || 0) + 1;
    });
    const rarityBreakdown = Object.entries(rarityMap).map(([name, value]) => ({ name, value }));

    // Order status breakdown
    const statusMap = {};
    orders.forEach(o => { statusMap[o.payment_status] = (statusMap[o.payment_status] || 0) + 1; });
    const orderStatusBreakdown = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    setData({
      revenue, revenueChange, aov, aovChange,
      orders: curOrders.length, paidOrders, orderChange,
      users: curUsers.length, userChange,
      digitalVolume, digitalChange, platformFees,
      totalWearCount, equippedCount,
      avgEngagement, totalEngagement,
      lookSaveRate, lookChange, curLooks: curLooks.length,
      revenueChart, userChart, ordersChart, looksChart,
      topWearables, categoryBreakdown, rarityBreakdown, orderStatusBreakdown,
      totalUsers: users.length, totalWearables: wearables.length,
      totalLooks: looks.length, totalOwnerships: ownerships.length,
    });
    setLoading(false);
  };

  useEffect(() => { load(days); }, [days]);

  if (loading || !data) return (
    <AdminLayout currentPage="analytics">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
      </div>
    </AdminLayout>
  );

  const tooltipStyle = { backgroundColor: '#1a1a28', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 8 };

  return (
    <AdminLayout currentPage="analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold theme-text">Analytics</h1>
            <p className="theme-text-secondary mt-1">Real-time platform performance — addiction loop + revenue.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={String(days)} onValueChange={v => setDays(Number(v))}>
              <SelectTrigger className="w-36 theme-bg-secondary theme-border theme-text">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => load(days)}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="revenue">
          <TabsList className="theme-bg-secondary border theme-border">
            <TabsTrigger value="revenue"><DollarSign className="w-4 h-4 mr-1" />Revenue</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-1" />Users</TabsTrigger>
            <TabsTrigger value="addiction"><Zap className="w-4 h-4 mr-1" />Addiction Loop</TabsTrigger>
            <TabsTrigger value="digital"><Layers className="w-4 h-4 mr-1" />Digital Assets</TabsTrigger>
          </TabsList>

          {/* ── REVENUE TAB ── */}
          <TabsContent value="revenue" className="space-y-6 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard title="Revenue" value={`$${data.revenue.toFixed(2)}`} change={data.revenueChange} icon={DollarSign} color="text-green-400" sub={`${data.orders} orders`} />
              <KpiCard title="Avg Order Value" value={`$${data.aov.toFixed(2)}`} change={data.aovChange} icon={TrendingUp} color="text-cyan-400" />
              <KpiCard title="Paid Orders" value={data.paidOrders} change={data.orderChange} icon={ShoppingCart} color="text-purple-400" sub={`of ${data.orders} total`} />
              <KpiCard title="Digital Volume" value={`$${data.digitalVolume.toFixed(2)}`} change={data.digitalChange} icon={Repeat} color="text-yellow-400" sub={`$${data.platformFees.toFixed(2)} fees`} />
            </div>

            {/* Revenue area chart */}
            <Card className="theme-bg-card theme-border">
              <CardHeader><CardTitle className="theme-text text-sm uppercase tracking-wider">Revenue Over Time</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={data.revenueChart} style={CHART_STYLE}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#revGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Orders bar + status pie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="theme-bg-card theme-border">
                <CardHeader><CardTitle className="theme-text text-sm uppercase tracking-wider">Orders Per Day</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.ordersChart} style={CHART_STYLE}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" fill="#00D4FF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="theme-bg-card theme-border">
                <CardHeader><CardTitle className="theme-text text-sm uppercase tracking-wider">Order Status Breakdown</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={data.orderStatusBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {data.orderStatusBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend formatter={v => <span style={{ color: '#aaa', fontSize: 11 }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── USERS TAB ── */}
          <TabsContent value="users" className="space-y-6 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard title="New Users" value={data.users} change={data.userChange} icon={Users} color="text-purple-400" sub={`${data.totalUsers} total`} />
              <KpiCard title="Community Posts" value={data.totalEngagement} icon={Heart} color="text-pink-400" sub={`${data.avgEngagement} avg engagement`} />
              <KpiCard title="Looks Saved" value={data.curLooks} change={data.lookChange} icon={Layers} color="text-cyan-400" sub={`${data.totalLooks} all time`} />
              <KpiCard title="Look Save Rate" value={`${data.lookSaveRate}%`} icon={Activity} color="text-yellow-400" sub="looks per new user" />
            </div>

            <Card className="theme-bg-card theme-border">
              <CardHeader><CardTitle className="theme-text text-sm uppercase tracking-wider">New User Signups</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={data.userChart} style={CHART_STYLE}>
                    <defs>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="count" stroke="#a855f7" fill="url(#userGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ADDICTION LOOP TAB ── */}
          <TabsContent value="addiction" className="space-y-6 mt-4">
            <div className="p-4 rounded-xl border" style={{ background: 'rgba(0,212,255,0.05)', borderColor: 'rgba(0,212,255,0.2)' }}>
              <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">Addiction Loop Health</p>
              <p className="text-sm text-gray-400">Measures: Create Identity → Equip Wearables → Share Looks → Repeat</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard title="Total Wearable Wears" value={data.totalWearCount.toLocaleString()} icon={Shirt} color="text-cyan-400" sub="across all users" />
              <KpiCard title="Currently Equipped" value={data.equippedCount} icon={Zap} color="text-yellow-400" sub="active outfit items" />
              <KpiCard title="Looks Created" value={data.curLooks} change={data.lookChange} icon={Layers} color="text-pink-400" />
              <KpiCard title="Avg Post Engagement" value={data.avgEngagement} icon={Heart} color="text-red-400" sub={`${data.totalEngagement} total`} />
            </div>

            {/* Looks over time */}
            <Card className="theme-bg-card theme-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="theme-text text-sm uppercase tracking-wider">Looks Saved Over Time</CardTitle>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                    Key Retention Signal
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={data.looksChart} style={CHART_STYLE}>
                    <defs>
                      <linearGradient id="looksGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF3366" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF3366" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="count" stroke="#FF3366" fill="url(#looksGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top wearables by wear count */}
            <Card className="theme-bg-card theme-border">
              <CardHeader>
                <CardTitle className="theme-text text-sm uppercase tracking-wider">Top Wearables by Wear Count</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.topWearables.map(w => ({ name: w.name?.slice(0, 14) || '—', wears: w.wear_count || 0 }))} layout="vertical" style={CHART_STYLE}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fill: '#888', fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#aaa', fontSize: 10 }} width={90} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="wears" fill="#00D4FF" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Funnel summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { step: '1. Sign Up', value: data.totalUsers, color: '#a855f7', label: 'Total registered users' },
                { step: '2. Own a Wearable', value: data.totalOwnerships, color: '#00D4FF', label: 'Unique ownership records' },
                { step: '3. Save a Look', value: data.totalLooks, color: '#FF3366', label: 'Looks saved all-time' },
              ].map(f => (
                <Card key={f.step} className="theme-bg-card theme-border">
                  <CardContent className="p-4">
                    <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: f.color }}>{f.step}</p>
                    <p className="text-3xl font-black theme-text">{f.value.toLocaleString()}</p>
                    <p className="text-xs theme-text-secondary mt-1">{f.label}</p>
                    {f.step !== '1. Sign Up' && (
                      <p className="text-xs mt-2 font-semibold" style={{ color: f.color }}>
                        {data.totalUsers > 0 ? ((f.value / data.totalUsers) * 100).toFixed(1) : 0}% conversion
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── DIGITAL ASSETS TAB ── */}
          <TabsContent value="digital" className="space-y-6 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard title="Total Wearables" value={data.totalWearables} icon={Shirt} color="text-cyan-400" />
              <KpiCard title="Ownership Records" value={data.totalOwnerships} icon={Crown} color="text-yellow-400" />
              <KpiCard title="Digital Sales Vol." value={`$${data.digitalVolume.toFixed(2)}`} change={data.digitalChange} icon={DollarSign} color="text-green-400" />
              <KpiCard title="Platform Fees" value={`$${data.platformFees.toFixed(2)}`} icon={BarChart3} color="text-purple-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="theme-bg-card theme-border">
                <CardHeader><CardTitle className="theme-text text-sm uppercase tracking-wider">Wearable Categories</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={data.categoryBreakdown} cx="50%" cy="50%" outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {data.categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="theme-bg-card theme-border">
                <CardHeader><CardTitle className="theme-text text-sm uppercase tracking-wider">Owned Items by Rarity</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.rarityBreakdown} style={CHART_STYLE}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#aaa', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {data.rarityBreakdown.map((entry, i) => {
                          const c = { common: '#888', rare: '#00D4FF', epic: '#a855f7', legendary: '#FFD700' };
                          return <Cell key={i} fill={c[entry.name] || COLORS[i]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

export default function AdminAnalytics() {
  return (
    <AdminProtectedRoute>
      <AdminAnalyticsContent />
    </AdminProtectedRoute>
  );
}