import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle, Eye, Flag, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-blue-100 text-blue-800',
  listed: 'bg-purple-100 text-purple-800',
  flagged: 'bg-red-100 text-red-800',
};

function ModerationTable({ title, items, onApprove, onReject, onView, renderRow }) {
  if (!items.length) {
    return (
      <Card className="theme-bg-card theme-border">
        <CardHeader><CardTitle className="theme-text">{title}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-center theme-text-secondary py-8">Nothing pending review.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="theme-bg-card theme-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="theme-text flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500" />
            {title}
            <Badge className="bg-red-100 text-red-800 ml-1">{items.length}</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg theme-bg-secondary border theme-border">
              {renderRow(item)}
              <div className="flex items-center gap-2 ml-4 shrink-0">
                {onView && (
                  <Button size="sm" variant="outline" onClick={() => onView(item)}>
                    <Eye className="w-3 h-3" />
                  </Button>
                )}
                {onApprove && (
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => onApprove(item)}>
                    <CheckCircle className="w-3 h-3 mr-1" /> Approve
                  </Button>
                )}
                {onReject && (
                  <Button size="sm" variant="destructive" onClick={() => onReject(item)}>
                    <XCircle className="w-3 h-3 mr-1" /> Reject
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AdminModerationContent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [pendingWearables, setPendingWearables] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);
  const [flaggedUsers, setFlaggedUsers] = useState([]);

  const load = async () => {
    setLoading(true);
    const [posts, wearables, listings, users] = await Promise.all([
      base44.entities.Post.list('-created_date', 50),
      base44.entities.Wearable.filter({ status: 'draft' }),
      base44.entities.Listing.filter({ status: 'active' }),
      base44.entities.User.list('-created_date', 100),
    ]);

    // Posts with no approval = pending
    setPendingPosts(posts.filter(p => !p.approved_at).slice(0, 20));
    setPendingWearables(wearables.slice(0, 20));
    setPendingListings(listings.filter(l => !l.reviewed_at).slice(0, 20));
    // Flag users who joined very recently (last 24h) for review
    const dayAgo = new Date(Date.now() - 86400000).toISOString();
    setFlaggedUsers(users.filter(u => u.created_date > dayAgo).slice(0, 10));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approveWearable = async (item) => {
    await base44.entities.Wearable.update(item.id, { status: 'active' });
    toast({ title: 'Wearable approved', description: item.name });
    load();
  };

  const rejectWearable = async (item) => {
    await base44.entities.Wearable.update(item.id, { status: 'archived' });
    toast({ title: 'Wearable rejected', description: item.name, variant: 'destructive' });
    load();
  };

  const removeListing = async (item) => {
    await base44.entities.Listing.update(item.id, { status: 'cancelled' });
    toast({ title: 'Listing removed', description: `Listing ${item.id.slice(-6)}` });
    load();
  };

  const removePost = async (item) => {
    await base44.entities.Post.delete(item.id);
    toast({ title: 'Post removed', variant: 'destructive' });
    load();
  };

  if (loading) return (
    <AdminLayout currentPage="moderation">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500" />
      </div>
    </AdminLayout>
  );

  const totalPending = pendingPosts.length + pendingWearables.length + pendingListings.length;

  return (
    <AdminLayout currentPage="moderation">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold theme-text">Moderation</h1>
            <p className="theme-text-secondary mt-1">Review content, wearables, and marketplace listings.</p>
          </div>
          <div className="flex items-center gap-3">
            {totalPending > 0 && (
              <Badge className="bg-red-500 text-white text-sm px-3 py-1">
                <AlertTriangle className="w-3 h-3 mr-1 inline" />
                {totalPending} pending
              </Badge>
            )}
            <Button variant="outline" onClick={load}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending Posts', value: pendingPosts.length, color: 'text-yellow-500' },
            { label: 'Pending Wearables', value: pendingWearables.length, color: 'text-purple-500' },
            { label: 'Listings to Review', value: pendingListings.length, color: 'text-blue-500' },
            { label: 'New Users (24h)', value: flaggedUsers.length, color: 'text-green-500' },
          ].map(stat => (
            <Card key={stat.label} className="theme-bg-card theme-border">
              <CardContent className="pt-4">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs theme-text-secondary mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Wearables Review */}
        <ModerationTable
          title="Wearables Pending Approval"
          items={pendingWearables}
          onApprove={approveWearable}
          onReject={rejectWearable}
          renderRow={(item) => (
            <div className="flex-1 min-w-0">
              <p className="font-medium theme-text truncate">{item.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={STATUS_COLORS[item.rarity] || 'bg-gray-100 text-gray-700'}>
                  {item.rarity || 'common'}
                </Badge>
                <span className="text-xs theme-text-secondary">{item.category}</span>
                {item.is_nft && <Badge className="bg-purple-100 text-purple-700">NFT</Badge>}
              </div>
            </div>
          )}
        />

        {/* Marketplace Listings Review */}
        <ModerationTable
          title="Marketplace Listings to Review"
          items={pendingListings}
          onReject={removeListing}
          renderRow={(item) => (
            <div className="flex-1 min-w-0">
              <p className="font-medium theme-text truncate">{item.title || `Listing #${item.id.slice(-6)}`}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-cyan-400">
                  {item.price} {item.currency}
                </span>
                <Badge className={STATUS_COLORS[item.status]}>{item.status}</Badge>
              </div>
            </div>
          )}
        />

        {/* Community Posts Review */}
        <ModerationTable
          title="Community Posts Pending Review"
          items={pendingPosts}
          onReject={removePost}
          renderRow={(item) => (
            <div className="flex-1 min-w-0">
              <p className="theme-text truncate text-sm">{item.content?.slice(0, 80)}...</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs theme-text-secondary">by {item.created_by}</span>
                {item.media_files?.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-700">{item.media_files.length} media</Badge>
                )}
              </div>
            </div>
          )}
        />

        {/* New Users */}
        {flaggedUsers.length > 0 && (
          <Card className="theme-bg-card theme-border">
            <CardHeader>
              <CardTitle className="theme-text flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                New Users (Last 24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {flaggedUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg theme-bg-secondary">
                    <div>
                      <p className="font-medium theme-text">{user.full_name || 'Unnamed'}</p>
                      <p className="text-xs theme-text-secondary">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-100 text-gray-700">{user.role || 'user'}</Badge>
                      <span className="text-xs theme-text-secondary">
                        {new Date(user.created_date).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminModeration() {
  return (
    <AdminProtectedRoute>
      <AdminModerationContent />
    </AdminProtectedRoute>
  );
}