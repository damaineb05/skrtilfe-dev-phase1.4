/**
 * ColorControlPanel — Color picker for avatar/wearable/props
 * Integrates with AvatarColorization for zone-based material updates
 */

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { COLOR_ZONES } from './AssetSelector';

const AVATAR_ZONES = [
  { zone: COLOR_ZONES.SKIN, label: 'Skin', defaultColor: '#D4A574' },
  { zone: COLOR_ZONES.HAIR, label: 'Hair', defaultColor: '#3D2817' },
  { zone: COLOR_ZONES.EYES, label: 'Eyes', defaultColor: '#8B4513' },
];

const WEARABLE_ZONES = [
  { zone: COLOR_ZONES.TOP, label: 'Top', defaultColor: '#1A1A1A' },
  { zone: COLOR_ZONES.BOTTOM, label: 'Bottom', defaultColor: '#2D2D2D' },
  { zone: COLOR_ZONES.SHOES, label: 'Shoes', defaultColor: '#000000' },
  { zone: COLOR_ZONES.ACCESSORY, label: 'Accent', defaultColor: '#666666' },
];

export default function ColorControlPanel({
  assetType,
  selectedAssetId,
  onColorChange,
  currentColors = {},
  isMobile = false,
}) {
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  if (!assetType || !selectedAssetId) return null;

  const isAvatar = assetType === 'avatar';
  const isWearable = assetType === 'wearable';
  const isPreview = assetType === 'preview_asset';

  const zones = (isAvatar || isPreview) ? AVATAR_ZONES : (isWearable ? WEARABLE_ZONES : []);
  if (!zones.length) return null;

  const handleColorChange = (zone, hex) => {
    if (onColorChange) {
      onColorChange(zone, hex);
    }
  };

  const content = (
    <div className="space-y-2">
      {zones.map(({ zone, label, defaultColor }) => (
        <div key={zone} className="flex items-center gap-2">
          <label className="text-xs font-medium flex-1" style={{ color: 'var(--text-60)' }}>
            {label}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={currentColors[zone] || defaultColor}
              onChange={(e) => handleColorChange(zone, e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-white/20"
              title={`Change ${label}`}
            />
            <input
              type="text"
              value={currentColors[zone] || defaultColor}
              onChange={(e) => handleColorChange(zone, e.target.value)}
              className="w-16 px-2 py-1 text-xs rounded bg-white/5 border border-white/10 font-mono"
              placeholder="#000000"
              style={{ color: 'var(--text-60)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  // Desktop: inline
  if (!isMobile) {
    return (
      <div className="border-t border-white/8 pt-3 space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-40)' }}>
          Colors
        </div>
        {content}
      </div>
    );
  }

  // Mobile: collapsible
  return (
    <div className="border-t border-white/8 pt-3 space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-white/5"
        style={{ color: 'var(--text-40)' }}
      >
        Colors
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}
        />
      </button>
      {isExpanded && content}
    </div>
  );
}