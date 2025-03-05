import { filterJobs, rankJobsByRelevance } from '@/lib/jobFilter';
import { Job } from '@/lib/types';

describe('Job Filter Functions', () => {
  // Dados de teste
  const testJobs: Job[] = [
    {
      id: '1',
      title: 'Desenvolvedor Frontend React',
      company: 'TechCorp',
      location: 'São Paulo',
      country: 'Brasil',
      description: 'Vaga para desenvolvedor frontend com experiência em React, TypeScript e CSS.',
      url: 'https://example.com/job1',
      postedAt: new Date('2025-01-15'),
    },
    {
      id: '2',
      title: 'Desenvolvedor Backend Node.js',
      company: 'InnovaSoft',
      location: 'Rio de Janeiro',
      country: 'Brasil',
      description: 'Buscamos desenvolvedor backend com conhecimento em Node.js, Express e MongoDB.',
      url: 'https://example.com/job2',
      postedAt: new Date('2025-01-10'),
    },
    {
      id: '3',
      title: 'Engenheiro de Software Frontend',
      company: 'CodeGenius',
      location: 'São Paulo',
      country: 'Brasil',
      description: 'Vaga para engenheiro de software frontend com foco em performance e acessibilidade.',
      url: 'https://example.com/job3',
      postedAt: new Date('2025-01-05'),
    },
    {
      id: '4',
      title: 'Desenvolvedor Frontend Angular',
      company: 'DataTech',
      location: 'Belo Horizonte',
      country: 'Brasil',
      description: 'Vaga para desenvolvedor frontend com experiência em Angular e TypeScript.',
      url: 'https://example.com/job4',
      postedAt: new Date('2024-12-20'),
    },
  ];

  describe('filterJobs', () => {
    it('filtra vagas por localização', () => {
      const filtered = filterJobs(testJobs, { location: 'São Paulo' });
      expect(filtered).toHaveLength(2);
      expect(filtered.map(job => job.id)).toEqual(['1', '3']);
    });

    it('filtra vagas por país', () => {
      const filtered = filterJobs(testJobs, { country: 'Brasil' });
      expect(filtered).toHaveLength(4); // Todos são do Brasil
    });

    it('filtra vagas por tipo de vaga', () => {
      const filtered = filterJobs(testJobs, { jobType: 'Frontend' });
      expect(filtered).toHaveLength(3);
      expect(filtered.map(job => job.id)).toEqual(['1', '3', '4']);
    });

    it('filtra vagas por múltiplos critérios', () => {
      const filtered = filterJobs(testJobs, { 
        location: 'São Paulo',
        jobType: 'Frontend'
      });
      expect(filtered).toHaveLength(2);
      expect(filtered.map(job => job.id)).toEqual(['1', '3']);
    });

    it('filtra vagas por data de publicação', () => {
      // Configurar data atual para um valor fixo para o teste
      const realDate = Date;
      global.Date.now = jest.fn(() => new Date('2025-01-20').getTime());
      
      const filtered = filterJobs(testJobs, { maxDaysOld: 10 });
      
      // Restaurar Date original
      global.Date = realDate;
      
      expect(filtered).toHaveLength(2);
      expect(filtered.map(job => job.id)).toEqual(['1', '2']);
    });

    it('filtra vagas por palavras-chave', () => {
      const filtered = filterJobs(testJobs, { 
        keywords: ['React', 'TypeScript']
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('exclui vagas com palavras-chave indesejadas', () => {
      const filtered = filterJobs(testJobs, { 
        excludeKeywords: ['Angular', 'Node.js']
      });
      expect(filtered).toHaveLength(2);
      expect(filtered.map(job => job.id)).toEqual(['1', '3']);
    });
  });

  describe('rankJobsByRelevance', () => {
    it('classifica vagas por relevância com base nos termos de busca', () => {
      const searchTerms = ['Frontend', 'React'];
      const ranked = rankJobsByRelevance(testJobs, searchTerms);
      
      // A vaga 1 deve ser a mais relevante (tem React e Frontend no título)
      expect(ranked[0].id).toBe('1');
    });

    it('considera a data de publicação na classificação', () => {
      // Configurar data atual para um valor fixo para o teste
      const realDate = Date;
      global.Date.now = jest.fn(() => new Date('2025-01-20').getTime());
      
      const searchTerms = ['Frontend'];
      const ranked = rankJobsByRelevance(testJobs, searchTerms);
      
      // Restaurar Date original
      global.Date = realDate;
      
      // Vagas mais recentes devem ter prioridade quando a relevância é similar
      expect(ranked.map(job => job.id)).toEqual(['1', '3', '4']);
    });

    it('retorna as vagas na ordem original quando não há termos de busca', () => {
      const ranked = rankJobsByRelevance(testJobs, []);
      expect(ranked.map(job => job.id)).toEqual(['1', '2', '3', '4']);
    });
  });
});