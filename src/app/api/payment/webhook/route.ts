import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/lib/payment";

export async function POST(request: NextRequest) {
  try {
    // In a real implementation, you would verify the webhook signature
    // to ensure it's coming from AbacatePay

    const body = await request.json();

    // Process the webhook based on event type
    if (body.event === "payment.succeeded") {
      const paymentId = body.data.id;
      const email = body.data.customer.email;
      const durationMonths = body.data.metadata?.durationMonths || 1;

      // Verify the payment
      const isValid = await paymentService.verifyPayment(paymentId);

      if (isValid) {
        // Update user to premium
        await paymentService.updateUserToPremium(email, durationMonths);

        return NextResponse.json({ success: true });
      }
    }

    // For other event types or if verification fails
    return NextResponse.json({
      success: false,
      message: "Evento não processado",
    });
  } catch (error) {
    console.error("Erro no webhook de pagamento:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
