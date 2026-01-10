import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTypewriter } from "@/hooks/use-typewriter";
import { Header } from "@/components/Header";
import { CursorGlow } from "@/components/CursorGlow";
import anime from "animejs/lib/anime.es.js";

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholders = [
    "AI Prompt Engineering untuk produktivitas...",
    "Public Speaking untuk introvert...",
    "Dasar-dasar Blockchain & Web3...",
    "Manajemen Waktu & Deep Work...",
    "Flutter Developer untuk pemula...",
    "Cyber Security: Cara menjaga data pribadi...",
    "Strategi Content Creator di 2026...",
    "Emotional Intelligence di tempat kerja...",
    "Desain UI/UX dengan Figma...",
    "Bahasa pemrograman Rust untuk backend...",
    "Analisis Data dengan Python & SQL...",
    "Critical Thinking dalam pengambilan keputusan...",
    "Sustainable Living: Gaya hidup ramah lingkungan...",
    "Copywriting yang menjual untuk UMKM...",
    "Persiapan karir di industri AI..."
  ];

  const placeholderText = useTypewriter(placeholders);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Navigate to make-course with the topic query param
      navigate(`/make-course?topic=${encodeURIComponent(inputValue)}`);
    }
  };

  const handleFocus = () => {
    // Subtle focus animation for the container
    anime({
      targets: '.search-container',
      scale: 1.01,
      boxShadow: '0 20px 40px rgba(124, 58, 237, 0.1)',
      duration: 800,
      easing: 'easeOutExpo'
    });
  };

  const handleBlur = () => {
    anime({
      targets: '.search-container',
      scale: 1,
      boxShadow: '0 10px 30px rgba(0,0,0,0)',
      duration: 600,
      easing: 'easeOutExpo'
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans relative selection:bg-primary/20 flex flex-col">
      <CursorGlow />
      <Header />

      {/* Main Content - Vertically Centered */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 relative z-10 w-full max-w-4xl mx-auto">
        
        {/* Greeting Text */}
        <div className="text-center mb-12 space-y-2">
          <p className="text-2xl sm:text-3xl font-light text-muted-foreground animate-in slide-in-from-bottom-2 duration-700">
            {user ? `Halo, ${user.displayName?.split(' ')[0]}! ✨` : "Haii,"}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-in fade-in zoom-in duration-1000">
              Skill apa yang kamu pengen pelajari minggu ini?
            </span>
          </h1>
        </div>

        {/* Search Box Container */}
        <div className="search-container w-full relative group transition-all duration-500 rounded-full">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <div className="absolute left-6 text-muted-foreground/50">
              <Search className="w-6 h-6" />
            </div>
            
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholderText}
              className="w-full h-20 sm:h-24 pl-16 pr-20 rounded-full text-base sm:text-2xl border-2 border-border/50 bg-background/50 backdrop-blur-xl focus:border-primary/50 focus:ring-0 shadow-xl transition-all font-light placeholder:text-muted-foreground/30"
            />

            <Button 
              type="submit"
              size="icon"
              className="absolute right-3 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
              disabled={!inputValue.trim()}
            >
              <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </Button>
          </form>
          
          {/* Decorative Glow behind Search */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-1000" />
        </div>

        {/* Suggestion Chips (Optional, for quick start) */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-500">
          {["Python", "Digital Marketing", "React", "Data Science"].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setInputValue(tag);
                if (inputRef.current) inputRef.current.focus();
              }}
              className="px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-sm hover:bg-secondary hover:border-primary/30 transition-all"
            >
              {tag}
            </button>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground/60">
        <p className="flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3" /> 
          Powered by Multi-Agent AI Engine
        </p>
      </footer>
    </div>
  );
}