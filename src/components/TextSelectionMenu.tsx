import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextSelectionMenuProps {
  onAskAI: (text: string) => void;
}

export function TextSelectionMenu({ onAskAI }: TextSelectionMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || text.length === 0) {
        setPosition(null);
        setSelectedText("");
        return;
      }

      // Detect if selection is inside main content area
      const range = selection?.getRangeAt(0);
      const container = range?.commonAncestorContainer;
      const element = container?.nodeType === 1 ? (container as Element) : container?.parentElement;

      const isInsideMain = element?.closest("#main-content-area") || element?.closest("#mobile-content-area");
      const isInsideSidebar = element?.closest("aside") || element?.closest(".chat-sidebar");

      if (!isInsideMain || isInsideSidebar) {
        setPosition(null);
        return;
      }

      const rect = range?.getBoundingClientRect();
      if (rect) {
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + window.scrollY - 40,
        });
        setSelectedText(text);
      }
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  // Handle click outside to dismiss
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setPosition(null);
      }
    };
    if (position) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [position]);

  if (!position) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] -translate-x-1/2 animate-in fade-in zoom-in duration-200"
      style={{ left: position.x, top: position.y }}
    >
      <button
        onClick={() => {
          onAskAI(selectedText);
          setPosition(null);
          window.getSelection()?.removeAllRanges();
        }}
        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full shadow-2xl border border-white/20 hover:bg-primary transition-all active:scale-95"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-xs font-bold whitespace-nowrap">Tanya ke AI</span>
      </button>
    </div>
  );
}