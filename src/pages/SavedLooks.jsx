import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trash2, Share2, Edit3, Plus, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';

export default function SavedLooks() {
  const { user } = useAuth();
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    base44.entities.Look.filter({ user_id: user.id }, '-created_date', 50)
      .then(l => { setLooks(l || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user?.id]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    await base44.entities.Look.delete(id).catch(() => {});
    setLooks(prev => prev.filter(l => l.id !== id));
    setDeletingId(null);
  };

  const handleRename = async (id) => {
    if (!editName.trim()) { setEditingId(null); return; }
    await base44.entities.Look.update(id, { name: editName }).catch(() => {});
    setLooks(prev => prev.map(l => l.id === id ? { ...l, name: editName } : l));
    setEditingId(null);
    setEditName('');
  };

  const handleShare = (look) => {
    const url = `${window.location.origin}/DripSync?look=${look.slug || look.id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    base44.analytics.track({ eventName: 'look_shared', properties: { look_id: look.id } });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
        <div className="text-center px-6">
          <Zap className="w-12 h-12 mx-auto mb-4" style={{ color: '#00D4FF' }} />
          <h2 className="text-2xl font-black text-white mb-3">Sign in to view your looks</h2>
          <button onClick={() => base44.auth.redirectToLogin('/SavedLooks')} className="px-8 py-3 rounded-xl font-bold text-sm" style={{ background: '#00D4FF', color: '#000' }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-[9px] tracking-[0.45em] uppercase mb-3 font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Your Collection
          </p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-4xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>SAVED LOOKS</h1>
            <Link to={createPageUrl('DripSync')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm" style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)', color: '#00D4FF' }}>
              <Plus className="w-4 h-4" /> Create New Look
            </Link>
          </div>
          <p className="mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{looks.length} saved {looks.length === 1 ? 'look' : 'looks'}</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden shimmer" style={{ background: 'rgba(255,255,255,0.04)', aspectRatio: '3/4' }} />
            ))}
          </div>
        ) : looks.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
              <Zap className="w-10 h-10" style={{ color: '#00D4FF' }} />
            </div>
            <h3 className="text-xl font-black text-white mb-2">No saved looks yet</h3>
            <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Head to DripSync to build and save your first look</p>
            <Link to={createPageUrl('DripSync')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm" style={{ background: '#00D4FF', color: '#000' }}>
              Open DripSync <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <AnimatePresence>
              {looks.map((look, idx) => (
                <motion.div
                  key={look.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {/* Thumbnail */}
                  <div className="relative" style={{ aspectRatio: '3/4' }}>
                    {look.thumbnail_url ? (
                      <img src={look.thumbnail_url} alt={look.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(255,51,102,0.08))' }}>
                        <Zap className="w-10 h-10 opacity-20 text-white" />
                      </div>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Link
                        to={`${createPageUrl('DripSync')}?look=${look.slug || look.id}`}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: '#00D4FF', color: '#000' }}
                        title="Load in DripSync"
                      >
                        <Zap className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleShare(look)} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }} title="Copy share link">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(look.id)}
                        disabled={deletingId === look.id}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: 'rgba(255,51,102,0.2)', color: '#FF3366' }}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Public badge */}
                    {look.is_public && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: 'rgba(0,212,255,0.85)', color: '#000' }}>
                        Public
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    {editingId === look.id ? (
                      <div className="flex gap-2">
                        <input
                          autoFocus
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleRename(look.id); if (e.key === 'Escape') setEditingId(null); }}
                          className="flex-1 bg-transparent border-b text-white text-sm focus:outline-none"
                          style={{ borderColor: '#00D4FF' }}
                        />
                        <button onClick={() => handleRename(look.id)} className="text-xs font-bold" style={{ color: '#00D4FF' }}>Save</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-white font-semibold text-sm truncate">{look.name}</p>
                        <button onClick={() => { setEditingId(look.id); setEditName(look.name); }} className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {look.tags?.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {look.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}