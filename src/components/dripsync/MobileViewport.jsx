import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DripSyncViewport from './DripSyncViewport';
import { CyberpunkLoader } from './CyberpunkLoading';

export default function MobileViewport({
  avatarSource,
  wearables,
  customAnimations,
  environment,
  customization,
  avatarGender,
  hardReloadToken,
  selectedWearableId,
  onWearableTransformChange,
  transformMode,
  gizmoEnabled,
  onStateMachineInit,
  qualityMode,
  currentRealm,
  currentBackground,
  isLoading,
  loadingText,
  interactiveObjects,
  previewAnimUrl,
}) {
  const getBackgroundStyle = () => {
    if (currentBackground?.type === '3d-environment') return { background: 'transparent' };
    if (currentBackground?.type === 'image') return {
      backgroundImage: `url(${currentBackground.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
    if (currentBackground?.value) return { background: currentBackground.value };
    return { background: 'linear-gradient(180deg, #0A0A0F 0%, #0D0D18 100%)' };
  };

  return (
    <div className="absolute inset-0 overflow-hidden" style={getBackgroundStyle()}>
      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* 3D Viewport */}
      <DripSyncViewport
        avatar={avatarSource}
        wearables={wearables}
        customAnimations={customAnimations}
        environment={environment}
        avatarConfig={customization}
        avatarGender={avatarGender}
        hardReloadToken={hardReloadToken}
        selectedWearableId={selectedWearableId}
        onWearableTransformChange={onWearableTransformChange}
        transformMode={transformMode}
        gizmoEnabled={gizmoEnabled}
        onStateMachineInit={onStateMachineInit}
        qualityMode={qualityMode}
        currentRealm={currentRealm}
        currentBackground={currentBackground}
        interactiveObjects={interactiveObjects}
        previewAnimationUrl={previewAnimUrl}
      />

      {/* Subtle gold scan line */}
      <motion.div
        className="absolute inset-x-0 h-[1px] pointer-events-none z-10"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.18), transparent)' }}
        animate={{ y: ['0vh', '100vh'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Premium corner brackets */}
      <div className="absolute top-16 left-3 w-6 h-6 border-l border-t pointer-events-none z-10"
        style={{ borderColor: 'rgba(212,175,55,0.35)' }} />
      <div className="absolute top-16 right-3 w-6 h-6 border-r border-t pointer-events-none z-10"
        style={{ borderColor: 'rgba(212,175,55,0.35)' }} />

      {/* Loading overlay — smooth fade */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 flex items-center justify-center z-20"
            style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)' }}
          >
            <CyberpunkLoader size="lg" text={loadingText || 'LOADING...'} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}