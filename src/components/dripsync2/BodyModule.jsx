import React, { useState, useEffect } from 'react';
import { User, RefreshCw, Check, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DripSyncViewport from '../dripsync/DripSyncViewport';
import { base44 } from '@/api/base44Client';

export default function BodyModule({ avatarUrl, wearables = [], onAvatarChange }) {
  const [reloadToken, setReloadToken] = useState(0);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'saved'
  const [savedAvatars, setSavedAvatars] = useState([]);
  const [activeAvatarUrl, setActiveAvatarUrl] = useState(avatarUrl);
  const [setting, setSetting] = useState(false);

  // Load saved avatars from user profile
  useEffect(() => {
    loadSavedAvatars();
  }, []);

  // Keep activeAvatarUrl in sync with prop when it changes externally
  useEffect(() => {
    setActiveAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  const loadSavedAvatars = async () => {
    try {
      const user = await base44.auth.me();
      const list = user?.avatar_config?.savedAvatars || [];
      setSavedAvatars(list);
    } catch (e) {
      console.warn('Could not load saved avatars:', e);
    }
  };

  const handleReload = () => setReloadToken(t => t + 1);

  const handleSelectAvatar = async (url) => {
    if (url === activeAvatarUrl) return;
    setSetting(true);
    try {
      const user = await base44.auth.me();
      const existing = user?.avatar_config || {};
      await base44.auth.updateMe({
        avatar_config: { ...existing, avatarUrl: url }
      });
      setActiveAvatarUrl(url);
      setReloadToken(t => t + 1);
      if (onAvatarChange) onAvatarChange(url);
      setActiveTab('active');
    } catch (e) {
      console.error('Failed to set avatar:', e);
    } finally {
      setSetting(false);
    }
  };

  const tabs = [
    { id: 'active', label: 'Active' },
    { id: 'saved', label: `Saved (${savedAvatars.length})` },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-1 px-3 pt-3 pb-2 border-b border-zinc-800 flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                : 'bg-zinc-800/30 text-gray-400 border border-zinc-700 hover:bg-zinc-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Avatar Viewport */}
      {activeTab === 'active' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 relative bg-gradient-to-br from-zinc-900 to-black overflow-hidden mx-3 my-3 rounded-lg border border-zinc-800">
            {!activeAvatarUrl ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/50 flex items-center justify-center mx-auto mb-3">
                    <User className="w-10 h-10 text-cyan-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-3">No active avatar</p>
                  <Button
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
                    onClick={() => window.location.href = '/DripSync'}
                  >
                    Create Avatar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <DripSyncViewport
                  avatar={activeAvatarUrl}
                  wearables={wearables}
                  customAnimations={[]}
                  avatarConfig={{}}
                  hardReloadToken={reloadToken}
                  qualityMode="medium"
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
                  <div className="bg-black/80 backdrop-blur-xl px-3 py-1.5 rounded-lg border border-cyan-500/30 pointer-events-auto">
                    <p className="text-xs text-gray-400">
                      <span className="font-bold text-cyan-400">{wearables.length}</span> equipped
                    </p>
                  </div>
                  <div className="flex gap-2 pointer-events-auto">
                    <Button size="sm" variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 h-7 px-2" onClick={handleReload} title="Reload">
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 h-7 text-xs" onClick={() => window.location.href = '/DripSync'}>
                      Edit
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="pb-2 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Phase 2.0 — Embodiment layer active</p>
          </div>
        </div>
      )}

      {/* Saved Avatars Grid */}
      {activeTab === 'saved' && (
        <div className="flex-1 overflow-y-auto p-3">
          {savedAvatars.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <Star className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-sm text-gray-400 mb-2">No saved avatars yet</p>
              <p className="text-xs text-gray-600 mb-4">Save avatars in Studio or DripSync to see them here</p>
              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold" onClick={() => window.location.href = '/DripSync'}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Avatar
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {savedAvatars.map((saved, idx) => {
                const isActive = saved.url === activeAvatarUrl;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/10 border-cyan-500/50'
                        : 'bg-zinc-800/40 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/60'
                    }`}
                    onClick={() => !isActive && handleSelectAvatar(saved.url)}
                  >
                    {/* Mini preview */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-700 flex-shrink-0 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <User className="w-6 h-6 text-zinc-600" />
                      </div>
                      {/* RPM avatars have a preview image we can try */}
                      {saved.thumbnailUrl && (
                        <img src={saved.thumbnailUrl} alt={saved.name} className="w-full h-full object-cover" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{saved.name || `Avatar ${idx + 1}`}</p>
                      <p className="text-xs text-gray-500 truncate">{saved.savedAt ? new Date(saved.savedAt).toLocaleDateString() : 'Saved'}</p>
                      {isActive && (
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">● Active</span>
                      )}
                    </div>

                    {isActive ? (
                      <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <Button
                        size="sm"
                        className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 border border-cyan-500/40 h-7 text-xs px-2 flex-shrink-0"
                        disabled={setting}
                        onClick={(e) => { e.stopPropagation(); handleSelectAvatar(saved.url); }}
                      >
                        Use
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}