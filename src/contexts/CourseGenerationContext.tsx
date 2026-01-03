import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CourseGenerationState, Course } from "@/types/course";
import { generatePersonalizationQuestions, generateFullCourse } from "@/lib/course-agents";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";

import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CourseGenerationContextType {
  state: CourseGenerationState;
  isLoading: boolean;
  error: string | null;
  toggleTopic: (topicId: string) => void;
  setCustomTopic: (topic: string) => void;
  proceedToPersonalization: () => Promise<void>;
  setAnswer: (questionId: string, answer: string) => void;
  startCourseGeneration: () => Promise<void>;
  reset: () => void;
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
};

export function CourseGenerationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Initialize state from localStorage if available (Persistence)
  const [state, setState] = useState<CourseGenerationState>(() => {
    try {
      const saved = localStorage.getItem("draft_course_state");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load draft state", e);
    }
    return initialState;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save state to localStorage on change
  useEffect(() => {
    localStorage.setItem("draft_course_state", JSON.stringify(state));
  }, [state]);

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

  const startCourseGeneration = useCallback(async () => {
    if (!user) {
      setError("Please login to generate a course");
      return;
    }

    setIsLoading(true);
    setError(null);
    setState((prev) => ({ ...prev, step: "generating" }));

    try {
      const allTopics = [
        ...state.selectedTopics,
        ...(state.customTopic ? [state.customTopic] : []),
      ];

      const answersWithQuestions = state.answers.map((a) => ({
        question: state.questions.find((q) => q.id === a.questionId)?.question || "",
        answer: a.answer,
      }));

      const courseData = await generateFullCourse(
        allTopics,
        answersWithQuestions,
        (phase, current, total) => {
          setState((prev) => ({
            ...prev,
            generationProgress: { phase, current, total },
          }));
        }
      );

      const courseDataToSave = {
        userId: user.id,
        title: courseData.title,
        description: courseData.description,
        topics: allTopics,
        chapters: courseData.chapters,
        createdAt: Timestamp.now(),
        isDeleted: false,
        isFavorite: false
      };

      const docRef = await addDoc(collection(db, "courses"), courseDataToSave);

      const course: Course = {
        id: docRef.id,
        ...courseDataToSave,
        createdAt: new Date(),
      };

      setState((prev) => ({
        ...prev,
        step: "complete",
        course,
      }));

      // Clear draft
      localStorage.removeItem("draft_course_state");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate course");
      // Don't reset state fully so user can retry
      setState((prev) => ({ ...prev, step: "personalization" }));
    } finally {
      setIsLoading(false);
    }
  }, [state.selectedTopics, state.customTopic, state.questions, state.answers, user]);

  const reset = useCallback(() => {
    setState(initialState);
    localStorage.removeItem("draft_course_state");
    setError(null);
  }, []);

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
      startCourseGeneration,
      reset,
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