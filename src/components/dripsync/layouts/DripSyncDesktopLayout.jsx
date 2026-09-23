/**
 * DripSyncDesktopLayout
 * Extracted from pages/DripSync — handles the full desktop panel/viewport/control layout.
 * No logic lives here — all handlers and state come in via props.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FADE_UP, SCALE_TAP, PANEL_SLIDE_LEFT, PANEL_SLIDE_RIGHT, OVERLAY_FADE } from '../ui/MotionConfig';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Loader2, ChevronsLeft, PanelRight, Save, Sparkles, Eye,
  Maximize2, X, Check, ChevronDown, Palette, Shirt, Play,
  Package, Zap, Clock, Layers, ShoppingBag,
} from 'lucide-react';

// DripSyncEngineAdapter removed — the viewport is the authoritative movement/avatar runtime (no inert engine bridge).
import DripSyncViewport from '../DripSyncViewport';
import ClosetPanelWithDefaults from '../ClosetPanelWithDefaults';
import CustomizationPanel from '../CustomizationPanel';
import PhysicsPanel from '../PhysicsPanel';
import WearableTransformControls from '../WearableTransformControls';
import SceneTabPanel from '../SceneTabPanel';

import AnimationDrawer from '../AnimationDrawer';
import AnimationTimeline from '../AnimationTimeline';
import InteractionControlsUI from '../InteractionControlsUI';
import UserInventoryPanel from '../../marketplace/UserInventoryPanel';
import GenderSelector from '../GenderSelector';
import ModeSelector from '../ModeSelector';
import StyleTabPanel from '../style/StyleTabPanel';
import { getPresetForStyleTab } from '../../../dripsync/camera/DripSyncCameraManager.js';

// Small hook: track if the style tab is open (customization panel is active)
function useStyleCamera(activePanel) {
  const [styleTabId, setStyleTabId] = React.useState('avatar');
  const isStyleMode = activePanel === 'customization';
  return { isStyleMode, styleTabId, setStyleTabId };
}

export default function DripSyncDesktopLayout({
  // Viewport
  avatarSource, wearables, customAnimations, environment, customization, avatarGender,
  hardReloadToken, previewAnimUrl, selectedWearableId, transformMode,
  skinIsolationMap,
  gizmoEnabled, qualityMode, currentRealm, currentBackground,
  interactiveObjects, nearestInteractable, heldObjectLeft, heldObjectRight,
  onWearableTransformChange, onStateMachineInit, onAvatarGenderChange, dripSyncMode, onModeChange,
  onNearestInteractable, onHeldObjectChange,
  // Engine adapter
  onRealmLoaded, onRealmError,
  // Panel state
  isLeftPanelOpen, setIsLeftPanelOpen, isRightPanelOpen, setIsRightPanelOpen,
  activePanel, setActivePanel,
  isDemoMode,
  // Animation
  showAnimationLibrary, setShowAnimationLibrary,
  showAnimationTimeline, setShowAnimationTimeline,
  animationSequence, setAnimationSequence,
  isPlayingSequence, setIsPlayingSequence,
  stateMachineState, allAnimations,
  onPreviewAnimation, onApplyAnimation, onCancelPreview,
  // Save/gizmo
  isSavingAvatar, autoSave, setAutoSave,
  onSaveAvatar, onSaveLook, onLoadLook, onToggleGizmo,
  onTransformModeChange, onSelectWearable,
  // Closet panel with defaults
  inputValue, setInputValue,
  onLoadFromInput, fileInputRef, onSketchfab,
  onCreateAvatar, onCreateStreamoji,
  onSaveDefault, onRefreshDefaultAvatars, defaultAvatars,
  onLoadDefault, onReplaceDefault, onDeleteDefault, onSetStarter,
  avatarConfig, onAddWearable, onUpdateWearable, onRemoveWearable,
  onAddAnimation, onRemoveAnimation, sceneLibrary,
  onAddEnvironment, onRemoveEnvironment,
  onLoadSceneFromLibrary, onRemoveSceneFromLibrary,
  setError, currentAvatarId, ownedProductIds,
  sceneFurniture, setSceneFurniture,
  sceneAvatars, setSceneAvatars,
  selectedObjectId, setSelectedObjectId,
  onAddFurniture, onUpdateFurniture, onRemoveFurniture,
  // Customization
  onCustomizationChange, onHairAssetChange,
  // Physics
  onUpdatePhysics,
  // Scene tab
  isInSocialRoom, socialRoomCode, socialParticipants,
  createSocialRoom, joinSocialRoom, leaveSocialRoom, user,
  multiplayerConnected, multiplayerRoom, multiplayerPlayers,
  handleCreateRoom, handleJoinRoom, handleLeaveRoom,
  setInteractiveObjects,
  // Transform controls
  onSnapToBone, onResetTransform, onMirrorToOpposite,
  // Inventory
  onEquipFromInventory, onSellItem, setShowMarketplace,
  // Background
  onBackgroundChange,
  // Wearable error
  wearableError,
  // My Looks
  onViewLooks,
  // Asset selection
  onSelectAsset,
  onDeselectAsset,
}) {
  const { isStyleMode, styleTabId, setStyleTabId } = useStyleCamera(activePanel);

  return (
    <>
      <div
        className="relative rounded-2xl overflow-hidden border border-white/10 soft-glow-panel"
        style={{ height: '85vh' }}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1420] to-[#0A0F1E]" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-purple-500/5" />

        <div className="relative h-full">

          <DripSyncViewport
            avatar={avatarSource}
            wearables={wearables}
            customAnimations={customAnimations}
            environment={environment}
            avatarConfig={customization}
            avatarGender={avatarGender}
            hardReloadToken={hardReloadToken}
            previewAnimationUrl={previewAnimUrl}
            selectedWearableId={selectedWearableId}
            onWearableTransformChange={onWearableTransformChange}
            transformMode={transformMode}
            gizmoEnabled={gizmoEnabled}
            onStateMachineInit={onStateMachineInit}
            qualityMode={qualityMode}
            currentRealm={currentRealm}
            currentBackground={currentBackground}
            interactiveObjects={interactiveObjects}
            onNearestInteractable={onNearestInteractable}
            onHeldObjectChange={onHeldObjectChange}
            onEngineReady={(h) => window.__dsEngineReady?.(h)}
            onSelectAsset={onSelectAsset}
            onDeselectAsset={onDeselectAsset}
            skinIsolationMap={skinIsolationMap}
            styleCameraMode={isStyleMode}
            styleCameraFocus={isStyleMode ? styleTabId : null}
          />

          <InteractionControlsUI
            nearestInteractable={nearestInteractable}
            heldObjectLeft={heldObjectLeft}
            heldObjectRight={heldObjectRight}
            isMobile={false}
          />

          {isDemoMode && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-yellow-500/90 text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
              Demo Mode — <a href="/login" className="underline">Sign in</a> to access your purchased items
            </div>
          )}

          {/* ── Left Panel ── */}
          <AnimatePresence>
          {isLeftPanelOpen && (
          <motion.div
            key="left-panel"
            {...PANEL_SLIDE_LEFT}
            className="absolute top-6 left-6 bottom-6 w-96"
            style={{ zIndex: 20 }}
          >
            <div className="glass-panel-drip rounded-2xl h-full overflow-hidden flex flex-col">

              {/* Header */}
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">DripSync Studio</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="p-3 border-b border-white/10 bg-black/20">
                <div className="grid grid-cols-5 gap-1 bg-black/30 rounded-xl p-1 border border-white/5">
                  {[
                    { key: 'closet',        icon: Shirt,   label: 'CLOSET' },
                    { key: 'inventory',     icon: Package, label: 'ITEMS' },
                    { key: 'customization', icon: Palette, label: 'STYLE' },
                    { key: 'scene',         icon: Layers,  label: 'SCENE', pulse: sceneAvatars?.length > 0 || sceneFurniture?.length > 0 },
                    { key: 'physics',       icon: Zap,     label: 'PHYSICS' },
                  ].map(({ key, icon: Icon, label, pulse }) => (
                    <motion.button
                      key={key}
                      onClick={() => setActivePanel(key)}
                      className="relative flex flex-col items-center gap-1 py-2 rounded-lg transition-colors duration-200"
                      style={{ color: activePanel === key ? '#fff' : 'rgba(255,255,255,0.45)' }}
                      whileHover={{ color: 'rgba(255,255,255,0.7)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                      {pulse && <span className="absolute top-1 right-1 w-2 h-2 bg-violet-400 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)] animate-pulse" />}
                      {activePanel === key && (
                        <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-2 right-2 h-px"
                          style={{ background: '#fff' }} />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Panel Content — animated tab transitions */}
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  {activePanel === 'closet' && (
                    <motion.div key="closet" {...FADE_UP} className="h-full">
                      <ClosetPanelWithDefaults
                        inputValue={inputValue} setInputValue={setInputValue}
                        onLoadFromInput={onLoadFromInput}
                        onFileClick={() => fileInputRef.current?.click()}
                        onSketchfab={onSketchfab}
                        onCreateAvatar={onCreateAvatar}
                        onCreateStreamoji={onCreateStreamoji}
                        onSaveDefault={onSaveDefault}
                        onRefreshDefaultAvatars={onRefreshDefaultAvatars}
                        defaultAvatars={defaultAvatars}
                        onLoadDefault={onLoadDefault}
                        onReplaceDefault={onReplaceDefault}
                        onDeleteDefault={onDeleteDefault}
                        onSetStarter={onSetStarter}
                        avatarSource={avatarSource}
                        customization={customization}
                        wearables={wearables}
                        environment={environment}
                        onAddWearable={onAddWearable}
                        onUpdateWearable={onUpdateWearable}
                        onRemoveWearable={onRemoveWearable}
                        customAnimations={customAnimations}
                        onAddAnimation={onAddAnimation}
                        onRemoveAnimation={onRemoveAnimation}
                        sceneLibrary={sceneLibrary}
                        onAddEnvironment={onAddEnvironment}
                        onRemoveEnvironment={onRemoveEnvironment}
                        onLoadSceneFromLibrary={onLoadSceneFromLibrary}
                        onRemoveSceneFromLibrary={onRemoveSceneFromLibrary}
                        setError={setError}
                        currentAvatar={currentAvatarId}
                        ownedProductIds={ownedProductIds}
                        isDemoMode={isDemoMode}
                        sceneFurniture={sceneFurniture}
                        onAddFurniture={onAddFurniture}
                        onUpdateFurniture={onUpdateFurniture}
                        onRemoveFurniture={onRemoveFurniture}
                        selectedObjectId={selectedObjectId}
                        onSelectObject={setSelectedObjectId}
                        user={user}
                        onLoadLook={onLoadLook}
                      />
                    </motion.div>
                  )}
                  {activePanel === 'inventory' && (
                    <motion.div key="inventory" {...FADE_UP} className="h-full overflow-y-auto flex flex-col">
                      <div className="p-4 border-b border-gray-700/50">
                        <Button
                          onClick={() => setShowMarketplace(true)}
                          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-black font-bold"
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Open Marketplace
                        </Button>
                      </div>
                      <UserInventoryPanel
                        currentUser={user}
                        onEquipItem={onEquipFromInventory}
                        onSellItem={onSellItem}
                      />
                    </motion.div>
                  )}
                  {activePanel === 'customization' && (
                    <motion.div key="customization" {...FADE_UP} className="h-full">
                      <StyleTabPanel
                        avatarType={avatarGender}
                        onAvatarTypeChange={onAvatarGenderChange}
                        customization={customization}
                        onCustomizationChange={onCustomizationChange}
                        wearables={wearables}
                        onRemoveWearable={onRemoveWearable}
                        onSelectWearable={onSelectWearable}
                        selectedWearableId={selectedWearableId}
                        defaultAvatars={defaultAvatars}
                        onLoadDefault={onLoadDefault}
                        onCreateStreamoji={onCreateStreamoji}
                        onPreviewAnimation={onPreviewAnimation}
                        onApplyAnimation={onApplyAnimation}
                        activeAnimationSlug={stateMachineState?.currentSlug || null}
                        onSaveLook={onSaveLook}
                        onLoadLook={onLoadLook}
                        onViewLooks={onViewLooks}
                        onSaveAvatar={onSaveAvatar}
                        isSavingAvatar={isSavingAvatar}
                        onActiveTabChange={setStyleTabId}
                      />
                    </motion.div>
                  )}
                  {activePanel === 'physics' && (
                    <motion.div key="physics" {...FADE_UP} className="h-full overflow-y-auto">
                      <PhysicsPanel
                        wearables={wearables}
                        selectedWearableId={selectedWearableId}
                        onUpdatePhysics={onUpdatePhysics}
                      />
                    </motion.div>
                  )}
                  {activePanel === 'scene' && (
                    <motion.div key="scene" {...FADE_UP} className="h-full">
                      <SceneTabPanel
                        isInSocialRoom={isInSocialRoom} socialRoomCode={socialRoomCode}
                        socialParticipants={socialParticipants} createSocialRoom={createSocialRoom}
                        joinSocialRoom={joinSocialRoom} leaveSocialRoom={leaveSocialRoom} user={user}
                        multiplayerConnected={multiplayerConnected} multiplayerRoom={multiplayerRoom}
                        multiplayerPlayers={multiplayerPlayers} handleCreateRoom={handleCreateRoom}
                        handleJoinRoom={handleJoinRoom} handleLeaveRoom={handleLeaveRoom}
                        interactiveObjects={interactiveObjects} setInteractiveObjects={setInteractiveObjects}
                        selectedObjectId={selectedObjectId} setSelectedObjectId={setSelectedObjectId}
                        sceneAvatars={sceneAvatars} setSceneAvatars={setSceneAvatars}
                        sceneFurniture={sceneFurniture} setSceneFurniture={setSceneFurniture}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          )}
          </AnimatePresence>

          {/* ── Right Panel ── */}
          <AnimatePresence>
          {isRightPanelOpen && (
          <motion.div
            key="right-panel"
            {...PANEL_SLIDE_RIGHT}
            className="absolute top-6 right-6 bottom-6 w-80"
            style={{ zIndex: 20 }}
          >
            <div className="h-full flex flex-col gap-4">
              <AnimatePresence>
              {gizmoEnabled && wearables.length > 0 && (
                <motion.div key="transform" {...FADE_UP} className="glass-panel-drip rounded-2xl overflow-hidden soft-glow-panel max-h-[50%]">
                  <WearableTransformControls
                    wearables={wearables}
                    selectedWearableId={selectedWearableId}
                    onSelectWearable={onSelectWearable}
                    transformMode={transformMode}
                    onTransformModeChange={onTransformModeChange}
                    onUpdateWearable={onUpdateWearable}
                    onSnapToBone={onSnapToBone}
                    onResetTransform={onResetTransform}
                    onMirrorToOpposite={onMirrorToOpposite}
                    gizmoEnabled={gizmoEnabled}
                    onToggleGizmo={onToggleGizmo}
                  />
                </motion.div>
              )}
              {selectedWearableId && (
                <motion.div key="physics-right" {...FADE_UP} className="glass-panel-drip rounded-2xl overflow-hidden soft-glow-panel flex-1 overflow-y-auto">
                  <PhysicsPanel
                    wearables={wearables}
                    selectedWearableId={selectedWearableId}
                    onUpdatePhysics={onUpdatePhysics}
                  />
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          </motion.div>
          )}
          </AnimatePresence>

          {/* ── Left Toggle Button ── */}
          <motion.button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className="absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center hover:bg-cyan-500/20 transition-colors group"
            style={{
              width: 20,
              height: 64,
              borderRadius: '0 10px 10px 0',
              background: 'rgba(8,10,18,0.85)',
              border: '1px solid rgba(0,212,255,0.25)',
              borderLeft: 'none',
              boxShadow: '3px 0 16px rgba(0,212,255,0.15)',
            }}
            animate={{ left: isLeftPanelOpen ? 384 + 24 : 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isLeftPanelOpen ? 'Hide Panel' : 'Show Panel'}
          >
            {isLeftPanelOpen
              ? <ChevronsLeft className="w-3 h-3 text-cyan-400 group-hover:text-white transition-colors" />
              : <PanelRight className="w-3 h-3 text-cyan-400 group-hover:text-white transition-colors" />
            }
          </motion.button>

          {/* ── Right Control Bar ── */}
          <div className="absolute top-1/2 right-6 -translate-y-1/2 z-20 flex flex-col items-end gap-3">

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setShowAnimationLibrary(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold border border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.5)] uppercase tracking-wider text-xs"
              >
                <Play className="w-4 h-4 mr-1" />
                LIBRARY
              </Button>
              <Button
                onClick={() => setShowAnimationTimeline(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold border border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.5)] uppercase tracking-wider text-xs"
              >
                <Clock className="w-4 h-4 mr-1" />
                SEQUENCER
              </Button>
            </div>

            {wearables.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`apple-button shadow-lg transition-all ${gizmoEnabled ? 'bg-[#0071e3] text-white hover:bg-[#0077ed]' : 'bg-white text-[#0071e3] hover:bg-white/90'}`}
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    {gizmoEnabled ? 'Gizmo On' : 'Gizmo Off'}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => {
                    const next = !gizmoEnabled;
                    onToggleGizmo();
                    if (next && !selectedWearableId && wearables.length > 0) onSelectWearable(wearables[0].id);
                    if (!next) onSelectWearable(null);
                  }}>
                    <div className="flex items-center justify-between w-full">
                      <span>Toggle Gizmo</span>
                      {gizmoEnabled && <Check className="w-4 h-4" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Transform Mode</DropdownMenuLabel>
                  {['translate', 'rotate', 'scale'].map(mode => (
                    <DropdownMenuItem key={mode} onClick={() => onTransformModeChange(mode)}>
                      <div className="flex items-center justify-between w-full">
                        <span className="capitalize">{mode}</span>
                        {transformMode === mode && <Check className="w-4 h-4" />}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <button className="flex items-center gap-1.5 px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-all rounded border" style={{
                   borderColor: 'rgba(255,255,255,0.15)',
                   color: 'rgba(255,255,255,0.45)',
                 }} onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
                   <Eye className="w-3 h-3" />
                   <span>View</span>
                   <ChevronDown className="w-3 h-3" />
                 </button>
               </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onViewLooks}>My Looks</DropdownMenuItem>
                <DropdownMenuItem onClick={onSaveLook}>Save Current Look</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}>
                  {isLeftPanelOpen ? 'Hide' : 'Show'} Assets Panel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}>
                  {isRightPanelOpen ? 'Hide' : 'Show'} Transform Panel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <button className="flex items-center gap-1.5 px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-all rounded border" style={{
                   borderColor: 'rgba(255,255,255,0.15)',
                   color: 'rgba(255,255,255,0.45)',
                 }} onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
                   {isSavingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                   <span>Save</span>
                   <ChevronDown className="w-3 h-3" />
                 </button>
               </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onSaveAvatar} disabled={isSavingAvatar}>
                  <Save className="w-4 h-4 mr-2" />Save Avatar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSaveLook}>
                  <Sparkles className="w-4 h-4 mr-2" />Save as Look
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save-desktop" className="text-xs">Auto-save</Label>
                    <Switch id="auto-save-desktop" checked={autoSave} onCheckedChange={setAutoSave} />
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ── Animation Preview Banner ── */}
          <AnimatePresence>
          {stateMachineState?.isPreviewing && (
            <motion.div
              key="preview-banner"
              {...FADE_UP}
              className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3"
            >
              <Eye className="w-5 h-5" />
              <span className="font-semibold">Previewing Animation</span>
              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onCancelPreview} className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors">
                  <X className="w-4 h-4" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onApplyAnimation()} className="bg-white text-purple-600 hover:bg-gray-100 rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1 transition-colors">
                  <Check className="w-3 h-3" />Apply
                </motion.button>
              </div>
            </motion.div>
          )}
          </AnimatePresence>

          <AnimatePresence>
          {wearableError && (
            <motion.div key="wearable-error" {...FADE_UP} className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-red-500 text-white rounded-lg px-4 py-2 text-sm shadow-lg">
              {wearableError}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Animation Drawers (always rendered, controlled by isOpen) ── */}
      <AnimationDrawer
        isOpen={showAnimationLibrary}
        onClose={() => setShowAnimationLibrary(false)}
        availableAnimations={allAnimations}
        customAnimations={customAnimations}
        onPreview={onPreviewAnimation}
        onApply={onApplyAnimation}
        onCancel={onCancelPreview}
        isPreviewing={stateMachineState?.isPreviewing || false}
      />

      <AnimatePresence>
      {showAnimationTimeline && (
        <motion.div
          key="timeline-modal"
          {...OVERLAY_FADE}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-6xl h-[80vh]"
          >
            <AnimationTimeline
              availableAnimations={allAnimations}
              sequence={animationSequence}
              onSequenceChange={setAnimationSequence}
              onPlay={() => setIsPlayingSequence(true)}
              onStop={() => setIsPlayingSequence(false)}
              isPlaying={isPlayingSequence}
            />
            <Button
              onClick={() => setShowAnimationTimeline(false)}
              className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-black font-bold border border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.5)]"
            >
              CLOSE TIMELINE
            </Button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}