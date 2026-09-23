import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, RefreshCw, Sparkles, Download, Star, Trash2, X, CheckCircle2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ── Inline Preview Modal (uses sonner, no window.confirm) ──────────────────────
function LookPreviewModal({ look, isOpen, onClose, onLoad, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Reset state when look changes
  useEffect(() => {
    setConfirmDelete(false);
    setImgFailed(false);
    setLoaded(false);
  }, [look?.id]);

  const handleLoad = () => {
    onLoad(look);
    setLoaded(true);
    setTimeout(() => { setLoaded(false); onClose(); }, 700);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(look.id);
      toast(`"${look.name}" deleted`);
      onClose();
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!look) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="look-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
          />
          <motion.div
            key="look-modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="fixed z-[61] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs overflow-hidden"
            style={{
              borderRadius: 20,
              background: 'rgba(10,10,15,0.97)',
              backdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Thumbnail */}
            <div className="relative w-full" style={{ aspectRatio: '3/4', background: '#0D0D16' }}>
              {look.thumbnail_url && !imgFailed ? (
                <img
                  src={look.thumbnail_url}
                  alt={look.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.18)' }}
                  >
                    <Sparkles className="w-9 h-9" style={{ color: 'rgba(0,212,255,0.5)' }} />
                  </div>
                  <p className="text-white/25 text-xs font-bold uppercase tracking-widest">No preview</p>
                </div>
              )}
              <div
                className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(7,7,9,0.95) 0%, transparent 100%)' }}
              />
              <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
                <h3 className="text-white font-black text-lg leading-tight truncate">{look.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  {look.created_date && (
                    <p className="text-white/40 text-[11px] flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(look.created_date), 'MMM d, yyyy')}
                    </p>
                  )}
                  <p className="text-white/40 text-[11px]">
                    {look.wearables?.length || 0} wearables · {look.emotes?.length || 0} emotes
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 space-y-2">
              <motion.button
                onClick={handleLoad}
                whileTap={{ scale: 0.97 }}
                className="w-full h-12 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-sm"
                style={{
                  background: loaded
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'linear-gradient(135deg, #00D4FF, #0099BB)',
                  color: '#0A0A0F',
                  transition: 'background 0.3s ease',
                }}
              >
                {loaded
                  ? <><CheckCircle2 className="w-4 h-4" /> Loaded!</>
                  : <><Download className="w-4 h-4" /> Load Look</>
                }
              </motion.button>

              <motion.button
                onClick={() => setConfirmDelete(true)}
                whileTap={{ scale: 0.97 }}
                className="w-full h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold"
                style={{
                  background: 'rgba(255,51,102,0.08)',
                  border: '1px solid rgba(255,51,102,0.22)',
                  color: 'rgba(255,80,120,0.8)',
                }}
              >
                <Trash2 className="w-4 h-4" /> Delete Look
              </motion.button>
            </div>

            {/* Delete Confirm Overlay */}
            <AnimatePresence>
              {confirmDelete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 rounded-[20px]"
                  style={{ background: 'rgba(7,7,9,0.96)' }}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,51,102,0.15)', border: '1px solid rgba(255,51,102,0.3)' }}>
                    <Trash2 className="w-6 h-6" style={{ color: '#FF3366' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-base">Delete "{look.name}"?</p>
                    <p className="text-white/40 text-sm mt-1">This cannot be undone.</p>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 h-11 rounded-2xl text-sm font-bold"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 h-11 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
                      style={{ background: '#FF3366', color: '#fff' }}
                    >
                      {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Delete</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Look Card ──────────────────────────────────────────────────────────────────
function LookCard({ look, onSelect, index }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.25 }}
      className="group relative cursor-pointer"
      onClick={() => onSelect(look)}
    >
      <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: '3/4', background: '#12121E', border: '1px solid rgba(255,255,255,0.07)' }}>
        {look.thumbnail_url && !imgFailed ? (
          <img
            src={look.thumbnail_url}
            alt={look.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}
            >
              <Sparkles className="w-6 h-6" style={{ color: 'rgba(0,212,255,0.4)' }} />
            </div>
            <p className="text-white/20 text-[9px] text-center">No preview</p>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-black/30 px-3 py-1.5 rounded-full border border-white/20">
            View
          </span>
        </div>

        {/* Gradient + name */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 to-transparent pointer-events-none" />
        <div className="absolute bottom-2 left-2.5 right-2.5 pointer-events-none">
          <p className="text-white text-xs font-semibold truncate leading-tight">{look.name}</p>
          <p className="text-white/35 text-[10px] mt-0.5">
            {look.wearables?.length || 0}w · {look.emotes?.length || 0}e
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Mobile Carousel ────────────────────────────────────────────────────────────
function MobileLookCard({ look, onSelect }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div className="flex-shrink-0 w-32 cursor-pointer" onClick={() => onSelect(look)}>
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ aspectRatio: '3/4', background: '#12121E', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {look.thumbnail_url && !imgFailed ? (
          <img src={look.thumbnail_url} alt={look.name} className="w-full h-full object-cover" loading="lazy"
            onError={() => setImgFailed(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-6 h-6" style={{ color: 'rgba(0,212,255,0.3)' }} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-1.5 left-2 right-2">
          <p className="text-white text-[10px] font-semibold truncate">{look.name}</p>
        </div>
      </div>
    </div>
  );
}

function MobileLooksCarousel({ looks, onSelect }) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-1">
      {looks.map((look) => (
        <MobileLookCard key={look.id} look={look} onSelect={onSelect} />
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MyLooks({ onLoadLook, isMobile = false }) {
  const [looks, setLooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLook, setSelectedLook] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const loadLooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      let results = await base44.entities.Look.filter({ user_id: user.id }, '-created_date');
      if (!results?.length) {
        results = await base44.entities.Look.filter({ created_by: user.email }, '-created_date');
      }
      setLooks(results || []);
    } catch (e) {
      console.error('[MY LOOKS] Load failed:', e);
      toast.error('Failed to load looks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadLooks(); }, [loadLooks]);

  const handleDelete = useCallback(async (lookId) => {
    try {
      await base44.entities.Look.delete(lookId);
      setLooks(prev => prev.filter(l => l.id !== lookId));
    } catch (e) {
      console.error('[MY LOOKS] Delete failed:', e);
      toast.error('Failed to delete look');
      throw e;
    }
  }, []);

  const handleSelectCard = (look) => {
    setSelectedLook(look);
    setPreviewOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#00D4FF' }} />
      </div>
    );
  }

  if (looks.length === 0) {
    return (
      <div className="text-center py-14 px-4">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'rgba(0,212,255,0.07)', border: '1px dashed rgba(0,212,255,0.2)' }}
        >
          <Sparkles className="w-8 h-8" style={{ color: 'rgba(0,212,255,0.35)' }} />
        </div>
        <p className="text-white/50 font-semibold mb-1">No looks saved yet</p>
        <p className="text-white/25 text-sm">Save your current setup to see it here</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {looks.length} {looks.length === 1 ? 'Look' : 'Looks'}
          </p>
          <button onClick={loadLooks} className="transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <MobileLooksCarousel looks={looks} onSelect={handleSelectCard} />
        <LookPreviewModal
          look={selectedLook}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          onLoad={onLoadLook}
          onDelete={handleDelete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">My Looks</h2>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {looks.length} saved {looks.length === 1 ? 'look' : 'looks'}
          </p>
        </div>
        <button onClick={loadLooks} className="p-2 transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {looks.map((look, i) => (
          <LookCard key={look.id} look={look} index={i} onSelect={handleSelectCard} />
        ))}
      </div>

      <LookPreviewModal
        look={selectedLook}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onLoad={onLoadLook}
        onDelete={handleDelete}
      />
    </div>
  );
}