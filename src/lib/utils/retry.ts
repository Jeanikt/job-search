/**
 * Função para tentar executar uma operação com retentativas
 * @param operation Função a ser executada
 * @param maxRetries Número máximo de tentativas
 * @param delay Atraso entre tentativas (ms)
 * @param backoff Fator de aumento do atraso entre tentativas
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  backoff: number = 2
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Se for a última tentativa, não espere
      if (attempt === maxRetries - 1) {
        break;
      }
      
      // Esperar antes da próxima tentativa
      const waitTime = delay * Math.pow(backoff, attempt);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError || new Error('Operação falhou após várias tentativas');
}