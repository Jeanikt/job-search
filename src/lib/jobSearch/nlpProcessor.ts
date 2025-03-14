import { Job } from "../types";

const CATEGORY_KEYWORDS = {
  programming: [
    "programação",
    "programming",
    "developer",
    "desenvolvedor",
    "software",
    "code",
    "código",
    "coder",
    "programador",
    "development",
    "desenvolvimento",
  ],
  frontend: [
    "frontend",
    "front-end",
    "front end",
    "html",
    "css",
    "javascript",
    "react",
    "angular",
    "vue",
    "ui",
    "interface",
    "web",
  ],
  backend: [
    "backend",
    "back-end",
    "back end",
    "servidor",
    "server",
    "api",
    "banco de dados",
    "database",
    "java",
    "python",
    "php",
    "node",
    "c#",
    ".net",
  ],
  fullstack: [
    "fullstack",
    "full-stack",
    "full stack",
    "front e back",
    "front and back",
  ],
  mobile: [
    "mobile",
    "android",
    "ios",
    "swift",
    "kotlin",
    "react native",
    "flutter",
  ],
  devops: [
    "devops",
    "cloud",
    "aws",
    "azure",
    "gcp",
    "infraestrutura",
    "infrastructure",
    "sre",
    "kubernetes",
    "docker",
    "ci/cd",
    "pipeline",
  ],
  data: [
    "dados",
    "data",
    "analytics",
    "análise",
    "analysis",
    "scientist",
    "science",
    "bi",
    "business intelligence",
    "big data",
    "machine learning",
    "ml",
    "inteligência artificial",
    "artificial intelligence",
    "ai",
  ],
  design: [
    "design",
    "ux",
    "ui",
    "user experience",
    "user interface",
    "produto",
    "product",
  ],
  security: [
    "security",
    "segurança",
    "cybersecurity",
    "cibersegurança",
    "hacker",
    "pentest",
    "penetration testing",
    "teste de invasão",
    "vulnerabilidade",
    "vulnerability",
  ],
  qa: [
    "qa",
    "quality assurance",
    "garantia de qualidade",
    "teste",
    "testing",
    "testador",
    "tester",
    "automação",
    "automation",
  ],
};

const TECH_STACK_KEYWORDS = [
  "javascript",
  "python",
  "java",
  "c#",
  "c++",
  "ruby",
  "php",
  "go",
  "golang",
  "swift",
  "kotlin",
  "typescript",
  "scala",
  "rust",
  "objective-c",
  "r",
  "perl",
  "haskell",

  "react",
  "angular",
  "vue",
  "ember",
  "svelte",
  "jquery",
  "backbone",
  "next.js",
  "nuxt",
  "spring",
  "django",
  "flask",
  "laravel",
  "symfony",
  "rails",
  "express",
  "nest.js",
  "asp.net",
  ".net core",
  "blazor",
  "flutter",
  "react native",
  "xamarin",

  "sql",
  "mysql",
  "postgresql",
  "oracle",
  "sql server",
  "mongodb",
  "cassandra",
  "redis",
  "elasticsearch",
  "dynamodb",
  "firebase",
  "neo4j",
  "couchdb",
  "supabase",

  "aws",
  "azure",
  "gcp",
  "google cloud",
  "docker",
  "kubernetes",
  "terraform",
  "jenkins",
  "circleci",
  "travis",
  "github actions",
  "gitlab ci",
  "ansible",
  "chef",
  "puppet",
  "prometheus",
  "grafana",
  "elasticsearch",
  "logstash",
  "kibana",
  "elk",

  "html",
  "css",
  "sass",
  "less",
  "tailwind",
  "bootstrap",
  "material-ui",
  "styled-components",
  "webpack",
  "babel",
  "eslint",
  "prettier",
  "storybook",
  "jest",
  "cypress",
  "redux",

  "ios",
  "android",
  "swift",
  "objective-c",
  "kotlin",
  "react native",
  "flutter",
  "ionic",
  "xamarin",
  "cordova",
  "capacitor",

  "tableau",
  "power bi",
  "looker",
  "qlik",
  "pandas",
  "numpy",
  "scikit-learn",
  "tensorflow",
  "pytorch",
  "keras",
  "hadoop",
  "spark",
  "kafka",
  "airflow",
  "jupyter",
  "matplotlib",
  "seaborn",
  "dbt",
  "snowflake",
];

const SENIORITY_LEVELS = {
  junior: [
    "junior",
    "júnior",
    "jr",
    "trainee",
    "estágio",
    "estagiário",
    "internship",
    "intern",
    "aprendiz",
    "iniciante",
    "entry level",
    "entry-level",
  ],
  mid: ["pleno", "mid", "mid-level", "intermediário", "intermediate"],
  senior: [
    "senior",
    "sênior",
    "sr",
    "specialist",
    "especialista",
    "advanced",
    "avançado",
    "experienced",
    "experiente",
  ],
  lead: [
    "lead",
    "líder",
    "tech lead",
    "team lead",
    "líder técnico",
    "coordenador",
    "coordinator",
    "gerente",
    "manager",
    "gestor",
  ],
};

export async function processJobsWithNLP(
  jobs: Job[],
  queryJobType: string
): Promise<Job[]> {
  return jobs.map((job) => {
    const fullText =
      `${job.title} ${job.company} ${job.description}`.toLowerCase();

    const categories = detectCategories(fullText);

    const techStack = detectTechStack(fullText);

    const seniorityLevel = detectSeniority(fullText, job.title);

    const relevanceScore = calculateInitialRelevanceScore(
      fullText,
      queryJobType
    );

    return {
      ...job,
      metadata: {
        categories,
        techStack,
        seniorityLevel,
        relevanceScore,
      },
    };
  });
}

function detectCategories(text: string): string[] {
  const categories = [];
  const normalizedText = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => normalizedText.includes(keyword))) {
      categories.push(category);
    }
  }

  return categories;
}

function detectTechStack(text: string): string[] {
  const techStack = [];
  const normalizedText = text.toLowerCase();

  for (const tech of TECH_STACK_KEYWORDS) {
    const regex = new RegExp(`\\b${tech}\\b`, "i");
    if (regex.test(normalizedText)) {
      techStack.push(tech);
    }
  }

  return techStack;
}

function detectSeniority(text: string, title: string): string {
  const normalizedText = `${title} ${text}`.toLowerCase();

  for (const [level, keywords] of Object.entries(SENIORITY_LEVELS)) {
    if (keywords.some((keyword) => normalizedText.includes(keyword))) {
      return level;
    }
  }

  return "not_specified";
}

function calculateInitialRelevanceScore(
  text: string,
  queryJobType: string
): number {
  let score = 0;
  const normalizedText = text.toLowerCase();
  const searchTerms = queryJobType.toLowerCase().split(/\s+/);

  for (const term of searchTerms) {
    if (term.length < 3) continue;

    if (normalizedText.includes(term)) {
      score += 10;

      const regex = new RegExp(`\\b${term}\\b`, "i");
      if (regex.test(normalizedText)) {
        score += 5;
      }
    }
  }

  return score;
}
