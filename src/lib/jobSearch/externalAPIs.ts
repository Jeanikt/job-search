import { Job } from "../types";
import { retry } from "../utils/retry";
import { getCommonHeaders, getRandomUserAgent } from "../utils/httpUtils";
import { createHmac } from "crypto";
import qs from "querystring";

const JOB_API_PROVIDERS = [
  "ADZUNA",
  "INDEED",
  "LINKEDIN",
  "GITHUB",
  "GLASSDOOR",
] as const;

type JobProvider = (typeof JOB_API_PROVIDERS)[number];

const API_CONFIG = {
  ADZUNA: {
    enabled: process.env.ADZUNA_ENABLED === "true",
    baseUrl: "https://api.adzuna.com/v1/api/jobs",
    appId: process.env.ADZUNA_APP_ID,
    apiKey: process.env.ADZUNA_API_KEY,
  },
  INDEED: {
    enabled: process.env.INDEED_ENABLED === "true",
    baseUrl: "https://api.indeed.com/ads/apisearch",
    publisherId: process.env.INDEED_PUBLISHER_ID,
  },
  LINKEDIN: {
    enabled: process.env.LINKEDIN_ENABLED === "true",
    baseUrl: "https://api.linkedin.com/v2/jobSearch",
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  },
  GITHUB: {
    enabled: process.env.GITHUB_ENABLED === "true",
    baseUrl: "https://jobs.github.com/positions.json",
  },
  GLASSDOOR: {
    enabled: process.env.GLASSDOOR_ENABLED === "true",
    baseUrl: "https://api.glassdoor.com/api/api.htm",
    partnerId: process.env.GLASSDOOR_PARTNER_ID,
    apiKey: process.env.GLASSDOOR_API_KEY,
  },
};

interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  created: string;
}

export async function fetchJobsFromExternalAPIs(params: {
  location: string;
  country: string;
  jobType: string;
  limit?: number;
}): Promise<Job[]> {
  const { location, country, jobType, limit = 50 } = params;

  const apiPromises: Promise<Job[]>[] = [];

  if (
    API_CONFIG.ADZUNA.enabled &&
    API_CONFIG.ADZUNA.appId &&
    API_CONFIG.ADZUNA.apiKey
  ) {
    apiPromises.push(fetchFromAdzuna(jobType, location, country, limit));
  }

  if (API_CONFIG.INDEED.enabled && API_CONFIG.INDEED.publisherId) {
    apiPromises.push(fetchFromIndeed(jobType, location, country, limit));
  }

  if (
    API_CONFIG.LINKEDIN.enabled &&
    API_CONFIG.LINKEDIN.clientId &&
    API_CONFIG.LINKEDIN.clientSecret
  ) {
    apiPromises.push(fetchFromLinkedIn(jobType, location, country, limit));
  }

  if (API_CONFIG.GITHUB.enabled) {
    apiPromises.push(fetchFromGithub(jobType, location, country, limit));
  }

  if (
    API_CONFIG.GLASSDOOR.enabled &&
    API_CONFIG.GLASSDOOR.partnerId &&
    API_CONFIG.GLASSDOOR.apiKey
  ) {
    apiPromises.push(fetchFromGlassdoor(jobType, location, country, limit));
  }

  const results = await Promise.allSettled(apiPromises);

  const allJobs: Job[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      allJobs.push(...result.value);
    } else {
      const provider = Object.keys(API_CONFIG)[index] as JobProvider;
      console.error(`Falha ao buscar vagas da API ${provider}:`, result.reason);
    }
  });

  return allJobs;
}

async function fetchFromAdzuna(
  keyword: string,
  location: string,
  country: string,
  limit: number
): Promise<Job[]> {
  try {
    const countryCode = mapCountryToAdzunaCode(country);

    const apiUrl = new URL(
      `${API_CONFIG.ADZUNA.baseUrl}/${countryCode}/search/1`
    );
    apiUrl.search = qs.stringify({
      app_id: API_CONFIG.ADZUNA.appId,
      app_key: API_CONFIG.ADZUNA.apiKey,
      results_per_page: limit.toString(),
      what: keyword,
      where: location,
      content_type: "application/json",
    });

    const response = await retry(async () => {
      const res = await fetch(apiUrl.toString(), {
        headers: getCommonHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Adzuna API respondeu com status ${res.status}`);
      }

      return await res.json();
    }, 3);

    // Tipando corretamente o parâmetro 'job' como AdzunaJob
    return (response.results || []).map((job: AdzunaJob) => ({
      id: job.id,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      country: country,
      description: job.description,
      url: job.redirect_url,
      postedAt: new Date(job.created).toISOString(),
      source: "adzuna",
    }));
  } catch (error) {
    console.error("Erro ao buscar vagas da Adzuna:", error);
    return [];
  }
}

async function fetchFromIndeed(
  keyword: string,
  location: string,
  country: string,
  limit: number
): Promise<Job[]> {
  try {
    const apiUrl = new URL(API_CONFIG.INDEED.baseUrl);
    apiUrl.search = qs.stringify({
      publisher: API_CONFIG.INDEED.publisherId,
      q: keyword,
      l: location,
      co: country,
      format: "json",
      limit: limit.toString(),
      highlight: "0",
      filter: "1",
      sort: "date",
    });

    const response = await retry(async () => {
      const res = await fetch(apiUrl.toString(), {
        headers: getCommonHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Indeed API respondeu com status ${res.status}`);
      }

      return await res.json();
    }, 3);

    // Tipando corretamente o parâmetro 'job' como AdzunaJob (assumindo estrutura similar)
    return (response.results || []).map((job: AdzunaJob) => ({
      id: job.id,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      country: country,
      description: job.description,
      url: job.redirect_url,
      postedAt: new Date(job.created).toISOString(),
      source: "adzuna",
    }));
  } catch (error) {
    console.error("Erro ao buscar vagas do Indeed:", error);
    return [];
  }
}

async function fetchFromLinkedIn(
  keyword: string,
  location: string,
  country: string,
  limit: number
): Promise<Job[]> {
  console.log("Buscando do LinkedIn (simulado):", keyword, location);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [];
}

async function fetchFromGithub(
  keyword: string,
  location: string,
  country: string,
  limit: number
): Promise<Job[]> {
  try {
    const apiUrl = new URL(API_CONFIG.GITHUB.baseUrl);
    apiUrl.search = qs.stringify({
      description: keyword,
      location: `${location}, ${country}`,
      full_time: "true",
    });

    const response = await retry(async () => {
      const res = await fetch(apiUrl.toString(), {
        headers: getCommonHeaders(),
      });

      if (!res.ok) {
        throw new Error(`GitHub Jobs API respondeu com status ${res.status}`);
      }

      return await res.json();
    }, 3);

    return (response || []).slice(0, limit).map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      country: country,
      description: job.description,
      url: job.url,
      postedAt: job.created_at,
      source: "github",
    }));
  } catch (error) {
    console.error("Erro ao buscar vagas do GitHub:", error);
    return [];
  }
}

async function fetchFromGlassdoor(
  keyword: string,
  location: string,
  country: string,
  limit: number
): Promise<Job[]> {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const signature = createHmac("sha1", API_CONFIG.GLASSDOOR.apiKey || "")
      .update(`${API_CONFIG.GLASSDOOR.partnerId}${timestamp}`)
      .digest("hex");

    const apiUrl = new URL(API_CONFIG.GLASSDOOR.baseUrl);
    apiUrl.search = qs.stringify({
      v: "1",
      format: "json",
      "t.p": API_CONFIG.GLASSDOOR.partnerId,
      "t.k": API_CONFIG.GLASSDOOR.apiKey,
      userip: "0.0.0.0",
      useragent: getRandomUserAgent(),
      action: "jobs",
      keyword: keyword,
      location: location,
      countryId: mapCountryToGlassdoorId(country),
      fromAge: "30",
      jobType: "fulltime",
      "t.ts": timestamp,
      "t.sig": signature,
    });

    const response = await retry(async () => {
      const res = await fetch(apiUrl.toString(), {
        headers: getCommonHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Glassdoor API respondeu com status ${res.status}`);
      }

      return await res.json();
    }, 3);

    const jobs = response?.response?.jobListings || [];
    return jobs.slice(0, limit).map((job: any) => ({
      id: job.jobListingId,
      title: job.jobTitle,
      company: job.employer.name,
      location: job.location,
      country: country,
      description: job.descriptionFragment,
      url: job.jobViewUrl,
      postedAt: new Date(job.postingDatePst).toISOString(),
      source: "glassdoor",
    }));
  } catch (error) {
    console.error("Erro ao buscar vagas do Glassdoor:", error);
    return [];
  }
}

function mapCountryToAdzunaCode(country: string): string {
  const countryMap: Record<string, string> = {
    brasil: "br",
    brazil: "br",
    "united states": "us",
    "estados unidos": "us",
    canada: "ca",
    uk: "gb",
    "united kingdom": "gb",
    "reino unido": "gb",
    australia: "au",
    germany: "de",
    alemanha: "de",
    france: "fr",
    frança: "fr",
    india: "in",
    índia: "in",
    italy: "it",
    itália: "it",
    netherlands: "nl",
    holanda: "nl",
    poland: "pl",
    polônia: "pl",
    russia: "ru",
    rússia: "ru",
    singapore: "sg",
    singapura: "sg",
    "south africa": "za",
    "áfrica do sul": "za",
  };

  const normalizedCountry = country.toLowerCase();
  return countryMap[normalizedCountry] || "br";
}

function mapCountryToGlassdoorId(country: string): string {
  const countryMap: Record<string, string> = {
    brasil: "1",
    brazil: "1",
    "united states": "1",
    "estados unidos": "1",
    canada: "2",
    uk: "2",
    "united kingdom": "2",
    "reino unido": "2",
    australia: "3",
    germany: "4",
    alemanha: "4",
    france: "5",
    frança: "5",
  };

  const normalizedCountry = country.toLowerCase();
  return countryMap[normalizedCountry] || "1";
}
