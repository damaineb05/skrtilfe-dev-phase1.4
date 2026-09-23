import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, X, Settings, Search, Users, Phone, Video } from 'lucide-react';
import ChatSystem from './ChatSystem';
import NotificationsList from './NotificationsList';
import CallInterface from './CallInterface';
import MessengerSettings from './MessengerSettings';
import { User as UserEntity } from '@/entities/User';

export default function FloatingMessenger({ isOpen, onClose }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  const [activeView, setActiveView] = useState('chat'); // chat, call, video, settings
  const [unreadCount, setUnreadCount] = useState(3);
  const [currentUser, setCurrentUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(12);
  const widgetRef = useRef(null);
  const headerRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const initialX = window.innerWidth - 450; // Position on right side
    const initialY = 100;
    setPosition({ x: initialX, y: initialY });
    
    // Load current user
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await UserEntity.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const handleMouseDown = (e) => {
    if (headerRef.current && headerRef.current.contains(e.target) &&
        (!closeButtonRef.current || !closeButtonRef.current.contains(e.target))) {
          
      e.preventDefault();
      setIsDragging(true);
      
      const initialX = e.clientX - position.x;
      const initialY = e.clientY - position.y;

      const handleMouseMove = (moveEvent) => {
        let newX = moveEvent.clientX - initialX;
        let newY = moveEvent.clientY - initialY;
        
        if (widgetRef.current) {
          const widgetRect = widgetRef.current.getBoundingClientRect();
          newX = Math.max(0, Math.min(newX, window.innerWidth - widgetRect.width));
          newY = Math.max(0, Math.min(newY, window.innerHeight - widgetRect.height));
        }

        setPosition({ x: newX, y: newY });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleCall = (type = 'voice') => {
    setActiveView(type === 'voice' ? 'call' : 'video');
  };

  const handleSettings = () => {
    setActiveView('settings');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'call':
        return <CallInterface type="voice" onBack={() => setActiveView('chat')} currentUser={currentUser} />;
      case 'video':
        return <CallInterface type="video" onBack={() => setActiveView('chat')} currentUser={currentUser} />;
      case 'settings':
        return <MessengerSettings onBack={() => setActiveView('chat')} currentUser={currentUser} />;
      default:
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
            <TabsList className="grid w-full grid-cols-3 gap-1 p-1 rounded-lg m-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <TabsTrigger 
                value="messages" 
                className="relative text-xs font-medium data-[state=active]:text-white data-[state=active]:bg-[rgba(0,212,255,0.15)] text-white/40"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Chats
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500 text-white">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="people" 
                className="text-xs font-medium data-[state=active]:text-white data-[state=active]:bg-[rgba(0,212,255,0.15)] text-white/40"
              >
                <Users className="w-4 h-4 mr-1" />
                People
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="text-xs font-medium data-[state=active]:text-white data-[state=active]:bg-[rgba(0,212,255,0.15)] text-white/40"
              >
                <Bell className="w-4 h-4 mr-1" />
                Activity
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="messages" className="flex-grow overflow-hidden mt-0">
              <ChatSystem currentUser={currentUser} />
            </TabsContent>
            
            <TabsContent value="people" className="flex-grow overflow-hidden mt-0">
              <PeopleList currentUser={currentUser} />
            </TabsContent>
            
            <TabsContent value="notifications" className="flex-grow overflow-hidden mt-0">
              <NotificationsList />
            </TabsContent>
          </Tabs>
        );
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            className="fixed inset-0 z-[99] bg-black/50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        <motion.div
          ref={widgetRef}
          className={[
            "fixed z-[100] shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden",
            "inset-x-0 bottom-0 rounded-t-2xl h-[85vh]",
            "md:inset-auto md:rounded-2xl md:w-[420px] md:h-[650px]",
          ].join(' ')}
          style={isMobile ? {} : {
            left: `${position.x}px`,
            top: `${position.y}px`,
            background: 'rgba(10,10,20,0.96)',
            border: '1px solid rgba(0,212,255,0.15)',
          }}
          initial={isMobile ? { opacity: 1, y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
          animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
          exit={isMobile ? { opacity: 1, y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Mobile drag handle */}
          <div className="md:hidden flex justify-center pt-2 pb-0 shrink-0">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div 
            ref={headerRef}
            onMouseDown={handleMouseDown}
            className={`flex-shrink-0 flex items-center justify-between p-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ borderBottom: '1px solid rgba(0,212,255,0.15)', background: 'rgba(0,0,0,0.4)' }}
          >
            <div className="flex items-center gap-3 select-none">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)' }}>
                <MessageSquare className="w-4 h-4" style={{ color: '#00D4FF' }} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white tracking-wide">SKRTLIFE Messenger</h3>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{onlineUsers} online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onClick={() => handleCall('voice')}
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onClick={() => handleCall('video')}
              >
                <Video className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onClick={handleSettings}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                ref={closeButtonRef}
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="w-8 h-8 cursor-pointer"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {renderActiveView()}
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// People List Component
function PeopleList({ currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Mock data - replace with actual API calls
    setActiveUsers([
      { id: 1, name: 'Alex Skrt', email: 'alex@skrtlife.com', avatar: null, status: 'online', lastSeen: 'Active now' },
      { id: 2, name: 'Jane Pixel', email: 'jane@skrtlife.com', avatar: null, status: 'away', lastSeen: '5m ago' },
      { id: 3, name: 'Mike Chain', email: 'mike@skrtlife.com', avatar: null, status: 'offline', lastSeen: '2h ago' },
    ]);
    
    setSuggestions([
      { id: 4, name: 'Sarah Connect', email: 'sarah@skrtlife.com', avatar: null, mutualFriends: 3 },
      { id: 5, name: 'NFT God', email: 'nftgod@skrtlife.com', avatar: null, mutualFriends: 8 },
    ]);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'away': return 'bg-yellow-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b theme-border">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 theme-text-secondary" />
          <input
            type="text"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 theme-input rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Active Users */}
      <div className="flex-grow overflow-y-auto">
        <div className="p-3">
          <h4 className="text-sm font-semibold theme-text mb-2">Active ({activeUsers.length})</h4>
          <div className="space-y-2">
            {activeUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:theme-bg-secondary transition-colors cursor-pointer">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} rounded-full border-2 theme-border`}></div>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-medium theme-text text-sm truncate">{user.name}</p>
                  <p className="theme-text-secondary text-xs">{user.lastSeen}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div className="p-3 border-t theme-border">
          <h4 className="text-sm font-semibold theme-text mb-2">Suggestions</h4>
          <div className="space-y-2">
            {suggestions.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:theme-bg-secondary transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-medium theme-text text-sm truncate">{user.name}</p>
                  <p className="theme-text-secondary text-xs">{user.mutualFriends} mutual connections</p>
                </div>
                <Button size="sm" className="text-xs px-3">
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}