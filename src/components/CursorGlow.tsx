import { useEffect, useRef } from "react";
import anime from "animejs/lib/anime.es.js";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    // Initial Hide
    glow.style.opacity = "0";

    const handleMouseMove = (e: MouseEvent) => {
      // Reveal on first move
      glow.style.opacity = "1";
      
      // Animate with delay (lag)
      anime({
        targets: glow,
        translateX: e.clientX - 150, // Center the 300px glow
        translateY: e.clientY - 150,
        duration: 800, // Lag duration
        easing: 'easeOutExpo'
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={glowRef}
      className="fixed top-0 left-0 w-[300px] h-[300px] rounded-full bg-primary/20 blur-[100px] pointer-events-none z-0 mix-blend-screen"
      style={{ willChange: 'transform' }}
    />
  );
}
