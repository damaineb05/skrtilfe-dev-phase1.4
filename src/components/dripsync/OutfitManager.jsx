/**
 * OutfitManager — Save current outfit as a named Look, load saved Looks.
 * Replaces the "Save Avatar" flow for outfit-specific saves.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, FolderOpen, Trash2, Check, Loader2, Shirt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OutfitManager({ avatarSource, wearables, customization, environment, user, onLoadLook }) {
  const [looks, setLooks]           = useState([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [isSaving, setIsSaving]     = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [savedId, setSavedId]       = useState(null);
  const [tab, setTab]               = useState('load'); // 'save' | 'load'

  const fetchLooks = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const results = await base44.entities.Look.filter({ created_by: user.email }, '-created_date', 20);
      setLooks(results);
    } catch (_) {}
    setIsLoading(false);
  }, [user]);

  useEffect(() => { fetchLooks(); }, [fetchLooks]);

  const handleSave = async () => {
    if (!outfitName.trim()) return;
    setIsSaving(true);
    try {
      const slug = outfitName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
      const newLook = await base44.entities.Look.create({
        name: outfitName.trim(),
        slug,
        avatar_url: avatarSource || '',
        wearables: wearables || [],
        customization: customization || {},
        environment: environment || null,
        is_public: false,
      });
      setSavedId(newLook.id);
      setOutfitName('');
      setLooks(prev => [newLook, ...prev]);
      setTimeout(() => setSavedId(null), 2000);
    } catch (_) {}
    setIsSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.Look.delete(id);
      setLooks(prev => prev.filter(l => l.id !== id));
    } catch (_) {}
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-white/10 mb-3">
        {['save','load'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === t ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/40 hover:text-white/70'
            }`}>
            {t === 'save' ? <><Save className="w-3 h-3 inline mr-1" />Save</> : <><FolderOpen className="w-3 h-3 inline mr-1" />My Outfits</>}
          </button>
        ))}
      </div>

      {/* SAVE TAB */}
      {tab === 'save' && (
        <div className="space-y-3">
          <p className="text-xs text-white/50">Save your current wearables, customization, and scene as a named outfit.</p>
          <Input
            placeholder="Outfit name…"
            value={outfitName}
            onChange={e => setOutfitName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className="bg-white/5 border-white/15 text-white placeholder:text-white/30 h-9 text-sm"
          />
          <Button onClick={handleSave} disabled={isSaving || !outfitName.trim()}
            className="w-full h-9 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> :
             savedId   ? <><Check className="w-4 h-4 mr-1" />Saved!</> :
             <><Save className="w-4 h-4 mr-1" />Save Outfit</>}
          </Button>
        </div>
      )}

      {/* LOAD TAB */}
      {tab === 'load' && (
        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            </div>
          )}
          {!isLoading && looks.length === 0 && (
            <div className="text-center py-10 px-4">
              <Shirt className="w-10 h-10 mx-auto mb-2 text-white/20" />
              <p className="text-sm text-white/40">No outfits saved yet</p>
              <button onClick={() => setTab('save')} className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 underline">
                Save your first outfit
              </button>
            </div>
          )}
          <AnimatePresence>
            {looks.map(look => (
              <motion.div key={look.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-600/30 to-purple-600/30 flex items-center justify-center flex-shrink-0">
                  <Shirt className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{look.name}</p>
                  <p className="text-[10px] text-white/40">
                    {look.wearables?.length || 0} items · {new Date(look.created_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onLoadLook && onLoadLook(look)}
                    className="p-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 transition-colors"
                    title="Load outfit">
                    <FolderOpen className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(look.id)}
                    className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-colors"
                    title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}