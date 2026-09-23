import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { 
  Palette, 
  Sparkles, 
  Eye,
  RotateCcw,
  Layers
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WearableMaterialPanel({ 
  wearable, 
  onMaterialChange,
  onClose 
}) {
  const [material, setMaterial] = useState({
    baseColor: wearable?.material?.baseColor || '#ffffff',
    metalness: wearable?.material?.metalness || 0,
    roughness: wearable?.material?.roughness || 0.5,
    emissive: wearable?.material?.emissive || '#000000',
    emissiveIntensity: wearable?.material?.emissiveIntensity || 0,
    opacity: wearable?.material?.opacity || 1,
    ...wearable?.material
  });

  const handleChange = (property, value) => {
    const newMaterial = { ...material, [property]: value };
    setMaterial(newMaterial);
    onMaterialChange(newMaterial);
  };

  const resetToDefaults = () => {
    const defaults = {
      baseColor: '#ffffff',
      metalness: 0,
      roughness: 0.5,
      emissive: '#000000',
      emissiveIntensity: 0,
      opacity: 1
    };
    setMaterial(defaults);
    onMaterialChange(defaults);
  };

  const ColorRow = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 h-8 text-xs"
          placeholder="#FFFFFF"
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 rounded overflow-hidden border border-gray-300 p-0 cursor-pointer"
        />
      </div>
    </div>
  );

  const RangeRow = ({ label, min, max, step, value, onChange, displayValue }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-xs text-gray-600 font-mono">
          {displayValue || value.toFixed(step >= 1 ? 0 : 2)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );

  const presetMaterials = [
    { name: 'Fabric', baseColor: '#e8e8e8', metalness: 0, roughness: 0.8 },
    { name: 'Leather', baseColor: '#3d2817', metalness: 0.1, roughness: 0.6 },
    { name: 'Metal', baseColor: '#c0c0c0', metalness: 0.9, roughness: 0.2 },
    { name: 'Plastic', baseColor: '#ffffff', metalness: 0, roughness: 0.3 },
    { name: 'Rubber', baseColor: '#1a1a1a', metalness: 0, roughness: 0.9 },
    { name: 'Glass', baseColor: '#ffffff', metalness: 0.1, roughness: 0.1, opacity: 0.5 },
    { name: 'Gold', baseColor: '#ffd700', metalness: 1, roughness: 0.2 },
    { name: 'Chrome', baseColor: '#ffffff', metalness: 1, roughness: 0.1 }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Material Editor</h3>
            <p className="text-xs text-gray-600">{wearable?.name || 'Wearable'}</p>
          </div>
        </div>
        <button 
          onClick={resetToDefaults}
          className="p-2 rounded-lg transition-all hover:bg-white"
          title="Reset to defaults"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="colors" className="text-xs">
              <Palette className="w-3 h-3 mr-1" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="properties" className="text-xs">
              <Layers className="w-3 h-3 mr-1" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="presets" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Presets
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-4">
            <div className="space-y-3 bg-white p-3 rounded-lg border border-gray-200">
              <ColorRow
                label="Base Color"
                value={material.baseColor}
                onChange={(v) => handleChange('baseColor', v)}
              />
              <ColorRow
                label="Emissive"
                value={material.emissive}
                onChange={(v) => handleChange('emissive', v)}
              />
              <RangeRow
                label="Emissive Intensity"
                min={0}
                max={2}
                step={0.1}
                value={material.emissiveIntensity}
                onChange={(v) => handleChange('emissiveIntensity', v)}
              />
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-4">
            <div className="space-y-3 bg-white p-3 rounded-lg border border-gray-200">
              <RangeRow
                label="Metalness"
                min={0}
                max={1}
                step={0.01}
                value={material.metalness}
                onChange={(v) => handleChange('metalness', v)}
              />
              <RangeRow
                label="Roughness"
                min={0}
                max={1}
                step={0.01}
                value={material.roughness}
                onChange={(v) => handleChange('roughness', v)}
              />
              <RangeRow
                label="Opacity"
                min={0}
                max={1}
                step={0.01}
                value={material.opacity}
                onChange={(v) => handleChange('opacity', v)}
              />
            </div>

            {/* Material Preview */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
              <Label className="text-xs text-gray-600 mb-2 block">Preview</Label>
              <div 
                className="w-full h-24 rounded-lg border-2 border-gray-300 shadow-inner"
                style={{
                  backgroundColor: material.baseColor,
                  opacity: material.opacity,
                  boxShadow: material.metalness > 0.5 
                    ? `inset 0 0 20px rgba(255,255,255,${material.metalness})` 
                    : 'none'
                }}
              />
            </div>
          </TabsContent>

          {/* Presets Tab */}
          <TabsContent value="presets" className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {presetMaterials.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    const newMaterial = { ...material, ...preset };
                    setMaterial(newMaterial);
                    onMaterialChange(newMaterial);
                  }}
                  className="p-3 rounded-lg border-2 border-gray-200 hover:border-purple-400 transition-all text-left group"
                >
                  <div 
                    className="w-full h-12 rounded mb-2 border border-gray-300"
                    style={{ backgroundColor: preset.baseColor }}
                  />
                  <p className="text-xs font-medium text-gray-900 group-hover:text-purple-600">
                    {preset.name}
                  </p>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[10px] px-1 py-0.5 bg-gray-100 rounded">
                      M:{preset.metalness}
                    </span>
                    <span className="text-[10px] px-1 py-0.5 bg-gray-100 rounded">
                      R:{preset.roughness}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Close
        </Button>
        <Button
          onClick={() => {
            onMaterialChange(material);
            onClose();
          }}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Eye className="w-4 h-4 mr-2" />
          Apply Changes
        </Button>
      </div>
    </div>
  );
}