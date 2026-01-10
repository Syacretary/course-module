import { useState, useEffect, useRef } from "react";
import { Course, Chapter, Module, SubMaterial } from "@/types/course";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, ChevronRight, Menu, Copy, Check, 
  FileText, ChevronDown, Lock, Sparkles, MessageSquare, Map, List, ArrowRight,
  Terminal, Code2, Clock, Info
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AITutor } from "./AITutor";
import { TextSelectionMenu } from "../TextSelectionMenu";
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

const UNLOCK_TIME = 180; // 3 minutes in seconds

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
  const [selectedModule, setSelectedModule] = useState(0);
  const [selectedSubMaterial, setSelectedSubMaterial] = useState(0);
  const [aiInput, setAiInput] = useState("");
  
  // Timer & Unlocking State
  const [timeLeft, setTimeLeft] = useState(UNLOCK_TIME);
  const [unlockedProgress, setUnlockedProgress] = useState<{ chapter: number; module: number; sub: number }>(() => {
    const saved = localStorage.getItem(`course_progress_${course.id}`);
    return saved ? JSON.parse(saved) : { chapter: 0, module: 0, sub: 0 };
  });

  const currentChapter = course.chapters[selectedChapter];
  const currentModule = currentChapter?.modules?.[selectedModule];
  const currentSubMaterial = currentChapter?.modules 
    ? currentModule?.subMaterials?.[selectedSubMaterial]
    : (currentChapter as any)?.subMaterials?.[selectedSubMaterial];

  // Hierarchy Navigation Helpers
  const getNextIndices = (c: number, m: number, s: number) => {
    const chap = course.chapters[c];
    if (!chap) return null;

    if (chap.modules && Array.isArray(chap.modules)) {
      const mod = chap.modules[m];
      if (s < (mod?.subMaterials?.length || 0) - 1) return { c, m, s: s + 1 };
      if (m < chap.modules.length - 1) return { c, m: m + 1, s: 0 };
    } else {
      const subMaterials = (chap as any).subMaterials;
      if (s < (subMaterials?.length || 0) - 1) return { c, m, s: s + 1 };
    }

    if (c < course.chapters.length - 1) return { c: c + 1, m: 0, s: 0 };
    return null;
  };

  const getPrevIndices = (c: number, m: number, s: number) => {
    if (s > 0) return { c, m, s: s - 1 };
    
    const chap = course.chapters[c];
    if (chap && chap.modules && Array.isArray(chap.modules)) {
      if (m > 0) {
        const prevMod = chap.modules[m - 1];
        return { c, m: m - 1, s: (prevMod?.subMaterials?.length || 1) - 1 };
      }
    }

    if (c > 0) {
      const prevChap = course.chapters[c - 1];
      if (prevChap.modules && Array.isArray(prevChap.modules)) {
        const lastModIdx = prevChap.modules.length - 1;
        const lastMod = prevChap.modules[lastModIdx];
        return { c: c - 1, m: lastModIdx, s: (lastMod?.subMaterials?.length || 1) - 1 };
      } else {
        const prevSubMaterials = (prevChap as any).subMaterials;
        return { c: c - 1, m: 0, s: (prevSubMaterials?.length || 1) - 1 };
      }
    }
    return null;
  };

  // Timer Logic
  useEffect(() => {
    const next = getNextIndices(selectedChapter, selectedModule, selectedSubMaterial);
    if (!next) {
      setTimeLeft(0);
      return;
    }

    // If next is already unlocked, timer is 0
    const isNextUnlocked = 
      next.c < unlockedProgress.chapter || 
      (next.c === unlockedProgress.chapter && next.m < unlockedProgress.module) ||
      (next.c === unlockedProgress.chapter && next.m === unlockedProgress.module && next.s <= unlockedProgress.sub);

    if (isNextUnlocked) {
      setTimeLeft(0);
      return;
    }

    // Persistent Timer: check if we have a saved end time for THIS specific sub-material
    const timerKey = `timer_${course.id}_${selectedChapter}_${selectedModule}_${selectedSubMaterial}`;
    const savedEndTime = localStorage.getItem(timerKey);
    let endTime: number;

    if (savedEndTime) {
      endTime = parseInt(savedEndTime);
    } else {
      endTime = Date.now() + UNLOCK_TIME * 1000;
      localStorage.setItem(timerKey, endTime.toString());
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        const newProgress = { chapter: next.c, module: next.m, sub: next.s };
        setUnlockedProgress(newProgress);
        localStorage.setItem(`course_progress_${course.id}`, JSON.stringify(newProgress));
        clearInterval(interval);
        toast.success("Materi berikutnya telah terbuka!");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedChapter, selectedModule, selectedSubMaterial, unlockedProgress, course.id]);

  // Progress Calculation (Approximate)
  const totalSubMaterials = (course.chapters || []).reduce((acc, ch) => {
    if (ch && ch.modules && Array.isArray(ch.modules)) {
      return acc + ch.modules.reduce((mAcc, m) => mAcc + (m?.subMaterials?.length || 0), 0);
    }
    // Fallback for old structure or missing modules
    return acc + ((ch as any)?.subMaterials?.length || 0);
  }, 0);
  
  const getCurrentFlatIndex = (c: number, m: number, s: number) => {
    let index = 0;
    for (let i = 0; i < c; i++) {
      const chap = course.chapters[i];
      if (chap) {
        if (chap.modules && Array.isArray(chap.modules)) {
          for (let j = 0; j < chap.modules.length; j++) {
            index += chap.modules[j]?.subMaterials?.length || 0;
          }
        } else {
          index += (chap as any).subMaterials?.length || 0;
        }
      }
    }
    const currentChap = course.chapters[c];
    if (currentChap && currentChap.modules && Array.isArray(currentChap.modules)) {
      for (let j = 0; j < m; j++) {
        index += currentChap.modules[j]?.subMaterials?.length || 0;
      }
    }
    return index + s + 1;
  };

  const currentProgress = (getCurrentFlatIndex(selectedChapter, selectedModule, selectedSubMaterial) / totalSubMaterials) * 100;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedChapter, selectedModule, selectedSubMaterial]);

  const nextIndices = getNextIndices(selectedChapter, selectedModule, selectedSubMaterial);
  const prevIndices = getPrevIndices(selectedChapter, selectedModule, selectedSubMaterial);
  
  const isNextLocked = nextIndices && (
    nextIndices.c > unlockedProgress.chapter || 
    (nextIndices.c === unlockedProgress.chapter && nextIndices.m > unlockedProgress.module) ||
    (nextIndices.c === unlockedProgress.chapter && nextIndices.m === unlockedProgress.module && nextIndices.s > unlockedProgress.sub)
  );

  const handleAskAI = (text: string) => {
    setAiInput(`Aku nggak paham dengan "${text}", Bisa jelasin kaya anak kecil nggak?`);
  };

  return (
    <div className="h-full bg-background relative overflow-hidden flex flex-col md:flex-row">
      <TextSelectionMenu onAskAI={handleAskAI} />

      {/* ================= DESKTOP VIEW ================= */}
      <div className="hidden md:flex flex-1 h-full overflow-hidden">
        <aside className="w-80 bg-card border-r border-border flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground" onClick={() => navigate("/")}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Dashboard
            </Button>
            <h2 className="font-display font-bold text-lg leading-tight line-clamp-2">{course.title}</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {course.chapters.map((chap, cIdx) => (
                <div key={chap.id} className="space-y-1">
                  <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center justify-between">
                    <span>BAB {cIdx + 1}</span>
                    {cIdx > unlockedProgress.chapter && <Lock className="w-3 h-3" />}
                  </div>
                  <div className="space-y-1">
                    {chap.modules && Array.isArray(chap.modules) ? (
                      chap.modules.map((mod, mIdx) => (
                        <div key={mod.id} className="space-y-0.5">
                          <div className="px-3 py-1.5 text-xs font-bold text-foreground/80 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            {mod.title}
                          </div>
                          <div className="ml-4 border-l border-border/50 pl-2">
                            {mod.subMaterials.map((sub, sIdx) => {
                              const isLocked = 
                                cIdx > unlockedProgress.chapter || 
                                (cIdx === unlockedProgress.chapter && mIdx > unlockedProgress.module) ||
                                (cIdx === unlockedProgress.chapter && mIdx === unlockedProgress.module && sIdx > unlockedProgress.sub);
                              
                              const isActive = selectedChapter === cIdx && selectedModule === mIdx && selectedSubMaterial === sIdx;

                              return (
                                <button
                                  key={sub.id}
                                  disabled={isLocked}
                                  onClick={() => {
                                    setSelectedChapter(cIdx);
                                    setSelectedModule(mIdx);
                                    setSelectedSubMaterial(sIdx);
                                  }}
                                  className={cn(
                                    "w-full text-left flex items-start gap-2 px-3 py-1.5 rounded-md text-[11px] transition-all",
                                    isActive ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground",
                                    isLocked && "opacity-40 cursor-not-allowed"
                                  )}
                                >
                                  {isLocked ? <Lock className="w-3 h-3 mt-0.5 shrink-0" /> : <FileText className="w-3 h-3 mt-0.5 shrink-0" />}
                                  <span className="line-clamp-1">{sub.title}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="ml-4 border-l border-border/50 pl-2">
                        {(chap as any).subMaterials?.map((sub: any, sIdx: number) => {
                          const isLocked = 
                            cIdx > unlockedProgress.chapter || 
                            (cIdx === unlockedProgress.chapter && sIdx > unlockedProgress.sub);
                          
                          const isActive = selectedChapter === cIdx && selectedSubMaterial === sIdx;

                          return (
                            <button
                              key={sub.id}
                              disabled={isLocked}
                              onClick={() => {
                                setSelectedChapter(cIdx);
                                setSelectedSubMaterial(sIdx);
                              }}
                              className={cn(
                                "w-full text-left flex items-start gap-2 px-3 py-1.5 rounded-md text-[11px] transition-all",
                                isActive ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground",
                                isLocked && "opacity-40 cursor-not-allowed"
                              )}
                            >
                              {isLocked ? <Lock className="w-3 h-3 mt-0.5 shrink-0" /> : <FileText className="w-3 h-3 mt-0.5 shrink-0" />}
                              <span className="line-clamp-1">{sub.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        <div className="flex-1 min-w-0 relative flex flex-col h-full overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={70} className="flex flex-col bg-background relative">
              <ScrollArea className="flex-1 w-full" id="main-content-area">
                <article className="max-w-3xl mx-auto px-10 py-12 w-full">
                  <div className="mb-10 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-primary uppercase tracking-widest">
                      <span>Bab {selectedChapter + 1}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                      <span>{currentModule?.title || "Materi"}</span>
                    </div>
                    <h1 className="text-4xl font-display font-black tracking-tight leading-tight">
                      {currentSubMaterial?.title}
                    </h1>
                  </div>
                  
                  <MarkdownContent content={currentSubMaterial?.content} />

                  <div className="flex items-center justify-between mt-20 pt-10 border-t border-border">
                    <Button variant="ghost" onClick={() => prevIndices && (setSelectedChapter(prevIndices.c), setSelectedModule(prevIndices.m), setSelectedSubMaterial(prevIndices.s))} disabled={!prevIndices}>
                      <ChevronLeft className="w-4 h-4 mr-2" /> Kembali
                    </Button>
                    
                    <div className="flex items-center gap-4">
                      {timeLeft > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-xs font-mono font-bold min-w-[120px] justify-center">
                          <Clock className="w-3 h-3 text-primary animate-pulse" />
                          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                      <Button 
                        disabled={isNextLocked || !nextIndices}
                        onClick={() => nextIndices && (setSelectedChapter(nextIndices.c), setSelectedModule(nextIndices.m), setSelectedSubMaterial(nextIndices.s))}
                        className="px-10 h-11 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {isNextLocked ? "Terkunci" : "Lanjut"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </article>
              </ScrollArea>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={30} className="flex flex-col border-l border-border bg-card">
              <div className="p-6 border-b border-border bg-secondary/5 shrink-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Mastery Progress</h3>
                  <span className="text-xs font-mono font-bold text-primary">{Math.round(currentProgress)}%</span>
                </div>
                <Progress value={currentProgress} className="h-1.5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <AITutor currentContext={currentSubMaterial?.content || ""} externalInput={aiInput} onInputChange={setAiInput} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      {/* ================= MOBILE VIEW (REDACTED FOR BREVITY, WOULD BE UPDATED SIMILARLY) ================= */}
      <div className="md:hidden flex-1 flex flex-col h-full bg-background" {...useSwipeable({
        onSwipedLeft: () => !isNextLocked && nextIndices && (setSelectedChapter(nextIndices.c), setSelectedModule(nextIndices.m), setSelectedSubMaterial(nextIndices.s)),
        onSwipedRight: () => prevIndices && (setSelectedChapter(prevIndices.c), setSelectedModule(prevIndices.m), setSelectedSubMaterial(prevIndices.s)),
      })}>
         <div className="h-14 px-4 flex items-center justify-between border-b bg-background/80 backdrop-blur-xl sticky top-0 z-30">
            <Button variant="ghost" size="icon" onClick={() => navigate("/my-courses")}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col items-center max-w-[200px]">
               <span className="text-[9px] font-black text-primary uppercase tracking-widest">BAB {selectedChapter + 1}</span>
               <span className="text-xs font-bold truncate w-full text-center">{currentSubMaterial?.title}</span>
            </div>
            <div className="w-10" />
         </div>

         <ScrollArea className="flex-1" id="mobile-content-area">
            <article className="px-6 py-8 pb-32">
               <MarkdownContent content={currentSubMaterial?.content} />
               
               <div className="mt-12 space-y-4">
                  {timeLeft > 0 && (
                    <div className="flex items-center justify-center gap-2 p-4 bg-secondary/50 rounded-2xl border border-border">
                       <Clock className="w-4 h-4 text-primary" />
                       <span className="text-sm font-bold font-mono">Buka materi berikutnya dalam {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                    </div>
                  )}
                  <Button 
                    disabled={isNextLocked || !nextIndices}
                    onClick={() => nextIndices && (setSelectedChapter(nextIndices.c), setSelectedModule(nextIndices.m), setSelectedSubMaterial(nextIndices.s))}
                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-2xl"
                  >
                    {isNextLocked ? "Terkunci (Baca Dulu)" : "Lanjut Belajar"}
                  </Button>
               </div>
            </article>
         </ScrollArea>

         <div className="fixed bottom-6 left-4 right-4 h-16 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center justify-between px-6 z-40">
            <Sheet>
               <SheetTrigger asChild>
                 <Button variant="ghost" className="text-white/70 hover:text-white p-0 h-auto">
                    <Map className="w-6 h-6" />
                 </Button>
               </SheetTrigger>
               <SheetContent side="left" className="w-[85%] p-0">
                  {/* Updated Sitemap with 3-levels */}
                  <ScrollArea className="h-full p-6">
                    <h3 className="font-display font-black text-2xl mb-6">Peta Kurikura</h3>
                    <div className="space-y-6">
                       {course.chapters.map((chap, cIdx) => (
                         <div key={chap.id} className="space-y-3">
                            <div className="text-[10px] font-black text-primary tracking-widest uppercase">Bab {cIdx + 1}: {chap.title}</div>
                            <div className="space-y-4 pl-2">
                               {chap.modules && Array.isArray(chap.modules) ? (
                                 chap.modules.map((mod, mIdx) => (
                                   <div key={mod.id} className="space-y-1">
                                      <div className="text-xs font-bold">{mod.title}</div>
                                      <div className="space-y-0.5">
                                         {mod.subMaterials.map((sub, sIdx) => {
                                            const isLocked = 
                                              cIdx > unlockedProgress.chapter || 
                                              (cIdx === unlockedProgress.chapter && mIdx > unlockedProgress.module) ||
                                              (cIdx === unlockedProgress.chapter && mIdx === unlockedProgress.module && sIdx > unlockedProgress.sub);
                                            return (
                                              <button 
                                                key={sub.id}
                                                disabled={isLocked}
                                                onClick={() => { setSelectedChapter(cIdx); setSelectedModule(mIdx); setSelectedSubMaterial(sIdx); }}
                                                className={cn("w-full text-left text-[11px] py-1 px-2 rounded", 
                                                  selectedChapter === cIdx && selectedModule === mIdx && selectedSubMaterial === sIdx ? "bg-primary text-white" : "text-muted-foreground"
                                                )}
                                              >
                                                {isLocked ? "🔒 " : "📄 "}{sub.title}
                                              </button>
                                            );
                                         })}
                                      </div>
                                   </div>
                                 ))
                               ) : (
                                  <div className="space-y-0.5">
                                     {(chap as any).subMaterials?.map((sub: any, sIdx: number) => {
                                        const isLocked = 
                                          cIdx > unlockedProgress.chapter || 
                                          (cIdx === unlockedProgress.chapter && sIdx > unlockedProgress.sub);
                                        return (
                                          <button 
                                            key={sub.id}
                                            disabled={isLocked}
                                            onClick={() => { setSelectedChapter(cIdx); setSelectedSubMaterial(sIdx); }}
                                            className={cn("w-full text-left text-[11px] py-1 px-2 rounded", 
                                              selectedChapter === cIdx && selectedSubMaterial === sIdx ? "bg-primary text-white" : "text-muted-foreground"
                                            )}
                                          >
                                            {isLocked ? "🔒 " : "📄 "}{sub.title}
                                          </button>
                                        );
                                     })}
                                  </div>
                               )}
                            </div>
                         </div>
                       ))}
                    </div>
                  </ScrollArea>
               </SheetContent>
            </Sheet>

            <div className="flex flex-col items-center">
               <span className="text-[8px] font-black text-white/40 tracking-[0.3em]">PROGRESS</span>
               <span className="text-sm font-bold text-white">{Math.round(currentProgress)}%</span>
            </div>

            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" className="text-white/70 hover:text-white p-0 h-auto relative">
                   <Sparkles className="w-6 h-6" />
                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-[80vh]">
                 <AITutor currentContext={currentSubMaterial?.content || ""} externalInput={aiInput} onInputChange={setAiInput} />
              </DrawerContent>
            </Drawer>
         </div>
      </div>
    </div>
  );
}

