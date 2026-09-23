import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Save,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Auto-detection service
const analyzeAsset = async (file, url) => {
  const analysis = {
    type: null,
    slot: null,
    fit: 'unisex',
    confidence: 0,
    validation: {
      fileSize: file?.size || 0,
      triCount: null,
      texturesCount: null,
      hasNPOT: false,
      missingNormals: false,
      scale: null
    },
    suggestions: []
  };

  const fileName = (file?.name || url || '').toLowerCase();
  
  if (fileName.includes('avatar') || fileName.includes('character') || fileName.includes('readyplayer')) {
    analysis.type = 'avatar';
    analysis.confidence = 0.9;
    analysis.suggestions.push('Detected as avatar based on filename');
    return analysis;
  }

  const wearableKeywords = {
    'footwear': ['boot', 'shoe', 'sneaker', 'sandal', 'heel'],
    'top': ['shirt', 'jacket', 'hoodie', 'tee', 'blouse', 'sweater'],
    'bottom': ['pant', 'jean', 'short', 'skirt', 'trouser'],
    'headwear': ['hat', 'cap', 'beanie', 'helmet', 'crown'],
    'eyewear': ['glass', 'shade', 'goggle', 'visor'],
    'gloves': ['glove', 'mitt'],
    'jewelry': ['ring', 'necklace', 'earring', 'bracelet'],
    'accessory': ['bag', 'backpack', 'belt', 'watch']
  };

  for (const [slot, keywords] of Object.entries(wearableKeywords)) {
    if (keywords.some(kw => fileName.includes(kw))) {
      analysis.type = 'wearable';
      analysis.slot = slot;
      analysis.confidence = 0.85;
      analysis.suggestions.push(`Pre-selected ${slot} based on filename`);
      return analysis;
    }
  }

  if (fileName.includes('anim') || fileName.includes('.fbx') || fileName.match(/walk|run|dance|idle/)) {
    analysis.type = 'animation';
    analysis.confidence = 0.8;
    analysis.suggestions.push('Detected as animation based on filename');
    return analysis;
  }

  if (file?.type?.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    analysis.type = 'image';
    analysis.confidence = 1.0;
    return analysis;
  }
  if (file?.type?.startsWith('video/') || fileName.match(/\.(mp4|mov|webm)$/)) {
    analysis.type = 'video';
    analysis.confidence = 1.0;
    return analysis;
  }

  analysis.type = 'wearable';
  analysis.slot = 'accessory';
  analysis.confidence = 0.3;
  analysis.suggestions.push('Unable to auto-detect. Please select type manually.');

  return analysis;
};

const validateAsset = (assetData, analysis) => {
  const warnings = [];
  const errors = [];
  const { fileSize } = analysis.validation;
  if (fileSize > 20 * 1024 * 1024) {
    warnings.push(`Large file: ${(fileSize / 1024 / 1024).toFixed(1)}MB. May be slow to load.`);
  }
  return { warnings, errors, isValid: errors.length === 0 };
};

export default function AssetTriageCard({ file, url, onConfirm, onCancel }) {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [assetData, setAssetData] = useState({
    type: null,
    name: '',
    slot: null,
    fit: 'unisex',
    layerPriority: 'mid',
    isRecolorable: false,
    physics: 'none',
    variants: [],
    marketIntent: 'private',
    price: 0,
    supply: 1,
    royalty: 5,
    retargetToAvatar: true,
    loopType: 'loop',
    duration: 0,
    sceneScale: 1,
    lightingPreset: 'neutral'
  });
  const [validation, setValidation] = useState({ warnings: [], errors: [], isValid: true });
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const performInitialAnalysis = async () => {
      setIsAnalyzing(true);
      const result = await analyzeAsset(file, url);
      setAnalysis(result);
      setAssetData(prev => ({
        ...prev,
        type: result.type,
        slot: result.slot,
        fit: result.fit,
        name: file?.name?.replace(/\.[^/.]+$/, '') || 'Untitled Asset'
      }));
      setIsAnalyzing(false);
    };
    performInitialAnalysis();
  }, [file, url]);

  useEffect(() => {
    if (analysis) {
      const validationResult = validateAsset(assetData, analysis);
      setValidation(validationResult);
    }
  }, [assetData, analysis]);

  const handleConfirm = () => {
    if (validation.isValid) {
      onConfirm({
        ...assetData,
        analysis,
        source: { fileName: file?.name, fileSize: file?.size, url }
      });
    }
  };

  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl overflow-hidden p-8"
        style={{ background: 'var(--bg-3)', border: '1px solid var(--glass-border)' }}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-skrt-cyan animate-spin mx-auto mb-4" />
          <p className="text-sm text-white/60">Analyzing asset...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-3)', border: '1px solid var(--glass-border)' }}
    >
      {/* Header */}
      <div className="px-6 py-4" style={{ background: 'var(--bg-4)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-white">Asset Configuration</h3>
            <p className="text-sm text-white/50 mt-1">
              {analysis?.confidence > 0.7 
                ? `Auto-detected as ${assetData.type}${assetData.slot ? ` (${assetData.slot})` : ''}`
                : 'Please confirm asset details'}
            </p>
          </div>
          <Badge className="bg-skrt-cyan/20 text-skrt-cyan border border-skrt-cyan/30 text-xs font-bold">
            Step {step} of 3
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Step 1: Asset Type */}
        {step >= 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-skrt-cyan text-black flex items-center justify-center text-xs font-bold">
                1
              </div>
              <Label className="text-base font-semibold text-white">Asset Type</Label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['avatar', 'wearable', 'animation', 'environment', 'image', 'video'].map((type) => (
                <button
                  key={type}
                  onClick={() => setAssetData(prev => ({ ...prev, type }))}
                  className="rounded-xl p-4 text-center transition-all"
                  style={{
                    background: assetData.type === type ? 'rgba(0,212,255,0.1)' : 'var(--bg-4)',
                    border: assetData.type === type ? '1px solid rgba(0,212,255,0.5)' : '1px solid var(--glass-border)',
                    boxShadow: assetData.type === type ? '0 0 12px rgba(0,212,255,0.2)' : 'none',
                  }}
                >
                  <div className={`font-medium capitalize ${assetData.type === type ? 'text-skrt-cyan' : 'text-white/80'}`}>{type}</div>
                  {assetData.type === type && (
                    <CheckCircle2 className="w-4 h-4 text-skrt-cyan mx-auto mt-2" />
                  )}
                </button>
              ))}
            </div>

            {analysis?.suggestions?.length > 0 && (
              <div className="flex items-start gap-2 rounded-lg p-3"
                style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <Info className="w-4 h-4 text-skrt-cyan flex-shrink-0 mt-0.5" />
                <div className="text-sm text-white/80">
                  {analysis.suggestions.map((suggestion, i) => (
                    <p key={i}>{suggestion}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Details */}
        {step >= 2 && assetData.type && (
          <div className="space-y-4 pt-6" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-skrt-cyan text-black flex items-center justify-center text-xs font-bold">
                2
              </div>
              <Label className="text-base font-semibold text-white">Details</Label>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm mb-2 text-white/70">Asset Name</Label>
                <Input
                  value={assetData.name}
                  onChange={(e) => setAssetData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter asset name..."
                  className="bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-skrt-cyan"
                />
              </div>

              {assetData.type === 'wearable' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm mb-2 text-white/70">Category (Slot)</Label>
                      <Select value={assetData.slot} onValueChange={(value) => setAssetData(prev => ({ ...prev, slot: value }))}>
                        <SelectTrigger className="bg-black/40 border-white/10 text-white">
                          <SelectValue placeholder="Select slot..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#12121E] border-white/10 text-white">
                          <SelectItem value="full_outfit">Full Outfit</SelectItem>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                          <SelectItem value="footwear">Footwear</SelectItem>
                          <SelectItem value="headwear">Headwear</SelectItem>
                          <SelectItem value="eyewear">Eyewear/Facewear</SelectItem>
                          <SelectItem value="gloves">Gloves</SelectItem>
                          <SelectItem value="jewelry">Jewelry</SelectItem>
                          <SelectItem value="accessory">Backpack/Accessory</SelectItem>
                          <SelectItem value="hair">Hair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm mb-2 text-white/70">Fit</Label>
                      <Select value={assetData.fit} onValueChange={(value) => setAssetData(prev => ({ ...prev, fit: value }))}>
                        <SelectTrigger className="bg-black/40 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#12121E] border-white/10 text-white">
                          <SelectItem value="unisex">Unisex</SelectItem>
                          <SelectItem value="masculine">Masculine</SelectItem>
                          <SelectItem value="feminine">Feminine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm mb-2 text-white/70">Layering Priority</Label>
                    <Select value={assetData.layerPriority} onValueChange={(value) => setAssetData(prev => ({ ...prev, layerPriority: value }))}>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#12121E] border-white/10 text-white">
                        <SelectItem value="under">Under (Base layer)</SelectItem>
                        <SelectItem value="mid">Mid (Standard)</SelectItem>
                        <SelectItem value="outer">Outer (Jacket/Coat)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-white/40 mt-1">Outer layers render over mid/under garments to reduce clipping</p>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label className="text-sm text-white/80">Recolorable</Label>
                      <p className="text-xs text-white/40">Let buyers choose color palettes</p>
                    </div>
                    <Switch
                      checked={assetData.isRecolorable}
                      onCheckedChange={(checked) => setAssetData(prev => ({ ...prev, isRecolorable: checked }))}
                    />
                  </div>

                  <div>
                    <Label className="text-sm mb-2 text-white/70">Physics</Label>
                    <Select value={assetData.physics} onValueChange={(value) => setAssetData(prev => ({ ...prev, physics: value }))}>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#12121E] border-white/10 text-white">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="cloth">Cloth Simulation</SelectItem>
                        <SelectItem value="hair">Hair Physics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {assetData.type === 'animation' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label className="text-sm text-white/80">Retarget to Current Avatar</Label>
                      <p className="text-xs text-white/40">Auto-fit animation to your avatar</p>
                    </div>
                    <Switch
                      checked={assetData.retargetToAvatar}
                      onCheckedChange={(checked) => setAssetData(prev => ({ ...prev, retargetToAvatar: checked }))}
                    />
                  </div>

                  <div>
                    <Label className="text-sm mb-2 text-white/70">Loop Type</Label>
                    <Select value={assetData.loopType} onValueChange={(value) => setAssetData(prev => ({ ...prev, loopType: value }))}>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#12121E] border-white/10 text-white">
                        <SelectItem value="loop">Looping</SelectItem>
                        <SelectItem value="oneshot">One-shot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {assetData.type === 'environment' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm mb-2 text-white/70">Scene Scale (meters)</Label>
                    <Slider
                      value={[assetData.sceneScale]}
                      onValueChange={([value]) => setAssetData(prev => ({ ...prev, sceneScale: value }))}
                      min={0.1}
                      max={10}
                      step={0.1}
                      className="my-4"
                    />
                    <p className="text-xs text-white/40">{assetData.sceneScale}m</p>
                  </div>

                  <div>
                    <Label className="text-sm mb-2 text-white/70">Lighting Preset</Label>
                    <Select value={assetData.lightingPreset} onValueChange={(value) => setAssetData(prev => ({ ...prev, lightingPreset: value }))}>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#12121E] border-white/10 text-white">
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="cyber">Cyber</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Settings Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-skrt-cyan hover:text-white transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Advanced Settings
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 pt-4"
                  style={{ borderTop: '1px solid var(--glass-border)' }}
                >
                  <div>
                    <Label className="text-sm mb-2 text-white/70">Marketplace Intent</Label>
                    <Select value={assetData.marketIntent} onValueChange={(value) => setAssetData(prev => ({ ...prev, marketIntent: value }))}>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#12121E] border-white/10 text-white">
                        <SelectItem value="private">Private (Personal Use)</SelectItem>
                        <SelectItem value="list">List for Sale</SelectItem>
                        <SelectItem value="drop">Scheduled Drop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {assetData.marketIntent !== 'private' && (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm mb-2 text-white/70">Price (ETH)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={assetData.price}
                          onChange={(e) => setAssetData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                          className="bg-black/40 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm mb-2 text-white/70">Supply</Label>
                        <Input
                          type="number"
                          value={assetData.supply}
                          onChange={(e) => setAssetData(prev => ({ ...prev, supply: parseInt(e.target.value) }))}
                          className="bg-black/40 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm mb-2 text-white/70">Royalty (%)</Label>
                        <Input
                          type="number"
                          value={assetData.royalty}
                          onChange={(e) => setAssetData(prev => ({ ...prev, royalty: parseInt(e.target.value) }))}
                          className="bg-black/40 border-white/10 text-white"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Step 3: Review */}
        {step >= 3 && (
          <div className="space-y-4 pt-6" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-skrt-cyan text-black flex items-center justify-center text-xs font-bold">
                3
              </div>
              <Label className="text-base font-semibold text-white">Review & Confirm</Label>
            </div>

            <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-4)', border: '1px solid var(--glass-border)' }}>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Name:</span>
                <span className="font-medium text-white">{assetData.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Type:</span>
                <span className="font-medium text-white capitalize">{assetData.type}</span>
              </div>
              {assetData.type === 'wearable' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Slot:</span>
                    <span className="font-medium text-white capitalize">{assetData.slot?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Fit:</span>
                    <span className="font-medium text-white capitalize">{assetData.fit}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Market:</span>
                <span className="font-medium text-white capitalize">{assetData.marketIntent}</span>
              </div>
            </div>

            {validation.warnings.length > 0 && (
              <div className="space-y-2">
                {validation.warnings.map((warning, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg p-3"
                    style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
                    <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-200">{warning}</p>
                  </div>
                ))}
              </div>
            )}

            {validation.warnings.length === 0 && (
              <div className="flex items-center gap-2 rounded-lg p-3"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <p className="text-sm text-green-300">Ready to add!</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <Button
            variant="outline"
            onClick={step === 1 ? onCancel : () => setStep(step - 1)}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          <div className="flex gap-2">
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!assetData.type || (assetData.type === 'wearable' && !assetData.slot)}
                className="bg-skrt-cyan text-black font-bold hover:bg-skrt-cyan/80"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleConfirm}
                disabled={!validation.isValid}
                className="bg-skrt-cyan text-black font-bold hover:bg-skrt-cyan/80"
              >
                <Save className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}