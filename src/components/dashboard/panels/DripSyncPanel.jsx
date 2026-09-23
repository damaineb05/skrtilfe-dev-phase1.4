import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Users, Grid3x3, User, Sparkles, ChevronRight } from 'lucide-react';
import ClosetModule from '../../dripsync2/ClosetModule';
import BodyModule from '../../dripsync2/BodyModule';
import AuraModule from '../../dripsync2/AuraModule';

const MODULES = [
  { id: 'closet', label: 'Closet', icon: Grid3x3 },
  { id: 'body',   label: 'Body',   icon: User },
  { id: 'aura',   label: 'Aura',   icon: Sparkles },
];

export default function DripSyncPanel({ user }) {
  const [activeModule, setActiveModule] = useState('body');
  const [equippedItems, setEquippedItems] = useState([]);

  return (
    <div className="h-full flex flex-col">
      {/* Multiplayer CTA */}
      <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to={createPageUrl('DripSync')}>
          <div className="rounded-xl p-4 hover:opacity-90 transition-all cursor-pointer group flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(236,72,153,0.08))', border: '1px solid rgba(168,85,247,0.2)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
              style={{ background: 'rgba(168,85,247,0.15)' }}>
              <Users className="w-5 h-5" style={{ color: 'rgba(168,85,247,0.9)' }} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white mb-0.5">Enter Multiplayer Room</h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Create or join shared DripSync environments</p>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: 'rgba(168,85,247,0.7)' }} />
          </div>
        </Link>
      </div>

      {/* Module Tabs */}
      <div className="flex gap-2 p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {MODULES.map(mod => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button key={mod.id} onClick={() => setActiveModule(mod.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              style={{
                background: isActive ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.04)',
                border: isActive ? '1px solid rgba(6,182,212,0.35)' : '1px solid rgba(255,255,255,0.08)',
                color: isActive ? '#06B6D4' : 'rgba(255,255,255,0.4)',
              }}>
              <Icon className="w-3.5 h-3.5" />
              {mod.label}
            </button>
          );
        })}
      </div>

      {/* Module Content */}
      <div className="flex-1 overflow-hidden">
        {activeModule === 'closet' && <ClosetModule onEquip={(item) => setEquippedItems(p => [...p, item.id])} currentlyWearing={equippedItems} />}
        {activeModule === 'body' && <BodyModule avatarUrl={user?.avatar_config?.avatarUrl} wearables={equippedItems} />}
        {activeModule === 'aura' && <AuraModule currentUser={user} onAuraChange={() => {}} />}
      </div>
    </div>
  );
}