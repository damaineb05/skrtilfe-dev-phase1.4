import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, MessageCircle, Layers, Eye, Heart } from 'lucide-react';

export default function AnalyticsPanel({ user }) {
  const [stats, setStats] = useState({ totalPosts: 0, totalNFTs: 0, totalViews: 0, engagement: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Post.filter({ created_by: user?.email }),
      base44.entities.NFT.filter({ created_by: user?.email }),
    ]).then(([posts, nfts]) => {
      const totalViews = posts.reduce((sum, p) => sum + (p.likes_count || 0) + (p.comments_count || 0), 0);
      setStats({
        totalPosts: posts.length,
        totalNFTs: nfts.length,
        totalViews,
        engagement: posts.length > 0 ? (totalViews / posts.length).toFixed(1) : 0,
      });
    }).finally(() => setLoading(false));
  }, [user?.email]);

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} /></div>;
  }

  const rows = [
    { label: 'Posts', value: stats.totalPosts, icon: MessageCircle },
    { label: 'NFTs', value: stats.totalNFTs, icon: Layers },
    { label: 'Views', value: stats.totalViews, icon: Eye },
    { label: 'Engagement', value: `${stats.engagement}%`, icon: Heart },
  ];

  return (
    <div className="p-5 space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center justify-between p-3 transition-all"
          style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-2.5">
            <row.icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{row.label}</span>
          </div>
          <span className="text-lg font-black text-white">{row.value}</span>
        </div>
      ))}
      <div className="pt-2">
        <Link to={createPageUrl('Analytics')}>
          <button className="w-full py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'rgba(255,255,255,0.4)' }}>
            Full Analytics →
          </button>
        </Link>
      </div>
    </div>
  );
}