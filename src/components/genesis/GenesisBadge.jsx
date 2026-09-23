/**
 * GenesisBadge — Visual indicator shown on Genesis members.
 * Sizes: 'sm' | 'md' | 'lg'
 * Variants: 'pill' (inline) | 'icon' (just icon) | 'full' (with label)
 */
import React from 'react';
import { Crown } from 'lucide-react';

export default function GenesisBadge({ size = 'md', variant = 'pill', className = '' }) {
  if (variant === 'icon') {
    const sz = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    return (
      <span title="Genesis Pass Holder" className={className}>
        <Crown className={`${sz} text-[#00D4FF]`} />
      </span>
    );
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs';
  const iconSz  = size === 'sm' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3';

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full uppercase tracking-wider ${padding} ${className}`}
      style={{
        background: 'rgba(0,212,255,0.12)',
        border: '1px solid rgba(0,212,255,0.35)',
        color: '#00D4FF',
      }}
    >
      <Crown className={iconSz} />
      {variant === 'full' && 'Genesis'}
    </span>
  );
}