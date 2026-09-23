import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import MiniAvatarPreview from './MiniAvatarPreview';

export default function SaveDefaultAvatarModal({
  isOpen,
  onClose,
  onSave,
  avatarThumbnail,
  avatarSource,
  isSaving,
  wearables = [],
  customization = {},
}) {
  const [name, setName] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a name for this avatar');
      return;
    }
    await onSave(name, avatarThumbnail, setAsDefault);
    setName('');
    setSetAsDefault(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-panel border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Save as Default Avatar</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
           {/* Preview — mini 3D viewport showing top half of avatar */}
           <div className="relative">
             <MiniAvatarPreview
               avatarUrl={avatarSource}
               wearables={wearables}
               customization={customization}
             />
             {isSaving && (
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                 <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
                   <Loader2 className="w-4 h-4 animate-spin" />
                   Saving...
                 </div>
               </div>
             )}
           </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="avatar-name" className="text-white/70 text-xs uppercase tracking-wider font-bold">Avatar Name</Label>
            <Input
              id="avatar-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Cool Avatar"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-400/50"
              disabled={isSaving}
              onKeyDown={(e) => { if (e.key === 'Enter' && !isSaving) handleSave(); }}
            />
          </div>

          {/* Set as starter */}
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <input
              type="checkbox"
              id="set-as-starter"
              checked={setAsDefault}
              onChange={(e) => setSetAsDefault(e.target.checked)}
              disabled={isSaving}
              className="w-4 h-4 cursor-pointer accent-cyan-400"
            />
            <label htmlFor="set-as-starter" className="text-sm text-white/70 cursor-pointer">
              Set as default starter avatar
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : (
                'Save Avatar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}