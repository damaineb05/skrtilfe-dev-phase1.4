import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Mic, Square, Save, X } from 'lucide-react';

export default function AudioRecorder({ onClose, onSave }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [fileName, setFileName] = useState('Recording');
  
  // Audio Settings
  const [gain, setGain] = useState(0.8);
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [studioMode, setStudioMode] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: noiseReduction,
          sampleRate: studioMode ? 48000 : 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Microphone access denied or not available');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
    }
  };
  
  const handleSave = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      onSave({
        name: fileName + '.webm',
        type: 'audio',
        url,
        duration: recordingTime,
        size: recordedBlob.size
      });
      onClose();
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0A0A0F] border-[#FF3366]/30">
        <DialogHeader>
          <DialogTitle className="font-mono text-[#FF3366]">
            // AUDIO_RECORDER
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Waveform Display */}
          <div className="h-32 bg-[#0D0D14] rounded-xl border border-[#FF3366]/20 flex items-center justify-center">
            {isRecording ? (
              <div className="flex items-end justify-center gap-1 h-20">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-gradient-to-t from-[#FF3366] to-[#00D4FF] rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                ))}
              </div>
            ) : (
              <Mic className="w-12 h-12 text-white/20" />
            )}
          </div>
          
          {/* Recording Time */}
          <div className="text-center">
            <div className="text-4xl font-mono text-[#00D4FF]">
              {formatTime(recordingTime)}
            </div>
          </div>
          
          {/* Audio Settings */}
          <div className="space-y-4 p-4 bg-[#0D0D14] rounded-xl border border-[#00D4FF]/20">
            <div>
              <Label className="text-xs text-white/60 font-mono flex items-center justify-between mb-2">
                Gain
                <span className="text-[#00D4FF]">{Math.round(gain * 100)}%</span>
              </Label>
              <Slider
                value={[gain]}
                onValueChange={([v]) => setGain(v)}
                max={2}
                step={0.1}
                disabled={isRecording}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-white/60 font-mono">Noise Reduction</Label>
                <Switch
                  checked={noiseReduction}
                  onCheckedChange={setNoiseReduction}
                  disabled={isRecording}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs text-white/60 font-mono">Studio Quality</Label>
                <Switch
                  checked={studioMode}
                  onCheckedChange={setStudioMode}
                  disabled={isRecording}
                />
              </div>
            </div>
          </div>
          
          {/* File Name */}
          {recordedBlob && (
            <div>
              <Label className="text-xs text-white/60 font-mono mb-2 block">File Name</Label>
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="bg-[#0D0D14] border-[#00D4FF]/30"
              />
            </div>
          )}
          
          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {!recordedBlob ? (
              <>
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="cyber-btn text-black font-bold w-32"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Record
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="bg-[#FF3366] hover:bg-[#FF3366]/80 text-white w-32"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setRecordedBlob(null);
                    setRecordingTime(0);
                  }}
                  variant="outline"
                  className="border-white/20"
                >
                  <X className="w-4 h-4 mr-2" />
                  Discard
                </Button>
                <Button
                  onClick={handleSave}
                  className="cyber-btn text-black font-bold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save to Library
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}