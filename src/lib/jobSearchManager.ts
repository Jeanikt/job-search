import { Job } from './types';
import { filterJobs, rankJobsByRelevance } from './jobFilter';
import { extractSearchTerms } from './searchTerms';
import { sendJobsEmail } from './emailSender';
import { supabase, getJobs } from './supabase';
import { retry } from './utils/retry';

// Função principal para gerenciar o processo de busca de vagas
export async function searchJobs(params: {
  email: string;
  location: string;
  country: string;
  jobType: string;
  isPremium?: boolean;
}): Promise<{ success: boolean; message: string; jobCount?: number }> {
  try {
    // Extrair termos de busca do tipo de vaga
    const searchTerms = extractSearchTerms(params.jobType);
    
    // Buscar vagas
    const { jobs: fetchedJobs } = await getJobs({
      location: params.location,
      country: params.country,
      jobType: params.jobType,
      limit: 100 // Buscar um número maior para depois filtrar e classificar
    });
    
    // Converter para o formato Job
    const jobs: Job[] = fetchedJobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      country: job.country,
      description: job.description,
      url: job.url,
      postedAt: job.posted_at
    }));
    
    // Filtrar e classificar vagas
    const filteredJobs = filterJobs(jobs, {
      location: params.location,
      country: params.country,
      jobType: params.jobType,
      maxDaysOld: 30, // Vagas de até 30 dias
    });
    
    const rankedJobs = rankJobsByRelevance(filteredJobs, searchTerms);
    
    // Limitar número de vagas para usuários não premium
    const limitedJobs = params.isPremium ? rankedJobs : rankedJobs.slice(0, 10);
    
    // Enviar email com as vagas
    await sendJobsEmail(params.email, limitedJobs, {
      location: params.location,
      country: params.country,
      jobType: params.jobType,
    });
    
    return { 
      success: true,
      message: 'Busca realizada com sucesso! Você receberá as vagas no seu email em breve.',
      jobCount: limitedJobs.length,
    };
    
  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    return {
      success: false,
      message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
    };
  }
}

// Função para buscar vagas de diferentes fontes (simulação)
export async function fetchJobsFromSources(params: {
  location: string;
  country: string;
  jobType: string;
}): Promise<Job[]> {
  // Simulação de busca de vagas
  // Em produção, isso seria substituído por chamadas a APIs reais de emprego
  
  // Simular atraso de rede
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Gerar vagas fictícias
  const mockJobs: Job[] = [];
  const companies = ['TechCorp', 'InnovaSoft', 'DevMasters', 'CodeGenius', 'DataTech'];
  const jobTitles = [
    `Desenvolvedor ${params.jobType}`,
    `Engenheiro de Software ${params.jobType}`,
    `${params.jobType} Sênior`,
    `${params.jobType} Pleno`,
    `${params.jobType} Júnior`,
  ];
  
  // Gerar entre 15-25 vagas fictícias
  const jobCount = Math.floor(Math.random() * 10) + 15;
  
  for (let i = 0; i < jobCount; i++) {
    const randomDays = Math.floor(Math.random() * 30); // Vagas de até 30 dias atrás
    const postedDate = new Date();
    postedDate.setDate(postedDate.getDate() - randomDays);
    
    mockJobs.push({
      id: `job-${i}`,
      title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      company: companies[Math.floor(Math.random() * companies.length)],
      location: params.location,
      country: params.country,
      description: `Esta é uma excelente oportunidade para trabalhar como ${params.jobType} em uma empresa inovadora. Buscamos profissionais com experiência em desenvolvimento de software, trabalho em equipe e resolução de problemas complexos.`,
      url: `https://example.com/jobs/${i}`,
      postedAt: postedDate,
    });
  }
  
  return mockJobs;
}