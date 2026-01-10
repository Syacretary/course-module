import { useState } from "react";
import { SyllabusChapter } from "@/types/course";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Check, ArrowRight, Sparkles, X, ChevronDown, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SyllabusPreviewProps {
  chapters: SyllabusChapter[];
  onUpdateChapter: (index: number, chapter: SyllabusChapter) => void;
  onDeleteChapter: (index: number) => void;
  onConfirm: () => void;
}

export function SyllabusPreview({ chapters, onUpdateChapter, onDeleteChapter, onConfirm }: SyllabusPreviewProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const startEdit = (index: number) => {
    setEditingIdx(index);
    setEditTitle(chapters[index].title);
    setEditDesc(chapters[index].description);
  };

  const saveEdit = (index: number) => {
    if (editTitle.trim()) {
      onUpdateChapter(index, {
        ...chapters[index],
        title: editTitle,
        description: editDesc
      });
    }
    setEditingIdx(null);
  };

  const currentChapter = chapters[selectedIdx];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] animate-in fade-in zoom-in duration-700">
      
      {/* MOBILE VIEW: Horizontal Milestone Line with Popups */}
      <div className="md:hidden flex-1 flex flex-col justify-center items-center relative bg-background rounded-3xl shadow-2xl border border-border p-4">
        <h3 className="absolute top-8 text-center w-full font-display font-bold text-xl opacity-50">
          Peta Perjalanan Belajarmu
        </h3>
        
        <ScrollArea className="w-full whitespace-nowrap" orientation="horizontal">
          <div className="flex items-center gap-12 px-12 py-32 min-w-max mx-auto relative">
             {/* Connecting Line */}
             <div className="absolute left-0 right-0 top-1/2 h-1 bg-border -mt-0.5 z-0" />
             
             {chapters.map((chapter, idx) => (
               <Popover key={chapter.id}>
                 <PopoverTrigger asChild>
                   <button 
                     className={cn(
                       "w-16 h-16 rounded-full flex items-center justify-center border-[6px] transition-all duration-300 relative z-10 shrink-0",
                       "bg-background hover:scale-110 focus:scale-110",
                       "border-primary text-primary font-black text-lg shadow-xl",
                       "ring-4 ring-background" // Adds spacing around the dot to "cut" the line visually
                     )}
                   >
                     {idx + 1}
                     {/* Pulse effect for first item */}
                     {idx === 0 && <span className="absolute inset-0 rounded-full animate-ping bg-primary/20 duration-1000" />}
                   </button>
                 </PopoverTrigger>
                 <PopoverContent 
                    className="w-80 p-0 overflow-hidden border-2 shadow-xl" 
                    side={idx % 2 === 0 ? "bottom" : "top"} 
                    align="center" 
                    sideOffset={15}
                 >
                    <div className="bg-primary/5 p-4 border-b border-border/50">
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">MINGGU {idx + 1}</span>
                       <h4 className="font-bold text-lg leading-tight mt-1 whitespace-normal break-words">{chapter.title}</h4>
                    </div>
                    <div className="p-4 bg-background max-h-[300px] overflow-y-auto">
                       <p className="text-sm text-muted-foreground italic mb-4 whitespace-normal break-words">"{chapter.description}"</p>
                       <div className="space-y-2">
                         <h5 className="text-xs font-bold uppercase text-foreground/70">Fokus:</h5>
                         <div className="flex flex-wrap gap-2">
                           {chapter.topics.map((t, i) => (
                             <span key={i} className="text-[10px] px-2 py-1 rounded bg-secondary text-secondary-foreground border whitespace-normal">
                               {t}
                             </span>
                           ))}
                         </div>
                       </div>
                       
                       <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Tap luar untuk tutup</span>
                          <Button variant="ghost" size="sm" className="h-8 text-destructive hover:bg-destructive/10" onClick={() => onDeleteChapter(idx)}>
                            <Trash2 className="w-3 h-3 mr-1" /> Hapus
                          </Button>
                       </div>
                    </div>
                 </PopoverContent>
               </Popover>
             ))}
          </div>
        </ScrollArea>
      </div>

      {/* DESKTOP VIEW: The Main Card - Flexible */}
      <div className="hidden md:flex flex-col md:flex-row flex-1 min-h-0 bg-background rounded-3xl shadow-2xl border border-border overflow-hidden">
        {/* Left Side: Timeline (Vertical on Desktop, Horizontal on Mobile) */}
        <aside className="w-full md:w-80 h-auto md:h-full border-b md:border-b-0 md:border-r border-border bg-secondary/5 flex flex-col relative shrink-0">
          {/* Vertical Line Decoration (Desktop Only) */}
          <div className="absolute left-[35px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/5 via-primary/20 to-transparent z-0 hidden md:block" />
          
          <ScrollArea className="flex-1 w-full" orientation="horizontal">
            <div className="p-4 flex flex-row md:flex-col gap-4 relative z-10 overflow-x-auto md:overflow-x-visible">
              {chapters.map((chapter, idx) => (
                <div
                  key={chapter.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={cn(
                    "min-w-[240px] md:min-w-0 w-full text-left flex gap-4 p-3 rounded-2xl transition-all duration-300 group cursor-pointer border shrink-0",
                    selectedIdx === idx 
                      ? "bg-background border-primary/20 shadow-lg scale-[1.02]" 
                      : "bg-transparent border-transparent hover:bg-background/50 opacity-60 hover:opacity-100"
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedIdx(idx);
                    }
                  }}
                >
                  {/* Number Circle */}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 border-2 transition-all duration-500",
                    selectedIdx === idx 
                      ? "bg-primary border-primary text-white scale-110 shadow-[0_0_15px_rgba(124,58,237,0.4)]" 
                      : "bg-background border-border text-muted-foreground"
                  )}>
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0 py-1">
                    <h4 className={cn(
                      "font-bold text-xs uppercase tracking-wider mb-1 transition-colors",
                      selectedIdx === idx ? "text-primary" : "text-muted-foreground"
                    )}>
                      Minggu {idx + 1}
                    </h4>
                    <p className={cn(
                      "text-sm font-semibold transition-colors leading-tight line-clamp-2",
                      selectedIdx === idx ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {chapter.title}
                    </p>
                  </div>

                  {/* Actions on hover */}
                  <div className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity self-center">
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChapter(idx);
                        if (selectedIdx === idx && idx > 0) setSelectedIdx(idx - 1);
                      }}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Right Side: Detail Panel */}
        <main className="flex-1 p-4 md:p-8 bg-background relative flex flex-col overflow-hidden w-full">
          <AnimatePresence mode="wait">
            {currentChapter && (
              <motion.div
                key={currentChapter.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col"
              >
                <ScrollArea className="flex-1 pr-6">
                  {/* Title & Description Editor */}
                  <div className="mb-10 group relative">
                    {editingIdx === selectedIdx ? (
                      <div className="space-y-4 bg-secondary/10 p-6 rounded-2xl border border-primary/10">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-primary tracking-widest">Judul Modul</label>
                          <Input 
                            value={editTitle} 
                            onChange={e => setEditTitle(e.target.value)} 
                            className="text-2xl font-bold h-12 bg-background border-2 focus-visible:ring-primary/20"
                            autoFocus
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-primary tracking-widest">Tujuan Belajar</label>
                          <Textarea 
                            value={editDesc} 
                            onChange={e => setEditDesc(e.target.value)} 
                            className="min-h-[100px] bg-background border-2"
                          />
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingIdx(null)}>Batal</Button>
                          <Button size="sm" onClick={() => saveEdit(selectedIdx)} className="bg-primary hover:bg-primary/90">
                            <Check className="w-4 h-4 mr-2"/> Simpan Perubahan
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight leading-tight flex-1 break-words">
                            {currentChapter.title}
                          </h1>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 shrink-0 rounded-xl"
                            onClick={() => startEdit(selectedIdx)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xl text-muted-foreground leading-relaxed italic">
                          "{currentChapter.description}"
                        </p>
                      </>
                    )}
                  </div>

                  <div className="h-px w-full bg-gradient-to-r from-border via-transparent to-transparent mb-10" />

                  {/* Focus Material List */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-primary" />
                      <h3 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Fokus Utama Materi
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentChapter.topics.map((topic, i) => (
                        <div 
                          key={i} 
                          className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-all group/item"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary/40 group-hover/item:bg-primary group-hover/item:scale-125 transition-all" />
                          <span className="text-sm font-medium text-foreground/80">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>

              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* External CTA Section - Compact */}
      <div className="mt-4 flex flex-col items-center justify-center animate-in slide-in-from-bottom-4 duration-700 delay-300 gap-2 pb-2 shrink-0">
        <p className="text-muted-foreground font-medium text-sm">
          Puas dengan rencana ini? Mari kita buat materinya.
        </p>
        <Button 
          size="lg" 
          className="h-14 px-12 text-lg font-black tracking-tight rounded-full shadow-2xl hover:scale-105 hover:shadow-primary/20 transition-all bg-gradient-to-r from-primary via-purple-600 to-pink-600 border-none group"
          onClick={onConfirm}
        >
          Looks Good, Let's Start!
          <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
