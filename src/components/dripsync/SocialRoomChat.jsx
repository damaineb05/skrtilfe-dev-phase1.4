import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SocialRoomChat({
  messages,
  onSendMessage,
  currentUserId,
  isOpen,
  onToggle
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  if (!isOpen) {
    return null;












  }

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed bottom-24 right-6 w-96 h-[500px] glass-panel-drip rounded-2xl flex flex-col overflow-hidden z-30 border border-purple-500/30">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <h3 className="text-white font-bold text-sm">Room Chat</h3>
        </div>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white transition-colors">
          
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) =>
        <div
          key={msg.id}
          className={`${
          msg.type === 'system' ?
          'text-center' :
          msg.sender?.id === currentUserId ?
          'flex justify-end' :
          'flex justify-start'}`
          }>
          
            {msg.type === 'system' ?
          <p className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                {msg.content}
              </p> :

          <div className={`max-w-[80%] ${
          msg.sender?.id === currentUserId ?
          'bg-purple-500/20 border-purple-500/30' :
          'bg-white/10 border-white/10'} border rounded-2xl px-4 py-2`
          }>
                {msg.sender?.id !== currentUserId &&
            <p className="text-cyan-400 text-xs font-semibold mb-1">
                    {msg.sender?.name}
                  </p>
            }
                <p className="text-white text-sm">{msg.content}</p>
              </div>
          }
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 bg-black/40">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="bg-white/5 border-white/10 text-white placeholder-gray-500" />
          
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-purple-500 hover:bg-purple-600 text-white"
            size="icon">
            
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>);

}