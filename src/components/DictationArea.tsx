import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, RotateCcw, Trophy, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DictationAreaProps {
  targetText?: string;
  onComplete?: (score: number, userText: string) => void;
  segmentText?: string;
  isSegmentMode?: boolean;
}

export const DictationArea = ({ 
  targetText = "", 
  onComplete, 
  segmentText = "",
  isSegmentMode = false 
}: DictationAreaProps) => {
  const [userText, setUserText] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState<Array<{word: string, suggestion: string}>>([]);
  const { toast } = useToast();

  const sampleText = targetText || "Hello everyone! Welcome to our English dictation practice. Today we will learn about various topics including technology, education, and daily life conversations.";

  const calculateScore = (original: string, userInput: string) => {
    const originalWords = original.toLowerCase().split(/\s+/);
    const userWords = userInput.toLowerCase().split(/\s+/);
    
    let correctWords = 0;
    const newMistakes: Array<{word: string, suggestion: string}> = [];
    
    for (let i = 0; i < Math.max(originalWords.length, userWords.length); i++) {
      if (originalWords[i] === userWords[i]) {
        correctWords++;
      } else if (userWords[i] && originalWords[i]) {
        newMistakes.push({
          word: userWords[i],
          suggestion: originalWords[i]
        });
      }
    }
    
    const accuracy = (correctWords / originalWords.length) * 100;
    setMistakes(newMistakes);
    return Math.round(accuracy);
  };

  const checkDictation = () => {
    if (!userText.trim()) {
      toast({
        title: "Chưa có văn bản",
        description: "Vui lòng nhập văn bản để kiểm tra",
        variant: "destructive",
      });
      return;
    }

    const textToCheck = isSegmentMode ? segmentText : sampleText;
    const calculatedScore = calculateScore(textToCheck, userText);
    setScore(calculatedScore);
    setIsChecked(true);
    onComplete?.(calculatedScore, userText);

    toast({
      title: "Đã chấm điểm!",
      description: `Điểm số của bạn: ${calculatedScore}/100`,
      variant: calculatedScore >= 80 ? "default" : "destructive",
    });
  };

  const reset = () => {
    setUserText("");
    setIsChecked(false);
    setScore(null);
    setMistakes([]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  const getScoreVariant = (score: number) => {
    if (score >= 90) return "success";
    if (score >= 70) return "warning";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Original Text Display */}
      <Card className="p-6 bg-muted/30 border-border/50">
        <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          {isSegmentMode ? "Văn bản đoạn hiện tại:" : "Văn bản gốc (để tham khảo)"}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {isSegmentMode 
            ? (segmentText || "Chưa có văn bản cho đoạn này. Vui lòng trích xuất transcript trước.")
            : sampleText
          }
        </p>
      </Card>

      {/* User Input Area */}
      <Card className="p-6 bg-gradient-card border-border/50 shadow-elegant">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Nhập văn bản bạn nghe được:
        </h3>
        
        <Textarea
          placeholder="Nhập văn bản bạn nghe được từ video..."
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          className="min-h-32 mb-4 resize-none"
          disabled={isChecked}
        />

        <div className="flex gap-3">
          <Button
            onClick={checkDictation}
            variant="hero"
            disabled={isChecked}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Kiểm tra
          </Button>
          
          <Button
            onClick={reset}
            variant="outline"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Làm lại
          </Button>
        </div>
      </Card>

      {/* Results */}
      {isChecked && score !== null && (
        <Card className="p-6 bg-gradient-card border-border/50 shadow-elegant animate-slide-up">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Trophy className={`w-8 h-8 ${getScoreColor(score)}`} />
              <h3 className="text-2xl font-bold text-foreground">
                Kết quả
              </h3>
            </div>
            
            <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {score}/100
            </div>
            
            <Button 
              variant={getScoreVariant(score)}
              className="px-8"
            >
              {score >= 90 ? "Xuất sắc! 🎉" : score >= 70 ? "Tốt! 👍" : "Cần cải thiện 💪"}
            </Button>

            {mistakes.length > 0 && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2 text-foreground">Một số lỗi cần chú ý:</h4>
                <div className="space-y-1">
                  {mistakes.slice(0, 5).map((mistake, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-destructive">"{mistake.word}"</span>
                      <span className="text-muted-foreground"> → </span>
                      <span className="text-success">"{mistake.suggestion}"</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};