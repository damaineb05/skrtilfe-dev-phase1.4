import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  X, 
  FileText, 
  DollarSign, 
  Percent,
  ExternalLink,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MetadataForm({ 
  initialData = {}, 
  onDataChange, 
  onValidationChange,
  className = ""
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    collection_name: '',
    traits: [],
    supply_type: 'ERC-721',
    supply: 1,
    price_eth: '',
    royalties_percent: 5,
    external_url: '',
    unlockable_content: '',
    sensitive_content: false,
    ...initialData
  });

  const [ethToUsd, setEthToUsd] = useState(3200); // Mock ETH price
  const [errors, setErrors] = useState({});
  const [newTrait, setNewTrait] = useState({ trait_type: '', value: '' });

  useEffect(() => {
    onDataChange?.(formData);
    
    // Basic validation
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.price_eth && (isNaN(formData.price_eth) || formData.price_eth <= 0)) {
      newErrors.price_eth = 'Price must be a positive number';
    }
    if (formData.royalties_percent < 0 || formData.royalties_percent > 10) {
      newErrors.royalties_percent = 'Royalties must be between 0-10%';
    }
    
    setErrors(newErrors);
    onValidationChange?.(Object.keys(newErrors).length === 0);
  }, [formData, onDataChange, onValidationChange]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTrait = () => {
    if (!newTrait.trait_type.trim() || !newTrait.value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      traits: [...prev.traits, { ...newTrait, id: Date.now() }]
    }));
    setNewTrait({ trait_type: '', value: '' });
  };

  const removeTrait = (index) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.filter((_, i) => i !== index)
    }));
  };

  const updateTrait = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.map((trait, i) => 
        i === index ? { ...trait, [field]: value } : trait
      )
    }));
  };

  return (
    <Card className={`glass-card neon-border ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="w-5 h-5 text-cyan-400" />
          NFT Metadata
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter NFT title..."
              className={`bg-black/50 border-gray-600 text-white ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe your NFT... (Markdown supported)"
              rows={3}
              className="bg-black/50 border-gray-600 text-white resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Supports **bold**, *italic*, and [links](url)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Collection
            </label>
            <Select value={formData.collection_name} onValueChange={(value) => updateField('collection_name', value)}>
              <SelectTrigger className="bg-black/50 border-gray-600 text-white">
                <SelectValue placeholder="Select or create collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="genesis">Genesis Collection</SelectItem>
                <SelectItem value="digital-society">Digital Society</SelectItem>
                <SelectItem value="create-new">+ Create New Collection</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="border-gray-700" />

        {/* Traits/Attributes */}
        <div>
          <h3 className="font-medium text-white mb-4 flex items-center gap-2">
            Traits & Attributes
            <Badge variant="outline" className="text-xs">
              {formData.traits.length} traits
            </Badge>
          </h3>

          {/* Existing Traits */}
          <AnimatePresence>
            {formData.traits.map((trait, index) => (
              <motion.div
                key={trait.id || index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-2 mb-2"
              >
                <Input
                  value={trait.trait_type}
                  onChange={(e) => updateTrait(index, 'trait_type', e.target.value)}
                  placeholder="Trait type"
                  className="bg-black/50 border-gray-600 text-white flex-1"
                />
                <Input
                  value={trait.value}
                  onChange={(e) => updateTrait(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="bg-black/50 border-gray-600 text-white flex-1"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeTrait(index)}
                  className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add New Trait */}
          <div className="flex gap-2 mt-3">
            <Input
              value={newTrait.trait_type}
              onChange={(e) => setNewTrait(prev => ({ ...prev, trait_type: e.target.value }))}
              placeholder="Trait type (e.g., Color)"
              className="bg-black/50 border-gray-600 text-white flex-1"
            />
            <Input
              value={newTrait.value}
              onChange={(e) => setNewTrait(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Value (e.g., Blue)"
              className="bg-black/50 border-gray-600 text-white flex-1"
            />
            <Button
              onClick={addTrait}
              disabled={!newTrait.trait_type.trim() || !newTrait.value.trim()}
              className="btn-neon-primary min-w-[40px]"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Separator className="border-gray-700" />

        {/* Supply Type & Edition */}
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Token Standard
            </label>
            <Select value={formData.supply_type} onValueChange={(value) => updateField('supply_type', value)}>
              <SelectTrigger className="bg-black/50 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ERC-721">ERC-721 (Unique 1/1)</SelectItem>
                <SelectItem value="ERC-1155">ERC-1155 (Editions)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.supply_type === 'ERC-1155' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Edition Size
              </label>
              <Input
                type="number"
                min="1"
                max="10000"
                value={formData.supply}
                onChange={(e) => updateField('supply', parseInt(e.target.value) || 1)}
                className="bg-black/50 border-gray-600 text-white"
              />
            </div>
          )}
        </div>

        <Separator className="border-gray-700" />

        {/* Pricing & Royalties */}
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              Initial Price (ETH)
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.001"
                min="0"
                value={formData.price_eth}
                onChange={(e) => updateField('price_eth', e.target.value)}
                placeholder="0.05"
                className={`bg-black/50 border-gray-600 text-white ${errors.price_eth ? 'border-red-500' : ''}`}
              />
              {formData.price_eth && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  ≈ ${(parseFloat(formData.price_eth) * ethToUsd).toFixed(0)}
                </div>
              )}
            </div>
            {errors.price_eth && (
              <p className="text-red-400 text-xs mt-1">{errors.price_eth}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Percent className="w-4 h-4 text-purple-400" />
              Creator Royalties (%)
            </label>
            <Input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.royalties_percent}
              onChange={(e) => updateField('royalties_percent', parseFloat(e.target.value) || 0)}
              className={`bg-black/50 border-gray-600 text-white ${errors.royalties_percent ? 'border-red-500' : ''}`}
            />
            <p className="text-xs text-gray-400 mt-1">
              Earn royalties on secondary sales (EIP-2981 standard)
            </p>
            {errors.royalties_percent && (
              <p className="text-red-400 text-xs mt-1">{errors.royalties_percent}</p>
            )}
          </div>
        </div>

        <Separator className="border-gray-700" />

        {/* Additional Options */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-400" />
              External Link (Optional)
            </label>
            <Input
              type="url"
              value={formData.external_url}
              onChange={(e) => updateField('external_url', e.target.value)}
              placeholder="https://your-website.com"
              className="bg-black/50 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Link to your portfolio, project, or related content
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-400" />
              Unlockable Content (Optional)
            </label>
            <Textarea
              value={formData.unlockable_content}
              onChange={(e) => updateField('unlockable_content', e.target.value)}
              placeholder="Private content only the owner can view..."
              rows={2}
              className="bg-black/50 border-gray-600 text-white resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              This content will be encrypted and only accessible to the NFT owner
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-white">Sensitive Content</span>
            </div>
            <Switch
              checked={formData.sensitive_content}
              onCheckedChange={(checked) => updateField('sensitive_content', checked)}
            />
          </div>
          <p className="text-xs text-gray-400 -mt-2">
            Mark if this content is not suitable for all audiences
          </p>
        </div>
      </CardContent>
    </Card>
  );
}