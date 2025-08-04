import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Video, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  onVideoSelect: (file: File, url: string) => void;
  currentVideo: string | null;
  onRemoveVideo: () => void;
}

export const VideoUpload = ({ onVideoSelect, currentVideo, onRemoveVideo }: VideoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file video hợp lệ",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(file);
    onVideoSelect(file, url);

    toast({
      title: "Thành công",
      description: "Video đã được tải lên thành công!",
      variant: "default",
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <Card className="p-6 bg-gradient-card border-border/50 shadow-elegant">
      {!currentVideo ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isDragging 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            Tải lên video của bạn
          </h3>
          <p className="text-muted-foreground mb-4">
            Kéo thả video vào đây hoặc click để chọn file
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Chọn Video
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
          <div className="flex items-center gap-3">
            <Video className="w-8 h-8 text-success" />
            <div>
              <p className="font-medium text-foreground">Video đã được tải lên</p>
              <p className="text-sm text-muted-foreground">Sẵn sàng để bắt đầu luyện tập</p>
            </div>
          </div>
          <Button
            onClick={onRemoveVideo}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
};
