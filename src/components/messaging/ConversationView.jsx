
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '@/entities/Message';
import { Conversation } from '@/entities/Conversation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Send, 
  Smile, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical, 
  Image as ImageIcon,
  Mic,
  ThumbsUp,
  Heart,
  Laugh,
  Angry,
  Frown, // Changed from Sad to Frown
  Reply,
  Forward,
  Trash2,
  Edit3,
  Check,
  CheckCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';

export default function ConversationView({ conversation, currentUser, onBack, onUpdateConversation }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const reactions = [
    { emoji: '👍', icon: ThumbsUp, name: 'like' },
    { emoji: '❤️', icon: Heart, name: 'love' },
    { emoji: '😂', icon: Laugh, name: 'laugh' },
    { emoji: '😮', name: 'wow' },
    { emoji: '😢', icon: Frown, name: 'sad' }, // Icon changed to Frown
    { emoji: '😡', icon: Angry, name: 'angry' }
  ];

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const conversationMessages = await Message.filter(
        { conversation_id: conversation.id }, 
        'created_date', 
        100
      );
      setMessages(conversationMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  }, [conversation.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]); // Dependency changed to loadMessages

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      conversation_id: conversation.id,
      sender_email: currentUser.email,
      content: newMessage.trim(),
      reply_to_id: replyingTo?.id
    };

    try {
      const sentMessage = await Message.create(messageData);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      setReplyingTo(null);
      
      // Update conversation's last message
      await Conversation.update(conversation.id, {
        last_message: newMessage.trim(),
        last_message_timestamp: new Date().toISOString()
      });
      
      if (onUpdateConversation) {
        onUpdateConversation({
          ...conversation,
          last_message: newMessage.trim(),
          last_message_timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleReaction = async (message, reaction) => {
    // In a real app, you'd update the message with the reaction
    console.log('Adding reaction:', reaction.name, 'to message:', message.id);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const otherParticipant = conversation.participant_details.find(
    p => p.email !== currentUser.email
  );

  const MessageBubble = ({ message, isOwn }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
    >
      <div className={`group relative max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        isOwn 
          ? 'bg-blue-500 text-white' 
          : 'theme-bg-secondary theme-text'
      }`}>
        {/* Reply indicator */}
        {message.reply_to_id && (
          <div className="text-xs opacity-70 mb-1 border-l-2 border-current pl-2">
            Replying to message
          </div>
        )}
        
        <p className="text-sm break-words">{message.content}</p>
        
        {/* Message status and time */}
        <div className={`flex items-center justify-end mt-1 text-xs ${
          isOwn ? 'text-blue-100' : 'theme-text-secondary'
        }`}>
          <span>{formatTime(message.created_date)}</span>
          {isOwn && (
            <div className="ml-1">
              {message.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
            </div>
          )}
        </div>

        {/* Quick reactions */}
        <div className={`absolute -bottom-2 ${isOwn ? 'left-0' : 'right-0'} opacity-0 group-hover:opacity-100 transition-opacity`}>
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg border theme-border">
            {reactions.slice(0, 3).map((reaction) => (
              <button
                key={reaction.name}
                onClick={() => handleReaction(message, reaction)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm">{reaction.emoji}</span>
              </button>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <MoreVertical className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setReplyingTo(message)}>
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward className="w-4 h-4 mr-2" />
                  Forward
                </DropdownMenuItem>
                {isOwn && (
                  <>
                    <DropdownMenuItem>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 p-3 border-b theme-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack} 
              className="p-1 rounded-full hover:theme-bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 theme-text" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={otherParticipant?.avatar_url || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=faces`} 
                  alt="" 
                  className="w-10 h-10 rounded-full object-cover" 
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              
              <div>
                <h3 className="font-semibold theme-text">
                  {otherParticipant?.full_name || 'Unknown User'}
                </h3>
                <p className="text-xs theme-text-secondary">
                  {isTyping ? 'typing...' : 'Active now'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm theme-text-secondary">Loading messages...</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_email === currentUser.email}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply Bar */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-shrink-0 px-3 py-2 border-t theme-border bg-blue-50 dark:bg-blue-900/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Replying to {replyingTo.sender_email === currentUser.email ? 'yourself' : otherParticipant?.full_name}
                </p>
                <p className="text-sm theme-text-secondary truncate">{replyingTo.content}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setReplyingTo(null)} className="w-6 h-6">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="flex-shrink-0 p-3 border-t theme-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-9 h-9">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-9 h-9">
            <ImageIcon className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="pr-10 rounded-full theme-input theme-border"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          {newMessage.trim() ? (
            <Button onClick={handleSendMessage} size="icon" className="w-9 h-9 bg-blue-500 hover:bg-blue-600">
              <Send className="w-4 h-4 text-white" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="w-9 h-9">
              <Mic className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
