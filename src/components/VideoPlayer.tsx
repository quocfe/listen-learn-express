import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlaySegment?: (startTime: number, endTime: number) => void;
}

export const VideoPlayer = ({ videoUrl, onTimeUpdate, onPlaySegment }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [segmentStartTime, setSegmentStartTime] = useState<number | null>(null);
  const [segmentEndTime, setSegmentEndTime] = useState<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime, video.duration);
      
      // Auto-pause at segment end
      if (segmentEndTime && video.currentTime >= segmentEndTime) {
        video.pause();
        setIsPlaying(false);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onTimeUpdate]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = 0;
    setCurrentTime(0);
  };

  const playSegment = (startTime: number, endTime: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    setSegmentStartTime(startTime);
    setSegmentEndTime(endTime);
    video.currentTime = startTime;
    video.play();
    setIsPlaying(true);
  };

  // Expose playSegment to parent
  useEffect(() => {
    if (onPlaySegment) {
      // This is a bit of a hack to expose the function to parent
      // In a real app, you might use useImperativeHandle with forwardRef
      (window as any).playVideoSegment = playSegment;
    }
  }, [onPlaySegment]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 bg-gradient-card border-border/50 shadow-elegant">
      <div className="space-y-4">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full rounded-lg shadow-elegant"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={restart}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={togglePlay}
              variant="hero"
              size="lg"
              className="px-8"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value);
                  setVolume(newVolume);
                  if (videoRef.current) {
                    videoRef.current.volume = newVolume;
                  }
                }}
                className="w-20"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};