import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Save
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
          {/* Contact info aligned right */}
          <div className="flex justify-end mb-4">
            <div className="text-right text-sm text-black space-y-0.5">
              {data.telefone && (
                <p>
                  <span className="font-semibold">Telefone:</span>{" "}
                  <a href={`tel:${data.telefone}`} className="text-blue-600 hover:underline">
                    {data.telefone}
                  </a>
                </p>
              )}
              {data.localizacao && (
                <p>
                  <span className="font-semibold">Localização:</span>{" "}
                  <span className="text-blue-600">{data.localizacao}</span>
                </p>
              )}
              {data.email && (
                <p>
                  <span className="font-semibold">E-mail:</span>{" "}
                  <a href={`mailto:${data.email}`} className="text-blue-600 hover:underline">
                    {data.email}
                  </a>
                </p>
              )}
              {data.linkedin && (
                <p>
                  <span className="font-semibold">Linkedin:</span>
                  <br />
                  <a href={data.linkedin} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {data.linkedin}
                  </a>
                </p>
              )}
              {(data.nacionalidade || data.idade) && (
                <p className="mt-2 uppercase font-semibold">
                  {data.nacionalidade}{data.nacionalidade && data.idade ? ", " : ""}{data.idade ? `${data.idade} ANOS` : ""}.
                </p>
              )}
            </div>
          </div>

          {/* Black bar and name below */}
          <div className="border-b-4 border-black mb-2" />
          <h1 className="text-3xl font-light tracking-wide text-black uppercase">
            {data.nome}
          </h1>
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
