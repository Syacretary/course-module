import { PersonalizationQuestion, PersonalizationAnswer } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonalizationFormProps {
  questions: PersonalizationQuestion[];
  answers: PersonalizationAnswer[];
  onSetAnswer: (questionId: string, answer: string) => void;
  onBack: () => void;
  onGenerate: () => void;
  canGenerate: boolean;
  isLoading: boolean;
}

export function PersonalizationForm({
  questions,
  answers,
  onSetAnswer,
  onBack,
  onGenerate,
  canGenerate,
  isLoading,
}: PersonalizationFormProps) {
  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          Personalisasi Course-mu
        </h1>
        <p className="text-muted-foreground">
          Jawab beberapa pertanyaan agar kami bisa menyesuaikan course dengan kebutuhanmu.
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, index) => {
          const currentAnswer = answers.find((a) => a.questionId === question.id)?.answer || "";

          return (
            <div
              key={question.id}
              className="p-6 bg-card rounded-xl border border-border space-y-4"
            >
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {index + 1}
                </span>
                <h3 className="text-lg font-medium leading-relaxed">
                  {question.question}
                </h3>
              </div>

              {/* Suggested Answers */}
              <div className="flex flex-wrap gap-2 pl-12">
                {question.suggestedAnswers.map((suggestion, i) => (
                  <Button
                    key={i}
                    variant={currentAnswer === suggestion ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSetAnswer(question.id, suggestion)}
                    className={cn(
                      "text-xs h-auto py-2 px-3 whitespace-normal text-left",
                      currentAnswer === suggestion && "gradient-primary border-0"
                    )}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>

              {/* Custom Answer */}
              <div className="pl-12">
                <Textarea
                  placeholder="Atau tulis jawabanmu sendiri..."
                  value={question.suggestedAnswers.includes(currentAnswer) ? "" : currentAnswer}
                  onChange={(e) => onSetAnswer(question.id, e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <Button
          size="lg"
          onClick={onGenerate}
          disabled={!canGenerate || isLoading}
          className="gradient-primary text-primary-foreground px-8"
        >
          {isLoading ? (
            <>Memproses...</>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Course
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
