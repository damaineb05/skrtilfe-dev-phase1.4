import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Twitter, 
  Instagram, 
  Youtube, 
  MessageSquare,
  Link as LinkIcon,
  Unlink,
  Loader2,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const SOCIAL_PLATFORMS = [
  {
    id: 'discord',
    name: 'Discord',
    icon: MessageSquare,
    color: 'text-indigo-400',
    connected: true
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'text-blue-400',
    connected: true
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-500',
    connected: false
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'text-red-500',
    connected: false
  },
];

export default function SocialConnectionsBox() {
  const [platforms, setPlatforms] = useState(SOCIAL_PLATFORMS.map(p => ({ ...p, isConnecting: false })));

  const handleConnectToggle = (platformId) => {
    setPlatforms(prev => 
      prev.map(p => p.id === platformId ? { ...p, isConnecting: true } : p)
    );

    setTimeout(() => {
        setPlatforms(prev => 
            prev.map(p => 
                p.id === platformId 
                ? { ...p, connected: !p.connected, isConnecting: false } 
                : p
            )
        );
    }, 1500);
  };
  
  const connectedCount = platforms.filter(p => p.connected).length;

  return (
    <Card className="ledger-card bg-transparent border-none shadow-none">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 ledger-text-primary">
            <Zap className="w-4 h-4 ledger-accent" />
            Social Matrix
          </CardTitle>
          <Badge variant="outline" className="ledger-border ledger-text-secondary text-xs">
            {connectedCount}/{platforms.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 space-y-2">
        {platforms.map((platform, index) => {
          const Icon = platform.icon;
          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-lg ledger-transition ${platform.connected ? 'bg-ledger-primary/10 border border-ledger-primary/20' : 'bg-ledger-surface hover:bg-ledger-surface-hover'}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${platform.color}`} />
                <span className="text-sm font-medium ledger-text-primary">{platform.name}</span>
              </div>
              
              <Button 
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handleConnectToggle(platform.id)}
                disabled={platform.isConnecting}
              >
                {platform.isConnecting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : platform.connected ? (
                  <Unlink className="w-3 h-3" />
                ) : (
                  <LinkIcon className="w-3 h-3" />
                )}
              </Button>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}