import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AssistantPanel from './AssistantPanel';

export default function AssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      {/* Floating Button (shown when panel is closed) */}
      <AnimatePresence>
        {!isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-[100] group"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-110 transition-all"
            >
              <Bot className="w-6 h-6" />
            </Button>
            
            {/* Tooltip on hover */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                AI Assistant
              </div>
            </div>
            
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full animate-ping bg-cyan-500/30" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assistant Panel */}
      <AnimatePresence>
        {(isOpen || isMinimized) && (
          <AssistantPanel
            isOpen={isOpen}
            isMinimized={isMinimized}
            onClose={() => {
              setIsOpen(false);
              setIsMinimized(false);
            }}
            onMinimize={() => {
              setIsMinimized(!isMinimized);
              if (!isMinimized) setIsOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}