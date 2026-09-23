import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { safeHex } from '../../utils/appearanceHelpers';

const SKIN_TONES = [
  { name: 'Porcelain',  hex: '#FFF5E4' }, { name: 'Fair',     hex: '#F2C6B4' },
  { name: 'Light',      hex: '#EEB99F' }, { name: 'Medium',   hex: '#D89D7D' },
  { name: 'Olive',      hex: '#BA7D5F' }, { name: 'Tan',      hex: '#8B5A3C' },
  { name: 'Brown',      hex: '#6D4628' }, { name: 'Dark',     hex: '#4A2F1D' },
  { name: 'Deep',       hex: '#2D1B10' }, { name: 'Richest',  hex: '#1C0F0A' },
];

const HAIR_COLORS = [
  { name: 'Platinum',  hex: '#F0E8D8' }, { name: 'Blonde',    hex: '#F5DEB3' },
  { name: 'Brown',     hex: '#6F4E37' }, { name: 'Dark Brown',hex: '#3D2817' },
  { name: 'Black',     hex: '#1C0F0A' }, { name: 'Auburn',    hex: '#A0522D' },
  { name: 'Red',       hex: '#C83C28' }, { name: 'Gray',      hex: '#808080' },
  { name: 'Cyan',      hex: '#00CED1' }, { name: 'Purple',    hex: '#9370DB' },
  { name: 'Pink',      hex: '#FF69B4' }, { name: 'Blue',      hex: '#4169E1' },
];

const EYE_COLORS = [
  { name: 'Dark Brown',  hex: '#3E2723' }, { name: 'Brown',    hex: '#5C4033' },
  { name: 'Blue',        hex: '#4A90E2' }, { name: 'Green',    hex: '#50C878' },
  { name: 'Hazel',       hex: '#8E7618' }, { name: 'Gray',     hex: '#708090' },
  { name: 'Amber',       hex: '#FFBF00' }, { name: 'Violet',   hex: '#8A2BE2' },
  { name: 'Cyan',        hex: '#00FFFF' }, { name: 'Gold',     hex: '#FFD700' },
];

function SwatchGrid({ items, value, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {items.map(item => {
        const active = value?.toUpperCase() === item.hex.toUpperCase();
        return (
          <button key={item.hex} onClick={() => onChange(item.hex)} title={item.name}
            className="relative w-full aspect-square rounded-xl transition-all"
            style={{
              background: item.hex,
              border: active ? '2px solid rgba(255,255,255,0.8)' : '2px solid rgba(255,255,255,0.08)',
              boxShadow: active ? `0 0 12px ${item.hex}80` : 'none',
              transform: active ? 'scale(1.08)' : 'scale(1)',
            }}>
            {active && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                <Check className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ColorBlock({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider uppercase text-white/60">{label}</span>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg border border-white/15" style={{ background: value }} />
          <input
            type="color"
            value={safeHex(value)}
            onChange={e => onChange(e.target.value)}
            className="w-8 h-7 rounded-lg cursor-pointer border-0 bg-transparent p-0 overflow-hidden"
            style={{ appearance: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-[10px] font-black tracking-[0.25em] uppercase text-white/40">{title}</p>
      {children}
    </div>
  );
}

export default function StyleAppearanceTab({ customization, onChange }) {
  const handle = useCallback((key, val) => onChange?.({ ...customization, [key]: val }), [customization, onChange]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-4 space-y-3">
      <Section title="Skin Tone">
        <SwatchGrid items={SKIN_TONES} value={customization?.skinTone || '#FFDBAC'} onChange={v => handle('skinTone', v)} />
        <ColorBlock label="Custom" value={customization?.skinTone || '#FFDBAC'} onChange={v => handle('skinTone', v)} />
        <div className="flex gap-2 mt-1">
          {['matte', 'gloss'].map(f => (
            <button key={f} onClick={() => handle('skinFinish', f)}
              className="flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider capitalize transition-all"
              style={{
                background: customization?.skinFinish === f ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${customization?.skinFinish === f ? 'rgba(250,204,21,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: customization?.skinFinish === f ? '#fbbf24' : 'rgba(255,255,255,0.4)',
              }}>{f}</button>
          ))}
        </div>
      </Section>

      <Section title="Hair Color">
        <SwatchGrid items={HAIR_COLORS} value={customization?.hairColor || '#8B4513'} onChange={v => handle('hairColor', v)} />
        <ColorBlock label="Custom" value={customization?.hairColor || '#8B4513'} onChange={v => handle('hairColor', v)} />
      </Section>

      <Section title="Eye Color">
        <SwatchGrid items={EYE_COLORS} value={customization?.eyeColor || '#4A90E2'} onChange={v => handle('eyeColor', v)} />
        <ColorBlock label="Custom" value={customization?.eyeColor || '#4A90E2'} onChange={v => handle('eyeColor', v)} />
      </Section>
    </div>
  );
}