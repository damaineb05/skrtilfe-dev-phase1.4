import React, { useState, useEffect } from 'react';
import { Trash2, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

/**
 * Outfit Presets Panel
 * Save and load outfit combinations
 */
export default function OutfitPresetsPanel({
  outfits = [],
  isLoading = false,
  onFetchOutfits,
  onSaveOutfit,
  onLoadOutfit,
  onDeleteOutfit,
  currentWearables = {},
}) {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [outfitName, setOutfitName] = useState('');

  useEffect(() => {
    onFetchOutfits?.();
  }, [onFetchOutfits]);

  const handleSaveOutfit = async () => {
    if (!outfitName.trim()) {
      toast.error('Enter outfit name');
      return;
    }

    try {
      await onSaveOutfit(outfitName, currentWearables);
      toast.success('Outfit saved');
      setOutfitName('');
      setShowSaveForm(false);
    } catch (error) {
      toast.error('Failed to save outfit');
    }
  };

  const handleLoadOutfit = async (outfitId) => {
    try {
      await onLoadOutfit(outfitId);
      toast.success('Outfit loaded');
    } catch (error) {
      toast.error('Failed to load outfit');
    }
  };

  const handleDeleteOutfit = async (outfitId) => {
    if (!confirm('Delete this outfit?')) return;

    try {
      await onDeleteOutfit(outfitId);
      toast.success('Outfit deleted');
    } catch (error) {
      toast.error('Failed to delete outfit');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-100">Outfits</h3>
        <Button
          onClick={() => setShowSaveForm(!showSaveForm)}
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-xs"
        >
          <Save className="w-3 h-3" />
          Save
        </Button>
      </div>

      {/* Save form */}
      {showSaveForm && (
        <div className="space-y-2 p-2 bg-white/5 rounded border border-white/10">
          <Input
            placeholder="Outfit name..."
            value={outfitName}
            onChange={(e) => setOutfitName(e.target.value)}
            className="h-7 text-xs bg-white/5"
            onKeyDown={(e) => e.key === 'Enter' && handleSaveOutfit()}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSaveOutfit}
              size="sm"
              className="flex-1 h-7 text-xs bg-skrt-cyan hover:bg-skrt-cyan/90 text-black"
            >
              Save
            </Button>
            <Button
              onClick={() => setShowSaveForm(false)}
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Outfits list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-4 h-4 animate-spin text-skrt-cyan" />
        </div>
      ) : outfits.length === 0 ? (
        <p className="text-xs text-text-40 py-4 text-center">No outfits saved</p>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
          {outfits.map((outfit) => (
            <div
              key={outfit.id}
              className="p-2 bg-white/5 rounded border border-white/10 flex items-center justify-between group hover:border-white/20 transition-colors"
            >
              <button
                onClick={() => handleLoadOutfit(outfit.id)}
                className="flex-1 text-left text-xs font-medium text-text-100 hover:text-skrt-cyan transition-colors truncate"
              >
                {outfit.name}
              </button>
              <button
                onClick={() => handleDeleteOutfit(outfit.id)}
                className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 hover:bg-red-500/40"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}