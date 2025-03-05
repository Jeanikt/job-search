import JobForm from '@/components/JobForm';
import PremiumPlan from '@/components/PremiumPlan';

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-900 mb-4">Assistente de Busca de Vagas</h1>
          <p className="text-lg text-gray-600">Encontre as melhores oportunidades de emprego direto na sua caixa de entrada</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <JobForm />
          <PremiumPlan />
        </div>
      </div>
    </main>
  );
}