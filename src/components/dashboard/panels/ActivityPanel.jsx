import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Activity, Radio } from 'lucide-react';

function timeAgo(dateString) {
  if (!dateString) return 'just now';
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export default function ActivityPanel() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Post.list('-created_date', 8)
      .then(posts => setActivities(posts.map(p => ({
        id: p.id,
        user: p.created_by?.split('@')[0] || 'User',
        action: 'created a post',
        time: timeAgo(p.created_date),
      }))))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} /></div>;
  }

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-mono tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>"LIVE FEED"</p>
        <Radio className="w-4 h-4 text-red-400 animate-pulse" />
      </div>

      {activities.map(a => (
        <div key={a.id} className="flex items-start gap-3">
          <div className="w-7 h-7 flex items-center justify-center shrink-0"
            style={{ borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-[10px] font-bold text-white">{a.user.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <span className="font-semibold text-white">{a.user}</span> {a.action}
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{a.time} ago</p>
          </div>
        </div>
      ))}

      {activities.length === 0 && (
        <div className="text-center py-8">
          <Activity className="w-10 h-10 mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.1)' }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No recent activity</p>
        </div>
      )}
    </div>
  );
}