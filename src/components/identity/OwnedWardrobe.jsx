import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shirt, ShoppingBag, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useWearableOwnership } from '@/hooks/useWearableOwnership';

// OwnedWardrobe — surfaces REAL AssetOwnership only.
// No fake ownership, no fabricated counts. Empty state is honest and points
// to the Shop. Ownership is read from the authoritative AssetOwnership ledger
// (the signed Stripe webhook is the sole writer — see entitlementService.js).
export default function OwnedWardrobe() {
  const { isOwned, loading: ownershipLoading } = useWearableOwnership();
  const [wearables, setWearables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await base44.entities.Wearable.filter({ status: 'active' }, '-created_date', 60);
        if (!cancelled) setWearables(list || []);
      } catch {
        if (!cancelled) setWearables([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const owned = wearables.filter((w) => isOwned(w.id));

  if (loading || ownershipLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-black/30">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-xs">Loading your wardrobe…</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" /> Your Digital Wardrobe
        </p>
        {owned.length > 0 && <span className="text-[10px] font-mono text-black/40">{owned.length} owned</span>}
      </div>

      {owned.length === 0 ? (
        <div className="rounded-2xl border border-[#e8e8e8] p-8 text-center bg-[#fafafa]">
          <Shirt className="w-8 h-8 mx-auto mb-3 text-black/15" />
          <p className="text-sm text-black/50 mb-1">Pieces you own across SKRTLIFE will appear here.</p>
          <p className="text-xs text-black/30 mb-5">Digital twins of physical purchases land in your permanent wardrobe.</p>
          <Link to={createPageUrl('Shop')} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black/80 transition-colors">
            <ShoppingBag className="w-3.5 h-3.5" /> Explore Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {owned.map((w) => (
            <div key={w.id} className="rounded-xl border border-[#e8e8e8] overflow-hidden bg-white">
              <div className="aspect-square bg-[#f5f5f3] flex items-center justify-center">
                {w.thumbnail_url ? (
                  <img src={w.thumbnail_url} alt={w.name} className="w-full h-full object-cover" />
                ) : (
                  <Shirt className="w-7 h-7 text-black/15" />
                )}
              </div>
              <div className="p-2">
                <p className="text-[11px] font-semibold text-black truncate">{w.name}</p>
                <p className="text-[9px] text-black/30 uppercase tracking-wider">{w.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}