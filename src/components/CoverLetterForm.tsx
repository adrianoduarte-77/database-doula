import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Upload, FileText, Sparkles, Loader2, Info, Lock, CheckCircle2 } from "lucide-react";
import { CoverLetterFormData } from "@/types/cover-letter";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserProfile } from "@/hooks/useUserProfile";
import { motion, AnimatePresence } from "framer-motion";

interface CoverLetterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (formData: CoverLetterFormData) => void;
  isLoading: boolean;
}

// Modern input styles
const modernInputClass = "h-12 rounded-xl border-white/10 bg-white/5 backdrop-blur-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200";
const lockedInputClass = "h-12 rounded-xl border-muted-foreground/20 bg-muted/30 backdrop-blur-sm cursor-default opacity-90";
const modernTextareaClass = "rounded-xl border-white/10 bg-white/5 backdrop-blur-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 resize-none";

export function CoverLetterForm({ open, onOpenChange, onGenerate, isLoading }: CoverLetterFormProps) {
  const { toast } = useToast();
  const { personalData, isLoading: isLoadingProfile } = useUserProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extractingCV, setExtractingCV] = useState(false);
  const [formData, setFormData] = useState<CoverLetterFormData>({
    nome: "",
    idade: "",
    localizacao: "",
    profissao: "",
    estadoCivil: "",
    interesses: "",
    softSkills: "",
    hardSkills: "",
    ultimoCargo: "",
    cargosInteresse: "",
    cvAnalysis: "",
  });

  // Auto-fill personal data from profile
  useEffect(() => {
    if (!isLoadingProfile && personalData) {
      setFormData(prev => ({
        ...prev,
        nome: prev.nome || personalData.fullName,
        idade: prev.idade || personalData.age,
        localizacao: prev.localizacao || personalData.location,
      }));
    }
  }, [personalData, isLoadingProfile]);

  const handleChange = (field: keyof CoverLetterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie um arquivo PDF.",
        variant: "destructive",
      });
      return;
    }

    // Limit file size to 5MB to avoid timeout issues
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${MAX_SIZE_MB}MB.`,
        variant: "destructive",
      });
      return;
    }

    setExtractingCV(true);
    
    toast({
      title: "Processando CV...",
      description: "Isso pode levar até 2 minutos dependendo do tamanho do arquivo.",
    });
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        
        // Create AbortController with longer timeout (3 minutes)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000);
        
        const { data, error } = await supabase.functions.invoke('extract-cv-pdf', {
          body: { pdfBase64: base64 }
        });
        
        clearTimeout(timeoutId);

        if (error) {
          // Check if it's a timeout/connection error
          if (error.message?.includes('connection') || error.message?.includes('timeout')) {
            throw new Error('A extração demorou muito. Tente com um PDF menor ou mais simples.');
          }
          throw error;
        }
        if (data?.error) throw new Error(data.error);

        // Format extracted data as text
        const cvText = formatExtractedCV(data);
        handleChange('cvAnalysis', cvText);
        
        toast({
          title: "CV extraído! ✓",
          description: "Os dados do currículo foram extraídos com sucesso.",
        });
      } catch (error: any) {
        console.error('Error extracting CV:', error);
        
        // Provide more specific error messages
        let errorMessage = "Tente novamente.";
        if (error.message?.includes('timeout') || error.message?.includes('demorou')) {
          errorMessage = "A extração demorou muito. Tente com um PDF menor.";
        } else if (error.message?.includes('connection')) {
          errorMessage = "Conexão perdida. Verifique sua internet e tente novamente.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Erro ao extrair CV",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setExtractingCV(false);
      }
    };
    reader.onerror = () => {
      setExtractingCV(false);
      toast({
        title: "Erro ao ler arquivo",
        description: "Não foi possível ler o arquivo PDF.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const formatExtractedCV = (data: any): string => {
    let text = "";
    
    // A edge function retorna strings, não arrays
    const experiencias = typeof data.experiencias === 'string' ? data.experiencias.trim() : '';
    const educacao = typeof data.educacao === 'string' ? data.educacao.trim() : '';
    
    if (experiencias) {
      text += "EXPERIÊNCIAS PROFISSIONAIS:\n" + experiencias;
    }

    if (educacao) {
      text += "\n\nEDUCAÇÃO:\n" + educacao;
    }

    return text.trim() || "Dados do CV extraídos.";
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.nome || !formData.profissao || !formData.cvAnalysis) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos Nome, Profissão e anexe seu CV.",
        variant: "destructive",
      });
      return;
    }
    onGenerate(formData);
  };

  const isFormValid = formData.nome && formData.profissao && formData.cvAnalysis;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-white/10 rounded-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2.5 text-xl">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            Carta de Apresentação
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            Preencha os dados para gerar 3 modelos personalizados de carta de apresentação.
          </DialogDescription>
        </DialogHeader>

        {/* Loading state */}
        <AnimatePresence mode="wait">
          {isLoadingProfile ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Carregando seus dados...</p>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 py-4"
            >
              {/* Section: Dados Pessoais */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="grid grid-cols-6 gap-4">
                  {/* Nome - 3 cols */}
                  <div className="col-span-6 md:col-span-3">
                    <Label htmlFor="nome" className="text-sm font-medium flex items-center gap-1.5 mb-2">
                      Nome Completo <span className="text-primary">*</span>
                      {formData.nome && personalData.fullName && <Lock className="w-3 h-3 text-muted-foreground/60" />}
                    </Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => handleChange('nome', e.target.value)}
                      placeholder="Seu nome completo"
                      readOnly={!!personalData.fullName}
                      className={personalData.fullName ? lockedInputClass : modernInputClass}
                    />
                  </div>
                  
                  {/* Idade - 1.5 cols */}
                  <div className="col-span-3 md:col-span-1">
                    <Label htmlFor="idade" className="text-sm font-medium flex items-center gap-1.5 mb-2 h-5">
                      Idade
                      {formData.idade && personalData.age && <Lock className="w-3 h-3 text-muted-foreground/60" />}
                    </Label>
                    <Input
                      id="idade"
                      value={formData.idade}
                      onChange={(e) => handleChange('idade', e.target.value)}
                      placeholder="Ex: 28 anos"
                      readOnly={!!personalData.age}
                      className={personalData.age ? lockedInputClass : modernInputClass}
                    />
                  </div>
                  
                  {/* Estado Civil - 1.5 cols */}
                  <div className="col-span-3 md:col-span-2">
                    <Label htmlFor="estadoCivil" className="text-sm font-medium mb-2 block h-5">Estado Civil</Label>
                    <Input
                      id="estadoCivil"
                      value={formData.estadoCivil}
                      onChange={(e) => handleChange('estadoCivil', e.target.value)}
                      placeholder="Ex: Solteiro(a)"
                      className={modernInputClass}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Section: Localização e Profissão */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="localizacao" className="text-sm font-medium flex items-center gap-1.5 mb-2">
                    Localização
                    {formData.localizacao && personalData.location && <Lock className="w-3 h-3 text-muted-foreground/60" />}
                  </Label>
                  <Input
                    id="localizacao"
                    value={formData.localizacao}
                    onChange={(e) => handleChange('localizacao', e.target.value)}
                    placeholder="Cidade, Estado"
                    readOnly={!!personalData.location}
                    className={personalData.location ? lockedInputClass : modernInputClass}
                  />
                </div>
                <div>
                  <Label htmlFor="profissao" className="text-sm font-medium mb-2 block">
                    Profissão <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="profissao"
                    value={formData.profissao}
                    onChange={(e) => handleChange('profissao', e.target.value)}
                    placeholder="Sua área de atuação"
                    className={modernInputClass}
                  />
                </div>
              </motion.div>

              {/* Section: Cargos */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ultimoCargo" className="text-sm font-medium mb-2 block">Seu Último Cargo</Label>
                  <Input
                    id="ultimoCargo"
                    value={formData.ultimoCargo}
                    onChange={(e) => handleChange('ultimoCargo', e.target.value)}
                    placeholder="Cargo atual ou mais recente"
                    className={modernInputClass}
                  />
                </div>
                <div>
                  <Label htmlFor="cargosInteresse" className="text-sm font-medium mb-2 block">Cargos de Interesse</Label>
                  <Input
                    id="cargosInteresse"
                    value={formData.cargosInteresse}
                    onChange={(e) => handleChange('cargosInteresse', e.target.value)}
                    placeholder="Cargos que você busca"
                    className={modernInputClass}
                  />
                </div>
              </motion.div>

              {/* Section: Skills */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="softSkills" className="text-sm font-medium">Soft Skills</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help hover:text-muted-foreground transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs rounded-xl">
                          <p className="text-xs">Habilidades comportamentais: comunicação, liderança, trabalho em equipe, adaptabilidade, etc.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Textarea
                    id="softSkills"
                    value={formData.softSkills}
                    onChange={(e) => handleChange('softSkills', e.target.value)}
                    placeholder="Ex: Comunicação, Liderança, Resolução de problemas..."
                    className={`${modernTextareaClass} min-h-[80px]`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="hardSkills" className="text-sm font-medium">Hard Skills</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help hover:text-muted-foreground transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs rounded-xl">
                          <p className="text-xs">Habilidades técnicas: ferramentas, sistemas, metodologias, certificações, etc.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Textarea
                    id="hardSkills"
                    value={formData.hardSkills}
                    onChange={(e) => handleChange('hardSkills', e.target.value)}
                    placeholder="Ex: Excel avançado, SAP, Python, Scrum..."
                    className={`${modernTextareaClass} min-h-[80px]`}
                  />
                </div>
              </motion.div>

              {/* Section: Interesses */}
              <motion.div variants={itemVariants}>
                <Label htmlFor="interesses" className="text-sm font-medium mb-2 block">Interesses Profissionais</Label>
                <Textarea
                  id="interesses"
                  value={formData.interesses}
                  onChange={(e) => handleChange('interesses', e.target.value)}
                  placeholder="Áreas, setores ou tipos de projetos que te interessam..."
                  className={`${modernTextareaClass} min-h-[80px]`}
                />
              </motion.div>

              {/* Section: CV Upload */}
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">
                    Análise do Currículo <span className="text-primary">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground/60">(Anexe seu CV ATS)</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={extractingCV}
                    className="gap-2 h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200"
                  >
                    {extractingCV ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analisando CV...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Anexar CV (PDF)
                      </>
                    )}
                  </Button>
                  
                  <AnimatePresence>
                    {formData.cvAnalysis && !extractingCV && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-400 font-medium">CV analisado</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex justify-between items-center pt-6 mt-2 border-t border-white/5">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)} 
            disabled={isLoading}
            className="gap-2 h-11 rounded-xl hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || isLoading}
            className="gap-2 h-11 px-6 rounded-xl font-medium transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando cartas...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar 3 Modelos
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
