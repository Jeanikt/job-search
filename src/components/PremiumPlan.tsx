"use client";

import { useState } from "react";
import { Crown, Check } from "lucide-react";

export default function PremiumPlan() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleSubscribe = async () => {
    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }

    if (!email) {
      setError("Por favor, informe seu email para continuar");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          planName: "Premium Mensal",
          durationMonths: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao processar pagamento");
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("URL de pagamento não fornecida");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao processar sua solicitação de assinatura"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-indigo-600 rounded-xl shadow-lg p-8 text-white">
      <div className="flex items-center mb-6">
        <Crown className="w-8 h-8 mr-3" />
        <h2 className="text-2xl font-bold">Plano Premium</h2>
      </div>
      <p className="text-indigo-200 mb-6">
        Desbloqueie buscas ilimitadas e receba mais oportunidades no seu e-mail.
      </p>
      <div className="mb-8">
        <div className="text-3xl font-bold mb-2">R$ 15/mês</div>
        <div className="text-indigo-200">Cancele quando quiser</div>
      </div>
      <ul className="space-y-4 mb-8">
        <li className="flex items-center">
          <Check className="w-5 h-5 mr-3 text-indigo-300" />
          Buscas ilimitadas por dia
        </li>
        <li className="flex items-center">
          <Check className="w-5 h-5 mr-3 text-indigo-300" />
          Receba mais de 10 vagas por busca
        </li>
        <li className="flex items-center">
          <Check className="w-5 h-5 mr-3 text-indigo-300" />
          Entrega prioritária por e-mail
        </li>
        <li className="flex items-center">
          <Check className="w-5 h-5 mr-3 text-indigo-300" />
          Filtros avançados de busca
        </li>
      </ul>

      {showEmailInput && (
        <div className="mb-4">
          <label className="block text-indigo-200 mb-2">Seu email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded bg-indigo-700 text-white border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="seu@email.com"
            required
          />
        </div>
      )}

      <button
        onClick={handleSubscribe}
        className="w-full py-3 px-4 bg-white text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600"
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
            <span className="flex items-center justify-center">
              <Crown className="w-5 h-5 mr-2" />
              {showEmailInput ? "Continuar para pagamento" : "Assinar Premium"}
            </span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
