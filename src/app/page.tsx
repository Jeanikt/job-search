import JobForm from "@/components/JobForm";
import PremiumPlan from "@/components/PremiumPlan";
import { Sparkles } from "lucide-react";
import logo from "./img/icon.png";
import Image from "next/image";
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f0f5ff] to-[#e0ebff]">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-900 mb-4">
            Assistente de Busca de Vagas - Zircon
          </h1>
          <Image src={logo} alt="Ícone de lupa" className="w-24 mx-auto mb-4" />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encontre as melhores oportunidades de emprego direto na sua caixa de
            entrada com nosso algoritmo avançado de busca
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            <Sparkles className="w-4 h-4 mr-1" />
            Novo: Busca inteligente com IA
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <JobForm />
          <div className="space-y-8">
            <PremiumPlan />
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Como funciona</h2>
              <ol className="space-y-4">
                <li className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold mr-3">
                    1
                  </div>
                  <div>
                    <p className="text-gray-700">
                      <strong>Preencha o formulário</strong> com seu email e os
                      detalhes da vaga que você está procurando
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold mr-3">
                    2
                  </div>
                  <div>
                    <p className="text-gray-700">
                      <strong>Nosso algoritmo avançado</strong> busca vagas em
                      múltiplas fontes e classifica por relevância
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold mr-3">
                    3
                  </div>
                  <div>
                    <p className="text-gray-700">
                      <strong>Receba as melhores vagas</strong> diretamente no
                      seu email, com links para aplicação
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold mr-3">
                    4
                  </div>
                  <div>
                    <p className="text-gray-700">
                      <strong>Assine o plano Premium</strong> para buscas
                      ilimitadas e acesso a mais vagas por busca
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6">
            Por que usar nosso Assistente de Busca?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="w-12 h-12 mx-auto mb-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Algoritmo Inteligente
              </h3>
              <p className="text-gray-600">
                Nossa tecnologia avançada encontra vagas mesmo quando buscas
                tradicionais falham, usando sinônimos e análise semântica.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <div className="w-12 h-12 mx-auto mb-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Resultados Instantâneos
              </h3>
              <p className="text-gray-600">
                Veja uma prévia dos resultados enquanto digita e receba a lista
                completa no seu email em segundos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <div className="w-12 h-12 mx-auto mb-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Múltiplas Fontes</h3>
              <p className="text-gray-600">
                Buscamos em diversas plataformas de emprego simultaneamente,
                aumentando suas chances de encontrar a vaga ideal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
