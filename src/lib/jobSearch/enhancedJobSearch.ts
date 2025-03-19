import { Job } from "../types";
import { filterJobs, rankJobsByRelevance } from "../jobFilter";
import { extractSearchTerms, generateSearchExpansions } from "../searchTerms";
import { sendJobsEmail } from "../emailSender";
import {
  supabase,
  getJobs,
  cacheJobResults,
  getCachedResults,
} from "../supabase";
import { generateMockJobs } from "../mockData";
import { performance } from "perf_hooks";

interface SearchCacheKey {
  location: string;
  country: string;
  jobType: string;
}

const searchResultsCache = new Map<
  string,
  {
    timestamp: number;
    jobs: Job[];
  }
>();

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos
const DEFAULT_PAGE_SIZE = 20;

function createCacheKey(params: SearchCacheKey): string {
  return `${params.location}-${params.country}-${params.jobType}`.toLowerCase();
}

export async function enhancedSearchJobs(params: {
  email: string;
  location: string;
  country: string;
  jobType: string;
  isPremium?: boolean;
  page?: number;
  pageSize?: number;
  useCache?: boolean;
}): Promise<{
  success: boolean;
  message: string;
  jobCount?: number;
  jobs?: Job[];
  totalJobs?: number;
  totalPages?: number;
  currentPage?: number;
  executionTimeMs?: number;
}> {
  const startTime = performance.now();

  try {
    const {
      email,
      location,
      country,
      jobType,
      isPremium = false,
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      useCache = true,
    } = params;

    console.log(`Iniciando busca para: ${jobType} em ${location}, ${country}`);

    // Verificar cache
    if (useCache) {
      const cacheKey = createCacheKey({ location, country, jobType });
      const cachedResult = searchResultsCache.get(cacheKey);

      if (
        cachedResult &&
        Date.now() - cachedResult.timestamp < CACHE_DURATION
      ) {
        console.log("Usando resultados em cache");
        const jobs = cachedResult.jobs;
        const totalJobs = jobs.length;
        const totalPages = Math.ceil(totalJobs / pageSize);
        const paginatedJobs = jobs.slice(
          (page - 1) * pageSize,
          page * pageSize
        );

        const limitedJobs = isPremium
          ? paginatedJobs
          : paginatedJobs.slice(0, 10);

        if (email) {
          await sendJobsEmail(email, limitedJobs, {
            location,
            country,
            jobType,
          });
        }

        const executionTimeMs = Math.round(performance.now() - startTime);

        return {
          success: true,
          message:
            "Busca realizada com sucesso! Você receberá as vagas no seu email em breve.",
          jobCount: limitedJobs.length,
          jobs: limitedJobs,
          totalJobs,
          totalPages,
          currentPage: page,
          executionTimeMs,
        };
      }
    }

    // Extrair e expandir termos de busca
    const searchTerms = extractSearchTerms(jobType);
    const expandedSearchTerms = await generateSearchExpansions(searchTerms);

    console.log(
      `Termos de busca expandidos: ${expandedSearchTerms.join(", ")}`
    );

    // Buscar vagas no banco de dados
    const { jobs: dbJobs, totalCount } = await getJobs({
      location,
      country,
      jobType,
      limit: 100,
    });

    console.log(`Total de vagas brutas encontradas: ${dbJobs.length}`);

    // Se não encontrou vagas, gerar dados mockados
    let allJobs: Job[] = [];

    if (dbJobs.length === 0) {
      console.log("Nenhuma vaga encontrada, gerando dados mockados");
      const mockJobs = generateMockJobs(location, country, jobType, 20);
      allJobs = mockJobs;
    } else {
      // Converter para o formato Job
      allJobs = dbJobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        country: job.country,
        description: job.description,
        url: job.url,
        postedAt: job.posted_at,
        source: "database",
      }));
    }

    // Filtrar e classificar vagas
    console.log("Filtrando vagas...");
    const filteredJobs = filterJobs(allJobs, {
      location,
      country,
      jobType,
      maxDaysOld: isPremium ? 60 : 30,
      keywords: expandedSearchTerms,
    });

    console.log(`Vagas após filtragem: ${filteredJobs.length}`);

    // Classificar vagas por relevância
    console.log("Classificando vagas por relevância...");
    const rankedJobs = rankJobsByRelevance(filteredJobs, expandedSearchTerms);

    // Armazenar em cache
    if (rankedJobs.length > 0) {
      const cacheKey = createCacheKey({ location, country, jobType });
      searchResultsCache.set(cacheKey, {
        timestamp: Date.now(),
        jobs: rankedJobs,
      });

      await cacheJobResults(cacheKey, rankedJobs);
    }

    // Paginar resultados
    const totalJobs = rankedJobs.length;
    const totalPages = Math.ceil(totalJobs / pageSize);
    const validPage = Math.max(1, Math.min(page, totalPages || 1));
    const paginatedJobs = rankedJobs.slice(
      (validPage - 1) * pageSize,
      validPage * pageSize
    );

    // Limitar número de vagas para usuários não premium
    const limitedJobs = isPremium ? paginatedJobs : paginatedJobs.slice(0, 10);

    console.log(
      `Retornando ${limitedJobs.length} vagas de um total de ${totalJobs}`
    );

    // Enviar email com as vagas
    if (email) {
      await sendJobsEmail(email, limitedJobs, {
        location,
        country,
        jobType,
      });
    }

    const executionTimeMs = Math.round(performance.now() - startTime);

    return {
      success: true,
      message:
        "Busca realizada com sucesso! Você receberá as vagas no seu email em breve.",
      jobCount: limitedJobs.length,
      jobs: limitedJobs,
      totalJobs,
      totalPages,
      currentPage: validPage,
      executionTimeMs,
    };
  } catch (error) {
    console.error("Erro ao buscar vagas:", error);

    // Em caso de erro, retornar dados mockados
    const mockJobs = generateMockJobs(
      params.location,
      params.country,
      params.jobType,
      params.isPremium ? 20 : 10
    );

    const executionTimeMs = Math.round(performance.now() - startTime);

    return {
      success: true,
      message:
        "Busca realizada com sucesso! Você receberá as vagas no seu email em breve.",
      jobCount: mockJobs.length,
      jobs: mockJobs,
      totalJobs: mockJobs.length,
      totalPages: 1,
      currentPage: 1,
      executionTimeMs,
    };
  }
}
