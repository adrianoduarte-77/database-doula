import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Target,
  Lightbulb,
  Building2,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Wand2,
  Loader2,
  Edit3,
  Save,
  X,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mentorPhoto from "@/assets/mentor-photo.png";

export interface KeywordScript {
  keyword: string;
  experience: string;
  company: string;
  role: string;
  script: string;
}

interface Experience {
  id: string;
  company: string;
  role: string;
  selectedKeywords: string[];
}

interface CareerIntro {
  careerStartAge: string | null;
  education: string | null;
  yearsOfExperience: string | null;
  mainField: string | null;
  introText: string | null;
}

interface InterviewScriptBuilderProps {
  keywords: string[];
  companyName: string;
  jobDescription: string;
  linkedinAbout: string;
  experiences: string;
  onComplete: (scripts: KeywordScript[]) => void | Promise<void>;
  initialScripts?: KeywordScript[];
  onScriptsChange?: (scripts: KeywordScript[]) => void;
}

const mentorMessages = [
  "Agora vem a parte mais importante: seus ROTEIROS. 🎯",
  "A IA vai criar um roteiro personalizado para CADA palavra-chave, baseado nas suas experiências reais.",
  "Você só precisa informar suas experiências e selecionar as palavras-chave. A IA faz o resto!",
];

export const InterviewScriptBuilder = ({
  keywords,
  companyName,
  jobDescription,
  linkedinAbout,
  experiences: userExperiences,
  onComplete,
  initialScripts,
  onScriptsChange,
}: InterviewScriptBuilderProps) => {
  // Check if we have scripts on initial render (synchronous check to skip intro)
  const hasInitialScriptsRef = useRef((initialScripts?.length ?? 0) > 0);
  
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: '1', company: '', role: '', selectedKeywords: [] }
  ]);
  const [expandedExp, setExpandedExp] = useState<string | null>('1');
  const [conversationStep, setConversationStep] = useState(hasInitialScriptsRef.current ? mentorMessages.length : 0);
  const [showBuilder, setShowBuilder] = useState(hasInitialScriptsRef.current);
  const [isGeneratingScripts, setIsGeneratingScripts] = useState(false);
  const [generatedScripts, setGeneratedScripts] = useState<KeywordScript[]>(initialScripts || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [careerIntro, setCareerIntro] = useState<CareerIntro | null>(null);
  const [isLoadingIntro, setIsLoadingIntro] = useState(false);
  const [introAlreadyLoaded, setIntroAlreadyLoaded] = useState(false);

  const persistTimerRef = useRef<number | null>(null);

  // Keep local state in sync when parent rehydrates scripts (but don't regenerate)
  useEffect(() => {
    if (initialScripts && initialScripts.length > 0) {
      setGeneratedScripts(initialScripts);
      setConversationStep(mentorMessages.length);
      setShowBuilder(true);
      hasInitialScriptsRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialScripts || [])]);

  // Persist scripts upward (debounced) so navigation won't make it "disappear"
  useEffect(() => {
    if (!onScriptsChange) return;
    if (persistTimerRef.current) window.clearTimeout(persistTimerRef.current);
    persistTimerRef.current = window.setTimeout(() => {
      onScriptsChange(generatedScripts);
    }, 250);
    return () => {
      if (persistTimerRef.current) window.clearTimeout(persistTimerRef.current);
    };
  }, [generatedScripts, onScriptsChange]);

  // Load career intro ONLY ONCE and ONLY if we don't have scripts already
  useEffect(() => {
    // Skip if we already have scripts - no need to load intro
    if (hasInitialScriptsRef.current) return;
    // Skip if already loaded to prevent duplicate calls
    if (introAlreadyLoaded) return;
    
    const loadCareerIntro = async () => {
      if (!linkedinAbout || linkedinAbout.trim().length < 50) return;
      
      setIntroAlreadyLoaded(true);
      setIsLoadingIntro(true);
      try {
        const { data, error } = await supabase.functions.invoke('generate-career-intro', {
          body: { linkedinAbout }
        });
        
        if (error) throw error;
        if (data?.introText) {
          setCareerIntro(data);
        }
      } catch (error) {
        console.error("Error loading career intro:", error);
      } finally {
        setIsLoadingIntro(false);
      }
    };

    loadCareerIntro();
  }, [linkedinAbout, introAlreadyLoaded]);

  useEffect(() => {
    // Skip intro animation entirely if scripts exist
    if (hasInitialScriptsRef.current) return;
    if (conversationStep < mentorMessages.length) {
      const timer = setTimeout(() => {
        setConversationStep(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (!showBuilder) {
      const timer = setTimeout(() => setShowBuilder(true), 500);
      return () => clearTimeout(timer);
    }
  }, [conversationStep, showBuilder]);

  const addExperience = () => {
    if (experiences.length < 5) {
      const newExp: Experience = {
        id: Date.now().toString(),
        company: '',
        role: '',
        selectedKeywords: []
      };
      setExperiences([...experiences, newExp]);
      setExpandedExp(newExp.id);
    }
  };

  const removeExperience = (id: string) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter(e => e.id !== id));
    }
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setExperiences(experiences.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const toggleKeyword = (expId: string, keyword: string) => {
    const exp = experiences.find(e => e.id === expId);
    if (!exp) return;

    const currentKeywords = exp.selectedKeywords;
    let newKeywords: string[];

    if (currentKeywords.includes(keyword)) {
      newKeywords = currentKeywords.filter(k => k !== keyword);
    } else if (currentKeywords.length < 5) {
      newKeywords = [...currentKeywords, keyword];
    } else {
      return;
    }

    setExperiences(experiences.map(e =>
      e.id === expId ? { ...e, selectedKeywords: newKeywords } : e
    ));
  };

  const getUsedKeywords = () => {
    return experiences.flatMap(e => e.selectedKeywords);
  };

  const getTotalKeywordsCount = () => {
    return experiences.reduce((acc, exp) => acc + exp.selectedKeywords.length, 0);
  };

  const canGenerateWithAI = () => {
    return experiences.some(exp => 
      exp.company.trim() && 
      exp.role.trim() && 
      exp.selectedKeywords.length > 0
    );
  };

  const generateScriptsWithAI = async () => {
    if (!canGenerateWithAI()) {
      toast.error("Preencha empresa, cargo e selecione palavras-chave em pelo menos uma experiência.");
      return;
    }

    setIsGeneratingScripts(true);
    
    try {
      const experiencesForAI = experiences
        .filter(exp => exp.company.trim() && exp.role.trim() && exp.selectedKeywords.length > 0)
        .map(exp => ({
          company: exp.company,
          role: exp.role,
          keywords: exp.selectedKeywords
        }));

      const keywordsToGenerate = experiencesForAI.flatMap(exp => 
        exp.keywords.map(kw => ({ keyword: kw, company: exp.company, role: exp.role }))
      );

      const { data: result, error } = await supabase.functions.invoke('generate-interview-scripts', {
        body: {
          keywords: keywordsToGenerate.map(k => k.keyword),
          experiences: userExperiences,
          linkedinAbout,
          companyName,
          jobDescription,
          experiencesMapping: keywordsToGenerate
        }
      });

      if (error) throw error;

      if (result?.scripts && result.scripts.length > 0) {
        const formattedScripts: KeywordScript[] = result.scripts.map((s: any) => {
          const mapping = keywordsToGenerate.find(k => k.keyword.toLowerCase() === s.keyword?.toLowerCase());
          return {
            keyword: s.keyword,
            experience: s.experience || `${mapping?.role} — ${mapping?.company}` || '',
            company: s.company || mapping?.company || '',
            role: s.role || mapping?.role || '',
            script: s.script
          };
        });
        
        setGeneratedScripts(formattedScripts);
        toast.success(`${formattedScripts.length} roteiros gerados com sucesso!`);
      } else {
        throw new Error("Nenhum roteiro foi gerado");
      }
    } catch (error) {
      console.error("Erro ao gerar roteiros:", error);
      toast.error("Erro ao gerar roteiros. Tente novamente.");
    } finally {
      setIsGeneratingScripts(false);
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(generatedScripts[index].script);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      const newScripts = [...generatedScripts];
      newScripts[editingIndex].script = editValue;
      setGeneratedScripts(newScripts);
      setEditingIndex(null);
      setEditValue('');
      toast.success("Roteiro atualizado!");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleComplete = () => {
    if (generatedScripts.length === 0) {
      toast.error("Gere os roteiros com IA primeiro.");
      return;
    }
    onComplete(generatedScripts);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Conversational Introduction */}
      <div className="space-y-4">
        <AnimatePresence>
          {mentorMessages.slice(0, conversationStep).map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex gap-3"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30">
                  <img src={mentorPhoto} alt="Mentor" className="w-full h-full object-cover" />
                </div>
              </div>
              <Card className="p-4 bg-secondary/50 flex-1">
                <p className="text-sm">{msg}</p>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {conversationStep < mentorMessages.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
              <img src={mentorPhoto} alt="Mentor" className="w-full h-full object-cover" />
            </div>
            <Card className="p-4 bg-secondary/30">
              <div className="flex gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                />
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Main Builder */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Keywords Overview */}
            <Card className="p-4 bg-secondary/30">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Suas {keywords.length} Palavras-Chave da Vaga
              </h4>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => {
                  const isUsed = getUsedKeywords().includes(keyword);
                  const hasScript = generatedScripts.some(s => s.keyword === keyword);
                  return (
                    <span
                      key={keyword}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        hasScript
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : isUsed
                          ? 'bg-primary/20 text-primary border-primary/30'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {keyword} {hasScript && <Check className="w-3 h-3 inline ml-1" />}
                    </span>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {getUsedKeywords().length} de {keywords.length} palavras selecionadas
              </p>
            </Card>

            {/* Experiences Selection */}
            {generatedScripts.length === 0 && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      Suas Experiências (máx. 5)
                    </h3>
                    {experiences.length < 5 && (
                      <Button variant="outline" size="sm" onClick={addExperience} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </Button>
                    )}
                  </div>

                  {experiences.map((exp, index) => (
                    <motion.div
                      key={exp.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="border border-border rounded-xl overflow-hidden"
                    >
                      <div
                        className="p-4 bg-secondary/30 flex items-center gap-4 cursor-pointer"
                        onClick={() => setExpandedExp(expandedExp === exp.id ? null : exp.id)}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            placeholder="Nome da Empresa"
                            className="bg-background/50"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Input
                            value={exp.role}
                            onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                            placeholder="Seu Cargo"
                            className="bg-background/50"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {exp.selectedKeywords.length > 0 && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                              {exp.selectedKeywords.length} palavras
                            </span>
                          )}
                          {experiences.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeExperience(exp.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          {expandedExp === exp.id ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedExp === exp.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 border-t border-border space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Selecione as palavras-chave que você usou nesta experiência:
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {keywords.map((keyword) => {
                                    const isSelected = exp.selectedKeywords.includes(keyword);
                                    const isUsedElsewhere = !isSelected && getUsedKeywords().includes(keyword);

                                    return (
                                      <button
                                        key={keyword}
                                        onClick={() => toggleKeyword(exp.id, keyword)}
                                        disabled={isUsedElsewhere}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                          isSelected
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : isUsedElsewhere
                                            ? 'bg-muted/30 text-muted-foreground border-muted cursor-not-allowed opacity-40'
                                            : 'bg-secondary text-foreground border-border hover:border-primary hover:text-primary'
                                        }`}
                                      >
                                        {keyword}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {exp.selectedKeywords.length > 0 && (
                                <Card className="p-3 bg-primary/5 border-primary/20">
                                  <div className="flex items-start gap-2">
                                    <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-muted-foreground">
                                      A IA vai criar roteiros para: <strong className="text-foreground">{exp.selectedKeywords.join(', ')}</strong>
                                    </p>
                                  </div>
                                </Card>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>

                {/* AI Generate Button */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-primary/10 via-amber-500/5 to-primary/5 border-primary/30">
                    <div className="text-center space-y-4">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center">
                        <Wand2 className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-lg mb-1">
                          Gerar Roteiros com IA
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          A IA criará roteiros personalizados para cada palavra-chave selecionada,<br />
                          baseados nas suas experiências reais.
                        </p>
                      </div>
                      <Button
                        onClick={generateScriptsWithAI}
                        disabled={isGeneratingScripts || !canGenerateWithAI()}
                        size="lg"
                        className="gap-2"
                      >
                        {isGeneratingScripts ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Gerando roteiros...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Gerar Roteiros
                          </>
                        )}
                      </Button>
                      {!canGenerateWithAI() && getTotalKeywordsCount() === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Preencha empresa, cargo e selecione pelo menos uma palavra-chave
                        </p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </>
            )}

            {/* Generated Scripts Display */}
            {generatedScripts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Success Header */}
                <Card className="p-4 bg-gradient-to-r from-green-500/10 to-primary/10 border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Roteiros Gerados!</h4>
                        <p className="text-sm text-muted-foreground">Clique em editar para personalizar cada roteiro</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateScriptsWithAI}
                      disabled={isGeneratingScripts}
                      className="gap-2"
                    >
                      {isGeneratingScripts ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      Gerar Novamente
                    </Button>
                  </div>
                </Card>

                {/* Career Introduction Block */}
                {(careerIntro?.introText || isLoadingIntro) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="p-6 bg-secondary/20 border-border/50">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Sua Introdução</h4>
                            <p className="text-xs text-muted-foreground">Comece sua apresentação assim</p>
                          </div>
                        </div>
                        
                        {isLoadingIntro ? (
                          <div className="flex items-center gap-2 py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Gerando introdução...</span>
                          </div>
                        ) : (
                          <>
                            <div className="pl-12">
                              <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">
                                {careerIntro?.introText}
                              </p>
                            </div>
                            
                            <div className="pl-12 pt-2">
                              <p className="text-xs text-muted-foreground/70 italic">
                                Após essa introdução, comece a falar sobre suas experiências usando os roteiros abaixo.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Scripts List - Grouped by Company */}
                <div className="space-y-8">
                  {(() => {
                    // Group scripts by company
                    const scriptsByCompany: Record<string, KeywordScript[]> = {};
                    generatedScripts.forEach((script) => {
                      const companyKey = script.company || 'Outras Experiências';
                      if (!scriptsByCompany[companyKey]) {
                        scriptsByCompany[companyKey] = [];
                      }
                      scriptsByCompany[companyKey].push(script);
                    });

                    return Object.entries(scriptsByCompany).map(([company, scripts], groupIndex) => (
                      <motion.div
                        key={company}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIndex * 0.1 }}
                        className="space-y-4"
                      >
                        {/* Company Header */}
                        <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="text-xl font-display font-semibold text-foreground">
                            {company}
                          </h3>
                        </div>

                        {/* Scripts for this company */}
                        <div className="space-y-3 pl-2">
                          {scripts.map((script) => {
                            const originalIndex = generatedScripts.findIndex(
                              s => s.keyword === script.keyword && s.company === script.company
                            );
                            return (
                              <motion.div
                                key={`${script.company}-${script.keyword}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 }}
                              >
                                <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all">
                                  <div className="p-4">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                      <div className="space-y-1">
                                        <span className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-bold">
                                          {script.keyword}
                                        </span>
                                        {script.role && (
                                          <p className="text-xs text-muted-foreground pl-1">
                                            {script.role}
                                          </p>
                                        )}
                                      </div>
                                      {editingIndex !== originalIndex && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => startEditing(originalIndex)}
                                          className="gap-2 text-muted-foreground hover:text-foreground h-8"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                          Editar
                                        </Button>
                                      )}
                                    </div>

                                    {editingIndex === originalIndex ? (
                                      <div className="space-y-3">
                                        <Textarea
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          className="min-h-[120px] text-sm"
                                          placeholder="Edite seu roteiro aqui..."
                                        />
                                        <div className="flex justify-end gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={cancelEdit}
                                            className="gap-2"
                                          >
                                            <X className="w-4 h-4" />
                                            Cancelar
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={saveEdit}
                                            className="gap-2"
                                          >
                                            <Save className="w-4 h-4" />
                                            Salvar
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm leading-relaxed text-foreground/90">
                                        {script.script}
                                      </p>
                                    )}
                                  </div>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ));
                  })()}
                </div>

                {/* Complete Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center pt-4"
                >
                  <Button
                    size="lg"
                    onClick={handleComplete}
                    className="gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Concluir Roteiros para {companyName}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
