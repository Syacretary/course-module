import { cn } from "@/lib/utils";
import { Topic } from "@/types/course";
import { Check } from "lucide-react";
import { TopicIcon } from "@/components/TopicIcon";

interface TopicCardProps {
  topic: Topic;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function TopicCard({ topic, isSelected, onToggle, disabled }: TopicCardProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled && !isSelected}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50",
        "min-h-[100px] w-full",
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:border-primary/50",
        disabled && !isSelected && "opacity-50 cursor-not-allowed"
      )}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
      
      <TopicIcon 
        icon={topic.icon} 
        className={cn("w-8 h-8 mb-2", topic.icon.startsWith("http") ? "object-contain" : "text-primary")} 
      />

      <span className={cn(
        "text-sm font-medium text-center",
        isSelected ? "text-primary" : "text-foreground"
      )}>
        {topic.name}
      </span>
    </button>
  );
}
