import { createClient } from "@supabase/supabase-js";
import { Job } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getJobs(params: {
  location?: string;
  country?: string;
  jobType?: string;
  limit?: number;
  page?: number;
}): Promise<{ jobs: any[]; totalCount: number }> {
  const { location, country, limit = 10, page = 1 } = params;

  // Consulta base
  let query = supabase.from("jobs").select("*", { count: "exact" });

  // Aplicar filtros
  if (location) {
    query = query.ilike("location", `%${location}%`);
  }
  if (country) {
    query = query.ilike("country", `%${country}%`);
  }

  // Aplicar paginação
  query = query
    .order("posted_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  const { data: jobs, error: jobsError, count } = await query;

  if (jobsError) {
    console.error("Erro ao buscar vagas:", jobsError);
    return { jobs: [], totalCount: 0 };
  }

  return {
    jobs: jobs || [],
    totalCount: count || 0,
  };
}

export async function isUserPremium(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("is_premium, premium_until")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Erro ao verificar status premium:", error);
      return false;
    }

    if (!data) return false;

    if (!data.is_premium) return false;

    if (data.premium_until) {
      const premiumUntil = new Date(data.premium_until);
      if (premiumUntil < new Date()) return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao verificar status premium:", error);
    return false;
  }
}

export async function hasUserSearchedToday(email: string): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Primeiro, obter o user_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      console.error("Erro ao buscar usuário:", userError);
      return false;
    }

    const { data, error } = await supabase
      .from("searches")
      .select("created_at")
      .eq("user_id", userData.id)
      .gte("created_at", today.toISOString())
      .limit(1);

    if (error) {
      console.error("Erro ao verificar buscas do usuário:", error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error("Erro ao verificar buscas do usuário:", error);
    return false;
  }
}

export async function registerSearch(
  email: string,
  location: string,
  country: string,
  jobType: string
): Promise<void> {
  try {
    // Primeiro, obter o user_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      console.error("Erro ao buscar usuário:", userError);
      return;
    }

    const { error } = await supabase.from("searches").insert({
      user_id: userData.id,
      location,
      country,
      job_type: jobType,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Erro ao registrar busca:", error);
    }
  } catch (error) {
    console.error("Erro ao registrar busca:", error);
  }
}

export async function incrementSearchCount(email: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("searches_count")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Erro ao buscar contagem de buscas:", error);
      return;
    }

    const currentCount = data?.searches_count || 0;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        searches_count: currentCount + 1,
        last_search_date: new Date().toISOString(),
      })
      .eq("email", email);

    if (updateError) {
      console.error("Erro ao atualizar contagem de buscas:", updateError);
    }
  } catch (error) {
    console.error("Erro ao incrementar contagem de buscas:", error);
  }
}

export async function cacheJobResults(
  cacheKey: string,
  jobs: Job[]
): Promise<void> {
  try {
    const { error } = await supabase.from("job_cache").upsert({
      cache_key: cacheKey,
      jobs_data: jobs,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Erro ao armazenar cache de vagas:", error);
    }
  } catch (error) {
    console.error("Erro ao armazenar cache de vagas:", error);
  }
}

export async function getCachedResults(
  cacheKey: string
): Promise<Job[] | null> {
  try {
    const { data, error } = await supabase
      .from("job_cache")
      .select("jobs_data, created_at")
      .eq("cache_key", cacheKey)
      .single();

    if (error || !data) {
      return null;
    }

    const cacheDate = new Date(data.created_at);
    const now = new Date();
    const cacheAgeMs = now.getTime() - cacheDate.getTime();
    const cacheMaxAgeMs = 10 * 60 * 1000; // 10 minutos

    if (cacheAgeMs > cacheMaxAgeMs) {
      return null;
    }

    return data.jobs_data as Job[];
  } catch (error) {
    console.error("Erro ao buscar cache de vagas:", error);
    return null;
  }
}
