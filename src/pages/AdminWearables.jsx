import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shirt, DollarSign, ArrowLeftRight, Search, RefreshCw, CheckCircle, XCircle, Package } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const RARITY_COLORS = {
  common: 'bg-gray-100 text-gray-700',
  rare: 'bg-blue-100 text-blue-700',
  epic: 'bg-purple-100 text-purple-700',
  legendary: 'bg-yellow-100 text-yellow-800',
};

const TX_STATUS_COLORS = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-700',
};

function AdminWearablesContent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('wearables'); // wearables | transactions | ownership
  const [wearables, setWearables] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [ownerships, setOwnerships] = useState([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const [w, t, o] = await Promise.all([
      base44.entities.Wearable.list('-created_date', 100),
      base44.entities.DigitalTransaction.list('-created_date', 50),
      base44.entities.AssetOwnership.list('-created_date', 50),
    ]);
    setWearables(w);
    setTransactions(t);
    setOwnerships(o);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateWearableStatus = async (id, status) => {
    await base44.entities.Wearable.update(id, { status });
    toast({ title: `Wearable ${status}` });
    load();
  };

  const refundTransaction = async (tx) => {
    await base44.entities.DigitalTransaction.update(tx.id, { status: 'refunded' });
    toast({ title: 'Transaction refunded', description: `TX #${tx.id.slice(-6)}` });
    load();
  };

  const filteredWearables = wearables.filter(w =>
    !search || w.name?.toLowerCase().includes(search.toLowerCase()) || w.category?.includes(search)
  );
  const filteredTx = transactions.filter(tx =>
    !search || tx.buyer_id?.includes(search) || tx.seller_id?.includes(search)
  );

  // Summary stats
  const totalVolume = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + (t.price || 0), 0);
  const platformFees = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + (t.platform_fee || 0), 0);
  const activeWearables = wearables.filter(w => w.status === 'active').length;
  const nftWearables = wearables.filter(w => w.is_nft).length;

  if (loading) return (
    <AdminLayout currentPage="wearables">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout currentPage="wearables">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold theme-text">Digital Assets</h1>
            <p className="theme-text-secondary mt-1">Manage wearables, transactions, and ownership records.</p>
          </div>
          <Button variant="outline" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Volume', value: `$${totalVolume.toFixed(2)}`, icon: DollarSign, color: 'text-green-500' },
            { label: 'Platform Fees', value: `$${platformFees.toFixed(2)}`, icon: DollarSign, color: 'text-cyan-500' },
            { label: 'Active Wearables', value: activeWearables, icon: Shirt, color: 'text-purple-500' },
            { label: 'NFT Wearables', value: nftWearables, icon: Package, color: 'text-yellow-500' },
          ].map(stat => (
            <Card key={stat.label} className="theme-bg-card theme-border">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <p className="text-xs theme-text-secondary mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b theme-border">
          {[
            { key: 'wearables', label: 'Wearables', icon: Shirt },
            { key: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
            { key: 'ownership', label: 'Ownership Records', icon: Package },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent theme-text-secondary hover:theme-text'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-secondary" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 theme-bg-secondary theme-border theme-text"
          />
        </div>

        {/* Wearables Tab */}
        {tab === 'wearables' && (
          <Card className="theme-bg-card theme-border">
            <CardContent className="pt-4">
              <div className="space-y-3">
                {filteredWearables.map(w => (
                  <div key={w.id} className="flex items-center justify-between p-3 rounded-lg theme-bg-secondary border theme-border">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium theme-text truncate">{w.name}</p>
                        {w.is_nft && <Badge className="bg-yellow-100 text-yellow-700 text-xs">NFT</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={RARITY_COLORS[w.rarity] || 'bg-gray-100 text-gray-700'}>
                          {w.rarity || 'common'}
                        </Badge>
                        <span className="text-xs theme-text-secondary">{w.category}</span>
                        {w.price && (
                          <span className="text-xs font-bold text-cyan-400">${w.price} {w.currency || 'USD'}</span>
                        )}
                        <span className="text-xs theme-text-secondary">
                          {w.current_supply || 0}/{w.max_supply || '∞'} minted
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge className={
                        w.status === 'active' ? 'bg-green-100 text-green-800' :
                        w.status === 'archived' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {w.status}
                      </Badge>
                      {w.status !== 'active' && (
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => updateWearableStatus(w.id, 'active')}>
                          <CheckCircle className="w-3 h-3 mr-1" /> Activate
                        </Button>
                      )}
                      {w.status === 'active' && (
                        <Button size="sm" variant="destructive"
                          onClick={() => updateWearableStatus(w.id, 'archived')}>
                          <XCircle className="w-3 h-3 mr-1" /> Archive
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredWearables.length === 0 && (
                  <p className="text-center theme-text-secondary py-8">No wearables found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions Tab */}
        {tab === 'transactions' && (
          <Card className="theme-bg-card theme-border">
            <CardContent className="pt-4">
              <div className="space-y-3">
                {filteredTx.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg theme-bg-secondary border theme-border">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs theme-text-secondary">#{tx.id.slice(-8)}</p>
                        <Badge className={TX_STATUS_COLORS[tx.status] || 'bg-gray-100 text-gray-700'}>
                          {tx.status}
                        </Badge>
                        {tx.tx_hash && <Badge className="bg-purple-100 text-purple-700 text-xs">On-chain</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-bold text-green-400">{tx.price} {tx.currency}</span>
                        {tx.platform_fee > 0 && (
                          <span className="text-xs theme-text-secondary">Fee: {tx.platform_fee}</span>
                        )}
                        {tx.creator_royalty > 0 && (
                          <span className="text-xs theme-text-secondary">Royalty: {tx.creator_royalty}</span>
                        )}
                        <span className="text-xs theme-text-secondary">{tx.payment_method}</span>
                      </div>
                    </div>
                    {tx.status === 'completed' && (
                      <Button size="sm" variant="outline" onClick={() => refundTransaction(tx)}>
                        Refund
                      </Button>
                    )}
                  </div>
                ))}
                {filteredTx.length === 0 && (
                  <p className="text-center theme-text-secondary py-8">No transactions found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ownership Records Tab */}
        {tab === 'ownership' && (
          <Card className="theme-bg-card theme-border">
            <CardContent className="pt-4">
              <div className="space-y-3">
                {ownerships.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-lg theme-bg-secondary border theme-border">
                    <div>
                      <p className="text-xs font-mono theme-text-secondary">User: {o.user_id?.slice(-8)}</p>
                      <p className="text-xs font-mono theme-text-secondary">Wearable: {o.wearable_id?.slice(-8)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-blue-100 text-blue-700">{o.source}</Badge>
                        <span className="text-xs theme-text-secondary">x{o.quantity}</span>
                        {o.is_equipped && <Badge className="bg-green-100 text-green-700">Equipped</Badge>}
                        {o.token_id && <Badge className="bg-yellow-100 text-yellow-700">NFT #{o.token_id}</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs theme-text-secondary">
                        {o.wear_count || 0} wears
                      </p>
                      <p className="text-xs theme-text-secondary">
                        {o.acquired_at ? new Date(o.acquired_at).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                ))}
                {ownerships.length === 0 && (
                  <p className="text-center theme-text-secondary py-8">No ownership records yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminWearables() {
  return (
    <AdminProtectedRoute>
      <AdminWearablesContent />
    </AdminProtectedRoute>
  );
}