import { useState } from "react";
import { RECOMMENDED_TOPICS, TOPIC_CATEGORIES } from "@/data/topics";
import { TopicCard } from "./TopicCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TopicIcon } from "@/components/TopicIcon";
import { cn } from "@/lib/utils";

interface TopicSelectorProps {
  selectedTopics: string[];
  customTopic: string;
  onToggleTopic: (topicId: string) => void;
  onCustomTopicChange: (topic: string) => void;
  onNext: () => void;
  canProceed: boolean;
  isLoading: boolean;
}

export function TopicSelector({
  selectedTopics,
  customTopic,
  onToggleTopic,
  onCustomTopicChange,
  onNext,
  canProceed,
  isLoading,
}: TopicSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const maxTopics = 4;
  const totalSelected = selectedTopics.length + (customTopic ? 1 : 0);

  const groupedTopics = RECOMMENDED_TOPICS.reduce((acc, topic) => {
    if (!acc[topic.category]) {
      acc[topic.category] = [];
    }
    acc[topic.category].push(topic);
    return acc;
  }, {} as Record<string, typeof RECOMMENDED_TOPICS>);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          Apa yang ingin kamu pelajari?
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Pilih hingga {maxTopics} topik yang ingin kamu kuasai. Course akan disesuaikan dengan kombinasi topik pilihanmu.
        </p>
      </div>

      {/* Selected Topics Display */}
      {totalSelected > 0 && (
        <div className="flex flex-wrap gap-2 justify-center p-4 bg-secondary/50 rounded-xl">
          <span className="text-sm text-muted-foreground mr-2">Dipilih:</span>
          {selectedTopics.map((topicId) => {
            const topic = RECOMMENDED_TOPICS.find((t) => t.id === topicId);
            
            return (
              <Badge
                key={topicId}
                variant="default"
                className="cursor-pointer hover:bg-primary/80 gap-1 pl-1"
                onClick={() => onToggleTopic(topicId)}
              >
                <div className="bg-white/10 rounded-full p-1">
                  <TopicIcon 
                    icon={topic?.icon || ""} 
                    className={cn("w-3 h-3", topic?.icon?.startsWith("http") ? "object-contain invert brightness-0" : "")} 
                  />
                </div>
                {topic?.name}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            );
          })}
          {customTopic && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => onCustomTopicChange("")}
            >
              ✏️ {customTopic}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
          <span className="text-sm text-muted-foreground ml-2">
            ({totalSelected}/{maxTopics})
          </span>
        </div>
      )}

      {/* Topic Categories */}
      <div className="space-y-8">
        {Object.entries(TOPIC_CATEGORIES).map(([categoryKey, categoryName]) => {
          const topics = groupedTopics[categoryKey];
          if (!topics) return null;

          return (
            <div key={categoryKey} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground/80">
                {categoryName}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {topics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    isSelected={selectedTopics.includes(topic.id)}
                    onToggle={() => onToggleTopic(topic.id)}
                    disabled={totalSelected >= maxTopics}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Topic Input */}
      <div className="space-y-4">
        {!showCustomInput ? (
          <Button
            variant="outline"
            onClick={() => setShowCustomInput(true)}
            className="w-full sm:w-auto"
            disabled={totalSelected >= maxTopics && !customTopic}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Topik Custom
          </Button>
        ) : (
          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="Ketik topik yang kamu inginkan..."
              value={customTopic}
              onChange={(e) => onCustomTopicChange(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowCustomInput(false);
                onCustomTopicChange("");
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Next Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className="gradient-primary text-primary-foreground px-8 py-6 text-lg font-medium"
        >
          {isLoading ? (
            <>Memuat pertanyaan...</>
          ) : (
            <>
              Lanjutkan
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
