import { Job } from "../types";
import similarity from "string-similarity";
import { extractSearchTerms } from "../searchTerms";

export async function calculateJobSimilarity(
  jobs: Job[],
  jobType: string
): Promise<number[]> {
  const searchTerms = extractSearchTerms(jobType);
  const queryText = searchTerms.join(" ");

  return jobs.map((job) => {
    const jobText = `${job.title} ${job.company} ${job.description.substring(
      0,
      300
    )}`;

    const similarityScore = similarity.compareTwoStrings(
      queryText.toLowerCase(),
      jobText.toLowerCase()
    );

    const postedDate = new Date(job.postedAt);
    const now = new Date();
    const daysOld = Math.floor(
      (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const recencyFactor = Math.max(0, 1 - daysOld / 60);

    return similarityScore * 0.7 + recencyFactor * 0.3;
  });
}

export function removeDuplicateJobs(jobs: Job[]): Job[] {
  const uniqueJobs = new Map<string, Job>();

  jobs.forEach((job) => {
    const key = `${job.title.toLowerCase().trim()}-${job.company
      .toLowerCase()
      .trim()}`;

    if (uniqueJobs.has(key)) {
      const existingJob = uniqueJobs.get(key)!;
      const existingDate = new Date(existingJob.postedAt);
      const currentDate = new Date(job.postedAt);

      if (currentDate > existingDate) {
        uniqueJobs.set(key, job);
      }
    } else {
      uniqueJobs.set(key, job);
    }
  });

  return Array.from(uniqueJobs.values());
}

export async function enrichJobData(jobs: Job[]): Promise<Job[]> {
  return jobs.map((job) => {
    const qualityScore = calculateJobQualityScore(job);

    return {
      ...job,
      qualityScore,
      description:
        job.description.length > 2000
          ? job.description.substring(0, 2000) + "..."
          : job.description,
    };
  });
}

export function normalizeJobTitles(jobs: Job[]): Job[] {
  return jobs.map((job) => {
    let normalizedTitle = job.title;

    normalizedTitle = normalizedTitle
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    normalizedTitle = normalizedTitle
      .replace(/Desenvolvedor\s+De\s+Software/i, "Desenvolvedor de Software")
      .replace(/Software\s+Developer/i, "Software Developer")
      .replace(/Programador\s+(\w+)/i, "Desenvolvedor $1")
      .replace(/Dev\s+(\w+)/i, "Desenvolvedor $1")
      .replace(/Engenheiro\s+De\s+Software/i, "Engenheiro de Software")
      .replace(/Software\s+Engineer/i, "Software Engineer")
      .replace(/Front[-\s]?End/i, "Frontend")
      .replace(/Back[-\s]?End/i, "Backend")
      .replace(/Full[-\s]?Stack/i, "Fullstack");

    return {
      ...job,
      title: normalizedTitle,
    };
  });
}

function calculateJobQualityScore(job: Job): number {
  let score = 0;

  if (job.title.length > 10 && job.title.length < 100) {
    score += 10;
  }

  if (job.description.length > 200) {
    score += Math.min(20, job.description.length / 100);
  }

  const postedDate = new Date(job.postedAt);
  const now = new Date();
  const daysOld = Math.floor(
    (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysOld < 7) {
    score += 20;
  } else if (daysOld < 14) {
    score += 15;
  } else if (daysOld < 30) {
    score += 10;
  }

  if (job.location.length > 3) {
    score += 5;
  }

  if (job.url && job.url.includes("http")) {
    score += 5;
  }

  return score;
}
