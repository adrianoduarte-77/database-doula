import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Save,
  Phone,
  MapPin,
  Mail,
  Linkedin
} from "lucide-react";
import { ATSCVData } from "@/types/ats-cv";
import { motion } from "framer-motion";

interface ATSCVPreviewProps {
  data: ATSCVData;
  onReset: () => void;
  onSave?: () => void;
}

export function ATSCVPreview({ data, onReset, onSave }: ATSCVPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons - Hidden on print */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <div className="flex gap-2">
          {onSave && (
            <Button variant="outline" size="sm" onClick={onSave} className="gap-2">
              <Save className="w-4 h-4" />
              Salvar
            </Button>
          )}
          <Button variant="glow" size="sm" onClick={handlePrint} className="gap-2">
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* CV Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white text-black rounded-lg shadow-xl p-8 md:p-12 print:shadow-none print:p-0"
      >
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">{data.nome}</h1>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
            {data.telefone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{data.telefone}</span>
              </div>
            )}
            {data.localizacao && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{data.localizacao}</span>
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{data.email}</span>
              </div>
            )}
            {data.linkedin && (
              <div className="flex items-center gap-1">
                <Linkedin className="w-4 h-4" />
                <a href={data.linkedin} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  {data.linkedin}
                </a>
              </div>
            )}
          </div>

          {(data.nacionalidade || data.idade) && (
            <p className="mt-2 text-sm text-gray-600 uppercase">
              {[data.nacionalidade, data.idade].filter(Boolean).join(', ')}.
            </p>
          )}
        </header>

        {/* Experiências */}
        {data.experiencias.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-black border-b border-gray-300 pb-1 mb-4 uppercase">
              Experiências
            </h2>

            <div className="space-y-6">
              {data.experiencias.map((exp, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-baseline gap-x-2 mb-1">
                    <h3 className="font-bold text-black">
                      {exp.empresa}{exp.localizacao && `, ${exp.localizacao}`}
                    </h3>
                    <span className="text-gray-700">—</span>
                    <span className="font-semibold text-gray-800">{exp.cargo}</span>
                  </div>
                  <p className="text-sm text-gray-600 uppercase mb-2">{exp.periodo}</p>

                  {exp.bullets.length > 0 && (
                    <ul className="space-y-1">
                      {exp.bullets.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} className="text-sm text-gray-700 pl-4 relative">
                          <span className="absolute left-0">&gt;</span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Educação */}
        {data.educacao.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-black border-b border-gray-300 pb-1 mb-4 uppercase">
              Educação
            </h2>

            <ul className="space-y-1">
              {data.educacao.map((edu, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {edu.instituicao}, - {edu.curso}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Idiomas */}
        {data.idiomas.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-black border-b border-gray-300 pb-1 mb-4 uppercase">
              Idiomas
            </h2>

            <ul className="space-y-1">
              {data.idiomas.map((idioma, index) => (
                <li key={index} className="text-sm text-gray-700 pl-4 relative">
                  <span className="absolute left-0">-</span>
                  {idioma.idioma} - {idioma.nivel}
                </li>
              ))}
            </ul>
          </section>
        )}
      </motion.div>
    </div>
  );
}
