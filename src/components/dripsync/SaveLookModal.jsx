import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Loader2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MobilePanelSheet from './MobilePanelSheet';

function SaveLookForm({ avatarConfig, user, onSaveSuccess, onClose, autoThumbnail }) {
  const [name, setName] = useState('');
  const [thumbnail, setThumbnail] = useState(autoThumbnail || null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Auto-capture thumbnail when form mounts (canvas is visible)
  useEffect(() => {
    if (autoThumbnail) {
      setThumbnail(autoThumbnail);
      return;
    }
    const canvas = document.querySelector('canvas');
    if (canvas) {
      try {
        setThumbnail(canvas.toDataURL('image/jpeg', 0.82));
      } catch { /* cross-origin canvas — skip */ }
    }
  }, [autoThumbnail]);

  const handleRecapture = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      try {
        setThumbnail(canvas.toDataURL('image/jpeg', 0.82));
      } catch (e) {
        setError('Could not capture canvas — try again.');
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Please enter a name'); return; }
    setIsSaving(true);
    setError('');

    try {
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`;

      // Upload thumbnail
      let thumbnailUrl = null;
      if (thumbnail) {
        try {
          const res = await fetch(thumbnail);
          const blob = await res.blob();
          const file = new File([blob], `look-${slug}.jpg`, { type: 'image/jpeg' });
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          thumbnailUrl = file_url;
        } catch { /* non-critical */ }
      }

      const lookData = {
        user_id: user?.id || null,
        name: name.trim(),
        slug,
        thumbnail_url: thumbnailUrl,
        avatar_url: avatarConfig.avatarUrl,
        avatar_id: avatarConfig.avatarId,
        traits: avatarConfig.traits || {},
        customization: {
          ...avatarConfig.customization,
          // Preserve color customization from DripSync viewport
          skinColor: avatarConfig.customization?.skinColor,
          hairColor: avatarConfig.customization?.hairColor,
          eyeColor: avatarConfig.customization?.eyeColor,
          shoeColor: avatarConfig.customization?.shoeColor,
          topColor: avatarConfig.customization?.topColor,
          bottomColor: avatarConfig.customization?.bottomColor,
          accessoryColor: avatarConfig.customization?.accessoryColor,
        } || {},
        wearables: avatarConfig.wearables || [],
        emotes: avatarConfig.emotes || [],
        environment: avatarConfig.environment || null,
        current_realm: avatarConfig.currentRealm || null,
        is_public: false,
        tags: [],
        view_count: 0,
      };

      const newLook = await base44.entities.Look.create(lookData);
      setSaved(true);
      setTimeout(() => {
        onSaveSuccess?.(newLook);
        onClose?.();
      }, 800);
    } catch (e) {
      console.error('[SAVE LOOK]', e);
      setError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 py-2">
      {/* Thumbnail */}
      <div className="flex gap-4 items-center">
        {thumbnail ? (
          <img src={thumbnail} alt="Preview" className="w-28 h-28 object-cover rounded-xl border border-white/10 flex-shrink-0" />
        ) : (
          <div className="w-28 h-28 rounded-xl border border-dashed border-white/20 bg-white/5 flex items-center justify-center flex-shrink-0">
            <Camera className="w-7 h-7 text-white/20" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <p className="text-xs text-white/40">
            {thumbnail ? 'Thumbnail captured from viewport' : 'No thumbnail — viewport capture unavailable'}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleRecapture}
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 text-xs"
          >
            <Camera className="w-3 h-3 mr-1.5" />
            {thumbnail ? 'Recapture' : 'Capture'}
          </Button>
        </div>
      </div>

      {/* Name */}
      <div>
        <Label className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2 block">Name *</Label>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="e.g., Cyberpunk Warrior"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-skrt-cyan/50"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3 justify-end pt-1">
        <Button variant="outline" onClick={onClose} disabled={isSaving}
          className="border-white/20 bg-white/5 text-white hover:bg-white/10">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || !name.trim() || saved}
          className="bg-skrt-cyan hover:bg-skrt-cyan/80 text-black font-bold min-w-[110px]"
        >
          {saved ? (
            <><Check className="w-4 h-4 mr-1" />Saved!</>
          ) : isSaving ? (
            <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Saving...</>
          ) : (
            'Save Look'
          )}
        </Button>
      </div>
    </div>
  );
}

export default function SaveLookModal({ isOpen, onClose, avatarConfig, user, onSaveSuccess, isMobile }) {
  // Capture thumbnail at the moment modal opens
  const [autoThumbnail, setAutoThumbnail] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        try { setAutoThumbnail(canvas.toDataURL('image/jpeg', 0.82)); } catch { setAutoThumbnail(null); }
      }
    } else {
      setAutoThumbnail(null);
    }
  }, [isOpen]);

  if (isMobile) {
    return (
      <MobilePanelSheet isOpen={isOpen} onClose={onClose} title="Save Look" height="auto">
        <div className="px-4 pb-6">
          {isOpen && (
            <SaveLookForm
              avatarConfig={avatarConfig}
              user={user}
              onSaveSuccess={onSaveSuccess}
              onClose={onClose}
              autoThumbnail={autoThumbnail}
            />
          )}
        </div>
      </MobilePanelSheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-panel border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white font-bold">Save Look</DialogTitle>
          <DialogDescription className="text-white/40">
            Save your current avatar configuration
          </DialogDescription>
        </DialogHeader>
        {isOpen && (
          <SaveLookForm
            avatarConfig={avatarConfig}
            user={user}
            onSaveSuccess={onSaveSuccess}
            onClose={onClose}
            autoThumbnail={autoThumbnail}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}