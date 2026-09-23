import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Sparkles, ChevronDown } from 'lucide-react';
import ClosetPanel from './ClosetPanel';
import DripSyncLibraryPanel from './DripSyncLibraryPanel';
import SaveDefaultAvatarModal from './SaveDefaultAvatarModal';

export default function ClosetPanelWithDefaults({
  inputValue,
  setInputValue,
  onLoadFromInput,
  onFileClick,
  onSketchfab,
  onCreateAvatar,
  onCreateStreamoji,
  onSaveDefault,
  onRefreshDefaultAvatars,
  defaultAvatars,
  onLoadDefault,
  onReplaceDefault,
  onDeleteDefault,
  onSetStarter,
  onToggleTemplate,
  avatarSource,
  avatarGender,
  customization,
  wearables,
  environment,
  // ClosetPanel props
  onAddWearable,
  onUpdateWearable,
  onRemoveWearable,
  customAnimations,
  onAddAnimation,
  onRemoveAnimation,
  sceneLibrary,
  onAddEnvironment,
  onRemoveEnvironment,
  onLoadSceneFromLibrary,
  onRemoveSceneFromLibrary,
  setError,
  currentAvatar,
  ownedProductIds,
  isDemoMode,
  sceneFurniture,
  onAddFurniture,
  onUpdateFurniture,
  onRemoveFurniture,
  selectedObjectId,
  onSelectObject,
  // outfit save/load
  user,
  onLoadLook,
}) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [avatarThumbnail, setAvatarThumbnail] = useState(null);
  const [isSavingDefault, setIsSavingDefault] = useState(false);

  const handleOpenSaveModal = async () => {
    // Thumbnail capture is optional — never block save on failure
    try {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        setAvatarThumbnail(thumbnail);
      }
    } catch (err) {
      // CORS or tainted canvas — continue without thumbnail
      console.warn('Thumbnail capture skipped (CORS or unavailable):', err);
      setAvatarThumbnail(null);
    }
    setShowSaveModal(true);
  };

  const handleSaveDefaultAvatar = async (name, thumbnail, setAsDefault) => {
    if (!avatarSource) {
      console.warn('[DripSyncAsset V2] Cannot save — no avatarSource');
      return;
    }
    setIsSavingDefault(true);
    try {
      // Try fresh thumbnail capture if none was pre-captured
      let finalThumb = thumbnail;
      if (!finalThumb) {
        try {
          const canvas = document.querySelector('canvas');
          if (canvas) finalThumb = canvas.toDataURL('image/jpeg', 0.82);
        } catch (_) { /* ignore CORS issues */ }
      }

      // V2 save payload with gender and source at root level
      const payload = {
        avatarUrl: avatarSource,
        customization: customization || {},
        wearables: wearables || [],
        environment: environment || null,
        gender: avatarGender || 'masculine',
        avatarType: avatarGender || 'masculine',    // V1 backward compat
        source: avatarSource.includes('readyplayer.me') ? 'rpm' : 'upload',
        createdAt: new Date().toISOString(),
      };

      const savedAvatar = await onSaveDefault('avatar', payload, name, finalThumb);
      setShowSaveModal(false);
      setAvatarThumbnail(null);
      if (setAsDefault && savedAvatar?.id && onSetStarter) {
        onSetStarter(savedAvatar.id);
      }
      if (onRefreshDefaultAvatars) {
        onRefreshDefaultAvatars();
      }
    } catch (err) {
      console.error('[DripSyncAsset V2] Failed to save avatar:', err);
    } finally {
      setIsSavingDefault(false);
    }
  };
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-white/[0.07]">
        <div className="space-y-2.5">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste RPM URL or ID..."
            className="bg-white/[0.05] border-white/[0.10] text-white placeholder:text-white/30 focus:border-cyan-400/50"
          />

          {/* Load Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="apple-button w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Load Asset
                <ChevronDown className="w-4 h-4 ml-auto" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onLoadFromInput}>
                Load GLB URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onFileClick}>
                Upload GLB File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSketchfab}>
                Load from Sketchfab
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateAvatar}>
                Create New Avatar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateStreamoji}>
                Create on Streamoji
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={handleOpenSaveModal}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider"
          >
            💾 Save as Default Avatar
          </Button>
        </div>
      </div>

      {/* Library Panel — shows all saved assets */}
      <DripSyncLibraryPanel
        assets={defaultAvatars}
        onLoadAsset={(asset) => {
          console.log('[Library] Loading asset:', asset);
          onLoadDefault(asset);
        }}
        onDeleteAsset={onDeleteDefault}
        onSetStarter={onSetStarter}
        onToggleTemplate={onToggleTemplate}
      />

      {/* Closet Panel */}
      <ClosetPanel
        wearables={wearables}
        onAddWearable={onAddWearable}
        onUpdateWearable={onUpdateWearable}
        onRemoveWearable={onRemoveWearable}
        customAnimations={customAnimations}
        onAddAnimation={onAddAnimation}
        onRemoveAnimation={onRemoveAnimation}
        environment={environment}
        sceneLibrary={sceneLibrary}
        onAddEnvironment={onAddEnvironment}
        onRemoveEnvironment={onRemoveEnvironment}
        onLoadSceneFromLibrary={onLoadSceneFromLibrary}
        onRemoveSceneFromLibrary={onRemoveSceneFromLibrary}
        setError={setError}
        currentAvatar={currentAvatar}
        ownedProductIds={ownedProductIds}
        isDemoMode={isDemoMode}
        avatarSource={avatarSource}
        customization={customization}
        user={user}
        onLoadLook={onLoadLook}
      />

      <div className="p-3 border-t border-white/[0.07]">
        {/* Furniture Manager would go here if needed */}
      </div>

      <SaveDefaultAvatarModal
         isOpen={showSaveModal}
         onClose={() => setShowSaveModal(false)}
         onSave={handleSaveDefaultAvatar}
         avatarThumbnail={avatarThumbnail}
         avatarSource={avatarSource}
         isSaving={isSavingDefault}
         wearables={wearables}
         customization={customization}
       />
    </div>
  );
}