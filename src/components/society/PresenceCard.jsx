import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { User, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AURA_CONFIG = {
  Focused: { color: 'purple', emoji: '🎯', label: 'Focused' },
  Open: { color: 'green', emoji: '🌊', label: 'Open' },
  Ambient: { color: 'blue', emoji: '🌙', label: 'Ambient' },
  Expressive: { color: 'orange', emoji: '✨', label: 'Expressive' }
};

export default function PresenceCard({ user, showAvatar = true }) {
  const auraData = AURA_CONFIG[user.social_aura] || AURA_CONFIG.Ambient;
  
  const getLastActiveWindow = () => {
    if (!user.analytics_metadata?.lastActiveDate) return 'Recently';
    
    const lastActive = new Date(user.analytics_metadata.lastActiveDate);
    const now = new Date();
    const diffHours = Math.floor((now - lastActive) / (1000 * 60 * 60));
    
    if (diffHours < 2) return 'Just now';
    if (diffHours < 24) return 'Today';
    if (diffHours < 48) return 'Yesterday';
    if (diffHours < 168) return 'This week';
    return 'Recently';
  };

  return (
    <Link to={createPageUrl('ProfileHub') + `?user=${user.email}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-xl p-4 hover:border-cyan-500/30 transition-all group"
      >
        {/* Avatar Snapshot */}
        {showAvatar && (
          <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 flex items-center justify-center">
            {user.profile_image_url ? (
              <img src={user.profile_image_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-gray-600" />
            )}
          </div>
        )}

        {/* User Info */}
        <div className="mb-3">
          <h4 className="text-sm font-bold text-white truncate">{user.full_name || 'Member'}</h4>
          <p className="text-xs text-gray-500">@{user.email?.split('@')[0]}</p>
        </div>

        {/* Aura Badge */}
        <div className="mb-2">
          <Badge className={`bg-${auraData.color}-500/20 text-${auraData.color}-300 border-${auraData.color}-500/30 text-xs`}>
            {auraData.emoji} {auraData.label}
          </Badge>
        </div>

        {/* Current Focus */}
        {user.current_focus && (
          <p className="text-xs text-gray-400 italic mb-2 line-clamp-2">
            "{user.current_focus}"
          </p>
        )}

        {/* Last Active Window */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="w-3 h-3" />
          <span>{getLastActiveWindow()}</span>
        </div>
      </motion.div>
    </Link>
  );
}