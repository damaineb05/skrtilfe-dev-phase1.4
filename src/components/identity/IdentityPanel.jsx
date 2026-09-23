import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Eye, Pencil, Globe, ArrowRight } from 'lucide-react';
import AvatarBustPreview from '@/components/dripsync/AvatarBustPreview';
import { normalizeAvatarConfig } from '@/lib/avatarConfig';
import { getMembershipTier } from '@/lib/membershipAccess';
import OwnedWardrobe from '@/components/identity/OwnedWardrobe';

const TIER_META = {
  genesis: { label: 'Genesis', accent: '#FFD700' },
  dripsync_plus: { label: 'DripSync+', accent: '#00D4FF' },
  free: { label: 'Citizen', accent: 'rgba(255,255,255,0.6)' },
};

// IdentityPanel — the canonical SKRTLIFE identity presentation.
// Reads the SAME authoritative state every other surface uses:
//   - avatar_config (User)  → the DripSync avatar (rendered, not a letter)
//   - getMembershipTier(user) → authoritative tier (server-set flags, never client)
//   - Profile entity         → display name / handle (account metadata only)
// No duplicate avatar state, no invented stats.
export default function IdentityPanel({ user, profile }) {
  const cfg = normalizeAvatarConfig(user?.avatar_config);
  const avatarUrl = cfg?.avatar?.model_url || null;
  const tier = getMembershipTier(user);
  const meta = TIER_META[tier] || TIER_META.free;
  const displayName = profile?.display_name || user?.full_name || 'Member';
  const handle = profile?.username || (user?.email ? user.email.split('@')[0] : '');

  return (
    <div className="max-w-2xl">
      {/* Identity card — a dark "digital self" island on the white account page */}
      <div className="relative overflow-hidden rounded-2xl" style={{ background: '#0A0A0F', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="grid md:grid-cols-[260px_1fr]">
          {/* Avatar bust — the canonical DripSync avatar, actually rendered */}
          <div className="relative h-[300px] md:h-[360px]" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(0,212,255,0.08), transparent 60%)' }}>
            {avatarUrl ? (
              <AvatarBustPreview avatarUrl={avatarUrl} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white/70" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.5), rgba(0,212,255,0.35))' }}>
                  {displayName?.[0]?.toUpperCase() || 'S'}
                </div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">No avatar yet</p>
                <Link to={createPageUrl('DripSync')} className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black bg-white">
                  Create <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Identity info */}
          <div className="p-6 md:p-8 flex flex-col justify-center gap-4 text-white">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1">SKRTLIFE Identity</p>
              <h2 className="text-2xl font-black tracking-tight">{displayName}</h2>
              {handle && <p className="text-xs text-white/50 mt-0.5 font-mono">@{handle}</p>}
              {user?.email && <p className="text-[11px] text-white/30 mt-1">{user.email}</p>}
            </div>

            {/* Authoritative tier badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 self-start rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${meta.accent}` }}>
              <Sparkles className="w-3 h-3" style={{ color: meta.accent }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: meta.accent }}>{meta.label}</span>
            </div>

            {/* Primary identity actions — all reference the canonical avatar_config */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <Link to={createPageUrl('DripSync')} className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-white/5 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <Eye className="w-4 h-4 text-white/70" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/70 text-center">View Avatar</span>
              </Link>
              <Link to={createPageUrl('DripSync')} className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-white/5 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <Pencil className="w-4 h-4 text-white/70" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/70 text-center">Edit Drip</span>
              </Link>
              <Link to={createPageUrl('World')} className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-white/5 transition-colors" style={{ border: '1px solid rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.06)' }}>
                <Globe className="w-4 h-4" style={{ color: '#00D4FF' }} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-center" style={{ color: '#00D4FF' }}>Enter World</span>
              </Link>
            </div>
            <p className="text-[10px] text-white/30 leading-relaxed">One account. One avatar. One wardrobe. One membership.</p>
          </div>
        </div>
      </div>

      {/* Owned digital wardrobe — real AssetOwnership only */}
      <div className="mt-8">
        <OwnedWardrobe />
      </div>
    </div>
  );
}