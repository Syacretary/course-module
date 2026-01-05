import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCourseGenerator } from "@/hooks/use-course-generator";
import { useAuth } from "@/contexts/AuthContext";
import { PersonalizationChat } from "@/components/course/PersonalizationChat";
import { SyllabusPreview } from "@/components/course/SyllabusPreview";
import { GenerationProgress } from "@/components/course/GenerationProgress";
import { CourseViewer } from "@/components/course/CourseViewer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Mail, Loader2, Search, Sparkles, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { CursorGlow } from "@/components/CursorGlow";

export default function MakeCourse() {
  const { user, login, loginWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    state,
    isLoading,
    error,
    setCustomTopic,
    proceedToPersonalization,
    setAnswer,
    generateSyllabus,
    updateSyllabusChapter,
    deleteSyllabusChapter,
    startCourseGeneration,
    reset,
    startNewSession
  } = useCourseGenerator();

  // FIX: Handle new topic from URL vs Draft Conflict
  useEffect(() => {
    const topicFromUrl = searchParams.get("topic");
    
    if (topicFromUrl) {
      // If we are in 'topics' step (initial), just update the custom topic
      if (state.step === 'topics') {
        if (state.customTopic !== topicFromUrl) {
           setCustomTopic(topicFromUrl);
        }
      } 
      // If we are deep in the flow (e.g. personalization) but the URL implies a new start
      // Check if the current customTopic matches the URL. If not, RESET.
      else if (state.customTopic !== topicFromUrl && state.step !== 'complete') {
        startNewSession(topicFromUrl);
      }
    }
  }, [searchParams, state.step, state.customTopic, setCustomTopic, startNewSession]);

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await login(email);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex flex-col">
      <CursorGlow />
      <Header />

      <div className="pt-24 px-4 sm:px-6 flex-1 flex flex-col pb-8">
        
        {/* Top Header Transition (Search Box at Top) */}
        {(state.step === "topics" || state.step === "personalization") && (
          <div className="w-full max-w-3xl mx-auto mb-12 animate-in slide-in-from-top-12 duration-700 ease-out z-20">
            <div className="relative flex items-center group">
              <div className="absolute left-6 text-primary/50">
                <Search className="w-5 h-5" />
              </div>
              <Input
                value={state.customTopic}
                readOnly
                className="w-full h-16 sm:h-20 pl-16 pr-6 rounded-full text-xl border-2 border-primary/20 bg-background/50 backdrop-blur-xl shadow-lg font-medium focus:ring-0"
              />
              <div className="absolute right-6 hidden sm:flex">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                  <Sparkles className="w-3 h-3" />
                  Agentic Engine
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col relative z-10">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {state.step === "topics" && (
            <div className="flex-1 flex flex-col items-center justify-center -mt-20">
               <div className="text-center space-y-4 mb-8">
                  <h2 className="text-3xl font-display font-bold">Siap memulai perjalananmu?</h2>
                  <p className="text-muted-foreground text-lg">Topik sudah siap. Mari kita personalisasi kurikulumnya.</p>
               </div>
               <Button 
                 size="lg" 
                 className="h-16 px-12 rounded-full text-lg shadow-xl hover:scale-105 transition-all bg-primary hover:bg-primary/90"
                 onClick={proceedToPersonalization}
               >
                 Lanjutkan ke Personalisasi
                 <ArrowRight className="w-5 h-5 ml-2" />
               </Button>
            </div>
          )}

          {state.step === "personalization" && (
            <div className="flex-1">
              <PersonalizationChat
                topic={state.customTopic || state.selectedTopics.join(", ")}
                questions={state.questions}
                onComplete={(finalAnswers) => {
                  finalAnswers.forEach(a => setAnswer(a.questionId, a.answer));
                  // Pindah ke fase Blueprint/Silabus
                  generateSyllabus();
                }}
                isLoadingQuestions={isLoading}
              />
            </div>
          )}

          {/* FIX: White screen issue. Only show if plan exists. Else, show loading or error */}
          {state.step === "syllabus" && (
            state.syllabusPlan ? (
              <div className="flex-1">
                <SyllabusPreview
                  chapters={state.syllabusPlan}
                  onUpdateChapter={updateSyllabusChapter}
                  onDeleteChapter={deleteSyllabusChapter}
                  onConfirm={() => {
                    if (!user) {
                      setShowLoginDialog(true);
                    } else {
                      startCourseGeneration();
                    }
                  }}
                />
              </div>
            ) : (
              // Fallback loading state if stuck in 'syllabus' but no plan yet (should be covered by isLoading, but just in case)
              <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground animate-pulse">Sedang merancang strategi belajar...</p>
              </div>
            )
          )}

          {state.step === "generation" && (
            <div className="w-full py-12">
              <div className="max-w-2xl mx-auto">
                <GenerationProgress
                  phase={state.phase}
                  current={state.current}
                  total={state.total}
                  onComplete={() => {}}
                />
              </div>
            </div>
          )}

          {state.step === "complete" && state.course && (
            <div className="flex-1">
              <CourseViewer 
                course={state.course} 
                onNewCourse={() => {
                  reset();
                  navigate("/");
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md border-2 border-primary/20 bg-background/95 backdrop-blur-xl">
          <DialogHeader className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-display font-black text-center tracking-tight">
              Rencanamu Sudah Siap! 🚀
            </DialogTitle>
            <DialogDescription className="text-center text-base text-muted-foreground px-2">
              Silabus custom yang baru saja kamu susun akan hilang jika tidak disimpan. 
              <br/><span className="font-medium text-foreground">Login sebentar untuk menyimpannya ke library.</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button
              size="lg"
              className="w-full h-14 font-bold text-base shadow-xl hover:scale-[1.02] transition-transform bg-white text-black border border-gray-200 hover:bg-gray-50 hover:text-black dark:bg-white dark:text-black"
              onClick={() => loginWithGoogle()}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3" />
              Sign in with Google
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-mono">
                <span className="bg-background px-2 text-muted-foreground">Atau pakai email</span>
              </div>
            </div>

            <form onSubmit={handleMagicLinkLogin} className="space-y-3">
              <Input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-secondary/20"
              />
              <Button type="submit" variant="outline" className="w-full h-12 font-semibold border-2" disabled={loginLoading}>
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                Kirim Magic Link
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
