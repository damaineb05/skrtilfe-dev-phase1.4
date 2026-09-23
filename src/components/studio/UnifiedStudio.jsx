
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User as UserEntity } from '@/entities/User';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Palette, 
  FileText,
  BookOpen,
  User,
  Box,
  Trash2,
  Download,
  ExternalLink
} from 'lucide-react';
import AssetInput from './AssetInput';
import StudioViewport from './StudioViewport';
import MetadataForm from './MetadataForm';
import StudioActions from './StudioActions';
import DraftsList from './DraftsList';

export default function UnifiedStudio({ 
  className = "",
  sharedAvatar,
  sharedWearables,
  sharedCustomAnimations,
  sharedCustomization,
  onAvatarChange,
  onWearablesChange,
  onCustomAnimationsChange,
  onCustomizationChange,
  onReset
}) {
  const [activeTab, setActiveTab] = useState('create');
  const [currentAsset, setCurrentAsset] = useState(null);
  const [formData, setFormData] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [savedAvatars, setSavedAvatars] = useState([]);
  const [savedAssets, setSavedAssets] = useState([]);
  const [entityError, setEntityError] = useState(null);

  // Use shared avatar if available, otherwise use currentAsset
  const displayAsset = useMemo(() => {
    if (sharedAvatar && sharedAvatar !== 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb') {
      return {
        url: sharedAvatar,
        type: '3d',
        title: 'Avatar',
        source: 'shared'
      };
    }
    return currentAsset;
  }, [sharedAvatar, currentAsset]);

  // Load drafts, saved avatars, and assets on mount with error handling
  useEffect(() => {
    loadDrafts();
    loadSavedItems();
  }, []);

  const loadDrafts = async () => {
    try {
      // Try to import and use NFTDraft entity
      const { NFTDraft } = await import('@/entities/NFTDraft');
      const userDrafts = await NFTDraft.list('-updated_date');
      setDrafts(userDrafts);
      setEntityError(null);
    } catch (error) {
      console.warn('Failed to load drafts:', error);
      setEntityError('Unable to load drafts. Some features related to draft saving/loading may be limited.');
      // Set empty drafts as fallback
      setDrafts([]);
    }
  };

  const loadSavedItems = async () => {
    try {
      const user = await UserEntity.me();
      if (user?.saved_avatars) {
        setSavedAvatars(user.saved_avatars);
      }
      if (user?.saved_assets) {
        setSavedAssets(user.saved_assets);
      }
    } catch (error) {
      console.warn('Failed to load saved items:', error);
      // Continue with empty arrays as fallback
      setSavedAvatars([]);
      setSavedAssets([]);
    }
  };

  const saveCurrentAvatar = async () => {
    if (!sharedAvatar || sharedAvatar === 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb') return;
    
    try {
      const user = await UserEntity.me();
      const newAvatar = {
        id: Date.now(),
        name: `Avatar ${new Date().toLocaleDateString()}`,
        url: sharedAvatar,
        wearables: sharedWearables,
        customization: sharedCustomization,
        customAnimations: sharedCustomAnimations,
        saved_at: new Date().toISOString()
      };
      
      const updatedAvatars = [...(user.saved_avatars || []), newAvatar];
      await UserEntity.updateMyUserData({ saved_avatars: updatedAvatars });
      setSavedAvatars(updatedAvatars);
    } catch (error) {
      console.error('Failed to save avatar:', error);
    }
  };

  const saveCurrentAsset = async () => {
    if (!currentAsset) return;
    
    try {
      const user = await UserEntity.me();
      const newAsset = {
        id: Date.now(),
        name: currentAsset.title || `Asset ${new Date().toLocaleDateString()}`,
        url: currentAsset.url,
        type: currentAsset.type,
        saved_at: new Date().toISOString()
      };
      
      const updatedAssets = [...(user.saved_assets || []), newAsset];
      await UserEntity.updateMyUserData({ saved_assets: updatedAssets });
      setSavedAssets(updatedAssets);
    } catch (error) {
      console.error('Failed to save asset:', error);
    }
  };

  const loadSavedAvatar = (avatar) => {
    if (onAvatarChange) onAvatarChange(avatar.url);
    if (onWearablesChange && avatar.wearables) onWearablesChange(avatar.wearables);
    if (onCustomizationChange && avatar.customization) onCustomizationChange(avatar.customization);
    if (onCustomAnimationsChange && avatar.customAnimations) onCustomAnimationsChange(avatar.customAnimations);
  };

  const loadSavedAsset = (asset) => {
    setCurrentAsset({
      url: asset.url,
      type: asset.type,
      title: asset.name
    });
    if (asset.type === '3d' && onAvatarChange) {
      onAvatarChange(asset.url);
    }
  };

  const deleteSavedAvatar = async (avatarId) => {
    try {
      const updatedAvatars = savedAvatars.filter(a => a.id !== avatarId);
      await UserEntity.updateMyUserData({ saved_avatars: updatedAvatars });
      setSavedAvatars(updatedAvatars);
    } catch (error) {
      console.error('Failed to delete avatar:', error);
    }
  };

  const deleteSavedAsset = async (assetId) => {
    try {
      const updatedAssets = savedAssets.filter(a => a.id !== assetId);
      await UserEntity.updateMyUserData({ saved_assets: updatedAssets });
      setSavedAssets(updatedAssets);
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  const handleAssetSubmit = (asset) => {
    setCurrentAsset(asset);
    setFormData(prev => ({
      ...prev,
      title: prev.title || asset.title,
      asset_url: asset.url,
      asset_type: asset.type
    }));
    
    // Update shared avatar if this is a 3D asset
    if (asset.type === '3d' && onAvatarChange) {
      onAvatarChange(asset.url);
    }
  };

  const handleFormDataChange = (newData) => {
    setFormData(newData);
  };

  const handleValidationChange = (isValid) => {
    setIsFormValid(isValid);
  };

  const handleSaveDraft = async () => {
    if (!currentAsset && !displayAsset || !formData.title) return;

    setIsSaving(true);
    try {
      // Try to use NFTDraft entity if available
      const { NFTDraft } = await import('@/entities/NFTDraft');
      
      const effectiveAsset = currentAsset || displayAsset;
      const draftData = {
        ...formData,
        asset_url: effectiveAsset.url,
        asset_type: effectiveAsset.type,
        status: 'draft',
        metadata_json: generateMetadata()
      };

      await NFTDraft.create(draftData);
      await loadDrafts();
      setEntityError(null); // Clear error if save was successful
    } catch (error) {
      console.warn('Failed to save draft:', error);
      setEntityError('Could not save draft. Please try again or check your network connection.');
      // Continue without throwing - just log the warning
    } finally {
      setIsSaving(false);
    }
  };

  const handleMint = async () => {
    if (!currentAsset && !displayAsset || !isFormValid) return;

    setIsMinting(true);
    try {
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock mint result
      const mockResult = {
        contract: '0x' + Math.random().toString(16).substr(2, 40),
        tokenId: Math.floor(Math.random() * 10000).toString(),
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        metadataCid: 'Qm' + Math.random().toString(36).substr(2, 44)
      };

      setMintResult(mockResult);
      
      try {
        // Try to save as minted draft if entity is available
        const { NFTDraft } = await import('@/entities/NFTDraft');
        const effectiveAsset = currentAsset || displayAsset;
        const draftData = {
          ...formData,
          asset_url: effectiveAsset.url,
          asset_type: effectiveAsset.type,
          status: 'minted',
          mint_tx_hash: mockResult.txHash,
          contract_address: mockResult.contract,
          token_id: mockResult.tokenId,
          metadata_json: generateMetadata()
        };

        await NFTDraft.create(draftData);
        await loadDrafts();
        setEntityError(null); // Clear error if save was successful
      } catch (entityError) {
        console.warn('Could not save minted NFT to drafts:', entityError);
        setEntityError('Minting was successful, but could not save NFT as a draft. You can still add it to cart.');
        // Continue without failing the mint process
      }

    } catch (error) {
      console.error('Mint failed:', error);
      setEntityError('Minting failed. Please try again.');
      // Re-throw if it's a critical minting error, otherwise handle gracefully
      throw error;
    } finally {
      setIsMinting(false);
    }
  };

  const handleAddToCart = () => {
    if (!mintResult || !formData.price_eth) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const effectiveAsset = currentAsset || displayAsset;
    cart.push({
      product_id: `nft_${mintResult.tokenId}`,
      variant_sku: `${mintResult.contract}_${mintResult.tokenId}`,
      title: formData.title,
      price: parseFloat(formData.price_eth),
      quantity: 1,
      image_url: effectiveAsset?.url,
      color: 'Digital',
      size: 'NFT',
      type: 'nft'
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const generateMetadata = () => {
    const effectiveAsset = currentAsset || displayAsset;
    return {
      name: formData.title,
      description: formData.description,
      image: effectiveAsset?.url,
      animation_url: effectiveAsset?.type === '3d' ? effectiveAsset.url : undefined,
      attributes: formData.traits || [],
      external_url: formData.external_url,
      background_color: null,
      youtube_url: null
    };
  };

  const canSave = (currentAsset || displayAsset) && formData.title?.trim();
  const canMint = canSave && isFormValid && !isMinting;

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Show entity error if present */}
      {entityError && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">{entityError}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="create" className="flex items-center gap-2 text-sm">
              <Palette className="w-4 h-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4" />
              Drafts
              {drafts.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0.5">
                  {drafts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="save-items" className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4" />
              Saved
              {(savedAvatars.length + savedAssets.length) > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0.5">
                  {savedAvatars.length + savedAssets.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Ethereum Mainnet
            </div>
            <Badge variant="outline" className="text-xs">
              ERC-721/1155
            </Badge>
          </div>
        </div>

        <TabsContent value="create" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-4"
          >
            {/* Left Column - Input & Metadata */}
            <div className="space-y-4">
              <AssetInput 
                onAssetSubmit={handleAssetSubmit}
                loading={isSaving || isMinting}
              />
              
              <MetadataForm
                initialData={formData}
                onDataChange={handleFormDataChange}
                onValidationChange={handleValidationChange}
              />

              {/* Quick Save Buttons */}
              <div className="flex gap-2">
                {sharedAvatar && sharedAvatar !== 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb' && (
                  <Button onClick={saveCurrentAvatar} variant="outline" size="sm" className="text-xs">
                    <User className="w-3 h-3 mr-1" />
                    Save Avatar
                  </Button>
                )}
                {currentAsset && (
                  <Button onClick={saveCurrentAsset} variant="outline" size="sm" className="text-xs">
                    <Box className="w-3 h-3 mr-1" />
                    Save Asset
                  </Button>
                )}
              </div>
            </div>

            {/* Right Column - Viewport & Actions */}
            <div className="space-y-4">
              <StudioViewport 
                asset={displayAsset}
                className="sticky top-4"
              />
              
              <StudioActions
                canSave={canSave}
                canMint={canMint}
                onSaveDraft={handleSaveDraft}
                onMint={handleMint}
                onAddToCart={handleAddToCart}
                isSaving={isSaving}
                isMinting={isMinting}
                mintResult={mintResult}
              />
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DraftsList 
              drafts={drafts} 
              onDraftsChange={loadDrafts}
              onEditDraft={(draft) => {
                setCurrentAsset({
                  url: draft.asset_url,
                  type: draft.asset_type,
                  title: draft.title
                });
                setFormData(draft);
                setActiveTab('create');
              }}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="save-items" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Saved Avatars Section */}
            <div className="ledger-card p-4">
              <h3 className="text-lg font-semibold ledger-text-primary mb-4 flex items-center gap-2">
                <User className="w-5 h-5 ledger-accent" />
                Saved Avatars ({savedAvatars.length})
              </h3>
              
              {savedAvatars.length === 0 ? (
                <div className="text-center py-8 ledger-text-muted">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No saved avatars yet.</p>
                  <p className="text-sm">Save avatars from the Create tab.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedAvatars.map((avatar) => (
                    <div key={avatar.id} className="ledger-card p-3">
                      <div className="aspect-square bg-ledger-surface rounded-lg mb-3 relative overflow-hidden">
                        {avatar.url.endsWith('.glb') ? (
                          <div className="w-full h-full flex items-center justify-center ledger-text-muted">
                            <User className="w-12 h-12" />
                          </div>
                        ) : (
                          <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <h4 className="font-medium ledger-text-primary text-sm mb-2 truncate">{avatar.name}</h4>
                      <p className="text-xs ledger-text-muted mb-3">
                        Saved {new Date(avatar.saved_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button onClick={() => loadSavedAvatar(avatar)} size="sm" className="flex-1 text-xs ledger-btn-primary">
                          <Download className="w-3 h-3 mr-1" />
                          Load
                        </Button>
                        <Button onClick={() => deleteSavedAvatar(avatar.id)} size="sm" variant="outline" className="text-xs">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Assets Section */}
            <div className="ledger-card p-4">
              <h3 className="text-lg font-semibold ledger-text-primary mb-4 flex items-center gap-2">
                <Box className="w-5 h-5 ledger-accent" />
                Saved Assets ({savedAssets.length})
              </h3>
              
              {savedAssets.length === 0 ? (
                <div className="text-center py-8 ledger-text-muted">
                  <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No saved assets yet.</p>
                  <p className="text-sm">Save 3D models, images, and other assets from the Create tab.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedAssets.map((asset) => (
                    <div key={asset.id} className="ledger-card p-3">
                      <div className="aspect-square bg-ledger-surface rounded-lg mb-3 relative overflow-hidden">
                        {asset.type === 'image' ? (
                          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center ledger-text-muted">
                            <Box className="w-8 h-8 mb-2" />
                            <span className="text-xs uppercase font-semibold">{asset.type}</span>
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium ledger-text-primary text-sm mb-2 truncate">{asset.name}</h4>
                      <p className="text-xs ledger-text-muted mb-3">
                        {asset.type} • {new Date(asset.saved_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button onClick={() => loadSavedAsset(asset)} size="sm" className="flex-1 text-xs ledger-btn-primary">
                          <Download className="w-3 h-3 mr-1" />
                          Load
                        </Button>
                        <Button 
                          onClick={() => window.open(asset.url, '_blank')} 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button onClick={() => deleteSavedAsset(asset.id)} size="sm" variant="outline" className="text-xs">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
