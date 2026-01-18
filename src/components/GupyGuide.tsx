import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Check,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Languages,
  Award,
  Lightbulb,
  FileText,
  Plus,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SupportButton } from "@/components/SupportButton";
import { MentorAvatar } from "@/components/MentorAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logoAD from "@/assets/logo-ad.png";

interface GupyData {
  cursos: { nome: string; status: string }[];
  experiencias: { empresa: string; cargo: string; descricao: string }[];
  idiomas: { idioma: string; nivel: string }[];
  certificados: { tipo: string; titulo: string }[];
  habilidades: string[];
  sobre: string;
}

const initialData: GupyData = {
  cursos: [{ nome: "", status: "Concluído" }],
  experiencias: [{ empresa: "", cargo: "", descricao: "" }],
  idiomas: [{ idioma: "", nivel: "Intermediário" }],
  certificados: [{ tipo: "Curso", titulo: "" }],
  habilidades: [],
  sobre: "",
};

const TIPS = {
  cursos: "Simplifique: 'MBA em Big Data' → 'Inteligência Artificial'. Sem vírgulas ou hífens.",
  experiencias: "Copie do LinkedIn. Sem caracteres especiais (•, >, ♦). Porcentagem por extenso.",
  idiomas: "Seja honesto com o nível — você pode ser testado.",
  certificados: "Inclua cursos online, certificações AWS, Google, etc.",
  habilidades: "Adicione as 30 competências do LinkedIn, uma por uma.",
  sobre: "Cole aqui o texto 'Sobre' do LinkedIn para usar ao personalizar candidaturas.",
};

export const GupyGuide = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [data, setData] = useState<GupyData>(initialData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("cursos");
  const [newHabilidade, setNewHabilidade] = useState("");

  // Load saved data
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      const { data: savedData } = await supabase
        .from("collected_data")
        .select("data_content")
        .eq("user_id", user.id)
        .eq("data_type", "gupy_cv")
        .maybeSingle();

      if (savedData?.data_content) {
        setData(savedData.data_content as unknown as GupyData);
      }
      setLoading(false);
    };
    loadData();
  }, [user?.id]);

  // Save data
  const saveData = async () => {
    if (!user?.id) return;
    setSaving(true);
    
    // Check if record exists
    const { data: existing } = await supabase
      .from("collected_data")
      .select("id")
      .eq("user_id", user.id)
      .eq("data_type", "gupy_cv")
      .maybeSingle();

    const jsonData = JSON.parse(JSON.stringify(data));

    if (existing) {
      await supabase
        .from("collected_data")
        .update({
          data_content: jsonData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("collected_data")
        .insert([{
          user_id: user.id,
          data_type: "gupy_cv",
          data_content: jsonData,
          stage_number: 6,
        }]);
    }

    setSaving(false);
    toast({ title: "Salvo!", description: "Suas alterações foram salvas." });
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const addItem = (field: keyof GupyData) => {
    const templates: Record<string, any> = {
      cursos: { nome: "", status: "Concluído" },
      experiencias: { empresa: "", cargo: "", descricao: "" },
      idiomas: { idioma: "", nivel: "Intermediário" },
      certificados: { tipo: "Curso", titulo: "" },
    };
    setData({ ...data, [field]: [...(data[field] as any[]), templates[field]] });
  };

  const removeItem = (field: keyof GupyData, index: number) => {
    const arr = [...(data[field] as any[])];
    arr.splice(index, 1);
    setData({ ...data, [field]: arr });
  };

  const updateItem = (field: keyof GupyData, index: number, key: string, value: string) => {
    const arr = [...(data[field] as any[])];
    arr[index] = { ...arr[index], [key]: value };
    setData({ ...data, [field]: arr });
  };

  const addHabilidade = () => {
    if (newHabilidade.trim() && data.habilidades.length < 30) {
      setData({ ...data, habilidades: [...data.habilidades, newHabilidade.trim()] });
      setNewHabilidade("");
    }
  };

  const removeHabilidade = (index: number) => {
    const arr = [...data.habilidades];
    arr.splice(index, 1);
    setData({ ...data, habilidades: arr });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const Section = ({ 
    id, 
    title, 
    icon: Icon, 
    tip, 
    children 
  }: { 
    id: string; 
    title: string; 
    icon: React.ElementType; 
    tip: string;
    children: React.ReactNode;
  }) => {
    const isOpen = openSection === id;
    return (
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium">{title}</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4"
          >
            <p className="text-xs text-muted-foreground mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
              💡 {tip}
            </p>
            {children}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src={logoAD} alt="Logo" className="w-8 h-8 rounded-lg" />
            <div>
              <h1 className="text-lg font-semibold">Estratégias Gupy</h1>
              <p className="text-xs text-muted-foreground">Etapa 6</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={saveData} disabled={saving} size="sm" className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </Button>
            <SupportButton />
          </div>
        </div>
      </header>

      {/* Mentor Intro */}
      <div className="p-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
          <MentorAvatar size="sm" />
          <p className="text-sm text-muted-foreground">
            Preencha cada seção abaixo como você vai colocar na Gupy. Clique em <strong>Salvar</strong> para não perder seu progresso.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="p-4 space-y-3">
        {/* Cursos */}
        <Section id="cursos" title="Experiência Acadêmica" icon={GraduationCap} tip={TIPS.cursos}>
          <div className="space-y-3">
            {data.cursos.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Nome do curso simplificado"
                  value={item.nome}
                  onChange={(e) => updateItem("cursos", i, "nome", e.target.value)}
                  className="flex-1"
                />
                <select
                  value={item.status}
                  onChange={(e) => updateItem("cursos", i, "status", e.target.value)}
                  className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option>Concluído</option>
                  <option>Em andamento</option>
                  <option>Trancado</option>
                </select>
                {data.cursos.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeItem("cursos", i)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addItem("cursos")} className="gap-2">
              <Plus className="w-4 h-4" /> Adicionar curso
            </Button>
          </div>
        </Section>

        {/* Experiências */}
        <Section id="experiencias" title="Experiência Profissional" icon={Briefcase} tip={TIPS.experiencias}>
          <div className="space-y-4">
            {data.experiencias.map((item, i) => (
              <div key={i} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                <div className="flex gap-2">
                  <Input
                    placeholder="Empresa"
                    value={item.empresa}
                    onChange={(e) => updateItem("experiencias", i, "empresa", e.target.value)}
                  />
                  <Input
                    placeholder="Cargo"
                    value={item.cargo}
                    onChange={(e) => updateItem("experiencias", i, "cargo", e.target.value)}
                  />
                  {data.experiencias.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeItem("experiencias", i)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="Descrição das atividades (sem caracteres especiais)"
                  value={item.descricao}
                  onChange={(e) => updateItem("experiencias", i, "descricao", e.target.value)}
                  rows={3}
                />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addItem("experiencias")} className="gap-2">
              <Plus className="w-4 h-4" /> Adicionar experiência
            </Button>
          </div>
        </Section>

        {/* Idiomas */}
        <Section id="idiomas" title="Idiomas" icon={Languages} tip={TIPS.idiomas}>
          <div className="space-y-3">
            {data.idiomas.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Idioma"
                  value={item.idioma}
                  onChange={(e) => updateItem("idiomas", i, "idioma", e.target.value)}
                  className="flex-1"
                />
                <select
                  value={item.nivel}
                  onChange={(e) => updateItem("idiomas", i, "nivel", e.target.value)}
                  className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option>Básico</option>
                  <option>Intermediário</option>
                  <option>Avançado</option>
                  <option>Fluente</option>
                  <option>Nativo</option>
                </select>
                {data.idiomas.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeItem("idiomas", i)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addItem("idiomas")} className="gap-2">
              <Plus className="w-4 h-4" /> Adicionar idioma
            </Button>
          </div>
        </Section>

        {/* Certificados */}
        <Section id="certificados" title="Conquistas e Certificados" icon={Award} tip={TIPS.certificados}>
          <div className="space-y-3">
            {data.certificados.map((item, i) => (
              <div key={i} className="flex gap-2">
                <select
                  value={item.tipo}
                  onChange={(e) => updateItem("certificados", i, "tipo", e.target.value)}
                  className="px-3 py-2 rounded-md border border-input bg-background text-sm w-32"
                >
                  <option>Curso</option>
                  <option>Certificação</option>
                  <option>Voluntário</option>
                  <option>Prêmio</option>
                </select>
                <Input
                  placeholder="Título"
                  value={item.titulo}
                  onChange={(e) => updateItem("certificados", i, "titulo", e.target.value)}
                  className="flex-1"
                />
                {data.certificados.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeItem("certificados", i)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addItem("certificados")} className="gap-2">
              <Plus className="w-4 h-4" /> Adicionar certificado
            </Button>
          </div>
        </Section>

        {/* Habilidades */}
        <Section id="habilidades" title="Habilidades" icon={Lightbulb} tip={TIPS.habilidades}>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Digite uma habilidade"
                value={newHabilidade}
                onChange={(e) => setNewHabilidade(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addHabilidade()}
                className="flex-1"
              />
              <Button onClick={addHabilidade} disabled={data.habilidades.length >= 30}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{data.habilidades.length}/30 habilidades</p>
            <div className="flex flex-wrap gap-2">
              {data.habilidades.map((hab, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                >
                  {hab}
                  <button onClick={() => removeHabilidade(i)} className="hover:text-destructive">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </Section>

        {/* Sobre */}
        <Section id="sobre" title="Personalizar Candidatura" icon={FileText} tip={TIPS.sobre}>
          <Textarea
            placeholder="Cole aqui seu texto 'Sobre' do LinkedIn..."
            value={data.sobre}
            onChange={(e) => setData({ ...data, sobre: e.target.value })}
            rows={6}
          />
        </Section>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <Button onClick={saveData} disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Salvar Alterações
        </Button>
      </div>

      {/* Bottom padding for fixed button */}
      <div className="h-20" />
    </div>
  );
};

export default GupyGuide;
