export interface Topic {
  id: string;
  name: string;
  icon: string;
  category: "frontend" | "backend" | "data" | "devops" | "mobile" | "other";
}

export interface PersonalizationQuestion {
  id: string;
  question: string;
  suggestedAnswers: string[];
}

export interface PersonalizationAnswer {
  questionId: string;
  answer: string;
}

export interface SubMaterial {
  id: string;
  title: string;
  content: string; // Markdown content
}

export interface Module {
  id: string;
  title: string;
  subMaterials: SubMaterial[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  modules: Module[];
}

export interface Course {
  id: string;
  userId: string; // Owner ID
  title: string;
  description: string;
  topics: string[];
  chapters: Chapter[];
  createdAt: any;
  isFavorite?: boolean;
  isDeleted?: boolean; // Soft delete flag
}

export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  options?: string[]; // Suggested answers for AI messages
  isTyping?: boolean; // For typewriter effect
}

export interface SyllabusChapter {
  id: string;
  number: number;
  title: string;
  description: string; // Rationale/Goal
  topics: string[]; // Keywords/Sub-concepts
}

export interface CourseGenerationState {
  step: 'topics' | 'personalization' | 'syllabus' | 'generation' | 'complete';
  selectedTopics: string[];
  // ... (keep rest)
  course: Course | null;
  syllabusPlan?: SyllabusChapter[];
}
