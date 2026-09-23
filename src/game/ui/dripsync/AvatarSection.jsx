import React, { useState } from 'react';
import { User, Shirt, Music, X } from 'lucide-react';
import { normalizeAvatarConfig } from '@/lib/avatarConfig';
import { Panel, Empty, Chip } from './worldDripUI';
import { applyAvatarConfig, removeWearableFromConfig } from './worldDripShared';

/**
 * AVATAR — current DripSync identity + equipped state, with LIVE unequip.
 * Reads the CANONICAL v2 config through the shared normalizer (same path as
 * the full DripSync editor and the World AvatarManager), so what you see here
 * is exactly what the World renders. Each equipped item can be removed
 * in-place — the save flows through saveAvatarProfile (ownership-validated)
 * and the World hot-refreshes the visual without resetting position/camera.
 */
export default function AvatarSection({ user, updateUser, onToast }) {
  const rawCfg = user?.avatar_config || {};
  const cfg = normalizeAvatarConfig(rawCfg) || {};
  const equipped = cfg.equipped || [];
  const anims = cfg.custom_animations || [];
  const gender = cfg.avatar?.gender || 'masculine';
  const source = cfg.avatar?.source || '—';
  const hasAvatar = !!cfg.avatar?.model_url;
  const [busy, setBusy] = useState(null);

  const unequip = async (e) => {
    const key = e.source === 'catalog' ? String(e.wearable_id) : (e.model_url || null);
    if (!key) return;
    setBusy(key);
    try {
      const next = removeWearableFromConfig(cfg, key);
      await applyAvatarConfig(next, updateUser);
      onToast?.({ title: 'Removed', body: `${e.name || e.slot || 'Item'} unequipped.`, tone: 'reward' });
    } catch (err) {
      if (err?.status === 403) {
        const ids = (err.unauthorized_wearable_ids || []).join(', ');
        onToast?.({ title: 'Save Blocked', body: `Item not owned${ids ? `: ${ids}` : '.'}`, tone: 'info' });
      } else {
        onToast?.({ title: 'Unequip Failed', body: err?.message || 'Could not update.', tone: 'info' });
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 84, height: 84, borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {rawCfg.thumbnailUrl
            ? <img src={rawCfg.thumbnailUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <User size={28} color="rgba(255,255,255,0.3)" />}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>SKRTLIFE Identity</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || 'Resident'}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <Chip>{gender}</Chip>
            <Chip>{source}</Chip>
            <Chip>{equipped.length} worn</Chip>
          </div>
        </div>
      </div>

      {!hasAvatar && <Empty title="No DripSync avatar linked" body="Design your avatar in the full DripSync OS — it'll sync here as your in-world identity." />}

      <Panel icon={Shirt} title="Equipped Wearables">
        {equipped.length === 0 ? <Empty inline title="Nothing equipped" body="Your slots are open." /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {equipped.map((e, i) => {
              const key = (e.wearable_id || e.model_url) || i;
              const busyKey = e.source === 'catalog' ? String(e.wearable_id) : (e.model_url || null);
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 12, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name || e.slot || 'item'}</span>
                  <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: e.source === 'catalog' ? 'rgba(0,212,255,0.8)' : 'rgba(168,85,247,0.8)' }}>{e.source}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>{e.slot || '—'}</span>
                    <button
                      onClick={() => unequip(e)}
                      disabled={busy === busyKey}
                      aria-label={`Unequip ${e.name || e.slot || 'item'}`}
                      style={{
                        width: 22, height: 22, borderRadius: 6, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.65)', marginLeft: 4,
                        opacity: busy === busyKey ? 0.4 : 1,
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel icon={Music} title="Loaded Animations">
        {anims.length === 0 ? <Empty inline title="No custom animations" body="Default locomotion active." /> : (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{anims.length} animation{anims.length > 1 ? 's' : ''} loaded</div>
        )}
      </Panel>
    </div>
  );
}