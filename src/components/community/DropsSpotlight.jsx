import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';

function Countdown({ target }) {
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    const tick = () => setDiff(Math.max(0, new Date(target) - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <span className="font-mono text-[10px] tracking-widest" style={{ color: '#00D4FF' }}>
      {h}h {m}m {s}s
    </span>
  );
}

export default function DropsSpotlight() {
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    base44.entities.Drop.list('-start_at', 3).then(setDrops).catch(() => setDrops([]));
  }, []);

  if (!drops.length) return null;

  return (
    <section className="mb-10">
      <p className="text-[9px] tracking-[0.35em] uppercase font-bold mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Upcoming Drops
      </p>
      <div className="space-y-2">
        {drops.map(drop => {
          const isUpcoming = new Date(drop.start_at) > Date.now();
          const isLive = drop.status === 'live';
          return (
            <div key={drop.id} className="p-3 rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isLive && (
                      <span className="text-[8px] font-bold tracking-[0.2em] uppercase px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,51,102,0.15)', color: '#FF3366' }}>
                        LIVE
                      </span>
                    )}
                    <span className="text-sm font-semibold text-white truncate">{drop.title}</span>
                  </div>
                  {isUpcoming && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
                      <Countdown target={drop.start_at} />
                    </div>
                  )}
                  {drop.description && (
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{drop.description}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Link to="/Shop" className="flex items-center gap-1.5 mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-70" style={{ color: 'rgba(255,255,255,0.35)' }}>
        View all drops <ArrowRight className="w-3 h-3" />
      </Link>
    </section>
  );
}