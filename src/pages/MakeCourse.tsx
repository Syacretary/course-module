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
import { AlertCircle, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { CursorGlow } from "@/components/CursorGlow";

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
    
    try {
      await login(email);
      setEmailSent(true);
    } catch (error) {
      // Error handled in login
    } finally {
      setIsEmailSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <CursorGlow />
      
      {state.step !== "complete" && <Header />}

      {/* Error Display */}
      {error && (
        <div className="container py-4 pt-24 relative z-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Content */}
      <main className={state.step === "complete" ? "" : "container py-8 pt-24 relative z-10"}>
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
