# Memory: technical/mobile-performance-optimizations-v2
Updated: 2026-02-05

## Otimizações de Performance Mobile - Versão 2

### Arquitetura CSS-First
A estratégia principal é usar **animações CSS** (hardware-accelerated) no mobile em vez de `framer-motion` (JavaScript-based) para garantir 60fps.

### Componentes Otimizados
- `GupyGuide.tsx` (Etapa 6) - Todos os steps usam StepContainer
- `Stage7Guide.tsx` (Etapa 7) - Steps 1, 2, 3 e 5 usam StepContainer
- `Stage4Guide.tsx` - AnimatedStep
- `InterviewTraining.tsx` - CSS animations
- `SkillsStepWithMentor` - CSS no mobile para guia e conversação

### Padrão: StepContainer
Componente inline que alterna entre CSS e framer-motion:
```tsx
const StepContainer = ({ stepKey, children, useCSSAnimations, className }) => {
  if (useCSSAnimations) {
    return <div className={`animate-mobile-slide-up ${className}`}>{children}</div>;
  }
  return <motion.div variants={fadeInUp} ...>{children}</motion.div>;
};
```

### Animações CSS (`src/index.css`)
- `.animate-mobile-slide-up` - Slide de baixo para cima
- `.animate-mobile-fade-in` - Fade in simples

### Regras
- ✅ Use `useAnimationMode()` para detectar mobile
- ✅ Use StepContainer para wrappers de step
- ✅ Mensagens de conversação: CSS slide-up no mobile
- ❌ NÃO use framer-motion para animações de entrada no mobile
