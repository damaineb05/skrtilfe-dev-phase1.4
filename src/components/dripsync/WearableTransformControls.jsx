import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Move, 
  RotateCw, 
  Maximize2, 
  RefreshCw, 
  Target,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Transform controls UI for selected wearable
 * Provides gizmo mode switching and numeric inputs
 */
export default function WearableTransformControls({
  wearables = [],
  selectedWearableId,
  onSelectWearable,
  transformMode,
  onTransformModeChange,
  onUpdateWearable,
  onSnapToBone,
  onResetTransform,
  onMirrorToOpposite,
  gizmoEnabled,
  onToggleGizmo
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const selectedWearable = wearables.find(w => w.id === selectedWearableId);

  if (!selectedWearable) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-lg p-4 shadow-lg">
        <p className="text-sm text-gray-500 text-center">
          Select a wearable to transform
        </p>
      </div>
    );
  }

  const handlePositionChange = (axis, value) => {
    const newPos = [...selectedWearable.position];
    const axisIndex = { x: 0, y: 1, z: 2 }[axis];
    newPos[axisIndex] = parseFloat(value) || 0;
    onUpdateWearable(selectedWearableId, { position: newPos });
  };

  const handleRotationChange = (axis, value) => {
    const newRot = [...selectedWearable.rotation];
    const axisIndex = { x: 0, y: 1, z: 2 }[axis];
    newRot[axisIndex] = parseFloat(value) || 0;
    onUpdateWearable(selectedWearableId, { rotation: newRot });
  };

  const handleScaleChange = (value) => {
    onUpdateWearable(selectedWearableId, { scale: parseFloat(value) || 1 });
  };

  // Check if this wearable has a mirror pair (left/right)
  const hasMirrorPair = /left|right|_l|_r/i.test(selectedWearable.bone);
  
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Move className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Transform Wearable</h3>
              <p className="text-white/80 text-xs">{selectedWearable.name}</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Wearable Selector */}
          <div>
            <Label className="text-xs font-medium mb-2 block">Selected Wearable</Label>
            <Select value={selectedWearableId?.toString()} onValueChange={(val) => onSelectWearable(parseInt(val))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {wearables.map(w => (
                  <SelectItem key={w.id} value={w.id.toString()}>
                    {w.name} ({w.bone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gizmo Mode Selector */}
          <div>
            <Label className="text-xs font-medium mb-2 block">Transform Mode</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={transformMode === 'translate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTransformModeChange('translate')}
                className="flex items-center justify-center gap-2"
              >
                <Move className="w-4 h-4" />
                Move
              </Button>
              <Button
                variant={transformMode === 'rotate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTransformModeChange('rotate')}
                className="flex items-center justify-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                Rotate
              </Button>
              <Button
                variant={transformMode === 'scale' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTransformModeChange('scale')}
                className="flex items-center justify-center gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                Scale
              </Button>
            </div>
          </div>

          {/* Gizmo Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-xs font-medium">Show Gizmo</Label>
              <p className="text-xs text-gray-500">Enable 3D transform handles</p>
            </div>
            <button
              onClick={onToggleGizmo}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                gizmoEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  gizmoEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Numeric Inputs */}
          <div className="space-y-3">
            {/* Position */}
            <div>
              <Label className="text-xs font-medium mb-2 block">Position</Label>
              <div className="grid grid-cols-3 gap-2">
                {['x', 'y', 'z'].map((axis, i) => (
                  <div key={axis}>
                    <Label className="text-xs text-gray-500 mb-1 block uppercase">{axis}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={selectedWearable.position[i].toFixed(3)}
                      onChange={(e) => handlePositionChange(axis, e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Rotation */}
            <div>
              <Label className="text-xs font-medium mb-2 block">Rotation (radians)</Label>
              <div className="grid grid-cols-3 gap-2">
                {['x', 'y', 'z'].map((axis, i) => (
                  <div key={axis}>
                    <Label className="text-xs text-gray-500 mb-1 block uppercase">{axis}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedWearable.rotation[i].toFixed(2)}
                      onChange={(e) => handleRotationChange(axis, e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scale */}
            <div>
              <Label className="text-xs font-medium mb-2 block">Scale</Label>
              <Input
                type="number"
                step="0.1"
                value={selectedWearable.scale.toFixed(2)}
                onChange={(e) => handleScaleChange(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSnapToBone(selectedWearableId)}
              className="flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              Snap to Bone
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResetTransform(selectedWearableId)}
              className="flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          {/* Mirror Button (only if applicable) */}
          {hasMirrorPair && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMirrorToOpposite(selectedWearableId)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Mirror to Opposite Side
            </Button>
          )}

          {/* Helper Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>Tip:</strong> Hold <kbd className="px-1 py-0.5 bg-white rounded border border-blue-300 font-mono text-xs">Shift</kbd> to disable gizmo and orbit camera
            </p>
          </div>
        </div>
      )}
    </div>
  );
}