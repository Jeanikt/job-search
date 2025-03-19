import { Job } from "./types";

export function generateMockJobs(
  location: string,
  country: string,
  jobType: string,
  limit: number = 20
): Job[] {
  console.log(
    `Gerando ${limit} vagas mockadas para ${jobType} em ${location}, ${country}`
  );

  const mockJobs: Job[] = [];
  const companies = [
    "TechCorp",
    "InnovaSoft",
    "DevMasters",
    "CodeGenius",
    "DataTech",
    "GlobalTech",
    "FutureSystems",
    "NexusInnovation",
    "QuantumCode",
    "ByteWorks",
  ];

  const jobTitles = [
    `Desenvolvedor ${jobType}`,
    `Engenheiro de Software ${jobType}`,
    `${jobType} Sênior`,
    `${jobType} Pleno`,
    `${jobType} Júnior`,
    `Especialista em ${jobType}`,
    `Arquiteto de ${jobType}`,
    `Analista de ${jobType}`,
    `Consultor de ${jobType}`,
    `Líder Técnico de ${jobType}`,
  ];

  const descriptions = [
    `Estamos buscando um profissional de ${jobType} para se juntar à nossa equipe de desenvolvimento. O candidato ideal deve ter experiência com desenvolvimento de software, trabalho em equipe e resolução de problemas complexos.`,
    `Oportunidade para atuar como ${jobType} em projetos desafiadores. Buscamos profissionais com paixão por tecnologia e vontade de aprender e crescer.`,
    `Vaga para ${jobType} com foco em desenvolvimento de soluções inovadoras. Você trabalhará em um ambiente colaborativo com as mais recentes tecnologias do mercado.`,
    `Procuramos um talentoso ${jobType} para fortalecer nossa equipe de tecnologia. Oferecemos um ambiente de trabalho dinâmico e oportunidades de crescimento profissional.`,
    `Seja parte da nossa equipe de ${jobType} e ajude a construir o futuro da tecnologia. Valorizamos criatividade, colaboração e excelência técnica.`,
  ];

  for (let i = 0; i < limit; i++) {
    const randomDays = Math.floor(Math.random() * 30); // Vagas de até 30 dias atrás
    const postedDate = new Date();
    postedDate.setDate(postedDate.getDate() - randomDays);

    const companyIndex = Math.floor(Math.random() * companies.length);
    const titleIndex = Math.floor(Math.random() * jobTitles.length);
    const descriptionIndex = Math.floor(Math.random() * descriptions.length);

    mockJobs.push({
      id: `mock-job-${i}-${Date.now()}`,
      title: jobTitles[titleIndex],
      company: companies[companyIndex],
      location: location || "São Paulo",
      country: country || "Brasil",
      description: descriptions[descriptionIndex],
      url: `https://example.com/jobs/${i}`,
      postedAt: postedDate.toISOString(),
      source: "mock",
    });
  }

  return mockJobs;
}

export function generateTechStack(jobType: string): string[] {
  const commonTech = ["Git", "GitHub", "Jira", "Agile", "Scrum"];

  const techStacks: Record<string, string[]> = {
    react: [
      "React",
      "JavaScript",
      "TypeScript",
      "Redux",
      "HTML",
      "CSS",
      "Next.js",
      "Styled Components",
    ],
    angular: [
      "Angular",
      "TypeScript",
      "RxJS",
      "NgRx",
      "HTML",
      "CSS",
      "Material Design",
    ],
    vue: ["Vue.js", "JavaScript", "Vuex", "Nuxt.js", "HTML", "CSS"],
    node: [
      "Node.js",
      "Express",
      "JavaScript",
      "TypeScript",
      "MongoDB",
      "REST API",
      "GraphQL",
    ],
    java: ["Java", "Spring Boot", "Hibernate", "Maven", "JUnit", "SQL"],
    python: ["Python", "Django", "Flask", "FastAPI", "Pandas", "NumPy", "SQL"],
    fullstack: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "MongoDB",
      "SQL",
      "HTML",
      "CSS",
    ],
    frontend: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Vue",
      "Angular",
      "Responsive Design",
    ],
    backend: [
      "Node.js",
      "Java",
      "Python",
      "C#",
      "SQL",
      "NoSQL",
      "REST API",
      "GraphQL",
    ],
    mobile: ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android"],
    devops: [
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "CI/CD",
      "Jenkins",
      "Terraform",
    ],
    data: [
      "SQL",
      "Python",
      "Pandas",
      "NumPy",
      "Power BI",
      "Tableau",
      "Big Data",
    ],
  };

  // Normalizar o tipo de vaga para encontrar a pilha de tecnologia correspondente
  const normalizedJobType = jobType.toLowerCase();
  let techStack: string[] = [];

  // Procurar correspondências parciais
  for (const [key, stack] of Object.entries(techStacks)) {
    if (normalizedJobType.includes(key)) {
      techStack = [...stack];
      break;
    }
  }

  // Se não encontrou correspondência, usar uma pilha genérica
  if (techStack.length === 0) {
    techStack = ["JavaScript", "HTML", "CSS", "SQL", "Git"];
  }

  // Adicionar tecnologias comuns
  techStack = [...techStack, ...commonTech];

  // Remover duplicatas e limitar a 8 tecnologias
  return [...new Set(techStack)].slice(0, 8);
}
