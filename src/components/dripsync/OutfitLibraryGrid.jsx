import React from 'react';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * Outfit Library Grid
 * Display saved outfits in grid with instant apply on click
 * Optimized for fast switching (no reload lag)
 */
export default function OutfitLibraryGrid({
  outfits = [],
  selectedOutfitId = null,
  onSelectOutfit,
  onDeleteOutfit,
  onSaveOutfit,
  isLoading = false,
}) {
  const handleDelete = async (e, outfitId) => {
    e.stopPropagation();
    if (!confirm('Delete this outfit?')) return;

    try {
      await onDeleteOutfit(outfitId);
      toast.success('Outfit deleted');
    } catch (error) {
      toast.error('Failed to delete outfit');
    }
  };

  const handleSelect = (outfitId) => {
    onSelectOutfit(outfitId);
    toast.success('Outfit applied');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-skrt-cyan" />
      </div>
    );
  }

  if (outfits.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-center p-4">
        <p className="text-text-40 text-sm mb-4">No outfits saved yet</p>
        <Button
          onClick={onSaveOutfit}
          size="sm"
          className="bg-skrt-cyan hover:bg-skrt-cyan/90 text-black gap-2"
        >
          <Plus className="w-4 h-4" />
          Save Outfit
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with save button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-100">Outfit Library</h3>
        <Button
          onClick={onSaveOutfit}
          size="sm"
          variant="outline"
          className="gap-1 h-8"
        >
          <Plus className="w-3 h-3" />
          Save
        </Button>
      </div>

      {/* Outfit grid - 3 columns */}
      <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
        {outfits.map((outfit) => {
          const isSelected = outfit.id === selectedOutfitId;

          return (
            <div
              key={outfit.id}
              onClick={() => handleSelect(outfit.id)}
              className={`
                relative group cursor-pointer rounded-lg overflow-hidden
                transition-all duration-150 aspect-square
                ${isSelected
                  ? 'ring-2 ring-skrt-cyan shadow-glow-cyan scale-105'
                  : 'border border-white/10 hover:border-white/20 hover:scale-103'
                }
              `}
            >
              {/* Thumbnail */}
              {outfit.thumbnailUrl ? (
                <img
                  src={outfit.thumbnailUrl}
                  alt={outfit.name}
                  className="w-full h-full object-cover bg-surface-3"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-surface-3 to-surface-2 flex items-center justify-center">
                  <span className="text-text-40 text-xs text-center px-2">{outfit.name}</span>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end justify-between p-2">
                {/* Name */}
                <p className="text-xs font-medium text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {outfit.name}
                </p>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, outfit.id)}
                  className="p-1 rounded bg-red-500/80 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* Selected indicator with pulse */}
              {isSelected && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-skrt-cyan animate-pulse" />
                  <div className="text-xs font-bold text-skrt-cyan">✓</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="text-xs text-text-40 pt-2 border-t border-white/10">
        {selectedOutfitId && (
          <p>
            Active: <span className="text-text-100 font-medium">
              {outfits.find(o => o.id === selectedOutfitId)?.name}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}