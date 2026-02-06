import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

interface LogoutModalProps {
  open: boolean;
  onComplete: () => void;
}

const LogoutModal = ({ open, onComplete }: LogoutModalProps) => {
  const [phase, setPhase] = useState<'greeting' | 'exiting'>('greeting');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setPhase('greeting');
      
      // After showing the greeting, start exit animation
      const exitTimer = setTimeout(() => {
        setPhase('exiting');
      }, 1500);

      // Complete and redirect after exit animation
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 2000);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(completeTimer);
      };
    } else {
      setIsVisible(false);
    }
  }, [open, onComplete]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-background/95 lg:bg-background/80 lg:backdrop-blur-xl animate-fade-in" />

      {/* Modal Content - all elements animate together */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div 
          className={cn(
            "text-center",
            phase === 'greeting' ? "animate-scale-in" : "opacity-0 transition-opacity duration-300"
          )}
        >
          {/* Logo with glow */}
          <div className="relative mx-auto mb-6">
            <div className="absolute inset-0 w-20 h-20 mx-auto bg-primary/30 rounded-2xl blur-xl" />
            <Logo size="lg" className="relative mx-auto shadow-2xl" />
          </div>

          {/* Greeting text - clean, no emoji */}
          <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-2">
            Até breve!
          </h2>
          <p className="text-muted-foreground text-sm">
            Continue sua jornada rumo ao sucesso
          </p>

          {/* Loading dots */}
          <div className="mt-8 flex justify-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutModal;
