import React, { useState } from 'react';
import { Mail, MapPin, Briefcase, Globe, Search, Crown, Check, AlertCircle } from 'lucide-react';

function App() {
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [jobType, setJobType] = useState('');
  const [searchCount, setSearchCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPremium && searchCount >= 1) {
      alert('Você atingiu seu limite diário. Assine o plano Premium para buscas ilimitadas!');
      return;
    }
    setSearchCount(prev => prev + 1);
    // Lógica de envio do formulário aqui
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">Assistente de Busca de Vagas</h1>
          <p className="text-lg text-gray-600">Encontre as melhores oportunidades de emprego direto na sua caixa de entrada</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Formulário de Busca */}
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="ex: Desenvolvedor Frontend"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center"
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar Vagas
              </button>

              {!isPremium && searchCount >= 1 && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-1" />
                  <p className="text-sm text-amber-700">
                    Você atingiu seu limite diário de buscas. Assine o Premium para buscas ilimitadas!
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Plano Premium */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow-lg p-8 text-white">
            <div className="flex items-center mb-6">
              <Crown className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold">Plano Premium</h2>
            </div>
            <p className="text-indigo-100 mb-6">
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
            <button
              onClick={() => setIsPremium(true)}
              className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-semibold py-3 px-6 rounded-lg flex items-center justify-center"
            >
              <Crown className="w-5 h-5 mr-2" />
              Assinar Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;