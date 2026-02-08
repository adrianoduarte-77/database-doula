import { Clock, AlertTriangle } from "lucide-react";

interface GenerationWarningProps {
  type: "cv-personalizado" | "cv-ats" | "carta";
  isLoading?: boolean;
}

const timeEstimates = {
  "cv-personalizado": "1 a 2 minutos",
  "cv-ats": "30 segundos a 1 minuto",
  "carta": "1 a 2 minutos",
};

const typeLabels = {
  "cv-personalizado": "currículo personalizado",
  "cv-ats": "currículo ATS",
  "carta": "cartas de apresentação",
};

export function GenerationWarning({ type, isLoading = false }: GenerationWarningProps) {
  if (isLoading) {
    return (
      <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Não saia desta tela!
            </p>
            <p className="text-xs text-muted-foreground">
              Aguarde a geração do documento. Fechar ou navegar para outra página pode interromper o processo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border/50">
      <div className="flex items-center gap-2.5">
        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Tempo estimado:</span> {timeEstimates[type]} para gerar o {typeLabels[type]}
        </p>
      </div>
    </div>
  );
}
