"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  MapPin,
  Briefcase,
  Globe,
  Search,
  AlertCircle,
  Filter,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
} from "lucide-react";
import JobResults from "./JobResults";
import { Job } from "@/lib/types";

interface SearchFilters {
  maxDaysOld?: number;
  minSalary?: number;
  maxSalary?: number;
  seniorityLevel?: string[];
  remoteOnly?: boolean;
  excludeKeywords?: string[];
}

const JobForm = () => {
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [jobType, setJobType] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    maxDaysOld: 30,
    remoteOnly: false,
    seniorityLevel: [],
  });
  const [results, setResults] = useState<{
    jobs: Job[];
    totalJobs: number;
    currentPage: number;
    totalPages: number;
    executionTimeMs: number;
  } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSearching) {
      interval = setInterval(() => {
        setSearchProgress((prev) => {
          const increment = Math.random() * 15;
          const newProgress = Math.min(prev + increment, 95);
          return newProgress;
        });
      }, 300);
    } else {
      setSearchProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSearching]);

  const fetchPreview = async () => {
    if (!location || !country || !jobType) return;

    try {
      setPreviewMode(true);
      setIsLoading(true);

      const params = new URLSearchParams({
        location,
        country,
        jobType,
        page: "1",
        pageSize: "5",
      });

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar prévia de vagas");
      }

      setResults({
        jobs: data.jobs || [],
        totalJobs: data.totalJobs || 0,
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 0,
        executionTimeMs: data.executionTimeMs || 0,
      });
    } catch (err) {
      console.error("Erro na prévia:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (location && country && jobType && jobType.length > 2) {
        fetchPreview();
      }
    }, 800);

    return () => clearTimeout(debounce);
  }, [location, country, jobType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSearching(true);
    setError(null);
    setSuccess(null);
    setSearchProgress(10);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          location,
          country,
          jobType,
          filters,
          page: 1,
          pageSize: 20,
        }),
      });

      setSearchProgress(70);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar vagas");
      }

      setSearchProgress(100);

      if (data.jobs && data.jobs.length > 0) {
        setResults({
          jobs: data.jobs,
          totalJobs: data.totalJobs || data.jobs.length,
          currentPage: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          executionTimeMs: data.executionTimeMs || 0,
        });
      }

      setSuccess(
        `Busca realizada com sucesso! ${
          data.jobCount
            ? `Encontramos ${data.jobCount} vagas que correspondem à sua busca.`
            : ""
        } Você receberá as vagas no seu email em breve.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao processar sua solicitação"
      );
    } finally {
      setIsLoading(false);
      setIsSearching(false);
      setPreviewMode(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setSuccess(null);
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleSeniorityLevel = (level: string) => {
    setFilters((prev) => {
      const currentLevels = prev.seniorityLevel || [];

      if (currentLevels.includes(level)) {
        return {
          ...prev,
          seniorityLevel: currentLevels.filter((l) => l !== level),
        };
      } else {
        return {
          ...prev,
          seniorityLevel: [...currentLevels, level],
        };
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center text-gray-700 mb-2">
              <Mail className="w-5 h-5 mr-2" />
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-gray-700 mb-2">
                <MapPin className="w-5 h-5 mr-2" />
                Localização
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field"
                placeholder="Cidade, Estado"
                required
              />
            </div>

            <div>
              <label className="flex items-center text-gray-700 mb-2">
                <Globe className="w-5 h-5 mr-2" />
                País
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="input-field"
                placeholder="Brasil"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-gray-700 mb-2">
              <Briefcase className="w-5 h-5 mr-2" />
              Tipo de Vaga
            </label>
            <input
              type="text"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="input-field"
              placeholder="ex: Desenvolvedor Frontend, React, Java"
              required
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Filter className="w-4 h-4 mr-1" />
              {showFilters ? "Ocultar filtros" : "Mostrar filtros avançados"}
              {showFilters ? (
                <ChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-1" />
              )}
            </button>

            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Busca instantânea
            </div>
          </div>

          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idade máxima das vagas
                </label>
                <select
                  value={filters.maxDaysOld}
                  onChange={(e) =>
                    updateFilter("maxDaysOld", Number(e.target.value))
                  }
                  className="input-field"
                >
                  <option value={7}>Últimos 7 dias</option>
                  <option value={15}>Últimos 15 dias</option>
                  <option value={30}>Últimos 30 dias</option>
                  <option value={60}>Últimos 60 dias</option>
                  <option value={90}>Últimos 90 dias</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de senioridade
                </label>
                <div className="flex flex-wrap gap-2">
                  {["junior", "mid", "senior", "lead"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => toggleSeniorityLevel(level)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filters.seniorityLevel?.includes(level)
                          ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      } border`}
                    >
                      {level === "junior"
                        ? "Júnior"
                        : level === "mid"
                        ? "Pleno"
                        : level === "senior"
                        ? "Sênior"
                        : "Líder/Gerente"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remoteOnly"
                  checked={filters.remoteOnly}
                  onChange={(e) => updateFilter("remoteOnly", e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remoteOnly"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Apenas vagas remotas
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Palavras-chave a excluir (separadas por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="ex: estagio, junior, trainee"
                  className="input-field"
                  onChange={(e) => {
                    const keywords = e.target.value
                      .split(",")
                      .map((k) => k.trim())
                      .filter((k) => k.length > 0);
                    updateFilter(
                      "excludeKeywords",
                      keywords.length > 0 ? keywords : undefined
                    );
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                Processando...
              </span>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Buscar Vagas
              </>
            )}
          </button>

          {isSearching && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Buscando vagas...</span>
                <span>{Math.round(searchProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${searchProgress}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-500 italic">
                {searchProgress < 30
                  ? "Consultando banco de dados..."
                  : searchProgress < 60
                  ? "Buscando em APIs externas..."
                  : searchProgress < 80
                  ? "Classificando resultados por relevância..."
                  : "Preparando resultados..."}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-amber-50 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-1" />
              <p className="text-sm text-amber-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
        </form>
      </div>

      {results && results.jobs.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              {previewMode ? "Prévia de Resultados" : "Resultados da Busca"}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({results.totalJobs} vagas encontradas)
              </span>
            </h2>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                Tempo de busca: {(results.executionTimeMs / 1000).toFixed(2)}s
              </span>
              <button
                onClick={clearResults}
                className="p-1 hover:bg-gray-100 rounded-full"
                title="Limpar resultados"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <JobResults
            jobs={results.jobs}
            totalJobs={results.totalJobs}
            currentPage={results.currentPage}
            totalPages={results.totalPages}
            isPreview={previewMode}
          />

          {previewMode && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-700">
                Esta é apenas uma prévia dos resultados. Preencha seu email e
                clique em "Buscar Vagas" para receber a lista completa no seu
                email.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobForm;
