"use client";

import { useState, Suspense } from "react";
import {
  Mail,
  MapPin,
  Briefcase,
  Globe,
  Search,
  AlertCircle,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

// Componente para lidar com a busca de vagas
const JobForm = () => {
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [jobType, setJobType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams(); // Obtendo os parâmetros de pesquisa

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Enviar dados para a API
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar vagas");
      }

      // Redirecionar para página de sucesso ou mostrar mensagem
      alert(
        "Busca realizada com sucesso! Você receberá as vagas no seu email em breve."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao processar sua solicitação"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Suspense fallback={<div>Carregando...</div>}>
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
              placeholder="ex: Desenvolvedor Frontend"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processando...
              </span>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Buscar Vagas
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-amber-50 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-1" />
              <p className="text-sm text-amber-700">{error}</p>
            </div>
          )}
        </form>
      </div>
    </Suspense>
  );
};

export default JobForm;
