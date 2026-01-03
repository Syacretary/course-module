import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface GenerationProgressProps {
  phase: string;
  current: number;
  total: number;
}

export function GenerationProgress({ phase, current, total }: GenerationProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
      {/* Animated Loader */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full gradient-primary opacity-20 animate-ping" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </div>

      {/* Progress Info */}
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-display font-bold">
          Membuat Course Untukmu
        </h2>
        <p className="text-muted-foreground">
          {phase || "Memulai proses generasi..."}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md space-y-2">
        <Progress value={percentage} className="h-3" />
        <p className="text-sm text-muted-foreground text-center">
          {current} dari {total} bab selesai
        </p>
      </div>

      {/* Fun facts while waiting */}
      <div className="mt-8 p-4 bg-secondary/50 rounded-xl max-w-lg text-center">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tahukah kamu?</strong> AI kami menggunakan referensi dari roadmap.sh 
          untuk memastikan urutan pembelajaran yang optimal.
        </p>
      </div>
    </div>
  );
}
