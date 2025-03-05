import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getJobs } from "@/lib/supabase";

// Schema de validação para parâmetros de consulta
const queryParamsSchema = z.object({
  location: z.string().optional(),
  country: z.string().optional(),
  jobType: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros da URL
    const { searchParams } = new URL(request.url);
    const params = {
      location: searchParams.get("location") || undefined,
      country: searchParams.get("country") || undefined,
      jobType: searchParams.get("jobType") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
    };

    // Validar parâmetros
    const result = queryParamsSchema.safeParse({
      ...params,
      page: params.page,
      limit: params.limit,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Parâmetros inválidos",
          errors: result.error.errors,
        },
        { status: 400 }
      );
    }

    const { location, country, jobType, page, limit } = result.data;

    // Buscar vagas no banco de dados
    const { jobs, totalCount } = await getJobs({
      location,
      country,
      jobType,
      page,
      limit,
    });

    // Calcular informações de paginação
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Erro na API de vagas:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
