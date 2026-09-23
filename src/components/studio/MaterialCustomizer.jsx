import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Palette, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Layers,
  Trash2,
  Download,
  Loader2,
  Info
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PRESET_MATERIALS = [
  { id: 'fabric_cotton', name: 'Cotton Fabric', baseColor: '#E8E8E8', metalness: 0.1, roughness: 0.9 },
  { id: 'fabric_denim', name: 'Denim', baseColor: '#4A6FA5', metalness: 0.1, roughness: 0.8 },
  { id: 'fabric_leather', name: 'Leather', baseColor: '#3C2415', metalness: 0.2, roughness: 0.6 },
  { id: 'fabric_silk', name: 'Silk', baseColor: '#FFF5E1', metalness: 0.3, roughness: 0.3 },
  { id: 'metal_chrome', name: 'Chrome', baseColor: '#C0C0C0', metalness: 1.0, roughness: 0.1 },
  { id: 'metal_gold', name: 'Gold', baseColor: '#FFD700', metalness: 1.0, roughness: 0.2 },
  { id: 'metal_copper', name: 'Copper', baseColor: '#B87333', metalness: 1.0, roughness: 0.3 },
  { id: 'plastic_matte', name: 'Matte Plastic', baseColor: '#FFFFFF', metalness: 0.0, roughness: 0.9 },
  { id: 'plastic_glossy', name: 'Glossy Plastic', baseColor: '#000000', metalness: 0.0, roughness: 0.1 },
  { id: 'rubber', name: 'Rubber', baseColor: '#1A1A1A', metalness: 0.0, roughness: 0.95 },
];

const CLOTHING_PARTS = [
  { id: 'shirt', name: 'Shirt/Top', icon: '👕' },
  { id: 'pants', name: 'Pants/Bottoms', icon: '👖' },
  { id: 'shoes', name: 'Shoes', icon: '👟' },
  { id: 'accessory_hat', name: 'Hat', icon: '🎩' },
  { id: 'accessory_glasses', name: 'Glasses', icon: '🕶️' },
  { id: 'accessory_jewelry', name: 'Jewelry', icon: '💍' },
  { id: 'gloves', name: 'Gloves', icon: '🧤' },
  { id: 'bag', name: 'Bag', icon: '🎒' },
];

export default function MaterialCustomizer({ onMaterialChange, initialMaterials = {} }) {
  const [selectedPart, setSelectedPart] = useState('shirt');
  const [materials, setMaterials] = useState(initialMaterials);
  const [uploadingTexture, setUploadingTexture] = useState(false);
  const fileInputRef = useRef(null);

  const currentMaterial = materials[selectedPart] || {
    baseColor: '#FFFFFF',
    metalness: 0.0,
    roughness: 0.5,
    emissive: '#000000',
    emissiveIntensity: 0,
    textureUrl: null,
    normalMapUrl: null,
    roughnessMapUrl: null,
    metallicMapUrl: null,
  };

  const updateMaterial = (updates) => {
    const newMaterial = { ...currentMaterial, ...updates };
    const newMaterials = { ...materials, [selectedPart]: newMaterial };
    setMaterials(newMaterials);
    
    if (onMaterialChange) {
      onMaterialChange(newMaterials);
    }
  };

  const applyPreset = (preset) => {
    updateMaterial({
      baseColor: preset.baseColor,
      metalness: preset.metalness,
      roughness: preset.roughness,
    });
  };

  const handleTextureUpload = async (event, textureType = 'baseTexture') => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadingTexture(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const textureKey = {
        baseTexture: 'textureUrl',
        normalMap: 'normalMapUrl',
        roughnessMap: 'roughnessMapUrl',
        metallicMap: 'metallicMapUrl',
      }[textureType];

      updateMaterial({ [textureKey]: file_url });
    } catch (error) {
      console.error('Texture upload failed:', error);
      alert('Failed to upload texture');
    } finally {
      setUploadingTexture(false);
    }
  };

  const removeTexture = (textureKey) => {
    updateMaterial({ [textureKey]: null });
  };

  const downloadMaterialConfig = () => {
    const dataStr = JSON.stringify(materials, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `materials_${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const loadMaterialConfig = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const loadedMaterials = JSON.parse(text);
      setMaterials(loadedMaterials);
      
      if (onMaterialChange) {
        onMaterialChange(loadedMaterials);
      }
    } catch (error) {
      console.error('Failed to load material config:', error);
      alert('Failed to load material configuration');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#0088cc]" />
          <h3 className="text-lg font-bold text-[#000000]">Material Customizer</h3>
        </div>
        
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={loadMaterialConfig}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Upload className="w-3 h-3 mr-1" />
            Load
          </Button>
          <Button
            onClick={downloadMaterialConfig}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Clothing Part Selector */}
      <div className="grid grid-cols-4 gap-2">
        {CLOTHING_PARTS.map((part) => (
          <motion.button
            key={part.id}
            onClick={() => setSelectedPart(part.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-lg border-2 transition-all text-center ${
              selectedPart === part.id
                ? 'border-[#0088cc] bg-[#0088cc]/10'
                : 'border-[#eeeeee] hover:border-[#0088cc]/50'
            }`}
          >
            <div className="text-2xl mb-1">{part.icon}</div>
            <div className="text-xs font-medium text-[#000000]">{part.name}</div>
            {materials[part.id] && (
              <Badge variant="secondary" className="mt-1 text-[10px]">
                Customized
              </Badge>
            )}
          </motion.button>
        ))}
      </div>

      {/* Material Editor */}
      <Tabs defaultValue="color" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="color" className="text-xs">
            <Palette className="w-3 h-3 mr-1" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="properties" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="textures" className="text-xs">
            <Layers className="w-3 h-3 mr-1" />
            Textures
          </TabsTrigger>
        </TabsList>

        {/* Color Tab */}
        <TabsContent value="color" className="space-y-4">
          {/* Preset Materials */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Preset Materials</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_MATERIALS.map((preset) => (
                <Button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs h-auto py-2"
                >
                  <div
                    className="w-4 h-4 rounded border border-gray-300 mr-2"
                    style={{ backgroundColor: preset.baseColor }}
                  />
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Base Color */}
          <div>
            <Label htmlFor="baseColor" className="text-sm font-medium mb-2 block">
              Base Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="baseColor"
                type="color"
                value={currentMaterial.baseColor}
                onChange={(e) => updateMaterial({ baseColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={currentMaterial.baseColor}
                onChange={(e) => updateMaterial({ baseColor: e.target.value })}
                className="flex-1"
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          {/* Emissive Color */}
          <div>
            <Label htmlFor="emissive" className="text-sm font-medium mb-2 block">
              Emissive Color (Glow)
            </Label>
            <div className="flex gap-2">
              <Input
                id="emissive"
                type="color"
                value={currentMaterial.emissive}
                onChange={(e) => updateMaterial({ emissive: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={currentMaterial.emissive}
                onChange={(e) => updateMaterial({ emissive: e.target.value })}
                className="flex-1"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Emissive Intensity */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Emissive Intensity: {currentMaterial.emissiveIntensity.toFixed(2)}
            </Label>
            <Slider
              value={[currentMaterial.emissiveIntensity]}
              onValueChange={([value]) => updateMaterial({ emissiveIntensity: value })}
              min={0}
              max={2}
              step={0.01}
              className="w-full"
            />
          </div>
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-4">
          {/* Metalness */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Metalness: {currentMaterial.metalness.toFixed(2)}
            </Label>
            <Slider
              value={[currentMaterial.metalness]}
              onValueChange={([value]) => updateMaterial({ metalness: value })}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <p className="text-xs text-[#666666] mt-1">
              0 = Non-metallic, 1 = Fully metallic
            </p>
          </div>

          {/* Roughness */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Roughness: {currentMaterial.roughness.toFixed(2)}
            </Label>
            <Slider
              value={[currentMaterial.roughness]}
              onValueChange={([value]) => updateMaterial({ roughness: value })}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <p className="text-xs text-[#666666] mt-1">
              0 = Glossy/Shiny, 1 = Rough/Matte
            </p>
          </div>

          {/* Material Preview */}
          <Card className="bg-[#f5f5f7]">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4" />
                Material Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="font-medium text-[#666666]">Base</div>
                  <div
                    className="w-full h-12 rounded border border-gray-300 mt-1"
                    style={{ backgroundColor: currentMaterial.baseColor }}
                  />
                </div>
                <div>
                  <div className="font-medium text-[#666666]">Metal</div>
                  <div className="w-full h-12 rounded border border-gray-300 mt-1 bg-gradient-to-br from-gray-300 to-gray-500"
                    style={{ opacity: currentMaterial.metalness }}
                  />
                </div>
                <div>
                  <div className="font-medium text-[#666666]">Rough</div>
                  <div className="w-full h-12 rounded border border-gray-300 mt-1 bg-gray-400"
                    style={{ 
                      filter: `blur(${currentMaterial.roughness * 4}px)`,
                      opacity: 0.8 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Textures Tab */}
        <TabsContent value="textures" className="space-y-4">
          {/* Base Texture */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Base Texture (Color Map)</Label>
            {currentMaterial.textureUrl ? (
              <div className="relative">
                <img
                  src={currentMaterial.textureUrl}
                  alt="Base texture"
                  className="w-full h-32 object-cover rounded-lg border border-[#eeeeee]"
                />
                <Button
                  onClick={() => removeTexture('textureUrl')}
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-6 h-6"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#eeeeee] rounded-lg cursor-pointer hover:bg-[#f5f5f7] transition-colors">
                <ImageIcon className="w-8 h-8 text-[#666666] mb-2" />
                <span className="text-sm text-[#666666]">Upload Base Texture</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleTextureUpload(e, 'baseTexture')}
                  className="hidden"
                  disabled={uploadingTexture}
                />
              </label>
            )}
          </div>

          {/* Normal Map */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Normal Map (Bump Detail)</Label>
            {currentMaterial.normalMapUrl ? (
              <div className="relative">
                <img
                  src={currentMaterial.normalMapUrl}
                  alt="Normal map"
                  className="w-full h-32 object-cover rounded-lg border border-[#eeeeee]"
                />
                <Button
                  onClick={() => removeTexture('normalMapUrl')}
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-6 h-6"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#eeeeee] rounded-lg cursor-pointer hover:bg-[#f5f5f7] transition-colors">
                <Layers className="w-8 h-8 text-[#666666] mb-2" />
                <span className="text-sm text-[#666666]">Upload Normal Map</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleTextureUpload(e, 'normalMap')}
                  className="hidden"
                  disabled={uploadingTexture}
                />
              </label>
            )}
          </div>

          {/* Roughness Map */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Roughness Map</Label>
            {currentMaterial.roughnessMapUrl ? (
              <div className="relative">
                <img
                  src={currentMaterial.roughnessMapUrl}
                  alt="Roughness map"
                  className="w-full h-32 object-cover rounded-lg border border-[#eeeeee]"
                />
                <Button
                  onClick={() => removeTexture('roughnessMapUrl')}
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-6 h-6"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#eeeeee] rounded-lg cursor-pointer hover:bg-[#f5f5f7] transition-colors">
                <Sparkles className="w-8 h-8 text-[#666666] mb-2" />
                <span className="text-sm text-[#666666]">Upload Roughness Map</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleTextureUpload(e, 'roughnessMap')}
                  className="hidden"
                  disabled={uploadingTexture}
                />
              </label>
            )}
          </div>

          {/* Metallic Map */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Metallic Map</Label>
            {currentMaterial.metallicMapUrl ? (
              <div className="relative">
                <img
                  src={currentMaterial.metallicMapUrl}
                  alt="Metallic map"
                  className="w-full h-32 object-cover rounded-lg border border-[#eeeeee]"
                />
                <Button
                  onClick={() => removeTexture('metallicMapUrl')}
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-6 h-6"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#eeeeee] rounded-lg cursor-pointer hover:bg-[#f5f5f7] transition-colors">
                <Sparkles className="w-8 h-8 text-[#666666] mb-2" />
                <span className="text-sm text-[#666666]">Upload Metallic Map</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleTextureUpload(e, 'metallicMap')}
                  className="hidden"
                  disabled={uploadingTexture}
                />
              </label>
            )}
          </div>

          {uploadingTexture && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-[#0088cc]" />
              <span className="ml-2 text-sm text-[#666666]">Uploading texture...</span>
            </div>
          )}

          {/* Texture Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Texture Tips:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Use square power-of-2 dimensions (512x512, 1024x1024, 2048x2048)</li>
                    <li>PNG or JPG formats recommended</li>
                    <li>Normal maps should be RGB (not grayscale)</li>
                    <li>Roughness/Metallic maps work best as grayscale</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary */}
      <Card className="bg-[#f5f5f7]">
        <CardContent className="p-3">
          <div className="text-xs text-[#666666]">
            <div className="font-medium text-[#000000] mb-2">Current Settings Summary:</div>
            <div className="grid grid-cols-2 gap-2">
              <div>Base Color: <span className="font-mono">{currentMaterial.baseColor}</span></div>
              <div>Metalness: <span className="font-mono">{currentMaterial.metalness.toFixed(2)}</span></div>
              <div>Roughness: <span className="font-mono">{currentMaterial.roughness.toFixed(2)}</span></div>
              <div>Textures: <span className="font-mono">
                {[
                  currentMaterial.textureUrl && 'Base',
                  currentMaterial.normalMapUrl && 'Normal',
                  currentMaterial.roughnessMapUrl && 'Rough',
                  currentMaterial.metallicMapUrl && 'Metal'
                ].filter(Boolean).join(', ') || 'None'}
              </span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}