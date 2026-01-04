import { useState, useEffect, useRef } from "react";
import { Course, Chapter, SubMaterial } from "@/types/course";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, ChevronRight, BookOpen, Menu, X, Copy, Check, 
  Folder, FileText, ChevronDown, Terminal, Hash, ArrowRight, Code2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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
      className="absolute right-2 top-2 h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 z-20"
      onClick={copy}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
};

export function CourseViewer({ course, onNewCourse }: CourseViewerProps) {
  const navigate = useNavigate();
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [selectedSubMaterial, setSelectedSubMaterial] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentChapter = course.chapters[selectedChapter];
  const currentSubMaterial = currentChapter?.subMaterials[selectedSubMaterial];

  // Auto-scroll to top on material change
  useEffect(() => {
    const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedChapter, selectedSubMaterial]);

  const navigateNext = () => {
    if (selectedSubMaterial < currentChapter.subMaterials.length - 1) {
      setSelectedSubMaterial((prev) => prev + 1);
    } else if (selectedChapter < course.chapters.length - 1) {
      setSelectedChapter((prev) => prev + 1);
      setSelectedSubMaterial(0);
    }
    setSidebarOpen(false);
  };

  const navigatePrev = () => {
    if (selectedSubMaterial > 0) {
      setSelectedSubMaterial((prev) => prev - 1);
    } else if (selectedChapter > 0) {
      setSelectedChapter((prev) => prev - 1);
      const prevChapter = course.chapters[selectedChapter - 1];
      setSelectedSubMaterial(prevChapter.subMaterials.length - 1);
    }
    setSidebarOpen(false);
  };

  const hasNext =
    selectedSubMaterial < currentChapter?.subMaterials.length - 1 ||
    selectedChapter < course.chapters.length - 1;

  const hasPrev = selectedSubMaterial > 0 || selectedChapter > 0;

  return (
    <div className="flex h-full bg-background relative overflow-hidden">
      {/* Sidebar Toggle for Mobile */}
      <Button
        variant="default"
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-[60] md:hidden rounded-full w-14 h-14 shadow-2xl transition-all duration-300",
          sidebarOpen ? "bg-destructive rotate-90" : "bg-primary"
        )}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Sidebar - Directory Style */}
      <aside
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-50 w-full md:w-96 bg-card border-r border-border transition-all duration-300 ease-in-out shrink-0",
          sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full md:translate-x-0 opacity-0 md:opacity-100"
        )}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground p-0 h-auto hover:text-primary"
              onClick={() => navigate("/my-courses")}
            >
              <ChevronLeft className="w-3 h-3 mr-1" />
              Back to Library
            </Button>
          </div>
          <h2 className="font-display font-bold text-lg leading-tight">
            {course.title}
          </h2>
        </div>

        <ScrollArea className="h-[calc(100%-14rem)]">
          <nav className="p-4 space-y-1">
            {course.chapters.map((chapter, chapterIndex) => (
              <div key={chapter.id} className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedChapter(chapterIndex);
                    setSelectedSubMaterial(0);
                  }}
                  className={cn(
                    "w-full text-left flex items-start gap-2 px-3 py-2.5 rounded-lg transition-all",
                    selectedChapter === chapterIndex
                      ? "bg-primary/5 text-primary"
                      : "text-foreground/70 hover:bg-secondary/80"
                  )}
                >
                  <div className="shrink-0 mt-1">
                    {selectedChapter === chapterIndex ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  <Folder className={cn("w-4 h-4 shrink-0 mt-1", selectedChapter === chapterIndex ? "fill-current opacity-20" : "")} />
                  <span className="text-sm font-bold whitespace-normal leading-tight">{chapter.title}</span>
                </button>

                {selectedChapter === chapterIndex && (
                  <div className="ml-2 pl-3 border-l border-primary/20 space-y-1 py-1">
                    {chapter.subMaterials.map((sub, subIndex) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setSelectedSubMaterial(subIndex);
                          setSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full text-left flex items-start gap-2 px-3 py-2 rounded-md text-xs transition-colors relative group",
                          selectedSubMaterial === subIndex
                            ? "text-primary font-bold bg-primary/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                      >
                        {selectedSubMaterial === subIndex && (
                          <div className="absolute -left-[13px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                        <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="flex-1 min-w-0 whitespace-normal break-words leading-snug">
                          {sub.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-border mt-auto">
          <Button variant="outline" className="w-full justify-start rounded-none border-2 font-bold" onClick={onNewCourse}>
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            RESET MODULE
          </Button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 overflow-hidden relative">
        <ScrollArea className="h-full w-full">
          <article className="max-w-4xl mx-auto px-4 py-8 md:px-16 md:py-20 w-full break-words">
            {/* Header Meta */}
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-primary mb-4 uppercase">
              <Hash className="w-3 h-3" />
              Chapter {currentChapter?.number} / Sub {selectedSubMaterial + 1}
            </div>

            {/* Sub-material Title */}
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tighter mb-4 text-balance overflow-wrap-anywhere">
              {currentSubMaterial?.title}
            </h1>
            
            <div className="h-1 w-20 bg-primary mb-8 md:mb-12" />

            {/* Content Container */}
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
                    const cleanInlineContent = isInline ? codeContent.replace(/^`|`$/g, "") : codeContent;

                    if (isInline) {
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
                            lineNumberStyle={{ minWidth: '2.5em', paddingRight: '0.5em', color: isBash ? '#858585' : '#a0a0a0', textAlign: 'right', userSelect: 'none', borderRight: '1px solid currentColor', opacity: 0.3, marginRight: '0.5em' }}
                            customStyle={{
                              margin: 0,
                              padding: '1rem', // Reduced padding for better mobile fit
                              fontSize: '0.8rem', // Slightly smaller font for mobile
                              lineHeight: '1.4rem',
                              backgroundColor: 'transparent',
                              minWidth: '100%',
                            }}
                            codeTagProps={{
                              style: {
                                fontFamily: 'inherit',
                                whiteSpace: 'pre-wrap', // Ensure wrapping inside code blocks
                                wordBreak: 'break-all'
                              }
                            }}
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
                {currentSubMaterial?.content || ""}
              </ReactMarkdown>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-16 md:mt-24 pt-8 md:pt-12 border-t-2 border-border w-full">
              <Button
                variant="ghost"
                className="w-full sm:w-auto group h-12 md:h-14 px-6 rounded-none font-bold tracking-tighter hover:bg-secondary"
                onClick={navigatePrev}
                disabled={!hasPrev}
              >
                <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                PREV UNIT
              </Button>
              <Button 
                className="w-full sm:w-auto group h-12 md:h-14 px-8 rounded-none bg-foreground text-background font-bold tracking-tighter hover:bg-primary hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                onClick={navigateNext} 
                disabled={!hasNext}
              >
                NEXT UNIT
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </article>
        </ScrollArea>
      </main>
    </div>
  );
}
