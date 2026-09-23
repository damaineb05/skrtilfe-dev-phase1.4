import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';

export default function PresenceIndicators({ activeUsers = [], currentUser }) {
  return (
    <AnimatePresence>
      {activeUsers
        .filter(user => user.email !== currentUser?.email && user.cursor_position)
        .map(user => (
          <motion.div
            key={user.email}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              position: 'absolute',
              left: `${user.cursor_position.x}px`,
              top: `${user.cursor_position.y}px`,
              pointerEvents: 'none',
              zIndex: 9999
            }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300
            }}
          >
            {/* Cursor */}
            <div
              className="relative"
              style={{ color: user.color || '#0088cc' }}
            >
              <MousePointer2 className="w-5 h-5 drop-shadow-lg" fill="currentColor" />
              
              {/* User label */}
              <div
                className="absolute top-6 left-2 whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium text-white shadow-lg"
                style={{ backgroundColor: user.color || '#0088cc' }}
              >
                {user.full_name}
              </div>

              {/* Selection indicator */}
              {user.selected_object_id && (
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white animate-pulse"
                  style={{ backgroundColor: user.color || '#0088cc' }}
                />
              )}
            </div>
          </motion.div>
        ))}
    </AnimatePresence>
  );
}