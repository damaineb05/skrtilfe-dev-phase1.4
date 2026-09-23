/**
 * StudioFaceTab — Face customization sliders
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FACE_SLIDERS = [
  { id: 'faceShape', label: 'Face Shape', min: -1, max: 1, step: 0.1 },
  { id: 'skinTone', label: 'Skin Tone', min: 0, max: 1, step: 0.05 },
  { id: 'eyeColor', label: 'Eye Color', min: 0, max: 1, step: 0.05 },
  { id: 'lipColor', label: 'Lip Color', min: 0, max: 1, step: 0.05 },
];

export default function StudioFaceTab({ customization, onCustomizationChange }) {
  const [localValues, setLocalValues] = useState(customization || {});

  const handleSliderChange = (id, value) => {
    const updated = { ...localValues, [id]: parseFloat(value) };
    setLocalValues(updated);
    onCustomizationChange(updated);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4 text-gray-400">
          Face Customization
        </p>
        <div className="space-y-4">
          {FACE_SLIDERS.map(slider => (
            <div key={slider.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300">{slider.label}</label>
                <span className="text-xs text-cyan-400 font-mono">
                  {(localValues[slider.id] || 0).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={localValues[slider.id] || 0}
                onChange={e => handleSliderChange(slider.id, e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: 'rgba(0,212,255,0.2)',
                  WebkitAppearance: 'none',
                }}
              />
              <style>{`
                input[type="range"]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: #00D4FF;
                  cursor: pointer;
                  box-shadow: 0 0 12px rgba(0,212,255,0.6);
                }
                input[type="range"]::-moz-range-thumb {
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: #00D4FF;
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 0 12px rgba(0,212,255,0.6);
                }
              `}</style>
            </div>
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
        Save Face
      </motion.button>
    </div>
  );
}