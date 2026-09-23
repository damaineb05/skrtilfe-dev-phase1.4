import { useState, useCallback } from 'react';

// Multiplayer (Colyseus) is not yet deployed — all methods are no-ops
const useMultiplayerStub = () => ({
  connected: false,
  room: null,
  players: {},
  joinOrCreate: async () => null,
  joinRoom: async () => null,
  leaveRoom: () => {},
  sendPosition: () => {},
  sendRotation: () => {},
  sendAnimation: () => {},
});

export function useSocialRoom({ user, toast }) {
  const [isInSocialRoom, setIsInSocialRoom] = useState(false);
  const [socialRoomCode, setSocialRoomCode] = useState('');
  const [socialParticipants, setSocialParticipants] = useState([]);
  const [roomMessages, setRoomMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const {
    connected: multiplayerConnected,
    room: multiplayerRoom,
    players: multiplayerPlayers,
    joinOrCreate,
    joinRoom,
    leaveRoom,
    sendPosition,
    sendRotation,
    sendAnimation
  } = useMultiplayerStub();

  const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const createSocialRoom = useCallback(() => {
    const code = generateRoomCode();
    setSocialRoomCode(code);
    setIsInSocialRoom(true);
    setSocialParticipants([{
      id: user?.id || Date.now().toString(),
      name: user?.full_name || 'You',
      email: user?.email,
      avatar: user?.avatar_config,
      isHost: true,
      position: [0, 0, 0]
    }]);
    setRoomMessages([{
      id: Date.now(),
      type: 'system',
      content: 'Room created. Share the code to invite others.',
      timestamp: new Date().toISOString()
    }]);
    toast({ title: "Social Room Created", description: `Room code: ${code}`, duration: 200 });
  }, [user, toast]);

  const joinSocialRoom = useCallback((code) => {
    setSocialRoomCode(code);
    setIsInSocialRoom(true);
    setSocialParticipants([{
      id: user?.id || Date.now().toString(),
      name: user?.full_name || 'You',
      email: user?.email,
      avatar: user?.avatar_config,
      isHost: false,
      position: [2, 0, 2]
    }]);
    toast({ title: "Joined Room", description: `Connected to ${code}`, duration: 200 });
  }, [user, toast]);

  const leaveSocialRoom = useCallback(() => {
    setIsInSocialRoom(false);
    setSocialRoomCode('');
    setSocialParticipants([]);
    setRoomMessages([]);
    setIsChatOpen(false);
    toast({ title: "Left Social Room", description: "You've disconnected from the session.", duration: 200 });
  }, [toast]);

  const sendRoomMessage = useCallback((content) => {
    const newMessage = {
      id: Date.now(),
      type: 'chat',
      sender: { id: user?.id || '1', name: user?.full_name || 'You' },
      content,
      timestamp: new Date().toISOString()
    };
    setRoomMessages(prev => [...prev, newMessage]);
  }, [user]);

  const handleCreateRoom = useCallback(async (options) => {
    await joinOrCreate('dripsync-room', options);
    toast({ title: "Room Created", description: "Share the room ID with friends to join!", duration: 200 });
  }, [joinOrCreate, toast]);

  const handleJoinRoom = useCallback(async (roomId, options) => {
    await joinRoom(roomId, options);
    toast({ title: "Joined Room", description: "You are now in a multiplayer session!", duration: 200 });
  }, [joinRoom, toast]);

  const handleLeaveRoom = useCallback(() => {
    leaveRoom();
    toast({ title: "Left Room", description: "You have left the multiplayer session.", duration: 200 });
  }, [leaveRoom, toast]);

  return {
    // Social room
    isInSocialRoom, socialRoomCode, socialParticipants, roomMessages, isChatOpen, setIsChatOpen,
    createSocialRoom, joinSocialRoom, leaveSocialRoom, sendRoomMessage,
    // Multiplayer
    multiplayerConnected, multiplayerRoom, multiplayerPlayers,
    handleCreateRoom, handleJoinRoom, handleLeaveRoom,
    sendPosition, sendRotation, sendAnimation,
  };
}