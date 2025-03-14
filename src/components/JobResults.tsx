import { useState } from "react";
import { Job } from "@/lib/types";
import {
  Building,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Star,
  Code,
  Briefcase,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface JobResultsProps {
  jobs: Job[];
  totalJobs: number;
  currentPage: number;
  totalPages: number;
  isPreview?: boolean;
  onPageChange?: (page: number) => void;
}

const JobResults = ({
  jobs,
  totalJobs,
  currentPage,
  totalPages,
  isPreview = false,
  onPageChange,
}: JobResultsProps) => {
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const formatPostedDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } catch (error) {
      return "Data desconhecida";
    }
  };

  const extractTechnologies = (description: string): string[] => {
    const techKeywords = [
      "react",
      "angular",
      "vue",
      "javascript",
      "typescript",
      "node",
      "python",
      "java",
      "c#",
      "php",
      "ruby",
      "go",
      "rust",
      "swift",
      "kotlin",
      "html",
      "css",
      "sass",
      "less",
      "tailwind",
      "bootstrap",
      "aws",
      "azure",
      "gcp",
      "docker",
      "kubernetes",
      "jenkins",
      "sql",
      "mongodb",
      "postgresql",
      "mysql",
      "oracle",
      "redis",
      "git",
      "github",
      "gitlab",
      "bitbucket",
      "jira",
      "confluence",
      "agile",
      "scrum",
      "kanban",
      "devops",
      "ci/cd",
    ];

    const descLower = description.toLowerCase();
    return techKeywords
      .filter((tech) => new RegExp(`\\b${tech}\\b`, "i").test(descLower))
      .slice(0, 8);
  };

  const detectSeniority = (
    title: string,
    description: string
  ): string | null => {
    const text = `${title} ${description}`.toLowerCase();

    if (
      /\b(junior|júnior|jr|trainee|estágio|estagiário|entry level|entry-level)\b/i.test(
        text
      )
    ) {
      return "Júnior";
    }

    if (/\b(pleno|mid|mid-level|intermediário|intermediate)\b/i.test(text)) {
      return "Pleno";
    }

    if (
      /\b(senior|sênior|sr|specialist|especialista|advanced|avançado)\b/i.test(
        text
      )
    ) {
      return "Sênior";
    }

    if (
      /\b(lead|líder|tech lead|team lead|líder técnico|coordenador|coordinator|gerente|manager|gestor)\b/i.test(
        text
      )
    ) {
      return "Líder/Gerente";
    }

    return null;
  };

  const isRemoteJob = (job: Job): boolean => {
    const text =
      `${job.title} ${job.location} ${job.description}`.toLowerCase();
    return /\b(remoto|remote|home office|trabalho remoto|remote work|trabalho a distância|trabalho em casa|work from home|wfh|anywhere|qualquer lugar)\b/i.test(
      text
    );
  };

  const toggleJobExpansion = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        const isExpanded = expandedJobId === job.id;
        const technologies = extractTechnologies(job.description);
        const seniority = detectSeniority(job.title, job.description);
        const isRemote = isRemoteJob(job);

        return (
          <div
            key={job.id}
            className={`border rounded-lg overflow-hidden transition-all duration-200 ${
              isExpanded
                ? "border-indigo-300 shadow-md"
                : "border-gray-200 hover:border-indigo-200"
            }`}
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleJobExpansion(job.id)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">
                  {job.title}
                </h3>
                <div className="flex items-center space-x-2">
                  {job.metadata?.relevanceScore && (
                    <div
                      className="flex items-center text-amber-500"
                      title="Pontuação de relevância"
                    >
                      <Star className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {Math.round(job.metadata.relevanceScore)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-y-2">
                <div className="flex items-center text-gray-600 text-sm mr-4">
                  <Building className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{job.company}</span>
                </div>

                <div className="flex items-center text-gray-600 text-sm mr-4">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>
                    {job.location}
                    {isRemote && (
                      <span className="ml-1 text-green-600 font-medium">
                        (Remoto)
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{formatPostedDate(job.postedAt)}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {seniority && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {seniority}
                  </span>
                )}

                {isRemote && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <MapPin className="w-3 h-3 mr-1" />
                    Remoto
                  </span>
                )}

                {job.source && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Clock className="w-3 h-3 mr-1" />
                    {job.source === "database"
                      ? "Banco de dados"
                      : job.source === "external"
                      ? "API externa"
                      : job.source === "synonym"
                      ? "Busca por sinônimo"
                      : job.source === "location"
                      ? "Busca por localização"
                      : job.source}
                  </span>
                )}

                {technologies.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    <Code className="w-3 h-3 mr-1" />
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="prose prose-sm max-w-none">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Descrição da vaga:
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line">
                    {job.description.length > 500
                      ? `${job.description.substring(0, 500)}...`
                      : job.description}
                  </p>
                </div>

                <div className="mt-4 flex justify-end">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Ver vaga completa
                    <ExternalLink className="ml-2 -mr-0.5 h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {!isPreview && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Próxima
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{" "}
                <span className="font-medium">
                  {(currentPage - 1) * 10 + 1}
                </span>{" "}
                a{" "}
                <span className="font-medium">
                  {Math.min(currentPage * 10, totalJobs)}
                </span>{" "}
                de <span className="font-medium">{totalJobs}</span> resultados
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => onPageChange?.(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === pageNumber
                          ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                    currentPage === totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Próxima</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {isPreview && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Mostrando apenas {jobs.length} de {totalJobs} vagas disponíveis
        </div>
      )}
    </div>
  );
};

export default JobResults;
