import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import MobilePanelSheet from './MobilePanelSheet';

export default function SavePreviewModal({
  isOpen,
  onClose,
  thumbnailUrl,
  defaultName = 'My Look',
  isMobile = false,
  onSave, // async function that handles the save logic
  assetType = 'look', // 'avatar', 'outfit', 'scene', 'look'
}) {
  const [name, setName] = useState(defaultName);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(name.trim(), thumbnailUrl);
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
      {/* Thumbnail Preview */}
      {thumbnailUrl && (
        <div className="w-full aspect-video rounded-lg overflow-hidden bg-surface-2 border border-white/10">
          <img
            src={thumbnailUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
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
      <DialogContent className="max-w-md gap-0 p-0 glass-panel border-white/10">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold">Save {assetType}</DialogTitle>
        </DialogHeader>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
}