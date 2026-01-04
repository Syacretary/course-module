import { useParams, useNavigate } from "react-router-dom";
import { useSavedCourses } from "@/hooks/use-saved-courses";
import { CourseViewer } from "@/components/course/CourseViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Course } from "@/types/course";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Header } from "@/components/Header";
import { CursorGlow } from "@/components/CursorGlow";

export default function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses } = useSavedCourses();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      if (!id) return;

      // 1. Try to find in already loaded courses
      const foundInState = courses.find((c) => c.id === id);
      if (foundInState) {
        setCourse(foundInState);
        setLoading(false);
        return;
      }

      // 2. If not in state (direct link), fetch from Firestore
      try {
        const docRef = doc(db, "courses", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCourse({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          } as Course);
        }
      } catch (e) {
        console.error("Error fetching course:", e);
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [id, courses]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Membuka module...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-background">
        <h1 className="text-2xl font-bold">Course tidak ditemukan</h1>
        <Button onClick={() => navigate("/my-courses")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke My Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <CursorGlow />
      <Header />

      <div className="h-screen flex flex-col pt-20 relative z-10">
        <div className="flex-1 overflow-hidden">
          <CourseViewer 
            course={course} 
            onNewCourse={() => navigate("/make-course")} 
          />
        </div>
      </div>
    </div>
  );
}