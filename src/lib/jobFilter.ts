import { Job } from "./types";

export function filterJobs(
  jobs: Job[],
  filters: {
    location?: string;
    country?: string;
    jobType?: string;
    maxDaysOld?: number;
    keywords?: string[];
    excludeKeywords?: string[];
    minSalary?: number;
    maxSalary?: number;
    seniorityLevel?: string[];
    remoteOnly?: boolean;
  }
): Job[] {
  if (!jobs || jobs.length === 0) {
    return [];
  }

  return jobs.filter((job) => {
    if (filters.location && filters.location.trim() !== "") {
      const locationMatch = matchesLocation(job.location, filters.location);
      if (!locationMatch) {
        return false;
      }
    }

    if (filters.country && filters.country.trim() !== "") {
      const countryMatch = matchesCountry(job.country, filters.country);
      if (!countryMatch) {
        return false;
      }
    }

    if (filters.jobType && filters.jobType.trim() !== "") {
      const jobTypeMatch = matchesJobType(job, filters.jobType);
      if (!jobTypeMatch) {
        return false;
      }
    }

    if (filters.maxDaysOld) {
      const jobDate = new Date(job.postedAt);
      const daysOld = Math.floor(
        (Date.now() - jobDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysOld > filters.maxDaysOld) {
        return false;
      }
    }

    if (filters.keywords && filters.keywords.length > 0) {
      const jobText =
        `${job.title} ${job.company} ${job.description}`.toLowerCase();
      const hasAnyKeyword = filters.keywords.some((keyword) =>
        jobText.includes(keyword.toLowerCase())
      );
      if (!hasAnyKeyword) {
        return false;
      }
    }

    if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
      const jobText =
        `${job.title} ${job.company} ${job.description}`.toLowerCase();
      const hasExcludedKeyword = filters.excludeKeywords.some((keyword) =>
        jobText.includes(keyword.toLowerCase())
      );
      if (hasExcludedKeyword) {
        return false;
      }
    }

    if (job.salary) {
      const salaryRange = extractSalaryRange(job.salary);

      if (filters.minSalary && salaryRange.min < filters.minSalary) {
        return false;
      }

      if (filters.maxSalary && salaryRange.max > filters.maxSalary) {
        return false;
      }
    }

    if (
      filters.seniorityLevel &&
      filters.seniorityLevel.length > 0 &&
      job.metadata?.seniorityLevel
    ) {
      if (!filters.seniorityLevel.includes(job.metadata.seniorityLevel)) {
        return false;
      }
    }

    if (filters.remoteOnly) {
      const isRemote = isRemoteJob(job);
      if (!isRemote) {
        return false;
      }
    }

    return true;
  });
}

function matchesLocation(jobLocation: string, searchLocation: string): boolean {
  if (!jobLocation || !searchLocation) return false;

  const normalizedJobLocation = jobLocation.toLowerCase().trim();
  const normalizedSearchLocation = searchLocation.toLowerCase().trim();

  if (normalizedJobLocation.includes(normalizedSearchLocation)) {
    return true;
  }

  const jobParts = normalizedJobLocation.split(/[\s,-\/]+/);
  const searchParts = normalizedSearchLocation.split(/[\s,-\/]+/);

  for (const searchPart of searchParts) {
    if (searchPart.length < 3) continue;

    for (const jobPart of jobParts) {
      if (jobPart.includes(searchPart) || searchPart.includes(jobPart)) {
        return true;
      }
    }
  }

  return false;
}

function matchesCountry(jobCountry: string, searchCountry: string): boolean {
  if (!jobCountry || !searchCountry) return false;

  const normalizedJobCountry = jobCountry.toLowerCase().trim();
  const normalizedSearchCountry = searchCountry.toLowerCase().trim();

  if (normalizedJobCountry.includes(normalizedSearchCountry)) {
    return true;
  }

  const countryMap: Record<string, string[]> = {
    brasil: ["br", "brazil", "brazilian"],
    brazil: ["br", "brasil", "brazilian"],
    "estados unidos": ["us", "usa", "united states", "america", "eua"],
    "united states": ["us", "usa", "eua", "estados unidos", "america"],
    canada: ["ca", "canadá", "canadian"],
    "reino unido": [
      "uk",
      "united kingdom",
      "great britain",
      "england",
      "inglaterra",
    ],
    "united kingdom": [
      "uk",
      "reino unido",
      "great britain",
      "england",
      "inglaterra",
    ],
  };

  for (const [country, synonyms] of Object.entries(countryMap)) {
    if (
      country === normalizedSearchCountry ||
      synonyms.includes(normalizedSearchCountry)
    ) {
      if (
        country === normalizedJobCountry ||
        synonyms.includes(normalizedJobCountry)
      ) {
        return true;
      }
    }
  }

  return false;
}

function matchesJobType(job: Job, searchJobType: string): boolean {
  const jobTextToSearch = `${job.title} ${job.description}`.toLowerCase();
  const normalizedSearchJobType = searchJobType.toLowerCase().trim();

  if (jobTextToSearch.includes(normalizedSearchJobType)) {
    return true;
  }

  const searchTerms = normalizedSearchJobType.split(/\s+/);

  let matchCount = 0;
  for (const term of searchTerms) {
    if (term.length < 3) continue;

    if (jobTextToSearch.includes(term)) {
      matchCount++;
    }
  }

  const matchRate = matchCount / searchTerms.length;
  if (matchRate >= 0.6) {
    return true;
  }

  if (job.metadata?.categories) {
    const jobTypeToCategories: Record<string, string[]> = {
      frontend: ["frontend", "web", "design", "ui"],
      backend: ["backend", "server", "database", "api"],
      fullstack: ["frontend", "backend", "fullstack"],
      mobile: ["mobile", "android", "ios"],
      devops: ["devops", "cloud", "infrastructure", "security"],
      data: ["data", "analytics", "machine learning", "ai"],
      ux: ["design", "ui", "ux"],
      qa: ["qa", "testing", "quality"],
    };

    for (const [jobTypeKey, categories] of Object.entries(
      jobTypeToCategories
    )) {
      if (normalizedSearchJobType.includes(jobTypeKey)) {
        if (
          job.metadata.categories.some((category) =>
            categories.includes(category)
          )
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

function extractSalaryRange(salaryString: string): {
  min: number;
  max: number;
} {
  if (!salaryString) {
    return { min: 0, max: 0 };
  }

  const normalizedSalary = salaryString.replace(/[^\d.,\s-]/g, "");
  const numbers = normalizedSalary.match(/\d[\d.,]*/g);

  // Verifica se numbers é null antes de acessar os índices
  const min =
    numbers && numbers.length > 0
      ? parseFloat(numbers[0].replace(/,/g, "."))
      : 0;
  const max =
    numbers && numbers.length > 1
      ? parseFloat(numbers[1].replace(/,/g, "."))
      : 0;

  return { min, max };
}

function isRemoteJob(job: Job): boolean {
  const jobText =
    `${job.title} ${job.location} ${job.description}`.toLowerCase();

  const remoteKeywords = [
    "remoto",
    "remote",
    "home office",
    "trabalho remoto",
    "remote work",
    "trabalho a distância",
    "trabalho em casa",
    "work from home",
    "wfh",
    "anywhere",
    "qualquer lugar",
    "teletrabalho",
    "telework",
  ];

  return remoteKeywords.some((keyword) => jobText.includes(keyword));
}

export function rankJobsByRelevance(jobs: Job[], searchTerms: string[]): Job[] {
  return [...jobs].sort((a, b) => {
    const aScore = calculateRelevanceScore(a, searchTerms);
    const bScore = calculateRelevanceScore(b, searchTerms);

    if (bScore === aScore) {
      const aDate = new Date(a.postedAt);
      const bDate = new Date(b.postedAt);
      return bDate.getTime() - aDate.getTime();
    }

    return bScore - aScore;
  });
}

function calculateRelevanceScore(job: Job, searchTerms: string[]): number {
  let score = 0;

  const titleText = job.title.toLowerCase();
  const companyText = job.company.toLowerCase();
  const descriptionText = job.description.toLowerCase();

  if (job.qualityScore) {
    score += job.qualityScore * 0.5;
  }

  if (job.metadata?.relevanceScore) {
    score += job.metadata.relevanceScore * 0.7;
  }

  searchTerms.forEach((term) => {
    const termLower = term.toLowerCase();

    if (titleText === termLower) {
      score += 50;
    } else if (titleText.includes(termLower)) {
      score += 20;

      const regex = new RegExp(`\\b${termLower}\\b`, "i");
      if (regex.test(titleText)) {
        score += 15;
      }
    }

    if (companyText.includes(termLower)) {
      score += 10;

      if (companyText === termLower) {
        score += 15;
      }
    }

    if (descriptionText.includes(termLower)) {
      score += 5;

      const matches = descriptionText.match(new RegExp(termLower, "g")) || [];
      score += Math.min(matches.length, 5);
    }
  });

  const daysOld = Math.floor(
    (Date.now() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  score += Math.max(0, 30 - daysOld);

  if (job.metadata?.techStack) {
    const relevantTechCount = job.metadata.techStack.filter((tech) =>
      searchTerms.some((term) => tech.includes(term) || term.includes(tech))
    ).length;

    score += relevantTechCount * 3;
  }

  return score;
}
