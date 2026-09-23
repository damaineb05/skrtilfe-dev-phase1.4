/**
 * useWearableOwnership — the frontend read of the AssetOwnership ledger.
 *
 * Returns the set of Wearable ids the authenticated user owns (source: any).
 * Used by the DripSync closet to classify catalog items as OWNED vs LOCKED.
 *
 * This hook is READ-ONLY. It never grants ownership — the signed Stripe webhook
 * is the sole authority (see base44/shared/entitlementService.js). The browser
 * cannot create AssetOwnership (RLS: create = admin only).
 */
import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export function useWearableOwnership() {
  const { user } = useAuth();
  const [ownedIds, setOwnedIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user?.id) { setOwnedIds(new Set()); setLoading(false); return; }
    try {
      setLoading(true);
      const records = await base44.entities.AssetOwnership.filter({ user_id: user.id });
      const ids = new Set((records || []).map((o) => String(o.wearable_id)).filter(Boolean));
      setOwnedIds(ids);
    } catch (e) {
      console.warn('[useWearableOwnership] failed to load ownership:', e);
      setOwnedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { refresh(); }, [refresh]);

  const isOwned = useCallback((wearableId) => ownedIds.has(String(wearableId)), [ownedIds]);

  return { ownedIds, isOwned, loading, refresh };
}