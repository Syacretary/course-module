import { useState } from "react";
import { useSavedCourses } from "@/hooks/use-saved-courses";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { NavLink } from "@/components/NavLink";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Heart, Trash2, Edit2, Play, BookOpen, LogOut, User as UserIcon, Shield, Undo2, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { RECOMMENDED_TOPICS } from "@/data/topics";
import { TopicIcon } from "@/components/TopicIcon";
import { Header } from "@/components/Header";
import { CursorGlow } from "@/components/CursorGlow";

export default function MyCourses() {
  const { user } = useAuth();
  const { courses, deleteCourse, restoreCourse, toggleFavorite, updateCourseTitle } = useSavedCourses();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      updateCourseTitle(editingId, editTitle);
      setEditingId(null);
    }
  };

  const [draftState, setDraftState] = useState<any>(null);

  // Check for drafts on mount
  useState(() => {
    try {
      const saved = localStorage.getItem("draft_course_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.step !== "topics" && parsed.step !== "complete") {
          setDraftState(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load draft", e);
    }
  });

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <CursorGlow />
      <Header />

      <div className="max-w-6xl mx-auto space-y-8 pt-24 px-6 md:px-12 relative z-10">
        
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold">Kurikura Library</h1>
          <p className="text-muted-foreground">
            {user?.role === 'dev' 
              ? `Developer Mode: Viewing all courses (${courses.length})`
              : `Koleksi materi pembelajaran milik ${user?.username || user?.email}`
            }
          </p>
        </div>

        {/* Draft Section */}
        {draftState && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
            <div>
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sedang Dibuat
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                Anda memiliki modul yang belum selesai: 
                <span className="font-medium text-foreground ml-1">
                  {draftState.selectedTopics.map((id: string) => 
                    RECOMMENDED_TOPICS.find(t => t.id === id)?.name || id
                  ).join(", ")}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                if(confirm("Yakin ingin menghapus draft ini?")) {
                  localStorage.removeItem("draft_course_state");
                  setDraftState(null);
                }
              }}>
                Batal
              </Button>
              <Button onClick={() => navigate("/make-course")}>
                Lanjutkan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
            <h3 className="text-xl font-medium mb-2">Belum ada course</h3>
            <p className="text-muted-foreground mb-6">
              Mulai perjalanan belajar Anda dengan membuat course pertama.
            </p>
            <Button onClick={() => navigate("/make-course")}>
              Mulai Sekarang
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isDeleted = course.isDeleted;
              return (
                <Card 
                  key={course.id} 
                  className={cn(
                    "flex flex-col group transition-all",
                    isDeleted ? "opacity-60 border-destructive/50 bg-destructive/5" : "hover:border-primary/50"
                  )}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <CardTitle className="line-clamp-2 leading-tight">
                        {isDeleted && <span className="text-destructive text-sm font-mono block mb-1">[DELETED]</span>}
                        {course.title}
                      </CardTitle>
                      {!isDeleted && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8 shrink-0 transition-colors",
                            course.isFavorite ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"
                          )}
                          onClick={() => toggleFavorite(course.id)}
                        >
                          <Heart className={cn("h-5 w-5", course.isFavorite && "fill-current")} />
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {course.topics.slice(0, 3).map(tid => {
                        const topic = RECOMMENDED_TOPICS.find(t => t.id === tid);
                        if (!topic) return null;
                        
                        if (topic.icon.startsWith("http") || topic.icon.endsWith(".svg")) {
                          return <img src={topic.icon} alt={topic.name} className="w-4 h-4 object-contain" />;
                        }
                        return <span>{topic.icon}</span>;
                      })}
                      {course.topics.length > 3 && (
                        <span className="text-xs text-muted-foreground self-center">
                          +{course.topics.length - 3}
                        </span>
                      )}
                    </div>
                    {user?.role === 'dev' && (
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                        Owner: {course.userId}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {course.description}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{course.chapters.length} Bab</span>
                      <span>•</span>
                      <span>{format(course.createdAt, "d MMMM yyyy", { locale: id })}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 gap-2">
                    {isDeleted ? (
                      <Button 
                        variant="outline" 
                        className="w-full text-primary hover:text-primary"
                        onClick={() => restoreCourse(course.id)}
                      >
                        <Undo2 className="w-4 h-4 mr-2" />
                        Restore (Dev Only)
                      </Button>
                    ) : (
                      <>
                        <Button 
                          className="flex-1" 
                          onClick={() => navigate(`/course/${course.id}`)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Buka
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => startEdit(course.id, course.title)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm("Yakin ingin menghapus course ini?")) {
                              deleteCourse(course.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ubah Judul Course</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Masukkan judul baru..."
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingId(null)}>
                Batal
              </Button>
              <Button onClick={handleSaveEdit}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
