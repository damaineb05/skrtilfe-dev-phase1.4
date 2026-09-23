import React from 'react';
import { Wind, Zap, Settings2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PhysicsPanel({ 
  wearables = [],
  selectedWearableId,
  onUpdatePhysics
}) {
  const selectedWearable = wearables.find(w => w.id === selectedWearableId);
  const physics = selectedWearable?.physics || {
    enabled: false,
    type: 'cloth',
    gravity: 9.8,
    damping: 0.1,
    stiffness: 0.5,
    mass: 1,
    windStrength: 0,
    windDirection: [1, 0, 0],
    jiggleIntensity: 0.5,
    jiggleDamping: 0.8
  };

  const handleUpdate = (updates) => {
    if (onUpdatePhysics && selectedWearableId) {
      onUpdatePhysics(selectedWearableId, {
        ...physics,
        ...updates
      });
    }
  };

  if (!selectedWearable) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-500">
        <Zap className="w-12 h-12 text-cyan-400/30 mb-3" />
        <p className="text-sm text-cyan-400/50 uppercase tracking-wide">SELECT A WEARABLE</p>
        <p className="text-xs text-gray-500 mt-1">to configure physics</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">PHYSICS ENGINE</h3>
        </div>
        <Switch
          checked={physics.enabled}
          onCheckedChange={(enabled) => handleUpdate({ enabled })}
          className="data-[state=checked]:bg-purple-500"
        />
      </div>

      {physics.enabled && (
        <Tabs defaultValue={physics.type} onValueChange={(type) => handleUpdate({ type })}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-purple-500/20">
            <TabsTrigger 
              value="cloth"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border data-[state=active]:border-purple-400"
            >
              <Wind className="w-4 h-4 mr-1" />
              CLOTH
            </TabsTrigger>
            <TabsTrigger 
              value="jiggle"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border data-[state=active]:border-cyan-400"
            >
              <Settings2 className="w-4 h-4 mr-1" />
              JIGGLE
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cloth" className="space-y-4 mt-4">
            <div>
              <Label className="text-xs text-gray-400 mb-2">Gravity</Label>
              <Slider
                value={[physics.gravity]}
                onValueChange={([v]) => handleUpdate({ gravity: v })}
                min={0}
                max={20}
                step={0.1}
                className="mt-2"
              />
              <span className="text-xs text-cyan-400 font-mono">{physics.gravity.toFixed(1)} m/s²</span>
            </div>

            <div>
              <Label className="text-xs text-gray-400 mb-2">Stiffness</Label>
              <Slider
                value={[physics.stiffness]}
                onValueChange={([v]) => handleUpdate({ stiffness: v })}
                min={0}
                max={1}
                step={0.01}
                className="mt-2"
              />
              <span className="text-xs text-cyan-400 font-mono">{(physics.stiffness * 100).toFixed(0)}%</span>
            </div>

            <div>
              <Label className="text-xs text-gray-400 mb-2">Damping</Label>
              <Slider
                value={[physics.damping]}
                onValueChange={([v]) => handleUpdate({ damping: v })}
                min={0}
                max={1}
                step={0.01}
                className="mt-2"
              />
              <span className="text-xs text-cyan-400 font-mono">{(physics.damping * 100).toFixed(0)}%</span>
            </div>

            <div>
              <Label className="text-xs text-gray-400 mb-2">Wind Strength</Label>
              <Slider
                value={[physics.windStrength]}
                onValueChange={([v]) => handleUpdate({ windStrength: v })}
                min={0}
                max={10}
                step={0.1}
                className="mt-2"
              />
              <span className="text-xs text-cyan-400 font-mono">{physics.windStrength.toFixed(1)}</span>
            </div>

            <div>
              <Label className="text-xs text-gray-400 mb-2">Mass</Label>
              <Slider
                value={[physics.mass]}
                onValueChange={([v]) => handleUpdate({ mass: v })}
                min={0.1}
                max={5}
                step={0.1}
                className="mt-2"
              />
              <span className="text-xs text-cyan-400 font-mono">{physics.mass.toFixed(1)} kg</span>
            </div>
          </TabsContent>

          <TabsContent value="jiggle" className="space-y-4 mt-4">
            <div>
              <Label className="text-xs text-gray-400 mb-2">Jiggle Intensity</Label>
              <Slider
                value={[physics.jiggleIntensity]}
                onValueChange={([v]) => handleUpdate({ jiggleIntensity: v })}
                min={0}
                max={2}
                step={0.1}
                className="mt-2"
              />
              <span className="text-xs text-cyan-400 font-mono">{physics.jiggleIntensity.toFixed(1)}</span>
            </div>

            <div>
              <Label className="text-xs text-gray-400 mb-2">Jiggle Damping</Label>
              <Slider
                value={[physics.jiggleDamping]}
                onValueChange={([v]) => handleUpdate({ jiggleDamping: v })}
                min={0}
                max={1}
                step={0.01}
                className="mt-2"
              />
              <span className="text-xs text-cyan-400 font-mono">{(physics.jiggleDamping * 100).toFixed(0)}%</span>
            </div>

            <div>
              <Label className="text-xs text-gray-400 mb-2">Mass</Label>
              <Slider
                value={[physics.mass]}
                onValueChange={([v]) => handleUpdate({ mass: v })}
                min={0.1}
                max={5}
                step={0.1}
                className="mt-2"
              />
              <span className="text-xs text-cyan-400 font-mono">{physics.mass.toFixed(1)} kg</span>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <div className="pt-4 border-t border-purple-500/20">
        <p className="text-xs text-gray-500 italic">
          Physics simulations are computed in real-time on the GPU for optimal performance.
        </p>
      </div>
    </div>
  );
}