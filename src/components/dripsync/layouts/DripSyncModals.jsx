/**
 * DripSyncModals
 * Extracted from pages/DripSync — all modal/dialog rendering.
 * No logic lives here — all handlers come in via props.
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import AssetTriageCard from '../AssetTriageCard';
import SaveLookModal from '../SaveLookModal';
import ShareLookModal from '../ShareLookModal';
import MyLooks from '../MyLooks';
import MobilePanelSheet from '../MobilePanelSheet';
import DefaultAvatarPicker from '../../dripsync2/DefaultAvatarPicker';
import StreamojiCreator from '../StreamojiCreator';
import MarketplaceBrowser from '../../marketplace/MarketplaceBrowser';
import CreateListingModal from '../../marketplace/CreateListingModal';
import SocialRoomChat from '../SocialRoomChat';

export default function DripSyncModals({
  isMobile,
  // Triage
  showTriageCard, currentUploadFile, onTriageConfirm, onTriageCancel,
  // My Looks
  showMyLooks, setShowMyLooks, onLoadLook,
  // Save Look
  showSaveLookModal, setShowSaveLookModal, avatarSource, customization,
  wearables, customAnimations, environment, currentRealm, user, onSaveLookSuccess,
  extractAvatarId,
  // Share Look
  showShareLookModal, setShowShareLookModal, lookToShare,
  // Default Avatar Picker
  showDefaultAvatarPicker, setShowDefaultAvatarPicker, userHasGenesis, onSelectDefaultAvatar,
  // Streamoji
  showStreamoji, setShowStreamoji, onStreamojiExported,
  // Marketplace
  showMarketplace, setShowMarketplace, onEquipFromInventory,
  // Create Listing
  showCreateListing, setShowCreateListing, sellInventoryItem, setSellInventoryItem,
  // Social chat
  roomMessages, sendRoomMessage, currentUserId, isChatOpen, setIsChatOpen, isInSocialRoom,
}) {
  return (
    <>
      {/* Asset Triage */}
      {showTriageCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AssetTriageCard
              file={currentUploadFile}
              url={null}
              onConfirm={onTriageConfirm}
              onCancel={onTriageCancel}
            />
          </div>
        </div>
      )}

      {/* My Looks — desktop dialog */}
      {showMyLooks && !isMobile && (
        <Dialog open={showMyLooks} onOpenChange={setShowMyLooks}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto glass-panel border border-white/10">
            <DialogHeader>
              <DialogTitle>My Looks</DialogTitle>
            </DialogHeader>
            <MyLooks onLoadLook={onLoadLook} isMobile={false} />
          </DialogContent>
        </Dialog>
      )}

      {/* My Looks — mobile sheet */}
      <MobilePanelSheet
        isOpen={showMyLooks && isMobile}
        onClose={() => setShowMyLooks(false)}
        title="My Looks"
        height="60vh"
      >
        <div className="p-4">
          <MyLooks onLoadLook={onLoadLook} isMobile={true} />
        </div>
      </MobilePanelSheet>

      {/* Save Look */}
      <SaveLookModal
        isOpen={showSaveLookModal}
        onClose={() => setShowSaveLookModal(false)}
        isMobile={isMobile}
        user={user}
        avatarConfig={{
          avatarUrl: avatarSource,
          avatarId: extractAvatarId(user?.avatar_config, avatarSource),
          traits: customization,
          customization,
          wearables,
          emotes: customAnimations,
          environment,
          currentRealm,
        }}
        onSaveSuccess={onSaveLookSuccess}
      />

      {/* Share Look */}
      <ShareLookModal
        isOpen={showShareLookModal}
        onClose={() => setShowShareLookModal(false)}
        look={lookToShare}
      />

      {/* Default Avatar Picker */}
      <DefaultAvatarPicker
        isOpen={showDefaultAvatarPicker}
        onClose={() => setShowDefaultAvatarPicker(false)}
        onSelectAvatar={onSelectDefaultAvatar}
        userHasGenesis={userHasGenesis}
      />

      {/* Streamoji Creator */}
      <StreamojiCreator
        isOpen={showStreamoji}
        onClose={() => setShowStreamoji(false)}
        currentUser={user}
        onAvatarExported={onStreamojiExported}
      />

      {/* Marketplace — desktop */}
      {showMarketplace && !isMobile && (
        <Dialog open={showMarketplace} onOpenChange={setShowMarketplace}>
          <DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-gray-900 border-gray-700 overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>Marketplace</DialogTitle>
            </DialogHeader>
            <MarketplaceBrowser
              currentUser={user}
              onEquipItem={onEquipFromInventory}
              onClose={() => setShowMarketplace(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Create Listing */}
      <CreateListingModal
        isOpen={showCreateListing}
        onClose={() => { setShowCreateListing(false); setSellInventoryItem(null); }}
        currentUser={user}
        inventoryItem={sellInventoryItem}
      />

      {/* Social Room Chat */}
      <SocialRoomChat
        messages={roomMessages}
        onSendMessage={sendRoomMessage}
        currentUserId={currentUserId}
        isOpen={isChatOpen && isInSocialRoom}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </>
  );
}