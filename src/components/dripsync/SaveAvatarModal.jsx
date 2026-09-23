import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Camera } from 'lucide-react';
import { toast } from 'sonner';
import MobilePanelSheet from './MobilePanelSheet';

export default function SaveAvatarModal({
  isOpen,
  onClose,
  defaultName = 'My Avatar',
  isMobile = false,
  onSave, // async function(name, previewUrl, metadata)
  previewImageUrl, // captured viewport image
  avatarData = {}, // { avatar_url, wearables, customization, environment, currentRealm }
  assetType = 'avatar', // avatar | look | outfit
}) {
  const [name, setName] = useState(defaultName);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef(null);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setIsSaving(true);
    try {
      // Use captured preview, fallback to placeholder
      const finalPreview = previewImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%230A0A0F" width="400" height="300"/%3E%3Ctext x="200" y="150" fill="%23fff" text-anchor="middle" font-size="16"%3EAvatar Preview%3C/text%3E%3C/svg%3E';
      
      await onSave(name.trim(), finalPreview, avatarData);
      toast.success('Saved to your collection', { duration: 2000 });
      setName(defaultName);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const modalContent = (
    <div className="space-y-6 p-6 sm:p-0">
      {/* 3D Preview Viewport — captured from active scene */}
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-surface-2 border border-white/10 relative group">
        {previewImageUrl ? (
          <img
            src={previewImageUrl}
            alt="Avatar Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-surface-2 to-surface-3">
            <Camera className="w-8 h-8 text-text-40 mb-2" />
            <p className="text-xs text-text-40">Preview loading...</p>
          </div>
        )}
        
        {/* Metadata overlay on hover (mobile) */}
        {isMobile && avatarData && (
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-xs text-text-60 p-3 text-center pointer-events-none">
            {avatarData.avatar_url && <span>Avatar loaded</span>}
            {avatarData.wearables?.length > 0 && <span>{avatarData.wearables.length} wearables</span>}
            {avatarData.environment && <span>Custom environment</span>}
          </div>
        )}
      </div>

      {/* Asset Metadata Summary */}
      {!isMobile && avatarData && (
        <div className="grid grid-cols-2 gap-3 text-xs bg-surface-3 p-3 rounded-lg border border-white/5">
          {avatarData.wearables?.length > 0 && (
            <div>
              <span className="text-text-40">Wearables</span>
              <span className="block font-semibold text-text-100">{avatarData.wearables.length}</span>
            </div>
          )}
          {avatarData.environment && (
            <div>
              <span className="text-text-40">Environment</span>
              <span className="block font-semibold text-text-100">Custom</span>
            </div>
          )}
          {avatarData.customization?.skinTone && (
            <div>
              <span className="text-text-40">Skin Tone</span>
              <span className="block font-semibold text-text-100">{avatarData.customization.skinTone}</span>
            </div>
          )}
          {avatarData.customization?.hairColor && (
            <div>
              <span className="text-text-40">Hair Color</span>
              <span className="block font-semibold text-text-100">{avatarData.customization.hairColor}</span>
            </div>
          )}
        </div>
      )}

      {/* Name Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-100">Name your {assetType}</label>
        <Input
          type="text"
          placeholder={defaultName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSaving}
          className="bg-surface-3 border-white/10 text-text-100 placeholder-text-40"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isSaving) handleSave();
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isSaving}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-skrt-cyan hover:bg-skrt-cyan/90 text-black font-semibold gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Save
            </>
          )}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobilePanelSheet
        isOpen={isOpen}
        onClose={onClose}
        title={`Save ${assetType}`}
        height="auto"
      >
        {modalContent}
      </MobilePanelSheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl gap-0 p-0 glass-panel border-white/10">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold">Save {assetType}</DialogTitle>
        </DialogHeader>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
}