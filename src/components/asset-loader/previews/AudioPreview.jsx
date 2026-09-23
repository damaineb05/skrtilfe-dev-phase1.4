import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  SkipBack,
  SkipForward,
  Repeat,
  Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function AudioPreview({ 
  asset,
  autoPlay = false,
  loop = false,
  showVisualizer = true,
  className = ''
}) {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyzerRef = useRef(null);
  const audioContextRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooped, setIsLooped] = useState(loop);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize audio visualizer
  useEffect(() => {
    if (!showVisualizer || !audioRef.current) return;

    const initVisualizer = () => {
      if (audioContextRef.current) return;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaElementSource(audioRef.current);
      source.connect(analyzerRef.current);
      analyzerRef.current.connect(audioContextRef.current.destination);
    };

    audioRef.current.addEventListener('play', initVisualizer, { once: true });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showVisualizer]);

  // Draw visualizer
  useEffect(() => {
    if (!showVisualizer || !canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyzer = analyzerRef.current;

    if (!analyzer) return;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyzer.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        // Gradient color based on frequency
        const hue = (i / bufferLength) * 180 + 180; // Cyan to purple
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;

        const y = canvas.height - barHeight;
        ctx.fillRect(x, y, barWidth - 2, barHeight);

        x += barWidth;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, showVisualizer]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (!isLooped) setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isLooped]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  }, [isPlaying]);

  const handleSeek = useCallback((value) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
  }, []);

  const handleVolumeChange = useCallback((value) => {
    const audio = audioRef.current;
    if (!audio) return;
    const vol = value[0];
    audio.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleLoop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = !isLooped;
    setIsLooped(!isLooped);
  }, [isLooped]);

  const skip = useCallback((seconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  }, [duration]);

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!asset?.src) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 rounded-xl ${className}`}>
        <p className="text-gray-500">No audio to display</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl ${className}`}>
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={asset.src}
        autoPlay={autoPlay}
        loop={isLooped}
        preload="metadata"
      />

      <div className="p-6 flex flex-col items-center justify-center h-full">
        {/* Album Art / Visualizer */}
        <div className="relative w-48 h-48 mb-6">
          {/* Background gradient */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
            <Music className="w-16 h-16 text-white/30" />
          </div>

          {/* Visualizer canvas */}
          {showVisualizer && (
            <canvas
              ref={canvasRef}
              width={192}
              height={192}
              className="absolute inset-0 rounded-2xl"
            />
          )}

          {/* Spinning effect when playing */}
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-white/10"
          />
        </div>

        {/* Track Info */}
        <div className="text-center mb-4">
          <h3 className="text-white font-bold text-lg truncate max-w-[200px]">
            {asset.name || 'Unknown Track'}
          </h3>
          <p className="text-gray-400 text-sm">Audio Track</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between mt-1">
            <span className="text-gray-400 text-xs font-mono">{formatTime(currentTime)}</span>
            <span className="text-gray-400 text-xs font-mono">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={toggleLoop}
            className={`w-8 h-8 p-0 ${isLooped ? 'text-cyan-400' : 'text-gray-400'} hover:bg-white/10`}
          >
            <Repeat className="w-4 h-4" />
          </Button>

          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => skip(-10)}
            className="w-10 h-10 p-0 text-white hover:bg-white/10"
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button 
            size="sm" 
            variant="ghost" 
            onClick={togglePlay}
            className="w-14 h-14 p-0 rounded-full bg-cyan-500 hover:bg-cyan-600 text-black"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </Button>

          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => skip(10)}
            className="w-10 h-10 p-0 text-white hover:bg-white/10"
          >
            <SkipForward className="w-5 h-5" />
          </Button>

          <Button 
            size="sm" 
            variant="ghost" 
            onClick={toggleMute}
            className="w-8 h-8 p-0 text-gray-400 hover:bg-white/10"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Volume Slider */}
        <div className="w-32 mt-4">
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
          />
        </div>
      </div>
    </div>
  );
}