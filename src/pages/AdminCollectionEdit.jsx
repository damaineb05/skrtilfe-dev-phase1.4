import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, Save, Info, Globe, Twitter, MessageCircle, 
  Instagram, Shield, Eye, Calendar, Clock, Upload as UploadIcon,
  AlertTriangle, CheckCircle, Settings, Trash2
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';
import MediaUploader from '../components/admin/MediaUploader';

// Mock collection data for editing
const mockCollection = {
  id: 'col_1',
  name: 'Genesis Origins',
  slug: 'genesis-origins',
  description: 'The first collection in the Genesis ecosystem, featuring unique avatars and digital identities.',
  category: 'pfp',
  logo_url: 'https://images.unsplash.com/photo-1617791160588-241658c0f566?w=200&h=200&fit=crop',
  featured_url: 'https://images.unsplash.com/photo-1617791160588-241658c0f566?w=600&h=400&fit=crop',
  banner_url: 'https://images.unsplash.com/photo-1617791160588-241658c0f566?w=1200&h=400&fit=crop',
  website: 'https://skrtlife.io',
  twitter: 'skrtlife_io',
  discord: 'skrtlife',
  instagram: 'skrtlife.io',
  blockchain: 'ethereum',
  contract_address: '0x1234567890abcdef1234567890abcdef12345678',
  contract_type: 'ERC721',
  creator_earnings: 750, // 7.5% in basis points
  payout_address: '0x1234567890abcdef1234567890abcdef12345678',
  is_explicit: false,
  is_sensitive: false,
  is_verified: false,
  is_featured: false,
  theme: 'contained',
  card_style: 'default',
  drop_start: '',
  drop_end: '',
  presale_start: '',
  presale_end: '',
  allowlist: [],
  token_gate_rules: '{}',
  status: 'draft'
};

function CollectionEditContent() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const collectionId = urlParams.get('id');
  const isEditing = !!collectionId;

  const [collection, setCollection] = useState(isEditing ? mockCollection : {
    name: '',
    slug: '',
    description: '',
    category: '',
    logo_url: '',
    featured_url: '',
    banner_url: '',
    website: '',
    twitter: '',
    discord: '',
    instagram: '',
    blockchain: 'ethereum',
    contract_address: '',
    contract_type: 'ERC721',
    creator_earnings: 250,
    payout_address: '',
    is_explicit: false,
    is_sensitive: false,
    is_verified: false,
    is_featured: false,
    theme: 'contained',
    card_style: 'default',
    drop_start: '',
    drop_end: '',
    presale_start: '',
    presale_end: '',
    allowlist: [],
    token_gate_rules: '{}',
    status: 'draft'
  });

  const [logoFiles, setLogoFiles] = useState([]);
  const [featuredFiles, setFeaturedFiles] = useState([]);
  const [bannerFiles, setBannerFiles] = useState([]);
  const [allowlistFile, setAllowlistFile] = useState(null);
  const [activeTab, setActiveTab] = useState('basics');
  const [isSaving, setIsSaving] = useState(false);

  // Auto-generate slug from name
  useEffect(() => {
    if (collection.name && !isEditing) {
      const slug = collection.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setCollection(prev => ({ ...prev, slug }));
    }
  }, [collection.name, isEditing]);

  const handleInputChange = (field, value) => {
    setCollection(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would save to the database
      console.log('Saving collection:', collection);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(isEditing ? 'Collection updated successfully!' : 'Collection created successfully!');
    } catch (error) {
      console.error('Error saving collection:', error);
      alert('Error saving collection. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAllowlistUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setAllowlistFile(file);
      // In a real app, parse CSV and update collection.allowlist
      console.log('Allowlist file uploaded:', file.name);
    } else {
      alert('Please upload a valid CSV file.');
    }
  };

  const categories = [
    { value: 'art', label: 'Art' },
    { value: 'collectibles', label: 'Collectibles' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'memberships', label: 'Memberships' },
    { value: 'music', label: 'Music' },
    { value: 'pfp', label: 'PFPs' },
    { value: 'photography', label: 'Photography' },
    { value: 'sports', label: 'Sports' },
    { value: 'utility', label: 'Utility' }
  ];

  const blockchains = [
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'base', label: 'Base' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'optimism', label: 'Optimism' }
  ];

  return (
    <AdminLayout currentPage="marketplace">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("AdminMarketplace")}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Collection' : 'Create Collection'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {isEditing ? `Editing: ${collection.name}` : 'Set up a new NFT collection'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" disabled={isSaving}>
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-sky-500 hover:bg-sky-600">
              {isSaving ? (
                <>
                  <Settings className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update' : 'Create'} Collection
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="drops">Drops</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          {/* Basics Tab */}
          <TabsContent value="basics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Set up the fundamental details of your collection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Collection Name *</Label>
                    <Input
                      id="name"
                      value={collection.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Genesis Origins"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={collection.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="genesis-origins"
                    />
                    <p className="text-xs text-gray-500">
                      skrtlife.io/genesis/collections/{collection.slug || 'your-collection'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={collection.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your collection..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">
                    {collection.description.length}/1000 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={collection.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Media</CardTitle>
                <CardDescription>
                  Upload images that represent your collection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <Label className="text-base font-medium">Logo Image *</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    This image will be used as the collection avatar. 400x400px recommended.
                  </p>
                  <MediaUploader files={logoFiles} onFilesChange={setLogoFiles} />
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Featured Image</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    This image will be featured on your collection page. 600x400px recommended.
                  </p>
                  <MediaUploader files={featuredFiles} onFilesChange={setFeaturedFiles} />
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Banner Image</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    This banner will appear at the top of your collection page. 1400x400px recommended.
                  </p>
                  <MediaUploader files={bannerFiles} onFilesChange={setBannerFiles} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>
                  Add links to your social media and website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={collection.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yoursite.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center gap-2">
                      <Twitter className="w-4 h-4" />
                      X (Twitter)
                    </Label>
                    <Input
                      id="twitter"
                      value={collection.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="username (without @)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discord" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Discord
                    </Label>
                    <Input
                      id="discord"
                      value={collection.discord}
                      onChange={(e) => handleInputChange('discord', e.target.value)}
                      placeholder="Discord server invite or username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      value={collection.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      placeholder="username (without @)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blockchain Tab */}
          <TabsContent value="blockchain" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Blockchain & Contract</CardTitle>
                <CardDescription>
                  Configure blockchain settings and royalties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="blockchain">Blockchain *</Label>
                    <Select value={collection.blockchain} onValueChange={(value) => handleInputChange('blockchain', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {blockchains.map(chain => (
                          <SelectItem key={chain.value} value={chain.value}>{chain.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contract_type">Contract Standard</Label>
                    <Select value={collection.contract_type} onValueChange={(value) => handleInputChange('contract_type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ERC721">ERC-721 (Unique NFTs)</SelectItem>
                        <SelectItem value="ERC1155">ERC-1155 (Multi-Edition)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract_address">Contract Address</Label>
                  <Input
                    id="contract_address"
                    value={collection.contract_address}
                    onChange={(e) => handleInputChange('contract_address', e.target.value)}
                    placeholder="0x... or leave empty for managed mint"
                  />
                  <p className="text-xs text-gray-500">
                    Leave empty to use Skrtlife's managed minting service
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="creator_earnings">Creator Earnings (Royalties)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="creator_earnings"
                        type="number"
                        value={collection.creator_earnings}
                        onChange={(e) => handleInputChange('creator_earnings', parseInt(e.target.value) || 0)}
                        min="0"
                        max="1000"
                      />
                      <span className="text-sm text-gray-500">basis points</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {(collection.creator_earnings / 100).toFixed(2)}% of secondary sales
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payout_address">Payout Address</Label>
                    <Input
                      id="payout_address"
                      value={collection.payout_address}
                      onChange={(e) => handleInputChange('payout_address', e.target.value)}
                      placeholder="0x... (royalty recipient)"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-amber-800">Important</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    Once deployed, blockchain settings cannot be changed. Please review carefully.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Settings</CardTitle>
                <CardDescription>
                  Configure display and content settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Explicit Content</Label>
                      <p className="text-sm text-gray-500">
                        Mark if this collection contains explicit or adult content
                      </p>
                    </div>
                    <Switch
                      checked={collection.is_explicit}
                      onCheckedChange={(checked) => handleInputChange('is_explicit', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Sensitive Content</Label>
                      <p className="text-sm text-gray-500">
                        Mark if this collection contains sensitive content
                      </p>
                    </div>
                    <Switch
                      checked={collection.is_sensitive}
                      onCheckedChange={(checked) => handleInputChange('is_sensitive', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        Verified Collection
                      </Label>
                      <p className="text-sm text-gray-500">
                        Admin only: Mark as verified collection
                      </p>
                    </div>
                    <Switch
                      checked={collection.is_verified}
                      onCheckedChange={(checked) => handleInputChange('is_verified', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Featured Collection</Label>
                      <p className="text-sm text-gray-500">
                        Admin only: Feature on homepage and marketplace
                      </p>
                    </div>
                    <Switch
                      checked={collection.is_featured}
                      onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">Display Theme</Label>
                  <Select value={collection.theme} onValueChange={(value) => handleInputChange('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contained">Contained (with padding)</SelectItem>
                      <SelectItem value="padded">Padded (minimal padding)</SelectItem>
                      <SelectItem value="covered">Covered (full bleed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Card Style</Label>
                  <Select value={collection.card_style} onValueChange={(value) => handleInputChange('card_style', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drops Tab */}
          <TabsContent value="drops" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Drop Scheduler</CardTitle>
                <CardDescription>
                  Configure minting schedule and allowlists
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="drop_start" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Drop Start Date
                    </Label>
                    <Input
                      id="drop_start"
                      type="datetime-local"
                      value={collection.drop_start}
                      onChange={(e) => handleInputChange('drop_start', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="drop_end">Drop End Date</Label>
                    <Input
                      id="drop_end"
                      type="datetime-local"
                      value={collection.drop_end}
                      onChange={(e) => handleInputChange('drop_end', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="presale_start" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Presale Start
                    </Label>
                    <Input
                      id="presale_start"
                      type="datetime-local"
                      value={collection.presale_start}
                      onChange={(e) => handleInputChange('presale_start', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="presale_end">Presale End</Label>
                    <Input
                      id="presale_end"
                      type="datetime-local"
                      value={collection.presale_end}
                      onChange={(e) => handleInputChange('presale_end', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">Allowlist Upload</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleAllowlistUpload}
                      className="hidden"
                      id="allowlist-upload"
                    />
                    <Label htmlFor="allowlist-upload" className="cursor-pointer">
                      <UploadIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Upload CSV file with wallet addresses
                      </p>
                      {allowlistFile && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ {allowlistFile.name} uploaded
                        </p>
                      )}
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token_gate_rules">Token Gate Rules (JSON)</Label>
                  <Textarea
                    id="token_gate_rules"
                    value={collection.token_gate_rules}
                    onChange={(e) => handleInputChange('token_gate_rules', e.target.value)}
                    placeholder='{"genesis_holders": true, "min_balance": "0.1"}'
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">
                    JSON configuration for token-gated access requirements
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Tools</CardTitle>
                <CardDescription>
                  Review reports and manage content moderation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Report Queue</h4>
                      <p className="text-sm text-gray-500">0 pending reports</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Reports
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Takedown Requests</h4>
                      <p className="text-sm text-gray-500">0 pending requests</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Review Requests
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-800">Danger Zone</span>
                  </div>
                  <p className="text-sm text-red-700 mb-4">
                    These actions are permanent and cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Collection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

export default function AdminCollectionEdit() {
  return (
    <AdminProtectedRoute>
      <CollectionEditContent />
    </AdminProtectedRoute>
  );
}