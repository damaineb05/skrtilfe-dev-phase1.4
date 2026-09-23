import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Plus, LogOut, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MultiplayerPanel({ 
  connected, 
  room, 
  players, 
  onCreateRoom, 
  onJoinRoom, 
  onLeaveRoom,
  currentUser 
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState('create'); // 'create' or 'join'

  const handleCreate = async () => {
    await onCreateRoom({
      roomName: roomName || 'Untitled Room',
      email: currentUser?.email,
      name: currentUser?.full_name || 'Guest',
      avatarUrl: currentUser?.avatar_config?.avatarUrl
    });
    setShowDialog(false);
    setRoomName('');
  };

  const handleJoin = async () => {
    await onJoinRoom(roomId, {
      email: currentUser?.email,
      name: currentUser?.full_name || 'Guest',
      avatarUrl: currentUser?.avatar_config?.avatarUrl
    });
    setShowDialog(false);
    setRoomId('');
  };

  const playerCount = Object.keys(players).length;

  return (
    <div className="glass-panel-drip rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase">Multiplayer</h3>
        </div>
        {connected && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
            Live
          </Badge>
        )}
      </div>

      {!connected ? (
        <div className="space-y-3">
          <Button
            onClick={() => {
              setMode('create');
              setShowDialog(true);
            }}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
          <Button
            onClick={() => {
              setMode('join');
              setShowDialog(true);
            }}
            variant="outline"
            className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <Users className="w-4 h-4 mr-2" />
            Join Room
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-black/30 rounded-lg p-3 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/60">Room ID</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(room.id);
                }}
                className="h-6 text-xs text-cyan-400"
              >
                Copy
              </Button>
            </div>
            <p className="text-xs font-mono text-white/80 break-all">{room?.id}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Players Online</span>
              <span className="text-sm font-bold text-cyan-400">{playerCount}</span>
            </div>
            
            <div className="max-h-32 overflow-y-auto space-y-1">
              {Object.values(players).map((player) => (
                <div
                  key={player.sessionId}
                  className="flex items-center gap-2 px-2 py-1 bg-black/20 rounded-lg"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-white/80">{player.name}</span>
                  {player.sessionId === room?.sessionId && (
                    <Badge className="ml-auto text-[10px] bg-cyan-500/20 text-cyan-400">You</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={onLeaveRoom}
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave Room
          </Button>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {mode === 'create' ? 'Create Room' : 'Join Room'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {mode === 'create' ? (
              <>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Room Name</label>
                  <Input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="My DripSync Room"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
                >
                  Create Room
                </Button>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Room ID</label>
                  <Input
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter room ID..."
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button
                  onClick={handleJoin}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
                >
                  Join Room
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}