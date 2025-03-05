// Tipos para o sistema de busca de vagas

// Tipo para representar uma vaga de emprego
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  description: string;
  url: string;
  postedAt: Date | string;
}

// Tipo para parâmetros de busca
export interface SearchParams {
  email: string;
  location: string;
  country: string;
  jobType: string;
}

// Tipo para resposta da API de busca
export interface SearchResponse {
  success: boolean;
  message: string;
  jobCount?: number;
  jobs?: Job[];
}

// Tipo para status de usuário
export interface UserStatus {
  email: string;
  isPremium: boolean;
  searchesCount: number;
  lastSearchDate: Date | null;
  premiumUntil: Date | null;
}

// Tipo para resposta da API de pagamento
export interface PaymentResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
  paymentId?: string;
}

// Tipos para o Supabase
export interface SupabaseJob {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  description: string;
  url: string;
  posted_at: string;
  created_at: string;
}

export interface SupabaseUser {
  id: string;
  email: string;
  is_premium: boolean;
  premium_until: string | null;
  searches_count: number;
  last_search_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseSearch {
  id: string;
  user_id: string;
  location: string;
  country: string;
  job_type: string;
  created_at: string;
}