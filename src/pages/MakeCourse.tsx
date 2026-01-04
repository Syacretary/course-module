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
import { AlertCircle, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { CursorGlow } from "@/components/CursorGlow";
import { auth } from "@/lib/firebase";

export default function MakeCourse() {
  const { user, loginWithGoogle } = useAuth();
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

  const handleNextStep = () => {
    if (!user) {
      setShowLoginDialog(true);
    } else {
      proceedToPersonalization();
    }
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    // After successful login, close dialog and continue
    if (auth.currentUser) {
      setShowLoginDialog(false);
      proceedToPersonalization();
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

      {/* Magic Login Dialog (Simplified to Google Only) */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-display">Simpan Progress Anda</DialogTitle>
            <DialogDescription className="text-center">
              Untuk melanjutkan pembuatan module personal ini, kami perlu menyimpan data Anda. Masukkan akun Google untuk akses instan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <Button 
              variant="outline" 
              className="w-full h-14 text-lg font-bold flex items-center justify-center gap-3 border-primary/20 hover:bg-primary/5 transition-all shadow-lg"
              onClick={handleGoogleLogin}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.78 1.85-1.63 2.42v2.81h2.63c1.54-1.41 2.43-3.5 2.43-5.24z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.48-.98 7.31-2.64l-2.63-2.81c-.73.49-1.66.78-2.68.78-2.06 0-3.81-1.39-4.43-3.25H3.17v2.13C5.01 21.09 8.27 23 12 23z" fill="#34A853"/>
                <path d="M7.57 15.08c-.16-.49-.25-1.01-.25-1.58s.09-1.09.25-1.58V9.79H3.17C2.42 11.11 2 12.51 2 14s.42 2.89 1.17 4.21l4.4-2.13z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 8.27 1 5.01 2.91 3.17 5.82l4.4 2.13c.62-1.86 2.37-3.25 4.43-3.25z" fill="#EA4335"/>
              </svg>
              Masuk dengan Google
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}