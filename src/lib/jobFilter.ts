import { Job } from "./types";

// Função para filtrar vagas com base em critérios
export function filterJobs(
  jobs: Job[],
  filters: {
    location?: string;
    country?: string;
    jobType?: string;
    maxDaysOld?: number;
    keywords?: string[];
    excludeKeywords?: string[];
  }
): Job[] {
  console.log(`Filtrando ${jobs.length} vagas com critérios:`, filters);

  return jobs.filter((job) => {
    // Filtrar por localização
    if (
      filters.location &&
      !job.location.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }

    // Filtrar por país
    if (
      filters.country &&
      !job.country.toLowerCase().includes(filters.country.toLowerCase())
    ) {
      return false;
    }

    // Filtrar por tipo de vaga (mais flexível)
    if (filters.jobType) {
      const jobTypeWords = filters.jobType.toLowerCase().split(/\s+/);
      const jobText = `${job.title} ${job.description}`.toLowerCase();

      // Verificar se pelo menos uma palavra-chave do tipo de vaga está presente
      const hasJobTypeKeyword = jobTypeWords.some(
        (word) => word.length > 2 && jobText.includes(word)
      );

      if (!hasJobTypeKeyword) {
        return false;
      }
    }

    // Filtrar por data de publicação
    if (filters.maxDaysOld) {
      try {
        const jobDate = new Date(job.postedAt);
        const daysOld = Math.floor(
          (Date.now() - jobDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysOld > filters.maxDaysOld) {
          return false;
        }
      } catch (error) {
        console.warn(
          `Erro ao processar data de publicação para vaga ${job.id}:`,
          error
        );
        // Se não conseguir processar a data, manter a vaga
      }
    }

    // Filtrar por palavras-chave
    if (filters.keywords && filters.keywords.length > 0) {
      const jobText =
        `${job.title} ${job.company} ${job.description}`.toLowerCase();

      // Verificar se pelo menos uma palavra-chave está presente
      const hasKeyword = filters.keywords.some(
        (keyword) =>
          keyword.length > 2 && jobText.includes(keyword.toLowerCase())
      );

      if (!hasKeyword) {
        return false;
      }
    }

    // Excluir vagas com palavras-chave indesejadas
    if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
      const jobText =
        `${job.title} ${job.company} ${job.description}`.toLowerCase();

      const hasExcludedKeyword = filters.excludeKeywords.some(
        (keyword) =>
          keyword.length > 2 && jobText.includes(keyword.toLowerCase())
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
  console.log(
    `Classificando ${jobs.length} vagas por relevância com ${searchTerms.length} termos de busca`
  );

  return [...jobs].sort((a, b) => {
    const aScore = calculateRelevanceScore(a, searchTerms);
    const bScore = calculateRelevanceScore(b, searchTerms);
    return bScore - aScore;
  });
}

// Função auxiliar para calcular pontuação de relevância
function calculateRelevanceScore(job: Job, searchTerms: string[]): number {
  let score = 0;
  const jobTitle = job.title.toLowerCase();
  const jobCompany = job.company.toLowerCase();
  const jobDescription = job.description.toLowerCase();

  // Pontuação por termos de busca
  searchTerms.forEach((term) => {
    const termLower = term.toLowerCase();

    // Termo exato no título vale mais
    if (jobTitle.includes(termLower)) {
      score += 15;

      // Bônus se o termo estiver no início do título
      if (
        jobTitle.startsWith(termLower) ||
        jobTitle.includes(` ${termLower}`)
      ) {
        score += 10;
      }
    }

    // Termo na descrição
    if (jobDescription.includes(termLower)) {
      score += 5;

      // Bônus se o termo aparecer múltiplas vezes na descrição
      const termCount = (jobDescription.match(new RegExp(termLower, "g")) || [])
        .length;
      if (termCount > 1) {
        score += Math.min(termCount, 5) * 2;
      }
    }

    // Termo na empresa
    if (jobCompany.includes(termLower)) {
      score += 3;
    }
  });

  // Vagas mais recentes recebem pontuação maior
  try {
    const daysOld = Math.floor(
      (Date.now() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    score += Math.max(0, 30 - daysOld); // Máximo de 30 pontos para vagas novas
  } catch (error) {
    // Se não conseguir processar a data, não adicionar pontuação por recência
  }

  // Bônus para vagas com títulos mais curtos e específicos
  const titleWords = jobTitle.split(/\s+/).length;
  if (titleWords >= 2 && titleWords <= 6) {
    score += 5;
  }

  // Bônus para vagas com descrições mais detalhadas
  const descriptionLength = jobDescription.length;
  if (descriptionLength > 500) {
    score += 5;
  }

  return score;
}
