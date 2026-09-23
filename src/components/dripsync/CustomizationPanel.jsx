import React, { useState, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Palette, 
  RotateCcw, 
  Save, 
  Loader2, 
  User, 
  Eye, 
  Scissors,
  StretchVertical,
  Wand2,
  Lightbulb,
  Zap,
  Sparkles,
  X,
  Smile,
  Check
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { safeHex } from '../utils/appearanceHelpers';

// Expanded Body Type Options
const bodyTypes = [
  { id: 'masculine', label: 'Masculine', icon: '♂️', description: 'Classic male' },
  { id: 'feminine', label: 'Feminine', icon: '♀️', description: 'Classic female' },
  { id: 'athletic_m', label: 'Athletic M', icon: '💪', description: 'Toned male' },
  { id: 'athletic_f', label: 'Athletic F', icon: '🏃', description: 'Toned female' },
  { id: 'muscular', label: 'Muscular', icon: '🦾', description: 'Strong build' },
  { id: 'slim', label: 'Slim', icon: '🌿', description: 'Lean build' },
  { id: 'curvy', label: 'Curvy', icon: '💃', description: 'Curved' },
  { id: 'heavy', label: 'Heavy', icon: '🧸', description: 'Larger' },
];

// Expanded Skin Tones with categories
const skinTonePresets = [
  { name: 'Porcelain', hex: '#FFF5E4', category: 'fair' },
  { name: 'Fair 1', hex: '#FBD5C5', category: 'fair' },
  { name: 'Fair 2', hex: '#F2C6B4', category: 'fair' },
  { name: 'Light 1', hex: '#EEB99F', category: 'light' },
  { name: 'Light 2', hex: '#E5AC8F', category: 'light' },
  { name: 'Medium 1', hex: '#D89D7D', category: 'medium' },
  { name: 'Medium 2', hex: '#C88B68', category: 'medium' },
  { name: 'Olive', hex: '#BA7D5F', category: 'olive' },
  { name: 'Tan 1', hex: '#A96D54', category: 'tan' },
  { name: 'Tan 2', hex: '#8B5A3C', category: 'tan' },
  { name: 'Brown', hex: '#6D4628', category: 'brown' },
  { name: 'Dark 1', hex: '#4A2F1D', category: 'dark' },
  { name: 'Dark 2', hex: '#2D1B10', category: 'dark' },
  { name: 'Deep', hex: '#1C0F0A', category: 'deep' },
];

// Expanded Hair Colors
const hairColorPresets = [
  { name: 'Platinum', hex: '#F0E8D8', category: 'light' },
  { name: 'Blonde', hex: '#F5DEB3', category: 'light' },
  { name: 'Dirty Blonde', hex: '#D4C5A9', category: 'light' },
  { name: 'Light Brown', hex: '#A0826D', category: 'brown' },
  { name: 'Brown', hex: '#6F4E37', category: 'brown' },
  { name: 'Chestnut', hex: '#5C4033', category: 'brown' },
  { name: 'Dark Brown', hex: '#3D2817', category: 'dark' },
  { name: 'Black', hex: '#1C0F0A', category: 'dark' },
  { name: 'Auburn', hex: '#A0522D', category: 'red' },
  { name: 'Red', hex: '#C83C28', category: 'red' },
  { name: 'Ginger', hex: '#D2691E', category: 'red' },
  { name: 'Copper', hex: '#B87333', category: 'red' },
  { name: 'Gray', hex: '#808080', category: 'gray' },
  { name: 'Silver', hex: '#C0C0C0', category: 'gray' },
  { name: 'White', hex: '#FFFFFF', category: 'white' },
  { name: 'Blue', hex: '#4169E1', category: 'fantasy' },
  { name: 'Cyan', hex: '#00CED1', category: 'fantasy' },
  { name: 'Green', hex: '#228B22', category: 'fantasy' },
  { name: 'Purple', hex: '#9370DB', category: 'fantasy' },
  { name: 'Pink', hex: '#FF69B4', category: 'fantasy' },
  { name: 'Magenta', hex: '#FF00FF', category: 'fantasy' },
];

// Expanded Eye Colors
const eyeColorPresets = [
  { name: 'Dark Brown', hex: '#3E2723', category: 'natural' },
  { name: 'Brown', hex: '#5C4033', category: 'natural' },
  { name: 'Light Brown', hex: '#8D6E63', category: 'natural' },
  { name: 'Blue', hex: '#4A90E2', category: 'natural' },
  { name: 'Light Blue', hex: '#87CEEB', category: 'natural' },
  { name: 'Green', hex: '#50C878', category: 'natural' },
  { name: 'Hazel', hex: '#8E7618', category: 'natural' },
  { name: 'Gray', hex: '#708090', category: 'natural' },
  { name: 'Amber', hex: '#FFBF00', category: 'rare' },
  { name: 'Honey', hex: '#DAA520', category: 'rare' },
  { name: 'Violet', hex: '#8A2BE2', category: 'rare' },
  { name: 'Red', hex: '#DC143C', category: 'fantasy' },
  { name: 'Pink', hex: '#FF69B4', category: 'fantasy' },
  { name: 'Cyan', hex: '#00FFFF', category: 'fantasy' },
  { name: 'Gold', hex: '#FFD700', category: 'fantasy' },
  { name: 'Silver', hex: '#C0C0C0', category: 'fantasy' },
];

// Hair Styles
const hairStyles = [
  { id: 'bald', name: 'Bald', gender: 'both', category: 'short', assetUrl: null, thumbnail: '👨‍🦲' },
  { id: 'buzz', name: 'Buzz', gender: 'masculine', category: 'short', assetUrl: null, thumbnail: '👨' },
  { id: 'crew_cut', name: 'Crew', gender: 'masculine', category: 'short', assetUrl: null, thumbnail: '👨' },
  { id: 'short_1', name: 'Short Classic', gender: 'both', category: 'short', assetUrl: null, thumbnail: '🧑' },
  { id: 'undercut', name: 'Undercut', gender: 'masculine', category: 'short', assetUrl: null, thumbnail: '🧑' },
  { id: 'pixie', name: 'Pixie', gender: 'feminine', category: 'short', assetUrl: null, thumbnail: '👩' },
  { id: 'bob', name: 'Bob', gender: 'feminine', category: 'medium', assetUrl: null, thumbnail: '👩' },
  { id: 'medium_1', name: 'Medium Wave', gender: 'both', category: 'medium', assetUrl: null, thumbnail: '🧑‍🦱' },
  { id: 'shoulder', name: 'Shoulder', gender: 'feminine', category: 'medium', assetUrl: null, thumbnail: '👩' },
  { id: 'long_1', name: 'Long Straight', gender: 'feminine', category: 'long', assetUrl: null, thumbnail: '👩‍🦰' },
  { id: 'long_wavy', name: 'Long Wavy', gender: 'both', category: 'long', assetUrl: null, thumbnail: '🧑‍🦱' },
  { id: 'curly', name: 'Curly', gender: 'both', category: 'long', assetUrl: null, thumbnail: '🧑‍🦱' },
  { id: 'afro', name: 'Afro', gender: 'both', category: 'long', assetUrl: null, thumbnail: '🧑‍🦱' },
  { id: 'braids', name: 'Braids', gender: 'both', category: 'long', assetUrl: null, thumbnail: '🧑' },
  { id: 'ponytail', name: 'Ponytail', gender: 'both', category: 'long', assetUrl: null, thumbnail: '👩' },
  { id: 'bun', name: 'Bun', gender: 'feminine', category: 'long', assetUrl: null, thumbnail: '👩' },
];

// Facial Hair
const facialHairStyles = [
  { id: 'none', name: 'None', category: 'none' },
  { id: 'stubble', name: 'Stubble', category: 'light' },
  { id: 'shadow', name: 'Shadow', category: 'light' },
  { id: 'mustache', name: 'Mustache', category: 'mustache' },
  { id: 'handlebar', name: 'Handlebar', category: 'mustache' },
  { id: 'goatee', name: 'Goatee', category: 'goatee' },
  { id: 'van_dyke', name: 'Van Dyke', category: 'goatee' },
  { id: 'beard_short', name: 'Short Beard', category: 'beard' },
  { id: 'beard_full', name: 'Full Beard', category: 'beard' },
  { id: 'beard_long', name: 'Long Beard', category: 'beard' },
];

// Face Shapes
const faceShapes = [
  { id: 'oval', name: 'Oval', emoji: '⭕' },
  { id: 'round', name: 'Round', emoji: '🔵' },
  { id: 'square', name: 'Square', emoji: '⬜' },
  { id: 'heart', name: 'Heart', emoji: '❤️' },
  { id: 'diamond', name: 'Diamond', emoji: '💎' },
  { id: 'triangle', name: 'Triangle', emoji: '🔺' },
];

const CustomizationPanel = ({ onCustomizationChange, initialCustomization, onSave, isSaving, onHairAssetChange }) => {
  const [customization, setCustomization] = useState({
    bodyType: 'masculine',
    hairColor: '#8B4513',
    eyeColor: '#4A90E2',
    skinTone: '#FFDBAC',
    height: 1.8,
    isVisible: true,
    hairStyleId: 'short_1',
    hairAssetUrl: null,
    skinFinish: 'matte',
    headScale: 1,
    shoulderWidth: 1,
    limbScale: 1,
    facialHairStyleId: 'none',
    facialHairColor: '#3d2b1f',
    facialHairDensity: 0.6,
    eyebrowColor: '#3d2b1f',
    eyebrowThickness: 0.5,
    faceShape: 'oval',
    ...initialCustomization
  });

  const [selectedHairCategory, setSelectedHairCategory] = useState('all');
  const [selectedSkinCategory, setSelectedSkinCategory] = useState('all');
  const [selectedEyeCategory, setSelectedEyeCategory] = useState('all');
  const [selectedFacialHairCategory, setSelectedFacialHairCategory] = useState('all');
  const [aiStyleLoading, setAiStyleLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const handleChange = useCallback((property, value) => {
    setCustomization(prev => {
      const newCustomization = { ...prev, [property]: value };
      onCustomizationChange(newCustomization);
      return newCustomization;
    });
  }, [onCustomizationChange]);

  const handleHairStyleChange = useCallback((styleId) => {
    const style = hairStyles.find(s => s.id === styleId);
    if (style) {
      handleChange('hairStyleId', styleId);
      if (style.assetUrl && onHairAssetChange) {
        onHairAssetChange(style.assetUrl);
      }
    }
  }, [handleChange, onHairAssetChange]);

  const generateAIStyleSuggestions = async () => {
    setAiStyleLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional avatar stylist inspired by Ready Player Me and Player Zero aesthetics. 

Generate 3 unique avatar style suggestions based on current configuration:
- Body Type: ${customization.bodyType}
- Current Skin: ${customization.skinTone}
- Current Hair: ${customization.hairColor}
- Current Eyes: ${customization.eyeColor}

Create 3 distinct styles:
1. Natural/Realistic - believable human appearance
2. Cyberpunk/Futuristic - neon colors, bold choices
3. Fantasy/Creative - imaginative and unique

For each style, provide specific hex color codes and style IDs that work together harmoniously.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  style: { type: "string" },
                  skinTone: { type: "string" },
                  hairColor: { type: "string" },
                  eyeColor: { type: "string" },
                  hairStyleId: { type: "string" },
                  facialHairStyleId: { type: "string" },
                  vibe: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAiSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('AI suggestion failed:', error);
    } finally {
      setAiStyleLoading(false);
    }
  };

  const applyAISuggestion = useCallback((suggestion) => {
    const updates = {
      skinTone: suggestion.skinTone || customization.skinTone,
      hairColor: suggestion.hairColor || customization.hairColor,
      eyeColor: suggestion.eyeColor || customization.eyeColor,
      hairStyleId: suggestion.hairStyleId || customization.hairStyleId,
      facialHairStyleId: suggestion.facialHairStyleId || customization.facialHairStyleId,
    };
    
    Object.entries(updates).forEach(([key, value]) => {
      handleChange(key, value);
    });
    
    setAiSuggestions([]);
  }, [handleChange]);

  const resetToDefaults = useCallback(() => {
    const defaults = {
      bodyType: 'masculine',
      hairColor: '#8B4513',
      eyeColor: '#4A90E2',
      skinTone: '#FFDBAC',
      height: 1.8,
      isVisible: true,
      hairStyleId: 'short_1',
      hairAssetUrl: null,
      skinFinish: 'matte',
      headScale: 1,
      shoulderWidth: 1,
      limbScale: 1,
      facialHairStyleId: 'none',
      facialHairColor: '#3d2b1f',
      facialHairDensity: 0.6,
      eyebrowColor: '#3d2b1f',
      eyebrowThickness: 0.5,
      faceShape: 'oval',
    };
    setCustomization(defaults);
    onCustomizationChange(defaults);
  }, [onCustomizationChange]);

  const Section = ({ title, icon: Icon, children }) => (
    <div className="relative overflow-hidden rounded-xl p-4 mb-1" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-skrt-cyan" />}
        <span className="text-xs font-bold uppercase tracking-wider text-white">{title}</span>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const ColorPresetGrid = ({ presets, value, onChange, categoryFilter, onCategoryChange }) => (
    <div className="space-y-3">
      {categoryFilter !== undefined && onCategoryChange && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {['all', ...new Set(presets.map(p => p.category))].map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-7 gap-2">
        {presets
          .filter(p => !categoryFilter || categoryFilter === 'all' || p.category === categoryFilter)
          .map((preset) => (
            <button
              key={preset.name}
              onClick={() => onChange(preset.hex)}
              className={`color-swatch-drip w-full aspect-square ${
                value.toUpperCase() === preset.hex.toUpperCase() ? 'selected' : ''
              }`}
              style={{ backgroundColor: preset.hex }}
              title={preset.name}
            >
              {value.toUpperCase() === preset.hex.toUpperCase() && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
                </div>
              )}
            </button>
          ))}
      </div>
    </div>
  );

  const RangeRow = ({ label, min, max, step, value, onChange, displayValue }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm text-white font-medium">{label}</Label>
        <span className="text-xs text-cyan-400 font-mono font-bold px-2 py-1 bg-cyan-400/10 rounded border border-cyan-400/30">
          {displayValue || value.toFixed(step >= 1 ? 0 : 2)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="slider-drip w-full"
      />
    </div>
  );

  const filteredHairStyles = useMemo(() => hairStyles.filter(
    style => style.gender === 'both' || style.gender === customization.bodyType
  ), [customization.bodyType]);

  return (
    <div className="h-full flex flex-col relative">
      {/* AI Suggestions Modal */}
      {aiSuggestions.length > 0 && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="glass-panel-drip rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                AI Style Suggestions
              </h3>
              <button onClick={() => setAiSuggestions([])} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {aiSuggestions.map((suggestion, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-cyan-400/50 hover:bg-white/8 transition-all cursor-pointer group"
                  onClick={() => applyAISuggestion(suggestion)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-bold text-lg">{suggestion.name}</h4>
                      <p className="text-xs text-cyan-400 mt-1 font-medium">{suggestion.style}</p>
                    </div>
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full font-bold border border-cyan-400/30">
                      {suggestion.vibe}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">{suggestion.description}</p>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Skin</p>
                      <div className="w-full h-8 rounded border-2 border-white/20" style={{ backgroundColor: suggestion.skinTone }} />
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Hair</p>
                      <div className="w-full h-8 rounded border-2 border-white/20" style={{ backgroundColor: suggestion.hairColor }} />
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Eyes</p>
                      <div className="w-full h-8 rounded border-2 border-white/20" style={{ backgroundColor: suggestion.eyeColor }} />
                    </div>
                  </div>
                  
                  <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-black font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)] group-hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]">
                    Apply This Style
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <Tabs defaultValue="body" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-4 bg-black/40 p-1 rounded-xl border border-white/10">
            <TabsTrigger value="body" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:shadow-[0_0_10px_rgba(0,212,255,0.3)] rounded-lg">
              <User className="w-3 h-3 mr-1" />
              Body
            </TabsTrigger>
            <TabsTrigger value="face" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:shadow-[0_0_10px_rgba(0,212,255,0.3)] rounded-lg">
              <Smile className="w-3 h-3 mr-1" />
              Face
            </TabsTrigger>
            <TabsTrigger value="eyes" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:shadow-[0_0_10px_rgba(0,212,255,0.3)] rounded-lg">
              <Eye className="w-3 h-3 mr-1" />
              Eyes
            </TabsTrigger>
            <TabsTrigger value="skin" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:shadow-[0_0_10px_rgba(0,212,255,0.3)] rounded-lg">
              <Palette className="w-3 h-3 mr-1" />
              Skin
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400 data-[state=active]:shadow-[0_0_10px_rgba(168,85,247,0.3)] rounded-lg">
              <Wand2 className="w-3 h-3 mr-1" />
              AI
            </TabsTrigger>
            <TabsTrigger value="lighting" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-yellow-400 data-[state=active]:shadow-[0_0_10px_rgba(250,204,21,0.3)] rounded-lg">
              <Lightbulb className="w-3 h-3 mr-1" />
              Light
            </TabsTrigger>
          </TabsList>

          {/* Body Tab */}
          <TabsContent value="body" className="space-y-4 mt-0">
            <Section title="Body Type & Build" icon={User}>
              <div className="grid grid-cols-2 gap-2">
                {bodyTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleChange('bodyType', type.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      customization.bodyType === type.id
                        ? 'border-cyan-400 bg-cyan-400/15 shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                        : 'border-white/10 bg-white/5 hover:border-cyan-400/50 hover:bg-white/8'
                    }`}
                  >
                    <div className="text-2xl mb-1.5">{type.icon}</div>
                    <div className="text-xs font-bold text-white mb-0.5">{type.label}</div>
                    <div className="text-[10px] text-gray-400">{type.description}</div>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Proportions" icon={StretchVertical}>
              <RangeRow
                label="Height"
                min={1.5}
                max={2.1}
                step={0.01}
                value={customization.height}
                onChange={(v) => handleChange('height', v)}
                displayValue={`${customization.height.toFixed(2)}m`}
              />
              <RangeRow
                label="Head Scale"
                min={0.8}
                max={1.2}
                step={0.01}
                value={customization.headScale}
                onChange={(v) => handleChange('headScale', v)}
              />
              <RangeRow
                label="Shoulder Width"
                min={0.8}
                max={1.2}
                step={0.01}
                value={customization.shoulderWidth}
                onChange={(v) => handleChange('shoulderWidth', v)}
              />
              <RangeRow
                label="Limb Scale"
                min={0.8}
                max={1.2}
                step={0.01}
                value={customization.limbScale}
                onChange={(v) => handleChange('limbScale', v)}
              />
            </Section>

            <Section title="Face Shape" icon={Smile}>
              <div className="grid grid-cols-3 gap-2">
                {faceShapes.map(shape => (
                  <button
                    key={shape.id}
                    onClick={() => handleChange('faceShape', shape.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      customization.faceShape === shape.id
                        ? 'border-cyan-400 bg-cyan-400/15 shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                        : 'border-white/10 bg-white/5 hover:border-cyan-400/50 hover:bg-white/8'
                    }`}
                  >
                    <div className="text-xl mb-1">{shape.emoji}</div>
                    <p className="text-xs font-bold text-white">{shape.name}</p>
                  </button>
                ))}
              </div>
            </Section>
          </TabsContent>

          {/* Face Tab */}
          <TabsContent value="face" className="space-y-4 mt-0">
            <Section title="Hair Style" icon={Scissors}>
              <div className="grid grid-cols-4 gap-2">
                {filteredHairStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleHairStyleChange(style.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      customization.hairStyleId === style.id
                        ? 'border-cyan-400 bg-cyan-400/15 shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                        : 'border-white/10 bg-white/5 hover:border-cyan-400/50 hover:bg-white/8'
                    }`}
                  >
                    <div className="text-2xl mb-1">{style.thumbnail}</div>
                    <div className="text-xs font-bold text-white">{style.name}</div>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Hair Color" icon={Palette}>
              <ColorPresetGrid
                presets={hairColorPresets}
                value={customization.hairColor}
                onChange={(c) => handleChange('hairColor', c)}
                categoryFilter={selectedHairCategory}
                onCategoryChange={setSelectedHairCategory}
              />
              
              <div className="flex items-center gap-2 mt-3 p-3 bg-black/30 rounded-lg border border-white/10">
                <Label className="text-sm text-white font-medium flex-shrink-0">Custom</Label>
                <Input
                  type="text"
                  value={customization.hairColor}
                  onChange={(e) => handleChange('hairColor', e.target.value)}
                  className="flex-1 h-9 bg-black/40 border-white/20 text-white font-mono text-xs"
                  placeholder="#FFFFFF"
                />
                <input
                  type="color"
                  value={safeHex(customization.hairColor)}
                  onChange={(e) => handleChange('hairColor', e.target.value)}
                  className="h-9 w-14 rounded-lg overflow-hidden border-2 border-white/20 cursor-pointer hover:border-cyan-400/50 transition-all"
                />
              </div>
            </Section>

            <Section title="Facial Hair" icon={Scissors}>
              <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
                {['all', 'none', 'light', 'mustache', 'goatee', 'beard'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFacialHairCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                      selectedFacialHairCategory === cat
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_15px_rgba(251,146,60,0.4)]'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-3">
                {facialHairStyles
                  .filter(s => selectedFacialHairCategory === 'all' || s.category === selectedFacialHairCategory)
                  .map(style => (
                    <button
                      key={style.id}
                      onClick={() => handleChange('facialHairStyleId', style.id)}
                      className={`p-2.5 rounded-lg border-2 transition-all text-xs font-bold ${
                        customization.facialHairStyleId === style.id
                          ? 'border-amber-400 bg-amber-400/15 text-white shadow-[0_0_12px_rgba(251,146,60,0.3)]'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:border-amber-400/50 hover:bg-white/8'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-white/10">
                  <Label className="text-sm text-white font-medium flex-shrink-0">Color</Label>
                  <input
                    type="color"
                    value={safeHex(customization.facialHairColor)}
                    onChange={(e) => handleChange('facialHairColor', e.target.value)}
                    className="h-9 w-14 rounded-lg overflow-hidden border-2 border-white/20 cursor-pointer hover:border-amber-400/50 transition-all"
                  />
                </div>
                
                <RangeRow
                  label="Density"
                  min={0}
                  max={1}
                  step={0.01}
                  value={customization.facialHairDensity}
                  onChange={(v) => handleChange('facialHairDensity', v)}
                />
              </div>
            </Section>

            <Section title="Eyebrows" icon={Eye}>
              <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-white/10">
                <Label className="text-sm text-white font-medium flex-shrink-0">Color</Label>
                <input
                  type="color"
                  value={safeHex(customization.eyebrowColor)}
                  onChange={(e) => handleChange('eyebrowColor', e.target.value)}
                  className="h-9 w-14 rounded-lg overflow-hidden border-2 border-white/20 cursor-pointer hover:border-cyan-400/50 transition-all"
                />
              </div>
              
              <RangeRow
                label="Thickness"
                min={0}
                max={1}
                step={0.01}
                value={customization.eyebrowThickness}
                onChange={(v) => handleChange('eyebrowThickness', v)}
              />
            </Section>
          </TabsContent>

          {/* Eyes Tab */}
          <TabsContent value="eyes" className="space-y-4 mt-0">
            <Section title="Eye Color" icon={Eye}>
              <ColorPresetGrid
                presets={eyeColorPresets}
                value={customization.eyeColor}
                onChange={(c) => handleChange('eyeColor', c)}
                categoryFilter={selectedEyeCategory}
                onCategoryChange={setSelectedEyeCategory}
              />
              
              <div className="flex items-center gap-2 mt-3 p-3 bg-black/30 rounded-lg border border-white/10">
                <Label className="text-sm text-white font-medium flex-shrink-0">Custom</Label>
                <Input
                  type="text"
                  value={customization.eyeColor}
                  onChange={(e) => handleChange('eyeColor', e.target.value)}
                  className="flex-1 h-9 bg-black/40 border-white/20 text-white font-mono text-xs"
                  placeholder="#FFFFFF"
                />
                <input
                  type="color"
                  value={safeHex(customization.eyeColor)}
                  onChange={(e) => handleChange('eyeColor', e.target.value)}
                  className="h-9 w-14 rounded-lg overflow-hidden border-2 border-white/20 cursor-pointer hover:border-cyan-400/50 transition-all"
                />
              </div>
            </Section>
          </TabsContent>

          {/* Skin Tab */}
          <TabsContent value="skin" className="space-y-4 mt-0">
            <Section title="Skin Tone" icon={Palette}>
              <ColorPresetGrid
                presets={skinTonePresets}
                value={customization.skinTone}
                onChange={(c) => handleChange('skinTone', c)}
                categoryFilter={selectedSkinCategory}
                onCategoryChange={setSelectedSkinCategory}
              />
              
              <div className="flex items-center gap-2 mt-3 p-3 bg-black/30 rounded-lg border border-white/10">
                <Label className="text-sm text-white font-medium flex-shrink-0">Custom</Label>
                <Input
                  type="text"
                  value={customization.skinTone}
                  onChange={(e) => handleChange('skinTone', e.target.value)}
                  className="flex-1 h-9 bg-black/40 border-white/20 text-white font-mono text-xs"
                  placeholder="#FFFFFF"
                />
                <input
                  type="color"
                  value={safeHex(customization.skinTone)}
                  onChange={(e) => handleChange('skinTone', e.target.value)}
                  className="h-9 w-14 rounded-lg overflow-hidden border-2 border-white/20 cursor-pointer hover:border-orange-400/50 transition-all"
                />
              </div>
            </Section>

            <Section title="Finish" icon={Sparkles}>
              <div className="grid grid-cols-2 gap-2">
                {['matte', 'gloss'].map((finish) => (
                  <button
                    key={finish}
                    onClick={() => handleChange('skinFinish', finish)}
                    className={`p-3 rounded-lg border-2 transition-all capitalize font-bold text-sm ${
                      customization.skinFinish === finish
                        ? 'border-orange-400 bg-orange-400/15 text-white shadow-[0_0_15px_rgba(251,146,60,0.3)]'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-orange-400/50 hover:bg-white/8'
                    }`}
                  >
                    {finish}
                  </button>
                ))}
              </div>
            </Section>
          </TabsContent>

          {/* AI Stylist Tab */}
          <TabsContent value="ai" className="space-y-4 mt-0">
            <div className="relative overflow-hidden rounded-xl p-6 text-center" style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(168,85,247,0.2) 50%, rgba(192,132,252,0.15) 100%)',
              border: '1px solid rgba(168,85,247,0.3)'
            }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent"></div>
              <Zap className="w-16 h-16 text-purple-400 mx-auto mb-4 relative drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
              <h3 className="text-xl font-bold text-white mb-2 relative">AI Style Assistant</h3>
              <p className="text-sm text-gray-300 mb-6 relative">
                Get personalized styles from RPM & Player Zero AI
              </p>
              <button
                onClick={generateAIStyleSuggestions}
                disabled={aiStyleLoading}
                className="relative w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
              >
                {aiStyleLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generate AI Styles
                  </span>
                )}
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">How It Works</h4>
              {[
                { icon: Eye, text: 'Analyzes current avatar', color: 'text-cyan-400' },
                { icon: Sparkles, text: '3 unique style themes', color: 'text-purple-400' },
                { icon: Palette, text: 'Natural, Cyber & Fantasy', color: 'text-pink-400' },
                { icon: Zap, text: 'One-click application', color: 'text-yellow-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/8 transition-all">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-sm text-gray-200">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-xs text-purple-400 font-bold mb-1">💡 PRO TIP</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Generate multiple times for different combinations. Each suggestion is unique and inspired by real fashion trends!
              </p>
            </div>
          </TabsContent>

          {/* Lighting Tab — controlled via the viewport's built-in lighting menu */}
          <TabsContent value="lighting" className="mt-0">
            <div className="p-6 text-center text-gray-400 text-sm">
              <p className="mb-2 font-semibold text-white">Lighting Controls</p>
              <p>Use the 💡 button in the top-right of the viewport to change lighting presets.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Footer */}
      <div className="border-t border-white/10 p-4 bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
        <div className="flex gap-2">
          <Button
            onClick={resetToDefaults}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/10 hover:border-cyan-400/50 transition-all"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Avatar
              </>
            )}
          </Button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(0,212,255,0.5), rgba(0,170,255,0.7));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(0,212,255,0.7), rgba(0,170,255,0.9));
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default React.memo(CustomizationPanel);