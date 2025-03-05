import { Job } from './types';

// Função para filtrar vagas com base em critérios
export function filterJobs(jobs: Job[], filters: {
  location?: string;
  country?: string;
  jobType?: string;
  maxDaysOld?: number;
  keywords?: string[];
  excludeKeywords?: string[];
}): Job[] {
  return jobs.filter(job => {
    // Filtrar por localização
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    // Filtrar por país
    if (filters.country && !job.country.toLowerCase().includes(filters.country.toLowerCase())) {
      return false;
    }
    
    // Filtrar por tipo de vaga
    if (filters.jobType && !job.title.toLowerCase().includes(filters.jobType.toLowerCase())) {
      return false;
    }
    
    // Filtrar por data de publicação
    if (filters.maxDaysOld) {
      const jobDate = new Date(job.postedAt);
      const daysOld = Math.floor((Date.now() - jobDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysOld > filters.maxDaysOld) {
        return false;
      }
    }
    
    // Filtrar por palavras-chave
    if (filters.keywords && filters.keywords.length > 0) {
      const jobText = `${job.title} ${job.company} ${job.description}`.toLowerCase();
      const hasKeyword = filters.keywords.some(keyword => 
        jobText.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) {
        return false;
      }
    }
    
    // Excluir vagas com palavras-chave indesejadas
    if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
      const jobText = `${job.title} ${job.company} ${job.description}`.toLowerCase();
      const hasExcludedKeyword = filters.excludeKeywords.some(keyword => 
        jobText.includes(keyword.toLowerCase())
      );
      if (hasExcludedKeyword) {
        return false;
      }
    }
    
    return true;
  });
}

// Função para classificar vagas por relevância
export function rankJobsByRelevance(jobs: Job[], searchTerms: string[]): Job[] {
  return [...jobs].sort((a, b) => {
    const aScore = calculateRelevanceScore(a, searchTerms);
    const bScore = calculateRelevanceScore(b, searchTerms);
    return bScore - aScore;
  });
}

// Função auxiliar para calcular pontuação de relevância
function calculateRelevanceScore(job: Job, searchTerms: string[]): number {
  let score = 0;
  const jobText = `${job.title} ${job.company} ${job.description}`.toLowerCase();
  
  // Pontuação por termos de busca
  searchTerms.forEach(term => {
    const termLower = term.toLowerCase();
    
    // Termo no título vale mais
    if (job.title.toLowerCase().includes(termLower)) {
      score += 10;
    }
    
    // Termo na descrição
    if (job.description.toLowerCase().includes(termLower)) {
      score += 5;
    }
    
    // Termo na empresa
    if (job.company.toLowerCase().includes(termLower)) {
      score += 3;
    }
  });
  
  // Vagas mais recentes recebem pontuação maior
  const daysOld = Math.floor((Date.now() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60 * 24));
  score += Math.max(0, 30 - daysOld); // Máximo de 30 pontos para vagas novas
  
  return score;
}