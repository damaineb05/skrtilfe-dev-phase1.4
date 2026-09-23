import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { parseMetadata, resolveIpfsUri } from './assetLoader';

export default function MetadataEditor({
  initialMetadata = null,
  tokenUri = '',
  onChange,
  onFetchComplete,
  className = ''
}) {
  const [metadata, setMetadata] = useState(initialMetadata || {
    name: '',
    description: '',
    image: '',
    animation_url: '',
    external_url: '',
    background_color: '',
    attributes: []
  });
  const [uriInput, setUriInput] = useState(tokenUri);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [fetchSuccess, setFetchSuccess] = useState(false);

  useEffect(() => {
    if (initialMetadata) {
      setMetadata(initialMetadata);
    }
  }, [initialMetadata]);

  useEffect(() => {
    onChange?.(metadata);
  }, [metadata, onChange]);

  const handleFetchMetadata = async () => {
    if (!uriInput.trim()) return;

    setIsFetching(true);
    setFetchError(null);
    setFetchSuccess(false);

    try {
      const parsed = await parseMetadata(uriInput.trim());
      setMetadata(parsed);
      setFetchSuccess(true);
      onFetchComplete?.(parsed);
      setTimeout(() => setFetchSuccess(false), 3000);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setIsFetching(false);
    }
  };

  const updateField = (field, value) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const addAttribute = () => {
    setMetadata(prev => ({
      ...prev,
      attributes: [...(prev.attributes || []), { trait_type: '', value: '' }]
    }));
  };

  const updateAttribute = (index, field, value) => {
    setMetadata(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const removeAttribute = (index) => {
    setMetadata(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const exportMetadata = () => {
    const { _raw, ...exportData } = metadata;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.name || 'metadata'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importMetadata = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        setMetadata(prev => ({ ...prev, ...imported }));
      } catch (err) {
        setFetchError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Fetch from URI */}
      <div className="space-y-3">
        <Label className="text-white">Fetch from Token URI</Label>
        <div className="flex gap-2">
          <Input
            value={uriInput}
            onChange={(e) => setUriInput(e.target.value)}
            placeholder="https:// or ipfs://..."
            className="flex-1 bg-gray-800 border-gray-700 text-white"
          />
          <Button
            onClick={handleFetchMetadata}
            disabled={isFetching || !uriInput.trim()}
            className="bg-cyan-500 hover:bg-cyan-600 text-black"
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>

        <AnimatePresence>
          {fetchError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              {fetchError}
            </motion.div>
          )}
          {fetchSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-green-400 text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Metadata fetched successfully
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Basic Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white">Name *</Label>
          <Input
            value={metadata.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Asset name"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Description</Label>
          <Textarea
            value={metadata.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Asset description"
            rows={3}
            className="bg-gray-800 border-gray-700 text-white resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Image URL</Label>
            <Input
              value={metadata.image || ''}
              onChange={(e) => updateField('image', e.target.value)}
              placeholder="https:// or ipfs://..."
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Animation URL</Label>
            <Input
              value={metadata.animation_url || ''}
              onChange={(e) => updateField('animation_url', e.target.value)}
              placeholder="https:// or ipfs://..."
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">External URL</Label>
            <Input
              value={metadata.external_url || ''}
              onChange={(e) => updateField('external_url', e.target.value)}
              placeholder="https://..."
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Background Color</Label>
            <div className="flex gap-2">
              <Input
                value={metadata.background_color || ''}
                onChange={(e) => updateField('background_color', e.target.value.replace('#', ''))}
                placeholder="FFFFFF"
                className="flex-1 bg-gray-800 border-gray-700 text-white"
              />
              <div 
                className="w-10 h-10 rounded border border-gray-700"
                style={{ backgroundColor: `#${metadata.background_color || '000000'}` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attributes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-white">Attributes</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={addAttribute}
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {(metadata.attributes || []).map((attr, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2"
            >
              <Input
                value={attr.trait_type || ''}
                onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                placeholder="Trait type"
                className="flex-1 bg-gray-800 border-gray-700 text-white"
              />
              <Input
                value={attr.value || ''}
                onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                placeholder="Value"
                className="flex-1 bg-gray-800 border-gray-700 text-white"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeAttribute(index)}
                className="w-8 h-8 p-0 text-gray-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}

          {(metadata.attributes || []).length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              No attributes added yet
            </p>
          )}
        </div>
      </div>

      {/* Import/Export */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
        <Button
          variant="outline"
          onClick={exportMetadata}
          className="flex-1 border-gray-700 text-white hover:bg-gray-800"
        >
          <Download className="w-4 h-4 mr-2" />
          Export JSON
        </Button>

        <label className="flex-1">
          <input
            type="file"
            accept=".json"
            onChange={importMetadata}
            className="hidden"
          />
          <Button
            variant="outline"
            className="w-full border-gray-700 text-white hover:bg-gray-800"
            asChild
          >
            <span>
              <Upload className="w-4 h-4 mr-2" />
              Import JSON
            </span>
          </Button>
        </label>
      </div>

      {/* Preview */}
      {(metadata.image || metadata.animation_url) && (
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <h4 className="text-white text-sm font-medium mb-2">Preview URLs</h4>
          <div className="space-y-2 text-xs">
            {metadata.image && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-gray-700">Image</Badge>
                <a 
                  href={resolveIpfsUri(metadata.image)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline truncate flex-1"
                >
                  {resolveIpfsUri(metadata.image)}
                </a>
              </div>
            )}
            {metadata.animation_url && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-gray-700">Animation</Badge>
                <a 
                  href={resolveIpfsUri(metadata.animation_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline truncate flex-1"
                >
                  {resolveIpfsUri(metadata.animation_url)}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}