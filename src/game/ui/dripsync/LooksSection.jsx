import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Layers } from 'lucide-react';
import { normalizeAvatarConfig } from '@/lib/avatarConfig';
import { Panel, Empty, Spinner, Chip, Thumb, ActionBtn } from './worldDripUI';
import { buildConfigFromLook, applyAvatarConfig } from './worldDripShared';

/** LOOKS — saved Looks (apply if owned/public) + OutfitPresets (read-only display). */
export default function LooksSection({ user, updateUser, onToast }) {
  const [presets, setPresets] = useState(null);
  const [looks, setLooks] = useState(null);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const [p, l] = await Promise.all([
          base44.entities.OutfitPreset.filter({ user_id: user.id }, '-updated_date', 50),
          base44.entities.Look.filter({ user_id: user.id }, '-updated_date', 50),
        ]);
        if (dead) return;
        setPresets(p || []);
        setLooks(l || []);
      } catch {
        if (!dead) { setPresets([]); setLooks([]); }
      }
    })();
    return () => { dead = true; };
  }, [user.id]);

  const cfg = normalizeAvatarConfig(user?.avatar_config) || {};

  const applyLook = async (look) => {
    const readable = look.user_id === user.id || look.created_by_id === user.id || look.is_public;
    if (!readable) { onToast?.({ title: 'Locked', body: 'You can only apply looks you own or public looks.', tone: 'info' }); return; }
    setBusy(look.id);
    try {
      const next = buildConfigFromLook(look, cfg);
      await applyAvatarConfig(next, updateUser);
      onToast?.({ title: 'Look Applied', body: `"${look.name}" synced to your identity.`, tone: 'reward' });
    } catch (e) {
      if (e?.status === 403) {
        const ids = (e.unauthorized_wearable_ids || []).join(', ');
        onToast?.({ title: 'Save Blocked', body: `Item not owned${ids ? `: ${ids}` : '.'}`, tone: 'info' });
      } else {
        onToast?.({ title: 'Apply Failed', body: e?.message || 'Could not apply.', tone: 'info' });
      }
    }
    finally { setBusy(null); }
  };

  if (presets === null || looks === null) return <Spinner label="Loading your looks" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel icon={Sparkles} title="Saved Looks" right={<Chip>{looks.length}</Chip>}>
        {looks.length === 0 ? <Empty inline title="No saved looks" body="Looks you save in DripSync appear here to quick-apply." /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {looks.map(l => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Thumb url={l.thumbnail_url} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name || 'Untitled'}</div>
                  <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{l.is_public ? 'Public' : 'Private'} · {(l.wearables || []).length} pieces</div>
                </div>
                <ActionBtn label={busy === l.id ? '…' : 'Apply'} onClick={() => applyLook(l)} />
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel icon={Layers} title="Outfit Presets" right={<Chip>{presets.length}</Chip>}>
        {presets.length === 0 ? <Empty inline title="No outfit presets" body="Quick-switch presets save in the full DripSync OS." /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {presets.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Thumb url={p.thumbnail_url} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name || 'Preset'}</div>
                  <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{Object.values(p.slots || {}).filter(Boolean).length} slots{p.drip_score ? ` · ${p.drip_score} drip` : ''}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Saved</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}