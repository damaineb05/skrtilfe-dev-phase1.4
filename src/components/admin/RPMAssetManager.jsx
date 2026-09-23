import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Upload,
  Trash,
  Eye,
  Loader,
  Search,
  Filter,
  Package,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const ASSET_TYPES = [
  { value: 'outfit', label: 'Full Outfit' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'headwear', label: 'Headwear' },
  { value: 'glasses', label: 'Glasses' },
  { value: 'facewear', label: 'Face Wear' },
  { value: 'hair', label: 'Hair' },
  { value: 'beard', label: 'Beard' },
];

const GENDERS = [
  { value: 'neutral', label: 'Neutral (All)' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export default function RPMAssetManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterGender, setFilterGender] = useState('all');

  // Fetch RPM Assets
  const { data: assets, isLoading, error, refetch } = useQuery({
    queryKey: ['rpm-assets'],
    queryFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: 'fetch_rpm_assets'
      });
      return response?.assets || [];
    },
    initialData: [],
  });

  // Upload File Mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      return await base44.integrations.Core.UploadFile({ file });
    },
  });

  // Create Asset Mutation
  const createAssetMutation = useMutation({
    mutationFn: async (assetData) => {
      // This would call your backend endpoint that proxies to RPM API
      const response = await fetch('/api/rpm/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: assetData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create asset');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rpm-assets'] });
      setShowCreateDialog(false);
      toast({
        title: "Asset Created",
        description: "Your custom asset has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message,
      });
    },
  });

  // Delete Asset Mutation
  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId) => {
      const response = await fetch(`/api/rpm/assets/${assetId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rpm-assets'] });
      toast({
        title: "Asset Deleted",
        description: "Asset has been removed from your library.",
      });
    },
  });

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesGender = filterGender === 'all' || asset.gender === filterGender;
    return matchesSearch && matchesType && matchesGender;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-indigo-600" />
                RPM Asset Manager
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your Ready Player Me custom assets
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Asset</DialogTitle>
                  </DialogHeader>
                  <CreateAssetForm
                    onSubmit={(data) => createAssetMutation.mutate(data)}
                    onUploadFile={(file) => uploadFileMutation.mutateAsync(file)}
                    isLoading={createAssetMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search assets..."
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ASSET_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterGender} onValueChange={setFilterGender}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                {GENDERS.map(gender => (
                  <SelectItem key={gender.value} value={gender.value}>
                    {gender.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Assets Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-red-800">Failed to load assets</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assets Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all' || filterGender !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first custom asset to get started'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create First Asset
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onDelete={() => deleteAssetMutation.mutate(asset.id)}
                isDeleting={deleteAssetMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateAssetForm({ onSubmit, onUploadFile, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'outfit',
    gender: 'neutral',
    modelUrl: '',
    iconUrl: '',
    locked: false,
  });

  const [modelFile, setModelFile] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const handleModelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.glb')) {
      alert('Please upload a .glb file');
      return;
    }

    setUploadingModel(true);
    try {
      const result = await onUploadFile(file);
      setFormData(prev => ({ ...prev, modelUrl: result.file_url }));
      setModelFile(file);
    } catch (error) {
      alert('Failed to upload model');
    } finally {
      setUploadingModel(false);
    }
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG or JPG file');
      return;
    }

    setUploadingIcon(true);
    try {
      const result = await onUploadFile(file);
      setFormData(prev => ({ ...prev, iconUrl: result.file_url }));
      setIconFile(file);
    } catch (error) {
      alert('Failed to upload icon');
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.modelUrl || !formData.iconUrl) {
      alert('Please fill all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Asset Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="My Custom Jacket"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSET_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map(gender => (
                <SelectItem key={gender.value} value={gender.value}>
                  {gender.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="model">3D Model (GLB) *</Label>
        <div className="mt-2">
          <label className="block w-full cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
              {uploadingModel ? (
                <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              ) : formData.modelUrl ? (
                <div className="text-green-600">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">{modelFile?.name || 'Model uploaded'}</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload GLB file</p>
                </>
              )}
            </div>
            <input
              type="file"
              accept=".glb"
              onChange={handleModelUpload}
              className="hidden"
              disabled={uploadingModel}
            />
          </label>
        </div>
      </div>

      <div>
        <Label htmlFor="icon">Icon Image (PNG/JPG) *</Label>
        <div className="mt-2">
          <label className="block w-full cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
              {uploadingIcon ? (
                <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              ) : formData.iconUrl ? (
                <div>
                  <img src={formData.iconUrl} alt="Icon preview" className="w-20 h-20 object-cover mx-auto rounded-lg mb-2" />
                  <p className="text-sm text-green-600 font-medium">Icon uploaded</p>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload icon</p>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleIconUpload}
              className="hidden"
              disabled={uploadingIcon}
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="locked"
          checked={formData.locked}
          onChange={(e) => setFormData(prev => ({ ...prev, locked: e.target.checked }))}
          className="rounded"
        />
        <Label htmlFor="locked" className="cursor-pointer">
          Locked (requires unlock before use)
        </Label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !formData.name || !formData.modelUrl || !formData.iconUrl}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Asset'
          )}
        </Button>
      </div>
    </form>
  );
}

function AssetCard({ asset, onDelete, isDeleting }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 relative group">
        {asset.iconUrl ? (
          <img
            src={asset.iconUrl}
            alt={asset.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-red-500/90 hover:bg-red-600 text-white"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{asset.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
            {asset.type}
          </span>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
            {asset.gender}
          </span>
          {asset.locked && (
            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
              Locked
            </span>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{asset.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <img
                  src={asset.iconUrl}
                  alt={asset.name}
                  className="w-full rounded-lg"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-600">Type</Label>
                  <p className="font-medium">{asset.type}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Gender</Label>
                  <p className="font-medium">{asset.gender}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Model URL</Label>
                  <p className="text-sm text-gray-600 truncate">{asset.modelUrl}</p>
                </div>
                {asset.locked && (
                  <div>
                    <Label className="text-sm text-yellow-600">Status</Label>
                    <p className="font-medium text-yellow-600">Locked</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}