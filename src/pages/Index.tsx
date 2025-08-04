import { useState } from "react";
import { Header } from "@/components/Header";
import { VideoUpload } from "@/components/VideoUpload";
import { VideoPlayer } from "@/components/VideoPlayer";
import { DictationArea } from "@/components/DictationArea";
import { TranscriptExtractor } from "@/components/TranscriptExtractor";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Target, TrendingUp } from "lucide-react";

const Index = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [extractedTranscript, setExtractedTranscript] = useState<string>("");
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    totalTime: 0,
  });

  const handleVideoSelect = (file: File, url: string) => {
    setVideoFile(file);
    setVideoUrl(url);
    setCurrentStep(2);
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoUrl(null);
    setCurrentStep(1);
  };

  const handleDictationComplete = (score: number, userText: string) => {
    setSessionStats(prev => ({
      totalSessions: prev.totalSessions + 1,
      averageScore: Math.round((prev.averageScore * prev.totalSessions + score) / (prev.totalSessions + 1)),
      totalTime: prev.totalTime + 1, // Simplified time tracking
    }));
    setCurrentStep(3);
  };

  const startNewSession = () => {
    setCurrentStep(2);
  };

  const handleTranscriptExtracted = (transcript: string) => {
    setExtractedTranscript(transcript);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Tiến trình học tập
            </h2>
            <Badge variant="secondary">
              Bước {currentStep}/3
            </Badge>
          </div>
          <Progress value={currentStep * 33.33} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Tải video</span>
            <span>Luyện tập</span>
            <span>Hoàn thành</span>
          </div>
        </div>

        {/* Stats Cards */}
        {sessionStats.totalSessions > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-4 bg-gradient-card border-border/50 shadow-elegant">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Số buổi luyện tập</p>
                  <p className="text-2xl font-bold text-foreground">{sessionStats.totalSessions}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-card border-border/50 shadow-elegant">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Điểm trung bình</p>
                  <p className="text-2xl font-bold text-foreground">{sessionStats.averageScore}/100</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-card border-border/50 shadow-elegant">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Thời gian học</p>
                  <p className="text-2xl font-bold text-foreground">{sessionStats.totalTime}h</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Video Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                1. Tải lên video
              </h2>
              <VideoUpload
                onVideoSelect={handleVideoSelect}
                currentVideo={videoUrl}
                onRemoveVideo={handleRemoveVideo}
              />
            </div>

            {videoUrl && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">
                    2. Phát video
                  </h2>
                  <VideoPlayer videoUrl={videoUrl} />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">
                    3. Trích xuất Transcript
                  </h2>
                  <TranscriptExtractor 
                    videoFile={videoFile} 
                    onTranscriptExtracted={handleTranscriptExtracted}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Dictation Section */}
          <div className="space-y-6">
            {videoUrl && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  4. Luyện tập chính tả
                </h2>
                <DictationArea 
                  targetText={extractedTranscript} 
                  onComplete={handleDictationComplete} 
                />
              </div>
            )}

            {!videoUrl && (
              <Card className="p-8 text-center bg-muted/30 border-dashed border-2 border-border">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Target className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Sẵn sàng bắt đầu?
                  </h3>
                  <p className="text-muted-foreground">
                    Tải lên video để bắt đầu luyện tập nghe chép chính tả tiếng Anh
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-12 p-6 bg-gradient-card border-border/50 shadow-elegant">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Hướng dẫn sử dụng
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <Badge variant="outline" className="mb-2">Bước 1</Badge>
              <p className="text-muted-foreground">
                Tải lên video tiếng Anh có nội dung bạn muốn luyện tập chính tả
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="mb-2">Bước 2</Badge>
              <p className="text-muted-foreground">
                Nghe video và ghi lại những gì bạn nghe được vào ô văn bản
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="mb-2">Bước 3</Badge>
              <p className="text-muted-foreground">
                Kiểm tra kết quả và xem điểm số để cải thiện kỹ năng nghe
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Index;
