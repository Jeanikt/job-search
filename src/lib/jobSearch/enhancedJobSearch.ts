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
import { retry } from "../utils/retry";
import { fetchJobsFromExternalAPIs } from "./externalAPIs";
import { processJobsWithNLP } from "./nlpProcessor";
import { createSearchIndex, searchInIndex } from "./searchIndexer";
import {
  calculateJobSimilarity,
  removeDuplicateJobs,
  enrichJobData,
  normalizeJobTitles,
} from "./jobUtils";
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

const CACHE_DURATION = 10 * 60 * 1000;
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

    const searchTerms = extractSearchTerms(jobType);
    const expandedSearchTerms = await generateSearchExpansions(searchTerms);

    console.log(
      `Termos de busca expandidos: ${expandedSearchTerms.join(", ")}`
    );

    const [supabaseResult, externalAPIJobs] = await Promise.all([
      getJobs({
        location,
        country,
        jobType,
        limit: 200,
      }),

      isPremium
        ? fetchJobsFromExternalAPIs({
            location,
            country,
            jobType: expandedSearchTerms.join(" OR "),
            limit: 100,
          })
        : Promise.resolve([]),
    ]);

    let allJobs: Job[] = [
      ...supabaseResult.jobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        country: job.country,
        description: job.description,
        url: job.url,
        postedAt: job.posted_at,
        source: "database",
      })),
      ...externalAPIJobs.map((job) => ({
        ...job,
        source: "external",
      })),
    ];

    console.log(`Total de vagas brutas encontradas: ${allJobs.length}`);

    if (allJobs.length === 0) {
      console.log("Nenhuma vaga encontrada. Tentando com sinônimos...");

      const synonymJobTypes = expandedSearchTerms.slice(0, 3);

      for (const synonym of synonymJobTypes) {
        const { jobs: synonymJobs } = await getJobs({
          location,
          country,
          jobType: synonym,
          limit: 50,
        });

        if (synonymJobs.length > 0) {
          allJobs = [
            ...allJobs,
            ...synonymJobs.map((job) => ({
              id: job.id,
              title: job.title,
              company: job.company,
              location: job.location,
              country: job.country,
              description: job.description,
              url: job.url,
              postedAt: job.posted_at,
              source: "synonym",
            })),
          ];
        }
      }

      console.log(
        `Vagas encontradas após busca com sinônimos: ${allJobs.length}`
      );
    }

    if (allJobs.length === 0) {
      console.log("Nenhuma vaga encontrada. Buscando vagas por localização...");

      const { jobs: locationJobs } = await getJobs({
        location,
        country,
        limit: 50,
      });

      allJobs = [
        ...allJobs,
        ...locationJobs.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          country: job.country,
          description: job.description,
          url: job.url,
          postedAt: job.posted_at,
          source: "location",
        })),
      ];

      console.log(`Vagas encontradas por localização: ${allJobs.length}`);
    }

    console.log("Pré-processando vagas...");
    allJobs = normalizeJobTitles(allJobs);
    allJobs = removeDuplicateJobs(allJobs);
    allJobs = await enrichJobData(allJobs);

    console.log("Processando vagas com NLP...");
    const processedJobs = await processJobsWithNLP(allJobs, jobType);

    console.log("Filtrando vagas...");
    const filteredJobs = filterJobs(processedJobs, {
      location,
      country,
      jobType,
      maxDaysOld: isPremium ? 60 : 30,
      keywords: expandedSearchTerms,
      excludeKeywords: [],
    });

    console.log(`Vagas após filtragem: ${filteredJobs.length}`);

    console.log("Classificando vagas por relevância...");
    const rankedJobs = rankJobsByRelevance(filteredJobs, expandedSearchTerms);

    const jobsForSimilarity = rankedJobs.slice(0, 100);
    const similarityScores = await calculateJobSimilarity(
      jobsForSimilarity,
      jobType
    );

    const rerankedJobs = [...rankedJobs];
    rerankedJobs.sort((a, b) => {
      const aIdx = jobsForSimilarity.findIndex((job) => job.id === a.id);
      const bIdx = jobsForSimilarity.findIndex((job) => job.id === b.id);

      if (aIdx !== -1 && bIdx !== -1) {
        return similarityScores[bIdx] - similarityScores[aIdx];
      }

      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;

      return rankedJobs.indexOf(a) - rankedJobs.indexOf(b);
    });

    if (rerankedJobs.length > 0) {
      const cacheKey = createCacheKey({ location, country, jobType });
      searchResultsCache.set(cacheKey, {
        timestamp: Date.now(),
        jobs: rerankedJobs,
      });

      await cacheJobResults(cacheKey, rerankedJobs);
    }

    const totalJobs = rerankedJobs.length;
    const totalPages = Math.ceil(totalJobs / pageSize);
    const validPage = Math.max(1, Math.min(page, totalPages || 1));
    const paginatedJobs = rerankedJobs.slice(
      (validPage - 1) * pageSize,
      validPage * pageSize
    );

    const limitedJobs = isPremium ? paginatedJobs : paginatedJobs.slice(0, 10);

    console.log(
      `Retornando ${limitedJobs.length} vagas de um total de ${totalJobs}`
    );

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

    const executionTimeMs = Math.round(performance.now() - startTime);

    return {
      success: false,
      message:
        "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.",
      executionTimeMs,
    };
  }
}
