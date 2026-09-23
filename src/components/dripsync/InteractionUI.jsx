import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Hand,
  MousePointer2,
  Box,
  Circle,
  ToggleLeft,
  Footprints,
  Plus,
  ChevronDown,
  ChevronUp,
  Zap,
  Target
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/**
 * Interaction UI Panel for Environmental Interactions
 */
export default function InteractionUI({
  interactionManager,
  nearestObject,
  heldObjectLeft,
  heldObjectRight,
  onInteract,
  onDrop,
  onThrow,
  onCreateObject,
  footIKEnabled = true,
  onFootIKToggle,
  handIKEnabled = true,
  onHandIKToggle
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [newObjectType, setNewObjectType] = useState('cube');

  const objectTypes = [
    { id: 'cube', label: 'Cube', icon: Box },
    { id: 'sphere', label: 'Sphere', icon: Circle },
    { id: 'button', label: 'Button', icon: MousePointer2 },
    { id: 'lever', label: 'Lever', icon: ToggleLeft },
    { id: 'platform', label: 'Platform', icon: Footprints }
  ];

  const getObjectTypeIcon = (type) => {
    switch (type) {
      case 'pickup': return <Box className="w-4 h-4" />;
      case 'button': return <MousePointer2 className="w-4 h-4" />;
      case 'lever': return <ToggleLeft className="w-4 h-4" />;
      case 'platform': return <Footprints className="w-4 h-4" />;
      default: return <Box className="w-4 h-4" />;
    }
  };

  const getInteractionLabel = (obj) => {
    if (!obj) return '';
    switch (obj.type) {
      case 'pickup': return 'Pick Up';
      case 'button': return 'Press';
      case 'lever': return obj.isOn ? 'Turn Off' : 'Turn On';
      default: return 'Interact';
    }
  };

  return (
    <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] overflow-hidden">
      {/* Header */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 hover:bg-cyan-500/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Hand className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white text-sm">Interactions</h3>
                <p className="text-xs text-gray-400">Environmental IK System</p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 space-y-4">
            {/* IK Toggles */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-green-400" />
                    <Label className="text-xs text-gray-300">Foot IK</Label>
                  </div>
                  <Switch
                    checked={footIKEnabled}
                    onCheckedChange={onFootIKToggle}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
                <p className="text-[10px] text-gray-500">Adapt to terrain</p>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Hand className="w-4 h-4 text-purple-400" />
                    <Label className="text-xs text-gray-300">Hand IK</Label>
                  </div>
                  <Switch
                    checked={handIKEnabled}
                    onCheckedChange={onHandIKToggle}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>
                <p className="text-[10px] text-gray-500">Reach & grab</p>
              </div>
            </div>

            {/* Nearest Object */}
            {nearestObject && (
              <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl p-4 border border-cyan-400/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getObjectTypeIcon(nearestObject.type)}
                    <span className="text-sm font-medium text-white capitalize">
                      {nearestObject.type}
                    </span>
                    <Badge className="bg-cyan-500/20 text-cyan-400 text-[10px]">
                      Nearby
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => onInteract('right')}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs"
                  >
                    <Target className="w-3 h-3 mr-1" />
                    {getInteractionLabel(nearestObject)}
                  </Button>
                  {nearestObject.type === 'pickup' && (
                    <Button
                      onClick={() => onInteract('left')}
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 text-xs"
                    >
                      Left Hand
                    </Button>
                  )}
                </div>

                <p className="text-[10px] text-gray-400 mt-2 text-center">
                  Press <kbd className="px-1 py-0.5 bg-gray-800 rounded text-cyan-400">E</kbd> to interact
                </p>
              </div>
            )}

            {/* Held Objects */}
            {(heldObjectLeft || heldObjectRight) && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Held Objects</Label>
                
                {heldObjectRight && (
                  <div className="bg-purple-500/20 rounded-xl p-3 border border-purple-400/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Hand className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-white">Right Hand</span>
                      </div>
                      <Badge className="bg-purple-500/30 text-purple-300 text-[10px]">
                        Holding
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onDrop('right')}
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs border-purple-500/50 text-purple-400"
                      >
                        Drop
                      </Button>
                      <Button
                        onClick={() => onThrow('right')}
                        size="sm"
                        className="flex-1 text-xs bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Throw
                      </Button>
                    </div>
                  </div>
                )}

                {heldObjectLeft && (
                  <div className="bg-pink-500/20 rounded-xl p-3 border border-pink-400/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Hand className="w-4 h-4 text-pink-400 scale-x-[-1]" />
                        <span className="text-xs text-white">Left Hand</span>
                      </div>
                      <Badge className="bg-pink-500/30 text-pink-300 text-[10px]">
                        Holding
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onDrop('left')}
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs border-pink-500/50 text-pink-400"
                      >
                        Drop
                      </Button>
                      <Button
                        onClick={() => onThrow('left')}
                        size="sm"
                        className="flex-1 text-xs bg-pink-500 hover:bg-pink-600 text-white"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Throw
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Object Creator */}
            <Collapsible open={showCreator} onOpenChange={setShowCreator}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Interactive Object
                  {showCreator ? (
                    <ChevronUp className="w-4 h-4 ml-auto" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-auto" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-3">
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 space-y-3">
                  <Label className="text-xs text-gray-400">Object Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {objectTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setNewObjectType(type.id)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                          newObjectType === type.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <type.icon className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={() => onCreateObject(newObjectType)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create {objectTypes.find(t => t.id === newObjectType)?.label}
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Help Text */}
            <div className="bg-gray-900/30 rounded-lg p-3 border border-gray-800">
              <p className="text-[10px] text-gray-500 text-center">
                <kbd className="px-1 py-0.5 bg-gray-800 rounded text-cyan-400 mr-1">E</kbd> Interact
                <span className="mx-2">•</span>
                <kbd className="px-1 py-0.5 bg-gray-800 rounded text-cyan-400 mr-1">Q</kbd> Drop
                <span className="mx-2">•</span>
                <kbd className="px-1 py-0.5 bg-gray-800 rounded text-cyan-400 mr-1">F</kbd> Throw
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}