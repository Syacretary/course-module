import { 
  Layout, Server, Layers, Boxes, Container, ShieldCheck, Lock, Bot, 
  BarChart, DatabaseZap, FlaskConical, BrainCircuit, Network, LineChart, 
  Smartphone, Blocks, Bug, Palette, FileText, Gamepad2, ServerCog, 
  ClipboardList, Users, Megaphone
} from "lucide-react";

interface TopicIconProps {
  icon: string;
  className?: string;
}

export function TopicIcon({ icon, className }: TopicIconProps) {
  // If it's a URL (Devicon)
  if (icon.startsWith("http") || icon.endsWith(".svg")) {
    return <img src={icon} alt="" className={className} />;
  }

  // Lucide Map
  const map: Record<string, React.ElementType> = {
    "lucide-layout": Layout,
    "lucide-server": Server,
    "lucide-layers": Layers,
    "lucide-boxes": Boxes,
    "lucide-container": Container,
    "lucide-shield-check": ShieldCheck,
    "lucide-lock": Lock,
    "lucide-bot": Bot,
    "lucide-bar-chart": BarChart,
    "lucide-database-zap": DatabaseZap,
    "lucide-flask-conical": FlaskConical,
    "lucide-brain-circuit": BrainCircuit,
    "lucide-network": Network,
    "lucide-line-chart": LineChart,
    "lucide-smartphone": Smartphone,
    "lucide-blocks": Blocks,
    "lucide-bug": Bug,
    "lucide-palette": Palette,
    "lucide-file-text": FileText,
    "lucide-gamepad-2": Gamepad2,
    "lucide-server-cog": ServerCog,
    "lucide-clipboard-list": ClipboardList,
    "lucide-users": Users,
    "lucide-megaphone": Megaphone,
  };

  const IconComponent = map[icon];
  
  if (IconComponent) {
    return <IconComponent className={className} />;
  }

  // Fallback text (should rarely happen if data is correct)
  return <span className={className}>{icon}</span>;
}
