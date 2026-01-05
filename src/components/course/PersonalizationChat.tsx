import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PersonalizationQuestion } from "@/types/course";
import anime from "animejs/lib/anime.es.js";

interface PersonalizationChatProps {
  topic: string;
  questions: PersonalizationQuestion[];
  onComplete: (answers: Array<{ questionId: string; answer: string }>) => void;
  isLoadingQuestions: boolean;
}

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  options?: string[];
  questionId?: string;
}

export function PersonalizationChat({ topic, questions, onComplete, isLoadingQuestions }: PersonalizationChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [answers, setAnswers] = useState<Array<{ questionId: string; answer: string }>>([]);

  // Initial Greeting
  useEffect(() => {
    if (messages.length === 0 && !isLoadingQuestions) {
      addAiMessage(`Ide bagus! **${topic}** adalah skill yang sangat berharga. Tapi supaya kurikulumnya pas, aku butuh info tambahan:`);
      
      // Delay first question slightly
      setTimeout(() => {
        askNextQuestion(0);
      }, 1500);
    }
  }, [topic, isLoadingQuestions]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages, isTyping]);

  const addAiMessage = (content: string, options?: string[], questionId?: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "ai",
        content,
        options,
        questionId
      }]);
    }, 1000); // Simulate thinking delay
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: "user",
      content
    }]);
  };

  const askNextQuestion = (index: number) => {
    if (index < questions.length) {
      const q = questions[index];
      addAiMessage(q.question, q.suggestedAnswers, q.id);
    } else {
      // All done
      addAiMessage("Terima kasih! Aku sedang meracik kurikulum spesial buat kamu... 🚀");
      setTimeout(() => {
        onComplete(answers);
      }, 2000);
    }
  };

  const handleAnswer = (answer: string) => {
    addUserMessage(answer);
    
    // Save answer
    const currentQ = questions[currentQuestionIndex];
    const newAnswers = [...answers, { questionId: currentQ.id, answer }];
    setAnswers(newAnswers);

    // Next
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setTimeout(() => askNextQuestion(nextIndex), 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleAnswer(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto bg-background rounded-2xl shadow-xl border border-border overflow-hidden">
      {/* Header Topic */}
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-sm text-muted-foreground">TOPIC: <span className="font-bold text-foreground">{topic}</span></span>
        </div>
        <div className="text-xs text-muted-foreground">
          {currentQuestionIndex}/{questions.length} Questions
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-6">
        <div className="space-y-6 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <Avatar className="w-10 h-10 border border-primary/20 shadow-sm">
                    <AvatarImage src="/icon.png" className="object-contain p-1" />
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}

                <div className="space-y-2 max-w-[80%]">
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-card border border-border rounded-tl-none'
                    }`}
                  >
                    {/* Render text with bold support */}
                    <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>

                  {/* Options Chips */}
                  {msg.role === 'ai' && msg.options && (
                    <div className="flex flex-wrap gap-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-500 delay-300">
                      {msg.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          disabled={
                            currentQuestionIndex < questions.length 
                              ? msg.questionId !== questions[currentQuestionIndex]?.id 
                              : true
                          }
                          className="px-4 py-2 rounded-full bg-secondary/50 hover:bg-primary/10 hover:border-primary/50 border border-border text-xs transition-all text-left hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <Avatar className="w-10 h-10 bg-secondary">
                    <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <Avatar className="w-10 h-10 border border-primary/20">
                <AvatarImage src="/icon.png" className="object-contain p-1" />
                <AvatarFallback><Bot /></AvatarFallback>
              </Avatar>
              <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          )}
          
          {/* Loading Initial Questions State */}
          {isLoadingQuestions && messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-40 gap-4 opacity-50">
                <Sparkles className="w-8 h-8 text-primary animate-spin-slow" />
                <p className="text-sm font-mono animate-pulse">Designing interview...</p>
             </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ketik jawabanmu sendiri..."
            className="h-14 pl-6 pr-14 rounded-full text-base bg-secondary/30 focus:bg-background transition-all border-transparent focus:border-primary/50 shadow-inner"
            disabled={isTyping || isLoadingQuestions || currentQuestionIndex >= questions.length}
            autoFocus
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-2 w-10 h-10 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
            disabled={!inputValue.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
