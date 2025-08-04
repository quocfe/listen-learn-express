import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

interface Segment {
  id: number;
  startTime: number;
  endTime: number;
  text?: string;
  score?: number;
}

interface SegmentControllerProps {
  videoDuration: number;
  currentTime: number;
  onSegmentChange: (segment: Segment) => void;
  onPlaySegment: (startTime: number, endTime: number) => void;
  onSegmentDurationChange: (duration: number) => void;
}

export const SegmentController = ({
  videoDuration,
  currentTime,
  onSegmentChange,
  onPlaySegment,
  onSegmentDurationChange,
}: SegmentControllerProps) => {
  const [segmentDuration, setSegmentDuration] = useState(15); // Default 15s
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

  // Generate segments when duration changes
  useEffect(() => {
    if (videoDuration > 0) {
      const newSegments: Segment[] = [];
      let segmentId = 0;
      
      for (let start = 0; start < videoDuration; start += segmentDuration) {
        const end = Math.min(start + segmentDuration, videoDuration);
        newSegments.push({
          id: segmentId++,
          startTime: start,
          endTime: end,
        });
      }
      
      setSegments(newSegments);
      setCurrentSegmentIndex(0);
      if (newSegments.length > 0) {
        onSegmentChange(newSegments[0]);
      }
    }
  }, [videoDuration, segmentDuration, onSegmentChange]);

  // Update current segment based on video time
  useEffect(() => {
    const activeSegment = segments.find(
      segment => currentTime >= segment.startTime && currentTime < segment.endTime
    );
    if (activeSegment) {
      const index = segments.indexOf(activeSegment);
      if (index !== currentSegmentIndex) {
        setCurrentSegmentIndex(index);
        onSegmentChange(activeSegment);
      }
    }
  }, [currentTime, segments, currentSegmentIndex, onSegmentChange]);

  const handleSegmentDurationChange = (value: string) => {
    const duration = parseInt(value);
    setSegmentDuration(duration);
    onSegmentDurationChange(duration);
  };

  const playCurrentSegment = () => {
    const segment = segments[currentSegmentIndex];
    if (segment) {
      onPlaySegment(segment.startTime, segment.endTime);
    }
  };

  const goToPreviousSegment = () => {
    if (currentSegmentIndex > 0) {
      const newIndex = currentSegmentIndex - 1;
      setCurrentSegmentIndex(newIndex);
      const segment = segments[newIndex];
      onSegmentChange(segment);
      onPlaySegment(segment.startTime, segment.endTime);
    }
  };

  const goToNextSegment = () => {
    if (currentSegmentIndex < segments.length - 1) {
      const newIndex = currentSegmentIndex + 1;
      setCurrentSegmentIndex(newIndex);
      const segment = segments[newIndex];
      onSegmentChange(segment);
      onPlaySegment(segment.startTime, segment.endTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentSegment = segments[currentSegmentIndex];

  return (
    <Card className="p-4 bg-gradient-card border-border/50 shadow-elegant">
      <div className="space-y-4">
        {/* Segment Duration Selector */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Luyện tập theo đoạn</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Thời lượng:</span>
            <Select value={segmentDuration.toString()} onValueChange={handleSegmentDurationChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10s</SelectItem>
                <SelectItem value="15">15s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current Segment Info */}
        {currentSegment && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <Badge variant="secondary" className="mb-1">
                Đoạn {currentSegmentIndex + 1}/{segments.length}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {formatTime(currentSegment.startTime)} - {formatTime(currentSegment.endTime)}
              </p>
            </div>
            {currentSegment.score !== undefined && (
              <Badge 
                variant={currentSegment.score >= 80 ? "default" : currentSegment.score >= 60 ? "secondary" : "destructive"}
              >
                {currentSegment.score}/100
              </Badge>
            )}
          </div>
        )}

        {/* Segment Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={goToPreviousSegment}
            disabled={currentSegmentIndex === 0}
            variant="outline"
            size="sm"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            onClick={playCurrentSegment}
            variant="hero"
            size="sm"
            className="px-6"
          >
            <Play className="w-4 h-4 mr-2" />
            Phát đoạn
          </Button>

          <Button
            onClick={goToNextSegment}
            disabled={currentSegmentIndex === segments.length - 1}
            variant="outline"
            size="sm"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Segment List */}
        <div className="max-h-32 overflow-y-auto space-y-1">
          {segments.map((segment, index) => (
            <button
              key={segment.id}
              onClick={() => {
                setCurrentSegmentIndex(index);
                onSegmentChange(segment);
                onPlaySegment(segment.startTime, segment.endTime);
              }}
              className={`w-full text-left p-2 rounded text-sm transition-colors ${
                index === currentSegmentIndex
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-foreground">
                  Đoạn {index + 1}: {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                </span>
                {segment.score !== undefined && (
              <Badge 
                variant={segment.score >= 80 ? "default" : segment.score >= 60 ? "secondary" : "destructive"}
                className="text-xs"
              >
                    {segment.score}
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};