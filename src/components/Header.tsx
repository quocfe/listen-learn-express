import { Button } from "@/components/ui/button";
import { BookOpen, Headphones } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-gradient-hero border-b border-border/50 shadow-elegant">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
              <Headphones className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                English Dictation
              </h1>
              <p className="text-muted-foreground">
                Luyện tập nghe chép chính tả tiếng Anh
              </p>
            </div>
          </div>
          
          <Button variant="outline" className="hidden sm:flex">
            <BookOpen className="w-4 h-4 mr-2" />
            Hướng dẫn
          </Button>
        </div>
      </div>
    </header>
  );
};