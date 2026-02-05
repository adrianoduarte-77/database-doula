import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { Logo } from "./Logo";
import { useAnimationMode } from "@/hooks/useAnimationMode";
import { cn } from "@/lib/utils";

interface LogoutModalProps {
  open: boolean;
  onComplete: () => void;
}

const LogoutModal = ({ open, onComplete }: LogoutModalProps) => {
  const [phase, setPhase] = useState<'greeting' | 'exiting'>('greeting');
  const [isVisible, setIsVisible] = useState(false);
  const { useCSSAnimations } = useAnimationMode();

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
      {/* Backdrop - no blur on mobile for performance */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] bg-background/95 lg:bg-background/80 lg:backdrop-blur-xl",
          useCSSAnimations ? "animate-mobile-fade-in" : "animate-fade-in"
        )}
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div 
          className={cn(
            "text-center",
            useCSSAnimations 
              ? (phase === 'greeting' ? "animate-mobile-scale-in" : "opacity-0 transition-opacity duration-300")
              : (phase === 'greeting' ? "animate-scale-in" : "opacity-0 transition-opacity duration-300")
          )}
        >
          {/* Logo with glow */}
          <div className={cn(
            "relative mx-auto mb-6",
            useCSSAnimations ? "animate-mobile-scale-in" : "animate-scale-in"
          )}>
            <div className="absolute inset-0 w-20 h-20 mx-auto bg-primary/30 rounded-2xl blur-xl" />
            <Logo size="lg" className="relative mx-auto shadow-2xl" />
          </div>

          {/* Greeting text */}
          <div className={cn(
            useCSSAnimations ? "animate-mobile-slide-up" : "animate-fade-in"
          )} style={{ animationDelay: '200ms' }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Até breve! 👋
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Continue sua jornada rumo ao sucesso
            </p>
          </div>

          {/* Decorative crown */}
          <div 
            className={cn(
              "mt-6 flex justify-center",
              useCSSAnimations ? "animate-mobile-scale-in" : "animate-scale-in"
            )}
            style={{ animationDelay: '400ms' }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
              <Crown className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* Loading dots - CSS animation for better mobile performance */}
          <div className="mt-6 flex justify-center gap-1.5" style={{ animationDelay: '600ms' }}>
            <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutModal;
