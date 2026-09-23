/**
 * StudioHairTab — Hair customization
 */
import React from 'react';
import { motion } from 'framer-motion';

const HAIR_COLORS = [
  { id: 'black', name: 'Black', hex: '#1a1a1a' },
  { id: 'brown', name: 'Brown', hex: '#654321' },
  { id: 'blonde', name: 'Blonde', hex: '#d4af37' },
  { id: 'red', name: 'Red', hex: '#c41e3a' },
  { id: 'purple', name: 'Purple', hex: '#9933ff' },
  { id: 'blue', name: 'Blue', hex: '#0066ff' },
];

const HAIR_STYLES = [
  { id: 'short', name: 'Short', icon: '✂️' },
  { id: 'medium', name: 'Medium', icon: '💇' },
  { id: 'long', name: 'Long', icon: '💃' },
  { id: 'wavy', name: 'Wavy', icon: '〰️' },
  { id: 'curly', name: 'Curly', icon: '🌀' },
];

export default function StudioHairTab({ customization, onCustomizationChange }) {
  const [selectedColor, setSelectedColor] = React.useState(customization?.hairColor || 'black');
  const [selectedStyle, setSelectedStyle] = React.useState(customization?.hairStyle || 'medium');

  const handleColorChange = color => {
    setSelectedColor(color);
    onCustomizationChange({ ...customization, hairColor: color });
  };

  const handleStyleChange = style => {
    setSelectedStyle(style);
    onCustomizationChange({ ...customization, hairStyle: style });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Hair Color */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 text-gray-400">
          Hair Color
        </p>
        <div className="grid grid-cols-3 gap-2">
          {HAIR_COLORS.map(color => (
            <motion.button
              key={color.id}
              onClick={() => handleColorChange(color.id)}
              className="aspect-square rounded-lg transition-all border-2"
              style={{
                background: color.hex,
                borderColor: selectedColor === color.id ? '#00D4FF' : 'transparent',
                boxShadow: selectedColor === color.id ? `0 0 16px ${color.hex}80` : 'none',
              }}
              whileHover={{ scale: 1.08 }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Hair Style */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 text-gray-400">
          Hair Style
        </p>
        <div className="space-y-2">
          {HAIR_STYLES.map(style => (
            <motion.button
              key={style.id}
              onClick={() => handleStyleChange(style.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: selectedStyle === style.id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                color: selectedStyle === style.id ? '#00D4FF' : 'rgba(255,255,255,0.6)',
                border: selectedStyle === style.id ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
              }}
              whileHover={{ x: 2 }}
            >
              <span className="text-lg">{style.icon}</span>
              <span>{style.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        className="w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider"
        style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(102,224,255,0.1))',
          color: '#00D4FF',
          border: '1px solid rgba(0,212,255,0.3)',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Save Hair
      </motion.button>
    </div>
  );
}