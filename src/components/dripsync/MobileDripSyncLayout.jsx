/**
 * MobileDripSyncLayout
 * Premium mobile layout for DripSync — reuses all existing components.
 * Viewport fills the screen, panels slide up over it, modals for advanced tools.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Crown, Maximize2, X, Sparkles } from 'lucide-react';

// Mobile shell
import MobileTopBar from './MobileTopBar';
import MobileViewport from './MobileViewport';
import MobileBottomNav from './MobileBottomNav';
import MobilePanelSheet from './MobilePanelSheet';
import FloatingAnimationButton from '../mobile/FloatingAnimationButton';
import MobileAnimationLibrary from '../mobile/MobileAnimationLibrary';

// Panel content — reused as-is
import ClosetPanelWithDefaults from './ClosetPanelWithDefaults';
import CustomizationPanel from './CustomizationPanel';
import RealmsPanel from './RealmsPanel';
import SceneObjectsPanel from './SceneObjectsPanel';
import FurnitureManager from './FurnitureManager';
import InteractiveObjectsPanel from './InteractiveObjectsPanel';
import WearableTransformControls from './WearableTransformControls';
import InteractionControlsUI from './InteractionControlsUI';
import SocialRoomChat from './SocialRoomChat';
import MobileAvatarController from '../mobile/MobileAvatarController';
import GenderSelector from './GenderSelector';
import ModeSelector from './ModeSelector';

// Overlays / modals — contextual only
import DefaultAvatarPicker from '../dripsync2/DefaultAvatarPicker';
import UserInventoryPanel from '../marketplace/UserInventoryPanel';
import MobileMarketplace from '../marketplace/MobileMarketplace';

export default function MobileDripSyncLayout({
  // viewport
  avatarSource, wearables, customAnimations, environment, customization, avatarGender,
  hardReloadToken, selectedWearableId, onWearableTransformChange,
  transformMode, gizmoEnabled, onStateMachineInit, qualityMode,
  currentRealm, currentBackground, isLoading, loadingText, interactiveObjects,
  nearestInteractable, heldObjectLeft, heldObjectRight, previewAnimUrl,

  // top bar
  inputValue, setInputValue, onSave, onShare, onViewLooks, onCreateAvatar,
  onCreateStreamoji, onRefresh, onCapture, onLoadAvatar, onLoadFromUrl,
  isSaving, isRefreshing, canRefresh,

  // animations
  allAnimations = [],
  onPreviewAnimation = () => {},
  onApplyAnimation = () => {},
  onCancelPreview = () => {},

  // bottom nav / panels
  mobilePanel, setMobilePanel,
  hasSceneObjects, onLoadFromInput, onFileClick, onSketchfab,

  // default avatars
  defaultAvatars, onLoadDefault, onReplaceDefault, onDeleteDefault,
  onSetStarter, onSaveDefault, onRefreshDefaultAvatars,

  // closet
  onAddWearable, onUpdateWearable, onRemoveWearable,
  customAnimations: _ca, onAddAnimation, onRemoveAnimation,
  sceneLibrary, onAddEnvironment, onRemoveEnvironment,
  onLoadSceneFromLibrary, onRemoveSceneFromLibrary,
  setError, currentAvatarId, ownedProductIds, isDemoMode,

  // customization
  onCustomizationChange, onHairAssetChange, onAvatarGenderChange, dripSyncMode, onModeChange,

  // scene
  sceneFurniture, setSceneFurniture,
  sceneAvatars, setSceneAvatars,
  selectedObjectId, setSelectedObjectId,
  setInteractiveObjects,
  onRealmChange, onCreateRealm, onBackgroundChange,

  // transform
  onSnapToBone, onResetTransform, onMirrorToOpposite,
  onToggleGizmo, onTransformModeChange, onSelectWearable,

  // inventory / marketplace
  user, onEquipFromInventory, onSellItem,
  showMarketplace, setShowMarketplace,

  // default avatar
  showDefaultAvatarPicker, setShowDefaultAvatarPicker,
  userHasGenesis, onSelectDefaultAvatar,

  // social
  roomMessages, sendRoomMessage, isChatOpen, setIsChatOpen, isInSocialRoom,
}) {

  const [showAnimationPanel, setShowAnimationPanel] = useState(false);
  const [selectedAnimationForMobile, setSelectedAnimationForMobile] = useState(null);

  const handleAnimationSelect = (animationId, animationData) => {
    setSelectedAnimationForMobile(animationId);
    // Pass the animation directly — useAnimationActions reads .url
    onPreviewAnimation?.(animationData);
  };

  const handlePanelChange = (panel) => {
    setMobilePanel(prev => prev === panel ? null : panel);
  };

  return (
    <div className="fixed inset-0" style={{ background: '#0A0A0F' }}>

      {/* ── 1. Full-screen viewport (always behind everything) ── */}
      <MobileViewport
        avatarSource={avatarSource}
        wearables={wearables}
        customAnimations={customAnimations}
        environment={environment}
        customization={customization}
        hardReloadToken={hardReloadToken}
        selectedWearableId={selectedWearableId}
        onWearableTransformChange={onWearableTransformChange}
        transformMode={transformMode}
        gizmoEnabled={gizmoEnabled}
        onStateMachineInit={onStateMachineInit}
        qualityMode={qualityMode}
        currentRealm={currentRealm}
        currentBackground={currentBackground}
        isLoading={isLoading}
        loadingText={loadingText}
        interactiveObjects={interactiveObjects}
        previewAnimUrl={previewAnimUrl}
      />

      {/* Interaction HUD */}
      <InteractionControlsUI
        nearestInteractable={nearestInteractable}
        heldObjectLeft={heldObjectLeft}
        heldObjectRight={heldObjectRight}
        isMobile={true}
      />

      {/* Floating Animation Button — always visible, toggles panel */}
      <FloatingAnimationButton
        onClick={() => setShowAnimationPanel(v => !v)}
        isOpen={showAnimationPanel}
      />

      {/* Animation Panel Sheet */}
      <AnimatePresence>
        {showAnimationPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              key="anim-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setShowAnimationPanel(false)}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            />

            {/* Sheet */}
            <motion.div
              key="anim-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 450) setShowAnimationPanel(false);
              }}
              className="fixed left-0 right-0 z-50 flex flex-col rounded-t-3xl"
              style={{
                bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)',
                height: '70vh',
                maxHeight: 'calc(86vh - 72px)',
                background: 'rgba(10,10,16,0.97)',
                backdropFilter: 'blur(32px)',
                borderTop: '1px solid rgba(0,212,255,0.2)',
                borderLeft: '1px solid rgba(255,255,255,0.05)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 -8px 60px rgba(0,0,0,0.7)',
                willChange: 'transform',
                overflow: 'hidden',
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(0,212,255,0.3)' }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">
                  Animations
                </span>
                <motion.button
                  onClick={() => setShowAnimationPanel(false)}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                <MobileAnimationLibrary
                  animations={allAnimations}
                  currentAnimationId={selectedAnimationForMobile}
                  onAnimationSelect={handleAnimationSelect}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── 2. Top bar floats above viewport ── */}
      <MobileTopBar
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSave={onSave}
        onShare={onShare}
        onViewLooks={onViewLooks}
        onCreateAvatar={onCreateAvatar}
        onCreateStreamoji={onCreateStreamoji}
        onRefresh={onRefresh}
        onCapture={onCapture}
        onLoadAvatar={onLoadAvatar}
        onLoadFromUrl={onLoadFromUrl}
        isSaving={isSaving}
        isRefreshing={isRefreshing}
        canRefresh={canRefresh}
      />

      {/* Demo mode badge */}
      {isDemoMode && (
        <div
          className="fixed z-30 left-1/2 -translate-x-1/2 text-black text-[10px] font-bold px-4 py-1.5 rounded-full"
          style={{ top: 64, background: 'rgba(234,179,8,0.9)' }}
        >
          Demo — <a href="/login" className="underline">Sign in</a> for full access
        </div>
      )}

      {/* ── 3. Bottom nav dock ── */}
      <MobileBottomNav
        activePanel={mobilePanel}
        onPanelChange={handlePanelChange}
        hasSceneObjects={hasSceneObjects}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onLoadFromInput={onLoadFromInput}
        onFileClick={onFileClick}
        onSketchfab={onSketchfab}
        onCreateAvatar={onCreateAvatar}
        onCreateStreamoji={onCreateStreamoji}
      />

      {/* ── 4. PANEL SHEETS ── one open at a time ── */}

      {/* CLOSET */}
      <MobilePanelSheet
        isOpen={mobilePanel === 'closet'}
        onClose={() => setMobilePanel(null)}
        title="Closet"
        height="75vh"
      >
        {/* Quick avatar picker entry */}
        {!userHasGenesis && (
          <div className="px-4 pt-4">
            <button
              onClick={() => setShowDefaultAvatarPicker(true)}
              className="w-full py-2.5 rounded-2xl flex items-center gap-3 px-4 mb-1"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))',
                border: '1px solid rgba(212,175,55,0.25)',
                color: '#D4AF37',
              }}
            >
              <Crown className="w-4 h-4 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider">Choose Starter Avatar</p>
                <p className="text-[10px] opacity-60">Pick from default avatars</p>
              </div>
            </button>
          </div>
        )}
        <div className="h-full">
          <ClosetPanelWithDefaults
            inputValue={inputValue}
            setInputValue={setInputValue}
            onLoadFromInput={onLoadFromInput}
            onFileClick={onFileClick}
            onSketchfab={onSketchfab}
            onCreateAvatar={onCreateAvatar}
            onCreateStreamoji={onCreateStreamoji}
            onSaveDefault={onSaveDefault}
            onRefreshDefaultAvatars={onRefreshDefaultAvatars}
            defaultAvatars={defaultAvatars || []}
            onLoadDefault={onLoadDefault}
            onReplaceDefault={onReplaceDefault}
            onDeleteDefault={onDeleteDefault}
            onSetStarter={onSetStarter}
            avatarSource={null}
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
            user={user}
          />
        </div>
      </MobilePanelSheet>

      {/* ITEMS / INVENTORY */}
      <MobilePanelSheet
        isOpen={mobilePanel === 'inventory'}
        onClose={() => setMobilePanel(null)}
        title="Items"
        height="75vh"
      >
        <div className="p-4">
          <button
            onClick={() => setShowMarketplace(true)}
            className="w-full py-3 rounded-2xl text-sm font-bold uppercase tracking-wider mb-4 flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
              border: '1px solid rgba(212,175,55,0.28)',
              color: '#D4AF37',
            }}
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Marketplace
          </button>
          <UserInventoryPanel
            currentUser={user}
            onEquipItem={onEquipFromInventory}
            onSellItem={onSellItem}
          />
        </div>
      </MobilePanelSheet>

      {/* STYLE / CUSTOMIZATION */}
      <MobilePanelSheet
        isOpen={mobilePanel === 'customization'}
        onClose={() => setMobilePanel(null)}
        title="Style"
        height="80vh"
      >
        <div className="overflow-y-auto h-full">
          <ModeSelector currentMode={dripSyncMode} onChange={onModeChange} isMobile={true} />
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
          <div className="px-4 pt-4">
            <button
              onClick={onCreateStreamoji}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black tracking-widest uppercase"
              style={{
                background: 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(168,85,247,0.12))',
                border: '1px solid rgba(6,182,212,0.35)',
                color: '#22d3ee',
              }}
            >
              <Sparkles className="w-4 h-4" />
              Sync with Streamoji
            </button>
          </div>
          <GenderSelector value={avatarGender} onChange={onAvatarGenderChange} isMobile={true} />
          <div className="p-4">
            <CustomizationPanel
              onCustomizationChange={onCustomizationChange}
              initialCustomization={customization}
              onSave={onSave}
              isSaving={isSaving}
              onHairAssetChange={onHairAssetChange}
            />
          </div>
        </div>
      </MobilePanelSheet>

      {/* SCENE */}
      <MobilePanelSheet
        isOpen={mobilePanel === 'scene'}
        onClose={() => setMobilePanel(null)}
        title="Scene"
        height="80vh"
      >
        <div className="h-full overflow-y-auto">
          {/* Environments first */}
          <div className="px-4 pt-2 pb-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-3"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              Environment
            </p>
          </div>
          <RealmsPanel
            currentRealm={currentRealm}
            onRealmChange={onRealmChange}
            onCreateRealm={onCreateRealm}
            currentBackground={currentBackground}
            onBackgroundChange={onBackgroundChange}
          />

          {/* Objects second */}
          {(sceneFurniture?.length > 0 || sceneAvatars?.length > 0) && (
            <div className="px-4 pt-4 pb-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-3"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                Scene Objects
              </p>
              <SceneObjectsPanel
                sceneAvatars={sceneAvatars}
                setSceneAvatars={setSceneAvatars}
                sceneFurniture={sceneFurniture}
                setSceneFurniture={setSceneFurniture}
                selectedObjectId={selectedObjectId}
                setSelectedObjectId={setSelectedObjectId}
              />
            </div>
          )}

          {/* Interactions third — only if objects exist */}
          {interactiveObjects?.length > 0 && (
            <div className="px-4 pt-4 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-3"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                Interactions
              </p>
              <InteractiveObjectsPanel
                interactiveObjects={interactiveObjects}
                setInteractiveObjects={setInteractiveObjects}
                selectedObjectId={selectedObjectId}
                setSelectedObjectId={setSelectedObjectId}
              />
            </div>
          )}
        </div>
      </MobilePanelSheet>

      {/* ── 5. CONTEXTUAL OVERLAYS (advanced tools, not tabs) ── */}

      {/* Wearable Transform — appears when gizmo enabled + wearable selected */}
      <AnimatePresence>
        {gizmoEnabled && selectedWearableId && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 right-0 z-50 mx-3 rounded-2xl overflow-hidden"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
              background: 'rgba(10,10,16,0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(212,175,55,0.2)',
              boxShadow: '0 -4px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: '#D4AF37' }}>
                Transform
              </span>
              <button
                onClick={() => onToggleGizmo()}
                className="w-7 h-7 flex items-center justify-center rounded-lg"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
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
      </AnimatePresence>

      {/* Mobile Marketplace fullscreen overlay */}
      <MobileMarketplace
        currentUser={user}
        onEquipItem={onEquipFromInventory}
        isOpen={showMarketplace}
        onClose={() => setShowMarketplace(false)}
      />

      {/* Default Avatar Picker */}
      <DefaultAvatarPicker
        isOpen={showDefaultAvatarPicker}
        onClose={() => setShowDefaultAvatarPicker(false)}
        onSelectAvatar={onSelectDefaultAvatar}
        userHasGenesis={userHasGenesis}
      />

      {/* Social Room Chat — floating bubble when in room */}
      <SocialRoomChat
        messages={roomMessages}
        onSendMessage={sendRoomMessage}
        currentUserId={user?.id}
        isOpen={isChatOpen && isInSocialRoom}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  );
}