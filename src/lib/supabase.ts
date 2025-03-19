import { createClient } from "@supabase/supabase-js";
import { Job } from "./types";
import { generateMockJobs } from "./mockData";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getJobs(params: {
  location?: string;
  country?: string;
  jobType?: string;
  limit?: number;
  page?: number;
}): Promise<{ jobs: any[]; totalCount: number }> {
  const { location, country, jobType, limit = 10, page = 1 } = params;

  try {
    console.log(`Buscando vagas no Supabase com parâmetros:`, params);

    // Consulta base
    let query = supabase.from("jobs").select("*", { count: "exact" });

    // Aplicar filtros
    if (location) {
      query = query.ilike("location", `%${location}%`);
    }
    if (country) {
      query = query.ilike("country", `%${country}%`);
    }
    if (jobType) {
      // Busca mais ampla para o tipo de vaga (título ou descrição)
      query = query.or(
        `title.ilike.%${jobType}%,description.ilike.%${jobType}%`
      );
    }

    // Aplicar paginação
    query = query
      .order("posted_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data: jobs, error: jobsError, count } = await query;

    if (jobsError) {
      console.error("Erro ao buscar vagas:", jobsError);
      // Fallback para dados mockados se houver erro
      const mockJobs = generateMockJobs(
        location || "",
        country || "",
        jobType || "",
        limit
      );
      return { jobs: mockJobs, totalCount: mockJobs.length };
    }

    console.log(`Encontradas ${jobs?.length || 0} vagas no banco de dados`);

    // Se não encontrou vagas, gerar dados mockados
    if (!jobs || jobs.length === 0) {
      console.log("Nenhuma vaga encontrada no banco, gerando dados mockados");
      const mockJobs = generateMockJobs(
        location || "",
        country || "",
        jobType || "",
        limit
      );
      return { jobs: mockJobs, totalCount: mockJobs.length };
    }

    return {
      jobs: jobs,
      totalCount: count || 0,
    };
  } catch (error) {
    console.error("Erro inesperado ao buscar vagas:", error);
    // Fallback para dados mockados em caso de erro
    const mockJobs = generateMockJobs(
      location || "",
      country || "",
      jobType || "",
      limit
    );
    return { jobs: mockJobs, totalCount: mockJobs.length };
  }
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
    // Verificar se o usuário existe
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, last_search_date")
      .eq("email", email)
      .single();

    if (userError) {
      // Se o usuário não existir, criar um novo
      if (userError.code === "PGRST116") {
        await createUser(email);
        return false;
      }
      console.error("Erro ao buscar usuário:", userError);
      return false;
    }

    if (!user) return false;

    // Verificar se o usuário já fez uma busca hoje
    if (user.last_search_date) {
      const lastSearchDate = new Date(user.last_search_date);
      const today = new Date();

      return (
        lastSearchDate.getDate() === today.getDate() &&
        lastSearchDate.getMonth() === today.getMonth() &&
        lastSearchDate.getFullYear() === today.getFullYear()
      );
    }

    return false;
  } catch (error) {
    console.error("Erro ao verificar buscas do usuário:", error);
    return false;
  }
}

export async function createUser(email: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert({
        email,
        is_premium: false,
        searches_count: 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Erro ao criar usuário:", error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return null;
  }
}

export async function registerSearch(
  email: string,
  location: string,
  country: string,
  jobType: string
): Promise<boolean> {
  try {
    // Verificar se o usuário existe
    let { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    // Se o usuário não existir, criar um novo
    if (userError || !user) {
      const userId = await createUser(email);
      if (!userId) return false;
      user = { id: userId };
    }

    // Registrar a busca
    const { error } = await supabase.from("searches").insert({
      user_id: user.id,
      location,
      country,
      job_type: jobType,
    });

    if (error) {
      console.error("Erro ao registrar busca:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao registrar busca:", error);
    return false;
  }
}

export async function incrementSearchCount(email: string): Promise<void> {
  try {
    // Verificar se o usuário existe
    let { data: user, error: userError } = await supabase
      .from("users")
      .select("id, searches_count")
      .eq("email", email)
      .single();

    // Se o usuário não existir, criar um novo
    if (userError || !user) {
      const userId = await createUser(email);
      if (!userId) return;
      user = { id: userId, searches_count: 0 };
    }

    const currentCount = user.searches_count || 0;

    // Atualizar contagem de buscas
    const { error } = await supabase
      .from("users")
      .update({
        searches_count: currentCount + 1,
        last_search_date: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Erro ao atualizar contagem de buscas:", error);
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
