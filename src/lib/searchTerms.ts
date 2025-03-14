export function extractSearchTerms(jobType: string): string[] {
  const terms = jobType
    .toLowerCase()
    .replace(/[^\w\sáàâãéèêíïóôõöúçñ]/gi, " ")
    .split(/\s+/);

  const filteredTerms = terms.filter(
    (term) => term.length > 2 && !commonWords.includes(term)
  );

  const expandedTerms = new Set<string>(filteredTerms);

  filteredTerms.forEach((term) => {
    if (synonyms[term]) {
      synonyms[term].forEach((synonym) => expandedTerms.add(synonym));
    }
  });

  return Array.from(expandedTerms);
}

export async function generateSearchExpansions(
  searchTerms: string[]
): Promise<string[]> {
  const allTerms = new Set<string>(searchTerms);

  for (const term of searchTerms) {
    addSpellingVariations(term, allTerms);

    addSynonyms(term, allTerms);

    addRelatedTerms(term, allTerms);
  }

  const combinations = createTermCombinations(searchTerms);
  combinations.forEach((combo) => allTerms.add(combo));

  return Array.from(allTerms);
}

function addSpellingVariations(term: string, termSet: Set<string>): void {
  const accentVariations: Record<string, string[]> = {
    a: ["a", "á", "à", "â", "ã"],
    e: ["e", "é", "è", "ê"],
    i: ["i", "í", "ì", "î"],
    o: ["o", "ó", "ò", "ô", "õ"],
    u: ["u", "ú", "ù", "û"],
    c: ["c", "ç"],
  };

  if (term.includes("-")) {
    termSet.add(term.replace(/-/g, " "));
    termSet.add(term.replace(/-/g, ""));
  }

  if (term.endsWith("s")) {
    termSet.add(term.slice(0, -1));
  } else {
    termSet.add(`${term}s`);
  }

  if (techTerms.includes(term)) {
    termSet.add(`${term} developer`);
    termSet.add(`${term} desenvolvedor`);
  }
}

function addSynonyms(term: string, termSet: Set<string>): void {
  if (synonyms[term]) {
    synonyms[term].forEach((synonym) => termSet.add(synonym));
  }

  if (technicalTermTranslations[term]) {
    technicalTermTranslations[term].forEach((translation) =>
      termSet.add(translation)
    );
  }
}

function addRelatedTerms(term: string, termSet: Set<string>): void {
  if (relatedTerms[term]) {
    relatedTerms[term].forEach((related) => termSet.add(related));
  }

  if (languageFrameworks[term]) {
    languageFrameworks[term].forEach((framework) => termSet.add(framework));
  }
}

function createTermCombinations(terms: string[]): string[] {
  const combinations: string[] = [];

  const limitedTerms = terms.slice(0, 3);

  for (let i = 0; i < limitedTerms.length; i++) {
    for (let j = i + 1; j < limitedTerms.length; j++) {
      combinations.push(`${limitedTerms[i]} ${limitedTerms[j]}`);
    }
  }

  return combinations;
}

const commonWords = [
  "de",
  "da",
  "do",
  "das",
  "dos",
  "em",
  "para",
  "com",
  "por",
  "um",
  "uma",
  "uns",
  "umas",
  "o",
  "a",
  "os",
  "as",
  "e",
  "ou",
  "este",
  "esta",
  "esse",
  "essa",
  "aquele",
  "aquela",
  "como",
  "quando",
  "onde",
  "que",
  "qual",
  "quais",
  "quem",
  "cujo",
  "cuja",
  "se",
  "já",
  "mas",
  "porém",
  "contudo",
  "todavia",
  "entretanto",
  "então",
  "logo",
  "portanto",
  "assim",
  "the",
  "of",
  "and",
  "to",
  "in",
  "a",
  "for",
  "is",
  "on",
  "that",
  "by",
  "this",
  "with",
  "i",
  "you",
  "it",
  "not",
  "or",
  "be",
  "are",
  "from",
  "at",
  "as",
  "your",
  "all",
  "have",
  "new",
  "more",
  "an",
  "was",
  "we",
  "will",
  "can",
  "us",
  "about",
];

const techTerms = [
  "python",
  "java",
  "javascript",
  "typescript",
  "react",
  "angular",
  "vue",
  "node",
  "express",
  "django",
  "flask",
  "spring",
  "php",
  "laravel",
  "ruby",
  "rails",
  "c#",
  ".net",
  "kotlin",
  "swift",
  "go",
  "rust",
  "scala",
  "aws",
  "azure",
  "gcp",
  "devops",
  "docker",
  "kubernetes",
  "terraform",
  "jenkins",
  "git",
  "sql",
  "nosql",
  "mongodb",
  "postgresql",
  "mysql",
  "oracle",
  "data",
  "analytics",
  "machine learning",
  "ai",
  "mobile",
  "android",
  "ios",
  "flutter",
];

const languageFrameworks: Record<string, string[]> = {
  javascript: [
    "react",
    "vue",
    "angular",
    "next.js",
    "nuxt",
    "svelte",
    "express",
    "node",
  ],
  js: [
    "react",
    "vue",
    "angular",
    "next.js",
    "nuxt",
    "svelte",
    "express",
    "node",
  ],
  python: ["django", "flask", "fastapi", "pyramid", "tornado"],
  java: ["spring", "hibernate", "struts", "jsf", "gwt"],
  php: ["laravel", "symfony", "codeigniter", "cake", "yii", "wordpress"],
  ruby: ["rails", "sinatra", "hanami"],
  "c#": ["asp.net", ".net core", ".net", "xamarin", "entity framework"],
  frontend: ["react", "vue", "angular", "svelte", "html", "css"],
  backend: ["node", "spring", "django", "rails", "laravel", "express"],
  mobile: ["flutter", "react native", "swift", "kotlin", "xamarin"],
  data: ["hadoop", "spark", "pandas", "numpy", "scikit-learn", "tensorflow"],
};

const technicalTermTranslations: Record<string, string[]> = {
  desenvolvedor: ["developer", "programmer", "dev"],
  developer: ["desenvolvedor", "programador"],
  frontend: ["front-end", "front end", "desenvolvimento web"],
  backend: ["back-end", "back end", "servidor"],
  fullstack: ["full-stack", "full stack", "pilha completa"],
  mobile: ["móvel", "celular", "android", "ios"],
  data: ["dados", "análise de dados", "ciência de dados"],
  cloud: ["nuvem", "computação em nuvem"],
  security: ["segurança", "segurança da informação", "cibersegurança"],
};

const relatedTerms: Record<string, string[]> = {
  react: ["reactjs", "react.js", "hooks", "jsx", "frontend", "spa", "redux"],
  angular: ["angularjs", "angular.js", "typescript", "frontend", "spa"],
  node: ["nodejs", "node.js", "express", "backend", "javascript", "servidor"],
  python: [
    "django",
    "flask",
    "pandas",
    "numpy",
    "data science",
    "machine learning",
  ],
  devops: ["ci/cd", "docker", "kubernetes", "aws", "azure", "infraestrutura"],
  blockchain: ["ethereum", "bitcoin", "smart contracts", "web3", "dapps"],
  qa: ["testes", "automação", "testes automatizados", "qualidade"],
  "data science": [
    "machine learning",
    "big data",
    "análise de dados",
    "estatística",
    "python",
  ],
  "machine learning": [
    "ai",
    "deep learning",
    "nlp",
    "inteligência artificial",
    "python",
  ],
  ux: ["ui", "design", "user experience", "interface", "produto"],
  mobile: ["ios", "android", "react native", "flutter", "aplicativos"],
};

const synonyms: Record<string, string[]> = {
  desenvolvedor: [
    "programador",
    "developer",
    "dev",
    "engineer",
    "engenheiro",
    "coder",
  ],
  frontend: [
    "front-end",
    "front",
    "ui",
    "interface",
    "client-side",
    "client side",
  ],
  backend: [
    "back-end",
    "back",
    "server",
    "servidor",
    "api",
    "server-side",
    "server side",
  ],
  fullstack: [
    "full-stack",
    "full stack",
    "full",
    "stack",
    "end-to-end",
    "end to end",
  ],
  javascript: [
    "js",
    "typescript",
    "ts",
    "ecmascript",
    "node",
    "nodejs",
    "node.js",
  ],
  react: ["reactjs", "react.js", "react native", "next.js", "nextjs"],
  node: ["nodejs", "node.js", "npm", "express", "fastify", "nest.js", "nestjs"],
  python: ["py", "django", "flask", "fastapi", "pandas", "numpy"],
  java: ["spring", "j2ee", "spring boot", "kotlin", "jvm"],
  devops: ["sre", "infraestrutura", "infrastructure", "ci/cd", "ops", "cloud"],
  mobile: ["android", "ios", "react-native", "react native", "flutter", "app"],
  dados: [
    "data",
    "database",
    "banco de dados",
    "data science",
    "ciência de dados",
  ],
  analista: ["analyst", "analytics", "análise", "analysis"],
  remoto: [
    "remote",
    "home office",
    "trabalho remoto",
    "remote work",
    "a distância",
  ],
  junior: [
    "jr",
    "júnior",
    "iniciante",
    "trainee",
    "entry level",
    "entry-level",
  ],
  pleno: ["mid-level", "intermediário", "mid level", "médio"],
  senior: ["sr", "sênior", "especialista", "advanced", "avançado"],
  web: ["internet", "site", "website", "webapp", "aplicação web", "portal"],
  gerente: ["manager", "gestor", "líder", "leader", "head", "lead", "chefe"],
  design: ["designer", "ux", "ui", "interface", "experiência", "produto"],
  segurança: ["security", "cybersecurity", "cibersegurança", "infosec"],
  teste: [
    "qa",
    "quality",
    "quality assurance",
    "tester",
    "testador",
    "testing",
  ],
};
