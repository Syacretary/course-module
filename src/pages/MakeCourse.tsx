import { useState } from "react";
import { useCourseGenerator } from "@/hooks/use-course-generator";
import { useAuth } from "@/contexts/AuthContext";
import { TopicSelector } from "@/components/course/TopicSelector";
import { PersonalizationForm } from "@/components/course/PersonalizationForm";
import { GenerationProgress } from "@/components/course/GenerationProgress";
import { CourseViewer } from "@/components/course/CourseViewer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, BookOpen, Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function MakeCourse() {
  const { user, login } = useAuth();
  const {
    state,
    isLoading,
    error,
    toggleTopic,
    setCustomTopic,
    proceedToPersonalization,
    setAnswer,
    startCourseGeneration,
    reset,
    canProceedToPersonalization,
    canStartGeneration,
  } = useCourseGenerator();

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Check for API key
  const hasApiKey = !!import.meta.env.VITE_GROQ_API_KEY;

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>VITE_GROQ_API_KEY</strong> belum dikonfigurasi. 
            Silakan tambahkan API key Groq di environment variable untuk menggunakan fitur ini.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleNextStep = () => {
    if (!user) {
      setShowLoginDialog(true);
    } else {
      proceedToPersonalization();
    }
  };

  const handleMagicLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsEmailSending(true);
    
    // Simulate API Call for Magic Link
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsEmailSending(false);
    setEmailSent(true);
    toast.success("Magic Link terkirim ke email Anda!");

    // Simulate User clicking the link after 2 seconds
    setTimeout(() => {
      login(email); // Use email as username/id
      setShowLoginDialog(false);
      proceedToPersonalization();
      toast.success("Berhasil login otomatis!");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {state.step !== "complete" && (
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <span className="font-display font-bold text-xl hidden sm:inline-block">Course Module</span>
            </a>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              {["topics", "personalization", "generating"].map((step, i) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    state.step === step
                      ? "bg-primary w-6"
                      : i < ["topics", "personalization", "generating"].indexOf(state.step)
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </header>
      )}

      {/* Error Display */}
      {error && (
        <div className="container py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Content */}
      <main className={state.step === "complete" ? "" : "container py-8"}>
        {state.step === "topics" && (
          <TopicSelector
            selectedTopics={state.selectedTopics}
            customTopic={state.customTopic}
            onToggleTopic={toggleTopic}
            onCustomTopicChange={setCustomTopic}
            onNext={handleNextStep}
            canProceed={canProceedToPersonalization}
            isLoading={isLoading}
          />
        )}

        {state.step === "personalization" && (
          <PersonalizationForm
            questions={state.questions}
            answers={state.answers}
            onSetAnswer={setAnswer}
            onBack={reset}
            onGenerate={startCourseGeneration}
            canGenerate={canStartGeneration}
            isLoading={isLoading}
          />
        )}

        {state.step === "generating" && (
          <GenerationProgress
            phase={state.generationProgress.phase}
            current={state.generationProgress.current}
            total={state.generationProgress.total}
          />
        )}

        {state.step === "complete" && state.course && (
          <CourseViewer course={state.course} onNewCourse={reset} />
        )}
      </main>

      {/* Magic Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-display">Simpan Progress Anda</DialogTitle>
            <DialogDescription className="text-center">
              Untuk melanjutkan pembuatan module personal ini, kami perlu menyimpan data Anda. Masukkan email untuk akses instan.
            </DialogDescription>
          </DialogHeader>
          
          {!emailSent ? (
            <form onSubmit={handleMagicLogin} className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-lg"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg gradient-primary" disabled={isEmailSending}>
                {isEmailSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim Link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Kirim Magic Link
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Tanpa password. Tanpa ribet. Link akses akan dikirim ke inbox Anda.
              </p>
            </form>
          ) : (
            <div className="py-8 flex flex-col items-center animate-in fade-in zoom-in">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cek Inbox Anda!</h3>
              <p className="text-center text-muted-foreground mb-6">
                Kami telah mengirimkan link akses ke <strong>{email}</strong>.
                Klik link tersebut untuk melanjutkan.
              </p>
              <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                Menunggu konfirmasi...
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}