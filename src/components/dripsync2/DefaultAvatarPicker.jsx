import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Sparkles, Lock, Crown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_AVATARS } from '@/lib/defaultAvatars';
import { useAvatarTemplates } from '@/hooks/useAvatarTemplates';
import { RefreshCw } from 'lucide-react';

// Normalize a published community-template DripSyncAsset into the picker card
// shape. Carries `rawAsset` so the parent can load the full avatar data
// (wearables/customization/etc.) into the editor on select — copy-on-select,
// never mutating the original. `origin:'template'` distinguishes it from the
// force-save static defaults. Only avatar data is surfaced; the owner's
// account identity is never displayed.
function normalizeTemplate(raw) {
  return {
    id: `tpl_${raw.id}`,
    name: raw.template_name || raw.name || 'Community Avatar',
    glb_url: raw.avatarUrl || raw.metadata?.avatarUrl || null,
    image: raw.thumbnailUrl || raw.metadata?.thumbnailUrl || null,
    role: 'Community Template',
    vibe: raw.gender === 'feminine' ? 'Feminine' : raw.gender === 'masculine' ? 'Masculine' : '',
    gender: raw.gender || raw.metadata?.gender || null,
    origin: 'template',
    rawAsset: raw,
    fromDB: true,
  };
}

/**
 * DefaultAvatarPicker — choose a ready-made identity.
 *
 * Sources avatars from the static DEFAULT_AVATARS registry (always available,
 * no admin seeding) and merges in any saved DefaultAvatar DB records as extra
 * options. Never shows an empty state. The selected avatar is handed to the
 * parent as a normalized object { id, name, glb_url, image, role, vibe, gender }.
 */

// Normalize a static-registry default and a saved DripSyncAsset record into
// one shape. The canonical avatar store is DripSyncAsset (base44/entities/);
// the legacy `DefaultAvatar` entity is not registered and its query silently
// failed, so saved avatars never appeared. We now read DripSyncAsset
// (type:'avatar', not already published as a template) for "my saved
// identities" — RLS restricts reads to own / public-template / admin.
function normalizeDefault(src, fromDB = false) {
  if (fromDB) {
    return {
      id: `db_${src.id}`,
      name: src.name || 'Saved Avatar',
      glb_url: src.avatarUrl || src.metadata?.avatarUrl || src.glb_url || src.model_url || null,
      image: src.thumbnailUrl || src.metadata?.thumbnailUrl || null,
      role: src.source ? `${src.source} avatar` : 'Your saved avatar',
      vibe: '',
      gender: src.gender || src.metadata?.gender || null,
      fromDB: true,
      rawAsset: src,
    };
  }
  return {
    id: src.id,
    name: src.name,
    glb_url: src.glb_url,
    image: src.portrait || src.image || null,
    role: src.role || 'Default',
    vibe: src.vibe || '',
    gender: src.gender || null,
    fromDB: false,
  };
}

function AvatarCard({ avatar, selected, onSelect, index }) {
  const [imgError, setImgError] = useState(false);
  return (
    <motion.div
      key={avatar.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => onSelect(avatar)}
      className={`group cursor-pointer relative ${
        selected ? 'ring-2 ring-purple-400 ring-offset-4 ring-offset-black' : ''
      }`}
    >
      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-white/10 group-hover:border-purple-400/50 transition-all relative">
        {avatar.image && !imgError ? (
          <img
            src={avatar.image}
            alt={avatar.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: 'radial-gradient(circle at 50% 40%, rgba(168,85,247,0.18), rgba(0,0,0,0) 70%)' }}>
            <User className="w-10 h-10" style={{ color: 'rgba(168,85,247,0.6)' }} />
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{avatar.name}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

        {/* Selected indicator */}
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.8)]"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
        )}

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-bold text-sm mb-1">{avatar.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs border-purple-400/50 text-purple-400 bg-black/50">
              {avatar.role}
            </Badge>
            {avatar.vibe && (
              <Badge variant="outline" className="text-xs border-pink-400/50 text-pink-400 bg-black/50">
                {avatar.vibe}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DefaultAvatarPicker({ isOpen, onClose, onSelectAvatar, userHasGenesis = false }) {
  const [dbAvatars, setDbAvatars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const { templates, loading: tplLoading, error: tplError, retry: tplRetry } = useAvatarTemplates(isOpen);

  // Merge the user's OWN saved avatars (DripSyncAsset, type:'avatar', not
  // published as a template) as quick-pick identities. Public templates are
  // fetched separately via useAvatarTemplates and merged below. Non-blocking —
  // the static registry always renders, so the picker is never empty.
  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await base44.entities.DripSyncAsset.filter(
          { type: 'avatar', is_public_template: false },
          '-updated_date',
          50
        );
        if (alive) setDbAvatars(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setDbAvatars([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [isOpen]);

  const options = useMemo(() => [
    ...DEFAULT_AVATARS.map(a => normalizeDefault(a, false)),
    ...dbAvatars.map(a => normalizeDefault(a, true)),
    ...templates.map(normalizeTemplate),
  ], [dbAvatars, templates]);

  const handleConfirm = () => {
    if (!selected) return;
    onSelectAvatar(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-[#0A0A0F] to-[#1A0A2E] border border-purple-500/30 rounded-2xl shadow-[0_0_60px_rgba(168,85,247,0.3)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 flex-shrink-0">
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">
                Select Your Identity
              </h2>
              <p className="text-sm text-white/60">
                {userHasGenesis ? (
                  <span className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    Genesis Member — Full Access
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-400" />
                    Choose a curated avatar • Genesis Pass unlocks custom creation
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/50 transition-all flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {options.map((avatar, idx) => (
              <AvatarCard
                key={avatar.id}
                avatar={avatar}
                index={idx}
                selected={selected?.id === avatar.id}
                onSelect={setSelected}
              />
            ))}
          </div>

          {/* Community templates status — loading / retry. The grid above
              already renders static + DB defaults, so this never blocks. */}
          {tplLoading && (
            <p className="mt-4 text-xs text-white/40">Loading community templates…</p>
          )}
          {!tplLoading && tplError && (
            <div className="mt-4 flex items-center gap-3">
              <p className="text-xs text-white/40">Community templates unavailable.</p>
              <button
                onClick={tplRetry}
                className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 font-bold"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}

          {/* Genesis Upgrade CTA */}
          {!userHasGenesis && (
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold text-sm mb-1">Unlock Full Customization</h4>
                  <p className="text-white/60 text-xs mb-3">
                    Genesis Pass holders can create custom avatars, use Ready Player Me, and access unlimited wearables.
                  </p>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Get Genesis Pass
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-purple-500/20 bg-black/40 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-white/40">
            {selected ? `Selected: ${selected.name}` : 'No avatar selected'}
          </p>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-white/20 text-white/60 hover:bg-white/5"
            >
              Create Custom
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selected}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Apply Avatar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}