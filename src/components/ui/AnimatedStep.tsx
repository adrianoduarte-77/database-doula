import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAnimationMode, AnimationType } from '@/hooks/useAnimationMode';
import { cn } from '@/lib/utils';

interface AnimatedStepProps {
  children: ReactNode;
  stepKey: string;
  animation?: AnimationType;
  delay?: number;
  className?: string;
}

/**
 * AnimatedStep: Performance-optimized step container
 * 
 * - On mobile: Uses CSS animations (GPU-accelerated, 60fps)
 * - On desktop: Uses framer-motion (full feature set)
 * 
 * Use this for form steps, card transitions, and any content that animates in.
 */
export function AnimatedStep({
  children,
  stepKey,
  animation = 'slide-up',
  delay = 0,
  className = '',
}: AnimatedStepProps) {
  const { useCSSAnimations, getAnimationClass } = useAnimationMode();

  // Mobile: Use CSS animations (hardware-accelerated)
  if (useCSSAnimations) {
    const animClass = getAnimationClass(animation);
    const style = delay > 0 ? { animationDelay: `${delay}ms` } : {};

    return (
      <div 
        key={stepKey}
        className={cn(animClass, className)}
        style={style}
      >
        {children}
      </div>
    );
  }

  // Desktop: Use framer-motion
  const motionVariants = {
    'slide-up': {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    'slide-left': {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
    'slide-right': {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    'fade-in': {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    'scale-in': {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
  };

  const variant = motionVariants[animation];

  return (
    <motion.div
      key={stepKey}
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedCard: For cards that animate in with stagger
 */
interface AnimatedCardProps {
  children: ReactNode;
  index?: number;
  animation?: AnimationType;
  className?: string;
}

export function AnimatedCard({
  children,
  index = 0,
  animation = 'slide-up',
  className = '',
}: AnimatedCardProps) {
  const { useCSSAnimations, getAnimationClass } = useAnimationMode();
  const delay = index * 100; // 100ms stagger

  if (useCSSAnimations) {
    const animClass = getAnimationClass(animation);
    return (
      <div 
        className={cn(animClass, className)}
        style={{ animationDelay: `${delay}ms` }}
      >
        {children}
      </div>
    );
  }

  const motionVariants = {
    'slide-up': { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
    'slide-left': { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } },
    'slide-right': { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 } },
    'fade-in': { initial: { opacity: 0 }, animate: { opacity: 1 } },
    'scale-in': { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } },
  };

  const variant = motionVariants[animation];

  return (
    <motion.div
      initial={variant.initial}
      animate={variant.animate}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
