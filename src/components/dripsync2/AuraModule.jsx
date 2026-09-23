import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Circle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AURA_STATES = [
  {
    id: 'Focused',
    label: 'Focused',
    description: 'Low visibility. Working on something important.',
    color: 'purple',
    glow: 'rgba(168, 85, 247, 0.3)',
    emoji: '🎯'
  },
  {
    id: 'Open',
    label: 'Open',
    description: 'Collaboration-friendly. Available for connection.',
    color: 'green',
    glow: 'rgba(34, 197, 94, 0.3)',
    emoji: '🌊'
  },
  {
    id: 'Ambient',
    label: 'Ambient',
    description: 'Present but quiet. Observing, not engaging.',
    color: 'blue',
    glow: 'rgba(59, 130, 246, 0.3)',
    emoji: '🌙'
  },
  {
    id: 'Expressive',
    label: 'Expressive',
    description: 'Showing creations. Ready to share.',
    color: 'orange',
    glow: 'rgba(249, 115, 22, 0.3)',
    emoji: '✨'
  }
];

export default function AuraModule({ currentUser, onAuraChange }) {
  const [selectedAura, setSelectedAura] = useState(currentUser?.social_aura || 'Ambient');
  const [currentFocus, setCurrentFocus] = useState(currentUser?.current_focus || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        social_aura: selectedAura,
        current_focus: currentFocus,
        last_aura_change: new Date().toISOString()
      });
      onAuraChange?.(selectedAura);
    } catch (error) {
      console.error('Failed to save aura:', error);
    } finally {
      setSaving(false);
    }
  };

  const currentAuraData = AURA_STATES.find(a => a.id === selectedAura) || AURA_STATES[2];

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Social Presence</h3>
        <p className="text-xs text-gray-500">How you appear to the society</p>
      </div>

      {/* Current Aura Display */}
      <div className="mb-6 p-6 bg-gradient-to-br from-zinc-900 to-black rounded-xl border border-zinc-800 text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <motion.div
            animate={{
              boxShadow: [`0 0 20px ${currentAuraData.glow}`, `0 0 40px ${currentAuraData.glow}`, `0 0 20px ${currentAuraData.glow}`]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className={`w-full h-full rounded-full bg-${currentAuraData.color}-500/20 border-2 border-${currentAuraData.color}-500/50 flex items-center justify-center`}
          >
            <span className="text-4xl">{currentAuraData.emoji}</span>
          </motion.div>
        </div>
        <h4 className="text-lg font-black text-white mb-2">{currentAuraData.label}</h4>
        <p className="text-xs text-gray-400">{currentAuraData.description}</p>
      </div>

      {/* Aura Selection */}
      <div className="space-y-2 mb-4 flex-1 overflow-y-auto">
        {AURA_STATES.map(aura => (
          <button
            key={aura.id}
            onClick={() => setSelectedAura(aura.id)}
            className={`w-full p-4 rounded-lg border transition-all text-left ${
              selectedAura === aura.id
                ? `bg-${aura.color}-500/10 border-${aura.color}-500/50`
                : 'bg-zinc-800/30 border-zinc-700 hover:bg-zinc-800/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{aura.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{aura.label}</p>
                <p className="text-xs text-gray-400">{aura.description}</p>
              </div>
              {selectedAura === aura.id && (
                <Circle className={`w-3 h-3 fill-${aura.color}-400 text-${aura.color}-400`} />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Focus Input */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Current Focus (optional)</label>
        <input
          type="text"
          value={currentFocus}
          onChange={(e) => setCurrentFocus(e.target.value.slice(0, 60))}
          placeholder="What are you working on?"
          maxLength={60}
          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
        />
        <p className="text-xs text-gray-600 mt-1">{currentFocus.length}/60</p>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Presence'}
      </Button>

      {/* Info */}
      <p className="text-[10px] text-gray-600 text-center mt-4">
        Your aura affects who can see and interact with you
      </p>
    </div>
  );
}