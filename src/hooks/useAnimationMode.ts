import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';

/**
 * Hook that determines whether to use CSS animations (mobile) or framer-motion (desktop).
 * 
 * On mobile devices, framer-motion causes jank because:
 * 1. JavaScript-driven animations compete with the main thread
 * 2. React re-renders during animation frames
 * 3. Mobile GPUs handle CSS transforms better than JS calculations
 * 
 * This hook returns:
 * - useCSSAnimations: true if we should use CSS animations (mobile/reduced motion)
 * - animationClass: The CSS class to use for the animation type
 * - getDelayStyle: Helper to add animation delay
 */

export type AnimationType = 
  | 'slide-up'
  | 'slide-left'
  | 'slide-right'
  | 'fade-in'
  | 'scale-in';

const CSS_ANIMATION_MAP: Record<AnimationType, string> = {
  'slide-up': 'animate-mobile-slide-up',
  'slide-left': 'animate-mobile-slide-left',
  'slide-right': 'animate-mobile-slide-right',
  'fade-in': 'animate-mobile-fade-in',
  'scale-in': 'animate-mobile-scale-in',
};

export function useAnimationMode() {
  const isMobile = useIsMobile();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Use CSS animations on mobile OR if user prefers reduced motion
  const useCSSAnimations = isMobile || prefersReducedMotion;

  const getAnimationClass = (type: AnimationType = 'slide-up') => {
    return useCSSAnimations ? CSS_ANIMATION_MAP[type] : '';
  };

  const getDelayStyle = (delayMs: number) => {
    return useCSSAnimations ? { animationDelay: `${delayMs}ms` } : {};
  };

  return {
    isMobile,
    useCSSAnimations,
    getAnimationClass,
    getDelayStyle,
    // Framer motion should only be used when this is false
    useFramerMotion: !useCSSAnimations,
  };
}

/**
 * Simple wrapper for step content that handles mobile/desktop animations
 */
export function getStepAnimationProps(useCSSAnimations: boolean, animationType: AnimationType = 'slide-up') {
  if (useCSSAnimations) {
    return {
      className: CSS_ANIMATION_MAP[animationType],
      style: {},
    };
  }
  
  // Return framer-motion compatible props
  return {
    initial: { opacity: 0, y: animationType === 'slide-up' ? 20 : 0, x: animationType === 'slide-left' ? -20 : animationType === 'slide-right' ? 20 : 0 },
    animate: { opacity: 1, y: 0, x: 0 },
    exit: { opacity: 0, y: animationType === 'slide-up' ? -20 : 0 },
    transition: { duration: 0.3 },
  };
}
