import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CourseGenerationState, Course, SyllabusChapter } from "@/types/course";
import { generatePersonalizationQuestions, generateFullCourse } from "@/lib/course-agents";
import { generateSyllabusBlueprint } from "@/lib/syllabus-agent";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";

import { collection, addDoc, Timestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CourseGenerationContextType {
  state: CourseGenerationState;
  isLoading: boolean;
  error: string | null;
  toggleTopic: (topicId: string) => void;
  setCustomTopic: (topic: string) => void;
  proceedToPersonalization: () => Promise<void>;
  setAnswer: (questionId: string, answer: string) => void;
  generateSyllabus: () => Promise<void>;
  setSyllabus: (plan: SyllabusChapter[]) => void;
  updateSyllabusChapter: (index: number, chapter: SyllabusChapter) => void;
  deleteSyllabusChapter: (index: number) => void;
  startCourseGeneration: () => Promise<void>;
  reset: () => void;
  startNewSession: (topic: string) => void;
  canProceedToPersonalization: boolean;
  canStartGeneration: boolean;
}

const CourseGenerationContext = createContext<CourseGenerationContextType | undefined>(undefined);

const initialState: CourseGenerationState = {
  step: "topics",
  selectedTopics: [],
  customTopic: "",
  questions: [],
  answers: [],
  generationProgress: {
    phase: "",
    current: 0,
    total: 0,
  },
  course: null,
  syllabusPlan: undefined
};

export function CourseGenerationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<CourseGenerationState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDraftKey = (uid: string | undefined) => uid ? `draft_course_state_${uid}` : "draft_course_state_guest";

  // Load draft when user changes
  useEffect(() => {
    try {
      const key = getDraftKey(user?.id);
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Validation: Prevent zombie states
        if (parsed.step === 'syllabus' && (!parsed.syllabusPlan || parsed.syllabusPlan.length === 0)) {
          console.warn("Found broken syllabus state, reverting to personalization.");
          parsed.step = 'personalization';
        }

        setState(parsed);
      } else {
        setState(initialState);
      }
    } catch (e) {
      console.error("Failed to load draft state", e);
    }
  }, [user?.id]);

  // Save state to localStorage on change
  useEffect(() => {
    const key = getDraftKey(user?.id);
    localStorage.setItem(key, JSON.stringify(state));
  }, [state, user?.id]);

  const toggleTopic = useCallback((topicId: string) => {
    setState((prev) => {
      const isSelected = prev.selectedTopics.includes(topicId);
      if (isSelected) {
        return {
          ...prev,
          selectedTopics: prev.selectedTopics.filter((t) => t !== topicId),
        };
      }
      if (prev.selectedTopics.length >= 4) {
        return prev;
      }
      return {
        ...prev,
        selectedTopics: [...prev.selectedTopics, topicId],
      };
    });
  }, []);

  const setCustomTopic = useCallback((topic: string) => {
    setState((prev) => ({ ...prev, customTopic: topic }));
  }, []);

  const proceedToPersonalization = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allTopics = [
        ...state.selectedTopics,
        ...(state.customTopic ? [state.customTopic] : []),
      ];
      
      const questions = await generatePersonalizationQuestions(allTopics);
      
      setState((prev) => ({
        ...prev,
        step: "personalization",
        questions,
        answers: questions.map((q) => ({ questionId: q.id, answer: "" })),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate questions");
    } finally {
      setIsLoading(false);
    }
  }, [state.selectedTopics, state.customTopic]);

  const setAnswer = useCallback((questionId: string, answer: string) => {
    setState((prev) => ({
      ...prev,
      answers: prev.answers.map((a) =>
        a.questionId === questionId ? { ...a, answer } : a
      ),
    }));
  }, []);

  // Generate Syllabus Blueprint
  const generateSyllabus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const topics = state.customTopic || state.selectedTopics.join(", ");
      const answersWithQuestions = state.answers.map((a) => ({
        question: state.questions.find((q) => q.id === a.questionId)?.question || "",
        answer: a.answer,
      }));

      const plan = await generateSyllabusBlueprint(topics, answersWithQuestions);
      
      setState(prev => ({
        ...prev,
        step: 'syllabus',
        syllabusPlan: plan
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyusun silabus");
    } finally {
      setIsLoading(false);
    }
  }, [state.customTopic, state.selectedTopics, state.answers, state.questions]);

  const setSyllabus = useCallback((plan: SyllabusChapter[]) => {
    setState(prev => ({ ...prev, syllabusPlan: plan }));
  }, []);

  const updateSyllabusChapter = useCallback((index: number, chapter: SyllabusChapter) => {
    setState(prev => {
      const newPlan = [...(prev.syllabusPlan || [])];
      newPlan[index] = chapter;
      return { ...prev, syllabusPlan: newPlan };
    });
  }, []);

  const deleteSyllabusChapter = useCallback((index: number) => {
    setState(prev => {
      const newPlan = [...(prev.syllabusPlan || [])];
      newPlan.splice(index, 1);
      return { 
        ...prev, 
        syllabusPlan: newPlan.map((c, i) => ({ ...c, number: i + 1 })) 
      };
    });
  }, []);

  const startCourseGeneration = useCallback(async () => {
    if (!user) {
      setError("Please login to generate a course");
      return;
    }

    setIsLoading(true);
    setError(null);
    setState((prev) => ({ ...prev, step: "generation" }));

    try {
      const allTopics = [
        ...state.selectedTopics,
        ...(state.customTopic ? [state.customTopic] : []),
      ];

      const answersWithQuestions = state.answers.map((a) => ({
        question: state.questions.find((q) => q.id === a.questionId)?.question || "",
        answer: a.answer,
      }));

      // Create Initial Draft Document in Firestore
      const draftData = {
        userId: user.id,
        title: `Draft: ${allTopics.join(", ")}`,
        description: "Sedang dikerjakan...",
        topics: allTopics,
        chapters: [],
        createdAt: Timestamp.now(),
        isDeleted: false,
        isFavorite: false,
        status: "generating"
      };

      const docRef = await addDoc(collection(db, "courses"), draftData);
      const currentChapters: any[] = [];

      const courseData = await generateFullCourse(
        allTopics,
        answersWithQuestions,
        (phase, current, total) => {
          setState((prev) => ({
            ...prev,
            generationProgress: { phase, current, total },
          }));
        },
        async (finishedChapter) => {
          currentChapters.push(finishedChapter);
          await updateDoc(docRef, {
            chapters: currentChapters,
            title: `Kurikulum ${allTopics[0]} - ${currentChapters.length}/${state.syllabusPlan?.length || 6} Bab`
          });
        },
        state.syllabusPlan
      );

      // Final Update to Course
      const course: Course = {
        id: docRef.id,
        userId: user.id,
        title: courseData.title,
        description: courseData.description,
        topics: allTopics,
        chapters: courseData.chapters,
        createdAt: new Date(),
        isFavorite: false,
        isDeleted: false
      };

      await updateDoc(docRef, {
        title: courseData.title,
        description: courseData.description,
        chapters: courseData.chapters,
        status: "complete"
      });

      setState((prev) => ({
        ...prev,
        step: "complete",
        course,
      }));

      const key = getDraftKey(user.id);
      localStorage.removeItem(key);

    } catch (err) {
      console.error("Generation failed:", err);
      setError(err instanceof Error ? err.message : "Failed to generate course");
      setState((prev) => ({ ...prev, step: "personalization" }));
    } finally {
      setIsLoading(false);
    }
  }, [state.selectedTopics, state.customTopic, state.questions, state.answers, user, state.syllabusPlan]);

  const reset = useCallback(() => {
    setState(initialState);
    const key = getDraftKey(user?.id);
    localStorage.removeItem(key);
    setError(null);
  }, [user?.id]);

  const startNewSession = useCallback((topic: string) => {
    setState({
      ...initialState,
      customTopic: topic,
    });
    const key = getDraftKey(user?.id);
    localStorage.removeItem(key);
    setError(null);
  }, [user?.id]);

  const canProceedToPersonalization = 
    state.selectedTopics.length > 0 || state.customTopic.trim() !== "";

  const canStartGeneration = 
    state.answers.every((a) => a.answer.trim() !== "");

  return (
    <CourseGenerationContext.Provider value={{
      state,
      isLoading,
      error,
      toggleTopic,
      setCustomTopic,
      proceedToPersonalization,
      setAnswer,
      generateSyllabus,
      setSyllabus,
      updateSyllabusChapter,
      deleteSyllabusChapter,
      startCourseGeneration,
      reset,
      startNewSession,
      canProceedToPersonalization,
      canStartGeneration
    }}>
      {children}
    </CourseGenerationContext.Provider>
  );
}

export function useCourseGenerator() {
  const context = useContext(CourseGenerationContext);
  if (context === undefined) {
    throw new Error("useCourseGenerator must be used within a CourseGenerationProvider");
  }
  return context;
}
