import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Coins,
  Upload,
  Image,
  Package,
  Tag,
  Loader2,
  X,
  Sparkles
} from 'lucide-react';

const ASSET_TYPES = ['wearable', 'environment', 'emote', 'bundle'];
const CATEGORIES = ['headwear', 'top', 'bottom', 'footwear', 'accessory', 'full_outfit', 'environment', 'animation', 'effect'];
const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const RARITY_PRICES = {
  common: { min: 10, suggested: 25 },
  uncommon: { min: 25, suggested: 50 },
  rare: { min: 50, suggested: 100 },
  epic: { min: 100, suggested: 250 },
  legendary: { min: 250, suggested: 500 }
};

export default function CreateListingModal({ isOpen, onClose, currentUser, inventoryItem = null }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: inventoryItem?.asset_name || '',
    description: '',
    asset_type: inventoryItem?.asset_type || 'wearable',
    asset_url: inventoryItem?.asset_url || '',
    thumbnail_url: inventoryItem?.thumbnail_url || '',
    price: 50,
    category: inventoryItem?.category || 'accessory',
    rarity: inventoryItem?.rarity || 'common',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [assetFile, setAssetFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const createListingMutation = useMutation({
    mutationFn: async (data) => {
      let finalAssetUrl = data.asset_url;
      let finalThumbnailUrl = data.thumbnail_url;

      // Upload files if provided
      if (assetFile) {
        setIsUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: assetFile });
        finalAssetUrl = file_url;
      }

      if (thumbnailFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: thumbnailFile });
        finalThumbnailUrl = file_url;
      }
      setIsUploading(false);

      // Create the listing
      const listing = await base44.entities.MarketplaceListing.create({
        seller_email: currentUser.email,
        title: data.title,
        description: data.description,
        asset_type: data.asset_type,
        asset_url: finalAssetUrl,
        thumbnail_url: finalThumbnailUrl,
        price: data.price,
        category: data.category,
        rarity: data.rarity,
        tags: data.tags,
        status: 'active',
        views: 0,
        favorites: 0,
        asset_metadata: inventoryItem?.asset_metadata || {}
      });

      // If listing from inventory, mark item as not tradeable temporarily
      if (inventoryItem) {
        await base44.entities.UserInventory.update(inventoryItem.id, { is_tradeable: false });
      }

      return listing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-inventory'] });
      toast({
        title: "Listing Created!",
        description: "Your item is now live on the marketplace.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create listing",
        description: error.message || "Please try again",
      });
    }
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.asset_url || formData.price < 1) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields",
      });
      return;
    }

    createListingMutation.mutate(formData);
  };

  const suggestedPrice = RARITY_PRICES[formData.rarity]?.suggested || 50;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-yellow-400" />
            Create Listing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label className="text-gray-300">Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter item name"
              className="bg-gray-800 border-gray-700 text-white mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-gray-300">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your item..."
              className="bg-gray-800 border-gray-700 text-white mt-1 h-20"
            />
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300">Type *</Label>
              <Select value={formData.asset_type} onValueChange={(v) => setFormData({ ...formData, asset_type: v })}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300">Category *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rarity and Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300">Rarity</Label>
              <Select value={formData.rarity} onValueChange={(v) => setFormData({ ...formData, rarity: v })}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RARITIES.map(rarity => (
                    <SelectItem key={rarity} value={rarity} className="capitalize">{rarity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300">Price (DripCoins) *</Label>
              <div className="relative mt-1">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
                <Input
                  type="number"
                  min={RARITY_PRICES[formData.rarity]?.min || 10}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="pl-9 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Suggested: {suggestedPrice} DC for {formData.rarity}
              </p>
            </div>
          </div>

          {/* Asset URL */}
          {!inventoryItem && (
            <div>
              <Label className="text-gray-300">Asset URL or Upload *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={formData.asset_url}
                  onChange={(e) => setFormData({ ...formData, asset_url: e.target.value })}
                  placeholder="https://... or upload file"
                  className="bg-gray-800 border-gray-700 text-white flex-1"
                />
                <Button
                  variant="outline"
                  className="border-gray-600"
                  onClick={() => document.getElementById('asset-upload').click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <input
                  id="asset-upload"
                  type="file"
                  accept=".glb,.gltf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setAssetFile(e.target.files[0]);
                      setFormData({ ...formData, asset_url: e.target.files[0].name });
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Thumbnail */}
          <div>
            <Label className="text-gray-300">Thumbnail</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="Image URL or upload"
                className="bg-gray-800 border-gray-700 text-white flex-1"
              />
              <Button
                variant="outline"
                className="border-gray-600"
                onClick={() => document.getElementById('thumb-upload').click()}
              >
                <Image className="w-4 h-4" />
              </Button>
              <input
                id="thumb-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setThumbnailFile(e.target.files[0]);
                    setFormData({ ...formData, thumbnail_url: e.target.files[0].name });
                  }
                }}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-gray-300">Tags</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tags..."
                className="bg-gray-800 border-gray-700 text-white flex-1"
              />
              <Button variant="outline" className="border-gray-600" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} className="bg-gray-700 text-white">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          {(formData.thumbnail_url || thumbnailFile) && (
            <div className="bg-gray-800/50 rounded-xl p-3">
              <Label className="text-gray-300 text-xs">Preview</Label>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-16 h-16 rounded-lg bg-gray-700 overflow-hidden">
                  {thumbnailFile ? (
                    <img src={URL.createObjectURL(thumbnailFile)} alt="" className="w-full h-full object-cover" />
                  ) : formData.thumbnail_url ? (
                    <img src={formData.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-white">{formData.title || 'Item Title'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="text-[10px] capitalize">{formData.rarity}</Badge>
                    <span className="flex items-center gap-1 text-yellow-400 text-sm">
                      <Coins className="w-3 h-3" />
                      {formData.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 border-gray-600" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-bold"
              onClick={handleSubmit}
              disabled={createListingMutation.isPending || isUploading}
            >
              {(createListingMutation.isPending || isUploading) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isUploading ? 'Uploading...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  List for Sale
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}