export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  description: string;
  url: string;
  postedAt: Date | string;
  source?: string;
  salary?: string;
  metadata?: {
    categories?: string[];
    techStack?: string[];
    seniorityLevel?: string;
    relevanceScore?: number;
  };
  qualityScore?: number;
}

export interface SearchParams {
  email: string;
  location: string;
  country: string;
  jobType: string;
}

export interface SearchResponse {
  success: boolean;
  message: string;
  jobCount?: number;
  jobs?: Job[];
  totalJobs?: number;
  totalPages?: number;
  currentPage?: number;
  executionTimeMs?: number;
  isPremium?: boolean;
}

export interface UserStatus {
  email: string;
  isPremium: boolean;
  searchesCount: number;
  lastSearchDate: Date | null;
  premiumUntil: Date | null;
}
