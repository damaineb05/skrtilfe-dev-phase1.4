import React, { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';

function isVideoUrl(url) {
  return /youtube\.com|youtu\.be|vimeo\.com|loom\.com/.test(url);
}

function getYouTubeId(url) {
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function VideoEmbed({ url }) {
  const [active, setActive] = useState(false);
  const ytId = getYouTubeId(url);

  if (ytId) {
    if (!active) {
      return (
        <div className="relative rounded-lg overflow-hidden cursor-pointer group" style={{ aspectRatio: '16/9' }} onClick={() => setActive(true)}>
          <img
            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    );
  }

  // Generic video URL
  return (
    <video src={url} controls className="w-full rounded-lg" style={{ maxHeight: 320 }} />
  );
}

export default function EmbedCard({ post }) {
  const hasVideo = post.media_files?.some(f => f.type === 'video' || isVideoUrl(f.url));
  const hasImages = post.media_files?.some(f => f.type === 'image');
  const videoFile = post.media_files?.find(f => f.type === 'video' || isVideoUrl(f.url));
  const images = post.media_files?.filter(f => f.type === 'image') || [];

  return (
    <article className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)' }}>
      {/* Video embed */}
      {hasVideo && videoFile && (
        <div className="p-3 pb-0">
          <VideoEmbed url={videoFile.url} />
        </div>
      )}

      {/* Images */}
      {!hasVideo && hasImages && (
        <div className={`grid gap-1 p-3 pb-0 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {images.slice(0, 4).map((img, i) => (
            <img key={i} src={img.url} alt="" className="w-full object-cover rounded-lg" style={{ maxHeight: 240 }} />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'rgba(0,212,255,0.15)' }}>
            {(post.created_by || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold text-white">{post.created_by?.split('@')[0] || 'Member'}</p>
            <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {new Date(post.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Post text */}
        {post.content && (
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{post.content}</p>
        )}

        {/* Platform tags */}
        {post.platforms?.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {post.platforms.map(p => (
              <span key={p} className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.15em] px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }}>
                <ExternalLink className="w-2.5 h-2.5" />
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}