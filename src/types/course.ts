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

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subMaterials: SubMaterial[];
}

export interface Course {
  id: string;
  userId: string; // Owner ID
  title: string;
  description: string;
  topics: string[];
  chapters: Chapter[];
  createdAt: Date;
  isFavorite?: boolean;
  isDeleted?: boolean; // Soft delete flag
}

export interface CourseGenerationState {
  step: "topics" | "personalization" | "generating" | "complete";
  selectedTopics: string[];
  customTopic: string;
  questions: PersonalizationQuestion[];
  answers: PersonalizationAnswer[];
  generationProgress: {
    phase: string;
    current: number;
    total: number;
  };
  course: Course | null;
}
