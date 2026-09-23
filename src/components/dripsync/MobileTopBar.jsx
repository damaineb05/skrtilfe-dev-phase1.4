import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Share2, Eye, RefreshCw, Loader2,
  Camera, Sparkles, Upload, MoreHorizontal, X,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function MobileTopBar({
  onSave, onShare, onViewLooks, onCreateAvatar, onCreateStreamoji,
  onRefresh, onCapture, onLoadAvatar, onLoadFromUrl,
  inputValue, setInputValue, isSaving, isRefreshing, canRefresh,
}) {
  const fileInputRef = useRef(null);
  const urlInput = inputValue || '';
  const setUrlInput = setInputValue || (() => {});
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.toLowerCase().endsWith('.glb')) onLoadAvatar?.(file);
    e.target.value = null;
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onLoadFromUrl?.(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex flex-col"
      style={{
        background: 'rgba(8,8,12,0.82)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(212,175,55,0.15)',
      }}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".glb" />

      {/* Main row */}
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        {/* Brand mark */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(212,175,55,0.1))', border: '1px solid rgba(212,175,55,0.4)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#D4AF37' }} />
          </div>
          <span
            className="font-black text-sm tracking-[0.15em] uppercase"
            style={{ color: '#D4AF37', textShadow: '0 0 12px rgba(212,175,55,0.4)' }}
          >
            DripSync
          </span>
        </div>

        {/* URL input toggle */}
        <button
          onClick={() => setShowUrlInput(v => !v)}
          className="flex-1 text-left px-3 py-2 rounded-xl text-xs truncate"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: urlInput ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
          }}
        >
          {urlInput || 'Paste RPM URL or .glb…'}
        </button>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onCapture}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
          >
            <Camera className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onSave}
            disabled={isSaving}
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #a8862a)',
              boxShadow: '0 0 16px rgba(212,175,55,0.35)',
              color: '#0A0A0F',
            }}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </motion.button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.88 }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[180px] text-white border"
              style={{ background: 'rgba(12,12,18,0.97)', backdropFilter: 'blur(20px)', borderColor: 'rgba(212,175,55,0.2)' }}
            >
              <DropdownMenuItem onClick={onViewLooks} style={{ color: 'rgba(255,255,255,0.75)' }}>
                <Eye className="w-4 h-4 mr-2" /> My Looks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShare} style={{ color: 'rgba(255,255,255,0.75)' }}>
                <Share2 className="w-4 h-4 mr-2" /> Share Look
              </DropdownMenuItem>
              <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.06)' }} />
              <DropdownMenuItem onClick={onCreateAvatar} style={{ color: 'rgba(255,255,255,0.75)' }}>
                <Sparkles className="w-4 h-4 mr-2" /> Change Avatar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open('https://readyplayer.me/', '_blank')} style={{ color: 'rgba(255,255,255,0.75)' }}>
                <Sparkles className="w-4 h-4 mr-2" /> Ready Player Me
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateStreamoji?.()} style={{ color: 'rgba(255,255,255,0.75)' }}>
                <Sparkles className="w-4 h-4 mr-2" /> Streamoji
              </DropdownMenuItem>
              {canRefresh && (
                <DropdownMenuItem onClick={onRefresh} disabled={isRefreshing} style={{ color: 'rgba(255,255,255,0.75)' }}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh RPM
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Expandable URL input row */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 flex gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <input
                autoFocus
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="Paste RPM URL or .glb link…"
                onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
                className="flex-1 px-3 py-2 rounded-xl text-sm text-white placeholder-white/25 outline-none mt-3"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}
              />
              <button
                onClick={handleUrlSubmit}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #a8862a)', color: '#0A0A0F' }}
              >
                Load
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowUrlInput(false)}
                className="mt-3 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}