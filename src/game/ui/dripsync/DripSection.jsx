import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Shirt, Package } from 'lucide-react';
import { normalizeAvatarConfig } from '@/lib/avatarConfig';
import { Panel, Empty, Spinner, Chip, Thumb, ActionBtn } from './worldDripUI';
import { buildConfigFromLook, buildWearableEntry, addWearableToConfig, applyAvatarConfig } from './worldDripShared';

/** DRIP — owned saved looks (apply) + readable Wearable catalog (equip if owned, else preview). */
export default function DripSection({ user, updateUser, onToast }) {
  const [assets, setAssets] = useState(null);
  const [wearables, setWearables] = useState(null);
  const [ownedIds, setOwnedIds] = useState(new Set());
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const [a, w, o] = await Promise.all([
          base44.entities.DripSyncAsset.filter({ user_id: user.id }, '-updated_date', 50),
          base44.entities.Wearable.list('-created_date', 60),
          base44.entities.AssetOwnership.filter({ user_id: user.id }, '-created_date', 100),
        ]);
        if (dead) return;
        setAssets(a || []);
        setWearables((w || []).filter(x => x.status === 'active'));
        setOwnedIds(new Set((o || []).map(x => x.wearable_id)));
      } catch {
        if (!dead) { setAssets([]); setWearables([]); }
      }
    })();
    return () => { dead = true; };
  }, [user.id]);

  const cfg = normalizeAvatarConfig(user?.avatar_config) || {};

  const _handleSaveError = (e, fallbackTitle) => {
    if (e?.status === 403) {
      const ids = (e.unauthorized_wearable_ids || []).join(', ');
      onToast?.({ title: 'Save Blocked', body: `Item not owned${ids ? `: ${ids}` : '.'}`, tone: 'info' });
    } else {
      onToast?.({ title: fallbackTitle, body: e?.message || 'Could not save.', tone: 'info' });
    }
  };

  const applyAsset = async (asset) => {
    if (asset.user_id !== user.id) { onToast?.({ title: 'DripSync', body: 'Only your own saved assets can be applied.', tone: 'info' }); return; }
    if (asset.type !== 'avatar' && asset.type !== 'look') { onToast?.({ title: 'Preview Only', body: 'Outfits & scenes apply in the full DripSync OS.', tone: 'info' }); return; }
    setBusy(asset.id);
    try {
      const next = buildConfigFromLook(asset, cfg);
      await applyAvatarConfig(next, updateUser);
      onToast?.({ title: 'Look Applied', body: `"${asset.name}" synced to your identity.`, tone: 'reward' });
    } catch (e) { _handleSaveError(e, 'Apply Failed'); }
    finally { setBusy(null); }
  };

  const equipWearable = async (w) => {
    if (!ownedIds.has(w.id)) { onToast?.({ title: 'Preview Only', body: "You don't own this piece — unlock it to equip.", tone: 'info' }); return; }
    setBusy(w.id);
    try {
      const entry = buildWearableEntry(w); // { source:'catalog', wearable_id, slot, bone }
      const next = addWearableToConfig(cfg, entry);
      await applyAvatarConfig(next, updateUser);
      onToast?.({ title: 'Equipped', body: `${w.name} added to your ${entry.slot} slot.`, tone: 'reward' });
    } catch (e) { _handleSaveError(e, 'Equip Failed'); }
    finally { setBusy(null); }
  };

  if (assets === null || wearables === null) return <Spinner label="Loading your drip" />;

  const applyable = (assets || []).filter(a => a.type === 'avatar' || a.type === 'look');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel icon={Shirt} title="Your Saved Looks" right={<Chip>{applyable.length}</Chip>}>
        {applyable.length === 0 ? <Empty inline title="No saved looks" body="Save a look in the full DripSync OS to apply it here." /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {applyable.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Thumb url={a.thumbnailUrl} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name || 'Untitled'}</div>
                  <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{a.type} · {(a.wearables || a.metadata?.wearables || []).length} pieces</div>
                </div>
                <ActionBtn label={busy === a.id ? '…' : 'Apply'} onClick={() => applyAsset(a)} />
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel icon={Package} title="Wearable Catalog" right={<Chip>{wearables.length}</Chip>}>
        {wearables.length === 0 ? <Empty inline title="Catalog empty" body="Wearables appear here once published." /> : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {wearables.map(w => {
              const owned = ownedIds.has(w.id);
              return (
                <div key={w.id} style={{ padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Thumb url={w.thumbnail_url} big />
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: '#fff', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: owned ? 'rgba(0,212,255,0.85)' : 'rgba(255,255,255,0.35)' }}>{owned ? 'Owned' : 'Locked'}</span>
                    <ActionBtn small label={busy === w.id ? '…' : 'Equip'} disabled={!owned} onClick={() => equipWearable(w)} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}