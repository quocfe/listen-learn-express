import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Download, Loader2 } from "lucide-react";
import { pipeline } from "@huggingface/transformers";

interface TranscriptExtractorProps {
  videoFile: File | null;
  onTranscriptExtracted?: (transcript: string) => void;
}

export const TranscriptExtractor = ({ videoFile, onTranscriptExtracted }: TranscriptExtractorProps) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState<string>("");
  const { toast } = useToast();

  const extractAudioFromVideo = async (videoFile: File): Promise<AudioBuffer> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.src = URL.createObjectURL(videoFile);
      video.addEventListener('loadedmetadata', async () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioContext.createMediaElementSource(video);
          const destination = audioContext.createMediaStreamDestination();
          source.connect(destination);

          const mediaRecorder = new MediaRecorder(destination.stream);
          const chunks: Blob[] = [];

          mediaRecorder.ondataavailable = (event) => {
            chunks.push(event.data);
          };

          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(chunks, { type: 'audio/wav' });
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            resolve(audioBuffer);
          };

          video.play();
          mediaRecorder.start();

          setTimeout(() => {
            mediaRecorder.stop();
            video.pause();
          }, video.duration * 1000);

        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const extractTranscript = async () => {
    if (!videoFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn video trước",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    setProgress(10);

    try {
      toast({
        title: "Đang tải mô hình AI...",
        description: "Lần đầu có thể mất vài phút để tải mô hình Whisper",
      });

      setProgress(30);

      // Khởi tạo pipeline Whisper
      const transcriber = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-tiny.en",
        { device: "webgpu" }
      );

      setProgress(60);

      // Trích xuất audio từ video
      const videoUrl = URL.createObjectURL(videoFile);

      setProgress(80);

      // Thực hiện transcript
      const result = await transcriber(videoUrl);
      const extractedText = Array.isArray(result) ? result[0]?.text || "" : result.text || "";

      setProgress(100);
      setTranscript(extractedText);
      onTranscriptExtracted?.(extractedText);

      toast({
        title: "Thành công!",
        description: "Đã trích xuất transcript từ video",
      });

    } catch (error) {
      console.error("Lỗi khi trích xuất transcript:", error);
      toast({
        title: "Lỗi",
        description: "Không thể trích xuất transcript. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
      setProgress(0);
    }
  };

  const downloadTranscript = () => {
    if (!transcript) return;

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6 bg-gradient-card border-border/50 shadow-elegant">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">
            Trích xuất Transcript
          </h3>
        </div>

        {!videoFile && (
          <p className="text-muted-foreground">
            Vui lòng tải lên video để trích xuất transcript
          </p>
        )}

        {videoFile && !transcript && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Video: {videoFile.name}
            </p>

            {isExtracting && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Đang xử lý... {progress}%
                </p>
              </div>
            )}

            <Button
              onClick={extractTranscript}
              disabled={isExtracting}
              className="w-full"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang trích xuất...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Trích xuất Transcript
                </>
              )}
            </Button>
          </div>
        )}

        {transcript && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                Transcript đã trích xuất:
              </p>
              <Button
                onClick={downloadTranscript}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Tải xuống
              </Button>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border max-h-64 overflow-y-auto">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {transcript}
              </p>
            </div>

            <Button
              onClick={() => {
                setTranscript("");
                setProgress(0);
              }}
              variant="outline"
              size="sm"
            >
              Trích xuất lại
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
