import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOODS = [
  { id: 'Calm', label: 'Calm', emoji: '🌙', color: 'blue' },
  { id: 'Focused', label: 'Focused', emoji: '🎯', color: 'purple' },
  { id: 'Open', label: 'Open', emoji: '🌊', color: 'cyan' },
  { id: 'Heavy', label: 'Heavy', emoji: '⛈️', color: 'gray' }
];

export default function StateModule({ currentUser }) {
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [intent, setIntent] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  useEffect(() => {
    checkTodayStatus();
  }, [currentUser]);

  const checkTodayStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastCheckin = currentUser?.daily_checkin?.date;
    
    if (lastCheckin === today) {
      setHasCheckedInToday(true);
      setSelectedMood(currentUser.daily_checkin.mood || 'Calm');
      setIntent(currentUser.daily_checkin.intent || '');
    }
  };

  const handleCheckin = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await base44.auth.updateMe({
        daily_checkin: {
          date: today,
          mood: selectedMood,
          intent
        }
      });
      setHasCheckedInToday(true);
    } catch (error) {
      console.error('Failed to save check-in:', error);
    } finally {
      setSaving(false);
    }
  };

  const currentMood = MOODS.find(m => m.id === selectedMood);

  if (hasCheckedInToday) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center mb-6"
        >
          <Check className="w-10 h-10 text-green-400" />
        </motion.div>

        <h3 className="text-xl font-black text-white mb-2">You're checked in</h3>
        <p className="text-sm text-gray-400 mb-6 text-center max-w-xs">
          Return tomorrow.
        </p>

        <div className="w-full max-w-sm bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div className="text-center mb-4">
            <span className="text-4xl mb-2 block">{currentMood.emoji}</span>
            <p className="text-lg font-bold text-white">{currentMood.label}</p>
          </div>
          {intent && (
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-sm text-white/80 italic">"{intent}"</p>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-600 mt-6">No history. Just now.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="text-center mb-8">
        <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">State</h3>
        <p className="text-xs text-gray-400">One submission per day.</p>
      </div>

      {/* Mood Selector */}
      <div className="mb-6">
        <label className="block text-xs text-gray-400 uppercase tracking-wider mb-3">How are you?</label>
        <div className="grid grid-cols-2 gap-3">
          {MOODS.map(mood => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedMood === mood.id
                  ? `bg-${mood.color}-500/20 border-${mood.color}-500/50`
                  : 'bg-zinc-800/30 border-zinc-700 hover:bg-zinc-800/50'
              }`}
            >
              <span className="text-3xl mb-2 block">{mood.emoji}</span>
              <p className="text-sm font-bold text-white">{mood.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Intent Text */}
      <div className="mb-8">
        <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
          What's on your mind? (optional)
        </label>
        <textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value.slice(0, 140))}
          placeholder="..."
          maxLength={140}
          rows={3}
          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
        />
        <p className="text-xs text-gray-600 mt-1">{intent.length}/140</p>
      </div>

      <Button
        onClick={handleCheckin}
        disabled={saving}
        className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
      </Button>

      <p className="text-xs text-gray-600 text-center mt-4">
        No editing. No history.
      </p>
    </div>
  );
}