import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Box, 
  Trash2, 
  Copy, 
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Move,
  RotateCcw
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const INTERACTION_TYPES = [
  { value: 'pickup', label: '📦 Pickup', description: 'Can be grabbed and carried' },
  { value: 'throw', label: '⚾ Throwable', description: 'Can be thrown with physics' },
  { value: 'sit', label: '🪑 Sittable', description: 'Avatar can sit on it' },
  { value: 'toggle', label: '💡 Toggle', description: 'On/off switch' },
  { value: 'button', label: '🔘 Button', description: 'Press to activate' },
  { value: 'lever', label: '🎚️ Lever', description: 'Pull/push lever' },
  { value: 'open', label: '🚪 Openable', description: 'Doors, drawers, etc.' },
  { value: 'static', label: '🏛️ Static', description: 'Non-interactive decoration' },
];

export default function InteractiveObjectsPanel({ 
  objects = [], 
  onAdd, 
  onUpdate, 
  onRemove,
  selectedId,
  onSelect 
}) {
  const [editingId, setEditingId] = useState(null);

  const handleDuplicate = (obj) => {
    const duplicate = {
      ...obj,
      id: Date.now(),
      name: `${obj.name} (Copy)`,
      position: [obj.position[0] + 1, obj.position[1], obj.position[2]]
    };
    onAdd(duplicate);
  };

  const handleUpdateField = (id, field, value) => {
    const obj = objects.find(o => o.id === id);
    if (!obj) return;
    
    onUpdate(id, { [field]: value });
  };

  const getInteractionIcon = (type) => {
    const icon = INTERACTION_TYPES.find(t => t.value === type);
    return icon?.label.split(' ')[0] || '📦';
  };

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-3">
        <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
          <Box className="w-3 h-3 inline mr-1" />
          Interactive Objects
        </p>
        <p className="text-xs text-gray-400">
          Place objects in the scene and configure their interactions
        </p>
      </div>

      {objects.length === 0 && (
        <div className="text-center py-8 border border-dashed border-gray-700 rounded-lg">
          <Box className="w-8 h-8 mx-auto mb-2 text-gray-600" />
          <p className="text-sm text-gray-500">No interactive objects yet</p>
          <p className="text-xs text-gray-600 mt-1">Add from Sketchfab browser</p>
        </div>
      )}

      {objects.map((obj) => {
        const isEditing = editingId === obj.id;
        const isSelected = selectedId === obj.id;

        return (
          <Card
            key={obj.id}
            className={`bg-gray-900/70 border transition-all ${
              isSelected 
                ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.3)]' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="p-3">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl cursor-pointer transition-all ${
                    isSelected ? 'bg-cyan-500/20 ring-2 ring-cyan-400' : 'bg-gray-800'
                  }`}
                  onClick={() => onSelect(obj.id)}
                >
                  {getInteractionIcon(obj.interactionType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <Input
                      value={obj.name}
                      onChange={(e) => handleUpdateField(obj.id, 'name', e.target.value)}
                      className="h-7 text-sm bg-gray-800 border-cyan-500/30"
                      onBlur={() => setEditingId(null)}
                      autoFocus
                    />
                  ) : (
                    <h4
                      className="text-sm font-bold text-white truncate cursor-pointer hover:text-cyan-400"
                      onClick={() => setEditingId(obj.id)}
                    >
                      {obj.name}
                    </h4>
                  )}
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="text-[9px] bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {obj.interactionType}
                    </Badge>
                    {obj.metadata?.source === 'sketchfab' && (
                      <Badge className="text-[9px] bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        Sketchfab
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleDuplicate(obj)}
                    className="p-1.5 rounded text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemove(obj.id)}
                    className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Properties - Collapsed by default */}
              {isSelected && (
                <div className="space-y-3 pt-3 border-t border-gray-700/50">
                  {/* Interaction Type */}
                  <div>
                    <Label className="text-xs text-gray-400">Interaction Type</Label>
                    <Select
                      value={obj.interactionType}
                      onValueChange={(value) => handleUpdateField(obj.id, 'interactionType', value)}
                    >
                      <SelectTrigger className="h-8 text-sm bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INTERACTION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Position */}
                  <div>
                    <Label className="text-xs text-gray-400 mb-2 block">Position</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['X', 'Y', 'Z'].map((axis, idx) => (
                        <div key={axis}>
                          <Label className="text-[10px] text-gray-500">{axis}</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={obj.position[idx].toFixed(2)}
                            onChange={(e) => {
                              const newPos = [...obj.position];
                              newPos[idx] = parseFloat(e.target.value) || 0;
                              handleUpdateField(obj.id, 'position', newPos);
                            }}
                            className="h-7 text-xs bg-gray-800 border-gray-700"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scale */}
                  <div>
                    <Label className="text-xs text-gray-400 mb-2 block">Scale: {obj.scale.toFixed(2)}x</Label>
                    <Slider
                      value={[obj.scale]}
                      onValueChange={([value]) => handleUpdateField(obj.id, 'scale', value)}
                      min={0.1}
                      max={5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateField(obj.id, 'position', [0, 0, -3])}
                      className="flex-1 h-7 text-xs bg-gray-800 border-gray-700 text-gray-400 hover:text-cyan-400"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset Pos
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}