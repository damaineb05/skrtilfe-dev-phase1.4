import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function StreamojiCreator({ isOpen, onClose, onAvatarExported, currentUser }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleMessage = (event) => {
      let json;
      try {
        json = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (json?.source !== 'streamojiavatars') return;

      if (json.eventName === 'v1.frame.ready') {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ target: 'streamojiavatars', type: 'subscribe', eventName: 'v1.**' }),
          '*'
        );
      }

      if (json.eventName === 'v1.avatar.exported') {
        const url = json.data?.url;
        if (url) {
          onAvatarExported?.(url);
          onClose?.();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, onAvatarExported, onClose]);

  const iframeSrc = `https://avatars.streamoji.com/createAvatar/?iframe=true&bodyType=Full`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4" style={{ height: '85vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/90 border border-cyan-500/30 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-cyan-400 uppercase tracking-wider text-sm">Skrtlife Dripsync Avatar Creator</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="relative bg-black rounded-b-2xl overflow-hidden border border-t-0 border-cyan-500/30" style={{ height: 'calc(100% - 52px)' }}>
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title="Streamoji Avatar Creator"
            className="w-full h-full border-0"
            allow="camera *; microphone *; clipboard-write"
          />
        </div>
      </div>
    </div>
  );
}