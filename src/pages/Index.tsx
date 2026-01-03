import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Globe, Bot, Play, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import anime from "animejs/lib/anime.es.js";
import { Header } from "@/components/Header";
import { CursorGlow } from "@/components/CursorGlow";

export default function Index() {
  const { user } = useAuth();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation Init
  useEffect(() => {
    // 1. Hero Text Stagger Effect
    if (titleRef.current) {
      const textWrapper = titleRef.current;
      textWrapper.innerHTML = textWrapper.textContent!.replace(/\S/g, "<span class='letter inline-block'>$&</span>");

      anime.timeline({ loop: false })
        .add({
          targets: '.letter',
          translateY: [100, 0],
          translateZ: 0,
          opacity: [0, 1],
          easing: "easeOutExpo",
          duration: 1400,
          delay: (el, i) => 300 + 30 * i
        });
    }

    // 2. Bento Grid Spring Reveal
    anime({
      targets: '.bento-card',
      scale: [0.8, 1],
      opacity: [0, 1],
      delay: anime.stagger(100, { start: 1000 }),
      easing: 'spring(1, 80, 10, 0)'
    });

    // 3. Complex Background Particle System
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      const particles: any[] = [];
      const createParticle = () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '#7c3aed' : '#db2777', // Primary / Pink
        alpha: Math.random() * 0.5 + 0.1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });

      for (let i = 0; i < 50; i++) particles.push(createParticle());

      const animation = anime({
        duration: Infinity,
        update: () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            // Bounce off edges
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          });
          
          // Draw connections
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 0.5;
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 150) {
                ctx.globalAlpha = (1 - dist / 150) * 0.2;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
              }
            }
          }
        }
      });

      // Mouse interaction
      const handleMouseMove = (e: MouseEvent) => {
        particles.forEach(p => {
          const dx = p.x - e.clientX;
          const dy = p.y - e.clientY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * 0.05;
            p.vy += Math.sin(angle) * 0.05;
          }
        });
      };
      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        window.removeEventListener('mousemove', handleMouseMove);
        animation.pause();
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/20 relative">
      
      <CursorGlow />
      
      {/* AnimeJS Canvas Background */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-30 z-0" />

      <Header />

      {/* 2. Hero Section */}
      <header className="relative min-h-screen flex flex-col justify-center px-6 pt-20 z-10">
        <div className="container mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-8 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono tracking-widest uppercase mb-4 opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards]">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              System Online v2.0
            </div>
            
            <h1 ref={titleRef} className="text-6xl sm:text-7xl md:text-8xl font-display font-black leading-[0.9] tracking-tighter text-glow overflow-hidden">
              STOP LEARNING
            </h1>
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-display font-black leading-[0.9] tracking-tighter text-glow opacity-0 animate-[slideUp_1s_ease-out_0.5s_forwards]">
              <span className="text-gradient-safe">START UPLOADING</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed font-light border-l-4 border-primary pl-6 opacity-0 animate-[fadeIn_1s_ease-out_1.5s_forwards]">
              Otakmu bukan gudang hapalan. Kurikura adalah <strong className="text-foreground">Neural Interface</strong> yang mengubah dokumentasi teknis menjadi skill siap pakai dalam hitungan detik.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 opacity-0 animate-[fadeIn_1s_ease-out_2s_forwards]">
              <Link to="/make-course">
                <Button 
                  className="h-16 px-8 rounded-none bg-foreground text-background hover:bg-primary hover:text-white text-lg font-bold tracking-wide transition-all border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                  onMouseEnter={(e) => anime({ targets: e.currentTarget, scale: 1.05, duration: 800 })}
                  onMouseLeave={(e) => anime({ targets: e.currentTarget, scale: 1, duration: 600 })}
                >
                  GENERATE SKILL
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#demo">
                <Button variant="outline" className="h-16 px-8 rounded-none border-2 text-lg font-medium hover:bg-secondary">
                  <Play className="mr-2 w-5 h-5" />
                  WATCH DEMO
                </Button>
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 relative hidden lg:block opacity-0 animate-[fadeIn_2s_ease-out_1s_forwards]">
            <div className="relative w-full aspect-[3/4] glass-panel rounded-xl p-6 flex flex-col gap-4 bento-card">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">learning_module.tsx</span>
              </div>
              <div className="flex-1 font-mono text-sm space-y-2 opacity-80" id="code-content">
                <p><span className="text-purple-400">const</span> <span className="text-blue-400">knowledge</span> = <span className="text-yellow-400">await</span> ai.generate();</p>
                <p><span className="text-purple-400">if</span> (user.ready) {'{'}</p>
                <p className="pl-4 text-green-400">brain.upload(knowledge);</p>
                <p className="pl-4 text-muted-foreground">// Dopamine levels rising...</p>
                <p className="pl-4">skill.level++;</p>
                <p>{'}'}</p>
              </div>
              <div className="mt-auto pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span>STATUS:</span>
                  <span className="text-green-400 animate-pulse">CONNECTED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Marquee */}
      <div className="py-8 bg-foreground text-background overflow-hidden whitespace-nowrap border-y border-border transform -rotate-1 origin-left scale-105 z-20 relative">
        <div className="inline-block animate-marquee font-mono text-xl font-bold tracking-widest">
          REACT • PYTHON • DOCKER • KUBERNETES • RUST • MACHINE LEARNING • SYSTEM DESIGN • BLOCKCHAIN • REACT • PYTHON •
        </div>
      </div>

      {/* 4. Bento Grid */}
      <section id="features" className="container mx-auto py-32 px-6 z-10 relative">
        <div className="mb-20">
          <h2 className="text-4xl md:text-6xl font-display font-black mb-6">THE ENGINE</h2>
          <p className="text-xl text-muted-foreground max-w-xl">Kami tidak menggunakan metode kuno. Ini adalah arsitektur pembelajaran masa depan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[600px]" ref={gridRef}>
          
          <div className="bento-card md:col-span-2 row-span-2 bg-secondary/30 border border-border p-8 flex flex-col justify-between hover:bg-secondary/50 transition-colors group">
            <div>
              <div className="w-12 h-12 bg-primary text-white flex items-center justify-center rounded-none mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Multi-Agent Intelligence</h3>
              <p className="text-muted-foreground">Bukan satu, tapi LIMA AI bekerja paralel. Satu meriset, satu menyusun kurikulum, satu menulis kode, satu menguji validitas.</p>
            </div>
            <div className="mt-8 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="h-2 bg-background rounded overflow-hidden">
                <div className="h-full bg-primary w-0 group-hover:w-3/4 transition-all duration-1000 ease-out" />
              </div>
              <div className="flex justify-between text-xs mt-2 font-mono">
                <span>PROCESSING</span>
                <span>75%</span>
              </div>
            </div>
          </div>

          <div className="bento-card md:col-span-1 bg-card border border-border p-6 hover:border-primary transition-colors cursor-pointer"
               onMouseEnter={(e) => anime({ targets: e.currentTarget, translateY: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' })}
               onMouseLeave={(e) => anime({ targets: e.currentTarget, translateY: 0, boxShadow: '0 0 0 rgba(0,0,0,0)' })}>
            <Bot className="w-8 h-8 mb-4 text-purple-500" />
            <h3 className="text-lg font-bold">Google Gemini 2.0</h3>
            <p className="text-sm text-muted-foreground mt-2">Konteks window massive untuk pemahaman mendalam.</p>
          </div>

          <div className="bento-card md:col-span-1 bg-card border border-border p-6 hover:border-primary transition-colors cursor-pointer"
               onMouseEnter={(e) => anime({ targets: e.currentTarget, translateY: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' })}
               onMouseLeave={(e) => anime({ targets: e.currentTarget, translateY: 0, boxShadow: '0 0 0 rgba(0,0,0,0)' })}>
            <Zap className="w-8 h-8 mb-4 text-orange-500" />
            <h3 className="text-lg font-bold">Groq LPU™</h3>
            <p className="text-sm text-muted-foreground mt-2">Kecepatan inferensi 500 token/detik. Tanpa loading.</p>
          </div>

          <div className="bento-card md:col-span-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 flex items-center justify-between overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-1">Open Source Models</h3>
              <p className="text-gray-400">Llama 3.1 405B & DeepSeek R1</p>
            </div>
            <Globe className="w-24 h-24 text-white/10 absolute right-[-20px] bottom-[-20px] group-hover:rotate-45 transition-transform duration-700" />
          </div>

        </div>
      </section>

      {/* 5. CTA */}
      <section className="py-32 px-6 border-t border-border bg-background relative z-10">
        <div className="container mx-auto text-center">
          <h2 className="text-[12vw] font-display font-black leading-none opacity-5 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-full">
            START NOW
          </h2>
          <div className="relative z-10">
            <p className="text-2xl md:text-3xl font-light mb-8">
              Masa depan milik mereka yang belajar paling cepat.
            </p>
            <Link to="/make-course">
              <Button size="lg" 
                className="h-20 px-12 text-2xl rounded-none bg-foreground text-background hover:bg-primary hover:text-white border-2 border-foreground hover:border-primary shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all font-black tracking-tighter"
                onMouseEnter={(e) => anime({ targets: e.currentTarget, scale: 1.05, duration: 800 })}
                onMouseLeave={(e) => anime({ targets: e.currentTarget, scale: 1, duration: 600 })}
              >
                MULAI AKSES KURIKURA
                <ArrowRight className="ml-3 w-10 h-10" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-border flex justify-center items-center text-sm font-mono text-muted-foreground bg-background z-10 relative">
        <div className="text-center">
          © 2026 KURIKURA INC. Made with love by <a href="https://syacretary.web.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold underline-offset-4">Syacretary</a> and AI.
        </div>
      </footer>

    </div>
  );
}
