import { useState, useEffect } from "react";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, ChevronRight, Menu, Copy, Check, 
  FileText, ChevronDown, Lock, Sparkles, MessageSquare, Map, List, ArrowRight,
  Terminal, Code2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AITutor } from "./AITutor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useSwipeable } from "react-swipeable";

interface CourseViewerProps {
  course: Course;
  onNewCourse: () => void;
}

const CopyButton = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Kode berhasil disalin");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-foreground z-20"
      onClick={copy}
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
};

const MarkdownContent = ({ content }: { content?: string }) => (
  <div className="prose prose-slate dark:prose-invert max-w-none w-full
    prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight
    prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 md:prose-h2:mt-16 prose-h2:mb-6 md:prose-h2:mb-8 prose-h2:border-b prose-h2:pb-4
    prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-10 md:prose-h3:mt-12 prose-h3:mb-4 md:prose-h3:mb-6
    prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed prose-p:text-foreground/80
    prose-strong:text-foreground prose-strong:font-bold
    prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none prose-pre:max-w-full overflow-hidden">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match;
          const codeContent = String(children).replace(/\n$/, "");
          
          if (isInline) {
            const cleanInlineContent = codeContent.replace(/^`|`$/g, "");
            return (
              <code 
                className="bg-secondary/80 text-foreground px-1.5 py-0.5 rounded-sm text-[0.85em] font-mono font-bold border-b-2 border-r-2 border-border mx-0.5 inline items-center shadow-sm break-all" 
                {...props}
              >
                {cleanInlineContent}
              </code>
            );
          }

          const isBash = match[1] === "bash" || match[1] === "sh" || match[1] === "zsh";
          return (
            <div className={cn(
              "relative group my-8 md:my-10 overflow-hidden rounded-xl border shadow-xl w-full max-w-full",
              isBash ? "bg-[#1e1e1e] border-white/10" : "bg-[#fafafa] border-zinc-300"
            )}>
              <div className={cn(
                "flex items-center justify-between px-4 py-3 border-b",
                isBash ? "bg-[#252526] border-white/5" : "bg-zinc-100 border-zinc-300"
              )}>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 px-2 md:px-3 py-1 rounded text-[9px] md:text-[10px] font-mono",
                    isBash ? "bg-white/5 text-gray-400" : "bg-zinc-200 text-zinc-600"
                  )}>
                    {isBash ? <Terminal className="w-3 h-3" /> : <Code2 className="w-3 h-3" />}
                    {match[1].toUpperCase()}
                  </div>
                </div>
                <CopyButton value={codeContent} />
              </div>
              <div className="relative max-w-full overflow-x-auto">
                <SyntaxHighlighter
                  language={match[1]}
                  style={isBash ? vscDarkPlus : oneLight}
                  showLineNumbers={true}
                  lineNumberStyle={{ 
                    minWidth: '2.5em', 
                    paddingRight: '0.5em', 
                    color: isBash ? '#858585' : '#a0a0a0', 
                    textAlign: 'right', 
                    userSelect: 'none', 
                    borderRight: '1px solid currentColor', 
                    opacity: 0.3, 
                    marginRight: '0.5em' 
                  }}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    fontSize: '0.8rem',
                    lineHeight: '1.4rem',
                    backgroundColor: 'transparent',
                    minWidth: '100%',
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily: 'inherit',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all'
                    }
                  }}
                  wrapLines={true}
                >
                  {codeContent}
                </SyntaxHighlighter>
              </div>
              {isBash && (
                <div className="px-4 py-2 bg-[#252526] border-t border-white/5 text-[8px] md:text-[9px] font-mono text-gray-500 italic">
                  Run this in your terminal to continue
                </div>
              )}
            </div>
          );
        },
        pre: ({ children }) => <>{children}</>,
      }}
    >
      {content || "Materi sedang disiapkan oleh AI..."}
    </ReactMarkdown>
  </div>
);

export function CourseViewer({ course, onNewCourse }: CourseViewerProps) {
  const navigate = useNavigate();
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [selectedSubMaterial, setSelectedSubMaterial] = useState(0);
  
  // Progress Calculation
  const totalSubMaterials = course.chapters.reduce((acc, ch) => acc + ch.subMaterials.length, 0);
  const currentProgress = ((selectedChapter * 6 + selectedSubMaterial + 1) / totalSubMaterials) * 100;

  const currentChapter = course.chapters[selectedChapter];
  const currentSubMaterial = currentChapter?.subMaterials[selectedSubMaterial];

  // Auto-scroll to top on change
  useEffect(() => {
    const viewports = document.querySelectorAll('[data-radix-scroll-area-viewport]');
    viewports.forEach(v => v.scrollTo({ top: 0, behavior: 'smooth' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedChapter, selectedSubMaterial]);

  const navigateNext = () => {
    if (selectedSubMaterial < currentChapter.subMaterials.length - 1) {
      setSelectedSubMaterial(prev => prev + 1);
    } else if (selectedChapter < course.chapters.length - 1) {
      setSelectedChapter(prev => prev + 1);
      setSelectedSubMaterial(0);
    }
  };

  const navigatePrev = () => {
    if (selectedSubMaterial > 0) {
      setSelectedSubMaterial(prev => prev - 1);
    } else if (selectedChapter > 0) {
      setSelectedChapter(prev => prev - 1);
      const prevChapter = course.chapters[selectedChapter - 1];
      setSelectedSubMaterial(prevChapter.subMaterials.length - 1);
    }
  };

  const hasNext = selectedSubMaterial < currentChapter?.subMaterials.length - 1 || selectedChapter < course.chapters.length - 1;
  const hasPrev = selectedSubMaterial > 0 || selectedChapter > 0;

  // Swipe Handlers for Mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => hasNext && navigateNext(),
    onSwipedRight: () => hasPrev && navigatePrev(),
    preventScrollOnSwipe: false, // Allow vertical scrolling
    trackMouse: false
  });

  return (
    <div className="h-full bg-background relative overflow-hidden flex flex-col md:flex-row">
      
      {/* ================= MOBILE VIEW (Content First + Bottom Dock) ================= */}
      <div className="md:hidden flex-1 flex flex-col h-full relative" {...swipeHandlers}>
        
        {/* Minimal Top Bar */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-30">
           <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="-ml-2">
             <ChevronLeft className="w-5 h-5" />
           </Button>
           <span className="text-sm font-bold truncate max-w-[200px]">{currentChapter?.title}</span>
           <div className="w-8" /> {/* Spacer */}
        </div>

        {/* Main Canvas (Full Screen Scroll) */}
        <ScrollArea className="flex-1 w-full pb-24"> 
          <article className="px-5 py-6">
             <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/80 bg-primary/10 px-2 py-1 rounded">
                  Bagian {selectedSubMaterial + 1}
                </span>
                <h1 className="text-2xl font-display font-black leading-tight mt-3">
                  {currentSubMaterial?.title}
                </h1>
             </div>
             <MarkdownContent content={currentSubMaterial?.content} />
             
             {/* End of Chapter Hint */}
             <div className="mt-12 pt-8 border-t border-dashed border-border text-center text-xs text-muted-foreground">
                {hasNext ? "Geser kiri untuk lanjut →" : "Bab Selesai! 🎉"}
             </div>
          </article>
        </ScrollArea>

        {/* Floating Glass Dock */}
        <div className="absolute bottom-6 left-4 right-4 h-16 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-between px-6 z-40 text-white">
           
           {/* Left: Map/Syllabus */}
           <Sheet>
             <SheetTrigger asChild>
               <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl">
                 <Map className="w-6 h-6" />
               </Button>
             </SheetTrigger>
             <SheetContent side="left" className="w-[85%] sm:w-[380px] p-0">
                <SheetHeader className="p-6 bg-secondary/10 border-b text-left space-y-1">
                   <SheetTitle className="font-display font-bold text-xl">Peta Belajar</SheetTitle>
                   <SheetDescription className="text-xs text-muted-foreground">
                      Telusuri seluruh modul dan pantau progres belajarmu.
                   </SheetDescription>
                   <Progress value={currentProgress} className="h-2 mt-3" />
                   <p className="text-[10px] text-muted-foreground mt-1 text-right">{Math.round(currentProgress)}% Selesai</p>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-160px)]">
                   <div className="p-4 space-y-4">
                      {course.chapters.map((chap, idx) => (
                        <div key={chap.id} className={cn("space-y-2", idx === selectedChapter ? "opacity-100" : "opacity-60")}>
                           <div className="font-bold text-sm flex items-center gap-2">
                              <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs border", idx === selectedChapter ? "bg-primary text-white border-primary" : "border-border")}>
                                {idx + 1}
                              </span>
                              {chap.title}
                           </div>
                           {/* Sub Materials List */}
                           <div className="pl-8 space-y-1">
                             {chap.subMaterials.map((sub, sIdx) => (
                               <button 
                                 key={sub.id}
                                 onClick={() => { setSelectedChapter(idx); setSelectedSubMaterial(sIdx); }}
                                 className={cn("block text-xs text-left w-full py-1.5 px-2 rounded", 
                                   idx === selectedChapter && sIdx === selectedSubMaterial ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                                 )}
                               >
                                 {sub.title}
                               </button>
                             ))}
                           </div>
                        </div>
                      ))}
                   </div>
                </ScrollArea>
             </SheetContent>
           </Sheet>

           {/* Middle: Progress Indicator (Text) */}
           <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">PROGRESS</span>
              <span className="text-sm font-bold text-white">{Math.round(currentProgress)}%</span>
           </div>

           {/* Right: AI Tutor (Drawer) */}
           <Drawer>
             <DrawerTrigger asChild>
               <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl relative">
                 <Sparkles className="w-6 h-6" />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               </Button>
             </DrawerTrigger>
             <DrawerContent className="h-[85vh] flex flex-col fixed bottom-0 left-0 right-0 rounded-t-[20px] outline-none">
                <DrawerHeader className="border-b border-border/50 text-left">
                   <DrawerTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      AI Tutor
                   </DrawerTitle>
                   <DrawerDescription className="hidden">
                      Tanya apapun tentang materi yang sedang kamu pelajari.
                   </DrawerDescription>
                </DrawerHeader>
                <div className="flex-1 overflow-hidden bg-background">
                   <AITutor currentContext={currentSubMaterial?.content || ""} />
                </div>
             </DrawerContent>
           </Drawer>

        </div>
      </div>


      {/* ================= DESKTOP VIEW (Classic 3-Pane) ================= */}
      <div className="hidden md:flex flex-1 h-full overflow-hidden">
        {/* Left Side: Navigation */}
        <aside className="w-72 bg-card border-r border-border flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground" onClick={() => navigate("/")}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Dashboard
            </Button>
            <h2 className="font-display font-bold text-lg leading-tight line-clamp-2">{course.title}</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {course.chapters.map((chapter, idx) => {
                const isLocked = idx > selectedChapter + 1; 
                return (
                  <div key={chapter.id} className="space-y-1">
                    <button
                      onClick={() => !isLocked && setSelectedChapter(idx)}
                      disabled={isLocked}
                      className={cn(
                        "w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                        selectedChapter === idx ? "bg-primary/10 text-primary" : "hover:bg-secondary/50 text-foreground/80",
                        isLocked && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 border transition-colors",
                        selectedChapter === idx ? "border-primary bg-primary text-white" : "border-border bg-background"
                      )}>
                        {isLocked ? <Lock className="w-3 h-3" /> : idx + 1}
                      </div>
                      <span className="text-sm font-medium truncate flex-1">Minggu {idx + 1}</span>
                      {selectedChapter === idx && <ChevronDown className="w-4 h-4 opacity-50" />}
                    </button>
                    {selectedChapter === idx && !isLocked && (
                      <div className="ml-3 pl-3 border-l-2 border-primary/10 space-y-0.5 py-1">
                        {chapter.subMaterials.map((sub, subIdx) => (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedSubMaterial(subIdx)}
                            className={cn(
                              "w-full text-left flex items-start gap-2 px-3 py-2 rounded-md text-xs transition-colors",
                              selectedSubMaterial === subIdx 
                                ? "text-primary font-bold bg-primary/5" 
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <FileText className="w-3 h-3 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{sub.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        {/* Resizable Panels for Content + Chat */}
        <div className="flex-1 min-w-0 relative flex flex-col h-full overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {/* Main Content Panel */}
            <ResizablePanel defaultSize={75} minSize={50} className="flex flex-col bg-background relative">
              <ScrollArea className="flex-1 w-full">
                <article className="max-w-3xl mx-auto px-6 py-12 w-full">
                  <div className="mb-8 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-widest">
                      <span className="px-2 py-1 rounded bg-primary/10">Minggu {selectedChapter + 1}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      <span>Modul {selectedSubMaterial + 1}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight leading-tight text-balance">
                      {currentSubMaterial?.title}
                    </h1>
                  </div>
                  <MarkdownContent content={currentSubMaterial?.content} />
                  <div className="flex items-center justify-between mt-16 pt-8 border-t border-border">
                    <Button variant="ghost" onClick={navigatePrev} disabled={!hasPrev}>
                      <ChevronLeft className="w-4 h-4 mr-2" /> Sebelumnya
                    </Button>
                    <Button onClick={navigateNext} disabled={!hasNext} className="px-8 shadow-lg bg-primary hover:bg-primary/90">
                      Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </article>
              </ScrollArea>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Chat Sidebar Panel */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="flex flex-col border-l border-border bg-card">
              <div className="p-6 border-b border-border bg-secondary/5 shrink-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Progress</h3>
                  <span className="text-xs font-mono font-bold text-primary">{Math.round(currentProgress)}%</span>
                </div>
                <Progress value={currentProgress} className="h-2" />
              </div>
              <div className="flex-1 overflow-hidden">
                <AITutor currentContext={currentSubMaterial?.content || ""} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

    </div>
  );
}
