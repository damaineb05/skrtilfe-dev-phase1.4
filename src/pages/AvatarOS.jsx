/**
 * AvatarOS — Avatar-First Operating System Page
 * ─────────────────────────────────────────────────────────────
 * The avatar is the desktop.
 * The closet is the file system.
 * Outfits are applications.
 * Identity is the operating system.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Zap, Users, ShoppingBag, Camera, Layers, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import AvatarOSShell from '../components/dripsync/os/AvatarOSShell';
import DripSyncViewport from '../components/dripsync/DripSyncViewport';
import ClosetPanelWithDefaults from '../components/dripsync/ClosetPanelWithDefaults';
import CustomizationPanel from '../components/dripsync/CustomizationPanel';

import { DEFAULT_AVATAR_URL, DEFAULT_CUSTOMIZATION } from '../constants/dripsyncConfig';
import { hydrateRuntimeFromUserConfig } from '@/lib/avatarPersistence';
import { useSaveSystem } from '../hooks/useSaveSystem';
import { useWearableActions } from '../components/dripsync/hooks/useWearableActions';
import { useToast } from '@/components/ui/use-toast';

// Emote quick-bar
const QUICK_EMOTES = [
  { label: 'Wave',      emoji: '👋', anim: 'wave' },
  { label: 'Dance',     emoji: '🕺', anim: 'dance' },
  { label: 'Celebrate', emoji: '🎉', anim: 'celebrate' },
  { label: 'Clap',      emoji: '👏', anim: 'clap' },
  { label: 'Sit',       emoji: '🪑', anim: 'sit' },
];

// Panel map
const DOCK_PANELS = {
  closet:  { label: 'My Closet',    icon: Shirt,       accent: '#a855f7' },
  emotes:  { label: 'Emotes',       icon: Zap,         accent: '#f59e0b' },
  social:  { label: 'Social',       icon: Users,       accent: '#06b6d4' },
  shop:    { label: 'Shop',         icon: ShoppingBag, accent: '#10b981' },
  capture: { label: 'Capture',      icon: Camera,      accent: '#ec4899' },
  scene:   { label: 'Scene',        icon: Layers,      accent: '#8b5cf6' },
};

export default function AvatarOS() {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState(null);

  // Avatar state
  const [avatarSource, setAvatarSource] = useState(DEFAULT_AVATAR_URL);
  const [wearables, setWearables]       = useState([]);
  const [customization, setCustomization] = useState(DEFAULT_CUSTOMIZATION);
  const [avatarGender, setAvatarGender] = useState('masculine');
  const [hardReloadToken, setHardReloadToken] = useState(0);
  const [previewAnimUrl, setPreviewAnimUrl] = useState(null);
  const [activePanel, setActivePanel]   = useState('closet');
  const fileInputRef = useRef(null);

  const { assets: defaultAvatars, groupedAssets, saveAsset, loadAsset, deleteAsset, setStarter } = useSaveSystem(user);
  const { handleAddWearable, handleUpdateWearable, handleRemoveWearable } = useWearableActions({ wearables, setWearables, setHardReloadToken, toast });

  // Sync user from auth — restore through the canonical normalizer (v1 + v2).
  // AvatarOS only READS avatar_config; it never writes it (saves go to
  // DripSyncAsset via useSaveSystem), so there is no ownership bypass here.
  useEffect(() => {
    if (!authUser) return;
    setUser(authUser);
    const hydrated = hydrateRuntimeFromUserConfig(authUser);
    if (hydrated?.avatarSource) {
      setAvatarSource(`${hydrated.avatarSource.split('?')[0]}?t=${Date.now()}`);
      setWearables(hydrated.wearables || []);
      setCustomization(prev => ({ ...prev, ...(hydrated.customization || {}), isVisible: true }));
      if (hydrated.gender) setAvatarGender(hydrated.gender);
      setHardReloadToken(t => t + 1);
    }
  }, [authUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDockSelect = useCallback((id) => {
    setActivePanel(id);
  }, []);

  const handleEmote = useCallback((anim) => {
    setPreviewAnimUrl(anim);
    setTimeout(() => setPreviewAnimUrl(null), 3000);
  }, []);

  // ── Panel content router ──────────────────────────────────────
  const renderPanelContent = () => {
    const panelMeta = DOCK_PANELS[activePanel];
    const Icon = panelMeta?.icon || Shirt;

    return (
      <div className="h-full flex flex-col">
        {/* Panel header */}
        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${panelMeta?.accent}18`, border: `1px solid ${panelMeta?.accent}33` }}>
            <Icon className="w-4 h-4" style={{ color: panelMeta?.accent }} />
          </div>
          <div>
            <p className="text-[9px] font-bold tracking-[0.25em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>DripSync OS</p>
            <h2 className="text-sm font-black text-white leading-none">{panelMeta?.label}</h2>
          </div>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activePanel === 'closet' && (
              <motion.div key="closet"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }} className="h-full">
                <ClosetPanelWithDefaults
                  avatarSource={avatarSource}
                  customization={customization}
                  wearables={wearables}
                  onAddWearable={handleAddWearable}
                  onUpdateWearable={handleUpdateWearable}
                  onRemoveWearable={handleRemoveWearable}
                  defaultAvatars={groupedAssets.avatars}
                  onLoadDefault={(asset) => {
                    const loaded = loadAsset(asset);
                    if (loaded?.avatarUrl) {
                      setAvatarSource(`${loaded.avatarUrl.split('?')[0]}?t=${Date.now()}`);
                      setWearables(loaded.wearables || []);
                      setHardReloadToken(t => t + 1);
                    }
                  }}
                  onSaveDefault={(type, payload, name, thumb) =>
                    saveAsset(type, { ...payload, avatarUrl: payload?.avatarUrl || avatarSource }, name, thumb)
                  }
                  onDeleteDefault={(a) => deleteAsset(a.id)}
                  onSetStarter={(a) => setStarter(a.id)}
                  onRefreshDefaultAvatars={() => {}}
                  onLoadFromInput={() => {}}
                  onFileClick={() => fileInputRef.current?.click()}
                  onSketchfab={() => {}}
                  onCreateAvatar={() => {}}
                  onCreateStreamoji={() => {}}
                  isDemoMode={!authUser}
                  user={user}
                />
              </motion.div>
            )}

            {activePanel === 'emotes' && (
              <motion.div key="emotes"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }} className="p-5 space-y-3">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-4">Quick Emotes</p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_EMOTES.map(e => (
                    <motion.button
                      key={e.anim}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleEmote(e.anim)}
                      className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <span className="text-2xl">{e.emoji}</span>
                      <span className="text-sm font-bold text-white">{e.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {activePanel === 'social' && (
              <motion.div key="social"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }} className="p-5">
                <div className="space-y-3">
                  {[
                    { name: 'DR1P.eth', status: 'Streaming', accent: '#a855f7', emoji: '🎮' },
                    { name: 'SKRT.SOL', status: 'Online',    accent: '#22d3ee', emoji: '👾' },
                    { name: 'xDecibal',  status: 'In Session',accent: '#10b981', emoji: '🎧' },
                  ].map(p => (
                    <div key={p.name} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ background: `${p.accent}18`, border: `1px solid ${p.accent}33` }}>
                        {p.emoji}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-white">{p.name}</p>
                        <p className="text-[10px] font-semibold" style={{ color: p.accent }}>{p.status}</p>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all hover:opacity-80"
                        style={{ background: `${p.accent}18`, color: p.accent, border: `1px solid ${p.accent}30` }}>
                        Invite
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {(activePanel === 'shop' || activePanel === 'capture' || activePanel === 'scene') && (
              <motion.div key={activePanel}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-5 flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${panelMeta?.accent}12`, border: `1px solid ${panelMeta?.accent}25` }}>
                  <Icon className="w-7 h-7" style={{ color: panelMeta?.accent }} />
                </div>
                <p className="text-white font-black text-lg mb-2">{panelMeta?.label}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {activePanel === 'shop' && 'Browse the DripSync marketplace'}
                  {activePanel === 'capture' && 'Capture and share your look'}
                  {activePanel === 'scene' && 'Customize your digital world'}
                </p>
                {activePanel === 'shop' && (
                  <Link to="/DripSync" className="mt-4 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
                    style={{ background: `${panelMeta?.accent}20`, color: panelMeta?.accent, border: `1px solid ${panelMeta?.accent}40` }}>
                    Open DripSync Studio →
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // ── Viewport slot ─────────────────────────────────────────────
  const viewportSlot = (
    <div className="w-full h-full">
      <DripSyncViewport
        avatar={avatarSource}
        wearables={wearables}
        customAnimations={[]}
        environment={null}
        avatarConfig={customization}
        avatarGender={avatarGender}
        hardReloadToken={hardReloadToken}
        previewAnimationUrl={previewAnimUrl}
        qualityMode="high"
        gizmoEnabled={false}
      />
    </div>
  );

  return (
    <>
      <input type="file" ref={fileInputRef} onChange={() => {}} className="hidden" accept=".glb" />

      {/* Back nav */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <Link to="/DripSync"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black tracking-widest uppercase transition-all hover:opacity-80"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
            <ArrowLeft className="w-3 h-3" />
            Studio
          </Link>
          <div className="px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <span className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: '#c084fc' }}>
              Avatar OS
            </span>
          </div>
        </div>
      </div>

      <AvatarOSShell
        user={user}
        viewportSlot={viewportSlot}
        panelSlot={renderPanelContent()}
        activePanel={activePanel}
        onDockSelect={handleDockSelect}
        initialMode="split"
        xp={1240}
        level={7}
        currency={3420}
        notifications={3}
      />
    </>
  );
}