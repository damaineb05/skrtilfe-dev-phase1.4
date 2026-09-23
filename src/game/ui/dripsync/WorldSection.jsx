import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Globe, MapPin, Zap } from 'lucide-react';
import { Panel, Spinner } from './worldDripUI';

/** WORLD — read-only session/position/progression, sourced locally. */
export default function WorldSection({ user, ctxRef }) {
  const [pos, setPos] = useState({ x: 0, y: 0, z: 0 });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      const p = ctxRef.current?.player?.position;
      if (p) setPos({ x: p.x, y: p.y, z: p.z });
    }, 250);
    return () => clearInterval(id);
  }, [ctxRef]);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const list = await base44.entities.PlayerProfile.filter({ user_id: user.id }, '-updated_date', 1);
        if (!dead) setProfile(list[0] || null);
      } catch { /* ignore — read stays empty */ }
      finally { if (!dead) setLoading(false); }
    })();
    return () => { dead = true; };
  }, [user.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel icon={Globe} title="Session">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Stat label="Zone" value="Block 001" />
          <Stat label="Resident" value={user?.full_name || 'Resident'} />
        </div>
      </Panel>

      <Panel icon={MapPin} title="Position">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <Stat label="X" value={pos.x.toFixed(1)} mono />
          <Stat label="Y" value={pos.y.toFixed(1)} mono />
          <Stat label="Z" value={pos.z.toFixed(1)} mono />
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Preserved while DripSync is open</div>
      </Panel>

      {loading ? <Spinner label="Loading profile" /> : (
        <Panel icon={Zap} title="Progression">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Stat label="Level" value={profile?.level || 1} />
            <Stat label="XP" value={profile?.xp || 0} />
            <Stat label="Rep" value={profile?.reputation || 0} />
          </div>
        </Panel>
      )}
    </div>
  );
}

function Stat({ label, value, mono }) {
  return (
    <div style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginTop: 3, fontVariantNumeric: mono ? 'tabular-nums' : undefined, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}