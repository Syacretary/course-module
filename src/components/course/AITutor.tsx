import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTutorChat } from "@/hooks/use-tutor-chat";
import ReactMarkdown from "react-markdown";

interface AITutorProps {
  currentContext: string;
  externalInput?: string;
  onInputChange?: (val: string) => void;
}

export function AITutor({ currentContext, externalInput = "", onInputChange }: AITutorProps) {
  const { messages, isTyping, sendMessage } = useTutorChat(currentContext);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync external input
  useEffect(() => {
    if (externalInput) {
      setInput(externalInput);
    }
  }, [externalInput]);

  const handleInputChange = (val: string) => {
    setInput(val);
    if (onInputChange) onInputChange(val);
  };

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const text = input;
    setInput(""); 
    if (onInputChange) onInputChange(""); // Reset external
    await sendMessage(text, currentContext);
  };

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-sm">AI Tutor (Llama 3)</h3>
          <p className="text-[10px] text-muted-foreground">Fast • Context Aware</p>
        </div>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10 opacity-70">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Halo! Aku siap bantu jelasin materi ini.</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 text-sm",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <Avatar className="w-8 h-8 shrink-0 border border-border">
                {msg.role === "ai" ? (
                  <>
                    <AvatarImage src="/icon.png" className="p-1" />
                    <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                )}
              </Avatar>
              <div
                className={cn(
                  "p-3 rounded-2xl max-w-[85%] leading-relaxed shadow-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-secondary/80 rounded-tl-sm border border-border/50 prose prose-sm dark:prose-invert max-w-none"
                )}
              >
                {msg.role === 'ai' ? (
                   <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 shrink-0 border border-border">
                <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
              </Avatar>
              <div className="bg-secondary/80 p-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border bg-background/50">
        <form onSubmit={handleSend} className="relative">
          <Input
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Tanya sesuatu..."
            className="pr-10 rounded-full bg-secondary/50 border-transparent focus:bg-background focus:border-primary/30 transition-all"
            disabled={isTyping}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-1 h-8 w-8 rounded-full"
            disabled={!input.trim() || isTyping}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}