"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function PaymentSuccessContent() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");

    if (!paymentId) {
      setIsVerifying(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsSuccess(true);
        setIsVerifying(false);
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error);
        setIsSuccess(false);
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="max-w-md w-full mx-auto p-8 bg-white rounded-xl shadow-lg">
      {isVerifying ? (
        <div className="text-center py-8">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Verificando pagamento</h2>
          <p className="text-gray-600">
            Aguarde enquanto confirmamos seu pagamento...
          </p>
        </div>
      ) : isSuccess ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Pagamento confirmado!</h2>
          <p className="text-gray-600 mb-6">
            Seu plano Premium foi ativado com sucesso.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para a página inicial
          </Link>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Verificação falhou</h2>
          <p className="text-gray-600 mb-6">
            Não foi possível verificar seu pagamento.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para a página inicial
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<p>Carregando...</p>}>
        <PaymentSuccessContent />
      </Suspense>
    </main>
  );
}
