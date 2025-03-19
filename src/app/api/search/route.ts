import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enhancedSearchJobs } from "@/lib/jobSearch/enhancedJobSearch";
import {
  isUserPremium,
  hasUserSearchedToday,
  registerSearch,
  incrementSearchCount,
} from "@/lib/supabase";

const searchRequestSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  location: z.string().min(2, { message: "Localização muito curta" }),
  country: z.string().min(2, { message: "País muito curto" }),
  jobType: z.string().min(2, { message: "Tipo de vaga muito curto" }),
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(10),
  filters: z
    .object({
      maxDaysOld: z.number().optional(),
      minSalary: z.number().optional(),
      maxSalary: z.number().optional(),
      seniorityLevel: z.array(z.string()).optional(),
      remoteOnly: z.boolean().optional(),
      excludeKeywords: z.array(z.string()).optional(),
    })
    .optional(),
  useCache: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    const body = await request.json();
    console.log("Recebida requisição POST para /api/search:", body);

    const result = searchRequestSchema.safeParse(body);
    if (!result.success) {
      console.error("Dados inválidos:", result.error.errors);
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          errors: result.error.errors,
        },
        { status: 400 }
      );
    }

    const {
      email,
      location,
      country,
      jobType,
      page = 1,
      pageSize = 10,
      filters = {},
      useCache = true,
    } = result.data;

    // Verificar se o usuário é premium
    console.log(`Verificando status premium para ${email}`);
    const isPremium = await isUserPremium(email);
    console.log(`Usuário ${email} é premium: ${isPremium}`);

    // Se não for premium, verificar se já fez busca hoje
    if (!isPremium) {
      console.log(`Verificando se ${email} já fez busca hoje`);
      const hasSearched = await hasUserSearchedToday(email);
      console.log(`Usuário ${email} já fez busca hoje: ${hasSearched}`);

      if (hasSearched) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Você já realizou uma busca hoje. Assine o plano Premium para buscas ilimitadas.",
            isPremium: false,
            limitReached: true,
          },
          { status: 403 }
        );
      }
    }

    // Registrar busca e incrementar contador
    console.log(`Registrando busca para ${email}`);
    await registerSearch(email, location, country, jobType);
    await incrementSearchCount(email);

    // Realizar busca de vagas
    console.log(`Iniciando busca de vagas para ${email}`);
    const searchResult = await enhancedSearchJobs({
      email,
      location,
      country,
      jobType,
      isPremium,
      page,
      pageSize,
      useCache,
    });

    const executionTimeTotal = Math.round(performance.now() - startTime);
    console.log(`Busca concluída em ${executionTimeTotal}ms`);

    return NextResponse.json({
      ...searchResult,
      isPremium,
      executionTimeTotal,
    });
  } catch (error) {
    console.error("Erro na API de busca:", error);

    const executionTimeTotal = Math.round(performance.now() - startTime);

    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
        executionTimeTotal,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") || "";
    const country = searchParams.get("country") || "";
    const jobType = searchParams.get("jobType") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    console.log("Recebida requisição GET para /api/search:", {
      location,
      country,
      jobType,
      page,
      pageSize,
    });

    if (!location || !country || !jobType) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Parâmetros insuficientes. É necessário fornecer location, country e jobType.",
        },
        { status: 400 }
      );
    }

    const searchResult = await enhancedSearchJobs({
      email: "",
      location,
      country,
      jobType,
      isPremium: false,
      page,
      pageSize,
      useCache: true,
    });

    return NextResponse.json({
      ...searchResult,
      isPremium: false,
      preview: true,
    });
  } catch (error) {
    console.error("Erro na API de prévia de busca:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
