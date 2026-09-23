import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Copy, 
  UserPlus, 
  Sparkles, 
  Radio, 
  X,
  ChevronRight,
  MessageSquare,
  Mic,
  MicOff,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SocialRoomPanel({ 
  isInRoom,
  roomCode,
  participants,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  currentUser
}) {
  const [joinCode, setJoinCode] = useState('');

  if (!isInRoom) {
    return (
      <div className="p-4 space-y-6">
        {/* Create Room */}
        <div className="glass-panel-drip rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Social Room</h3>
              <p className="text-gray-400 text-xs">Hang out with friends</p>
            </div>
          </div>
          
          <Button
            onClick={onCreateRoom}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </div>

        {/* Join Room */}
        <div className="glass-panel-drip rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Join Room</h3>
              <p className="text-gray-400 text-xs">Enter a room code</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ROOM CODE"
              className="bg-black/40 border-cyan-500/30 text-white text-center font-mono tracking-widest"
              maxLength={6}
            />
            <Button
              onClick={() => onJoinRoom(joinCode)}
              disabled={!joinCode.trim()}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4 mr-2" />
              Join
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // In Room View
  return (
    <div className="p-4 space-y-4">
      {/* Room Info */}
      <div className="glass-panel-drip rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Radio className="w-3 h-3 mr-1 animate-pulse" />
            LIVE
          </Badge>
          <button
            onClick={onLeaveRoom}
            className="text-red-400 hover:text-red-300 transition-colors"
            title="Leave room"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white font-mono text-lg">{roomCode}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(roomCode);
            }}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-gray-400 text-xs">
          {participants.length} {participants.length === 1 ? 'person' : 'people'} in room
        </p>
      </div>

      {/* Participants List */}
      <div className="glass-panel-drip rounded-xl p-4">
        <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          Participants
        </h4>
        
        <div className="space-y-2">
          {participants.map(participant => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {participant.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {participant.name}
                  {participant.isHost && (
                    <span className="ml-2 text-yellow-400 text-xs">HOST</span>
                  )}
                </p>
              </div>
              {participant.isMuted && (
                <MicOff className="w-4 h-4 text-red-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          onClick={() => navigator.clipboard.writeText(`Join my DripSync room: ${roomCode}`)}
          className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30"
          size="sm"
        >
          <UserPlus className="w-4 h-4 mr-1" />
          Invite
        </Button>
      </div>
    </div>
  );
}