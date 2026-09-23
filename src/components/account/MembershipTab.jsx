import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Check, Lock, Zap, Star, ShoppingBag, Clock, MessageSquare, Truck, Tag, Users, Vote } from 'lucide-react';
import { getMembershipTier, MEMBERSHIP_TIERS } from '@/lib/membershipAccess';

const BASIC_PERKS = [
  { icon: MessageSquare, label: 'Forum access & posting' },
  { icon: ShoppingBag, label: 'Ability to purchase products' },
  { icon: Star, label: 'Earn reputation & badges' },
  { icon: Truck, label: 'Standard shipping' },
  { icon: Users, label: 'Public community access' },
];

const BASIC_LIMITS = [
  'No early drop access',
  'No exclusive products',
  'No private forums',
  'Standard support only',
];

const GENESIS_PERKS = [
  { icon: Clock, label: 'Early drop access (24–72 hrs before public)', highlight: true },
  { icon: Lock, label: 'Exclusive Genesis-only products', highlight: true },
  { icon: Zap, label: 'Priority checkout — reduced cart risk', highlight: true },
  { icon: Star, label: 'Premium profile badge (status symbol)', highlight: true },
  { icon: MessageSquare, label: 'Private Genesis forum channels', highlight: true },
  { icon: Truck, label: 'Discounted / faster shipping', highlight: true },
  { icon: Tag, label: 'Members-only pricing & bundle drops', highlight: true },
  { icon: Users, label: 'Invite-only events & digital experiences' },
  { icon: Vote, label: 'Voting power on future drops' },
  { icon: ShoppingBag, label: 'Limited edition digital assets (NFT-style)' },
];

export default function MembershipTab({ user, profile }) {
  const tier = getMembershipTier(user);
  const isGenesis = tier === MEMBERSHIP_TIERS.GENESIS;
  const isPlus = tier === MEMBERSHIP_TIERS.DRIPSYNC_PLUS;
  const repScore = profile?.reputation_score || 0;
  const nextMilestone = repScore < 100 ? 100 : repScore < 500 ? 500 : null;
  const progress = nextMilestone ? Math.min((repScore / nextMilestone) * 100, 100) : 100;

  return (
    <div className="space-y-10 max-w-2xl">

      {/* Current tier badge */}
      <div className={`p-6 border-2 ${isGenesis ? 'border-black bg-black text-white' : 'border-[#e8e8e8]'}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-2 ${isGenesis ? 'text-white/50' : 'text-black/40'}`}>
              Your Membership
            </p>
            <h2 className={`text-2xl font-black tracking-tight ${isGenesis ? 'text-white' : 'text-black'}`}>
              {isGenesis ? '⬡ Genesis Member' : isPlus ? '✦ DripSync+ Member' : '○ Citizen'}
            </h2>
            <p className={`text-xs mt-1 ${isGenesis ? 'text-white/50' : 'text-black/40'}`}>
              {isGenesis ? 'You are part of the core tribe. Thank you.' : isPlus ? 'Expanding your identity. Thank you.' : 'Entry level — upgrade to unlock the full experience.'}
            </p>
          </div>
          {!isGenesis && (
            <Link to={createPageUrl('Membership')}
              className="shrink-0 px-5 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black/80 transition-colors whitespace-nowrap">
              Upgrade →
            </Link>
          )}
        </div>
      </div>

      {/* Reputation score + progression */}
      <div className="border border-[#e8e8e8] p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">Reputation Score</p>
          <span className="text-lg font-black text-black">{repScore} pts</span>
        </div>
        <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden mb-3">
          <div className="h-full bg-black transition-all duration-700 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        {nextMilestone && (
          <p className="text-xs text-black/40">
            {nextMilestone - repScore} pts to next milestone
            {nextMilestone === 100 && ' → Unlock early access preview'}
            {nextMilestone === 500 && ' → Unlock Genesis discount'}
          </p>
        )}
        {!nextMilestone && <p className="text-xs text-black/40">Max reputation milestone reached. You're a legend.</p>}
      </div>

      {/* Badges */}
      {profile?.badges?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 mb-3">Your Badges</p>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map(badge => (
              <span key={badge} className="px-3 py-1.5 border border-black text-[10px] font-bold uppercase tracking-widest text-black">
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tier comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Basic */}
        <div className={`border p-6 ${!isGenesis ? 'border-black' : 'border-[#e8e8e8]'}`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-black uppercase tracking-widest text-black">Basic</p>
            <span className="text-[10px] font-semibold text-black/30 uppercase tracking-wider">Free</span>
          </div>
          <p className="text-[10px] text-black/40 mb-5">For the audience & community</p>
          <ul className="space-y-2.5 mb-5">
            {BASIC_PERKS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5">
                <Check className="w-3 h-3 text-black shrink-0" />
                <span className="text-xs text-black/60">{label}</span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/30 mb-2">Not included</p>
          <ul className="space-y-1.5">
            {BASIC_LIMITS.map(l => (
              <li key={l} className="flex items-center gap-2.5">
                <Lock className="w-3 h-3 text-black/20 shrink-0" />
                <span className="text-[10px] text-black/30 line-through">{l}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Genesis */}
        <div className={`border-2 p-6 relative overflow-hidden ${isGenesis ? 'border-black bg-black text-white' : 'border-black'}`}>
          {!isGenesis && (
            <div className="absolute top-3 right-3">
              <span className="text-[9px] font-bold uppercase tracking-widest bg-black text-white px-2 py-0.5">Recommended</span>
            </div>
          )}
          <div className="flex items-center justify-between mb-1">
            <p className={`text-xs font-black uppercase tracking-widest ${isGenesis ? 'text-white' : 'text-black'}`}>Genesis</p>
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${isGenesis ? 'text-white/40' : 'text-black/30'}`}>Exclusive</span>
          </div>
          <p className={`text-[10px] mb-5 ${isGenesis ? 'text-white/40' : 'text-black/40'}`}>Core tribe. Revenue engine.</p>
          <ul className="space-y-2.5">
            {GENESIS_PERKS.map(({ icon: Icon, label, highlight }) => (
              <li key={label} className="flex items-center gap-2.5">
                <Check className={`w-3 h-3 shrink-0 ${highlight ? (isGenesis ? 'text-white' : 'text-black') : isGenesis ? 'text-white/50' : 'text-black/40'}`} />
                <span className={`text-xs ${highlight ? (isGenesis ? 'text-white' : 'text-black font-medium') : isGenesis ? 'text-white/60' : 'text-black/50'}`}>{label}</span>
              </li>
            ))}
          </ul>
          {!isGenesis && (
            <Link to={createPageUrl('Genesis')}
              className="block text-center mt-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.15em] hover:bg-black/80 transition-colors">
              Get Genesis Access
            </Link>
          )}
        </div>
      </div>

      {/* Urgency block for Basic users */}
      {!isGenesis && (
        <div className="border border-dashed border-black/20 p-5 bg-[#fafafa]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2">⚡ Why Upgrade Now?</p>
          <ul className="space-y-1.5">
            {[
              'Genesis Members Only — limited units per drop',
              'Priority checkout protects your cart during high-demand releases',
              'Early access starts 72hrs before public release',
              'Voting power shapes future SKRTLIFE drops',
            ].map(t => (
              <li key={t} className="flex items-start gap-2 text-xs text-black/60">
                <span className="text-black mt-0.5">→</span> {t}
              </li>
            ))}
          </ul>
          <Link to={createPageUrl('Genesis')}
            className="inline-block mt-4 px-6 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black/80 transition-colors">
            Upgrade to Genesis
          </Link>
        </div>
      )}
    </div>
  );
}