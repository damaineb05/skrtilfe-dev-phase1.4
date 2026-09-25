/**
 * AvatarOnboarding — "Choose Your Identity" modal
 * Shows on first login when user has no avatar configured.
 *
 * Phase C: onboarding persists through saveAvatarProfile (canonical v2) — no
 * direct base44.auth.updateMe. Onboarding equips nothing, so ownership
 * validation is a no-op; the avatar model URL comes from the default catalog.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles, Check } from 'lucide-react';
import { DEFAULT_AVATARS, getAvatarById } from '@/lib/defaultAvatars';
import { buildCanonicalConfig, persistAvatarProfile } from '@/lib/avatarPersistence';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export default function AvatarOnboarding({ isOpen, onClose, onComplete }) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hovered, setHovered] = useState(null);

  const persistDefault = async (avatarId) => {
    const def = getAvatarById(avatarId);
    const config = buildCanonicalConfig({
      avatarSource: def.glb_url,
      avatarId: null,
      source: 'default',
      gender: 'masculine',
      customization: { isVisible: true },
      wearables: [],
      customAnimations: [],
      environment: null,
      currentRealm: null,
    });
    const result = await persistAvatarProfile(config, {
      expectedRevision: user?.avatar_config?.revision ?? 0,
      onUserUpdate: (cfg) => updateUser((u) => ({ ...u, avatar_config: cfg })),
    });
    if (!result.success) toast({ variant: 'destructive', title: 'Avatar not saved', description: result.error });
    return result;
  };

  const handleConfirm = async () => {
    const avatarId = selected || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)].id;
    setSaving(true);
    try {
      const res = await persistDefault(avatarId);
      if (res.success) {
        onComplete?.(avatarId);
        onClose?.();
      }
    } catch (e) {
      console.error('Failed to save avatar:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    const avatarId = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)].id;
    try {
      await persistDefault(avatarId);
    } catch (e) { /* silent */ }
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}
          onClick={handleSkip}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-3xl"
          style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', overflow: 'hidden' }}
        >
          {/* Header */}
          <div className="px-8 pt-10 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] tracking-[0.4em] uppercase font-medium mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Step 01 / Choose Your Identity
                </p>
                <h2 className="text-3xl md:text-4xl font-black text-white leading-none tracking-tight" style={{ letterSpacing: '-0.025em' }}>
                  WHO ARE YOU<br />IN THE SOCIETY?
                </h2>
              </div>
              <button onClick={handleSkip} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 transition-all mt-1">
                <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
              </button>
            </div>
            <p className="text-sm font-light mt-4" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              Select a character to represent your digital identity. You can fully customize it later in DripSync.
            </p>
          </div>

          {/* Avatar Grid */}
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {DEFAULT_AVATARS.map((avatar) => {
                const isSelected = selected === avatar.id;
                const isHov = hovered === avatar.id;
                return (
                  <motion.button
                    key={avatar.id}
                    onClick={() => setSelected(avatar.id)}
                    onHoverStart={() => setHovered(avatar.id)}
                    onHoverEnd={() => setHovered(null)}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative text-left transition-all"
                    style={{
                      borderRadius: '16px',
                      border: `1px solid ${isSelected ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.07)'}`,
                      background: isSelected ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Avatar Image */}
                    <div className="relative" style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        className="w-full h-full object-cover transition-transform duration-500"
                        style={{ transform: isHov || isSelected ? 'scale(1.06)' : 'scale(1)' }}
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,13,20,0.95) 0%, transparent 50%)' }} />

                      {/* Selected checkmark */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: 'white' }}
                        >
                          <Check className="w-3.5 h-3.5 text-black" />
                        </motion.div>
                      )}

                      {/* Subtle glow on hover */}
                      {(isSelected || isHov) && (
                        <div className="absolute inset-0 pointer-events-none" style={{ background: avatar.accent }} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm font-bold text-white mb-0.5">{avatar.name}</p>
                      <p className="text-[10px] font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{avatar.handle}</p>
                      <p className="text-[9px] tracking-wider uppercase font-medium" style={{ color: avatar.badge_color, opacity: 0.8 }}>{avatar.vibe}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-xs font-medium transition-all hover:text-white"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Assign randomly & customize later
            </button>
            <motion.button
              onClick={handleConfirm}
              disabled={saving}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-7 py-3.5 font-bold text-sm tracking-wider uppercase transition-all disabled:opacity-50"
              style={{
                background: selected ? '#fff' : 'rgba(255,255,255,0.08)',
                color: selected ? '#000' : 'rgba(255,255,255,0.4)',
                borderRadius: '12px',
              }}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {selected ? 'Claim Identity' : 'Choose One First'}
                  {selected && <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}