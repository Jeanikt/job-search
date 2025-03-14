import { Job } from "../types";
import MiniSearch from "minisearch";

let titleIndex: MiniSearch;
let descriptionIndex: MiniSearch;

export function createSearchIndex(jobs: Job[]): void {
  titleIndex = new MiniSearch({
    fields: ["title", "company"],
    storeFields: ["id"],
    tokenize: (text: string) => text.toLowerCase().split(/[\s-/]+/),
    processTerm: (term: string) => (term.length >= 2 ? term : null),
  });

  descriptionIndex = new MiniSearch({
    fields: ["description"],
    storeFields: ["id"],
    tokenize: (text: string) => text.toLowerCase().split(/[\s-/]+/),
    processTerm: (term: string) => (term.length >= 3 ? term : null),
  });

  titleIndex.addAll(
    jobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
    }))
  );

  descriptionIndex.addAll(
    jobs.map((job) => ({
      id: job.id,
      description: job.description,
    }))
  );
}

export function searchInIndex(
  query: string,
  options?: {
    boost?: Record<string, number>;
    fuzzy?: number;
  }
): {
  titleMatches: string[];
  descriptionMatches: string[];
} {
  if (!titleIndex || !descriptionIndex) {
    throw new Error("Índices de busca não foram inicializados");
  }

  const titleResults = titleIndex.search(query, {
    boost: { title: 2, company: 1, ...options?.boost },
    fuzzy: options?.fuzzy || 0.2,
    prefix: true,
  });

  const descriptionResults = descriptionIndex.search(query, {
    boost: { description: 1, ...options?.boost },
    fuzzy: options?.fuzzy || 0.2,
    prefix: true,
  });

  return {
    titleMatches: titleResults.map((result: any) => result.id),
    descriptionMatches: descriptionResults.map((result: any) => result.id),
  };
}

export function updateJobInIndex(job: Job): void {
  if (!titleIndex || !descriptionIndex) {
    throw new Error("Índices de busca não foram inicializados");
  }

  titleIndex.remove({ id: job.id });
  descriptionIndex.remove({ id: job.id });

  titleIndex.add({
    id: job.id,
    title: job.title,
    company: job.company,
  });

  descriptionIndex.add({
    id: job.id,
    description: job.description,
  });
}

export function removeJobFromIndex(jobId: string): void {
  if (!titleIndex || !descriptionIndex) {
    throw new Error("Índices de busca não foram inicializados");
  }

  titleIndex.remove({ id: jobId });
  descriptionIndex.remove({ id: jobId });
}
