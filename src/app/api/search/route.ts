import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchJobs } from "@/lib/jobSearchManager";
import {
  isUserPremium,
  hasUserSearchedToday,
  registerSearch,
} from "@/lib/supabase";

// Schema for search request validation
const searchRequestSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  location: z.string().min(2, { message: "Localização muito curta" }),
  country: z.string().min(2, { message: "País muito curto" }),
  jobType: z.string().min(2, { message: "Tipo de vaga muito curto" }),
});

export async function POST(request: NextRequest) {
  try {
    // Get and validate request data
    const body = await request.json();

    const result = searchRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          errors: result.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, location, country, jobType } = result.data;

    // Check if user is premium
    const isPremium = await isUserPremium(email);

    // If not premium, check if already searched today
    if (!isPremium) {
      const hasSearched = await hasUserSearchedToday(email);

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

    // Register search
    await registerSearch(email, location, country, jobType);

    // Search for jobs
    const searchResult = await searchJobs({
      email,
      location,
      country,
      jobType,
      isPremium,
    });

    return NextResponse.json({
      ...searchResult,
      isPremium,
    });
  } catch (error) {
    console.error("Erro na API de busca:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
