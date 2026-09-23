import React from 'react';
import { CheckCircle2, ExternalLink } from 'lucide-react';

const CREATORS = [
  { name: 'SKRTLIFE Studio', handle: '@skrtlife', bio: 'Official drops & collab reveals.', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop', verified: true, tags: ['drops', 'fashion'] },
  { name: 'Zara Nights', handle: '@zaranights', bio: '3D wearables & digital couture.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', verified: true, tags: ['wearables', 'art'] },
  { name: 'MOD_X', handle: '@modx', bio: 'Avatar culture & avant-garde sets.', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop', verified: false, tags: ['avatar', 'culture'] },
];

export default function FeaturedCreators() {
  return (
    <section className="mb-10">
      <p className="text-[9px] tracking-[0.35em] uppercase font-bold mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Featured Creators
      </p>
      <div className="space-y-3">
        {CREATORS.map(c => (
          <div key={c.handle} className="flex items-start gap-3 p-3 rounded-lg transition-colors" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white truncate">{c.name}</span>
                {c.verified && <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: '#00D4FF' }} />}
              </div>
              <p className="text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{c.handle}</p>
              <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>{c.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}