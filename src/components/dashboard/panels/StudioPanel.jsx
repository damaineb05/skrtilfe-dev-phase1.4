import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Sparkles, Layers, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const QUICK_ACTIONS = [
  { label: 'Create NFT', icon: Sparkles },
  { label: 'Upload 3D Model', icon: Layers },
  { label: 'View Drafts', icon: Clock },
];

export default function StudioPanel() {
  return (
    <div className="p-6 space-y-4">
      <div className="aspect-video rounded-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(59,130,246,0.12))' }}>
        <div className="text-center">
          <Plus className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(168,85,247,0.7)' }} />
          <h3 className="text-lg font-bold text-white mb-2">Creator Studio</h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Create NFTs, 3D assets, and more</p>
          <Link to={createPageUrl('Studio')}>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white">
              <ExternalLink className="w-4 h-4 mr-2" /> Open Full Studio
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Quick Actions</h4>
        {QUICK_ACTIONS.map(action => (
          <Link key={action.label} to={createPageUrl('Studio')}>
            <div className="p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-3"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <action.icon className="w-4 h-4" style={{ color: 'rgba(168,85,247,0.7)' }} />
              <span className="text-sm text-white">{action.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto" style={{ color: 'rgba(255,255,255,0.25)' }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}