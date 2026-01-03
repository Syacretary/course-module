import { useState } from "react";
import { Course, Chapter, SubMaterial } from "@/types/course";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, BookOpen, Menu, X, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

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
      className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
      onClick={copy}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
};

export function CourseViewer({ course, onNewCourse }: CourseViewerProps) {
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [selectedSubMaterial, setSelectedSubMaterial] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentChapter = course.chapters[selectedChapter];
  const currentSubMaterial = currentChapter?.subMaterials[selectedSubMaterial];

  const navigateNext = () => {
    if (selectedSubMaterial < currentChapter.subMaterials.length - 1) {
      setSelectedSubMaterial((prev) => prev + 1);
    } else if (selectedChapter < course.chapters.length - 1) {
      setSelectedChapter((prev) => prev + 1);
      setSelectedSubMaterial(0);
    }
  };

  const navigatePrev = () => {
    if (selectedSubMaterial > 0) {
      setSelectedSubMaterial((prev) => prev - 1);
    } else if (selectedChapter > 0) {
      setSelectedChapter((prev) => prev - 1);
      const prevChapter = course.chapters[selectedChapter - 1];
      setSelectedSubMaterial(prevChapter.subMaterials.length - 1);
    }
  };

  const hasNext =
    selectedSubMaterial < currentChapter?.subMaterials.length - 1 ||
    selectedChapter < course.chapters.length - 1;

  const hasPrev = selectedSubMaterial > 0 || selectedChapter > 0;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar Toggle for Mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-20 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-40 w-72 bg-card border-r border-border transition-transform duration-300",
          "md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-bold text-lg line-clamp-2">
            {course.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {course.chapters.length} Bab
          </p>
        </div>

        <ScrollArea className="h-[calc(100%-8rem)]">
          <nav className="p-2">
            {course.chapters.map((chapter, chapterIndex) => (
              <div key={chapter.id} className="mb-2">
                <button
                  onClick={() => {
                    setSelectedChapter(chapterIndex);
                    setSelectedSubMaterial(0);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors",
                    "hover:bg-secondary/80",
                    selectedChapter === chapterIndex
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/80"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono opacity-60">
                      {String(chapter.number).padStart(2, "0")}
                    </span>
                    <span className="text-sm">{chapter.title}</span>
                  </div>
                </button>

                {selectedChapter === chapterIndex && (
                  <div className="ml-6 mt-1 space-y-1">
                    {chapter.subMaterials.map((sub, subIndex) => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubMaterial(subIndex)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                          "hover:bg-secondary/50",
                          selectedSubMaterial === subIndex
                            ? "bg-secondary text-foreground font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {sub.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full" onClick={onNewCourse}>
            <BookOpen className="w-4 h-4 mr-2" />
            Course Baru
          </Button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <article className="max-w-4xl mx-auto px-6 py-8 md:px-12">
            {/* Breadcrumb */}
            <div className="text-sm text-muted-foreground mb-6">
              Bab {currentChapter?.number} / {currentSubMaterial?.title}
            </div>

            {/* Chapter Title */}
            <h1 className="text-3xl font-display font-bold mb-2">
              {currentChapter?.title}
            </h1>

            {/* Sub-material Title */}
            <h2 className="text-xl font-semibold text-primary mb-8">
              {currentSubMaterial?.title}
            </h2>

            {/* Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none 
              prose-headings:font-display prose-headings:font-bold 
              prose-h3:mt-12 prose-h3:mb-6 prose-h4:mt-8 prose-h4:mb-4
              prose-p:leading-relaxed prose-p:text-foreground/90
              prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h3: ({ children }) => <h3 className="text-2xl border-b border-border/50 pb-2 mb-6">{children}</h3>,
                  h4: ({ children }) => <h4 className="text-xl font-semibold mt-8 mb-4">{children}</h4>,
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match;
                    const codeContent = String(children).replace(/\n$/, "");

                    return isInline ? (
                      <code
                        className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono font-medium text-primary"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <div className="relative group my-8">
                        <div className="absolute left-4 -top-3 px-2 py-0.5 bg-background border border-border rounded text-[10px] font-mono text-muted-foreground uppercase tracking-wider z-10">
                          {match[1]}
                        </div>
                        <CopyButton value={codeContent} />
                        <pre className="bg-[#1e1e1e] border border-border rounded-xl p-5 overflow-x-auto pt-8 shadow-sm">
                          <code className={cn("text-sm font-mono text-gray-300", className)} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  },
                  pre: ({ children }) => <>{children}</>,
                }}
              >
                {currentSubMaterial?.content || ""}
              </ReactMarkdown>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
              <Button
                variant="outline"
                onClick={navigatePrev}
                disabled={!hasPrev}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Sebelumnya
              </Button>
              <Button onClick={navigateNext} disabled={!hasNext}>
                Selanjutnya
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </article>
        </ScrollArea>
      </main>
    </div>
  );
}
