import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, ArrowLeft, Search, MoreVertical, Users, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserSearch from './UserSearch';
import ConversationView from './ConversationView';

export default function ChatSystem({ currentUser: passedUser }) {
  const [currentUser, setCurrentUser] = useState(passedUser);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const user = passedUser || await base44.auth.me();
        setCurrentUser(user);
        
        if (user?.email) {
          const userConversations = await base44.entities.Conversation.filter({ participants: user.email });
          setConversations(userConversations || []);
          setFilteredConversations(userConversations || []);
        }
      } catch (error) {
        console.error("Error loading chat data:", error);
        setConversations([]);
        setFilteredConversations([]);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [passedUser]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = conversations.filter(convo => {
        const otherParticipant = convo?.participant_details?.find(p => p.email !== currentUser?.email);
        return otherParticipant?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               convo?.last_message?.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchTerm, conversations, currentUser]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowUserSearch(false);
  };
  
  const handleUserSelect = async (selectedUser) => {
    if (!currentUser) return;
    
    const participants = [currentUser.email, selectedUser.email].sort();
    const existingConvo = conversations.find(c => 
        c?.participants?.length === 2 && 
        c.participants.every(p => participants.includes(p))
    );

    if (existingConvo) {
        handleSelectConversation(existingConvo);
    } else {
        const newConvo = await base44.entities.Conversation.create({
            participants,
            participant_details: [
                { email: currentUser.email, full_name: currentUser.full_name, avatar_url: currentUser.profile_image_url },
                { email: selectedUser.email, full_name: selectedUser.full_name, avatar_url: selectedUser.profile_image_url }
            ],
            last_message: "Conversation started",
            last_message_timestamp: new Date().toISOString(),
            unread_counts: {}
        });
        setConversations(prev => [newConvo, ...prev]);
        handleSelectConversation(newConvo);
    }
    setShowUserSearch(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-sm theme-text-secondary">Loading conversations...</p>
        </div>
      </div>
    );
  }
  
  if (showUserSearch) {
    return (
      <div className="h-full flex flex-col">
        <header className="flex-shrink-0 p-3 border-b theme-border flex items-center">
          <button 
            onClick={() => setShowUserSearch(false)} 
            className="mr-3 p-1 rounded-full hover:theme-bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 theme-text"/>
          </button>
          <div className="flex-1">
            <h3 className="font-semibold theme-text">New Message</h3>
            <p className="text-xs theme-text-secondary">Search for people to chat with</p>
          </div>
        </header>
        <UserSearch onUserSelect={handleUserSelect} currentUserEmail={currentUser?.email} />
      </div>
    );
  }

  if (selectedConversation) {
    return (
      <ConversationView 
        conversation={selectedConversation} 
        currentUser={currentUser} 
        onBack={() => setSelectedConversation(null)}
        onUpdateConversation={(updatedConvo) => {
          setConversations(prev => 
            prev.map(c => c.id === updatedConvo.id ? updatedConvo : c)
          );
        }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Search */}
      <header className="flex-shrink-0 p-3 border-b theme-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold theme-text">Chats</h3>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="w-8 h-8"
              onClick={() => setShowUserSearch(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-secondary" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 theme-input theme-border rounded-full"
          />
        </div>
      </header>

      {/* Conversation List */}
      <div className="flex-grow overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <div className="space-y-1 p-2">
            {filteredConversations.map(convo => {
              if (!convo) return null;
              const otherParticipant = convo.participant_details?.find(p => p.email !== currentUser?.email);
              const isGroup = convo.participants?.length > 2;
              const unreadCount = convo.unread_counts?.[currentUser?.email] || 0;
              
              return (
                <div
                  key={convo.id}
                  onClick={() => handleSelectConversation(convo)}
                  className="p-3 flex items-center gap-3 cursor-pointer rounded-xl hover:theme-bg-muted transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {isGroup ? (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <img 
                        src={otherParticipant?.avatar_url || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=48&h=48&fit=crop&crop=faces`} 
                        alt="" 
                        className="w-12 h-12 rounded-full object-cover" 
                      />
                    )}
                    
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold theme-text truncate">
                        {isGroup ? 'Group Chat' : (otherParticipant?.full_name || 'Unknown User')}
                      </h4>
                      <div className="flex items-center gap-2">
                        {convo.last_message_timestamp && (
                          <span className="text-xs theme-text-secondary">
                            {formatTime(convo.last_message_timestamp)}
                          </span>
                        )}
                        {unreadCount > 0 && (
                          <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-sm truncate ${unreadCount > 0 ? 'font-medium theme-text' : 'theme-text-secondary'}`}>
                      {convo.last_message || 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 theme-text-secondary mx-auto mb-4" />
              <h3 className="font-semibold theme-text mb-2">No conversations yet</h3>
              <p className="theme-text-secondary text-sm mb-4">
                {searchTerm ? 'No conversations match your search.' : 'Start chatting with someone new!'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setShowUserSearch(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Message
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}