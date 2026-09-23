/**
 * AdminAvatars — Admin control panel for the Default Avatar Viewpoint System
 * Upload, reorder, toggle visibility of the 4 system characters
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { DEFAULT_AVATARS } from '@/lib/defaultAvatars';
import {
  Save, Eye, EyeOff, Upload, RefreshCw, GripVertical,
  Users, CheckCircle, ArrowUp, ArrowDown, Settings
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const STORAGE_KEY = 'skrt_avatar_viewpoint';

function loadViewpoint() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* */ }
  return DEFAULT_AVATARS.map((av, i) => ({ ...av, visible: true, order: i }));
}

function saveViewpoint(vp) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vp));
}

export default function AdminAvatars() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [viewpoint, setViewpoint] = useState(loadViewpoint);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editVibe, setEditVibe] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isAdmin = user?.role === 'admin';

  const move = (id, dir) => {
    setViewpoint(prev => {
      const arr = [...prev].sort((a, b) => a.order - b.order);
      const idx = arr.findIndex(a => a.id === id);
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= arr.length) return prev;
      const newArr = [...arr];
      const tmp = newArr[idx].order;
      newArr[idx] = { ...newArr[idx], order: newArr[swapIdx].order };
      newArr[swapIdx] = { ...newArr[swapIdx], order: tmp };
      return newArr;
    });
    setDirty(true);
  };

  const toggleVisible = (id) => {
    setViewpoint(prev => prev.map(av => av.id === id ? { ...av, visible: !av.visible } : av));
    setDirty(true);
  };

  const startEdit = (av) => {
    setEditingId(av.id);
    setEditName(av.name);
    setEditVibe(av.vibe);
  };

  const commitEdit = () => {
    setViewpoint(prev => prev.map(av => av.id === editingId ? { ...av, name: editName, vibe: editVibe } : av));
    setEditingId(null);
    setDirty(true);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      saveViewpoint(viewpoint);
      setSaving(false);
      setDirty(false);
      toast({ title: 'Viewpoint saved', description: 'Default avatar system updated.' });
    }, 600);
  };

  const handleReset = () => {
    const fresh = DEFAULT_AVATARS.map((av, i) => ({ ...av, visible: true, order: i }));
    setViewpoint(fresh);
    setDirty(true);
  };

  const sorted = [...viewpoint].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F', color: 'white' }}>
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-14">
          <p className="text-[9px] tracking-[0.4em] uppercase font-medium mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Admin · Default Avatar System
          </p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-4" style={{ letterSpacing: '-0.025em' }}>
                Avatar Viewpoint
              </h1>
              <p className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '480px', lineHeight: 1.7 }}>
                Control the 4 default characters shown in demo mode and assigned to new users. Reorder priority, toggle visibility, and customize display labels.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
              <button onClick={handleSave} disabled={!dirty || saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40"
                style={{ background: dirty ? '#fff' : 'rgba(255,255,255,0.06)', color: dirty ? '#000' : 'rgba(255,255,255,0.3)' }}>
                {saving ? <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Viewpoint
              </button>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <div className="mb-8 p-4 rounded-xl text-sm" style={{ background: 'rgba(255,200,0,0.06)', border: '1px solid rgba(255,200,0,0.15)', color: 'rgba(255,200,0,0.8)' }}>
            ⚠ Admin access required. Changes will not be persisted for non-admin users.
          </div>
        )}

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Characters', value: viewpoint.length },
            { label: 'Visible in Demo', value: viewpoint.filter(a => a.visible).length },
            { label: 'Priority Slots', value: 4 },
          ].map(({ label, value }) => (
            <div key={label} className="p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-3xl font-black text-white mb-1">{value}</p>
              <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Avatar Viewpoint List */}
        <div className="space-y-4">
          {sorted.map((av, idx) => {
            const isEditing = editingId === av.id;
            return (
              <motion.div key={av.id} layout transition={{ duration: 0.25 }}
                className="flex items-center gap-5 p-5 rounded-2xl transition-all"
                style={{
                  border: `1px solid ${av.visible ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
                  background: av.visible ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.01)',
                  opacity: av.visible ? 1 : 0.5,
                }}>

                {/* Order badge */}
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                  {idx + 1}
                </div>

                {/* Avatar image */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={av.portrait} alt={av.name} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white font-bold focus:outline-none focus:border-white/30 w-32" />
                      <input value={editVibe} onChange={e => setEditVibe(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 focus:outline-none focus:border-white/30 w-40" />
                      <button onClick={commitEdit} className="px-3 py-1.5 rounded-lg text-xs font-bold text-black bg-white">Done</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-white">{av.name}
                        <span className="ml-2 text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>{av.handle}</span>
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{av.role} · {av.vibe}</p>
                    </>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {av.visible
                    ? <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}><div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Visible</span>
                    : <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.2)' }}><div className="w-1.5 h-1.5 rounded-full bg-white/20" /> Hidden</span>
                  }
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => move(av.id, -1)} disabled={idx === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-all disabled:opacity-20">
                    <ArrowUp className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                  </button>
                  <button onClick={() => move(av.id, 1)} disabled={idx === sorted.length - 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-all disabled:opacity-20">
                    <ArrowDown className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                  </button>
                  <button onClick={() => startEdit(av)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-all">
                    <Settings className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                  </button>
                  <button onClick={() => toggleVisible(av.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-all">
                    {av.visible
                      ? <Eye className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.6)' }} />
                      : <EyeOff className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.25)' }} />
                    }
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Preview */}
        <div className="mt-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[9px] tracking-[0.4em] uppercase font-medium mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Live Preview</p>
              <h3 className="text-xl font-black tracking-tight">Demo Experience Preview</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sorted.filter(a => a.visible).map((av) => (
              <div key={av.id} className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="relative" style={{ aspectRatio: '3/4' }}>
                  <img src={av.image} alt={av.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)' }} />
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[8px] font-bold text-white uppercase">Live</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm font-bold text-white">{av.name}</p>
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{av.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Persistence note */}
        <div className="mt-10 p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <div>
              <p className="text-xs font-bold text-white mb-1">Persistence Logic</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                User avatar assignments are stored as <code className="px-1 py-0.5 rounded text-white/60" style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'monospace' }}>{"{ type: 'default', id: 'avatar_01' }"}</code> in their profile. 
                Updating avatars in the Viewpoint does not affect existing user assignments — only new onboardings pick up the updated order and visibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}