/**
 * OwnedWearablesCloset — the digital wardrobe view inside DripSync.
 *
 * Shows the REAL Wearable catalog classified by entitlement:
 *   DEFAULT  — Wearable.is_default === true   (equippable without ownership)
 *   OWNED    — AssetOwnership exists for the authenticated user
 *   LOCKED   — catalog Wearable with neither (browse/buy in the shop)
 *
 * Equip path: adds a runtime wearable carrying `wearable_id` so the existing
 * persistence pipeline (runtimeWearablesToEquipped → saveAvatarProfile) classifies
 * it as a catalog item and ownership-validates it server-side. No new pipeline.
 *
 * This component is ADDITIVE to the existing closet tab — it does not redesign
 * the closet. It uses existing UI primitives and the existing onAddWearable.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Shirt, Lock, Check, Sparkles, Loader2, ShoppingBag } from 'lucide-react';
import { useWearableOwnership } from '@/hooks/useWearableOwnership';

// Slot → default bone (mirrors ClosetPanel WEARABLE_CATEGORIES)
const BONE_BY_CATEGORY = {
  headwear: 'Head', eyewear: 'Head', facewear: 'Head', earring: 'Head',
  neckwear: 'Neck', top: 'Spine1', outerwear: 'Spine', wristwear: 'LeftHand',
  handwear: 'LeftHand', bottom: 'Hips', footwear: 'LeftFoot', accessory: 'Spine',
  bag: 'Spine', gloves: 'LeftHand', shoes: 'LeftFoot', full_body: 'Hips',
  jewelry: 'Spine',
};

export default function OwnedWearablesCloset({ onAddWearable, user }) {
  const { isOwned, loading: ownershipLoading } = useWearableOwnership();
  const [wearables, setWearables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equippingId, setEquippingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        // Active catalog wearables — the digital items the user can own.
        const list = await base44.entities.Wearable.filter({ status: 'active' }, '-created_date', 60);
        if (!cancelled) setWearables(list || []);
      } catch (e) {
        console.warn('[OwnedWearablesCloset] failed to load catalog:', e);
        if (!cancelled) setWearables([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const classified = useMemo(() => {
    return (wearables || []).map((w) => {
      const isDefault = w.is_default === true;
      const owned = isOwned(w.id);
      const state = isDefault ? 'default' : (owned ? 'owned' : 'locked');
      return { ...w, _state: state };
    });
  }, [wearables, isOwned]);

  const ownedCount = classified.filter((w) => w._state === 'owned').length;
  const defaultCount = classified.filter((w) => w._state === 'default').length;

  const handleEquip = (w) => {
    setEquippingId(w.id);
    const slot = w.category || 'accessory';
    onAddWearable({
      id: w.id,
      wearable_id: w.id, // ← triggers catalog classification + ownership validation on save
      name: w.name,
      url: w.model_url,
      bone: BONE_BY_CATEGORY[slot] || 'Spine',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
      slot,
      category: slot,
    });
    setTimeout(() => setEquippingId(null), 600);
  };

  if (loading || ownershipLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-white/30">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        <span className="text-xs">Loading your digital closet…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-6 px-3 rounded-xl bg-white/[0.02] border border-white/6">
        <Shirt className="w-6 h-6 mx-auto mb-2 text-white/25" />
        <p className="text-xs text-white/40">Sign in to view your digital wardrobe.</p>
      </div>
    );
  }

  if (classified.length === 0) {
    return (
      <div className="text-center py-6 px-3 rounded-xl bg-white/[0.02] border border-white/6">
        <Shirt className="w-6 h-6 mx-auto mb-2 text-white/25" />
        <p className="text-xs text-white/50 mb-3">No digital wearables in the catalog yet.</p>
        <Link to={createPageUrl('Shop')} className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300">
          <ShoppingBag className="w-3 h-3" /> Browse the Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Digital Closet
        </p>
        <div className="flex items-center gap-2 text-[10px]">
          {ownedCount > 0 && <span className="text-cyan-400 font-mono">{ownedCount} owned</span>}
          {defaultCount > 0 && <span className="text-white/40 font-mono">{defaultCount} free</span>}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2">
        {classified.map((w) => {
          const isDefault = w._state === 'default';
          const isOwnedState = w._state === 'owned';
          const isLocked = w._state === 'locked';
          return (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative rounded-xl border overflow-hidden transition-colors ${
                isLocked
                  ? 'bg-white/[0.02] border-white/6'
                  : 'bg-white/[0.04] border-cyan-500/20 hover:border-cyan-500/40'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-square bg-gradient-to-br from-white/[0.04] to-white/[0.01] flex items-center justify-center">
                {w.thumbnail_url ? (
                  <img src={w.thumbnail_url} alt={w.name} className="w-full h-full object-cover" />
                ) : (
                  <Shirt className="w-7 h-7 text-white/20" />
                )}

                {/* State badge */}
                <div className="absolute top-1.5 left-1.5">
                  {isDefault && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10 uppercase tracking-wider">Free</span>
                  )}
                  {isOwnedState && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider flex items-center gap-0.5">
                      <Check className="w-2 h-2" /> Owned
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-black/50 text-white/40 border border-white/10 uppercase tracking-wider flex items-center gap-0.5">
                      <Lock className="w-2 h-2" /> Locked
                    </span>
                  )}
                </div>

                {/* Rarity dot */}
                {w.rarity && (
                  <div className="absolute top-1.5 right-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                      w.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                      w.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                      w.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-white/5 text-white/40'
                    }`}>{w.rarity}</span>
                  </div>
                )}
              </div>

              {/* Info + action */}
              <div className="p-2">
                <p className="text-[11px] font-semibold text-white truncate">{w.name}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1.5">{w.category}</p>

                {isLocked ? (
                  <Link to={createPageUrl('Shop')} className="block">
                    <button className="w-full h-7 rounded-lg text-[10px] font-semibold bg-white/5 border border-white/10 text-white/50 hover:text-cyan-300 hover:border-cyan-500/30 transition-colors flex items-center justify-center gap-1">
                      <ShoppingBag className="w-3 h-3" /> Get it
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={() => handleEquip(w)}
                    disabled={equippingId === w.id}
                    className="w-full h-7 rounded-lg text-[10px] font-bold bg-cyan-500/90 hover:bg-cyan-400 text-black flex items-center justify-center gap-1 transition-colors disabled:opacity-60"
                  >
                    {equippingId === w.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Sparkles className="w-3 h-3" /> Equip</>}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}