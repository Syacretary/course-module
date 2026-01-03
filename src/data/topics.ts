import { Topic } from "@/types/course";

// Helper to get Devicon URL
const devicon = (name: string) => `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}/${name}-original.svg`;

export const RECOMMENDED_TOPICS: Topic[] = [
  // Frontend
  { id: "frontend", name: "Frontend Development", icon: "lucide-layout", category: "frontend" },
  { id: "react", name: "React", icon: devicon("react"), category: "frontend" },
  { id: "vue", name: "Vue.js", icon: devicon("vuejs"), category: "frontend" },
  { id: "angular", name: "Angular", icon: devicon("angularjs"), category: "frontend" },
  
  // Backend
  { id: "backend", name: "Backend Development", icon: "lucide-server", category: "backend" },
  { id: "nodejs", name: "Node.js", icon: devicon("nodejs"), category: "backend" },
  { id: "python", name: "Python", icon: devicon("python"), category: "backend" },
  { id: "golang", name: "Go", icon: devicon("go"), category: "backend" },
  
  // Full Stack & Architecture
  { id: "fullstack", name: "Full Stack", icon: "lucide-layers", category: "backend" },
  { id: "software-architect", name: "Software Architect", icon: "lucide-boxes", category: "backend" },
  
  // DevOps & Security
  { id: "devops", name: "DevOps", icon: "lucide-container", category: "devops" },
  { id: "devsecops", name: "DevSecOps", icon: "lucide-shield-check", category: "devops" },
  { id: "cyber-security", name: "Cyber Security", icon: "lucide-lock", category: "devops" },
  { id: "mlops", name: "MLOps", icon: "lucide-bot", category: "devops" },
  
  // Data & AI
  { id: "data-analyst", name: "Data Analyst", icon: "lucide-bar-chart", category: "data" },
  { id: "data-engineer", name: "Data Engineer", icon: "lucide-database-zap", category: "data" },
  { id: "data-scientist", name: "AI & Data Scientist", icon: "lucide-flask-conical", category: "data" },
  { id: "ai-engineer", name: "AI Engineer", icon: "lucide-brain-circuit", category: "data" },
  { id: "machine-learning", name: "Machine Learning", icon: "lucide-network", category: "data" },
  { id: "bi-analyst", name: "BI Analyst", icon: "lucide-line-chart", category: "data" },
  
  // Database
  { id: "postgresql", name: "PostgreSQL", icon: devicon("postgresql"), category: "backend" },
  { id: "mongodb", name: "MongoDB", icon: devicon("mongodb"), category: "backend" },
  
  // Mobile
  { id: "android", name: "Android", icon: devicon("android"), category: "mobile" },
  { id: "ios", name: "iOS", icon: "lucide-smartphone", category: "mobile" },
  { id: "react-native", name: "React Native", icon: devicon("react"), category: "mobile" },
  { id: "flutter", name: "Flutter", icon: devicon("flutter"), category: "mobile" },
  
  // Other Specializations
  { id: "blockchain", name: "Blockchain", icon: "lucide-blocks", category: "other" },
  { id: "qa", name: "QA Engineer", icon: "lucide-bug", category: "other" },
  { id: "ux-design", name: "UX Design", icon: "lucide-palette", category: "other" },
  { id: "technical-writer", name: "Technical Writer", icon: "lucide-file-text", category: "other" },
  { id: "game-dev", name: "Game Developer", icon: "lucide-gamepad-2", category: "other" },
  { id: "game-server", name: "Server Side Game Dev", icon: "lucide-server-cog", category: "other" },
  { id: "product-manager", name: "Product Manager", icon: "lucide-clipboard-list", category: "other" },
  { id: "engineering-manager", name: "Engineering Manager", icon: "lucide-users", category: "other" },
  { id: "devrel", name: "Developer Relations", icon: "lucide-megaphone", category: "other" },
];

export const TOPIC_CATEGORIES = {
  frontend: "Frontend Development",
  backend: "Backend Development", 
  data: "Data & AI",
  devops: "DevOps & Security",
  mobile: "Mobile Development",
  other: "Specializations",
} as const;
