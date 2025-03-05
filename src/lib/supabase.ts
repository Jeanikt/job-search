import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Criar um cliente Supabase singleton para uso em toda a aplicação
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Função para verificar se o usuário é premium
export async function isUserPremium(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_premium, premium_until')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Erro ao verificar status premium:', error);
      return false;
    }
    
    if (!data) return false;
    
    // Verificar se o usuário é premium e se a assinatura ainda está válida
    if (data.is_premium && data.premium_until) {
      const premiumUntil = new Date(data.premium_until);
      return premiumUntil > new Date();
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar status premium:', error);
    return false;
  }
}

// Função para verificar se o usuário já fez uma busca hoje
export async function hasUserSearchedToday(email: string): Promise<boolean> {
  try {
    // Obter o usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, last_search_date')
      .eq('email', email)
      .single();
    
    if (userError || !user) return false;
    
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
    console.error('Erro ao verificar buscas do usuário:', error);
    return false;
  }
}

// Função para registrar uma busca
export async function registerSearch(
  email: string, 
  location: string, 
  country: string, 
  jobType: string
): Promise<boolean> {
  try {
    // Verificar se o usuário existe
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    let userId: string;
    
    // Se o usuário não existir, criar um novo
    if (userError || !existingUser) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          searches_count: 1,
          last_search_date: new Date().toISOString(),
        })
        .select('id')
        .single();
      
      if (createError || !newUser) {
        console.error('Erro ao criar usuário:', createError);
        return false;
      }
      
      userId = newUser.id;
    } else {
      // Atualizar usuário existente
      userId = existingUser.id;
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          searches_count: supabase.rpc('increment', { x: 1 }),
          last_search_date: new Date().toISOString(),
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Erro ao atualizar usuário:', updateError);
        return false;
      }
    }
    
    // Registrar a busca
    const { error: searchError } = await supabase
      .from('searches')
      .insert({
        user_id: userId,
        location,
        country,
        job_type: jobType,
      });
    
    if (searchError) {
      console.error('Erro ao registrar busca:', searchError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao registrar busca:', error);
    return false;
  }
}

// Função para buscar vagas
export async function getJobs(filters: {
  location?: string;
  country?: string;
  jobType?: string;
  page?: number;
  limit?: number;
}) {
  const {
    location,
    country,
    jobType,
    page = 1,
    limit = 10
  } = filters;
  
  let query = supabase
    .from('jobs')
    .select('*', { count: 'exact' });
  
  // Aplicar filtros
  if (location) {
    query = query.ilike('location', `%${location}%`);
  }
  
  if (country) {
    query = query.ilike('country', `%${country}%`);
  }
  
  if (jobType) {
    query = query.ilike('title', `%${jobType}%`);
  }
  
  // Aplicar paginação
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await query
    .order('posted_at', { ascending: false })
    .range(from, to);
  
  if (error) {
    console.error('Erro ao buscar vagas:', error);
    return { jobs: [], totalCount: 0 };
  }
  
  return {
    jobs: data || [],
    totalCount: count || 0
  };
}