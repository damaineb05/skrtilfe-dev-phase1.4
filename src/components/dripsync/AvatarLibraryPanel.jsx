import React from 'react';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AvatarLibraryPanel({
  avatars = [],
  selectedAvatarId = null,
  onSelectAvatar,
  onDeleteAvatar,
  onSaveAvatar,
  isLoading = false,
}) {
  const handleDelete = async (e, assetId) => {
    e.stopPropagation();
    if (!confirm('Delete this avatar?')) return;

    try {
      await onDeleteAvatar(assetId);
      toast.success('Avatar deleted');
    } catch (error) {
      toast.error('Failed to delete avatar');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-skrt-cyan" />
      </div>
    );
  }

  if (avatars.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-center p-4">
        <p className="text-text-40 text-sm mb-4">No avatars saved yet</p>
        <Button
          onClick={onSaveAvatar}
          size="sm"
          className="bg-skrt-cyan hover:bg-skrt-cyan/90 text-black gap-2"
        >
          <Plus className="w-4 h-4" />
          Save Avatar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with save button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-100">Avatar Library</h3>
        <Button
          onClick={onSaveAvatar}
          size="sm"
          variant="outline"
          className="gap-1 h-8"
        >
          <Plus className="w-3 h-3" />
          Save
        </Button>
      </div>

      {/* Avatar grid */}
      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
        {avatars.map((avatar) => {
          const isSelected = avatar.id === selectedAvatarId;

          return (
            <div
              key={avatar.id}
              onClick={() => onSelectAvatar(avatar.id)}
              className={`
                relative group cursor-pointer rounded-lg overflow-hidden
                transition-all duration-200 aspect-square
                ${isSelected
                  ? 'ring-2 ring-skrt-cyan shadow-glow-cyan'
                  : 'border border-white/10 hover:border-white/20'
                }
              `}
            >
              {/* Thumbnail */}
              {avatar.thumbnailUrl ? (
                <img
                  src={avatar.thumbnailUrl}
                  alt={avatar.name}
                  className="w-full h-full object-cover bg-surface-3"
                />
              ) : (
                <div className="w-full h-full bg-surface-3 flex items-center justify-center">
                  <span className="text-text-40 text-xs">No preview</span>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-between p-2">
                {/* Name */}
                <p className="text-xs font-medium text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {avatar.name}
                </p>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, avatar.id)}
                  className="p-1 rounded bg-red-500/80 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 rounded-full bg-skrt-cyan animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="text-xs text-text-40 pt-2 border-t border-white/10">
        {selectedAvatarId && (
          <p>
            Selected: <span className="text-text-100 font-medium">
              {avatars.find(a => a.id === selectedAvatarId)?.name}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}