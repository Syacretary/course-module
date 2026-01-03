import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Sparkles, Zap, Target, Layers, Users, Globe, Bot, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-xl hidden sm:inline-block">Course Module</span>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            {user ? (
               <Link to="/my-courses">
                <Button variant="ghost" className="text-sm font-medium">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="ghost" className="text-sm font-medium">Masuk</Button>
              </Link>
            )}
            
            <Link to="/make-course">
              <Button className="gradient-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                Buat Modul
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32 px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
          <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in text-center">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by</span>
            <span className="flex items-center gap-1 font-semibold">
              Groq <Zap className="w-3 h-3 fill-current" />
            </span>
            <span className="opacity-50">,</span>
            <span className="flex items-center gap-1 font-semibold">
              Google <Bot className="w-3 h-3" />
            </span>
            <span className="opacity-50">&</span>
            <span className="flex items-center gap-1 font-semibold">
              Lovable <Heart className="w-3 h-3 fill-current" />
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight text-balance">
            Kuasai Skill Baru dengan Kurikulum
            <br className="hidden md:block" />
            <span className="text-gradient-primary px-2">Personal & Modular</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
            Lupakan video tutorial yang panjang dan membosankan. 
            Dapatkan modul pembelajaran berbasis teks yang <span className="text-foreground font-medium">to-the-point</span>, 
            kode interaktif, dan studi kasus nyata yang dirancang khusus untuk level Anda.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 w-full sm:w-auto">
            <Link to="/make-course" className="w-full sm:w-auto">
              <Button size="lg" className="gradient-primary w-full sm:px-8 sm:py-6 text-lg h-12 sm:h-14 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 mr-2" />
                Mulai Belajar Sekarang
              </Button>
            </Link>
            <Link to="/my-courses" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:px-8 sm:py-6 text-lg h-12 sm:h-14 bg-background/50 backdrop-blur-sm hover:bg-secondary/80">
                Lihat Contoh Modul
              </Button>
            </Link>
          </div>
          
          <div className="pt-8 text-sm text-muted-foreground flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span>Multi-Provider AI</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Personalized Path</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24 border-t border-border/50 bg-secondary/20">
        <div className="text-center mb-16 max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Mengapa Course Module Berbeda?
          </h2>
          <p className="text-muted-foreground text-lg">
            Kami tidak hanya memberikan materi, kami membangun struktur pemahaman yang solid menggunakan teknologi Multi-Agent AI tercanggih.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 px-4">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Kurikulum Adaptif</h3>
            <p className="text-muted-foreground leading-relaxed">
              Tidak ada dua orang yang belajar dengan cara yang sama. AI kami menyesuaikan materi berdasarkan latar belakang, tujuan, dan waktu yang Anda miliki.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:bg-teal-500/20 transition-colors">
              <Layers className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Arsitektur Modular</h3>
            <p className="text-muted-foreground leading-relaxed">
              Materi dipecah menjadi modul-modul kecil (bite-sized) yang mudah dicerna, memungkinkan Anda belajar di sela-sela kesibukan tanpa merasa kewalahan.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
              <Zap className="w-7 h-7 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Live Context engine</h3>
            <p className="text-muted-foreground leading-relaxed">
              Berbeda dengan ChatGPT biasa, sistem kami membaca dokumentasi terbaru secara real-time untuk memastikan materi Anda tidak kadaluarsa.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 px-4">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1e1e1e] border border-white/10 p-8 md:p-20 text-center shadow-2xl">
          {/* Abstract Shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              Siap untuk Upgrade Skill?
            </h2>
            <p className="text-gray-300 text-lg mb-10">
              Bergabunglah dengan ribuan pembelajar cerdas lainnya. Tanpa biaya langganan, tanpa iklan, murni ilmu pengetahuan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/make-course">
                <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 border-none px-8 py-6 text-lg font-bold shadow-xl shadow-white/10 hover:scale-105 transition-transform">
                  Buat Modul Belajarku
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="container px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
             <BookOpen className="w-5 h-5 text-primary" />
             <span className="font-bold">Course Module</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Course Module Platform. Built by <a href="https://syacretary.web.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Syacretary</a> and AI.
          </p>
        </div>
      </footer>
    </div>
  );
}

