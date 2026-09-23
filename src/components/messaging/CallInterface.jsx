import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff,
  Volume2,
  VolumeX,
  MoreVertical,
  MessageSquare,
  Users,
  Share
} from 'lucide-react';

export default function CallInterface({ type = 'voice', onBack, currentUser }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(type === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [participants, setParticipants] = useState([
    {
      id: 1,
      name: 'Alex Skrt',
      avatar: null,
      status: 'connecting',
      isMuted: false,
      isVideoEnabled: true
    }
  ]);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    // Simulate connection process
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      setConnectionStatus('connected');
      setParticipants(prev => prev.map(p => ({ ...p, status: 'connected' })));
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    let interval;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    // Clean up media streams
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    onBack();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Handle actual muting logic
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // Handle actual video toggle logic
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // Handle actual speaker toggle logic
  };

  return (
    <motion.div 
      className="flex flex-col h-full theme-bg-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b theme-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="w-8 h-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h3 className="font-semibold theme-text text-sm">
              {type === 'video' ? 'Video Call' : 'Voice Call'}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'success' : 'secondary'} className="text-xs">
                {connectionStatus}
              </Badge>
              {isConnected && (
                <span className="theme-text-secondary text-xs">
                  {formatDuration(callDuration)}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Video Area */}
      <div className="flex-grow relative overflow-hidden">
        {type === 'video' ? (
          <div className="h-full bg-gray-900 relative">
            {/* Remote video */}
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            
            {/* Local video (picture-in-picture) */}
            <div className="absolute top-4 right-4 w-24 h-32 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {currentUser?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Participant info overlay */}
            {!isConnected && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-semibold">
                      {participants[0]?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-lg">{participants[0]?.name}</h3>
                  <p className="text-white/70 text-sm">{connectionStatus}...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Voice call interface */
          <div className="h-full flex items-center justify-center theme-bg-secondary">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white text-4xl font-bold">
                  {participants[0]?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <h3 className="theme-text font-bold text-xl mb-2">{participants[0]?.name}</h3>
              <p className="theme-text-secondary text-sm mb-4">
                {isConnected ? `Connected • ${formatDuration(callDuration)}` : 'Connecting...'}
              </p>
              
              {/* Audio visualization */}
              {isConnected && !isMuted && (
                <div className="flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-blue-500 rounded-full"
                      animate={{
                        height: [4, Math.random() * 20 + 10, 4],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t theme-border">
        <div className="flex items-center justify-center gap-4">
          {/* Mute button */}
          <Button
            variant={isMuted ? 'destructive' : 'secondary'}
            size="icon"
            onClick={toggleMute}
            className="w-12 h-12 rounded-full"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          {/* Video toggle (only for video calls) */}
          {type === 'video' && (
            <Button
              variant={!isVideoEnabled ? 'destructive' : 'secondary'}
              size="icon"
              onClick={toggleVideo}
              className="w-12 h-12 rounded-full"
            >
              {isVideoEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            </Button>
          )}

          {/* Speaker toggle */}
          <Button
            variant={isSpeakerOn ? 'default' : 'secondary'}
            size="icon"
            onClick={toggleSpeaker}
            className="w-12 h-12 rounded-full"
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>

          {/* Chat button */}
          <Button
            variant="secondary"
            size="icon"
            className="w-12 h-12 rounded-full"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>

          {/* End call button */}
          <Button
            variant="destructive"
            size="icon"
            onClick={handleEndCall}
            className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>

        {/* Additional controls */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <Button variant="ghost" size="sm" className="text-xs">
            <Users className="w-4 h-4 mr-1" />
            Add people
          </Button>
          <Button variant="ghost" size="sm" className="text-xs">
            <Share className="w-4 h-4 mr-1" />
            Share screen
          </Button>
        </div>
      </div>
    </motion.div>
  );
}