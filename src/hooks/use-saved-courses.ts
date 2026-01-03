import { useState, useEffect } from "react";
import { Course } from "@/types/course";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useSavedCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCourses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Base Query: If Dev, see all. Else, see own.
    let q;
    if (user.role === 'dev') {
      q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
    } else {
      q = query(
        collection(db, "courses"), 
        where("userId", "==", user.id),
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCourses = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Firestore stores dates as Timestamps, convert to Date
          createdAt: data.createdAt?.toDate() || new Date()
        } as Course;
      });
      setCourses(fetchedCourses);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      toast.error("Gagal memuat data dari cloud.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const deleteCourse = async (id: string) => {
    try {
      const courseRef = doc(db, "courses", id);
      await updateDoc(courseRef, { isDeleted: true });
      toast.success("Course berhasil dihapus (Cloud)");
    } catch (error) {
      toast.error("Gagal menghapus course");
    }
  };

  const restoreCourse = async (id: string) => {
    try {
      const courseRef = doc(db, "courses", id);
      await updateDoc(courseRef, { isDeleted: false });
      toast.success("Course berhasil dipulihkan");
    } catch (error) {
      toast.error("Gagal memulihkan course");
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const course = courses.find(c => c.id === id);
      if (!course) return;
      
      const courseRef = doc(db, "courses", id);
      await updateDoc(courseRef, { isFavorite: !course.isFavorite });
    } catch (error) {
      toast.error("Gagal update favorite");
    }
  };

  const updateCourseTitle = async (id: string, newTitle: string) => {
    try {
      const courseRef = doc(db, "courses", id);
      await updateDoc(courseRef, { title: newTitle });
      toast.success("Judul berhasil diubah");
    } catch (error) {
      toast.error("Gagal mengubah judul");
    }
  };

  return {
    courses,
    loading,
    deleteCourse,
    restoreCourse,
    toggleFavorite,
    updateCourseTitle
  };
}
