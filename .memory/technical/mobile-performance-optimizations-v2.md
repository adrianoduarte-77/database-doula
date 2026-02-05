# Memory: technical/mobile-performance-optimizations-v2
Updated: 2026-02-05

## Otimizações de Performance Mobile - Versão 2

### Arquitetura CSS-First
A estratégia principal é usar **animações CSS** (hardware-accelerated) no mobile em vez de `framer-motion` (JavaScript-based) para garantir 60fps.

### Componentes Criados

#### 1. `useAnimationMode` Hook (`src/hooks/useAnimationMode.ts`)
Hook que detecta se deve usar CSS ou framer-motion:
```tsx
const { useCSSAnimations, getAnimationClass, getDelayStyle } = useAnimationMode();
```

#### 2. `AnimatedStep` Component (`src/components/ui/AnimatedStep.tsx`)
Wrapper que renderiza automaticamente CSS no mobile e framer-motion no desktop:
```tsx
<AnimatedStep stepKey="step-1" animation="slide-up" className="...">
  {content}
</AnimatedStep>
```

### Componentes Otimizados
- `Stage4Guide.tsx` - Todas as transições de step usam AnimatedStep
- `InterviewTraining.tsx` - Steps do treinamento com CSS animations
- `LogoutModal.tsx` - Modal de logout com CSS transitions
- `ChatInterface.tsx` - Mensagens com CSS slide-up

### Animações CSS Disponíveis (`src/index.css`)
- `.animate-mobile-slide-up` - Slide de baixo para cima
- `.animate-mobile-slide-left` - Slide da esquerda
- `.animate-mobile-slide-right` - Slide da direita
- `.animate-mobile-fade-in` - Fade in simples
- `.animate-mobile-scale-in` - Scale com fade
- `.animate-sidebar-slide-in` - Slide da sidebar

### Padrões de Migração
Para migrar um componente de framer-motion para CSS-first:

1. Importe o componente:
```tsx
import { AnimatedStep } from "@/components/ui/AnimatedStep";
```

2. Substitua `motion.div` por `AnimatedStep`:
```tsx
// Antes
<motion.div initial={{...}} animate={{...}}>
// Depois
<AnimatedStep stepKey="unique-key" animation="slide-up">
```

3. Para progress bars, use CSS `transition`:
```tsx
<div 
  className="transition-all duration-300 ease-out"
  style={{ width: `${progress}%` }}
/>
```

### Regras
- ❌ NÃO use `AnimatePresence` diretamente - o AnimatedStep cuida disso
- ❌ NÃO use `motion.div` para transições de step no mobile
- ✅ USE CSS animations para loading states (animate-pulse, animate-spin)
- ✅ USE AnimatedStep para qualquer conteúdo que transiciona
