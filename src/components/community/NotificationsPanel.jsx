import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Repeat,
  AtSign,
  Gift,
  Calendar,
  Users,
  Check,
  Settings,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockNotifications = [
  {
    id: 1,
    type: 'like',
    user: { name: 'CryptoArtist', handle: 'cryptoart_0x', avatar: '🎨' },
    content: 'liked your post',
    target: 'Check out my new Genesis NFT!',
    timestamp: '2m ago',
    read: false
  },
  {
    id: 2,
    type: 'follow',
    user: { name: 'MetaBuilder', handle: 'meta_builder', avatar: '🏗️' },
    content: 'started following you',
    timestamp: '15m ago',
    read: false
  },
  {
    id: 3,
    type: 'comment',
    user: { name: 'FashionDAO', handle: 'fashion_dao', avatar: '👔' },
    content: 'commented on your post',
    target: 'This is amazing! 🔥',
    timestamp: '1h ago',
    read: false
  },
  {
    id: 4,
    type: 'mention',
    user: { name: 'NFTCollector', handle: 'nft_whale', avatar: '🐋' },
    content: 'mentioned you in a post',
    target: '@you should check this out...',
    timestamp: '2h ago',
    read: true
  },
  {
    id: 5,
    type: 'repost',
    user: { name: 'DigitalDrip', handle: 'digital_drip', avatar: '💧' },
    content: 'reposted your post',
    timestamp: '3h ago',
    read: true
  },
  {
    id: 6,
    type: 'event',
    content: 'Genesis Drop Party starts in 2 hours',
    timestamp: '3h ago',
    read: true
  },
  {
    id: 7,
    type: 'group',
    user: { name: 'Digital Fashion Collective', avatar: '👗' },
    content: 'New post in Digital Fashion Collective',
    timestamp: '4h ago',
    read: true
  },
  {
    id: 8,
    type: 'reward',
    content: 'You earned the "Early Adopter" badge!',
    timestamp: '1d ago',
    read: true
  }
];

const typeConfig = {
  like: { icon: Heart, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  follow: { icon: UserPlus, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  comment: { icon: MessageCircle, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  mention: { icon: AtSign, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  repost: { icon: Repeat, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  event: { icon: Calendar, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  group: { icon: Users, color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  reward: { icon: Gift, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' }
};

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'mentions') return n.type === 'mention' || n.type === 'comment';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-400" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white ml-2">{unreadCount}</Badge>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead}
              size="sm"
              className="bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
          <Button size="icon" className="bg-zinc-800 hover:bg-zinc-700 text-white">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 rounded-xl">
          <TabsTrigger value="all" className="data-[state=active]:bg-zinc-700 rounded-lg">
            All
          </TabsTrigger>
          <TabsTrigger value="unread" className="data-[state=active]:bg-zinc-700 rounded-lg">
            Unread
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white ml-1 text-[10px] px-1.5">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="mentions" className="data-[state=active]:bg-zinc-700 rounded-lg">
            Mentions
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="space-y-2">
            {filteredNotifications.map((notification, index) => {
              const config = typeConfig[notification.type];
              const Icon = config?.icon || Bell;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                    notification.read 
                      ? 'bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-800/50' 
                      : 'bg-zinc-900/70 border-cyan-500/30 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full ${config?.bgColor} flex items-center justify-center flex-shrink-0`}>
                      {notification.user?.avatar ? (
                        <span className="text-lg">{notification.user.avatar}</span>
                      ) : (
                        <Icon className={`w-5 h-5 ${config?.color}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white">
                        {notification.user && (
                          <span className="font-bold hover:underline cursor-pointer">
                            {notification.user.name}
                          </span>
                        )}{' '}
                        <span className="text-gray-400">{notification.content}</span>
                      </p>
                      {notification.target && (
                        <p className="text-gray-500 text-sm mt-1 truncate">
                          "{notification.target}"
                        </p>
                      )}
                      <p className="text-gray-600 text-xs mt-1">{notification.timestamp}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-1 hover:bg-zinc-700 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  {activeTab === 'unread' ? 'All caught up!' : 'No notifications yet'}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}