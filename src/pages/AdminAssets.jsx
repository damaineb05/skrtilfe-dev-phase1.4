import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Image,
  Video,
  FileBox,
  Upload,
  Search,
  Grid3X3,
  List,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Eye,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
} from "@/components/ui/dialog";
import { uploadAndTrack, generateAndTrack } from '../components/utils/assetTracker';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';
import Model3DViewer from '../components/ui/Model3DViewer';

function AssetCard({ asset, onSelect, onDelete, onCopyUrl, isSelected }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(asset.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopyUrl?.(asset.url);
  };

  const getTypeIcon = () => {
    switch (asset.type) {
      case 'video': return <Video className="w-4 h-4" />;
      case '3d_model': return <FileBox className="w-4 h-4" />;
      default: return <Image className="w-4 h-4" />;
    }
  };

  const getSourceColor = () => {
    switch (asset.source) {
      case 'ai_generated': return 'bg-[#ff00ff] text-black';
      case 'product': return 'bg-[#00ffff] text-black';
      case 'blog': return 'bg-[#ffff00] text-black';
      case 'avatar': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
        isSelected ? 'border-[#00ffff] ring-2 ring-[#00ffff]/30' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect?.(asset)}
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {asset.type === 'image' ? (
          <img
            src={asset.url}
            alt={asset.alt_text || asset.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : asset.type === '3d_model' ? (
          <Model3DViewer 
            url={asset.url}
            autoRotate={true}
            showControls={false}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            {getTypeIcon()}
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            title="Copy URL"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              if (asset.type === '3d_model') {
                onSelect?.(asset);
              } else {
                window.open(asset.url, '_blank');
              }
            }}
            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            title={asset.type === '3d_model' ? 'View 3D Model' : 'View Full'}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(asset); }}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Source Badge */}
        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getSourceColor()}`}>
          {asset.source === 'ai_generated' ? 'AI' : asset.source}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-medium text-sm truncate text-gray-900">{asset.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">{asset.folder}</span>
          <span className="text-xs text-gray-400">
            {new Date(asset.created_date).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function AssetListItem({ asset, onSelect, onDelete, onCopyUrl }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(asset.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopyUrl?.(asset.url);
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {asset.type === 'image' ? (
          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileBox className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{asset.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">{asset.source}</Badge>
          <span className="text-xs text-gray-500">{asset.folder}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={handleCopy}>
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete?.(asset)}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

function AdminAssetsContent() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [folderFilter, setFolderFilter] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: assets = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-assets'],
    queryFn: () => base44.entities.Asset.list('-created_date', 200),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Asset.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-assets']),
  });

  // Get unique folders
  const folders = [...new Set(assets.map(a => a.folder).filter(Boolean))];

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = !searchQuery || 
      asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSource = sourceFilter === 'all' || asset.source === sourceFilter;
    const matchesFolder = folderFilter === 'all' || asset.folder === folderFilter;
    return matchesSearch && matchesSource && matchesFolder && !asset.is_archived;
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        await uploadAndTrack(file, {
          folder: folderFilter !== 'all' ? folderFilter : 'Uploads'
        });
      }
      refetch();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setShowUploadModal(false);
    }
  };

  const handleGenerate = async () => {
    if (!generatePrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      await generateAndTrack(generatePrompt, {
        name: generatePrompt.slice(0, 50) + '...',
        folder: 'AI Generated'
      });
      refetch();
      setGeneratePrompt('');
      setShowGenerateModal(false);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const stats = {
    total: assets.length,
    images: assets.filter(a => a.type === 'image').length,
    aiGenerated: assets.filter(a => a.source === 'ai_generated').length,
    products: assets.filter(a => a.source === 'product').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                All uploaded and generated media in one place
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowGenerateModal(true)}
                className="border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff]/10"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#00ffff] text-black hover:bg-[#00ffff]/80"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.glb,.gltf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Assets</p>
            </div>
            <div className="bg-[#00ffff]/10 rounded-lg p-4">
              <p className="text-2xl font-bold text-[#00ffff]">{stats.images}</p>
              <p className="text-sm text-gray-500">Images</p>
            </div>
            <div className="bg-[#ff00ff]/10 rounded-lg p-4">
              <p className="text-2xl font-bold text-[#ff00ff]">{stats.aiGenerated}</p>
              <p className="text-sm text-gray-500">AI Generated</p>
            </div>
            <div className="bg-[#ffff00]/10 rounded-lg p-4">
              <p className="text-2xl font-bold text-[#cccc00]">{stats.products}</p>
              <p className="text-sm text-gray-500">Product Assets</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="upload">Uploaded</SelectItem>
                <SelectItem value="ai_generated">AI Generated</SelectItem>
                <SelectItem value="product">Products</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="avatar">Avatars</SelectItem>
              </SelectContent>
            </Select>
            <Select value={folderFilter} onValueChange={setFolderFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#00ffff]" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-20">
            <Image className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No assets found</p>
            <p className="text-gray-400 text-sm mt-1">Upload or generate your first asset</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredAssets.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onSelect={setSelectedAsset}
                onDelete={(a) => deleteMutation.mutate(a.id)}
                isSelected={selectedAsset?.id === asset.id}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAssets.map(asset => (
              <AssetListItem
                key={asset.id}
                asset={asset}
                onSelect={setSelectedAsset}
                onDelete={(a) => deleteMutation.mutate(a.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Generate Modal */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ff00ff]" />
              Generate AI Image
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <textarea
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#ff00ff]"
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !generatePrompt.trim()}
              className="w-full bg-[#ff00ff] hover:bg-[#ff00ff]/80 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#00ffff] mx-auto mb-4" />
            <p className="font-medium">Uploading assets...</p>
          </div>
        </div>
      )}

      {/* 3D Preview Modal */}
      {selectedAsset?.type === '3d_model' && (
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-4xl h-[80vh] bg-black border-cyan-500/30">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <FileBox className="w-5 h-5 text-cyan-400" />
                {selectedAsset.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 rounded-xl overflow-hidden border border-cyan-500/20">
              <Model3DViewer 
                url={selectedAsset.url}
                autoRotate={true}
                showControls={true}
                className="w-full h-full"
              />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="text-sm text-white/60">
                <p>Source: <span className="text-cyan-400">{selectedAsset.source}</span></p>
                <p>Created: {new Date(selectedAsset.created_date).toLocaleDateString()}</p>
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(selectedAsset.url);
                }}
                className="bg-cyan-500 hover:bg-cyan-600 text-black"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy URL
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function AdminAssets() {
  return (
    <AdminProtectedRoute>
      <AdminAssetsContent />
    </AdminProtectedRoute>
  );
}