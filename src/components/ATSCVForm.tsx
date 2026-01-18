import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Phone,
  MapPin,
  Sparkles,
  GraduationCap,
  Briefcase,
  Languages,
  Plus,
  Trash2,
  ArrowLeft,
  Linkedin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ATSCVData, IdiomaItem } from "@/types/ats-cv";
import { motion } from "framer-motion";

interface ATSCVFormProps {
  onGenerate: (data: ATSCVData) => void;
  onBack: () => void;
}

interface FormData {
  nome: string;
  telefone: string;
  localizacao: string;
  email: string;
  linkedin: string;
  nacionalidade: string;
  idade: string;
  experiencias: string;
  educacao: string;
  idiomas: IdiomaItem[];
}

export function ATSCVForm({ onGenerate, onBack }: ATSCVFormProps) {
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    telefone: "",
    localizacao: "",
    email: "",
    linkedin: "",
    nacionalidade: "",
    idade: "",
    experiencias: "",
    educacao: "",
    idiomas: [{ idioma: "", nivel: "" }],
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIdiomaChange = (index: number, field: keyof IdiomaItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      idiomas: prev.idiomas.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addIdioma = () => {
    setFormData(prev => ({
      ...prev,
      idiomas: [...prev.idiomas, { idioma: "", nivel: "" }],
    }));
  };

  const removeIdioma = (index: number) => {
    if (formData.idiomas.length > 1) {
      setFormData(prev => ({
        ...prev,
        idiomas: prev.idiomas.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.experiencias.trim() || !formData.educacao.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Preencha as seções de experiências e educação.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-ats-cv', {
        body: {
          nome: formData.nome,
          telefone: formData.telefone,
          localizacao: formData.localizacao,
          email: formData.email,
          linkedin: formData.linkedin,
          nacionalidade: formData.nacionalidade,
          idade: formData.idade,
          experiencias: formData.experiencias,
          educacao: formData.educacao,
          idiomas: formData.idiomas.filter(i => i.idioma.trim()),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      onGenerate(data.cv);
    } catch (error: any) {
      console.error('Error generating ATS CV:', error);
      toast({
        title: "Erro ao gerar currículo",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = formData.experiencias.trim().length > 50 && formData.educacao.trim().length > 10;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-2 -ml-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>

      {/* Personal Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <User className="w-4 h-4 text-primary" />
          Dados Pessoais
        </div>

        {/* Nome */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Nome Completo (em maiúsculas)</label>
          <Input
            value={formData.nome}
            onChange={(e) => handleChange("nome", e.target.value.toUpperCase())}
            placeholder="LUCIANO DUARTE"
          />
        </div>

        {/* Contact Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="w-3 h-3" />
              Telefone
            </label>
            <Input
              value={formData.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
              placeholder="+55 11 98601-0599"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              Localização
            </label>
            <Input
              value={formData.localizacao}
              onChange={(e) => handleChange("localizacao", e.target.value)}
              placeholder="São Paulo, Brasil"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">E-mail</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">LinkedIn</label>
            <Input
              value={formData.linkedin}
              onChange={(e) => handleChange("linkedin", e.target.value)}
              placeholder="https://www.linkedin.com/in/seuperfil/"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Nacionalidade</label>
            <Input
              value={formData.nacionalidade}
              onChange={(e) => handleChange("nacionalidade", e.target.value.toUpperCase())}
              placeholder="BRASILEIRO"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Idade</label>
            <Input
              value={formData.idade}
              onChange={(e) => handleChange("idade", e.target.value)}
              placeholder="30 ANOS"
            />
          </div>
        </div>
      </motion.div>

      {/* Experiences Section - LinkedIn Copy/Paste */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Briefcase className="w-4 h-4 text-primary" />
          Experiências Profissionais
        </div>

        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-2">
            <Linkedin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-600 dark:text-blue-400">
              <p className="font-medium mb-1">Como copiar do LinkedIn:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-blue-500/80">
                <li>Acesse seu perfil do LinkedIn</li>
                <li>Vá na seção "Experiência"</li>
                <li>Selecione e copie TODAS as experiências (Ctrl+C)</li>
                <li>Cole abaixo (Ctrl+V)</li>
              </ol>
            </div>
          </div>
        </div>

        <Textarea
          value={formData.experiencias}
          onChange={(e) => handleChange("experiencias", e.target.value)}
          placeholder={`Cole aqui todas as suas experiências do LinkedIn...

Exemplo:
Gerente de Projetos
Empresa ABC
jan de 2020 - presente · 4 anos
São Paulo, Brasil

- Liderança de equipes multifuncionais
- Gestão de projetos de até R$ 5 milhões
- Implementação de metodologias ágeis`}
          className="min-h-[200px] text-sm"
        />
        <p className="text-xs text-muted-foreground">
          A IA vai organizar exatamente como você escreveu, sem alterar nada.
        </p>
      </motion.div>

      {/* Education Section - LinkedIn Copy/Paste */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <GraduationCap className="w-4 h-4 text-primary" />
          Formação Acadêmica / Cursos / Licenças e Certificados
        </div>

        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-2">
            <Linkedin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-600 dark:text-blue-400">
              <p className="font-medium mb-1">Copie do LinkedIn:</p>
              <p className="text-blue-500/80">Seções "Formação acadêmica", "Licenças e certificados" e "Cursos"</p>
            </div>
          </div>
        </div>

        <Textarea
          value={formData.educacao}
          onChange={(e) => handleChange("educacao", e.target.value)}
          placeholder={`Cole aqui sua formação, cursos e certificados do LinkedIn...

Exemplo:
MBA em Gestão de Projetos
Fundação Getúlio Vargas (FGV)
2018 - 2020

Bacharelado em Administração
Universidade de São Paulo (USP)
2010 - 2014

PMP - Project Management Professional
Project Management Institute
Emitido em jan de 2021`}
          className="min-h-[150px] text-sm"
        />
        <p className="text-xs text-muted-foreground">
          A IA vai organizar exatamente como você escreveu, sem alterar nada.
        </p>
      </motion.div>

      {/* Languages Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Languages className="w-4 h-4 text-primary" />
            Idiomas
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addIdioma}
            className="gap-1 text-xs"
          >
            <Plus className="w-3 h-3" />
            Adicionar
          </Button>
        </div>

        {formData.idiomas.map((idioma, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              value={idioma.idioma}
              onChange={(e) => handleIdiomaChange(index, "idioma", e.target.value)}
              placeholder="Inglês"
              className="flex-1"
            />
            <Input
              value={idioma.nivel}
              onChange={(e) => handleIdiomaChange(index, "nivel", e.target.value.toUpperCase())}
              placeholder="FLUENTE"
              className="flex-1"
            />
            {formData.idiomas.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeIdioma(index)}
                className="shrink-0"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full gap-2"
          size="lg"
        >
        {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Gerando currículo...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Gerar Currículo ATS
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
}
