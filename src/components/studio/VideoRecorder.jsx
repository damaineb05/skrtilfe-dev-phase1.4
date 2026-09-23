import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Square, Save, X, Camera } from 'lucide-react';

export default function VideoRecorder({ onClose, onSave }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [fileName, setFileName] = useState('Video Recording');
  
  // Video Settings
  const [resolution, setResolution] = useState('720p');
  const [chromaKey, setChromaKey] = useState(false);
  const [brightness, setBrightness] = useState(1);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          width: resolution === '1080p' ? 1920 : resolution === '720p' ? 1280 : 640,
          height: resolution === '1080p' ? 1080 : resolution === '720p' ? 720 : 480,
        },
        audio: true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      alert('Camera access denied or not available');
    }
  };
  
  const startRecording = () => {
    if (!streamRef.current) return;
    
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
    };
    
    mediaRecorder.start();
    setIsRecording(true);
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };
  
  const handleSave = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      onSave({
        name: fileName + '.webm',
        type: 'video',
        url,
        duration: 0,
        size: recordedBlob.size,
        thumbnail: null
      });
      onClose();
    }
  };
  
  React.useEffect(() => {
    startCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-[#0A0A0F] border-[#00D4FF]/30">
        <DialogHeader>
          <DialogTitle className="font-mono text-[#00D4FF]">
            // VIDEO_RECORDER
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Video Preview */}
          <div className="aspect-video bg-[#0D0D14] rounded-xl border border-[#00D4FF]/20 overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{
                filter: `brightness(${brightness})`
              }}
            />
            
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#FF3366]/20 backdrop-blur-sm px-3 py-2 rounded-full border border-[#FF3366]">
                <div className="w-3 h-3 bg-[#FF3366] rounded-full animate-pulse" />
                <span className="text-xs text-white font-mono">RECORDING</span>
              </div>
            )}
          </div>
          
          {/* Video Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-white/60 font-mono mb-2 block">Resolution</Label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                disabled={isRecording}
                className="w-full bg-[#0D0D14] border border-[#00D4FF]/30 text-white rounded-lg px-3 py-2 text-sm"
              >
                <option value="480p">480p</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            </div>
            
            <div>
              <Label className="text-xs text-white/60 font-mono mb-2 flex items-center justify-between">
                Brightness
                <span className="text-[#00D4FF]">{Math.round(brightness * 100)}%</span>
              </Label>
              <Slider
                value={[brightness]}
                onValueChange={([v]) => setBrightness(v)}
                min={0.5}
                max={1.5}
                step={0.1}
              />
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
                    <Camera className="w-4 h-4 mr-2" />
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
                    startCamera();
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