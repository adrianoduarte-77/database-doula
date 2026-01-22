import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ExternalLink, 
  BookOpen, 
  Target, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  X
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LearningPathViewProps {
  open: boolean;
  onClose: () => void;
  learningPath: string;
}

interface Module {
  title: string;
  emoji: string;
  focus: string;
  courses: Course[];
}

interface Course {
  name: string;
  url: string | null;
  note?: string;
}

// Parse learning path text into structured data
const parseLearningPath = (text: string): Module[] => {
  const modules: Module[] = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  let currentModule: Module | null = null;
  
  for (const line of lines) {
    // Check if it's a module header (starts with emoji like 🔹)
    if (line.includes('MÓDULO') || line.match(/^[🔹🔸🔷🔶]/)) {
      if (currentModule) {
        modules.push(currentModule);
      }
      
      // Extract module title
      const titleMatch = line.match(/MÓDULO\s*\d+\s*[–-]\s*(.+)/);
      const emoji = line.match(/^([🔹🔸🔷🔶])/)?.[1] || '🔹';
      
      currentModule = {
        title: titleMatch ? titleMatch[1].trim() : line.replace(/^[🔹🔸🔷🔶]\s*/, '').trim(),
        emoji,
        focus: '',
        courses: [],
      };
    } 
    // Check if it's a focus line
    else if (line.toLowerCase().startsWith('foco:')) {
      if (currentModule) {
        currentModule.focus = line.replace(/^foco:\s*/i, '').trim();
      }
    }
    // Check if it's a course with URL
    else if (line.includes('http')) {
      if (currentModule) {
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
        const url = urlMatch ? urlMatch[1] : null;
        const name = line.replace(url || '', '').trim();
        
        // Find the course name from previous line if this line only has URL
        if (!name && currentModule.courses.length > 0) {
          currentModule.courses[currentModule.courses.length - 1].url = url;
        } else {
          currentModule.courses.push({ name, url });
        }
      }
    }
    // Check if it's a course name (without URL)
    else if (currentModule && line.trim() && !line.startsWith('Foco:')) {
      const note = line.includes('➤') ? line.split('➤')[1]?.trim() : undefined;
      const name = line.replace(/➤.*/, '').trim();
      
      if (name && !name.toLowerCase().includes('módulo')) {
        currentModule.courses.push({ name, url: null, note });
      }
    }
  }
  
  if (currentModule) {
    modules.push(currentModule);
  }
  
  return modules;
};

const LearningPathView = ({ open, onClose, learningPath }: LearningPathViewProps) => {
  const [expandedModules, setExpandedModules] = useState<number[]>([0]);
  const modules = parseLearningPath(learningPath);

  const toggleModule = (index: number) => {
    setExpandedModules(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const moduleColors = [
    'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    'from-green-500/20 to-emerald-500/20 border-green-500/30',
    'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    'from-rose-500/20 to-red-500/20 border-rose-500/30',
  ];

  const moduleIconColors = [
    'text-blue-400',
    'text-purple-400',
    'text-green-400',
    'text-amber-400',
    'text-rose-400',
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 border-0 bg-transparent shadow-none [&>button]:hidden overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 pb-4 border-b border-border/50 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Sua Trilha de Desenvolvimento
                </h2>
                <p className="text-sm text-muted-foreground">
                  Cursos selecionados exclusivamente para sua área de atuação
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">{modules.length} Módulos</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                <Target className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium text-accent">
                  {modules.reduce((acc, m) => acc + m.courses.length, 0)} Cursos
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="max-h-[60vh]">
            <div className="p-6 space-y-4">
              {modules.map((module, moduleIndex) => (
                <motion.div
                  key={moduleIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: moduleIndex * 0.1 }}
                  className={`rounded-xl border bg-gradient-to-br ${moduleColors[moduleIndex % moduleColors.length]} overflow-hidden`}
                >
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(moduleIndex)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-card/50 border border-border/50 flex items-center justify-center ${moduleIconColors[moduleIndex % moduleIconColors.length]}`}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-display font-semibold text-foreground text-sm">
                          {module.emoji} Módulo {moduleIndex + 1}
                        </h3>
                        <p className="text-xs text-muted-foreground">{module.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-card/50">
                        {module.courses.length} cursos
                      </span>
                      {expandedModules.includes(moduleIndex) ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Focus description */}
                  {module.focus && expandedModules.includes(moduleIndex) && (
                    <div className="px-4 pb-2">
                      <p className="text-xs text-muted-foreground italic bg-card/30 rounded-lg p-2">
                        <strong>Foco:</strong> {module.focus}
                      </p>
                    </div>
                  )}

                  {/* Courses */}
                  <AnimatePresence>
                    {expandedModules.includes(moduleIndex) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-2 space-y-2">
                          {module.courses.map((course, courseIndex) => (
                            <motion.div
                              key={courseIndex}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: courseIndex * 0.05 }}
                              className="group"
                            >
                              {course.url ? (
                                <a
                                  href={course.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/30 hover:bg-card/80 hover:border-primary/30 transition-all group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                      {course.name}
                                    </p>
                                    {course.note && (
                                      <p className="text-xs text-muted-foreground mt-0.5">{course.note}</p>
                                    )}
                                  </div>
                                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                </a>
                              ) : (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-card/30 border border-border/20">
                                  <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-muted-foreground truncate">
                                      {course.name}
                                    </p>
                                    {course.note && (
                                      <p className="text-xs text-muted-foreground/70 mt-0.5">{course.note}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border/50 bg-muted/20">
            <Button onClick={onClose} className="w-full" variant="outline">
              Fechar e Continuar
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default LearningPathView;
