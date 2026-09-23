import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Wearable Slot Panel
 * Display and manage wearables by slot
 */
export default function WearableSlotPanel({
  wearables = {}, // { slot: wearableData }
  onApplyWearable,
  onRemoveWearable,
  onSelectWearable,
  availableWearables = [],
  selectedSlot = null,
}) {
  const slots = ['head', 'torso', 'legs', 'feet'];
  const [expandedSlot, setExpandedSlot] = useState(null);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-text-100">Wearables</h3>

      <div className="space-y-2">
        {slots.map((slot) => {
          const wearable = wearables[slot];
          const isExpanded = expandedSlot === slot;
          const isSelected = selectedSlot === slot;

          return (
            <div
              key={slot}
              className={`
                border rounded-lg p-2 transition-all
                ${isSelected
                  ? 'border-skrt-cyan bg-skrt-cyan/10'
                  : 'border-white/10 bg-white/5'
                }
              `}
            >
              {/* Slot header */}
              <button
                onClick={() => setExpandedSlot(isExpanded ? null : slot)}
                className="w-full flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize text-text-100">{slot}</span>
                  {wearable && (
                    <span className="text-text-40 truncate max-w-[150px]">
                      {wearable.name}
                    </span>
                  )}
                </div>
                <span className="text-text-40">
                  {isExpanded ? '−' : '+'}
                </span>
              </button>

              {/* Slot content */}
              {isExpanded && (
                <div className="mt-2 space-y-2 pt-2 border-t border-white/10">
                  {wearable ? (
                    <div className="space-y-2">
                      <div className="p-2 bg-white/5 rounded text-xs">
                        <p className="font-medium text-text-100 mb-1">{wearable.name}</p>
                        <div className="text-text-40 space-y-0.5">
                          <p>Scale: {wearable.scale.toFixed(2)}</p>
                          <p>Bone: {wearable.bone}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => onRemoveWearable(slot)}
                        size="sm"
                        variant="destructive"
                        className="w-full gap-1 h-7 text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-text-40">No item equipped</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                        {availableWearables.map((w) => (
                          <Button
                            key={w.id}
                            onClick={() => {
                              onApplyWearable(w.id, { ...w, slot });
                              setExpandedSlot(null);
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs h-7 truncate"
                          >
                            <Plus className="w-3 h-3 mr-1 flex-shrink-0" />
                            {w.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="pt-2 border-t border-white/10 text-xs text-text-40">
        <p>{Object.keys(wearables).length} / 4 slots equipped</p>
      </div>
    </div>
  );
}