import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Send,
  AtSign,
  Loader2,
  Check,
  CheckCheck,
  Info
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function StudioChat({ sessionId, currentUser, activeUsers = [] }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [mentioning, setMentioning] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (sessionId) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const msgs = await base44.entities.CollaborationMessage.filter(
        { session_id: sessionId },
        '-created_date',
        100
      );
      setMessages(msgs.reverse() || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      // Check for mentions
      const mentions = [];
      const mentionRegex = /@(\S+)/g;
      let match;
      while ((match = mentionRegex.exec(newMessage)) !== null) {
        const mentionedUser = activeUsers.find(u => 
          u.full_name.toLowerCase().includes(match[1].toLowerCase()) ||
          u.email.toLowerCase().includes(match[1].toLowerCase())
        );
        if (mentionedUser) {
          mentions.push(mentionedUser.email);
        }
      }

      await base44.entities.CollaborationMessage.create({
        session_id: sessionId,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        message_type: mentions.length > 0 ? 'mention' : 'text',
        content: newMessage,
        mentions: mentions
      });

      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    
    // Handle @ mentions
    if (e.key === '@') {
      setMentioning(true);
    }
  };

  const insertMention = (user) => {
    const mention = `@${user.full_name.replace(/\s+/g, '')} `;
    setNewMessage(prev => prev + mention);
    setMentioning(false);
    inputRef.current?.focus();
  };

  const getUserColor = (email) => {
    const user = activeUsers.find(u => u.email === email);
    return user?.color || '#666666';
  };

  const renderMessage = (msg) => {
    const isOwn = msg.sender_email === currentUser?.email;
    const isMentioned = msg.mentions?.includes(currentUser?.email);

    return (
      <div
        key={msg.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
      >
        <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
          {msg.message_type === 'system' ? (
            <div className="flex items-center justify-center py-2">
              <Badge variant="outline" className="text-xs bg-[#f5f5f7]">
                <Info className="w-3 h-3 mr-1" />
                {msg.content}
              </Badge>
            </div>
          ) : (
            <>
              {!isOwn && (
                <p className="text-xs text-[#666666] mb-1 px-3" style={{ color: getUserColor(msg.sender_email) }}>
                  {msg.sender_name}
                </p>
              )}
              <div
                className={`rounded-2xl px-4 py-2 ${
                  isOwn
                    ? 'bg-[#0088cc] text-white'
                    : isMentioned
                    ? 'bg-yellow-100 border border-yellow-300'
                    : 'bg-[#f5f5f7] text-[#000000]'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-white/70' : 'text-[#666666]'}`}>
                  <span>{format(new Date(msg.created_date), 'HH:mm')}</span>
                  {isOwn && (
                    msg.is_read ? (
                      <CheckCheck className="w-3 h-3" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-full border-[#0088cc]/30">
      <CardHeader className="pb-3 border-b border-[#eeeeee]">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-[#0088cc]" />
          <span>Team Chat</span>
          <Badge variant="secondary" className="text-[10px]">
            {activeUsers.length} members
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#666666]">
              <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Mention Suggestions */}
        {mentioning && activeUsers.length > 0 && (
          <div className="bg-white border border-[#eeeeee] rounded-lg shadow-lg p-2 space-y-1">
            <p className="text-xs text-[#666666] px-2 py-1">Mention someone:</p>
            {activeUsers
              .filter(u => u.email !== currentUser?.email)
              .map(user => (
                <button
                  key={user.email}
                  onClick={() => insertMention(user)}
                  className="w-full text-left px-2 py-1 rounded hover:bg-[#f5f5f7] transition-colors flex items-center gap-2"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{user.full_name}</span>
                </button>
              ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 pt-2 border-t border-[#eeeeee]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMentioning(!mentioning)}
            className="flex-shrink-0"
          >
            <AtSign className="w-4 h-4" />
          </Button>
          
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sending}
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="flex-shrink-0 bg-[#0088cc] hover:bg-[#0099dd]"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-[#666666] text-center">
          Press @ to mention someone · Enter to send
        </p>
      </CardContent>
    </Card>
  );
}