import React from 'react';
import { Crown, Sparkles, Shield, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export function GenesisBadge({ tier = 'standard', size = 'default' }) {
  const sizeClasses = {
    small: 'text-[9px] px-1.5 py-0.5',
    default: 'text-xs px-2 py-1',
    large: 'text-sm px-3 py-1.5'
  };

  const tierConfig = {
    founder: { 
      label: 'Genesis Founder', 
      icon: Crown, 
      gradient: 'from-yellow-400 to-orange-500',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]'
    },
    early: { 
      label: 'Genesis Early', 
      icon: Sparkles, 
      gradient: 'from-purple-400 to-pink-500',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]'
    },
    standard: { 
      label: 'Genesis', 
      icon: Shield, 
      gradient: 'from-cyan-400 to-purple-500',
      glow: 'shadow-[0_0_15px_rgba(0,212,255,0.4)]'
    }
  };

  const config = tierConfig[tier] || tierConfig.standard;
  const Icon = config.icon;

  return (
    <Badge 
      className={`${sizeClasses[size]} bg-gradient-to-r ${config.gradient} text-white border-0 font-bold uppercase tracking-wider ${config.glow} flex items-center gap-1`}
    >
      <Icon className={size === 'small' ? 'w-2.5 h-2.5' : size === 'large' ? 'w-4 h-4' : 'w-3 h-3'} />
      {config.label}
    </Badge>
  );
}

export function QualityBadge({ verified = false, curated = false, score = 0 }) {
  if (verified) {
    return (
      <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] flex items-center gap-1">
        <Shield className="w-3 h-3" />
        Verified
      </Badge>
    );
  }

  if (curated) {
    return (
      <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[10px] flex items-center gap-1">
        <Star className="w-3 h-3" />
        Curated
      </Badge>
    );
  }

  if (score >= 80) {
    return (
      <Badge className="bg-green-500/20 text-green-400 border border-green-500/40 text-[10px] flex items-center gap-1">
        <Zap className="w-3 h-3" />
        High Quality
      </Badge>
    );
  }

  return null;
}

export function PromotionIndicator({ level }) {
  if (level === 'featured') {
    return (
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400"
      />
    );
  }

  if (level === 'premium') {
    return (
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-500" />
    );
  }

  return null;
}

export function EarlyAccessIndicator({ until }) {
  if (!until) return null;

  const now = new Date();
  const endDate = new Date(until);
  if (now > endDate) return null;

  const hoursLeft = Math.floor((endDate - now) / (1000 * 60 * 60));

  return (
    <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] flex items-center gap-1 animate-pulse">
      <Zap className="w-3 h-3" />
      Early Access • {hoursLeft}h left
    </Badge>
  );
}

export function DiscountBadge({ percent }) {
  if (!percent || percent <= 0) return null;

  return (
    <Badge className="bg-green-500/90 text-white text-xs font-bold px-2 py-1">
      -{percent}% Genesis Discount
    </Badge>
  );
}