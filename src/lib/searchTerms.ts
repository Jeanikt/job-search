// Função para extrair termos de busca relevantes do tipo de vaga
export function extractSearchTerms(jobType: string): string[] {
  // Remover caracteres especiais e dividir por espaços
  const terms = jobType.toLowerCase()
    .replace(/[^\w\sáàâãéèêíïóôõöúçñ]/gi, '')
    .split(/\s+/);
  
  // Filtrar termos muito curtos ou palavras comuns
  const filteredTerms = terms.filter(term => 
    term.length > 2 && !commonWords.includes(term)
  );
  
  // Adicionar sinônimos para termos técnicos
  const expandedTerms = [...filteredTerms];
  
  filteredTerms.forEach(term => {
    if (synonyms[term]) {
      expandedTerms.push(...synonyms[term]);
    }
  });
  
  return Array.from(new Set(expandedTerms));
}

// Lista de palavras comuns a serem ignoradas
const commonWords = [
  'de', 'da', 'do', 'das', 'dos', 'em', 'para', 'com', 'por',
  'um', 'uma', 'uns', 'umas', 'o', 'a', 'os', 'as', 'e', 'ou',
];

// Mapeamento de sinônimos para termos técnicos comuns
const synonyms: Record<string, string[]> = {
  'desenvolvedor': ['programador', 'developer', 'dev', 'engineer', 'engenheiro'],
  'frontend': ['front-end', 'front', 'ui', 'interface'],
  'backend': ['back-end', 'back', 'server', 'servidor'],
  'fullstack': ['full-stack', 'full', 'stack'],
  'javascript': ['js', 'typescript', 'ts', 'ecmascript'],
  'react': ['reactjs', 'react.js'],
  'node': ['nodejs', 'node.js'],
  'python': ['py', 'django', 'flask'],
  'java': ['spring', 'j2ee'],
  'devops': ['sre', 'infraestrutura', 'infrastructure'],
  'mobile': ['android', 'ios', 'react-native', 'flutter'],
  'dados': ['data', 'database', 'banco de dados'],
  'analista': ['analyst', 'analytics'],
  'remoto': ['remote', 'home office', 'trabalho remoto'],
  'junior': ['jr', 'júnior', 'iniciante', 'trainee'],
  'pleno': ['mid-level', 'intermediário'],
  'senior': ['sr', 'sênior', 'especialista'],
};