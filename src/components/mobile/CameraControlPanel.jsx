import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Eye, RotateCw } from 'lucide-react';

const CAMERA_PRESETS = [
  { id: 'front', name: 'Front', position: [0, 1.6, 3], rotation: [0, 0, 0] },
  { id: 'side', name: 'Side', position: [3, 1.6, 0], rotation: [0, Math.PI / 2, 0] },
  { id: 'fullbody', name: 'Full Body', position: [0, 1, 5], rotation: [0, 0, 0] },
  { id: 'closeup', name: 'Close-up', position: [0, 1.7, 1], rotation: [0, 0, 0] },
];

/**
 * Camera control system with orbit, zoom, and preset angles
 */
export default function CameraControlPanel({ onCameraChange, isOrbitEnabled, onOrbitToggle }) {
  const [zoom, setZoom] = useState(3);
  const [orbitAngle, setOrbitAngle] = useState(0);

  const handleZoom = useCallback((value) => {
    setZoom(value[0]);
    onCameraChange?.({
      zoom: value[0],
      orbitAngle,
      orbit: isOrbitEnabled,
    });
  }, [orbitAngle, isOrbitEnabled, onCameraChange]);

  const handleOrbitAngle = useCallback((value) => {
    setOrbitAngle(value[0]);
    onCameraChange?.({
      zoom,
      orbitAngle: value[0],
      orbit: isOrbitEnabled,
    });
  }, [zoom, isOrbitEnabled, onCameraChange]);

  const handlePreset = useCallback((preset) => {
    onCameraChange?.({
      preset: preset.id,
      position: preset.position,
      rotation: preset.rotation,
      zoom: preset.id === 'closeup' ? 1.5 : preset.id === 'side' ? 2.5 : 3,
    });
  }, [onCameraChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-4 p-4"
    >
      {/* Orbit Toggle */}
      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
        <span className="text-sm font-medium text-gray-300">Orbit Camera</span>
        <button
          onClick={() => onOrbitToggle?.(!isOrbitEnabled)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isOrbitEnabled ? 'bg-cyan-500' : 'bg-gray-600'
          }`}
        >
          <div
            className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
              isOrbitEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Zoom Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Zoom</label>
          <span className="text-xs text-cyan-400 font-mono">{zoom.toFixed(1)}x</span>
        </div>
        <Slider
          value={[zoom]}
          onValueChange={handleZoom}
          min={0.5}
          max={8}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Orbit Angle Slider (only when orbit enabled) */}
      {isOrbitEnabled && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Orbit Angle</label>
            <span className="text-xs text-cyan-400 font-mono">{Math.round(orbitAngle)}°</span>
          </div>
          <Slider
            value={[orbitAngle]}
            onValueChange={handleOrbitAngle}
            min={0}
            max={360}
            step={5}
            className="w-full"
          />
        </div>
      )}

      {/* Preset Buttons */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300 block">Presets</label>
        <div className="grid grid-cols-2 gap-2">
          {CAMERA_PRESETS.map((preset) => (
            <motion.button
              key={preset.id}
              onClick={() => handlePreset(preset)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-500/30"
            >
              <Eye className="w-3 h-3 inline mr-1" />
              {preset.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <motion.button
        onClick={() => {
          setZoom(3);
          setOrbitAngle(0);
          onCameraChange?.({
            zoom: 3,
            orbitAngle: 0,
            orbit: false,
          });
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full py-2 rounded-lg text-sm font-medium transition-all bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
      >
        <RotateCw className="w-4 h-4 inline mr-2" />
        Reset View
      </motion.button>
    </motion.div>
  );
}