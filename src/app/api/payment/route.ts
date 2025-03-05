import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { paymentService } from "@/lib/payment";

// Schema for payment request validation
const paymentRequestSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  planName: z.string().default("Premium Mensal"),
  durationMonths: z.number().int().positive().default(1),
});

export async function POST(request: NextRequest) {
  try {
    // Get and validate request data
    const body = await request.json();

    const result = paymentRequestSchema.safeParse(body);
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

    const { email, planName, durationMonths } = result.data;

    // Calculate amount based on plan duration
    const amount = 15 * durationMonths; // R$15 per month

    // Get the origin for the return URL
    const origin = request.headers.get("origin") || "http://localhost:3000";
    const returnUrl = `${origin}/payment/success`;

    // Create payment
    const paymentResponse = await paymentService.createPayment({
      email,
      amount,
      planName,
      durationMonths,
      returnUrl,
    });

    if (!paymentResponse.success) {
      return NextResponse.json(
        {
          success: false,
          message: paymentResponse.message || "Falha ao criar pagamento",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResponse.paymentUrl,
      paymentId: paymentResponse.paymentId,
    });
  } catch (error) {
    console.error("Erro na API de pagamento:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
